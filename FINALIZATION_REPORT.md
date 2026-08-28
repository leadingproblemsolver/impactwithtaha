# Impact Lens Finalization Report — Production V3 hardening

## Observable target

`impactwithtaha` is a self-selling, evidence-bounded portfolio/product:

> observer or artifact → owned workflow → strongest current evidence → explicit boundary → consequential next action

V3 does not broaden product scope. It hardens the existing vertical slice and adds an optional model-assisted relevance layer that cannot upgrade proof.

## V3 hardening implemented

- pinned Node 22.x Vercel runtime;
- canonical Dubai `dxb1` function placement;
- `/api/health` deployment/commit/config receipt;
- production smoke gate tied to the exact merged Git SHA;
- safer URL retrieval with DNS resolution, pinned public-IP lookup, bounded redirects, content type, bytes and time;
- public URL extraction survives downstream model failure;
- configurable model timeout and artifact/source limits;
- GPT-5.6 Sol Responses API integration with Structured Outputs;
- `tailor` mode that maps supplied role/JD/company/workflow context against `ARTIFACT_REGISTRY.json`;
- backend hydration forces model-selected evidence back to canonical registry metadata and claim boundaries;
- additive browser model layer loaded after V2, so deterministic value remains intact;
- safe LLM telemetry events with no supplied target text in analytics;
- optional durable HTTPS event sink;
- explicit Production/Preview environment contract in `DEPLOY.md` and `.env.example`.

## What a visitor can now supply

Viewer-target inputs:
- role/function;
- intent;
- workflow/problem;
- company/team URL;
- job URL;
- pasted job description.

Artifact workbench inputs remain:
- pasted text;
- public URL / repository;
- TXT / Markdown / JSON / YAML / CSV / HTML;
- PDF;
- DOCX;
- PNG / JPEG / WebP with configured vision model.

## Claim state

V3 can establish production deployment/runtime correctness after the post-merge smoke succeeds.

It still does **not** establish:
- hiring conversion lift;
- buyer conversion or payment;
- generalized artifact-understanding quality;
- repeated external use;
- referral conversion quality;
- time/cost/ROI improvement;
- production-scale crawler reliability;
- company-specific need without supplied source evidence.

## Highest-information next gate

Run one cold evaluator through:

1. land on `/`;
2. open `/lens`;
3. supply role + real JD/company source + one owned workflow/problem;
4. compare deterministic and model-assisted relevance;
5. inspect one canonical receipt;
6. correct or explicitly accept the inferred lens;
7. submit one real artifact;
8. take the compiled next action without operator explanation.

Success is an external behavior receipt, not another code change.
