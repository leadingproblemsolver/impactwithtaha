const crypto = require('node:crypto');

const MODEL_TIMEOUT_MS = 35000;
const SUPABASE_TIMEOUT_MS = 12000;
const MAX_SOURCE_CHARS = 120000;
const ALLOWED_KINDS = new Set(['evidence', 'decision', 'commitment', 'unresolved', 'state_change']);

function cleanString(value, max, field, { required = false } = {}) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (required && !text) throw new Error(`${field} is required.`);
  if (text.length > max) throw new Error(`${field} exceeds ${max} characters.`);
  return text;
}

function normalizeInteraction(input = {}) {
  const permission = input.permission || {};
  if (permission.permitted !== true) {
    const error = new Error('A permitted interaction is required before ingestion.');
    error.code = 'NOT_PERMITTED';
    throw error;
  }

  const occurredAt = cleanString(input.occurred_at, 64, 'occurred_at', { required: true });
  const parsedDate = new Date(occurredAt);
  if (Number.isNaN(parsedDate.getTime())) throw new Error('occurred_at must be an ISO-8601 timestamp.');

  const sourceText = cleanString(input.source_text, MAX_SOURCE_CHARS, 'source_text', { required: true });
  if (sourceText.length < 20) throw new Error('source_text is too short to represent a meaningful interaction.');

  const normalized = {
    interaction_id: cleanString(input.interaction_id, 120, 'interaction_id', { required: true }),
    case_id: cleanString(input.case_id, 120, 'case_id', { required: true }),
    advisor_id: cleanString(input.advisor_id, 120, 'advisor_id', { required: true }),
    occurred_at: parsedDate.toISOString(),
    source_type: cleanString(input.source_type || 'advisory_notes', 80, 'source_type'),
    source_text: sourceText,
    source_ref: cleanString(input.source_ref || '', 500, 'source_ref'),
    n8n_execution_id: cleanString(input.n8n_execution_id, 160, 'n8n_execution_id', { required: true }),
    permission_basis: cleanString(permission.basis || 'operator-confirmed', 240, 'permission.basis'),
    source_sha256: crypto.createHash('sha256').update(sourceText, 'utf8').digest('hex')
  };

  if (input.source_sha256 && String(input.source_sha256).toLowerCase() !== normalized.source_sha256) {
    throw new Error('source_sha256 does not match source_text.');
  }
  return normalized;
}

function outputText(response) {
  if (typeof response?.output_text === 'string' && response.output_text) return response.output_text;
  const parts = [];
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && content?.text) parts.push(content.text);
    }
  }
  return parts.join('\n');
}

function parseJsonText(text = '') {
  const cleaned = String(text).trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  return null;
}

const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      maxItems: 40,
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['evidence', 'decision', 'commitment', 'unresolved', 'state_change'] },
          statement: { type: 'string' },
          source_quote: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          owner: { type: ['string', 'null'] },
          due_at: { type: ['string', 'null'] }
        },
        required: ['kind', 'statement', 'source_quote', 'confidence', 'owner', 'due_at'],
        additionalProperties: false
      }
    }
  },
  required: ['items'],
  additionalProperties: false
};

function extractionPrompt() {
  return `You extract operator-reviewable advisory state from one permitted interaction.

Rules:
- Extract only material evidence, decisions, commitments, unresolved items, and explicit state changes.
- Every item MUST include source_quote copied verbatim from SOURCE_TEXT. Do not paraphrase source_quote.
- statement may normalize wording but must not add facts absent from source_quote.
- commitment means a concrete agreed action. Include owner/due_at only when explicitly supported; otherwise null.
- due_at must be ISO-8601 only when the source explicitly contains enough information to resolve it; otherwise null.
- confidence reflects extraction certainty, not business importance.
- Do not infer outcomes, completion, causality, revenue, or intent that the source does not state.
- Do not expose hidden reasoning. Return only schema-valid JSON.`;
}

async function fetchJson(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message = body?.message || body?.error?.message || body?.error || `${response.status}`;
      const error = new Error(`Upstream request failed: ${message}`);
      error.status = response.status;
      throw error;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function extractInteraction(interaction, { fetchImpl = fetch, env = process.env } = {}) {
  const key = env.OPENAI_API_KEY;
  if (!key) {
    const error = new Error('OPENAI_API_KEY is required for QDB extraction.');
    error.code = 'MODEL_NOT_CONFIGURED';
    throw error;
  }
  const model = env.QDB_OPENAI_MODEL || env.OPENAI_MODEL || 'gpt-5.6-sol';
  const response = await fetchJson(fetchImpl, 'https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      store: false,
      reasoning: { effort: env.QDB_OPENAI_REASONING_EFFORT || 'medium' },
      text: {
        verbosity: 'low',
        format: { type: 'json_schema', name: 'qdb_advisory_extraction', strict: true, schema: EXTRACTION_SCHEMA }
      },
      input: [
        { role: 'developer', content: [{ type: 'input_text', text: extractionPrompt() }] },
        { role: 'user', content: [{ type: 'input_text', text: `SOURCE_TEXT:\n${interaction.source_text}` }] }
      ],
      max_output_tokens: Number(env.QDB_OPENAI_MAX_OUTPUT_TOKENS || 3000),
      prompt_cache_key: 'impactwithtaha-qdb-v0-extraction'
    })
  }, Number(env.QDB_MODEL_TIMEOUT_MS || MODEL_TIMEOUT_MS));

  const parsed = parseJsonText(outputText(response));
  if (!parsed || !Array.isArray(parsed.items)) throw new Error('Model returned invalid extraction JSON.');
  return validateExtraction(parsed.items, interaction.source_text);
}

function validateExtraction(items, sourceText) {
  if (!Array.isArray(items) || items.length > 40) throw new Error('Extraction item count is invalid.');
  return items.map((raw, index) => {
    const kind = String(raw?.kind || '');
    if (!ALLOWED_KINDS.has(kind)) throw new Error(`Extraction item ${index + 1} has invalid kind.`);
    const statement = cleanString(raw.statement, 2000, `items[${index}].statement`, { required: true });
    const sourceQuote = cleanString(raw.source_quote, 4000, `items[${index}].source_quote`, { required: true });
    const sourceStart = sourceText.indexOf(sourceQuote);
    if (sourceStart < 0) {
      const error = new Error(`Extraction item ${index + 1} source_quote is not present verbatim in source_text.`);
      error.code = 'PROVENANCE_MISMATCH';
      throw error;
    }
    const confidence = Number(raw.confidence);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new Error(`Extraction item ${index + 1} confidence must be between 0 and 1.`);
    }
    let dueAt = raw.due_at == null || raw.due_at === '' ? null : String(raw.due_at);
    if (dueAt && Number.isNaN(new Date(dueAt).getTime())) throw new Error(`Extraction item ${index + 1} due_at is invalid.`);
    if (dueAt) dueAt = new Date(dueAt).toISOString();
    return {
      ordinal: index + 1,
      kind,
      statement,
      source_quote: sourceQuote,
      source_start: sourceStart,
      source_end: sourceStart + sourceQuote.length,
      confidence,
      owner: raw.owner == null ? null : cleanString(String(raw.owner), 240, `items[${index}].owner`),
      due_at: dueAt
    };
  });
}

function buildState(items) {
  const state = { evidence: [], decisions: [], commitments: [], unresolved: [], state_changes: [] };
  for (const item of items) {
    const base = {
      statement: item.statement,
      source_quote: item.source_quote,
      source_start: item.source_start,
      source_end: item.source_end,
      confidence: item.confidence
    };
    if (item.kind === 'commitment') state.commitments.push({ ...base, owner: item.owner, due_at: item.due_at, status: 'open' });
    else if (item.kind === 'evidence') state.evidence.push(base);
    else if (item.kind === 'decision') state.decisions.push(base);
    else if (item.kind === 'unresolved') state.unresolved.push(base);
    else if (item.kind === 'state_change') state.state_changes.push(base);
  }
  return state;
}

class SupabaseQdbStore {
  constructor({ fetchImpl = fetch, env = process.env } = {}) {
    this.fetchImpl = fetchImpl;
    this.url = String(env.SUPABASE_URL || '').replace(/\/$/, '');
    this.key = env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.timeoutMs = Number(env.QDB_SUPABASE_TIMEOUT_MS || SUPABASE_TIMEOUT_MS);
    if (!this.url || !this.key) {
      const error = new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
      error.code = 'SUPABASE_NOT_CONFIGURED';
      throw error;
    }
  }

  headers(prefer = '') {
    const headers = {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json'
    };
    if (prefer) headers.Prefer = prefer;
    return headers;
  }

  async persistInteraction(interaction) {
    const rows = await fetchJson(this.fetchImpl,
      `${this.url}/rest/v1/qdb_interactions?on_conflict=interaction_id`,
      {
        method: 'POST',
        headers: this.headers('resolution=ignore-duplicates,return=representation'),
        body: JSON.stringify([{
          interaction_id: interaction.interaction_id,
          case_id: interaction.case_id,
          advisor_id: interaction.advisor_id,
          occurred_at: interaction.occurred_at,
          source_type: interaction.source_type,
          source_text: interaction.source_text,
          source_ref: interaction.source_ref || null,
          source_sha256: interaction.source_sha256,
          n8n_execution_id: interaction.n8n_execution_id,
          permission_basis: interaction.permission_basis,
          processing_status: 'persisted',
          last_error: null
        }])
      },
      this.timeoutMs
    );
    const inserted = Array.isArray(rows) ? rows[0] : rows;
    if (inserted) return inserted;

    const existing = await fetchJson(this.fetchImpl,
      `${this.url}/rest/v1/qdb_interactions?interaction_id=eq.${encodeURIComponent(interaction.interaction_id)}&select=interaction_id,source_sha256,case_id,n8n_execution_id`,
      { method: 'GET', headers: this.headers() },
      this.timeoutMs
    );
    const row = Array.isArray(existing) ? existing[0] : existing;
    if (!row) throw new Error('Interaction conflict occurred but the existing row could not be read.');
    if (row.source_sha256 !== interaction.source_sha256 || row.case_id !== interaction.case_id) {
      const error = new Error('interaction_id already exists with different source identity.');
      error.code = 'IDENTITY_COLLISION';
      throw error;
    }
    return row;
  }

  async applyExtraction(interaction, items, state) {
    return fetchJson(this.fetchImpl, `${this.url}/rest/v1/rpc/qdb_apply_extraction`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        p_interaction_id: interaction.interaction_id,
        p_case_id: interaction.case_id,
        p_source_sha256: interaction.source_sha256,
        p_n8n_execution_id: interaction.n8n_execution_id,
        p_items: items,
        p_state: state
      })
    }, this.timeoutMs);
  }

  async markFailed(interactionId, message) {
    try {
      await fetchJson(this.fetchImpl,
        `${this.url}/rest/v1/qdb_interactions?interaction_id=eq.${encodeURIComponent(interactionId)}`,
        {
          method: 'PATCH',
          headers: this.headers('return=minimal'),
          body: JSON.stringify({ processing_status: 'failed', last_error: String(message || 'processing failed').slice(0, 1000) })
        },
        this.timeoutMs
      );
    } catch {}
  }
}

function operatorReview(interaction, items, state, applyReceipt) {
  return {
    status: 'ready_for_operator_review',
    interaction: {
      interaction_id: interaction.interaction_id,
      case_id: interaction.case_id,
      advisor_id: interaction.advisor_id,
      occurred_at: interaction.occurred_at,
      source_type: interaction.source_type
    },
    provenance: {
      source_sha256: interaction.source_sha256,
      source_ref: interaction.source_ref || null,
      n8n_execution_id: interaction.n8n_execution_id
    },
    extraction: { count: items.length, items },
    state,
    persistence: applyReceipt || null,
    claim_boundary: 'This output proves a persisted, provenance-linked processing path only when backed by the corresponding Supabase rows and n8n execution. It does not prove operator use, correction, follow-up, reconciliation, or outcome.'
  };
}

module.exports = {
  normalizeInteraction,
  extractInteraction,
  validateExtraction,
  buildState,
  SupabaseQdbStore,
  operatorReview
};
