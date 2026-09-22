import assert from "node:assert/strict";

const fixture = {
  evidence_class: "SYNTHETIC_REPRODUCTION",
  real_execution_evidence: false,
  interaction_id: "interaction_demo_001",
  case_id: "case_demo_001",
  source: { text: "Founder: I will send the revised financial model Friday. We have not decided whether to change pricing." },
  machine_proposal: {
    commitments: [{ id: "commitment_demo_001", actor: "founder", action: "send revised pricing model", due: "Friday", source_ref: "interaction_demo_001" }],
    decisions: [],
    unresolved: [{ text: "Whether to change pricing", source_ref: "interaction_demo_001" }]
  },
  human_review: {
    reviewer: "demo_operator",
    corrections: [{ target_id: "commitment_demo_001", field: "action", from: "send revised pricing model", to: "send revised financial model", reason: "Source says financial model, not pricing model." }]
  }
};

function requireProvenance(proposal) {
  for (const group of ["commitments", "decisions", "unresolved"]) {
    for (const item of proposal[group] ?? []) assert.ok(item.source_ref, `missing provenance: ${group}`);
  }
}

function applyReview(proposal, review) {
  const authoritative = structuredClone(proposal);
  const corrections = [];
  for (const c of review.corrections ?? []) {
    const item = authoritative.commitments.find(x => x.id === c.target_id);
    assert.ok(item, `unknown correction target: ${c.target_id}`);
    assert.equal(item[c.field], c.from, `correction precondition mismatch: ${c.target_id}`);
    item[c.field] = c.to;
    corrections.push({ ...c, reviewer: review.reviewer });
  }
  return { authoritative, corrections };
}

function logicalIngest(store, interaction) {
  if (store.has(interaction.interaction_id)) return store.get(interaction.interaction_id);
  const record = structuredClone(interaction);
  store.set(interaction.interaction_id, record);
  return record;
}

requireProvenance(fixture.machine_proposal);
const originalMachineValue = fixture.machine_proposal.commitments[0].action;
const { authoritative, corrections } = applyReview(fixture.machine_proposal, fixture.human_review);
assert.equal(fixture.machine_proposal.commitments[0].action, originalMachineValue);
assert.equal(authoritative.commitments[0].action, "send revised financial model");
assert.equal(authoritative.commitments[0].source_ref, fixture.interaction_id);

const brief = {
  case_id: fixture.case_id,
  generated_from_interaction: fixture.interaction_id,
  commitments: authoritative.commitments.map(({ action, due, source_ref }) => ({ action, due, source_ref })),
  unresolved: authoritative.unresolved
};
assert.equal(brief.commitments[0].action, "send revised financial model");

const store = new Map();
logicalIngest(store, fixture);
logicalIngest(store, fixture);
assert.equal(store.size, 1);

const hostile = structuredClone(fixture.machine_proposal);
delete hostile.commitments[0].source_ref;
assert.throws(() => requireProvenance(hostile));

const wrongTarget = structuredClone(fixture.human_review);
wrongTarget.corrections[0].target_id = "commitment_wrong_case";
assert.throws(() => applyReview(fixture.machine_proposal, wrongTarget));

console.log(JSON.stringify({
  evidence_class: fixture.evidence_class,
  real_execution_evidence: fixture.real_execution_evidence,
  interaction_id: fixture.interaction_id,
  machine_value: originalMachineValue,
  authoritative_value: authoritative.commitments[0].action,
  correction_preserved: corrections.length === 1,
  provenance_preserved: authoritative.commitments[0].source_ref === fixture.interaction_id,
  duplicate_replay_store_size: store.size,
  hostile_tests: ["missing provenance fails closed", "wrong correction target fails explicitly"],
  brief
}, null, 2));