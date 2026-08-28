# Impact Lens Finalization Report — Production V3

## Observable target

`impactwithtaha` is a self-selling, evidence-bounded portfolio/product:

> observer or artifact → owned workflow → strongest current evidence → explicit boundary → consequential next action

V3 hardens that existing vertical slice. It does not justify broader accounts/CRM/agent scope.

## Production V3 implemented

### Canonical runtime
- Node 22.x;
- Vercel `dxb1`;
- one V2 registry-backed renderer for `/`, `/lens`, `/work`, `/proof-map`, `/proof/*`, proof status, method, resume and start;
- `/proof-map` generated from `ARTIFACT_REGISTRY.json` rather than a dated hand-maintained page.

### Deterministic/browser robustness
- stable evidence tie-breaking;
- visible canonical-registry failure;
- visible per-source company/JD retrieval status;
- stale generation-response protection;
- local viewer-state restoration;
- correction counted only after regenerated state changes;
- second-artifact receipt;
- bounded local file/image sizes;
- explicit local/model failure notes.

### Public-source boundary
- DNS resolution and pinned-public-IP fetches;
- private/local/special IPv4+IPv6 rejection;
- bounded redirects, ports, types, bytes and time;
- deterministic URL extraction survives model failure;
- viewer-context URLs are model-free by default.

### Model-assisted tailoring
- additive `impact-llm.js` layer;
- OpenAI Responses API + Structured Outputs;
- default `gpt-5.6-sol` with medium reasoning;
- one combined target call over supplied role/workflow/JD/company evidence;
- model recommendations limited to canonical registry IDs;
- backend re-hydrates proof level, mechanism, evidence URL and claim boundary from the registry before browser rendering;
- deterministic view remains usable with no model key.

### Deployment + behavioral receipts
- `/api/health` exposes safe deployed-SHA/runtime/config state;
- sanitized event allowlist with optional HTTPS sink;
- source CI gate;
- exact-production-SHA HTTP smoke;
- live Chromium production smoke for lens, correction, artifact view, share-after-value, proof routes and mobile overflow.

## Exact deploy inputs

Required Preview + Production environment:

```text
OPENAI_API_KEY=<secret>
OPENAI_MODEL=gpt-5.6-sol
OPENAI_REASONING_EFFORT=medium
OPENAI_MAX_OUTPUT_TOKENS=2200
ANALYZE_FETCH_TIMEOUT_MS=9000
ANALYZE_MODEL_TIMEOUT_MS=30000
ANALYZE_MAX_SOURCE_BYTES=1000000
ANALYZE_MAX_SOURCE_CHARS=50000
ANALYZE_MAX_ARTIFACT_CHARS=45000
```

Optional:

```text
IMPACT_EVENT_SINK_URL=https://<receiver>
IMPACT_EVENT_SINK_TOKEN=<secret>
```

Enable Vercel system environment variables so the deployment can expose `VERCEL_GIT_COMMIT_SHA` to the safe health receipt.

## Claim state

Source implementation/CI can establish that the hardening exists and is internally coherent.

After merge, the exact-SHA HTTP + Chromium production gates can establish that the intended runtime is actually deployed and the primary browser behavior works.

They still do **not** establish:
- hiring conversion lift;
- buyer conversion/payment;
- repeated external use;
- model relevance quality across arbitrary targets;
- referral conversion quality;
- causal time/cost/KPI improvement;
- production-scale crawler reliability;
- company-specific need without supplied source evidence.

## Highest-information next transition

1. configure Vercel Preview + Production environment;
2. deploy PR #4 Preview and inspect `/api/health`;
3. exercise one real role + JD/company source + workflow/problem;
4. merge when model + deterministic boundaries both behave correctly;
5. require production HTTP + Chromium gates green;
6. put one cold evaluator through the complete flow without explanation.

The next proof upgrade must be external behavior, not another adjacent portfolio feature.
