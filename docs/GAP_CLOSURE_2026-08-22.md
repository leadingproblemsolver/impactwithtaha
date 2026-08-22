# Gap Closure Log — 2026-08-22

This is the canonical evidence-state snapshot for the week-ending closure sweep.

Evidence rule: a stronger state replaces a weaker one only when an external or independently inspectable receipt exists. `READY`, `PACKAGED`, `PLANNED`, or `COULD DEPLOY` are not outcome evidence.

## Closed today

### Project Spec Compiler — CI defect closed and role-proof compiler merged

- Prior state: PR #1 (`Compile live role descriptions into proof targets`) was mergeable but CI failed during `pytest -q` because `tests/test_compiler.py` imported external `yaml` while the package deliberately uses its vendored YAML implementation and declares no runtime dependencies.
- Root-cause fix: tests now import `project_spec._vendor.yaml`; no unnecessary runtime dependency was introduced.
- Verification: GitHub Actions CI run #8 passed on commit `1740920cca150f42bb0675f7c8102fc33625a1b8`.
- Finalization: PR #1 squash-merged; canonical merge SHA `e739a484860408d746c19207b613f8e8b96d8715`.
- What this now proves: live employer requirements can be preserved as exact source excerpts, normalized into operator-controlled capability labels, mapped to bounded current evidence, missing proof, and smallest next external receipt.
- What it does not prove: eligibility, resume truth, experience, or capability satisfaction without explicit evidence.

### Reality Handoff — judge packaging merged; live gate explicitly terminated as blocked

- PR #1 (`Judge packaging: reasoning, metrics, and P0–P4 evidence standard`) is merged into `main`.
- Repository evidence remains: 55/55 deterministic/unit/API/frontend-contract tests, Python compile PASS, JavaScript syntax PASS, secret scan PASS.
- Live P0–P4 requires all three external inputs: a real `DATAHUB_GMS_URL`, fresh `DATAHUB_GMS_TOKEN`, and exact non-sensitive `DEMO_TARGET_URN`.
- Reachable account state contained DataHub account/community activity but no safe fresh PAT + exact target URN combination.
- Correct state: `OFFLINE_VALIDATED / LIVE_BLOCKED_EXTERNAL_DEPENDENCY`.
- Stop rule: no further Reality Handoff implementation work until those three inputs exist. Never commit PAT or `.env`.

## External technical judgment already earned

### NousResearch / Hermes Agent #81050

External issue: `NousResearch/hermes-agent#81050`.

Contribution receipt:
- `leadingproblemsolver` proposed the stronger invariant that credential/cache artifacts must never create configuration identity; canonical server state should own identity, with subordinate token/client/meta artifacts and monotonic removal semantics.
- The issue author explicitly replied: `Thanks — I agree with the invariant`, then corrected the original root-cause framing using new logs.
- The author identified the proposed `stop/retire any live connection for that generation` step as the load-bearing missing behavior and strengthened the regression test around remove-during-reconnect.

Evidence state: `EXTERNAL_TECHNICAL_JUDGMENT_RECEIPT`.

Safe claim: an externally owned production bug report materially changed its technical framing after the proposed invariant/reconciliation model.

Do not claim: patch merged, maintainer approval, production fix shipped, or project adoption.

### Mastra #15734

External issue: `mastra-ai/mastra#15734`, specialist-owned workflow suspend/resume loses continuation identity.

Contribution receipt:
- The durable-continuation invariant was expressed as preserving specialist thread identity, workflow run identity, exactly-once suspension consumption, and no replay of work before the suspend point.
- Mastra factory triage classifies the issue as a high-severity, high-confidence `@mastra/core` bug and recommends a core fix that persists/restores specialist continuation identity with workflow-level coverage.

Evidence state: `EXTERNAL_TECHNICAL_VALIDATION / TRIAGE_ALIGNMENT`.

Do not claim: personal patch ownership or maintainer merge unless a later PR receipt exists.

## Browser Use #5252 — deprioritized, not abandoned

Issue #5252 remains a real MCP protocol correctness problem, but multiple overlapping PRs already exist (#5253, #5256, #5258, #5269, #5346 and later MCP compatibility work). A duplicate patch now has low marginal signal.

Current decision: `DO_NOT_DUPLICATE_PATCH`.

Re-open only if:
1. maintainers request a specific unresolved regression,
2. the existing PRs miss a distinct protocol invariant we can reproduce, or
3. current main still has an uncovered failure after those patches settle.

## Ulomis — bounded harness repair committed; verification still pending

Prior browser-proof run reached build/startup successfully but failed at Playwright strict-mode locator resolution: exact next-action text resolved to two elements.

Fix committed on `agent/ulomis-acquisition-proof`:
- commit `72b20b37f62ee67c7f700cdc917faa8d3168b6e5`
- proof helper now scopes to the first relevant heading/section and asserts visible exact evidence rather than requiring global text uniqueness.

Current state: `IMPLEMENTATION_PATCHED / BROWSER_VERIFY_PENDING`.

Promotion gate:
- GitHub Actions browser proof must pass for desktop 1280x800, mobile 390x844, and mobile 320x700;
- no horizontal overflow;
- continuity packet, decision, open loop, next action visible;
- `real_thread_first_value_completed` telemetry emitted;
- screenshots + `proof/browser/results.json` uploaded.

Only after that may state become `BROWSER_VERIFIED`. External acquisition/user use remains separate and still unproven.

## Outbound integrity audit

Reviewed five recent high-signal sends.

Matched and retained as valid external outreach receipts:
- Aemon — `The loop I want to learn at Aemon`
- SafetyKit — `The failure cases I'd want to own at SafetyKit`
- nao Labs — `The part of nao I genuinely want to work on`
- Dex / ThirdLayer — `The compounding layer I want to own at Dex`

Failed send / excluded from quality denominator:
- sent to `jeremy@venu3d.com` with subject `David Speaking On AI Risk Panel in SF`, body written as Jeremy inviting David/SafetyKit. Recipient, sender identity, company and message context were cross-wired.

Permanent pre-send invariant:

```text
recipient_email
= intended_person
= intended_company
= intended_role/problem
= body salutation/context
= attached proof target
```

If any field mismatches: `BLOCK_SEND`.

## SignalOps — technical proof is real; consequence proof remains open

Current canonical real-corpus receipt:
- 20 public LangChain issue surfaces processed;
- 20 durable events;
- 19 `public_reply`, 1 `save`;
- private escalation correctly blocked without a prior public response.

This proves bounded ingestion/ranking/policy behavior against a real public corpus. It does not prove commercial value, maintainer response, user adoption, CRM integration, meetings, pipeline or revenue.

Next irreversible gate: one SignalOps-ranked surface must cause a real human action and preserve the external response/non-response receipt. No more architecture work before this.

## Commercial / market proof — still open

Canonical paid/adoption outcome is still absent.

Next valid experiment must be a controlled cohort, not another broad send batch:
- one ICP;
- one offer;
- one message;
- one CTA;
- one time window;
- 10–15 qualified contacts;
- denominator preserved;
- at least 3 primary observations;
- at least 3 scarce-resource commitment asks;
- classify paid diagnostic / pilot / explicit rejection / no-response.

The Driver Recruiting / Operational Constraint Diagnostic remains the most advanced bounded service wedge. Do not expand the six-product queue before this experiment settles.

## Application / hiring proof — current evidence and next gate

Externalized application surfaces already exist for SafetyKit, nao Labs, Automation/Integration/Solutions roles, and Dex-oriented proof. The proof surfaces explicitly bound claims and distinguish deterministic/browser replay from live employer/customer integration.

Recent direct outreach has been sent to Aemon, SafetyKit, nao Labs and Dex/ThirdLayer. No reply was verified in the last inbox audit.

Next gate:
- formal submission status must be tracked separately from direct outreach;
- continue P0 roles only;
- each submission must contain one public proof URL + two role-specific receipts + zero fabricated claims;
- no custom project before application unless a company explicitly requests a work sample.

## Canonical priority from this snapshot

1. Verify the new Ulomis browser-proof run; if green, preserve artifact and stop building.
2. Convert SignalOps from ranking proof into one real external consequence.
3. Submit/track high-fit P0 applications using existing public proof; do not rebuild portfolio.
4. Run one controlled 10–15 contact commercial cohort.
5. Use Hermes/Mastra external technical receipts in the proof map/CV as externally judged reasoning evidence.
6. Reality Handoff stays blocked until real DataHub GMS URL + fresh PAT + exact target URN exist.
7. Browser Use #5252 stays deprioritized unless a distinct unsolved regression emerges.

## Evidence-state vocabulary

- `MERGED_VERIFIED`: code/docs merged with independently inspectable passing verification.
- `EXTERNAL_TECHNICAL_JUDGMENT_RECEIPT`: an external issue owner/maintainer materially validates or changes framing based on the contribution.
- `BROWSER_VERIFY_PENDING`: implementation/harness changed; no passing browser artifact yet.
- `LIVE_BLOCKED_EXTERNAL_DEPENDENCY`: implementation can proceed only with an externally supplied credential/instance/target.
- `REAL_CORPUS_TECHNICAL_PROOF`: system behavior exercised on real public evidence, but no downstream outcome yet.
- `OUTCOME_PROOF`: actual user/operator/buyer/employer behavior changed and receipt is preserved.

The next work item must promote one of the pending states upward. Creating another internal artifact without doing so is non-canonical work.
