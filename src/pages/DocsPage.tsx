import { Link } from 'react-router';
import { Panel, PanelHeader } from '../components/Panel';

/**
 * Documentation lives with the product it documents. Everything here is
 * written against the real CLIs, routes and wire types — the quickstart
 * mirrors `src/cli.ts` in plumbline-checks, the API section mirrors
 * `src/server.ts` in plumbline-server, and the contributor guide mirrors the
 * CONTRIBUTING files and the branch protection that actually enforces them.
 * When one of those changes, this page changes in the same PR.
 */

const API_BASE = 'https://plumbline-server.onrender.com';

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}

function Row({ cells }: { cells: readonly [string, string, string] }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-2 py-2 align-top font-mono text-xs">{cells[0]}</td>
      <td className="px-2 py-2 align-top text-xs">{cells[1]}</td>
      <td className="px-2 py-2 align-top text-xs">{cells[2]}</td>
    </tr>
  );
}

function RouteTable({ rows }: { rows: readonly (readonly [string, string, string])[] }) {
  return (
    <div className="overflow-x-auto px-4 py-4">
      <table className="w-full min-w-[42rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
            <th scope="col" className="px-2 py-2 font-medium">Route</th>
            <th scope="col" className="px-2 py-2 font-medium">Parameters</th>
            <th scope="col" className="px-2 py-2 font-medium">Response</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">{rows.map((r) => <Row key={r[0]} cells={r} />)}</tbody>
      </table>
    </div>
  );
}

const ANCHOR_SUMMARY_FIELDS: readonly (readonly [string, string])[] = [
  ['homeDomain', 'string — the anchor’s domain, as listed in the directory'],
  ['network', 'string — "pubnet" or "testnet"'],
  ['displayName', 'string | null — from the anchor’s TOML, if it declares one'],
  ['overallScore', 'number | null — null until the anchor has a completed run'],
  ['grades', 'Grade[] — per-SEP scores; see Grade below'],
  ['lastRunId / lastRunAt / lastRunStatus', 'string | null — the anchor’s most recent run'],
  [
    'lastRunErrorCount',
    'number | null — checks in the latest run that Plumbline itself could not complete. '
      + 'Errored checks are excluded from the score rather than failed, so this is what tells a '
      + 'fully-verified 100% from one that never ran everything. Null when there is no run.',
  ],
  ['optedOut', 'boolean — always false on public listings; opted-out anchors are excluded'],
];

const GRADE_FIELDS: readonly (readonly [string, string])[] = [
  ['sep', 'number — the SEP number'],
  ['score', 'number in [0, 1] — error-severity pass ratio for that SEP'],
  [
    'applicable',
    'boolean — false when the anchor does not implement the SEP (e.g. no WEB_AUTH_ENDPOINT '
      + 'declared for SEP-10). Non-applicable grades are excluded from the overall score.',
  ],
];

const RUN_FIELDS: readonly (readonly [string, string])[] = [
  ['id', 'string — stable run id; also the /run/:id deep link on this site'],
  ['homeDomain / network', 'string — what was scanned, and on which network'],
  ['startedAt / finishedAt', 'ISO timestamps; finishedAt is null while a run is in flight'],
  ['status', '"running" | "complete" | "aborted"'],
  ['overallScore', 'number | null — unweighted mean of applicable SEP scores'],
  [
    'checksLibVersion',
    'string — the version of the checks package that produced this run. When a grade moves, '
      + 'this column distinguishes an anchor that changed from Plumbline having added a check.',
  ],
  ['grades', 'Grade[] — per-SEP scores for this run'],
  ['results', 'CheckResult[] — one row per check executed'],
];

const CHECK_RESULT_FIELDS: readonly (readonly [string, string])[] = [
  ['checkId', 'string — e.g. "sep10.challenge-decodes"; stable, used in the catalogue'],
  ['sep', 'number'],
  ['status', '"pass" | "fail" | "skip" | "error" — see the methodology for what each means'],
  ['severity', '"error" | "warning" | "info" — derived from the spec clause’s own language'],
  ['message / specRef', 'string | null — the human summary and the clause it enforces'],
  [
    'evidence',
    'Evidence[] — the recorded HTTP exchanges. Bodies are truncated to 2 KB and redacted before '
      + 'storage; headers are recorded only where headers are the point (CORS, content type).',
  ],
  ['durationMs', 'number | null'],
  ['title', 'string — the check’s catalogue title'],
];

const RUN_SUMMARY_FIELDS: readonly (readonly [string, string])[] = [
  ['id / startedAt / finishedAt / status', 'as on Run'],
  ['overallScore', 'number | null'],
  ['checksLibVersion', 'string'],
  ['counts', '{ pass, fail, skip, error } — result counts for the run'],
];

const HISTORY_FIELDS: readonly (readonly [string, string])[] = [
  ['runId / startedAt', 'string — the run each point came from'],
  ['overallScore', 'number | null'],
  ['grades', 'Grade[] — per-SEP scores at that point in time'],
];

const CATALOGUE_FIELDS: readonly (readonly [string, string])[] = [
  ['id / sep / title / description', 'the check’s identity, as browsable documentation'],
  ['severity', '"error" | "warning" | "info"'],
  ['specRef', 'string — the clause the check enforces; every one names real spec text'],
  ['requires', 'string[] — prerequisite checks that must run first'],
];

export function DocsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Documentation</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          How to run the checks yourself, the public API behind{' '}
          <Link to="/" className="underline decoration-slate-300">the directory</Link>, and how to
          contribute. Everything on this page is generated from the real code — commands match the
          CLI, routes match the server, and the field tables match the wire.
        </p>
        <nav aria-label="On this page" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {[
            ['#quickstart', 'Run the checks'],
            ['#api', 'Public API'],
            ['#methodology', 'Methodology'],
            ['#contributing', 'Contributing'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-slate-500 underline decoration-slate-300 hover:text-slate-900">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Panel>
        <span id="quickstart" className="block scroll-mt-20" />
        <PanelHeader
          title="Run the checks yourself"
          description="The same checks the hosted directory runs, as a library and a CLI."
        />
        <div className="space-y-4 px-4 py-4 text-sm text-slate-700">
          <p>
            <code className="font-mono text-xs">@plumblinehq/plumbline-checks</code> is published to
            npm. The CLI needs no configuration and touches nothing but the anchor you name:
          </p>
          <Code>{`npx @plumblinehq/plumbline-checks run --home-domain testanchor.stellar.org --seps 1,10

# or, installed:
npm install -g @plumblinehq/plumbline-checks
plumbline run --home-domain example.com --seps 1 --network pubnet --json
plumbline checks list --sep 10`}</Code>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <code className="font-mono text-xs">--network</code> is{' '}
              <code className="font-mono text-xs">pubnet</code> (default) or{' '}
              <code className="font-mono text-xs">testnet</code>.
            </li>
            <li>
              <code className="font-mono text-xs">--json</code> emits the full result array — the
              same shape the API documents below — for machine consumption.
            </li>
            <li>
              The exit code is 0 unless an <strong>error-severity</strong> check failed, so it drops
              into CI directly. A check Plumbline itself could not run is our failure and exits 0;
              it is reported, never blamed on the anchor.
            </li>
          </ul>
          <p>As a library, the same run looks like this:</p>
          <Code>{`import { run, all, RateLimitedHttpClient, consoleLogger } from '@plumblinehq/plumbline-checks';

const results = await run(
  {
    homeDomain: 'example.com',
    network: 'pubnet',
    http: new RateLimitedHttpClient(), // one in-flight per host, >= 2s apart, contact UA
    now: () => new Date(),
    logger: consoleLogger,
  },
  { seps: [1, 10] },
);

console.log(all().length); // every registered check, browsable via checks list`}</Code>
          <p>
            The HTTP client is injected, which is what makes the test suite network-free: tests stub{' '}
            <code className="font-mono text-xs">fetch</code> at this boundary. Requests are polite by
            construction — one in flight per host, at least two seconds between requests to the same
            host, and a <code className="font-mono text-xs">User-Agent</code> carrying a contact URL.
          </p>
        </div>
      </Panel>

      <Panel>
        <span id="api" className="block scroll-mt-20" />
        <PanelHeader
          title="Public API"
          description={`Base URL: ${API_BASE} — no key, CORS open to GET/HEAD/OPTIONS.`}
        />
        <div className="space-y-4 px-4 py-4 text-sm text-slate-700">
          <RouteTable
            rows={[
              ['GET /api/anchors', 'network, sep, min_score (0–1), sort=name|score', 'AnchorSummary[]'],
              ['GET /api/anchors/:homeDomain', '—', 'AnchorDetail, or 404'],
              ['GET /api/anchors/:homeDomain/runs', 'limit (default 20, max 100)', 'RunSummary[]'],
              ['GET /api/anchors/:homeDomain/history', 'days (default 30, max 365)', 'HistoryPoint[]'],
              ['GET /api/runs/:runId', '—', 'Run, or 404'],
              ['GET /api/checks', '—', 'CheckDefinition[] — the catalogue that actually runs'],
              ['GET /badge/:homeDomain.svg', '—', 'image/svg+xml, cacheable for 1 hour'],
              ['GET /healthz · /readyz · /metrics', '—', 'liveness · readiness · Prometheus text'],
            ]}
          />
          <p>
            Example — the directory’s own first request:{' '}
            <Code>{`curl '${API_BASE}/api/anchors?sort=score&min_score=0.9'`}</Code>
          </p>
          <p>
            Responses may gain fields over time; treat unknown fields as ignorable. The field tables
            below are the contract.
          </p>

          <h3 className="pt-2 text-sm font-semibold text-slate-900">AnchorSummary</h3>
          <dl className="grid gap-1.5 text-xs">
            {ANCHOR_SUMMARY_FIELDS.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[14rem_1fr] gap-3">
                <dt className="font-mono text-slate-900">{name}</dt>
                <dd className="text-slate-600">{desc}</dd>
              </div>
            ))}
          </dl>

          <h3 className="pt-2 text-sm font-semibold text-slate-900">Grade</h3>
          <dl className="grid gap-1.5 text-xs">
            {GRADE_FIELDS.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[14rem_1fr] gap-3">
                <dt className="font-mono text-slate-900">{name}</dt>
                <dd className="text-slate-600">{desc}</dd>
              </div>
            ))}
          </dl>

          <h3 className="pt-2 text-sm font-semibold text-slate-900">Run</h3>
          <dl className="grid gap-1.5 text-xs">
            {RUN_FIELDS.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[14rem_1fr] gap-3">
                <dt className="font-mono text-slate-900">{name}</dt>
                <dd className="text-slate-600">{desc}</dd>
              </div>
            ))}
          </dl>

          <h3 className="pt-2 text-sm font-semibold text-slate-900">CheckResult</h3>
          <dl className="grid gap-1.5 text-xs">
            {CHECK_RESULT_FIELDS.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[14rem_1fr] gap-3">
                <dt className="font-mono text-slate-900">{name}</dt>
                <dd className="text-slate-600">{desc}</dd>
              </div>
            ))}
          </dl>

          <h3 className="pt-2 text-sm font-semibold text-slate-900">RunSummary</h3>
          <dl className="grid gap-1.5 text-xs">
            {RUN_SUMMARY_FIELDS.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[14rem_1fr] gap-3">
                <dt className="font-mono text-slate-900">{name}</dt>
                <dd className="text-slate-600">{desc}</dd>
              </div>
            ))}
          </dl>

          <h3 className="pt-2 text-sm font-semibold text-slate-900">HistoryPoint</h3>
          <dl className="grid gap-1.5 text-xs">
            {HISTORY_FIELDS.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[14rem_1fr] gap-3">
                <dt className="font-mono text-slate-900">{name}</dt>
                <dd className="text-slate-600">{desc}</dd>
              </div>
            ))}
          </dl>

          <h3 className="pt-2 text-sm font-semibold text-slate-900">CheckDefinition</h3>
          <dl className="grid gap-1.5 text-xs">
            {CATALOGUE_FIELDS.map(([name, desc]) => (
              <div key={name} className="grid grid-cols-[14rem_1fr] gap-3">
                <dt className="font-mono text-slate-900">{name}</dt>
                <dd className="text-slate-600">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Panel>

      <Panel>
        <span id="methodology" className="block scroll-mt-20" />
        <PanelHeader title="Methodology" />
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <p>
            How a grade is computed, what the statuses mean, what Plumbline deliberately does not
            test, and its relationship to SDF’s anchor-tests are all on the{' '}
            <Link to="/about" className="underline decoration-slate-300">methodology page</Link>.
            That page is the single source of truth for the scoring rules — this docs page
            deliberately does not restate them, because two copies of a rule eventually disagree.
          </p>
        </div>
      </Panel>

      <Panel>
        <span id="contributing" className="block scroll-mt-20" />
        <PanelHeader
          title="Contributing"
          description="Three repos, one discipline: every assertion traces to real spec text."
        />
        <div className="space-y-4 px-4 py-4 text-sm text-slate-700">
          <p>
            Plumbline is three repositories, and the boundaries are hard:
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <a
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                href="https://github.com/plumblinehq/plumbline-checks"
              >
                plumbline-checks
              </a>{' '}
              — the SEP conformance checks, as a library and CLI. Pure check logic; its only I/O is
              outbound HTTP.
            </li>
            <li>
              <a
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                href="https://github.com/plumblinehq/plumbline-server"
              >
                plumbline-server
              </a>{' '}
              — Postgres store, HTTP API, badges, regression alerts, the scheduled scan job. Contains
              no check logic.
            </li>
            <li>
              <a
                className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                href="https://github.com/plumblinehq/plumbline-web"
              >
                plumbline-web
              </a>{' '}
              — this site. It reads the API and renders it; it computes nothing.
            </li>
          </ul>
          <p>
            <strong>Picking work.</strong> The issue trackers are labelled by complexity —{' '}
            <code className="font-mono text-xs">complexity:trivial</code> and{' '}
            <code className="font-mono text-xs">complexity:medium</code> — with new checks for
            SEP-6/24/31/38 in{' '}
            <a
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              href="https://github.com/plumblinehq/plumbline-checks/issues?q=is%3Aissue+is%3Aopen+label%3Acomplexity%3Atrivial"
            >
              plumbline-checks
            </a>{' '}
            and API/UI improvements across the other two. Every issue states acceptance criteria,
            and the check issues link the exact spec clause they implement.
          </p>
          <p>
            <strong>The one rule that outranks everything.</strong> A conformance check is never
            written from memory. Read the clause in the SEP text first — the issues link to it —
            and the check’s <code className="font-mono text-xs">specRef</code> must point at real
            text. Severity is derived mechanically from that wording:{' '}
            <code className="font-mono text-xs">MUST</code> maps to error,{' '}
            <code className="font-mono text-xs">SHOULD</code> or{' '}
            <code className="font-mono text-xs">RECOMMENDED</code> to warning, and when a spec is
            ambiguous the severity is a warning, never an error. A check whose specRef does not
            correspond to real spec text is the worst bug this project can have.
          </p>
          <p>
            <strong>The development loop</strong> is the same in every repo (npm, TypeScript strict,
            Vitest):
          </p>
          <Code>{`npm install
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest — never touches the network
npm run build       # checks: tsup emit · server: runtime-load check · web: vite build`}</Code>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              Tests stub HTTP at the probe boundary. The single documented exception is the opt-in
              integration test against <code className="font-mono text-xs">testanchor.stellar.org</code>.
            </li>
            <li>
              Every check ships fixtures under <code className="font-mono text-xs">test/fixtures/</code>{' '}
              — at least one passing and one failing case. A check does not merge without both.
            </li>
            <li>
              One commit per logical unit, Conventional Commits style: a check plus its fixture plus
              its test is one commit. Never commit a red build.
            </li>
            <li>
              Plumbline is read-only against anchors — only <code className="font-mono text-xs">GET</code>,{' '}
              <code className="font-mono text-xs">HEAD</code> and{' '}
              <code className="font-mono text-xs">OPTIONS</code>. Challenges are verified, never
              signed; deposit and withdrawal flows are out of scope by design.
            </li>
          </ul>
          <p>
            <strong>Pull requests.</strong> Every PR runs lint, typecheck, tests and build on push,
            and the required status checks are enforced for everyone — there is no review gate, so a
            PR merges itself the moment CI is green. A red build blocks the merge; that is the only
            merge rule.
          </p>
        </div>
      </Panel>
    </div>
  );
}
