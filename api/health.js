module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).json({ error: 'GET required.' });

  const body = {
    status: 'ok',
    service: 'impactwithtaha',
    runtime: process.version,
    region: process.env.VERCEL_REGION || null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    model: {
      configured: Boolean(process.env.OPENAI_API_KEY),
      id: process.env.OPENAI_MODEL || 'gpt-5.6-sol',
      reasoning_effort: process.env.OPENAI_REASONING_EFFORT || 'medium'
    },
    event_sink: {
      configured: Boolean(process.env.IMPACT_EVENT_SINK_URL)
    },
    limits: {
      fetch_timeout_ms: Number(process.env.ANALYZE_FETCH_TIMEOUT_MS || 9000),
      model_timeout_ms: Number(process.env.ANALYZE_MODEL_TIMEOUT_MS || 30000),
      max_source_bytes: Number(process.env.ANALYZE_MAX_SOURCE_BYTES || 1000000),
      max_source_chars: Number(process.env.ANALYZE_MAX_SOURCE_CHARS || 50000),
      max_artifact_chars: Number(process.env.ANALYZE_MAX_ARTIFACT_CHARS || 45000),
      max_output_tokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 2200)
    }
  };

  return req.method === 'HEAD' ? res.status(204).end() : res.status(200).json(body);
};
