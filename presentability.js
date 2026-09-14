(() => {
  "use strict";

  const app = () => document.querySelector("#app");

  const featured = [
    {
      kicker: "Construction planning",
      title: "Source-linked 90-day readiness handoff",
      proof: "P2 · deterministic, synthetic-only",
      body: "Transforms current activities, relationships, a previous schedule snapshot, and QA/document requirements into readiness, schedule-change, and source-linked impact outputs.",
      receipt: "34 tests passing on the current public PR head; byte-stable regression and recovery path preserved.",
      boundary: "Not yet verified against the engineer’s real P6 export or a live project.",
      href: "https://github.com/leadingproblemsolver/reality-ontology-runtime/pull/13",
      cta: "Inspect PR + receipts ↗"
    },
    {
      kicker: "Market intelligence",
      title: "SignalOps",
      proof: "P2 · real public-corpus run",
      body: "Separates observed market evidence from interpretation, applies deterministic policy, preserves provenance, and renders restartable next-action state.",
      receipt: "20 real public GitHub surfaces processed: 19 routed to public_reply, 1 to save; private escalation remained policy-gated.",
      boundary: "Does not prove maintainer response, meetings, pipeline, demand, or revenue.",
      href: "https://github.com/leadingproblemsolver/signalops-workbench",
      cta: "Inspect SignalOps ↗"
    },
    {
      kicker: "AI workflow reliability",
      title: "DriftGuard",
      proof: "P2 · reproducible control layer",
      body: "A seven-gate settlement preflight for false-idle, lost continuation, stale callbacks, checkpoint corruption, unbounded waits, and session/provider drift.",
      receipt: "A violated blocking gate deterministically forces Block; missing proof cannot become Pass.",
      boundary: "No production-incident reduction or external adoption is claimed without external outcome data.",
      href: "https://github.com/leadingproblemsolver/driftguard",
      cta: "Inspect DriftGuard ↗"
    },
    {
      kicker: "Communication infrastructure",
      title: "Impact Lens",
      proof: "P2 · working proof interface",
      body: "Compiles the same evidence differently for an employer, buyer, collaborator, or practitioner without upgrading proof levels or inventing company-specific evidence.",
      receipt: "Registry-bounded relevance, source/inference/boundary separation, artifact analysis, and deterministic fallback are implemented.",
      boundary: "Conversion lift, repeated use, and generalized relevance quality remain external tests.",
      href: "/lens",
      cta: "Run the lens →",
      internal: true
    }
  ];

  const card = (item) => `
    <article class="proof-case">
      <div class="proof-case__top">
        <span class="proof-case__kicker">${item.kicker}</span>
        <span class="proof-badge">${item.proof}</span>
      </div>
      <h3>${item.title}</h3>
      <p class="proof-case__body">${item.body}</p>
      <div class="proof-case__receipt"><b>Receipt</b><span>${item.receipt}</span></div>
      <div class="proof-case__boundary"><b>Boundary</b><span>${item.boundary}</span></div>
      <a class="proof-case__link" href="${item.href}" ${item.internal ? 'data-route' : 'target="_blank" rel="noreferrer"'}>${item.cta}</a>
    </article>`;

  function homeMarkup() {
    return `
      <header class="proof-hero">
        <div class="proof-hero__meta">
          <span>TAHA ASLAM</span>
          <span>DOHA → GLOBAL</span>
          <span>OPEN TO GTM ENGINEERING / SOLUTIONS-IMPLEMENTATION</span>
        </div>
        <p class="proof-hero__eyebrow">Operational systems for messy human + machine reality</p>
        <h1>I turn ambiguous workflows into explicit state, inspectable systems, and externally testable handoffs.</h1>
        <p class="proof-hero__lead">Commercial systems, AI workflow reliability, operational state, and sociotechnical handoffs. The pattern is consistent: observe reality, formalize the constraint, implement the smallest useful mechanism, hostile-test it, then put it in front of a real operator.</p>
        <div class="proof-hero__actions">
          <a class="btn primary" href="/lens" data-route>Evaluate me in your context →</a>
          <a class="btn" href="/work" data-route>Inspect proof</a>
          <a class="btn ghost" href="https://github.com/leadingproblemsolver" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
        <div class="signal-ledger" aria-label="Signal ledger">
          <div><strong>34</strong><span>construction tests on current public PR head</span></div>
          <div><strong>20</strong><span>real public surfaces processed in SignalOps run</span></div>
          <div><strong>7</strong><span>deterministic DriftGuard settlement gates</span></div>
          <div><strong>0</strong><span>invented adoption / ROI claims</span></div>
        </div>
      </header>

      <section class="proof-section proof-section--intro">
        <div>
          <p class="proof-section__eyebrow">The operating thesis</p>
          <h2>Reality first. State explicit. Claims bounded. External consequence next.</h2>
        </div>
        <div class="proof-spine" aria-label="Execution spine">
          <span>01 OBSERVE</span><i>→</i><span>02 FORMALIZE</span><i>→</i><span>03 IMPLEMENT</span><i>→</i><span>04 HOSTILE-TEST</span><i>→</i><span>05 EXTERNALIZE</span><i>→</i><span>06 RECEIPT</span>
        </div>
      </section>

      <section class="proof-section">
        <div class="proof-section__head">
          <div>
            <p class="proof-section__eyebrow">Selected proof</p>
            <h2>Start with mechanisms and receipts, not project names.</h2>
          </div>
          <a href="/proof-map" class="proof-text-link">Open canonical proof map →</a>
        </div>
        <div class="proof-cases">${featured.map(card).join("")}</div>
      </section>

      <section class="proof-section">
        <div class="proof-section__head">
          <div>
            <p class="proof-section__eyebrow">Where I fit</p>
            <h2>Use the same evidence differently depending on what you own.</h2>
          </div>
        </div>
        <div class="audience-grid">
          <article><span>EMPLOYER</span><h3>Can he own a messy workflow?</h3><p>Role requirement → mechanism → inspectable receipt → ownership boundary → smallest useful task.</p><a href="/lens" data-route>Evaluate role fit →</a></article>
          <article><span>OPERATOR / BUYER</span><h3>Can this reduce a real operational failure?</h3><p>Workflow failure → bounded intervention → first-value test → correction / acceptance → measured consequence.</p><a href="/start" data-route>Give me a real boundary →</a></article>
          <article><span>COLLABORATOR</span><h3>Can we falsify something useful together?</h3><p>Shared frontier → complementary primitive → minimum joint test → external receipt.</p><a href="/method" data-route>Inspect the method →</a></article>
        </div>
      </section>

      <section class="proof-section proof-now">
        <div>
          <p class="proof-section__eyebrow">Current evidence transition</p>
          <h2>Construction is waiting on one real engineer correction receipt.</h2>
          <p>The current slice is implemented, deterministically reproduced, and synthetic-tested. The next useful event is not another feature: one anonymized real planning cycle → row-level <b>ACCEPT / CORRECT / REJECT</b>.</p>
        </div>
        <div class="proof-now__actions">
          <a class="btn primary" href="https://github.com/leadingproblemsolver/reality-ontology-runtime/pull/13" target="_blank" rel="noreferrer">Inspect current PR ↗</a>
          <a class="btn" href="/proof-status" data-route>See claim boundaries</a>
        </div>
      </section>

      <section class="proof-section proof-contact">
        <p class="proof-section__eyebrow">Next move</p>
        <h2>If you own a workflow with ambiguity, stale state, weak handoffs, or unreliable AI execution, give me the smallest real boundary.</h2>
        <div class="proof-hero__actions">
          <a class="btn primary" href="mailto:leadingproblemsolver@gmail.com?subject=Real%20workflow%20boundary">Email Taha</a>
          <a class="btn" href="/resume" data-route>Resume</a>
          <a class="btn ghost" href="/links" data-route>All direct surfaces</a>
        </div>
      </section>`;
  }

  function applyPresentation() {
    const path = location.pathname.replace(/\/$/, "") || "/";
    document.body.classList.toggle("presentation-home", path === "/");
    if (path !== "/") return;
    const root = app();
    if (!root || root.querySelector(".proof-hero")) return;
    root.dataset.presentationVersion = "proof-first-v1";
    root.innerHTML = homeMarkup();
    document.title = "Taha Aslam — Operational Systems, AI Reliability & GTM Engineering";
  }

  function observeCanonicalRenderer() {
    const root = app();
    if (!root) return;
    const observer = new MutationObserver(() => {
      if ((location.pathname.replace(/\/$/, "") || "/") === "/" && !root.querySelector(".proof-hero")) {
        applyPresentation();
      }
    });
    observer.observe(root, {childList:true});
  }

  document.addEventListener("DOMContentLoaded", () => {
    observeCanonicalRenderer();
    setTimeout(applyPresentation, 0);
  });
  window.addEventListener("popstate", () => setTimeout(applyPresentation, 0));
  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest("a[data-route]");
    if (routeLink) setTimeout(applyPresentation, 0);
  });
})();