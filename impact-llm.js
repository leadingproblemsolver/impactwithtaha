(() => {
  'use strict';

  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));

  let activeController = null;
  let requestSeq = 0;

  function sessionMeta() {
    try {
      const session = JSON.parse(localStorage.getItem('iw_session_v2') || '{}');
      return {
        session_id: session.id || '',
        role_family: '',
        intent: session.viewer?.intent || '',
        ref: session.ref || ''
      };
    } catch {
      return { session_id: '', role_family: '', intent: '', ref: '' };
    }
  }

  function track(name, extra = {}) {
    const payload = {
      name,
      at: new Date().toISOString(),
      route: location.pathname,
      ...sessionMeta(),
      ...extra
    };
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  }

  function viewer() {
    const companyOn = document.querySelector('#company-on')?.checked;
    return {
      role: (document.querySelector('#role')?.value || '').trim(),
      company: companyOn ? (document.querySelector('#company')?.value || '').trim() : '',
      intent: document.querySelector('.intent.active')?.dataset.value || 'exploring',
      problem: (document.querySelector('#problem')?.value || '').trim()
    };
  }

  function targetPayload() {
    const companyOn = document.querySelector('#company-on')?.checked;
    return {
      kind: 'tailor',
      viewer: viewer(),
      artifact: {
        type: 'target-context',
        name: 'Viewer target',
        text: (document.querySelector('#jd-text')?.value || '').trim()
      },
      sources: {
        companyUrl: companyOn ? (document.querySelector('#company-url')?.value || '').trim() : '',
        jdUrl: (document.querySelector('#jd-url')?.value || '').trim()
      }
    };
  }

  function sourceCount(payload) {
    return [
      payload.viewer.role,
      payload.viewer.company,
      payload.viewer.problem,
      payload.artifact.text,
      payload.sources.companyUrl,
      payload.sources.jdUrl
    ].filter(Boolean).length;
  }

  function ensureBox() {
    const existing = document.querySelector('#llm-tailoring');
    if (existing) return existing;
    const shell = document.querySelector('.lens-shell');
    if (!shell) return null;
    const box = document.createElement('div');
    box.id = 'llm-tailoring';
    box.className = 'panel';
    box.style.marginTop = '18px';
    shell.insertAdjacentElement('afterend', box);
    return box;
  }

  function renderLoading(box) {
    box.innerHTML = `
      <p class="eyebrow">Optional model-assisted tailoring</p>
      <h2 style="font-size:30px">Interpreting your supplied target against canonical proof…</h2>
      <p class="micro">The deterministic evidence view remains authoritative. The model may change relevance framing, never proof level.</p>`;
  }

  function renderUnavailable(box, body) {
    const statuses = Array.isArray(body?.sourceStatus) ? body.sourceStatus : [];
    const sourceNotes = statuses.map(s => s.ok
      ? `<li>${esc(s.label)} retrieved.</li>`
      : `<li>${esc(s.label)} could not be retrieved: ${esc(s.error || 'unknown error')}</li>`
    ).join('');
    box.innerHTML = `
      <p class="eyebrow">Deterministic mode retained</p>
      <h2 style="font-size:30px">Canonical evidence is still usable without the model.</h2>
      <p class="micro">${esc(body?.modelError || body?.note || 'Model enhancement is not configured.')}</p>
      ${sourceNotes ? `<ul class="micro">${sourceNotes}</ul>` : ''}`;
  }

  function renderAnalysis(box, body) {
    const analysis = body.analysis || {};
    const observed = Array.isArray(analysis.observed) ? analysis.observed.slice(0, 5) : [];
    const model = analysis.viewer_model || {};
    const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations.slice(0, 4) : [];
    const statuses = Array.isArray(body.sourceStatus) ? body.sourceStatus : [];

    const observedHtml = observed.length
      ? `<ul>${observed.map(item => `<li>${esc(item.fact || '')}${item.source_excerpt ? `<div class="micro">Source: ${esc(item.source_excerpt)}</div>` : ''}</li>`).join('')}</ul>`
      : '<p class="micro">No additional source-backed target facts were extracted.</p>';

    const viewerHtml = `
      <p><strong>Likely owned workflows:</strong> ${esc((model.owned_workflows || []).join(' · ') || 'not confidently inferred')}</p>
      <p><strong>Likely KPIs:</strong> ${esc((model.kpis || []).join(' · ') || 'not confidently inferred')}</p>
      <p><strong>Constraints:</strong> ${esc((model.constraints || []).join(' · ') || 'none extracted')}</p>
      <p class="micro">Inference confidence: ${esc(model.confidence || 'low')}</p>`;

    const recsHtml = recommendations.length
      ? recommendations.map((rec, index) => {
          const href = /^https?:\/\//i.test(rec.proof_url || '') ? rec.proof_url : '';
          return `<article class="impact-card">
            <div class="rank">0${index + 1} · model-ranked, registry-bounded</div>
            <h3>${esc(rec.title || rec.artifact_id || 'Evidence match')}</h3>
            <p>${esc(rec.impact || rec.mechanism || '')}</p>
            <p class="micro"><strong>Canonical proof:</strong> ${esc(rec.proof_level || 'unchanged')}</p>
            ${rec.evidence ? `<p class="micro"><strong>Receipt:</strong> ${esc(rec.evidence)}</p>` : ''}
            <div class="evidence"><span class="chip warn">Boundary</span> ${esc(rec.boundary || analysis.claim_boundary || 'Unproven until externally measured.')}</div>
            ${href ? `<div class="actions"><a class="btn ghost" href="${esc(href)}" target="_blank" rel="noreferrer">Inspect canonical receipt ↗</a></div>` : ''}
          </article>`;
        }).join('')
      : '<p class="micro">The model did not identify a registry-backed match strong enough to add.</p>';

    const statusHtml = statuses.length
      ? `<div class="source-strip">${statuses.map(s => `<div><b>${esc(s.label)}</b><span>${s.ok ? 'retrieved' : esc(`failed: ${s.error || 'unknown error'}`)}</span></div>`).join('')}</div>`
      : '';

    box.innerHTML = `
      <p class="eyebrow">Model-assisted tailoring · inference layer</p>
      <h2 style="font-size:30px">${esc(analysis.summary || 'Target interpreted against canonical proof.')}</h2>
      <p class="micro">Model: ${esc(body.model || 'configured model')} · proof states remain registry-owned.</p>
      ${statusHtml}
      <div class="grid" style="margin-top:16px">
        <article class="card"><h3>Observed from your target</h3>${observedHtml}</article>
        <article class="card"><h3>Viewer/workflow hypothesis</h3>${viewerHtml}<p class="boundary warn">${esc(analysis.inference || '')}</p></article>
      </div>
      <div class="result-stack">${recsHtml}</div>
      <p class="boundary warn" style="margin-top:16px"><strong>Model boundary:</strong> ${esc(analysis.claim_boundary || 'This layer may reorder relevance; it cannot create proof.')}</p>`;
  }

  async function runTailoring() {
    const payload = targetPayload();
    if (![payload.viewer.role, payload.viewer.problem, payload.artifact.text, payload.sources.companyUrl, payload.sources.jdUrl].some(Boolean)) return;

    const seq = ++requestSeq;
    if (activeController) activeController.abort();
    activeController = new AbortController();

    const box = ensureBox();
    if (!box) return;
    renderLoading(box);
    track('llm_tailoring_started', { source_count: sourceCount(payload) });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        signal: activeController.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Tailoring failed (${response.status}).`);
      if (seq !== requestSeq) return;

      if (body.analysis) {
        renderAnalysis(box, body);
        track('llm_tailoring_completed', {
          model: body.model || '',
          source_count: sourceCount(payload)
        });
      } else {
        renderUnavailable(box, body);
        track('llm_tailoring_failed', { source_count: sourceCount(payload) });
      }
    } catch (error) {
      if (error?.name === 'AbortError' || seq !== requestSeq) return;
      box.innerHTML = `
        <p class="eyebrow">Model enhancement unavailable</p>
        <h2 style="font-size:30px">Deterministic tailoring above remains intact.</h2>
        <p class="micro">${esc(error?.message || 'Model tailoring failed.')}</p>`;
      track('llm_tailoring_failed', { source_count: sourceCount(payload) });
    }
  }

  function decorate() {
    const button = document.querySelector('#generate');
    if (!button || document.querySelector('#llm-disclosure')) return;
    const note = document.createElement('p');
    note.id = 'llm-disclosure';
    note.className = 'micro';
    note.style.marginTop = '10px';
    note.textContent = 'When model enhancement is configured, Compile also sends the target context you supplied to the server-side model for an additional inference-only tailoring layer. Deterministic proof selection still works without it.';
    button.insertAdjacentElement('afterend', note);
  }

  document.addEventListener('click', event => {
    if (event.target?.closest?.('#generate')) queueMicrotask(runTailoring);
  });

  const observer = new MutationObserver(decorate);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  decorate();
})();
