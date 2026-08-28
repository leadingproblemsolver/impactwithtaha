# Production Deployment Contract — Impact V3

## Canonical target

Production: `https://impactwithtaha.vercel.app`

Vercel is the authoritative runtime. The product is deliberately local/deterministic first; the LLM is an additive interpretation layer and cannot upgrade proof.

## Runtime + routes

- Node.js: **22.x** (`package.json`)
- Primary function region: **`dxb1`**
- Browser runtime: `impact-v2.html` + `impact-v2.js`
- Additive model layer: `impact-llm.js`
- Canonical evidence source: `ARTIFACT_REGISTRY.json`

Canonical V2 routes:

```text
/
/lens
/work
/proof-status
/proof-map
/method
/resume
/start
/proof/*
```

`/proof-map` and legacy `/proof/*` now render from the same V2 registry-backed runtime instead of a second hand-maintained portfolio engine. Old static files may remain in the repository as historical artifacts, but they are not the canonical routed surface.

## Vercel Functions

### `api/analyze.js`

Contract:

```text
Node: 22.x
Region: dxb1
maxDuration: 60
supportsCancellation: true
```

Responsibilities:
- public website/JD/repo retrieval;
- DNS-resolved + pinned-public-IP SSRF boundary;
- private/local/special IPv4+IPv6 rejection;
- redirect, port, content-type, byte and timeout bounds;
- deterministic source extraction that survives model failure;
- optional text/image interpretation;
- registry-bounded target tailoring.

Supported request kinds:

```text
url       public URL retrieval; model OFF unless options.model=true
enhance   optional interpretation of supplied artifact text
image     semantic image interpretation; model required
tailor    role/JD/company/workflow context → canonical evidence matches
```

The deterministic viewer-context URL fetches explicitly use `options.model=false`, so company/JD retrieval does not create hidden duplicate model calls. Explicit artifact URL analysis may set `options.model=true`.

### `api/event.js`

Contract:

```text
Node: 22.x
Region: dxb1
maxDuration: 10
supportsCancellation: true
```

Responsibilities:
- allowlist non-sensitive behavioral events;
- cap payload size;
- write sanitized receipts to Vercel logs;
- optionally forward the same sanitized event to a durable HTTPS sink.

Forbidden telemetry includes artifact/JD/resume bodies, workflow free text, image bytes, credentials and prompts.

### `api/health.js`

Contract:

```text
Node: 22.x
Region: dxb1
maxDuration: 10
supportsCancellation: true
```

Returns only safe deployment state:
- service status;
- Node runtime;
- Vercel region;
- `VERCEL_GIT_COMMIT_SHA`;
- model configured/model ID/reasoning setting;
- event-sink configured flag;
- active analysis limits.

This is the deployment receipt used by CI to prove the exact merged SHA is live.

## Environment variables

### Required for maximal model-assisted tailoring

Set for **Preview and Production**:

```text
OPENAI_API_KEY=<secret OpenAI project key>
OPENAI_MODEL=gpt-5.6-sol
OPENAI_REASONING_EFFORT=medium
OPENAI_MAX_OUTPUT_TOKENS=2200
```

`OPENAI_API_KEY` is server-only. Never expose it through a browser/public-prefixed environment variable.

Defaulting to `gpt-5.6-sol` keeps the highest-capability model on the bounded tailoring step. `medium` reasoning is the default interactive trade-off; move to `high` only after real latency/quality comparison on employer/buyer inputs.

### Required explicit safety/latency configuration

Set for **Preview and Production**:

```text
ANALYZE_FETCH_TIMEOUT_MS=9000
ANALYZE_MODEL_TIMEOUT_MS=30000
ANALYZE_MAX_SOURCE_BYTES=1000000
ANALYZE_MAX_SOURCE_CHARS=50000
ANALYZE_MAX_ARTIFACT_CHARS=45000
```

Server code clamps extreme values again.

### Optional durable event receipt sink

```text
IMPACT_EVENT_SINK_URL=https://<your HTTPS receiver>
IMPACT_EVENT_SINK_TOKEN=<secret bearer token>
```

If absent, safe events still exist in Vercel logs and user-facing flows do not fail.

### Vercel system environment variables

In Vercel Project Settings → Environment Variables, enable **Automatically expose System Environment Variables**. Do not manually create:

```text
VERCEL_REGION
VERCEL_ENV
VERCEL_URL
VERCEL_PROJECT_PRODUCTION_URL
VERCEL_GIT_COMMIT_SHA
VERCEL_GIT_COMMIT_REF
```

`api/health.js` depends on `VERCEL_GIT_COMMIT_SHA` for exact-deployment verification.

## Vercel project settings

```text
Framework Preset: Other
Production Branch: main
Node.js Version: 22.x
Root Directory: repository root
Primary Function Region: dxb1
Git Integration: enabled
```

Environment-variable changes require a new deployment before functions see them.

## User input / tailoring path

Viewer can supply any useful subset of:

```text
role/function
intent: hiring | buying | collaborating | applying | exploring
owned workflow / KPI / problem
company/team URL
job URL
pasted job description
```

Compile then runs:

```text
source retrieval (model-free)
+ deterministic registry ranking
+ explicit source/inference/boundary UI
+ at most one combined GPT tailoring call
+ backend re-hydration from ARTIFACT_REGISTRY.json
→ canonical evidence matches + provisional workflow/KPI interpretation
```

The model may choose relevance; it cannot create an artifact, proof level, receipt or claim boundary. Unknown model-selected IDs are dropped. Known IDs have their proof/evidence/boundary overwritten from the canonical registry before browser rendering.

The artifact workbench also accepts:

```text
pasted text
public URL / repository
TXT / Markdown / JSON / YAML / CSV / HTML
PDF (text extraction capped at 30 pages)
DOCX
PNG / JPEG / WebP (semantic interpretation requires model)
```

Browser input bounds:
- text/doc file: 8 MB;
- image: 3 MB.

## Front-end invariants now enforced

- stable deterministic ranking tie-breaker;
- registry failure is visible rather than silently producing empty proof;
- company/JD source-fetch failures are visible per source;
- correction is recorded only after regeneration changes viewer/presentation state;
- second real artifact submission emits `second_artifact_submitted`;
- viewer form state restores from the local session on re-entry;
- stale overlapping generation responses cannot overwrite the newer request;
- `/proof-map` is generated from the live registry;
- legacy `/proof/*` resolves through the same V2 runtime.

## Firewall / abuse boundary

When the plan supports rate limiting, publish the high-cost rule first:

```text
Name: impact-analyze-rate-limit
When: path equals /api/analyze AND method equals POST
Limit: 20 requests per 60 seconds
Key: IP address
Action: 429 Too Many Requests
```

If a second independent rate-limit rule is available:

```text
Name: impact-event-rate-limit
When: path equals /api/event AND method equals POST
Limit: 120 requests per 60 seconds
Key: IP address
Action: 429 Too Many Requests
```

## CI / production proof gates

`.github/workflows/vercel-source-gate.yml` has three levels.

### 1. Source gate — push + PR

Checks:
- JS syntax for server/browser/smoke files;
- Node 22 pin;
- Vercel function contract;
- canonical V2 route contract;
- required production files.

### 2. Production HTTP smoke — `main` only

Waits until `https://impactwithtaha.vercel.app/api/health` reports **exactly `${{ github.sha }}`**, then verifies:
- health/runtime;
- canonical V2 + LLM scripts;
- evidence registry;
- real public URL extraction with model disabled;
- private `127.0.0.1` rejection.

Manual equivalent:

```bash
IMPACT_BASE_URL=https://impactwithtaha.vercel.app \
EXPECTED_SHA=<merged-main-sha> \
node scripts/production-smoke.mjs --wait
```

### 3. Production Chromium behavior smoke — `main` only

Installs pinned `playwright@1.55.0` only in CI and exercises the live Vercel product:
- direct `/lens` navigation + refresh;
- deterministic viewer compilation;
- correction followed by a changed generated state;
- pasted-artifact analysis;
- share unlock only after first value;
- canonical `/proof-map`;
- legacy `/proof/driftguard`;
- mobile horizontal-overflow check;
- material browser/page errors.

## Deployment sequence

1. Add all required Preview + Production env values.
2. Enable Vercel system environment variables.
3. Publish the `/api/analyze` rate-limit rule if available on the plan.
4. Deploy `hardening/impact-v3-production` as a Vercel Preview.
5. Verify Preview `/api/health`: Node 22.x + model configured + correct preview SHA.
6. Exercise one real role + JD/company source + workflow/problem.
7. Verify deterministic output remains useful with model failure/disabled.
8. Verify model output references only canonical evidence and preserves boundaries.
9. Merge PR #4 to `main`.
10. Require both production HTTP and Chromium smoke gates to pass.
11. Run one cold evaluator without operator explanation.

## Proof boundary after deploy

A green production SHA + HTTP + Chromium gate proves deployment/runtime behavior. It still does not prove hiring conversion, buyer conversion/payment, repeated use, model relevance quality, referral quality, causal KPI movement or ROI.

The next evidence upgrade must come from a cold evaluator who supplies real context, inspects a receipt, corrects/accepts the lens, submits a real artifact and takes a consequential next action.
