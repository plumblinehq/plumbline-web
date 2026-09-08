# Security

Plumbline is read-only by design: it issues only `GET`, `HEAD` and `OPTIONS`
requests to third-party anchors and never submits signed transactions. The web
app is a static client of the server's public API; it holds no secrets.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting on this repository:
**Security → Report a vulnerability**. Do not open a public issue for a
security vulnerability.

Reports are acknowledged within 48 hours. Sensitive fix details are coordinated
privately before any public disclosure.

## Scope

- The React application, its build configuration and its dependencies
- Anything that renders untrusted content, notably evidence text from the API

## Notes for contributors

- Evidence rendered from the API is truncated and redacted upstream; render it
  as plain text, never as raw HTML.
- No secrets in the client bundle: nothing that belongs in the server ever
  ships through `VITE_` variables.