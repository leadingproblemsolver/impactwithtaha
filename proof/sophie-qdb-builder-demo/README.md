# AI Tinkerers builder proof — provenance + correction + state

This is a deliberately small synthetic reproduction of the Sophie/QDB state-control contract.

Claim boundary: this proves mechanics only. It does NOT claim a real QDB run, operator use, reconciliation, referral, payment, or production reliability.

Run:
node proof/sophie-qdb-builder-demo/harness.mjs

Invariants demonstrated:
- machine output is never silently promoted to reviewed truth
- every material derived field carries source provenance
- human correction becomes authoritative without deleting the machine proposal
- duplicate replay is idempotent at the logical interaction level
- missing provenance fails closed
- downstream brief consumes reviewed state, not the raw machine proposal

Evidence class: SYNTHETIC_REPRODUCTION; REAL_EXECUTION_EVIDENCE=false.