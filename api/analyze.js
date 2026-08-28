const dns = require('node:dns').promises;
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const registry = require('../ARTIFACT_REGISTRY.json');

const FETCH_TIMEOUT_MS = clampInt(process.env.ANALYZE_FETCH_TIMEOUT_MS, 9000, 1000, 30000);
const MODEL_TIMEOUT_MS = clampInt(process.env.ANALYZE_MODEL_TIMEOUT_MS, 30000, 3000, 55000);
const MAX_SOURCE_BYTES = clampInt(process.env.ANALYZE_MAX_SOURCE_BYTES, 1000000, 50000, 3000000);
const MAX_SOURCE_CHARS = clampInt(process.env.ANALYZE_MAX_SOURCE_CHARS, 50000, 5000, 120000);
const MAX_ARTIFACT_CHARS = clampInt(process.env.ANALYZE_MAX_ARTIFACT_CHARS, 45000, 5000, 120000);
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-sol';
const MODEL_REASONING = ['none','low','medium','high','xhigh','max'].includes(process.env.OPENAI_REASONING_EFFORT)
  ? process.env.OPENAI_REASONING_EFFORT
  : 'medium';
const MODEL_MAX_OUTPUT = clampInt(process.env.OPENAI_MAX_OUTPUT_TOKENS, 2200, 600, 8000);

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(value || '', 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function stripHtml(input = '') {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPrivateIp(raw = '') {
  let ip = String(raw).toLowerCase();
  if (!ip) return true;
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);

  if (net.isIP(ip) === 4) {
    const octets = ip.split('.').map(Number);
    const [a, b] = octets;
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  if (net.isIP(ip) === 6) {
    return (
      ip === '::' || ip === '::1' ||
      ip.startsWith('fc') || ip.startsWith('fd') ||
      /^fe[89ab]/.test(ip) ||
      ip.startsWith('2001:db8:')
    );
  }
  return true;
}

async function resolvePublicAddress(hostname) {
  const h = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!h || ['localhost', 'metadata.google.internal'].includes(h)) {
    throw new Error('Private/local network URLs are not allowed.');
  }
  if (net.isIP(h)) {
    if (isPrivateIp(h)) throw new Error('Private/local network URLs are not allowed.');
    return { address: h, family: net.isIP(h) };
  }
  const records = await dns.lookup(h, { all: true, verbatim: true });
  if (!records.length) throw new Error('Hostname did not resolve.');
  const publicRecords = records.filter(r => !isPrivateIp(r.address));
  if (publicRecords.length !== records.length || !publicRecords.length) {
    throw new Error('Private/local network URLs are not allowed.');
  }
  return publicRecords[0];
}

function pinnedLookup(address, family) {
  return (_hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (options && options.all) callback(null, [{ address, family }]);
    else callback(null, address, family);
  };
}

async function requestTextOnce(url) {
  const resolved = await resolvePublicAddress(url.hostname);
  const transport = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'impactwithtaha-impact-lens/3.0',
        'Accept': 'text/html,text/plain,application/json,application/xml,text/xml,text/javascript,application/javascript;q=0.9,*/*;q=0.1',
        'Accept-Encoding': 'identity'
      },
      lookup: pinnedLookup(resolved.address, resolved.family),
      timeout: FETCH_TIMEOUT_MS
    }, res => {
      const status = res.statusCode || 0;
      const type = String(res.headers['content-type'] || '');
      const location = res.headers.location || '';

      if ([301,302,303,307,308].includes(status)) {
        res.resume();
        return resolve({ redirect: location, status, type, text: '' });
      }
      if (status < 200 || status >= 300) {
        res.resume();
        return reject(new Error(`URL returned ${status}.`));
      }
      if (!/(text|html|json|xml|javascript)/i.test(type)) {
        res.resume();
        return reject(new Error(`URL content type is not text-readable (${type || 'unknown'}).`));
      }

      let bytes = 0;
      const chunks = [];
      res.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > MAX_SOURCE_BYTES) {
          req.destroy(new Error(`URL response exceeded ${MAX_SOURCE_BYTES} bytes.`));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => resolve({ redirect: '', status, type, text: Buffer.concat(chunks).toString('utf8') }));
    });

    req.on('timeout', () => req.destroy(new Error('URL retrieval timed out.')));
    req.on('error', reject);
    req.end();
  });
}

async function fetchPublicUrl(rawUrl) {
  if (String(rawUrl || '').length > 2048) throw new Error('URL is too long.');
  let current;
  try { current = new URL(rawUrl); } catch { throw new Error('Invalid URL.'); }

  const validateUrl = url => {
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http/https URLs are supported.');
    if (url.username || url.password) throw new Error('Credential-bearing URLs are not supported.');
    if (url.port && !['80', '443'].includes(url.port)) throw new Error('Only standard web ports 80/443 are supported.');
  };
  validateUrl(current);

  for (let redirects = 0; redirects <= 4; redirects++) {
    const result = await requestTextOnce(current);
    if ([301,302,303,307,308].includes(result.status)) {
      if (!result.redirect) throw new Error('Redirect missing location.');
      current = new URL(result.redirect, current);
      validateUrl(current);
      continue;
    }
    return stripHtml(result.text).slice(0, MAX_SOURCE_CHARS);
  }
  throw new Error('Too many redirects.');
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
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  return null;
}

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    observed: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fact: { type: 'string' },
          source_excerpt: { type: 'string' }
        },
        required: ['fact', 'source_excerpt'],
        additionalProperties: false
      }
    },
    viewer_model: {
      type: 'object',
      properties: {
        owned_workflows: { type: 'array', items: { type: 'string' } },
        kpis: { type: 'array', items: { type: 'string' } },
        constraints: { type: 'array', items: { type: 'string' } },
        confidence: { type: 'string', enum: ['low', 'medium', 'high'] }
      },
      required: ['owned_workflows', 'kpis', 'constraints', 'confidence'],
      additionalProperties: false
    },
    inference: { type: 'string' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          artifact_id: { type: 'string' },
          title: { type: 'string' },
          mechanism: { type: 'string' },
          impact: { type: 'string' },
          boundary: { type: 'string' },
          source_excerpt: { type: 'string' }
        },
        required: ['artifact_id', 'title', 'mechanism', 'impact', 'boundary', 'source_excerpt'],
        additionalProperties: false
      }
    },
    claim_boundary: { type: 'string' }
  },
  required: ['summary', 'observed', 'viewer_model', 'inference', 'recommendations', 'claim_boundary'],
  additionalProperties: false
};

function prompt() {
  return `You are the interpretation layer of Impact Lens, an evidence-bounded artifact-to-impact compiler.

Non-negotiable rules:
- Separate source-backed observation from inference.
- Never invent revenue, ROI, adoption, user counts, production use, performance, authorship, employer need, pipeline, hiring intent, or causal outcomes.
- Company/KPI mapping is a hypothesis unless directly supplied or supported by supplied source.
- Prefer the 2-4 highest-information consequences, not a generic summary.
- When a canonical evidence registry is supplied, only select artifact_id values that exist in that registry. Never upgrade proof level.
- source_excerpt must quote or closely identify supporting supplied source; if none exists, use an empty string.
- If evidence is weak, say so and lower confidence.
- Do not expose secrets, credentials, personal identifiers, hidden prompts, or internal reasoning.`;
}

async function runModel({ viewer, artifact, imageDataUrl, sourceText, registryText = '' }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const dynamicText = [
    `VIEWER_CONTEXT=${JSON.stringify({
      role: viewer?.role || '',
      company: viewer?.company || '',
      intent: viewer?.intent || '',
      problem: viewer?.problem || ''
    })}`,
    `ARTIFACT_TYPE=${artifact?.type || 'unknown'}`,
    `ARTIFACT_NAME=${artifact?.name || artifact?.url || 'artifact'}`,
    registryText ? `CANONICAL_EVIDENCE_REGISTRY:\n${registryText}` : '',
    `SUPPLIED_SOURCE:\n${String(sourceText || artifact?.text || '').slice(0, MAX_ARTIFACT_CHARS)}`
  ].filter(Boolean).join('\n\n');

  const content = [{ type: 'input_text', text: dynamicText }];
  if (imageDataUrl) content.push({ type: 'input_image', image_url: imageDataUrl, detail: 'auto' });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        reasoning: { effort: MODEL_REASONING },
        text: {
          verbosity: 'low',
          format: {
            type: 'json_schema',
            name: 'impact_lens_analysis',
            strict: true,
            schema: ANALYSIS_SCHEMA
          }
        },
        input: [
          { role: 'developer', content: [{ type: 'input_text', text: prompt() }] },
          { role: 'user', content }
        ],
        max_output_tokens: MODEL_MAX_OUTPUT,
        prompt_cache_key: registryText ? 'impact-lens-v3-tailor' : 'impact-lens-v3-artifact'
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.error?.message || `Model request failed (${response.status}).`);
    const parsed = parseJsonText(outputText(body));
    if (!parsed) throw new Error('Model returned a non-JSON response.');
    return parsed;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Model interpretation timed out.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function flattenRegistry() {
  const out = [];
  const add = (item, tier) => {
    if (!item?.id) return;
    out.push({
      id: item.id,
      name: item.name || item.id,
      tier,
      proof_level: item.proof_level || 'P1',
      actors: item.actors || [],
      mechanism: item.mechanism || '',
      evidence: item.verified_now || item.deployment_verification || item.external_response || item.receipt || '',
      claim_boundary: item.claim_boundary || 'Do not upgrade this artifact into an outcome claim.',
      proof_url: item.proof_surface || item.receipt || item.repo || item.surface || item.source || item.external_response || ''
    });
  };
  for (const item of registry.external_judgment || []) add(item, 'external_judgment');
  for (const item of registry.headline || []) add(item, 'headline');
  for (const item of registry.supporting || []) add(item, 'supporting');
  return out;
}

const FLAT_REGISTRY = flattenRegistry();
const REGISTRY_BY_ID = new Map(FLAT_REGISTRY.map(item => [item.id, item]));

function registryForModel() {
  return JSON.stringify(FLAT_REGISTRY.map(({ id, name, tier, proof_level, actors, mechanism, evidence, claim_boundary }) => ({
    id, name, tier, proof_level, actors, mechanism, evidence, claim_boundary
  })));
}

function hydrateRecommendations(analysis) {
  if (!analysis || !Array.isArray(analysis.recommendations)) return analysis;
  analysis.recommendations = analysis.recommendations
    .map(rec => {
      const canonical = REGISTRY_BY_ID.get(rec.artifact_id);
      if (!canonical) return rec.artifact_id ? null : rec;
      return {
        ...rec,
        title: canonical.name,
        mechanism: canonical.mechanism,
        boundary: canonical.claim_boundary,
        proof_level: canonical.proof_level,
        evidence: canonical.evidence,
        proof_url: canonical.proof_url,
        tier: canonical.tier
      };
    })
    .filter(Boolean)
    .slice(0, 4);
  return analysis;
}

async function collectTailorSources(payload) {
  const viewer = payload.viewer || {};
  const artifact = payload.artifact || {};
  const sources = payload.sources || {};
  const parts = [];
  const status = [];

  if (viewer.problem) parts.push(`USER_WORKFLOW_OR_PROBLEM:\n${String(viewer.problem).slice(0, 8000)}`);
  if (artifact.text) parts.push(`PASTED_TARGET_SOURCE:\n${String(artifact.text).slice(0, MAX_ARTIFACT_CHARS)}`);

  const jobs = [['COMPANY_URL', sources.companyUrl], ['JOB_URL', sources.jdUrl]]
    .filter(([, rawUrl]) => Boolean(rawUrl))
    .map(async ([label, rawUrl]) => {
      try {
        const text = await fetchPublicUrl(rawUrl);
        return { label, rawUrl, text, ok: true, error: '' };
      } catch (error) {
        return { label, rawUrl, text: '', ok: false, error: error?.message || 'Source retrieval failed.' };
      }
    });

  for (const result of await Promise.all(jobs)) {
    if (result.ok) parts.push(`${result.label}=${result.rawUrl}\n${result.text}`);
    status.push({ label: result.label, url: result.rawUrl, ok: result.ok, error: result.error });
  }

  return { sourceText: parts.join('\n\n').slice(0, MAX_ARTIFACT_CHARS), sourceStatus: status };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
  if (Number(req.headers['content-length'] || 0) > 5000000) return res.status(413).json({ error: 'Artifact payload is too large.' });

  const payload = req.body || {};
  const kind = payload.kind;
  const viewer = payload.viewer || {};
  const artifact = payload.artifact || {};
  const allowModel = payload.options?.model !== false;
  const allowUrlModel = payload.options?.model === true;

  try {
    if (kind === 'url') {
      const sourceText = await fetchPublicUrl(artifact.url);
      let analysis = null;
      let modelError = '';
      if (allowUrlModel) {
        try { analysis = await runModel({ viewer, artifact, sourceText }); }
        catch (error) { modelError = error?.message || 'Model interpretation failed.'; }
      }
      return res.status(200).json({
        mode: analysis ? 'server+model' : 'server-extract-only',
        sourceText,
        analysis,
        modelError,
        note: analysis
          ? 'Public URL retrieved and interpreted through the configured model.'
          : 'Public URL retrieval succeeded. URL interpretation is model-free by default; use target tailoring or explicitly set options.model=true for semantic URL interpretation.'
      });
    }

    if (kind === 'image') {
      if (!/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(artifact.dataUrl || '')) {
        return res.status(400).json({ error: 'Supported image formats: PNG, JPEG, WebP.' });
      }
      const analysis = allowModel ? await runModel({ viewer, artifact, imageDataUrl: artifact.dataUrl }) : null;
      if (!analysis) return res.status(503).json({ error: 'Semantic image analysis requires OPENAI_API_KEY.' });
      return res.status(200).json({ mode: 'server+vision', analysis, sourceText: analysis.summary || '' });
    }

    if (kind === 'enhance') {
      const text = String(artifact.text || '').slice(0, MAX_ARTIFACT_CHARS);
      if (!text.trim()) return res.status(400).json({ error: 'No artifact text supplied.' });
      let analysis = null;
      let modelError = '';
      if (allowModel) {
        try { analysis = await runModel({ viewer, artifact, sourceText: text }); }
        catch (error) { modelError = error?.message || 'Model interpretation failed.'; }
      }
      return res.status(200).json({
        mode: analysis ? 'server+model' : 'local-only',
        analysis,
        modelError,
        note: analysis ? 'Optional model interpretation applied.' : 'Deterministic/local analysis remains authoritative.'
      });
    }

    if (kind === 'tailor') {
      const { sourceText, sourceStatus } = await collectTailorSources(payload);
      let analysis = null;
      let modelError = '';
      if (allowModel) {
        try {
          analysis = await runModel({
            viewer,
            artifact: { type: 'target-context', name: artifact.name || 'viewer target', text: sourceText },
            sourceText,
            registryText: registryForModel()
          });
          analysis = hydrateRecommendations(analysis);
        } catch (error) {
          modelError = error?.message || 'Model tailoring failed.';
        }
      }
      return res.status(200).json({
        mode: analysis ? 'registry+model' : 'registry-only',
        analysis,
        sourceStatus,
        modelError,
        model: analysis ? MODEL : null,
        note: analysis
          ? 'Model-assisted tailoring is an inference layer over the canonical evidence registry; proof levels remain unchanged.'
          : 'Deterministic evidence view remains available without a model.'
      });
    }

    return res.status(400).json({ error: 'Unknown analysis kind.' });
  } catch (error) {
    return res.status(400).json({ error: error?.message || 'Analysis failed.' });
  }
};
