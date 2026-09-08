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

Install, test and build commands are documented here as they land with each
stage of the build. The lockfile is committed.

- Build against the real API from the first component, not fixtures.
- The methodology page (`/about`) is not optional — it is where the project's
  credibility lives.

## Pull requests

Every PR runs lint, typecheck, tests and build on push. A red build blocks the
merge.

## Reporting bugs

Use the issue templates. If the bug is in a score or a number, check the API
response first and file in `plumbline-server` if the API is wrong.