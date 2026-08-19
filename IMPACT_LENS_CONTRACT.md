# Impact Lens Contract

## Irreducible invariant

**Impact Lens converts an artifact plus a viewer context into a source-bounded, correctable view of the mechanisms, workflows and plausible consequences that matter most to that viewer — without upgrading evidence state.**

This is the third Ulomis branch: the continuity/correction/provenance mechanics are generalized from live workflow state to arbitrary work artifacts and career/commercial communication.

## Canonical pipeline

```text
artifact
→ parse
→ normalize
→ observed facts / provenance
→ viewer context
→ relationship hypothesis
→ owned workflow / KPI hypothesis
→ relevance score
→ mechanism
→ immediate consequence
→ downstream pathway
→ evidence state
→ claim boundary
→ presentation
→ correction
→ next action
→ telemetry
```

## Viewer contract

Minimum useful fields:

- role/function;
- optional company/domain;
- intent: hiring, buying, collaborating, applying, exploring;
- optional workflow/problem/KPI.

The system may infer a relationship class, role family, likely owned workflow, and likely KPIs. Every inferred field is provisional and correctable.

## Evidence states

The existing public ladder remains authoritative:

- **P1 — Artifact:** something exists.
- **P2 — Reproducible:** behavior can be inspected/reproduced.
- **P3 — Deployed:** usable external surface exists.
- **P4 — External interaction:** real user/market/maintainer interaction occurred.
- **P5 — Measured outcome:** behavior/system outcome changed with evidence.
- **P6 — Economic outcome:** attributable revenue/pipeline/cost/time outcome.

Personalization can change **selection and wording**. It cannot change the proof level.

## Required user-visible distinctions

Every generated impact view must make it possible to distinguish:

1. **Observed/source-backed**
2. **Inferred**
3. **Plausible pathway**
4. **Measured outcome**
5. **Unproven boundary**

“Could affect”, “pathway to”, and “may reduce” must never be silently rewritten as “improved”, “reduced”, “increased”, or “delivered”.

## Correction invariants

A correction must update at least one of:

- viewer role/family;
- intent/relationship class;
- workflow/problem;
- ranked artifacts;
- impact wording;
- next action.

A correction cannot be recorded while leaving the generated view unchanged.

## Input contract

### P0 / local-first
- plain text / TXT;
- Markdown;
- JSON;
- YAML;
- CSV;
- HTML;
- PDF text extraction;
- DOCX text extraction.

### P0 / server boundary
- public website URL;
- public GitHub URL;
- image semantic interpretation.

### Failure behavior
- parser failure is visible;
- model failure falls back to deterministic/local output where possible;
- URL fetch failure never becomes fabricated page content;
- image semantic analysis is explicitly unavailable without the model path;
- unsupported/private-network URL is rejected.

## Security and privacy invariants

- no API/model secrets in browser code;
- server-side URL fetch rejects obvious private/local network destinations;
- artifact body is never sent to general telemetry;
- problem free text is never sent to general telemetry;
- image bytes are never sent to general telemetry;
- source/model interpretation may be sent to the configured model only after the user explicitly initiates artifact analysis;
- integrations remain opt-in;
- no autonomous action on behalf of a visitor.

## First value

A visitor reaches first value when they either:

1. provide enough viewer context to receive and inspect a tailored impact view; or
2. submit one real artifact and receive a source/inference/boundary-separated impact view.

No account is required before either event.

## Referral invariant

Referral is downstream of value.

The UI may expose a share/referral action after first value. A **share action** is not a **converted referral**. A converted referral is only recorded when a new session arrives with the referral code.

Because this repository is public, the current “unlock” is a product-flow reveal, not secure access control.

## Telemetry contract

Allowed high-information events:

```text
viewer_profiled
impact_generated
artifact_submitted
artifact_completed
assumption_corrected
referral_shared
referral_converted
second_artifact_submitted
```

Allowed metadata:

```text
non-sensitive session id
role family
intent
artifact type
referral code
timestamp
route/source channel
```

Forbidden analytics fields:

```text
artifact text
resume/CV body
document body
pasted free text
problem free text
image bytes
credentials
API keys
personal identifiers extracted from artifacts
```

## Model boundary

The LLM may:

- interpret;
- summarize bounded source text;
- map a supplied viewer to plausible workflows;
- suggest consequence pathways;
- produce presentation variants.

The LLM may not own:

- proof level;
- claim authority;
- telemetry policy;
- access control;
- deterministic route state;
- referral conversion truth;
- source existence;
- production/adoption/economic claims.

## Deliberately out of scope

- agent swarms;
- autonomous company research;
- autonomous outreach;
- arbitrary private-system integrations;
- CRM writes;
- account system before first value;
- vector database unless retrieval evidence requires it;
- generalized knowledge-graph UI;
- automatic ROI estimates;
- production claims inferred from architecture.

## Validation ladder

```text
recognition
→ viewer context supplied
→ tailored view generated
→ assumption corrected / accepted
→ proof opened
→ real artifact submitted
→ artifact view completed
→ next action selected
→ return
→ second artifact
→ share
→ converted referral
→ willingness to pay / hire / collaborate
→ embedded use
```

Clicks and compliments are weak evidence. Repeated real use, correction, changed action, referral conversion, and commitment are stronger.

## Kill / narrow conditions

Narrow or stop the generalized claim if:

- users cannot understand the tailored view faster than the raw portfolio;
- corrections do not improve relevance;
- arbitrary artifact parsing repeatedly fails;
- model output requires more correction than manual framing;
- users do not submit real artifacts;
- generated views do not change what evidence they inspect or what action they take;
- repeated use does not emerge;
- the system is only a nicer summarizer.

## Current target state

A cold visitor can:

1. identify themselves;
2. receive a relevant view of Taha's work;
3. inspect the exact evidence boundary;
4. correct the lens;
5. submit one artifact of their own;
6. receive a second bounded impact view;
7. share/referral after value.

That vertical slice must work before broader integrations are justified.
