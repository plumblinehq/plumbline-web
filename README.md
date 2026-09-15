# plumbline-web

Public directory of Stellar anchor conformance. Renders what the
[`plumbline-server`](https://github.com/plumblinehq/plumbline-server) API
returns.

**Live: <https://plumbline-web.onrender.com>** — reading the API at
<https://plumbline-server.onrender.com>.

Plumbline answers whether public Stellar anchors actually conform to the Stellar
Ecosystem Proposals they claim to implement, and whether they have been. Checks
run read-only against each anchor's unauthenticated surface on a **15-minute
schedule**, not continuously.

## Relationship to SDF anchor-tests

The Stellar Development Foundation maintains
[`@stellar/anchor-tests`](https://github.com/stellar/stellar-anchor-tests) and
hosts it at anchor-validator.stellar.org. It is the right tool for an anchor
operator testing their own anchor, including authenticated deposit and
withdrawal flows.

Plumbline is not a replacement for it and is never presented as one. Plumbline
is the scheduled, ecosystem-wide, read-only view: it runs on a schedule rather
than on demand, it covers the unauthenticated surface only, and its output is a
time series and a public directory rather than a pass/fail for one run.

## This repo computes nothing

Every score, grade and count on screen is computed in `plumbline-server` and
rendered here as received. If a number needs deriving it gets derived in the
server. A score computed two ways in two repos will eventually disagree, and the
version users see will be the wrong one.

The three exceptions are all presentation and are documented on
[`/about`](https://plumbline-web.onrender.com/about): colour buckets applied to
a score the API produced, elapsed time derived from the two timestamps the API
returns, and counts of the rows currently on screen.

## Hard boundaries

These are guard conditions in the whole project, not preferences:

1. **Read-only.** Plumbline issues only `GET`, `HEAD` and `OPTIONS` requests to
   third-party anchors. It never sends a `POST`.
2. **SEP-10 challenges are fetched and verified, never signed and never
   submitted.**
3. **No deposit or withdrawal flows** against third-party anchors, ever.
4. **No funded accounts.** The SEP-10 check generates an ephemeral keypair only
   to supply an `account` query parameter.
5. **Politeness by default.** One request in flight per host, at least two
   seconds between requests to the same host, and a documented opt-out. Any
   anchor that asks to be removed is removed.
6. **No secrets in evidence.** Stored response bodies are truncated to 2 KB and
   redacted by the checks package before persistence.

This repository holds no check logic, no database and no scoring. If a check is
wrong it is fixed in
[`plumbline-checks`](https://github.com/plumblinehq/plumbline-checks) and pulled
in by the server; if a score is wrong it is fixed in `plumbline-server`.

## Development

```bash
npm ci                # install (the lockfile is tracked)
npm run dev           # Vite dev server
npm run build         # typecheck, then build to dist/
npm run preview       # serve the built output locally
npm test              # vitest, no network access
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run format        # prettier --write
npm run format:check  # prettier --check
```

Requirements: Node 24 or later, npm.

Tests never touch the network. They stand in for `fetch` and assert the URLs the
client requests, because the failure worth catching is a filter that looks
applied but never leaves the browser.

## Configuration

One variable, read at build time and baked into the bundle:

| Variable        | Required | Default                                 | Meaning                              |
| --------------- | -------- | --------------------------------------- | ------------------------------------ |
| `VITE_API_BASE` | no       | `https://plumbline-server.onrender.com` | Base URL of the Plumbline server API |

The default exists so a fresh clone can `npm run dev` with no setup. Set it on
the host before building — it is a build-time value, not a runtime one, so
changing it requires a redeploy. The CI build job compiles against a sentinel
value and asserts it reaches the emitted bundle, since a host that sets the
variable and a build that ignores it produces a site quietly reading the
fallback API.

## Pages

| Path                    | What it shows                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | The directory: every anchor, its per-SEP and overall grade, when it was last scanned. Filters and sort live in the query string so a filtered view is a link. |
| `/anchor/{home_domain}` | One anchor: grades, a score history chart, recent runs, and every check of the latest run expandable to its message, spec reference and evidence.             |
| `/run/{run_id}`         | One run, permalinked.                                                                                                                                         |
| `/checks`               | The full check catalogue, read from the API, with each check's spec clause and severity.                                                                      |
| `/about`                | Methodology: how a grade is computed, what is deliberately not tested, the opt-out process, and the comparison with SDF's tool.                               |
| `/docs`                 | Documentation: running the checks yourself (CLI + library), the public API's routes and field-level response reference, and the contributor guide.             |

## Deployment

The reference deployment is a Render static site built from the committed
`render.yaml` blueprint: `npm ci && npm run build`, publishing `./dist`, with
`VITE_API_BASE` set in the blueprint and a `/*` → `/index.html` rewrite so
permalinks survive a hard refresh.

Create it from the Render dashboard: **New +** → **Blueprint** → this repo,
branch `main`. There is nothing to fill in.

## License

Apache-2.0
