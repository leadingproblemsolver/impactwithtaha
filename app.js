(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (v = "") => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const now = () => new Date().toISOString();
  const SESSION_KEY = "impact_lens_session_v1";
  const EVENT_KEY = "impact_lens_events_v1";
  const UNLOCK_KEY = "impact_lens_starter_unlocked_v1";

  const roleFamilies = {
    founder: ["founder","ceo","cofounder","chief executive","owner","entrepreneur"],
    gtm: ["gtm","growth","sales","revops","revenue","business development","marketing","commercial","account executive"],
    engineering: ["engineer","developer","cto","technical","devops","sre","platform","software","data engineer","ai engineer"],
    product: ["product","operations","strategy","founder's associate","chief of staff","program","implementation"],
    recruiting: ["recruiter","talent","hiring","people","hr"],
    practitioner: ["student","researcher","analyst","consultant","freelancer","independent","designer"]
  };

  const intentLabels = {
    hiring: "Hiring / evaluating",
    buying: "Buying / client need",
    collaborating: "Collaborating",
    applying: "Applying this to my work",
    exploring: "Exploring"
  };

  const artifacts = [
    {
      id:"signalops",
      name:"SignalOps + Market Intelligence Pipeline",
      proof:"P2 · reproducible technical proof",
      href:"https://github.com/leadingproblemsolver/signalops-workbench",
      tags:["gtm","founder","product","engineering","signals","market","crm","prioritization","research","sales"],
      mechanism:"Separates observed signals from interpretation, scores relevance deterministically, preserves provenance and produces restartable next-action / CRM-ready handoff state.",
      workflows:["market sensing","account research","lead prioritization","handoff discipline"],
      impacts:["less attention spent on low-value signals","clearer prioritization rationale","more inspectable handoffs"],
      evidence:"Inspectable repository behavior and deterministic ranking/state contracts.",
      boundary:"Does not prove live CRM automation, production-scale provider reliability, meetings, pipeline or revenue."
    },
    {
      id:"driftguard",
      name:"DriftGuard",
      proof:"P2 · reproducible technical proof",
      href:"https://github.com/leadingproblemsolver/driftguard",
      tags:["engineering","founder","product","ai","agent","reliability","state","verification","safety"],
      mechanism:"Applies deterministic settlement gates around long-running AI/agent sessions so missing or contradictory proof cannot silently become a pass.",
      workflows:["AI workflow reliability","release gating","session settlement","failure containment"],
      impacts:["fewer unsupported passes","clearer failure boundaries","more inspectable AI-assisted execution"],
      evidence:"Recorded release and judgment checks plus a bounded benchmark preserved in the proof registry.",
      boundary:"Does not prove prevented production incidents, external adoption or ROI."
    },
    {
      id:"ulomis",
      name:"Ulomis Continuity Companion",
      proof:"P3 · deployed / pilot-ready surface",
      href:"https://github.com/leadingproblemsolver/ulomis-continuity-companion",
      tags:["product","founder","practitioner","context","continuity","workflow","state","human ai","operations"],
      mechanism:"Reconstructs a bounded operational state from fragmented evidence while keeping source, uncertainty, commitments, unresolved items and correction visible.",
      workflows:["work re-entry","context recovery","handoffs","decision continuity"],
      impacts:["less reconstruction before resuming work","fewer hidden unresolved loops","better correction and provenance boundaries"],
      evidence:"User-side invariants, validation protocol and continuity implementation exist and are inspectable.",
      boundary:"Measured re-entry reduction, repeated use, durable multi-device memory and compounding learning remain unproven."
    },
    {
      id:"tracecrumb",
      name:"TraceCrumb First-60",
      proof:"P3 · deployed product surface",
      href:"https://tracecrumb.netlify.app/",
      tags:["engineering","product","incident","debugging","reliability","support","sre"],
      mechanism:"Turns a live symptom plus prior incident memory into a bounded first diagnostic branch with fallback and graph-domain behavior.",
      workflows:["incident triage","first diagnostic action","operational memory"],
      impacts:["faster orientation to a bounded first branch","less repeated incident reconstruction","inspectable diagnostic rationale"],
      evidence:"Deployed surface plus static and graph/domain test evidence in the public proof room.",
      boundary:"No MTTR or first-action improvement is claimed without external operator outcome data."
    },
    {
      id:"specgate",
      name:"Project Specification Compiler / SpecGate",
      proof:"P2 · reproducible technical proof",
      href:"https://github.com/leadingproblemsolver/project-spec-compiler",
      tags:["engineering","product","founder","spec","requirements","acceptance","release","scope"],
      mechanism:"Compiles ambiguous project intent into explicit sections, status vocabulary, equality checks, path warnings and deterministic validation reports.",
      workflows:["project definition","engineering handoff","scope control","release readiness"],
      impacts:["less ambiguity before implementation","clearer acceptance gates","lower risk of silent scope drift"],
      evidence:"Reproducible CLI/system validation contracts.",
      boundary:"Does not prove organization-level time savings until repeated before/after usage exists."
    },
    {
      id:"pathmeter",
      name:"Pathmeter",
      proof:"P2 · reproducible technical proof",
      href:"https://github.com/leadingproblemsolver/pathmeter",
      tags:["engineering","product","founder","delivery","developer productivity","measurement","shipping"],
      mechanism:"Records delivery milestones and validation gates so failed work cannot be reported as shipped and recurring bottleneck stages remain visible.",
      workflows:["software delivery","cycle-time instrumentation","release verification"],
      impacts:["more truthful shipping state","better visibility into recurring bottlenecks","clearer automation targets"],
      evidence:"Inspectable local-first CLI behavior and validation gates.",
      boundary:"Does not yet prove sustained cycle-time improvement across repeated real delivery cycles."
    },
    {
      id:"commercial",
      name:"Commercial Systems Field Experiment",
      proof:"P4 · external interaction",
      href:"https://gtm-attempt.netlify.app/",
      tags:["gtm","founder","buying","recruiting","sales","commercial","diagnostic","market"],
      mechanism:"Moves from account evidence to constraint hypothesis, buyer-facing diagnostic, outreach/discovery and explicit evidence-state tracking.",
      workflows:["customer discovery","outbound","diagnostic selling","market validation"],
      impacts:["tighter problem qualification","less vague outreach","clearer path from observation to commitment"],
      evidence:"Real external execution and buyer-facing surfaces exist.",
      boundary:"Paid demand, attributable meetings/pipeline, recruiting KPI change and ROI are not yet established."
    },
    {
      id:"artifact-router",
      name:"Artifact Compiler / Evidence-to-Impact System",
      proof:"P1–P2 · productized methodology + implementation branch",
      href:"https://github.com/leadingproblemsolver/impactwithtaha",
      tags:["founder","gtm","engineering","product","recruiting","practitioner","portfolio","resume","artifact","communication","evidence"],
      mechanism:"Parses an artifact, identifies source facts versus inference, models the viewer's likely workflow ownership, then selects the smallest evidence-grounded subset that matters to that viewer.",
      workflows:["portfolio evaluation","technical communication","sales proof","career conversion","artifact externalization"],
      impacts:["less irrelevant information for the viewer","clearer mechanism-to-workflow translation","stronger claim discipline"],
      evidence:"This site is the live first vertical slice.",
      boundary:"Personalization quality, conversion lift, repeat use and cross-artifact generalization require behavioral evidence."
    }
  ];

  function getSession() {
    let s;
    try { s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch {}
    if (!s) {
      const ref = new URLSearchParams(location.search).get("ref");
      s = {id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2), created_at: now(), ref: ref || "", viewer:{}};
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
    return s;
  }

  const session = getSession();

  function saveViewer(viewer) {
    session.viewer = {...session.viewer, ...viewer};
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function safeEventMeta(extra = {}) {
    const v = session.viewer || {};
    return {
      role_family: inferRoleFamily(v.role || ""),
      intent: v.intent || "",
      company_present: Boolean(v.company),
      ref: session.ref || "",
      ...extra
    };
  }

  async function track(name, extra = {}) {
    const event = {name, at: now(), session_id: session.id, ...safeEventMeta(extra)};
    try {
      const events = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]");
      events.push(event);
      localStorage.setItem(EVENT_KEY, JSON.stringify(events.slice(-80)));
    } catch {}
    const highValue = new Set(["viewer_profiled","impact_generated","artifact_submitted","artifact_completed","assumption_corrected","referral_shared","referral_converted","second_artifact_submitted"]);
    if (!highValue.has(name)) return;
    try {
      const payload = new URLSearchParams({
        "form-name":"impact-lens-event",
        "event":name,
        "session_id":session.id,
        "role_family":event.role_family || "",
        "intent":event.intent || "",
        "artifact_type":event.artifact_type || "",
        "ref":event.ref || "",
        "at":event.at
      });
      fetch("/", {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:payload.toString(), keepalive:true});
    } catch {}
  }

  function inferRoleFamily(role = "") {
    const r = role.toLowerCase();
    let best = "practitioner", bestScore = 0;
    Object.entries(roleFamilies).forEach(([family, words]) => {
      const score = words.reduce((n,w) => n + (r.includes(w) ? 1 : 0), 0);
      if (score > bestScore) {best = family; bestScore = score;}
    });
    return bestScore ? best : "practitioner";
  }

  function viewerFromForm() {
    const role = ($("#role")?.value || "").trim();
    const company = $("#company-enabled")?.checked ? ($("#company")?.value || "").trim() : "";
    const problem = ($("#problem")?.value || "").trim();
    const activeIntent = $(".choice.intent.active")?.dataset.value || "exploring";
    return {role, company, problem, intent:activeIntent, family:inferRoleFamily(role)};
  }

  const familyKpis = {
    founder:["execution speed","decision quality","market learning","operating leverage"],
    gtm:["qualified pipeline","research efficiency","handoff quality","conversion learning"],
    engineering:["reliability","debugging time","release confidence","system clarity"],
    product:["time-to-value","workflow completion","adoption evidence","decision clarity"],
    recruiting:["evaluation signal","time-to-screen","role fit","proof quality"],
    practitioner:["learning transfer","workflow friction","reusability","decision quality"]
  };

  function scoreArtifact(a, viewer) {
    const hay = [viewer.role, viewer.company, viewer.problem, viewer.intent, viewer.family].join(" ").toLowerCase();
    let score = 0;
    a.tags.forEach(tag => { if (hay.includes(tag)) score += 3; });
    if (a.tags.includes(viewer.family)) score += 5;
    if (viewer.intent === "hiring" && ["artifact-router","driftguard","signalops","specgate","ulomis"].includes(a.id)) score += 3;
    if (viewer.intent === "buying" && ["commercial","signalops","artifact-router","ulomis"].includes(a.id)) score += 3;
    if (viewer.intent === "collaborating" && ["artifact-router","ulomis","signalops"].includes(a.id)) score += 3;
    if (viewer.problem) {
      const p = viewer.problem.toLowerCase();
      [...a.tags,...a.workflows].forEach(term => { if (p.includes(term)) score += 2; });
    }
    return score;
  }

  function topArtifacts(viewer, n=3) {
    return [...artifacts]
      .map(a => ({...a, score:scoreArtifact(a,viewer)}))
      .sort((a,b) => b.score-a.score || a.name.localeCompare(b.name))
      .slice(0,n);
  }

  function relationshipLabel(viewer) {
    return {
      hiring:"employer / evaluator",
      buying:"buyer / client",
      collaborating:"collaborator",
      applying:"practitioner",
      exploring:"professional explorer"
    }[viewer.intent] || "professional";
  }

  function impactCard(a, viewer, i) {
    const kpis = familyKpis[viewer.family] || familyKpis.practitioner;
    const workflow = a.workflows[0];
    const immediate = a.impacts[0];
    const downstream = a.impacts[1] || a.impacts[0];
    return `<article class="impact-card">
      <div class="rank">0${i+1} · ${esc(workflow)}</div>
      <h3>${esc(a.name)}</h3>
      <p><strong>Why this may matter to you:</strong> ${esc(a.mechanism)}</p>
      <div class="kpis">${kpis.slice(0,3).map(k=>`<span class="chip">${esc(k)}</span>`).join("")}</div>
      <p class="micro"><strong>Immediate mechanism:</strong> ${esc(immediate)}.</p>
      <p class="micro"><strong>Possible downstream:</strong> ${esc(downstream)}. This is a pathway, not a measured outcome.</p>
      <div class="evidence"><strong>${esc(a.proof)}</strong><br>${esc(a.evidence)}<br><span class="chip warn">Boundary</span> ${esc(a.boundary)}</div>
      <div class="actions"><a class="btn ghost" href="${esc(a.href)}" target="_blank" rel="noreferrer">Inspect evidence ↗</a></div>
    </article>`;
  }

  function renderTailored(viewer) {
    const result = $("#tailored-result");
    if (!result) return;
    saveViewer(viewer);
    const role = viewer.role || "professional";
    const company = viewer.company ? ` at ${viewer.company}` : "";
    const picks = topArtifacts(viewer);
    const assumption = `${relationshipLabel(viewer)} · ${viewer.family}`;
    result.innerHTML = `
      <div class="result-head">
        <div>
          <p class="eyebrow">Tailored impact view</p>
          <h2>For a ${esc(role)}${esc(company)}, these three parts matter most.</h2>
          <p class="micro">Inferred lens: <strong>${esc(assumption)}</strong>. You can correct this; source evidence and inferred impact are kept separate.</p>
        </div>
      </div>
      <div class="result-stack">${picks.map((a,i)=>impactCard(a,viewer,i)).join("")}</div>
      <div class="callout" style="margin-top:14px">
        <h3>Wrong lens?</h3>
        <p class="micro">Correction is a state transition, not feedback theater. Change your role, intent or workflow and regenerate.</p>
        <button class="btn" id="correct-assumption">Correct assumptions</button>
      </div>`;
    track("impact_generated");
    $("#correct-assumption")?.addEventListener("click", () => {
      $("#role")?.focus();
      track("assumption_corrected");
      scrollTo({top:$("#lens-form").getBoundingClientRect().top + scrollY - 80, behavior:"smooth"});
    });
  }

  function lensMarkup() {
    const v = session.viewer || {};
    return `<header class="hero compact">
      <p class="eyebrow">Contextual impact infrastructure</p>
      <h1>Don't browse my work. Make it answer to your reality.</h1>
      <p class="lead">Tell me who you are. I’ll route only the work, mechanisms and evidence most likely to touch what you own — without inventing impact that has not been proven.</p>
    </header>
    <section>
      <div class="lens-shell">
        <div class="panel" id="lens-form">
          <p class="eyebrow">Let's tailor this to you</p>
          <div class="field">
            <label for="role">Who are you?</label>
            <input id="role" autocomplete="organization-title" placeholder="e.g. GTM Engineer, CTO, Founder, Recruiter" value="${esc(v.role||"")}">
          </div>
          <div class="quick-role-row" aria-label="Quick role examples">
            ${["Founder","GTM / RevOps","Engineering","Product / Ops","Recruiting"].map(x=>`<button class="choice quick-role" type="button">${x}</button>`).join("")}
          </div>
          <label class="inline-toggle"><input id="company-enabled" type="checkbox" ${v.company?"checked":""}> I represent or work at a company</label>
          <div class="field ${v.company?"":"hidden"}" id="company-field">
            <label for="company">Company or domain</label>
            <input id="company" autocomplete="organization" placeholder="e.g. Linear or linear.app" value="${esc(v.company||"")}">
          </div>
          <div class="field">
            <label>Why are you here?</label>
            <div class="intent-row">
              ${Object.entries(intentLabels).map(([k,label])=>`<button type="button" class="choice intent ${(v.intent||"exploring")===k?"active":""}" data-value="${k}">${label}</button>`).join("")}
            </div>
          </div>
          <div class="field">
            <label for="problem">What are you trying to improve? <span class="micro">(optional)</span></label>
            <textarea id="problem" placeholder="One workflow, bottleneck, KPI, or constraint.">${esc(v.problem||"")}</textarea>
          </div>
          <button class="btn primary" id="generate-view">Make this relevant to me →</button>
          <p class="micro" style="margin-top:10px">No signup before value. Your free text stays in your browser unless you explicitly analyze an artifact with the server model.</p>
        </div>
        <div class="panel" id="tailored-result">
          <p class="eyebrow">Before personalization</p>
          <h2>Work means different things depending on who is looking.</h2>
          <p class="lead">A founder, engineering manager, recruiter and buyer should not receive the same project grid. This engine compiles the same evidence into different, claim-bounded views.</p>
          <div class="source-strip">
            <div><b>SOURCE</b><span>What exists / what was observed</span></div>
            <div><b>INFERENCE</b><span>Why it may matter to your workflow</span></div>
            <div><b>BOUNDARY</b><span>What remains unproven</span></div>
          </div>
        </div>
      </div>
    </section>
    ${artifactWorkbenchMarkup()}`;
  }

  function artifactWorkbenchMarkup() {
    return `<section id="artifact-workbench">
      <p class="eyebrow">Run the engine on your work</p>
      <h2>This page is itself the product demo.</h2>
      <p class="lead">Give it a website, CV, repo, document, Markdown, text, structured file or image. The smallest useful path runs locally where possible; server/LLM analysis is optional and explicit.</p>
      <div class="grid">
        <div class="card">
          <h3>Paste a URL</h3>
          <div class="field"><label for="artifact-url">Website or public GitHub URL</label><input id="artifact-url" placeholder="https://..."></div>
          <button class="btn primary" id="analyze-url">Analyze URL</button>
          <p class="micro">URL retrieval uses the server boundary because browser CORS is unreliable. Private-network URLs are rejected.</p>
        </div>
        <div class="card">
          <h3>Upload an artifact</h3>
          <div class="dropzone" id="dropzone">
            <div class="file-row"><input id="artifact-file" type="file" accept=".txt,.md,.markdown,.json,.yaml,.yml,.csv,.html,.htm,.pdf,.docx,image/png,image/jpeg,image/webp"></div>
            <p class="micro">Local-first: TXT · MD · JSON · YAML · CSV · HTML · PDF · DOCX. Images can use the optional vision path.</p>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:15px">
        <h3>Or paste anything</h3>
        <div class="field"><textarea id="artifact-paste" placeholder="Resume text, job description, README, project brief, proposal, notes..."></textarea></div>
        <button class="btn" id="analyze-paste">Analyze pasted artifact</button>
      </div>
      <div class="progress" id="artifact-progress"></div>
      <div id="artifact-result"></div>
    </section>
    <section>
      <div class="grid">
        <div>
          <p class="eyebrow">Propagation</p>
          <h2>Use the protocol, not just the page.</h2>
          <p class="lead">After first value, share a referral link to reveal the implementation guide in the interface. The repository is public, so this is a workflow gate rather than access control.</p>
        </div>
        <div class="panel">
          <div class="copybox"><input id="referral-link" readonly value="${esc(referralUrl())}"><button class="btn" id="share-referral">Share</button></div>
          <div id="starter-unlock" style="margin-top:14px">${starterMarkup()}</div>
        </div>
      </div>
    </section>`;
  }

  function referralUrl() {
    const code = `iw-${session.id.slice(0,8)}`;
    return `${location.origin}/lens?ref=${encodeURIComponent(code)}`;
  }

  function starterMarkup() {
    const unlocked = localStorage.getItem(UNLOCK_KEY) === "true";
    return unlocked
      ? `<p class="success"><strong>Impact Lens protocol unlocked.</strong></p>
         <div class="actions"><a class="btn primary" href="https://github.com/leadingproblemsolver/impactwithtaha/blob/main/IMPACT_LENS_CONTRACT.md" target="_blank" rel="noreferrer">Open invariants ↗</a><a class="btn" href="/method" data-route>See method</a></div>`
      : `<p class="micro">Share the generated referral link after you've received value. This records a share action; a real referral conversion is tracked separately when someone arrives with the code.</p>`;
  }

  function progress(msg, state="") {
    const el = $("#artifact-progress");
    if (!el) return;
    el.className = `progress show ${state}`;
    el.textContent = msg;
  }

  function artifactType(name="", mime="") {
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (mime.startsWith("image/")) return "image";
    if (ext === "pdf" || mime === "application/pdf") return "pdf";
    if (ext === "docx" || mime.includes("wordprocessingml")) return "docx";
    if (["md","markdown"].includes(ext)) return "markdown";
    if (["json","yaml","yml","csv"].includes(ext)) return ext;
    if (["html","htm"].includes(ext)) return "html";
    return "text";
  }

  async function readPdf(file) {
    const pdfjs = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({data}).promise;
    const chunks = [];
    const maxPages = Math.min(pdf.numPages, 30);
    for (let i=1; i<=maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      chunks.push(content.items.map(x=>x.str).join(" "));
    }
    return chunks.join("\n");
  }

  async function readDocx(file) {
    if (!window.mammoth) throw new Error("DOCX parser did not load. Try again or paste the text.");
    const result = await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
    return result.value || "";
  }

  function fileToDataUrl(file) {
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload=()=>resolve(r.result); r.onerror=()=>reject(r.error); r.readAsDataURL(file);
    });
  }

  async function parseFile(file) {
    const type = artifactType(file.name, file.type || "");
    progress(`Parsing ${file.name} locally…`);
    if (type === "pdf") return {type, text:await readPdf(file), name:file.name};
    if (type === "docx") return {type, text:await readDocx(file), name:file.name};
    if (type === "image") return {type, dataUrl:await fileToDataUrl(file), name:file.name};
    return {type, text:await file.text(), name:file.name};
  }

  function extractSignals(text="") {
    const clean = text.replace(/\s+/g," ").trim();
    const lower = clean.toLowerCase();
    const detected = [];
    const groups = [
      ["revenue / GTM",["revenue","sales","pipeline","crm","lead","outbound","conversion"]],
      ["engineering",["api","code","repository","github","python","typescript","software","deploy","test"]],
      ["operations",["workflow","process","handoff","operation","automation","queue","state"]],
      ["product",["user","product","feature","onboarding","retention","adoption"]],
      ["evidence",["evidence","metric","measured","test","benchmark","proven","validation"]]
    ];
    groups.forEach(([label, words])=>{ if(words.some(w=>lower.includes(w))) detected.push(label); });
    const nums = clean.match(/\b\d+(?:\.\d+)?%?\b/g)?.slice(0,8) || [];
    return {preview:clean.slice(0,900), detected, numbers:nums, length:clean.length};
  }

  function localArtifactView(text, type, sourceName) {
    const viewer = viewerFromForm();
    saveViewer(viewer);
    const sig = extractSignals(text);
    const all = topArtifacts({...viewer, problem:`${viewer.problem||""} ${sig.detected.join(" ")}`}, 3);
    return {
      mode:"deterministic",
      title:sourceName || "Submitted artifact",
      summary:sig.preview ? `Detected ${sig.detected.length ? sig.detected.join(", ") : "general professional"} signals across ${sig.length.toLocaleString()} normalized characters.` : "Artifact received, but no extractable text was found.",
      observed:[
        `Artifact type: ${type}`,
        ...(sig.detected.length ? [`Signal families: ${sig.detected.join(", ")}`] : []),
        ...(sig.numbers.length ? [`Visible numeric tokens: ${sig.numbers.join(", ")}`] : [])
      ],
      inferred:`For a ${viewer.role || "professional"}${viewer.company ? ` at ${viewer.company}`:""}, the highest-leverage communication path is to connect the artifact to owned workflows and evidence boundaries rather than summarize it generically.`,
      recommendations:all.map(a=>({
        title:a.name,
        mechanism:a.mechanism,
        impact:a.impacts[0],
        boundary:a.boundary
      }))
    };
  }

  async function callServer(payload) {
    const res = await fetch("/api/analyze", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const body = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(body.error || `Server analysis failed (${res.status}).`);
    return body;
  }

  async function analyzeTextArtifact(text, type, sourceName) {
    track("artifact_submitted",{artifact_type:type});
    const local = localArtifactView(text, type, sourceName);
    let enhanced = null;
    try {
      progress("Deterministic parse complete. Checking optional model enhancement…");
      enhanced = await callServer({
        kind:"enhance",
        viewer:viewerFromForm(),
        artifact:{type,name:sourceName,text:text.slice(0,45000)}
      });
    } catch (e) {
      enhanced = {mode:"local-only", note:e.message};
    }
    renderArtifactResult(local, enhanced);
    progress(enhanced?.analysis ? "Analysis complete." : "Local analysis complete; optional model enhancement unavailable.", "success");
    track("artifact_completed",{artifact_type:type, enhanced:Boolean(enhanced?.analysis)});
  }

  async function analyzeImageArtifact(dataUrl, sourceName) {
    track("artifact_submitted",{artifact_type:"image"});
    progress("Image received. Requesting optional vision analysis…");
    try {
      const enhanced = await callServer({kind:"image",viewer:viewerFromForm(),artifact:{type:"image",name:sourceName,dataUrl}});
      const local = localArtifactView(enhanced.sourceText || enhanced.analysis?.summary || "", "image", sourceName);
      renderArtifactResult(local, enhanced);
      progress("Image analysis complete.", "success");
      track("artifact_completed",{artifact_type:"image", enhanced:true});
    } catch (e) {
      const local = localArtifactView("", "image", sourceName);
      renderArtifactResult(local,{mode:"local-only",note:"Image metadata is available locally, but semantic image analysis requires the configured server model."});
      progress(e.message, "error");
    }
  }

  async function analyzeUrl(url) {
    if (!/^https?:\/\//i.test(url)) throw new Error("Use a full http:// or https:// URL.");
    track("artifact_submitted",{artifact_type:"url"});
    progress("Retrieving the public URL through the secure server boundary…");
    const fetched = await callServer({kind:"url",viewer:viewerFromForm(),artifact:{type:"url",url}});
    const local = localArtifactView(fetched.sourceText || "", "url", url);
    renderArtifactResult(local,fetched);
    progress("URL analysis complete.", "success");
    track("artifact_completed",{artifact_type:"url", enhanced:Boolean(fetched.analysis)});
  }

  function renderArtifactResult(local, enhanced) {
    const el = $("#artifact-result");
    if (!el) return;
    const ai = enhanced?.analysis;
    const summary = ai?.summary || local.summary;
    const observed = Array.isArray(ai?.observed) && ai.observed.length ? ai.observed : local.observed;
    const inference = ai?.inference || local.inferred;
    const recs = Array.isArray(ai?.recommendations) && ai.recommendations.length ? ai.recommendations : local.recommendations;
    const boundary = ai?.claim_boundary || "This analysis maps plausible mechanisms to workflow relevance. It does not establish adoption, ROI or causal outcome without external evidence.";
    el.innerHTML = `<div class="panel" style="margin-top:16px">
      <p class="eyebrow">Artifact impact view</p>
      <h2>${esc(local.title)}</h2>
      <p class="lead">${esc(summary)}</p>
      <div class="source-strip">
        <div><b>OBSERVED</b><span>${observed.map(esc).join(" · ") || "No extractable source facts."}</span></div>
        <div><b>INFERENCE</b><span>${esc(inference)}</span></div>
        <div><b>BOUNDARY</b><span>${esc(boundary)}</span></div>
      </div>
      <div class="result-stack">
        ${recs.slice(0,3).map((r,i)=>`<article class="impact-card"><div class="rank">0${i+1}</div><h3>${esc(r.title||"Relevant pathway")}</h3><p>${esc(r.mechanism||"")}</p><p class="micro"><strong>Workflow consequence:</strong> ${esc(r.impact||"")}</p><div class="evidence"><strong>Boundary:</strong> ${esc(r.boundary||boundary)}</div></article>`).join("")}
      </div>
      ${enhanced?.note ? `<p class="micro" style="margin-top:12px">${esc(enhanced.note)}</p>`:""}
    </div>`;
  }

  function bindLens() {
    const c = $("#company-enabled");
    c?.addEventListener("change", () => $("#company-field")?.classList.toggle("hidden", !c.checked));
    $$(".choice.intent").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".choice.intent").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
    }));
    $$(".quick-role").forEach(btn=>btn.addEventListener("click",()=>{
      const map = {"Founder":"Founder / CEO","GTM / RevOps":"GTM / RevOps leader","Engineering":"Engineering / Technical leader","Product / Ops":"Product / Operations leader","Recruiting":"Recruiter / Talent leader"};
      if ($("#role")) $("#role").value = map[btn.textContent] || btn.textContent;
    }));
    $("#generate-view")?.addEventListener("click",()=>{
      const viewer = viewerFromForm();
      renderTailored(viewer);
      track("viewer_profiled");
    });
    $("#analyze-paste")?.addEventListener("click",async()=>{
      const text = ($("#artifact-paste")?.value || "").trim();
      if (!text) return progress("Paste some artifact text first.", "error");
      try { await analyzeTextArtifact(text,"pasted-text","Pasted artifact"); } catch(e){progress(e.message,"error");}
    });
    $("#analyze-url")?.addEventListener("click",async()=>{
      const url = ($("#artifact-url")?.value || "").trim();
      if (!url) return progress("Paste a public URL first.", "error");
      try { await analyzeUrl(url); } catch(e){progress(e.message,"error");}
    });
    $("#artifact-file")?.addEventListener("change",async e=>{
      const file = e.target.files?.[0]; if(!file)return;
      try {
        const parsed = await parseFile(file);
        if(parsed.type==="image") await analyzeImageArtifact(parsed.dataUrl,parsed.name);
        else await analyzeTextArtifact(parsed.text,parsed.type,parsed.name);
      } catch(err){progress(err.message,"error");}
    });
    const dz=$("#dropzone");
    ["dragenter","dragover"].forEach(evt=>dz?.addEventListener(evt,e=>{e.preventDefault();dz.classList.add("drag")}));
    ["dragleave","drop"].forEach(evt=>dz?.addEventListener(evt,e=>{e.preventDefault();dz.classList.remove("drag")}));
    dz?.addEventListener("drop", async e=>{
      const file=e.dataTransfer.files?.[0]; if(!file)return;
      try {
        const parsed=await parseFile(file);
        if(parsed.type==="image") await analyzeImageArtifact(parsed.dataUrl,parsed.name);
        else await analyzeTextArtifact(parsed.text,parsed.type,parsed.name);
      } catch(err){progress(err.message,"error");}
    });
    $("#share-referral")?.addEventListener("click",async()=>{
      const url=referralUrl();
      try {
        if(navigator.share) await navigator.share({title:"Impact Lens",text:"Make an artifact answer to the workflow of the person viewing it.",url});
        else await navigator.clipboard.writeText(url);
        localStorage.setItem(UNLOCK_KEY,"true");
        $("#starter-unlock").innerHTML=starterMarkup();
        track("referral_shared");
      } catch(e) {
        if(e.name!=="AbortError") progress("Could not open the share action. Copy the URL manually.", "error");
      }
    });
    if (session.ref) track("referral_converted");
    if (vHasEnough(session.viewer)) renderTailored(session.viewer);
  }

  function vHasEnough(v={}) { return Boolean(v.role || v.company || v.problem); }

  const proofMap = {
    "commercial-systems": artifacts.find(x=>x.id==="commercial"),
    "driftguard": artifacts.find(x=>x.id==="driftguard"),
    "signalops": artifacts.find(x=>x.id==="signalops"),
    "tracecrumb": artifacts.find(x=>x.id==="tracecrumb"),
    "project-spec-compiler": artifacts.find(x=>x.id==="specgate"),
    "pathmeter": artifacts.find(x=>x.id==="pathmeter"),
    "ulomis": artifacts.find(x=>x.id==="ulomis"),
    "impact-lens": artifacts.find(x=>x.id==="artifact-router")
  };

  function proofPage(a) {
    if(!a) return workPage();
    return `<header class="hero"><p class="eyebrow">Case study</p><h1>${esc(a.name)}</h1><p class="lead">${esc(a.mechanism)}</p><span class="status">${esc(a.proof)}</span></header>
    <section><div class="grid"><article class="card"><h3>Mechanism</h3><p>${esc(a.mechanism)}</p><h4>Workflows</h4><p>${esc(a.workflows.join(" · "))}</p></article><article class="card"><h3>Evidence boundary</h3><p>${esc(a.evidence)}</p><p class="boundary warn">${esc(a.boundary)}</p></article></div><div class="actions"><a class="btn primary" href="${esc(a.href)}" target="_blank" rel="noreferrer">Inspect source ↗</a><a class="btn" href="/lens" data-route>Tailor to you</a></div></section>`;
  }

  function workPage() {
    return `<header class="hero"><p class="eyebrow">Selected work</p><h1>Proof before adjectives.</h1><p class="lead">The artifact registry is not the navigation. Choose a lens, or inspect exact mechanisms and boundaries.</p><div class="actions"><a class="btn primary" href="/lens" data-route>Tailor this to me</a></div></header>
      <section><div class="grid">${artifacts.map(a=>`<article class="card interactive"><span class="status">${esc(a.proof)}</span><h3>${esc(a.name)}</h3><p>${esc(a.mechanism)}</p><a class="more" href="/proof/${esc(a.id==="commercial"?"commercial-systems":a.id==="specgate"?"project-spec-compiler":a.id==="artifact-router"?"impact-lens":a.id)}" data-route>Inspect →</a></article>`).join("")}</div></section>`;
  }

  function homePage() {
    return `<header class="hero">
      <p class="eyebrow">Contextual impact infrastructure</p>
      <h1>Make the work answer to the person who matters.</h1>
      <p class="lead">This is a work site and a working product. It maps evidence to the workflows, constraints and outcomes that matter to a specific employer, buyer, collaborator or practitioner — while keeping inference and proof boundaries visible.</p>
      <div class="actions"><a class="btn primary" href="/lens" data-route>Let's tailor this to you →</a><a class="btn" href="/work" data-route>Inspect raw proof</a><a class="btn" href="/resume" data-route>Resume</a></div>
      <div class="metricrow"><div class="metric"><b>1→many</b><span>one evidence corpus, many viewer-specific views</span></div><div class="metric"><b>P1–P4</b><span>current proof range</span></div><div class="metric"><b>0</b><span>invented ROI / adoption claims</span></div><div class="metric"><b>1</b><span>live artifact-to-impact vertical slice</span></div></div>
    </header>
    <section><p class="eyebrow">The loop</p><h2>Artifact → viewer → workflow → mechanism → evidence → next action.</h2><div class="flow">source artifact
→ observed facts + provenance
→ viewer context + owned workflow
→ inelastic constraint / KPI
→ relevant mechanism only
→ immediate effect / downstream pathway
→ evidence + uncertainty + claim boundary
→ correction
→ telemetry
→ better next view</div></section>
    <section><div class="grid"><article class="card"><h3>For employers</h3><p>Role requirement → capability → mechanism → inspectable proof → ownership boundary.</p></article><article class="card"><h3>For buyers</h3><p>Workflow failure → intervention mechanism → first value → smallest deployment.</p></article><article class="card"><h3>For collaborators</h3><p>Shared frontier → complementary primitive → smallest joint experiment.</p></article><article class="card"><h3>For practitioners</h3><p>Pattern → invariants → apply to your artifact → correct → export/share.</p></article></div></section>`;
  }

  const staticPages = {
    "/execution":`<header class="hero"><p class="eyebrow">Current field experiment</p><h1>Commercial systems work in contact with reality.</h1><p class="lead">Trucking recruiting remains one proving ground for evidence → constraint → system → execution → measurement.</p><div class="actions"><a class="btn primary" href="https://gtm-attempt.netlify.app/" target="_blank" rel="noreferrer">Live fieldwork ↗</a><a class="btn" href="https://gtm-attempt.netlify.app/demo" target="_blank" rel="noreferrer">Demo ↗</a><a class="btn" href="https://gtm-attempt.netlify.app/intake" target="_blank" rel="noreferrer">Intake ↗</a></div></header><section><p class="boundary warn">External execution is real. Paid demand, attributable meetings/pipeline, recruiting KPI change and ROI remain unproven until measured.</p></section>`,
    "/proof-status":`<header class="hero"><p class="eyebrow">Claim registry</p><h1>What can be claimed today.</h1><p class="lead">The system optimizes relevance without upgrading the evidence state.</p></header><section><div class="tablewrap"><table><tr><th>Level</th><th>Meaning</th><th>Examples</th></tr><tr><td>P1</td><td>Artifact exists</td><td>methodologies / operators / docs</td></tr><tr><td>P2</td><td>Reproducible technical behavior</td><td>DriftGuard, SignalOps, Spec Compiler, Pathmeter</td></tr><tr><td>P3</td><td>Deployed / usable surface</td><td>TraceCrumb, Ulomis surfaces</td></tr><tr><td>P4</td><td>External interaction</td><td>commercial fieldwork / contributions</td></tr><tr><td>P5</td><td>Measured outcome</td><td>primary gap</td></tr><tr><td>P6</td><td>Economic outcome</td><td>primary gap</td></tr></table></div></section><section><p class="boundary">Personalization changes presentation priority, not proof level. “May affect” and “pathway to” stay distinct from “measured.”</p></section>`,
    "/method":`<header class="hero"><p class="eyebrow">Impact Lens Protocol</p><h1>Never present an artifact in isolation.</h1><p class="lead">Communication is the interface between capability and consequence.</p></header><section><div class="flow">1. establish what the artifact actually contains
2. preserve source + provenance
3. establish who is viewing
4. establish what they own
5. map only relevant mechanisms
6. connect mechanisms to observable workflow consequences
7. separate demonstrated effects from hypothesized effects
8. present the highest-leverage subset
9. allow correction
10. capture outcome and update the model</div><div class="actions"><a class="btn primary" href="https://github.com/leadingproblemsolver/impactwithtaha/blob/main/IMPACT_LENS_CONTRACT.md" target="_blank" rel="noreferrer">Full contract ↗</a><a class="btn" href="https://github.com/leadingproblemsolver/ulomis-continuity-companion" target="_blank" rel="noreferrer">Ulomis lineage ↗</a></div></section>`,
    "/resume":`<header class="hero"><p class="eyebrow">Canonical CV surface</p><h1>Taha Aslam — Commercial Systems & Full-Stack Developer.</h1><p class="lead">AI Integration · Automation · Evidence-Grounded Execution · Doha, Qatar</p><div class="actions"><a class="btn primary" href="/lens" data-route>Evaluate me in your context</a><a class="btn" href="mailto:leadingproblemsolver@gmail.com?subject=CV%20and%20evidence%20packet">Request CV packet</a><a class="btn" href="javascript:window.print()">Print / save</a></div></header><section><p class="boundary">Strongest evidence: translating ambiguous workflows into explicit state/data/decision contracts, implementing them as Python/TypeScript CLIs and web products, and keeping offline proof, deployment, external execution and measured outcomes separate.</p></section><section><div class="grid"><article class="card"><h3>Languages / data</h3><p>Python · TypeScript · JavaScript · SQL · Bash · pandas · SQLite · PostgreSQL/Supabase</p></article><article class="card"><h3>Web / integration</h3><p>React · Vite · Next.js routes · REST/JSON · Supabase Edge Functions · Redis · Docker · GitHub Actions</p></article><article class="card"><h3>Verification</h3><p>pytest/unittest · npm test · smoke/release gates · deterministic fixtures</p></article><article class="card"><h3>Education</h3><p>BSc Data Science & AI, University of Doha for Science & Technology, 2025–2029</p></article></div></section>`,
    "/start":`<header class="hero"><p class="eyebrow">Next action</p><h1>Give me a real boundary to solve.</h1><p class="lead">A repo that will not ship, an AI workflow needing deterministic controls, a data pipeline needing provenance, a commercial workflow needing an operating system — or an artifact that is failing to communicate its value.</p><div class="actions"><a class="btn primary" href="/lens" data-route>Run the Impact Lens</a><a class="btn" href="mailto:leadingproblemsolver@gmail.com?subject=Project%20or%20role%20inquiry">Email me</a><a class="btn" href="https://github.com/leadingproblemsolver" target="_blank" rel="noreferrer">GitHub ↗</a></div></header>`,
    "/links":`<header class="hero"><p class="eyebrow">Direct URLs</p><h1>Everything important should be shareable directly.</h1></header><section><div class="linklist"><a href="/lens" data-route>Impact Lens</a><a href="https://github.com/leadingproblemsolver/impactwithtaha" target="_blank" rel="noreferrer">ImpactWithTaha repository ↗</a><a href="https://github.com/leadingproblemsolver/ulomis-continuity-companion" target="_blank" rel="noreferrer">Ulomis Continuity Companion ↗</a><a href="https://github.com/leadingproblemsolver" target="_blank" rel="noreferrer">GitHub profile ↗</a><a href="https://gtm-attempt.netlify.app/" target="_blank" rel="noreferrer">GTM fieldwork ↗</a><a href="https://tracecrumb.netlify.app/" target="_blank" rel="noreferrer">TraceCrumb ↗</a><a href="https://github.com/leadingproblemsolver/driftguard" target="_blank" rel="noreferrer">DriftGuard ↗</a><a href="https://github.com/leadingproblemsolver/signalops-workbench" target="_blank" rel="noreferrer">SignalOps ↗</a></div></section>`
  };

  function normalizePath() {
    let p = location.pathname.replace(/\/$/,"") || "/";
    const old = {
      "/proof/driftguard.html":"/proof/driftguard",
      "/proof/signalops-market-intel.html":"/proof/signalops",
      "/proof/tracecrumb.html":"/proof/tracecrumb",
      "/proof/multi-repo-hardening.html":"/work",
      "/proof/chat-to-post.html":"/work"
    };
    if (old[p]) { history.replaceState(null,"",old[p] + location.search); p=old[p]; }
    return p;
  }

  function route() {
    const p = normalizePath();
    $$(".nav-links a").forEach(a=>a.removeAttribute("aria-current"));
    const nav = $(`.nav-links a[href="${p}"]`); if(nav) nav.setAttribute("aria-current","page");
    let html;
    if (p === "/") html = homePage();
    else if (p === "/lens") html = lensMarkup();
    else if (p === "/work") html = workPage();
    else if (p.startsWith("/proof/")) html = proofPage(proofMap[p.split("/")[2]]);
    else html = staticPages[p] || `<header class="hero"><p class="eyebrow">404</p><h1>This route does not exist.</h1><div class="actions"><a class="btn primary" href="/lens" data-route>Open Impact Lens</a><a class="btn" href="/work" data-route>Selected work</a></div></header>`;
    $("#app").innerHTML = html;
    if (p === "/lens") bindLens();
    $("#app").focus({preventScroll:true});
    track("page_view",{route:p});
  }

  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-route]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("/")) {
      e.preventDefault();
      history.pushState(null,"",href);
      route();
      scrollTo(0,0);
    }
  });
  addEventListener("popstate", route);
  route();
})();
