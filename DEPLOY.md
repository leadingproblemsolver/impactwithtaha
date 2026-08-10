# Netlify Deployment Contract

This portfolio is a **static, route-aware site**. No package install, framework build, Functions runtime, or environment variables are required.

## Git-based deploy settings
- Branch: `main`
- Base directory: blank
- Build command: blank
- Publish directory: `.`
- Functions directory: blank
- Environment variables: none

`netlify.toml` sets the publish directory. `_redirects` force-rewrites every request to `index.html`, where the client router renders the requested stable URL.

## Direct-route acceptance gate
Verify in fresh tabs, including refresh:
- `/`
- `/work`
- `/execution`
- `/proof-status`
- `/method`
- `/resume`
- `/start`
- `/links`
- `/proof/commercial-systems`
- `/proof/driftguard`
- `/proof/signalops`
- `/proof/tracecrumb`
- `/proof/project-spec-compiler`
- `/proof/pathmeter`
- `/proof/multi-repo-hardening`

## User-journey gate
- Homepage makes positioning and proof status understandable in one screen.
- Every selected project is discoverable from `/work` and directly shareable.
- Every proof view has a return path and proof-boundary path.
- `/execution` exposes the live GTM landing, demo, and intake URLs.
- `/resume` works as a stable web-CV surface even without a binary download.
- `/start` provides a clear contact/next action.
- Mobile keeps navigation and primary CTAs usable.
- No unsupported client, revenue, pipeline, production, or ROI claims are introduced.

Use `PRODUCT_COMPLETENESS.md`, `CLAIM_REGISTRY.md`, and `GAPS.md` as release gates for future edits.
