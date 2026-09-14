# Contributing

Thanks for considering a contribution to Plumbline.

Plumbline is three repositories in the `plumblinehq` org:

- **plumbline-checks** — the SEP conformance checks, as a library and CLI
- **plumbline-server** — scheduler, Postgres store, HTTP API
- **plumbline-web** — the public directory

This repo is `plumbline-web`: the public directory. It reads the server's API
and renders it. It **computes nothing** — if a number needs deriving, it gets
derived in `plumbline-server`. A score computed two ways in two repos will
eventually disagree, and the version users see will be the wrong one.

## Ground rules

- TypeScript in strict mode. No ORM, DI framework, component library or UI kit.
- The API base URL is a build-time environment variable (`VITE_API_BASE`).
- One commit per logical unit, Conventional Commits style. A component is one
  commit.
- Never commit a red build. CI must be green on the default branch.

## Development

Node 24 or later. The lockfile is committed.

```bash
npm ci                # install
npm run dev           # Vite dev server
npm run build         # typecheck, then build to dist/
npm test              # vitest
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run format        # prettier --write
```

Tests do not touch the network. They stand in for `fetch` and assert the URL the
client requested, which is the only way to catch the failure that matters here:
a filter that looks applied but never reaches the API.

- Build against the real API from the first component, not fixtures. The
  fixtures in tests are shapes captured from the deployed API, not invented
  ones.
- The API base URL is a build-time environment variable (`VITE_API_BASE`). It is
  read in `src/api/client.ts` and nowhere else.
- The methodology page (`/about`) is not optional — it is where the project's
  credibility lives. If you change how a grade is computed or displayed, that
  page changes in the same pull request, and so does the server.

## Pull requests

Every PR runs lint, typecheck, tests and build on push. A red build blocks the
merge.

## Reporting bugs

Use the issue templates. If the bug is in a score or a number, check the API
response first and file in `plumbline-server` if the API is wrong.
