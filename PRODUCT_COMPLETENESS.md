# Product Common-Sense + Functional Completeness Mandate

## Governing principle

**Implement the product people reasonably believe they are being shown — but never pretend an unproven capability exists.**

Impact Lens is complete enough to ship only when the first vertical slice works:

```text
cold visitor
→ self-identifies
→ tailored view
→ evidence inspection
→ correction
→ own artifact
→ source/inference/boundary view
→ next action
→ post-value share
```

## Required acceptance

- `/` explains the product and work in one screen.
- `/lens` is discoverable from every primary route.
- role, company toggle, intent and optional workflow/problem inputs work on mobile and desktop.
- generating a view changes the evidence ordering/presentation.
- correction routes the user back to editable assumptions.
- no signup is required before value.
- TXT/MD/JSON/YAML/CSV/HTML parsing works locally.
- PDF and DOCX have local browser extraction paths.
- URL retrieval uses `/api/analyze`, not client-side CORS assumptions.
- image semantics fail visibly when server model configuration is absent.
- model failure does not destroy local-first value.
- source, inference and boundary are visibly distinct.
- old proof URLs continue to resolve.
- direct navigation / refresh works.
- no important CTA is a dead end.
- artifact text and free-text problem content are excluded from analytics.
- referral share and referral conversion remain distinct.
- repository publicity is disclosed; the “unlock” is not represented as secure access control.

## Deliberately not required yet

- accounts;
- multi-user persistence;
- autonomous agents;
- private company crawling;
- CRM integrations;
- vector search;
- dashboards;
- payments;
- generalized arbitrary file ingestion;
- automatic ROI;
- autonomous outbound.

## External evidence gates after deploy

1. 5 cold visitors generate a tailored view.
2. At least 3 inspect proof rather than bouncing.
3. At least 3 submit a real artifact.
4. At least 1 correction materially changes the view.
5. At least 1 return/second artifact.
6. At least 1 real referral conversion.
7. At least 1 hiring/buyer/collaboration commitment attributable to the experience.

Until then, this is an implemented vertical slice, not a validated conversion engine.
