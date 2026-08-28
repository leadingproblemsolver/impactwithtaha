const base = (process.env.IMPACT_BASE_URL || 'https://impactwithtaha.vercel.app').replace(/\/$/, '');
const expectedSha = process.env.EXPECTED_SHA || '';
const requireModel = process.env.REQUIRE_MODEL === '1';
const shouldWait = process.argv.includes('--wait');
const attempts = shouldWait ? 24 : 1;
const delayMs = Number(process.env.SMOKE_RETRY_MS || 10000);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function json(url, init) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${url} returned ${response.status}: ${body.error || JSON.stringify(body).slice(0, 240)}`);
  return body;
}

async function text(url) {
  const response = await fetch(url);
  const body = await response.text();
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return body;
}

async function runOnce() {
  const health = await json(`${base}/api/health`);
  if (health.status !== 'ok') throw new Error('health status is not ok');
  if (expectedSha && health.commit !== expectedSha) {
    throw new Error(`deployment SHA ${health.commit || 'missing'} != expected ${expectedSha}`);
  }
  if (requireModel && !health.model?.configured) throw new Error('OPENAI_API_KEY is not configured in production');
  if (!/^v22\./.test(health.runtime || '')) throw new Error(`unexpected Node runtime ${health.runtime || 'unknown'}; expected v22.x`);

  const lens = await text(`${base}/lens`);
  if (!lens.includes('/impact-v2.js')) throw new Error('/lens is not serving the canonical V2 runtime');
  if (!lens.includes('/impact-llm.js')) throw new Error('/lens is missing the additive LLM tailoring layer');

  const registry = await json(`${base}/ARTIFACT_REGISTRY.json`);
  if (!Array.isArray(registry.headline) || registry.headline.length < 1) throw new Error('canonical artifact registry is unavailable');

  const extracted = await json(`${base}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: 'url',
      viewer: { role: 'Engineering Manager', intent: 'hiring' },
      artifact: { type: 'url', url: 'https://example.com/' },
      options: { model: false }
    })
  });
  if (!/Example Domain/i.test(extracted.sourceText || '')) throw new Error('/api/analyze failed public URL extraction');

  const privateResponse = await fetch(`${base}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: 'url',
      artifact: { type: 'url', url: 'http://127.0.0.1/' },
      options: { model: false }
    })
  });
  const privateBody = await privateResponse.json().catch(() => ({}));
  if (privateResponse.status !== 400 || !/Private\/local/i.test(privateBody.error || '')) {
    throw new Error('private-network URL rejection gate failed');
  }

  console.log(JSON.stringify({
    ok: true,
    base,
    commit: health.commit,
    runtime: health.runtime,
    model_configured: health.model?.configured || false,
    model: health.model?.id || null,
    registry_headline_count: registry.headline.length
  }, null, 2));
}

let lastError;
for (let attempt = 1; attempt <= attempts; attempt++) {
  try {
    await runOnce();
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.error(`[smoke ${attempt}/${attempts}] ${error.message}`);
    if (attempt < attempts) await sleep(delayMs);
  }
}
throw lastError;
