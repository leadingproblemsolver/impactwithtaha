# Recruitment Lead Generation — Evidence-Gated Campaign System

## Buyer problem

A specialist recruitment firm asked for a repeatable way to keep a 100–999 employee company pipeline warm without sacrificing decision-maker quality or visibility into execution.

This proof family translates that buyer brief into one bounded operating path:

`brief → exact company gate → accountable HR/TA owner → business-email enrichment → public trigger → source-backed personalization → 3-touch email/social/email sequence → KPI tracker → recruiter handoff / Friday report`

It is **not a new product or repository**. It is a market-facing proof family inside `impactwithtaha`.

## Current evidence state

### Source-backed / artifact evidence
- 10 buyer-specific target rows were prepared on 2026-08-29.
- Each row passed the 100–999 employee gate in the enrichment snapshot used for the buyer pack.
- Each row had an HR/TA/People owner, business-email enrichment, LinkedIn route, public evidence URL, qualification reason, and 3-touch sequence in the private buyer pack.
- The tracker explicitly contains prospects added, emails sent, social touches, replies, qualified meetings, reply rate, Friday reporting, qualification gates, and Clay workflow mapping.
- Public sample data is sanitized: personal business emails and person-level profile URLs remain in the buyer attachment pack, not this public repository.

### Historical negative evidence
- 15 companies
- 20 emails sent
- 0 replies

This proves a real outbound tranche crossed an external boundary and failed to generate replies. It does **not** prove traction. The current adaptation tightens trigger gating, correct-owner resolution and multichannel sequencing in response to that failure.

### Current campaign outcomes
- 10 prospects prepared
- 0 current emails sent
- 0 current social touches
- 0 current replies
- 0 current qualified meetings

The sample is **campaign-ready subject to client desk-fit approval and final source/contact revalidation**, not a successful campaign.

## Public source revalidation — 2026-08-30

A fresh public-source check confirmed active/relevant careers evidence for Turnitin, BrightEdge, Allica Bank, Unlimit, CEX.IO, SevenRooms, Neko Health and Prodrive.

Stack Overflow's careers surface is live but currently shows no open positions, so that row is a **hold** until a fresher commercial trigger exists.

Eventbrite's supplied source remains preserved, but the exact trigger used in the August 29 pack was not independently revalidated in this pass, so it is explicitly **revalidate before launch**.

See `sample_targets.csv` for row-level gates.

## Buyer-facing artifacts

The private Freelancer bid pack contains:
- 10-row full campaign CSV with contact data and per-row copy;
- campaign tracker workbook;
- campaign sample document;
- tailored CV;
- bid text.

The public proof intentionally publishes only the sanitized sample and process/claim boundaries. This prevents a portfolio case from becoming an unnecessary public contact-data dump.

## What this demonstrates

- translation of a live buyer brief into machine- and human-checkable qualification gates;
- exact-band account selection rather than generic prospect lists;
- ownership resolution before outreach;
- enrichment and public-trigger provenance kept separate from inference;
- outreach copy constrained to supported facts and one CTA;
- shared tracker as the source for execution state and Friday reporting;
- negative evidence retained instead of rewritten as traction.

## What remains unknown

- whether the buyer accepts the sample;
- deliverability of this tranche;
- reply rate;
- meeting rate;
- whether any target uses external recruiting support;
- candidate placements;
- downstream revenue;
- comparative performance versus another targeting/message strategy.

## Proof level

**P2: buyer-specific reproducible campaign mechanism and artifact pack.**

Once this proof family is independently verified on the deployed ImpactWithTaha surface, the *public proof surface* becomes P3. That does not upgrade campaign outcomes.

## Next external receipt

The next claim-upgrading event is not another artifact. It is one of:
1. buyer accepts or materially corrects the tranche;
2. an approved tranche is actually sent and delivery/non-delivery is recorded;
3. a substantive reply/non-response comparison is recorded;
4. a qualified meeting/calendar receipt exists.

## Files

- `qualification_logic.md` — pass/fail gates.
- `workflow.md` — brief-to-handoff state transitions.
- `sample_targets.csv` — sanitized 10-row sample with current revalidation gates.
- `outreach_sequence.md` — bounded 3-touch pattern.
- `tracker_schema.md` — client-visible execution ledger.
- `evidence_boundaries.md` — observed / inferred / unknown / prohibited claims.
- `historical_seed.md` — 15 / 20 / 0 negative evidence.
- `kill_conditions.md` — conditions that stop or narrow the campaign.
