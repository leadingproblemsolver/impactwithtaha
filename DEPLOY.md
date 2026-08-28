# Production Deployment Contract — Impact V3 hardening

## Canonical target

Production: `https://impactwithtaha.vercel.app`

Vercel is the authoritative runtime. `vercel.json` owns the route, region, function-duration, cancellation and security-header contract.

## Runtime

- Node.js: **22.x** (pinned in `package.json`)
- Primary region: **`dxb1`**
- Static/browser runtime: `impact-v2.html` + `impact-v2.js`
- Additive LLM tailoring layer: `impact-llm.js`
- Canonical evidence: `ARTIFACT_REGISTRY.json`

The model layer is deliberately additive. A model failure must not remove the deterministic portfolio/evidence path.

## Vercel Functions

### `api/analyze.js`

Purpose:
- bounded public website/JD/repo retrieval;
- private-network / SSRF rejection with DNS resolution and pinned public IP lookup;
- deterministic extraction even if the model fails;
- optional artifact interpretation and image vision;
- optional target-context tailoring against the canonical evidence registry.

Vercel contract:
- Node 22.x
- region `dxb1`
- `maxDuration: 60`
- `supportsCancellation: true`

Supported `kind` values:
- `url` — retrieve a public URL; model enhancement optional;
- `enhance` — interpret supplied artifact text;
- `image` — semantic image interpretation; requires model key;
- `tailor` — interpret viewer/JD/company/workflow context against `ARTIFACT_REGISTRY.json` and return registry-bounded evidence matches.

For smoke tests, `options.model=false` keeps public URL extraction deterministic and avoids model spend.

### `api/event.js`

Purpose:
- accept only allowlisted, non-sensitive behavioral events;
- write safe event receipts to Vercel logs;
- optionally forward the same sanitized event to a durable HTTPS sink.

Vercel contract:
- Node 22.x
- region `dxb1`
- `maxDuration: 10`
- `supportsCancellation: true`

Never send artifact bodies, JD text, free-text problems, image bytes, credentials or model prompts to this endpoint.

### `api/health.js`

Purpose:
- expose deployment/runtime state without secrets;
- identify the deployed Git SHA;
- expose whether the model and optional event sink are configured;
- make production smoke verification deterministic.

Vercel contract:
- Node 22.x
- region `dxb1`
- `maxDuration: 10`
- `supportsCancellation: true`

Expected production checks:
- `status = ok`
- `runtime = v22.x`
- `commit = VERCEL_GIT_COMMIT_SHA`
- `model.configured = true` when LLM tailoring is enabled.

## Environment variables

### Required for maximal LLM tailoring

Set in **Production** and **Preview**:

```text
OPENAI_API_KEY=<your OpenAI project API key>
OPENAI_MODEL=gpt-5.6-sol
OPENAI_REASONING_EFFORT=medium
OPENAI_MAX_OUTPUT_TOKENS=2200
```

`OPENAI_API_KEY` is secret/server-only. Do not prefix it with `NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`, or expose it to browser code.

Why these values:
- `gpt-5.6-sol` is the highest-capability GPT-5.6 model and supports text/image input, Responses API and Structured Outputs;
- `medium` reasoning is the production default for high-quality tailoring without turning every interactive request into a worst-case latency path;
- increase `OPENAI_REASONING_EFFORT=high` only after measuring latency on real employer/buyer/JD inputs.

### Explicit production safety/latency bounds

Set in **Production** and **Preview** so deployment behavior is not dependent on code defaults:

```text
ANALYZE_FETCH_TIMEOUT_MS=9000
ANALYZE_MODEL_TIMEOUT_MS=30000
ANALYZE_MAX_SOURCE_BYTES=1000000
ANALYZE_MAX_SOURCE_CHARS=50000
ANALYZE_MAX_ARTIFACT_CHARS=45000
```

These are bounded again in server code; invalid or extreme environment values are clamped.

### Optional durable event receipts

If a durable HTTPS event receiver is available:

```text
IMPACT_EVENT_SINK_URL=https://<your-event-receiver>
IMPACT_EVENT_SINK_TOKEN=<bearer token>
```

If these are absent, the event function still writes sanitized receipts to Vercel logs. Do not block the user-facing response on an unavailable event sink.

### Vercel system environment variables

In Vercel Project Settings → Environment Variables, enable **Automatically expose System Environment Variables**. Do **not** manually create these:

```text
VERCEL_REGION
VERCEL_ENV
VERCEL_URL
VERCEL_PROJECT_PRODUCTION_URL
VERCEL_GIT_COMMIT_SHA
VERCEL_GIT_COMMIT_REF
```

`api/health.js` uses `VERCEL_GIT_COMMIT_SHA` to prove which commit is actually live.

## Vercel dashboard settings

Use:

```text
Framework Preset: Other
Production Branch: main
Node.js Version: 22.x
Root Directory: repository root
Primary region: dxb1 (also enforced in vercel.json)
```

Keep Git integration enabled so PR/branch pushes create Preview deployments and `main` creates Production deployments.

## LLM tailoring user path

The deterministic Lens remains:

```text
viewer role / intent / workflow
+ optional company URL
+ optional job URL or pasted JD
→ deterministic evidence ranking
→ proof boundary
→ next action
```

When `OPENAI_API_KEY` is configured, the same Compile action also runs:

```text
supplied target context
+ safely retrieved company/JD source
+ canonical ARTIFACT_REGISTRY evidence
→ GPT-5.6 Sol structured interpretation
→ observed target facts
→ provisional viewer/workflow/KPI model
→ registry-bounded evidence matches
→ explicit inference / claim boundary
```

The model cannot create new proof, upgrade P-levels, or invent company need. Backend hydration replaces model-proposed artifact metadata with canonical registry metadata before returning it to the browser.

Visitors can also drop/paste a resume, README, proposal, JD, brief, PDF, DOCX, structured text file, public URL or image in the existing artifact workbench. Text/PDF/DOCX retain a deterministic local-first path; images require the model path for semantic interpretation.

## Firewall / abuse boundary

For any deployment plan with Vercel WAF rate limiting, publish a rule for the expensive endpoint:

```text
Name: impact-analyze-rate-limit
When: path equals /api/analyze AND method equals POST
Limit: 20 requests per 60 seconds
Key: IP address
Action: 429 Too Many Requests
```

If the plan supports a second rate-limit rule, use:

```text
Name: impact-event-rate-limit
When: path equals /api/event AND method equals POST
Limit: 120 requests per 60 seconds
Key: IP address
Action: 429 Too Many Requests
```

The first rule has priority because `/api/analyze` can incur model cost and public-network I/O.

## Production smoke gate

`.github/workflows/vercel-source-gate.yml` now has two levels:

1. `source-gate` on push/PR — syntax, Vercel contract, Node pin and required-file checks.
2. `production-smoke` on `main` — waits for `impactwithtaha.vercel.app` to report the exact Git SHA, then verifies:
   - `/api/health`;
   - `/lens` serves V2 + additive LLM layer;
   - canonical registry is readable;
   - public URL extraction works with model disabled;
   - `127.0.0.1` is rejected by the server boundary.

Manual equivalent:

```bash
IMPACT_BASE_URL=https://impactwithtaha.vercel.app \
EXPECTED_SHA=<merged-main-sha> \
node scripts/production-smoke.mjs --wait
```

To require the model during a manual smoke:

```bash
REQUIRE_MODEL=1 node scripts/production-smoke.mjs
```

## Deployment sequence

1. Add the Production + Preview environment variables above.
2. Enable Vercel system environment variables.
3. Publish the `/api/analyze` WAF rate-limit rule when available.
4. Deploy the hardening branch as Preview.
5. Check `/api/health`; confirm Node 22.x and model configured.
6. Run a real Lens input: role + JD/company source + workflow/problem.
7. Confirm deterministic results render even if model enhancement is intentionally disabled/fails.
8. Confirm model-assisted section uses only canonical registry evidence and exposes an explicit claim boundary.
9. Merge to `main`.
10. Let the production GitHub smoke gate prove `impactwithtaha.vercel.app` is serving the merged SHA.
11. Only then run the cold-evaluator evidence gate.

## External evidence gate after deployment

Deployment is not validation. The next proof event remains:

```text
cold evaluator
→ /lens
→ real role/JD/company source
→ deterministic evidence view
→ model-assisted relevance layer (if configured)
→ opens a canonical receipt
→ corrects/accepts the lens
→ submits a real artifact
→ takes a consequential next action
```

Record whether the evaluator needed operator explanation. A working deployment upgrades implementation confidence; only real external behavior upgrades the product evidence state.
