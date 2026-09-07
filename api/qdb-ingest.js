const {
  normalizeInteraction,
  extractInteraction,
  buildState,
  SupabaseQdbStore,
  operatorReview
} = require('../lib/qdb-v0');

function authOk(req, env) {
  const expected = env.QDB_INGEST_TOKEN || '';
  if (!expected) return false;
  const bearer = String(req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
  const direct = String(req.headers?.['x-qdb-ingest-token'] || '');
  return bearer === expected || direct === expected;
}

function createHandler({ fetchImpl = fetch, env = process.env } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
    if (!env.QDB_INGEST_TOKEN) return res.status(503).json({ error: 'QDB ingest is not configured.' });
    if (!authOk(req, env)) return res.status(401).json({ error: 'Unauthorized.' });
    if (Number(req.headers?.['content-length'] || 0) > 500000) return res.status(413).json({ error: 'Interaction payload too large.' });

    let interaction;
    try {
      interaction = normalizeInteraction(req.body || {});
    } catch (error) {
      const status = error?.code === 'NOT_PERMITTED' ? 403 : 400;
      return res.status(status).json({ error: error?.message || 'Invalid interaction.' });
    }

    let store;
    try {
      store = new SupabaseQdbStore({ fetchImpl, env });
      await store.persistInteraction(interaction);
    } catch (error) {
      return res.status(502).json({
        error: 'Source persistence failed.',
        detail: error?.message || 'Supabase persistence failed.',
        interaction_id: interaction.interaction_id,
        source_sha256: interaction.source_sha256
      });
    }

    try {
      const items = await extractInteraction(interaction, { fetchImpl, env });
      const state = buildState(items);
      const receipt = await store.applyExtraction(interaction, items, state);
      console.log(JSON.stringify({
        type: 'qdb_v0_ingest_ready',
        interaction_id: interaction.interaction_id,
        case_id: interaction.case_id,
        n8n_execution_id: interaction.n8n_execution_id,
        source_sha256: interaction.source_sha256,
        extraction_count: items.length
      }));
      return res.status(200).json(operatorReview(interaction, items, state, receipt));
    } catch (error) {
      await store.markFailed(interaction.interaction_id, error?.message || 'processing failed');
      const status = error?.code === 'PROVENANCE_MISMATCH' ? 422
        : ['MODEL_NOT_CONFIGURED', 'SUPABASE_NOT_CONFIGURED'].includes(error?.code) ? 503
          : 502;
      return res.status(status).json({
        error: error?.code === 'PROVENANCE_MISMATCH' ? 'Extraction provenance validation failed.' : 'Interaction processing failed.',
        detail: error?.message || 'processing failed',
        interaction_id: interaction.interaction_id,
        source_sha256: interaction.source_sha256,
        source_persisted: true
      });
    }
  };
}

const handler = createHandler();
module.exports = handler;
module.exports.createHandler = createHandler;
