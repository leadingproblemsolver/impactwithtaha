import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const { createHandler } = require('../api/qdb-ingest.js');

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; }
  };
}

const env = {
  QDB_INGEST_TOKEN: 'test-ingest-token',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role',
  OPENAI_API_KEY: 'test-openai-key',
  QDB_OPENAI_MODEL: 'gpt-test'
};

const source = 'The founder will send the revised financial model by September 12. Sophie agreed to review it before the next session. The pricing question remains unresolved.';
const input = {
  interaction_id: 'case_01_session_01',
  case_id: 'case_01',
  advisor_id: 'advisor_01',
  occurred_at: '2026-09-08T09:00:00+03:00',
  source_type: 'advisory_notes',
  source_text: source,
  source_ref: 'private://qdb/case_01/session_01',
  n8n_execution_id: 'n8n_test_001',
  permission: { permitted: true, basis: 'synthetic contract test' }
};

function modelBody(validQuote = true) {
  return {
    output_text: JSON.stringify({
      items: [
        {
          kind: 'commitment',
          statement: 'Founder will send the revised financial model by September 12.',
          source_quote: validQuote ? 'The founder will send the revised financial model by September 12.' : 'A quote that does not exist.',
          confidence: 0.99,
          owner: 'founder',
          due_at: null
        },
        {
          kind: 'decision',
          statement: 'Sophie will review the model before the next session.',
          source_quote: 'Sophie agreed to review it before the next session.',
          confidence: 0.98,
          owner: 'Sophie',
          due_at: null
        },
        {
          kind: 'unresolved',
          statement: 'Pricing remains unresolved.',
          source_quote: 'The pricing question remains unresolved.',
          confidence: 1,
          owner: null,
          due_at: null
        }
      ]
    })
  };
}

async function runHappyPath() {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method, prefer: options.headers?.Prefer || '', body: options.body ? JSON.parse(options.body) : null });
    if (String(url).includes('/qdb_interactions?on_conflict=interaction_id')) return jsonResponse(201, [{ interaction_id: input.interaction_id }]);
    if (String(url).includes('api.openai.com')) return jsonResponse(200, modelBody(true));
    if (String(url).includes('/rpc/qdb_apply_extraction')) return jsonResponse(200, { interaction_id: input.interaction_id, extraction_count: 3, state_snapshot: true, status: 'ready' });
    throw new Error(`Unexpected URL ${url}`);
  };
  const handler = createHandler({ fetchImpl, env });
  const req = { method: 'POST', headers: { authorization: 'Bearer test-ingest-token' }, body: input };
  const res = makeRes();
  await handler(req, res);

  if (res.statusCode !== 200) throw new Error(`happy path returned ${res.statusCode}`);
  if (res.body.status !== 'ready_for_operator_review') throw new Error('operator review status missing');
  if (res.body.extraction.count !== 3) throw new Error('expected three extractions');
  if (!res.body.extraction.items.every(x => Number.isInteger(x.source_start) && x.source_end > x.source_start)) throw new Error('provenance offsets missing');
  if (calls.length !== 3) throw new Error(`expected 3 upstream calls, got ${calls.length}`);
  if (!calls[0].url.includes('qdb_interactions')) throw new Error('raw interaction was not persisted before extraction');
  if (!calls[0].prefer.includes('resolution=ignore-duplicates')) throw new Error('interaction insert is not conflict-safe');
  if (!calls[1].url.includes('api.openai.com')) throw new Error('model extraction did not follow source persistence');
  if (!calls[2].url.includes('qdb_apply_extraction')) throw new Error('atomic extraction/state RPC missing');
  return { passed: true, upstream_order: ['persist_source', 'model_extract', 'atomic_apply'], extraction_count: 3 };
}

async function runPermissionGate() {
  let externalCalls = 0;
  const handler = createHandler({ fetchImpl: async () => { externalCalls += 1; throw new Error('should not call upstream'); }, env });
  const res = makeRes();
  await handler({ method: 'POST', headers: { authorization: 'Bearer test-ingest-token' }, body: { ...input, permission: { permitted: false } } }, res);
  if (res.statusCode !== 403 || externalCalls !== 0) throw new Error('permission gate failed closed contract');
  return { passed: true, status: res.statusCode, upstream_calls: externalCalls };
}

async function runProvenanceFailure() {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method });
    if (String(url).includes('/qdb_interactions?on_conflict=interaction_id')) return jsonResponse(201, [{ interaction_id: input.interaction_id }]);
    if (String(url).includes('api.openai.com')) return jsonResponse(200, modelBody(false));
    if (String(url).includes('/qdb_interactions?interaction_id=eq.')) return jsonResponse(204, null);
    if (String(url).includes('/rpc/qdb_apply_extraction')) throw new Error('state must not be applied after provenance failure');
    throw new Error(`Unexpected URL ${url}`);
  };
  const handler = createHandler({ fetchImpl, env });
  const res = makeRes();
  await handler({ method: 'POST', headers: { authorization: 'Bearer test-ingest-token' }, body: input }, res);
  if (res.statusCode !== 422) throw new Error(`expected 422, got ${res.statusCode}`);
  if (!res.body.source_persisted) throw new Error('source persistence receipt missing on extraction failure');
  if (calls.some(x => x.url.includes('/rpc/qdb_apply_extraction'))) throw new Error('invalid extraction reached state persistence');
  return { passed: true, status: res.statusCode, source_persisted: true, state_applied: false };
}

const happy = await runHappyPath();
const permission = await runPermissionGate();
const provenance = await runProvenanceFailure();

const files = [
  'api/qdb-ingest.js',
  'lib/qdb-v0.js',
  'supabase/qdb-v0.sql',
  'docs/QDB_V0_PRODUCTION_PATH.md',
  'package.json',
  '.env.example',
  'api/health.js',
  'vercel.json',
  '.github/workflows/vercel-source-gate.yml',
  'scripts/qdb-v0-test.mjs'
];
const fileHashes = Object.fromEntries(files.map(file => {
  const data = fs.readFileSync(path.join(process.cwd(), file));
  return [file, crypto.createHash('sha256').update(data).digest('hex')];
}));

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const vercel = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'));
const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/vercel-source-gate.yml'), 'utf8');
const requiredEnv = ['QDB_INGEST_TOKEN','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];
const buildContract = {
  node_22_pinned: pkg.engines?.node === '22.x',
  qdb_test_script_present: pkg.scripts?.['test:qdb'] === 'node scripts/qdb-v0-test.mjs',
  vercel_function_declared: Boolean(vercel.functions?.['api/qdb-ingest.js']),
  required_env_documented: requiredEnv.every(name => envExample.includes(`${name}=`)),
  ci_runs_qdb_contract: workflow.includes('npm run test:qdb') && workflow.includes('api/qdb-ingest.js')
};
if (!Object.values(buildContract).every(Boolean)) throw new Error(`build contract failed: ${JSON.stringify(buildContract)}`);

const receipt = {
  receipt_version: 1,
  scope: 'synthetic_local_contract_test',
  real_execution_evidence: false,
  generated_at: new Date().toISOString(),
  checks: { happy_path: happy, permission_gate: permission, provenance_failure: provenance, build_contract: buildContract },
  file_sha256: fileHashes,
  proves: [
    'permitted input is required before any external call',
    'raw interaction persistence precedes model extraction',
    'interaction persistence uses conflict-ignore semantics so retries cannot overwrite the raw source',
    'every extraction source_quote must exist verbatim in source_text',
    'provenance failure blocks state application while preserving raw source',
    'successful extraction/state persistence uses one Supabase RPC boundary'
  ],
  does_not_prove: [
    'a real Sophie/QDB interaction occurred',
    'n8n executed in production',
    'Supabase schema is deployed',
    'OpenAI or Supabase credentials work in production',
    'Sophie reviewed, corrected, or used the output',
    'follow-up, reconciliation, or next-session brief'
  ]
};

const arg = process.argv.find(x => x.startsWith('--receipt='));
if (arg) {
  const out = arg.split('=', 2)[1];
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(receipt, null, 2) + '\n');
}
console.log(JSON.stringify(receipt, null, 2));
