# impactwithtaha — Contextual Impact Lens

**Positioning:** Contextual Impact Infrastructure · Commercial Systems · Full-Stack / AI Integration · Evidence-Grounded Execution

This repository is both:

1. Taha Aslam's public work/proof surface; and
2. a working **artifact → viewer → workflow → mechanism → evidence → next-action** compiler.

The site does not ask every visitor to interpret the same project grid. A hiring manager, founder, buyer, collaborator, recruiter, or practitioner can provide lightweight context and receive a view of the same evidence corpus prioritized around what they are likely to own.

## Product lineage

This branch deliberately adapts the strongest mechanisms from:

- `leadingproblemsolver/ulomis-continuity-companion` — source-backed state, explicit uncertainty, correction as a state transition, no-signup-before-value, telemetry without sensitive free text;
- the Artifact Compiler / Evidence-to-Impact work — provenance, claim gates, user-readiness, and surface-specific externalization;
- the existing `impactwithtaha` proof room — P1–P6 claim boundaries and direct-shareable proof routes.

It does **not** copy the household framing from Ulomis.

## Stable routes

- `/` — product/portfolio positioning
- `/lens` — viewer tailoring + artifact workbench
- `/work` — raw selected proof registry
- `/execution` — live GTM/commercial field experiment
- `/proof-status` — what is proven vs still missing
- `/method` — Impact Lens Protocol
- `/resume` — canonical web CV surface
- `/start` — clear next action
- `/links` — direct URL registry
- `/proof/<project>` — direct case-study routes

## Supported artifact paths

### Local-first
- TXT
- Markdown
- JSON
- YAML
- CSV
- HTML
- PDF (browser extraction through PDF.js)
- DOCX (browser extraction through Mammoth)

### Secure server boundary
- Public website / GitHub URL retrieval
- Optional LLM enhancement
- PNG / JPEG / WebP semantic image analysis

The deterministic browser path remains useful without an API key. URL retrieval remains server-side because browser CORS is not a reliable ingestion boundary. Image semantics require the optional model path.

## Optional OpenAI configuration

Netlify environment variables:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
```

`OPENAI_MODEL` is optional; the function currently defaults to `gpt-5`.

No API/model secret is placed in the browser.

## Telemetry

High-information events are stored locally and, when deployed on Netlify, mirrored through a Netlify Form:

- `viewer_profiled`
- `impact_generated`
- `artifact_submitted`
- `artifact_completed`
- `assumption_corrected`
- `referral_shared`
- `referral_converted`

General telemetry contains no artifact body, resume text, document contents, free-text problem statement, API keys, or image bytes.

## Core invariants

See [`IMPACT_LENS_CONTRACT.md`](./IMPACT_LENS_CONTRACT.md).

The short version:

- source facts ≠ inference;
- relevance ≠ proof;
- personalization never upgrades a claim;
- no signup before first value;
- corrections must change state/output;
- deterministic/local first value survives model failure;
- referral is requested only after value;
- analytics exclude sensitive artifact content;
- no autonomous agents in this branch.

## Deploy

Netlify publish directory remains `.`. Netlify Functions are automatically served from `netlify/functions`.

The SPA route fallback remains in `_redirects`, with `/api/*` routed to Netlify Functions first.

## Critical public claim boundary

This branch proves an inspectable vertical slice of contextual artifact presentation and local/server ingestion paths. It does **not** yet prove:

- improved hiring conversion;
- improved sales conversion;
- generalized arbitrary-artifact understanding;
- repeated use;
- referral conversion;
- measurable time savings;
- production-grade URL ingestion across hostile sites;
- durable multi-user state;
- causal KPI or economic impact.

Those remain behavioral evidence gates, not copywriting opportunities.
