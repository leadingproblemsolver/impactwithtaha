# Impact Lens Finalization Report — V2

## Observable target

`impactwithtaha` is a self-selling, evidence-bounded portfolio/product:

> observer or artifact → owned workflow → strongest current evidence → explicit boundary → consequential next action

The canonical public evidence corpus is `ARTIFACT_REGISTRY.json`; frontend ranking no longer depends on a stale hand-maintained project list.

## V2 implemented

- Vercel-first runtime and route contract;
- canonical registry compilation, including external-judgment receipts;
- employer flow with role, company/team source, JD URL, or pasted JD;
- company names treated as context only unless a source URL is supplied;
- distinct employer / buyer / collaborator / practitioner presentation grammar;
- distinct terminal CTA per segment;
- source-linked local artifact ontology: claims, constraints, evidence, workflow signals, metrics;
- TXT/Markdown/JSON/YAML/CSV/HTML/PDF/DOCX local parsing;
- bounded public URL retrieval through `/api/analyze`;
- optional OpenAI interpretation / image vision behind the server boundary;
- exportable impact packet for practitioner use;
- referral sharing only after first value;
- referral arrival and referred first value recorded as separate states;
- privacy-bounded event receipts through `/api/event`;
- legacy proof routes preserved through the existing SPA.

## Claim state

This branch proves implementation/reproducibility only until the Vercel preview is independently exercised.

It does not prove:
- hiring conversion lift;
- buyer conversion or payment;
- generalized artifact-understanding quality;
- repeated external use;
- referral conversion quality;
- time/cost/ROI improvement;
- production-grade crawler reliability;
- company-specific understanding without supplied source material.

## Highest-information post-deploy gate

Run one cold employer/evaluator through:

1. land on `/`;
2. open `/lens`;
3. provide role + JD/company source;
4. understand the top evidence matches and proof boundaries;
5. open one external/reproducible receipt;
6. correct one assumption if needed;
7. submit one real artifact;
8. take the compiled next action without operator explanation.

Then inspect Vercel event receipts. Do not add broader integrations until that loop creates a real external receipt or falsifies a concrete assumption.
