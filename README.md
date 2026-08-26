# impactwithtaha — Contextual Impact Lens

**Positioning:** Commercial Systems & Full-Stack Developer | AI Integration · Automation · Evidence-Grounded Execution

This repository is both a public proof surface and a working artifact-to-impact compiler.

## Product contract

```text
observer or artifact
→ owned workflow / constraint
→ strongest relevant evidence
→ mechanism
→ explicit claim boundary
→ observer-specific next action
→ correction / behavioral receipt
```

The site does not merely list projects. It compiles the canonical public evidence corpus around an employer, buyer, collaborator, practitioner, job description, company/team source, or submitted artifact.

## Canonical runtime

Public target: `https://impactwithtaha.vercel.app/`

Vercel routes:
- `/` — contextual portfolio homepage
- `/lens` — viewer + artifact compiler
- `/work` — canonical public evidence registry
- `/proof-status` — proof ladder / claim boundaries
- `/method` — Impact Lens protocol
- `/resume` — canonical CV surface
- `/start` — next external transition
- `/proof/*` — legacy proof route compatibility

## Canonical evidence

`ARTIFACT_REGISTRY.json` is the runtime source of truth. It currently separates:
- external technical judgment;
- headline proof families;
- supporting proof;
- internal-only artifacts.

Adding a verified public receipt should update the registry rather than duplicating project copy in the UI.

## Artifact input

Local-first:
- text / Markdown / JSON / YAML / CSV / HTML;
- PDF via PDF.js;
- DOCX via Mammoth.

Server boundary:
- public website / GitHub URL retrieval;
- optional model interpretation;
- optional image vision.

Optional environment variables:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

The deterministic/local first-value path remains usable without a model key.

## Critical invariants

- personalization changes relevance and presentation, never proof level;
- company names alone are not company-specific evidence;
- supplied company/JD source material remains distinct from inference;
- no invented adoption, revenue, ROI, production, hiring, pipeline or causal claims;
- model secrets remain server-side;
- telemetry excludes artifact bodies and free-text problem content;
- value precedes referral;
- referral arrival is not referral first value;
- legacy direct proof URLs remain usable.

See `IMPACT_LENS_CONTRACT.md`, `CLAIM_REGISTRY.md`, `PRODUCT_COMPLETENESS.md`, `DEPLOY.md`, and `FINALIZATION_REPORT.md`.
