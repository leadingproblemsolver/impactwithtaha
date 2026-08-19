# Impact Lens Finalization Report

## Finalized branch objective

`impactwithtaha` is now specified and implemented as the third Ulomis branch:

> arbitrary artifact + viewer context → evidence-grounded impact view

The product remains a public proof room, but the primary interaction is no longer “browse my projects.” It is “tell me who you are, then make the evidence answer to your reality.”

## Implemented

- lens-first homepage and `/lens` route;
- role/company/intent/workflow context capture;
- deterministic role-family and artifact relevance scoring;
- distinct employer/buyer/collaborator/practitioner relationship assumptions;
- source / inference / boundary presentation grammar;
- raw proof room retained;
- Ulomis continuity/correction lineage surfaced;
- local text/structured artifact parsing;
- PDF extraction path through PDF.js;
- DOCX extraction path through Mammoth;
- public URL server retrieval with obvious private-network blocking;
- optional OpenAI Responses API interpretation behind Netlify Functions;
- optional image vision path;
- deterministic first-value fallback when model enhancement is unavailable;
- high-information telemetry via local state + Netlify Forms without artifact body;
- referral-share / referral-conversion distinction;
- post-value implementation-protocol reveal;
- route/back/refresh compatibility through static SPA rewrite;
- public claim registry updated.

## Human configuration still required

To enable semantic image and model-enhanced artifact interpretation on Netlify:

```text
OPENAI_API_KEY
OPENAI_MODEL (optional; defaults to gpt-5)
```

The core role-tailoring, artifact registry, local parsing and deterministic mapping do not depend on the key.

## Evidence state after merge

Implemented/reproducible vertical slice: **P2**.
Deployed state becomes **P3** only after the branch is merged and Netlify deploy is independently verified.
Behavioral validation remains open.

## Next external evidence event

Use a cold visitor with no project context.

Pass only if they can:

1. self-identify;
2. understand the top three relevant mechanisms;
3. open one proof surface;
4. correct one assumption if needed;
5. submit one real artifact;
6. distinguish observed facts from inference and claim boundary;
7. take a next action without explanation from the operator.

Do not add more integrations until that loop produces real behavior.
