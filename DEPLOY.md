# DEPLOY.md — Netlify Deployment Contract

This portfolio is a **static site**. There is no framework build step, no package install, no Functions runtime, and no required environment variables.

## Netlify — Git-based deploy settings

Fill the Netlify form as follows:

| Setting | Value |
|---|---|
| Branch to deploy | `main` |
| Base directory | **leave blank** |
| Build command | **leave blank** |
| Publish directory | `.` |
| Functions directory | **leave blank** |
| Environment variables | **none required** |

### Why

- `index.html` is already at the repository root.
- No `package.json`, build tool, or generated `dist/` directory is required.
- Netlify should publish the repository root exactly as supplied.
- There are no Netlify Functions in this package.
- The site contains no runtime secrets or environment-dependent configuration.

## Recommended Netlify flow

1. Create a new GitHub repository.
2. Put the **contents** of `taha-commercial-proof-stack-v1/` at the repository root.
3. Commit and push to `main`.
4. In Netlify choose **Add new project → Import an existing project**.
5. Connect the repository.
6. Use:
   - Branch: `main`
   - Base directory: blank
   - Build command: blank
   - Publish directory: `.`
   - Functions directory: blank
   - Environment variables: none
7. Deploy.

## Expected repository root

```text
.
├── index.html
├── README.md
├── DEPLOY.md
├── netlify.toml
├── CLAIM_REGISTRY.md
├── HANDOFF.md
├── OFFERS.json
└── proof/
    ├── multi-repo-hardening.html
    ├── driftguard.html
    ├── signalops-market-intel.html
    ├── tracecrumb.html
    └── chat-to-post.html
```

## Netlify configuration file

This package also includes `netlify.toml`:

```toml
[build]
  publish = "."
```

If Netlify reads this file, the publish directory is already defined.

## Alternative: Netlify Drop

If you use drag-and-drop deployment instead of Git integration:

1. Unzip the package.
2. Drag the `taha-commercial-proof-stack-v1` folder into Netlify Drop.
3. No build settings are required.

## Deployment acceptance gate

Before sending the live URL back to ChatGPT, verify:

- homepage loads;
- all five `View proof →` links work;
- email CTA opens correctly;
- GitHub profile link works;
- mobile layout is readable;
- no raw/private evidence is exposed.

Do **not** add environment variables or a Functions directory unless the portfolio later gains dynamic server-side behavior.
