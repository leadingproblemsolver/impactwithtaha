const ALLOWED = new Set([
  'viewer_profiled','impact_generated','proof_opened','assumption_corrected',
  'artifact_submitted','artifact_completed','next_action_selected',
  'referral_arrival','referral_shared','referral_first_value','second_artifact_submitted',
  'llm_tailoring_started','llm_tailoring_completed','llm_tailoring_failed'
]);

const SINK_TIMEOUT_MS = 2500;

function clean(value, max = 120) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

async function forwardToSink(event) {
  const url = process.env.IMPACT_EVENT_SINK_URL;
  if (!url) return { configured: false, delivered: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SINK_TIMEOUT_MS);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.IMPACT_EVENT_SINK_TOKEN) headers.Authorization = `Bearer ${process.env.IMPACT_EVENT_SINK_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers,
      body: JSON.stringify(event)
    });
    if (!response.ok) throw new Error(`event sink returned ${response.status}`);
    return { configured: true, delivered: true };
  } catch (error) {
    console.error(JSON.stringify({ type: 'impact_lens_event_sink_error', message: error?.message || 'sink delivery failed' }));
    return { configured: true, delivered: false };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
  if (Number(req.headers['content-length'] || 0) > 12000) return res.status(413).json({ error: 'Event payload too large.' });

  const event = req.body || {};
  if (!ALLOWED.has(event.name)) return res.status(204).end();

  const safe = {
    name: event.name,
    at: clean(event.at, 40),
    session_id: clean(event.session_id, 80),
    role_family: clean(event.role_family, 40),
    intent: clean(event.intent, 40),
    artifact_type: clean(event.artifact_type, 40),
    ref: clean(event.ref, 80),
    action: clean(event.action, 80),
    proof_id: clean(event.proof_id, 100),
    route: clean(event.route, 100),
    model: clean(event.model, 80),
    source_count: Number.isFinite(Number(event.source_count)) ? Math.max(0, Math.min(20, Number(event.source_count))) : 0
  };

  console.log(JSON.stringify({ type: 'impact_lens_event', ...safe }));
  await forwardToSink(safe);
  return res.status(204).end();
};
