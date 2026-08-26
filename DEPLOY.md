# Deployment Contract

## Canonical public runtime

The current public target is **Vercel** (`impactwithtaha.vercel.app`). `vercel.json` is therefore the authoritative route/runtime contract.

### Vercel behavior
- `/`, `/lens`, `/work`, `/proof-status`, `/method`, `/resume`, `/start` -> `impact-v2.html`
- `/api/analyze` -> Vercel Node function for bounded public-URL retrieval and optional model interpretation
- `/api/event` -> privacy-bounded high-information event receipt in Vercel logs
- legacy `/proof/*` routes -> existing `index.html` SPA for backwards compatibility
- static files (registry, proof map, styles, older proof pages) remain directly addressable

### Environment
Core viewer routing, canonical-registry compilation, pasted-text analysis, PDF extraction and DOCX extraction do not require a model key.

Optional semantic enhancement / image analysis:

```text
OPENAI_API_KEY
OPENAI_MODEL (optional; defaults to gpt-5)
```

No model secret belongs in browser code.

## Secondary Netlify compatibility

The existing Netlify configuration remains in the repository for the older deployment surface. Do not infer that Netlify Forms or Netlify Functions are active on the Vercel URL.

## Acceptance gate

Verify on the Vercel preview before merge:
1. `/` and `/lens` render the v2 compiler on direct load + refresh.
2. `/work` reads `ARTIFACT_REGISTRY.json` and includes external-judgment receipts.
3. employer flow accepts a role + pasted JD and returns evidence matches.
4. company/JD URL retrieval reaches `/api/analyze` and rejects local/private targets.
5. pasted text, PDF and DOCX return source-linked observed/evidence items without a model key.
6. image path fails honestly without a key and works with a configured key.
7. referral sharing is disabled before first value; referred arrival and referred first value remain separate states.
8. `/api/event` accepts only allowlisted metadata and never artifact body/free text.
9. legacy `/proof/*` URLs still resolve.

Do not upgrade behavioral, conversion, adoption, ROI, hiring, or economic claims from deployment alone.
