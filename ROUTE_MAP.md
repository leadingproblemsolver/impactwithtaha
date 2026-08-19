# Route map

| Route | Purpose | Next action |
|---|---|---|
| `/` | Product + portfolio positioning | Tailor the work to the visitor |
| `/lens` | Viewer tailoring + artifact workbench | Generate view → inspect proof → submit artifact |
| `/work` | Raw proof surfaces | Open exact case study or switch to Lens |
| `/execution` | Active commercial field experiment | Open GTM landing/demo/intake |
| `/proof-status` | Proven vs missing evidence | Inspect claim boundary |
| `/method` | Impact Lens Protocol | Inspect contract / Ulomis lineage |
| `/resume` | Canonical shareable CV surface | Evaluate in context / request packet |
| `/start` | Convert interest into contact/use | Run Lens / email / GitHub |
| `/links` | Direct URL registry | Open exact artifact |
| `/proof/impact-lens` | This branch as proof | Repo / Lens |
| `/proof/ulomis` | Continuity lineage | Ulomis repo |
| `/proof/commercial-systems` | GTM/commercial field experiment | Live fieldwork |
| `/proof/driftguard` | Agent reliability proof | Repository |
| `/proof/signalops` | Market/evidence pipeline proof | Repository |
| `/proof/tracecrumb` | Incident-memory product proof | Live product |
| `/proof/project-spec-compiler` | Specification-control CLI proof | Repository |
| `/proof/pathmeter` | Delivery-instrumentation CLI proof | Repository |

Netlify `_redirects` routes `/api/*` to Functions before the SPA rewrite. Direct routes and refresh remain stable without a framework server.
