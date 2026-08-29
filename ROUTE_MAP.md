# Route map

| Route | Purpose | Next action |
|---|---|---|
| `/` | Product + portfolio positioning | Tailor the work to the visitor |
| `/lens` | Viewer tailoring + artifact workbench | Generate view → inspect proof → submit artifact |
| `/work` | Canonical proof surfaces generated from `ARTIFACT_REGISTRY.json` | Open exact case study or switch to Lens |
| `/execution` | Active commercial field experiment | Open GTM landing/demo/intake |
| `/proof-status` | Proven vs missing evidence | Inspect claim boundary |
| `/method` | Impact Lens Protocol | Inspect contract / Ulomis lineage |
| `/resume` | Canonical shareable CV surface | Evaluate in context / request packet |
| `/start` | Convert interest into contact/use | Run Lens / email / GitHub |
| `/links` | Direct URL registry | Open exact artifact |
| `/proof/recruitment-lead-gen` | Recruitment lead-generation buyer proof: exact ICP → owner → evidence → sequence → tracker | Inspect sanitized proof bundle / run buyer Lens |
| `/proof/impact-lens` | Impact Lens as proof | Repo / Lens |
| `/proof/ulomis` | Continuity lineage | Ulomis repo |
| `/proof/commercial-systems` | GTM/commercial field experiment | Live fieldwork |
| `/proof/driftguard` | Agent reliability proof | Repository |
| `/proof/signalops` | Market/evidence pipeline proof | Repository |
| `/proof/tracecrumb` | Incident-memory product proof | Live product |
| `/proof/project-spec-compiler` | Specification-control CLI proof | Repository |
| `/proof/pathmeter` | Delivery-instrumentation CLI proof | Repository |

Vercel routes canonical portfolio/proof paths through the current Impact Lens runtime. Proof cards and `/proof/<id>` pages resolve from `ARTIFACT_REGISTRY.json`, so new proof families do not require a second hand-maintained UI catalog.
