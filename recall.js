(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  const tierRank = { external_judgment: 0, headline: 1, supporting: 2 };
  const stop = new Set(["the","and","for","with","from","into","that","this","your","our","you","are","was","were","have","has","had","but","not","all","any","can","will","need","needs","role","work"]);

  const expansions = {
    sales:["commercial","gtm","outbound","lead","prospect","buyer","revenue","pipeline","conversion"],
    commission:["sales","commercial","revenue","outbound","buyer","prospect"],
    outbound:["prospect","lead","sales","gtm","recruiting","commercial"],
    prospecting:["outbound","lead","sales","account research","qualification"],
    recruiting:["recruitment","talent","hr","lead generation","outbound"],
    recruitment:["recruiting","talent","hr","lead generation","outbound"],
    driver:["recruitment","recruiting","outbound","commercial"],
    gt m:["sales","growth","revops","commercial"],
    gtm:["sales","growth","revops","commercial","signals","qualification"],
    growth:["gtm","sales","conversion","revenue"],
    agent:["ai","llm","workflow","reliability","tool","mcp","verification","recovery"],
    agents:["agent","ai","llm","workflow","reliability","verification","recovery"],
    reliability:["verification","recovery","failure","state","guardrail","incident"],
    backend:["api","python","service","database","integration","deployment"],
    api:["integration","backend","service","tool"],
    integration:["api","workflow","backend","tool"],
    deployment:["deploy","ci","docker","release"],
    fullstack:["frontend","backend","api","web","typescript","python"],
    "full-stack":["frontend","backend","api","web","typescript","python"]
  };

  const directOverrides = {
    "recruitment-lead-gen": "/proof/commercial-field-run"
  };

  const state = { items: [], error: "" };

  function words(text = "") {
    return text.toLowerCase().split(/[^a-z0-9+#.-]+/).map(x => x.trim()).filter(x => x.length > 2 && !stop.has(x));
  }

  function expand(query = "") {
    const original = [...new Set(words(query))];
    const expanded = new Set(original);
    for (const token of original) {
      for (const e of expansions[token] || []) words(e).forEach(x => expanded.add(x));
    }
    return { original, all: [...expanded] };
  }

  function normalize(raw) {
    const out = [];
    const add = (x, tier) => {
      if (!x?.id) return;
      out.push({
        id: x.id,
        name: x.name || x.id,
        tier,
        proof: x.proof_level || "P1",
        href: directOverrides[x.id] || x.proof_surface || x.receipt || x.repo || x.surface || x.source || x.external_response || "",
        sourceHref: x.proof_surface || x.receipt || x.repo || x.surface || x.source || x.external_response || "",
        actors: x.actors || [],
        mechanism: x.mechanism || "",
        verified: x.verified_now || x.deployment_verification || x.external_response || x.receipt || "Inspectable artifact exists.",
        boundary: x.claim_boundary || "Do not upgrade this artifact into an outcome claim."
      });
    };
    (raw.external_judgment || []).forEach(x => add(x, "external_judgment"));
    (raw.headline || []).forEach(x => add(x, "headline"));
    (raw.supporting || []).forEach(x => add(x, "supporting"));
    return out;
  }

  async function load() {
    try {
      const res = await fetch("/ARTIFACT_REGISTRY.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`Registry returned ${res.status}`);
      state.items = normalize(await res.json());
      if (!state.items.length) throw new Error("Registry contained no public evidence.");
    } catch (e) {
      state.error = e?.message || "Evidence registry unavailable.";
    }
  }

  function fieldScore(text, token, weight) {
    return String(text || "").toLowerCase().includes(token) ? weight : 0;
  }

  function score(item, query) {
    const { original, all } = expand(query);
    const phrase = query.trim().toLowerCase();
    let total = 0;
    const reasons = [];
    const hayName = `${item.id} ${item.name}`.toLowerCase();
    const hayActors = item.actors.join(" ").toLowerCase();
    const hayMechanism = item.mechanism.toLowerCase();
    const hayVerified = item.verified.toLowerCase();

    if (phrase.length > 3 && hayName.includes(phrase)) {
      total += 30;
      reasons.push("exact name/id phrase +30");
    }

    for (const token of all) {
      const exact = original.includes(token);
      const multiplier = exact ? 1 : 0.55;
      const matches = [];
      const name = fieldScore(hayName, token, 9 * multiplier);
      const actor = fieldScore(hayActors, token, 7 * multiplier);
      const mechanism = fieldScore(hayMechanism, token, 4 * multiplier);
      const verified = fieldScore(hayVerified, token, 2 * multiplier);
      if (name) matches.push(`name/id ${name.toFixed(1)}`);
      if (actor) matches.push(`actor ${actor.toFixed(1)}`);
      if (mechanism) matches.push(`mechanism ${mechanism.toFixed(1)}`);
      if (verified) matches.push(`receipt ${verified.toFixed(1)}`);
      const add = name + actor + mechanism + verified;
      if (add) {
        total += add;
        reasons.push(`${exact ? token : `${token} (rule expansion)`}: ${matches.join(", ")}`);
      }
    }

    if (total > 0) {
      if (item.tier === "external_judgment") total += 2;
      else if (item.tier === "headline") total += 1;
    }

    return { ...item, score: Math.round(total * 10) / 10, reasons };
  }

  function resultCard(item, i) {
    const sourceLink = item.sourceHref && item.sourceHref !== item.href
      ? `<a class="btn ghost" href="${esc(item.sourceHref)}" target="_blank" rel="noreferrer">Raw source ↗</a>`
      : "";
    return `<article class="impact-card">
      <div class="rank">0${i + 1} · recall score ${item.score}</div>
      <h3>${esc(item.name)}</h3>
      <p><strong>Capability / mechanism:</strong> ${esc(item.mechanism)}</p>
      <div class="source-strip">
        <div><b>MATCHED BY RULE</b><span>${item.reasons.slice(0, 5).map(esc).join(" · ")}</span></div>
        <div><b>RECEIPT</b><span>${esc(item.verified)}</span></div>
        <div><b>BOUNDARY</b><span>${esc(item.boundary)}</span></div>
      </div>
      <div class="actions">
        ${item.href ? `<a class="btn primary" href="${esc(item.href)}" ${item.href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}>Inspect evidence →</a>` : ""}
        ${sourceLink}
      </div>
    </article>`;
  }

  function run(query, push = true) {
    const q = String(query || "").trim();
    if (!q) return;
    const ranked = state.items.map(x => score(x, q)).filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || (tierRank[a.tier] ?? 9) - (tierRank[b.tier] ?? 9) || a.name.localeCompare(b.name));
    const top = ranked.slice(0, 6);
    $("#recall-summary").innerHTML = `<p class="eyebrow">Rule-based recall</p><h2>${top.length ? `${top.length} inspectable matches` : "No evidence matched"}</h2><p class="lead">Query: <strong>${esc(q)}</strong></p><p class="micro">The engine searched ${state.items.length} public evidence items. Expanded terms are fixed synonyms, not model inference.</p>`;
    $("#recall-results").innerHTML = top.length
      ? top.map(resultCard).join("")
      : `<div class="callout"><h3>No proof was recalled.</h3><p class="micro">That means the checked-in evidence corpus does not currently support this query under the visible rules. Change the query or add a verified receipt to the registry.</p></div>`;
    if (push) {
      const url = new URL(location.href);
      url.searchParams.set("q", q);
      history.replaceState(null, "", url.pathname + url.search);
    }
  }

  async function boot() {
    await load();
    if (state.error) {
      $("#recall-summary").innerHTML = `<p class="eyebrow">Registry unavailable</p><h2>Recall cannot run without evidence.</h2><p class="error">${esc(state.error)}</p>`;
      return;
    }
    $("#run-recall")?.addEventListener("click", () => run($("#recall-query")?.value || ""));
    $("#recall-query")?.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(e.currentTarget.value);
    });
    document.querySelectorAll(".recall-example").forEach(btn => btn.addEventListener("click", () => {
      $("#recall-query").value = btn.dataset.q || "";
      run(btn.dataset.q || "");
    }));
    const initial = new URLSearchParams(location.search).get("q") || "";
    if (initial) {
      $("#recall-query").value = initial;
      run(initial, false);
    }
  }

  boot();
})();
