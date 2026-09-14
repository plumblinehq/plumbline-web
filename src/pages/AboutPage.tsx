import { Link } from 'react-router';
import { Panel, PanelHeader } from '../components/Panel';
import { STATUS_EXPLANATIONS, STATUS_LABELS } from '../lib/checkCopy';

/**
 * This page is not filler. It is where the project states exactly how a grade
 * is produced, what it refuses to test, and what it is not. Every number and
 * every rule described here is implemented in `plumbline-server`, not here.
 */
export function AboutPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Methodology</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          What Plumbline checks, how a grade is computed, what it deliberately does not test, and
          what it is not. Everything on this page describes behaviour implemented in{' '}
          <code className="font-mono text-xs">plumbline-server</code> — the site you are reading
          derives none of the numbers it shows.
        </p>
      </header>

      <Panel>
        <PanelHeader title="How a grade is computed" />
        <div className="space-y-4 px-4 py-4 text-sm text-slate-700">
          <p>
            Only checks whose severity is <strong>error</strong> affect a score. For each SEP:
          </p>
          <pre className="overflow-x-auto rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-100">
            <code>{`sep_score = (error-severity checks that passed)
          / (error-severity checks that passed or failed)

overall   = mean of the scores of the SEPs that are applicable`}</code>
          </pre>
          <p>
            A <strong>skip</strong> never enters the denominator, and neither does an{' '}
            <strong>error</strong> — that status means Plumbline could not complete the check, which
            is our failure rather than the anchor&apos;s. Warnings and observations are recorded and
            displayed but do not move a number.
          </p>
          <p>
            A SEP is <em>applicable</em> when at least one of its error-severity checks actually
            passed or failed. An anchor that does not declare{' '}
            <code className="font-mono text-xs">WEB_AUTH_ENDPOINT</code> therefore has every SEP-10
            check skip, has no SEP-10 grade at all, and is <strong>not</strong> penalised for it. A
            scoring rule that punished an anchor for not implementing a proposal it never claimed to
            implement would be wrong, and the directory would be worthless.
          </p>
          <p>
            The overall figure is the unweighted mean of the applicable per-SEP scores, not a pooled
            ratio across all checks. That means each SEP counts equally: an anchor in the directory
            with two SEPs at 100% and 50% scores 75%, regardless of how many checks each SEP
            contains.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="What the statuses mean"
          description="A low score means different things depending on which of these produced it."
        />
        <div className="px-4 py-4">
          <dl className="grid gap-2 text-sm">
            {(['pass', 'fail', 'skip', 'error'] as const).map((status) => (
              <div key={status} className="grid grid-cols-[5rem_1fr] gap-3">
                <dt className="font-medium text-slate-900">{STATUS_LABELS[status]}</dt>
                <dd className="text-slate-600">{STATUS_EXPLANATIONS[status]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="What Plumbline does not test"
          description="These are product boundaries enforced in code, not aspirations."
        />
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <ul className="list-disc space-y-2 pl-4">
            <li>
              <strong>Nothing is written to an anchor.</strong> Plumbline issues only{' '}
              <code className="font-mono text-xs">GET</code>,{' '}
              <code className="font-mono text-xs">HEAD</code> and{' '}
              <code className="font-mono text-xs">OPTIONS</code> requests. It never sends a{' '}
              <code className="font-mono text-xs">POST</code>.
            </li>
            <li>
              <strong>SEP-10 challenges are verified, never signed and never submitted.</strong> The
              challenge is fetched, decoded and checked against the response on the wire. Nothing is
              sent to the token endpoint, and no keypair is ever used to sign anything.
            </li>
            <li>
              <strong>No deposit or withdrawal flow is ever initiated</strong> against a third-party
              anchor. Starting a real transaction against someone&apos;s production system without
              their consent is not monitoring.
            </li>
            <li>
              <strong>No funded accounts are required.</strong> The SEP-10 check generates an
              ephemeral keypair purely to supply the{' '}
              <code className="font-mono text-xs">account</code> query parameter.
            </li>
            <li>
              <strong>Anything requiring authentication is out of scope and reports as skip</strong>
              , never as a failure. A skip is not a demerit.
            </li>
          </ul>
          <p>
            For the same reason, evidence is honest about itself: a stored response body is
            truncated to 2 KB and redacted before it is persisted, and the interface says so
            wherever a body is shown.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="How to verify a number rather than trust it" />
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <p>
            Every result on an{' '}
            <Link to="/" className="underline decoration-slate-300">
              anchor page
            </Link>{' '}
            opens to the message, the spec clause it enforces and the HTTP exchange behind it. The
            spec reference names a real clause in a published proposal, and the severity is derived
            mechanically from that clause&apos;s wording:{' '}
            <code className="font-mono text-xs">MUST</code> maps to error,{' '}
            <code className="font-mono text-xs">SHOULD</code> or{' '}
            <code className="font-mono text-xs">RECOMMENDED</code> to warning, and a clause that
            states no obligation to an observation. When a spec is ambiguous the severity is a
            warning, never an error.
          </p>
          <p>
            The{' '}
            <Link to="/checks" className="underline decoration-slate-300">
              check catalogue
            </Link>{' '}
            is published by the API from the checks package, so it is the list that actually runs.
            The API is public and needs no key, and the same data is available as the{' '}
            <code className="font-mono text-xs">@plumblinehq/plumbline-checks</code> CLI if you
            would rather run the checks yourself.
          </p>
          <p>
            Each run records the version of the checks package that produced it. This matters: when
            a grade moves, that column is what distinguishes an anchor that changed from Plumbline
            having added or fixed a check.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="How often it runs, precisely" />
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <p>
            The hosted instance scans every anchor on a{' '}
            <strong className="font-medium">15-minute schedule</strong> and a scan takes tens of
            seconds, so the run history shows the real interval. It is not continuous monitoring and
            is not described as such.
          </p>
          <p>
            Two caveats, stated rather than glossed over. The schedule runs on GitHub Actions, which
            queues scheduled jobs and can delay them under load. And GitHub disables scheduled
            workflows after 60 days without repository activity, so the run history is the honest
            record — it will show a gap if one occurred.
          </p>
          <p>
            Requests are polite by construction: one in flight per host, at least two seconds
            between requests to the same host, and a{' '}
            <code className="font-mono text-xs">User-Agent</code> carrying a contact URL.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="What the colours mean"
          description="These are a display convention applied to the API's score, not a second scoring rule."
        />
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <p>
            Green is 90% or better, amber is 70% or better, and red is below that. The buckets exist
            so a column can be scanned at a glance, and nothing else in the project depends on them.
            The score they colour is the one the API computed.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Opting out" />
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <p>
            Any anchor that asks to be removed is removed, same day and without argument. The
            opt-out list is committed in{' '}
            <a
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              href="https://github.com/plumblinehq/plumbline-server/blob/main/seeds/optout.yaml"
            >
              the server repository
            </a>{' '}
            so it is reviewable, and an opted-out anchor is excluded from every list and scan.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Relationship to SDF anchor-tests" />
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <p>
            The Stellar Development Foundation maintains{' '}
            <a
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              href="https://github.com/stellar/stellar-anchor-tests"
            >
              @stellar/anchor-tests
            </a>
            , hosted at anchor-validator.stellar.org, and SEP-1 itself points at it under
            &ldquo;Testing → Tools&rdquo;. Plumbline is not a replacement for it and does not claim
            to be.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
                  <th scope="col" className="px-2 py-2 font-medium" />
                  <th scope="col" className="px-2 py-2 font-medium">
                    SDF anchor-tests
                  </th>
                  <th scope="col" className="px-2 py-2 font-medium">
                    Plumbline
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {[
                  [
                    'Who runs it',
                    'The anchor operator, on their own anchor',
                    'Plumbline, across the whole ecosystem',
                  ],
                  ['When', 'On demand, at integration time', 'On a schedule, every 15 minutes'],
                  [
                    'Scope',
                    'Full flows including authenticated deposit and withdrawal',
                    'Read-only, unauthenticated surface only',
                  ],
                  [
                    'Output',
                    'Pass/fail for one run',
                    'Time series, regression detection, a public directory',
                  ],
                  [
                    'Audience',
                    'The anchor building its integration',
                    'Wallets, users and the ecosystem choosing an anchor',
                  ],
                ].map(([label, sdf, plumbline]) => (
                  <tr key={label} className="border-b border-slate-100 last:border-0">
                    <th
                      scope="row"
                      className="px-2 py-2 text-left align-top text-xs font-medium text-slate-900"
                    >
                      {label}
                    </th>
                    <td className="px-2 py-2 align-top">{sdf}</td>
                    <td className="px-2 py-2 align-top">{plumbline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            If you operate an anchor, run SDF&apos;s tool against it first. Plumbline tells everyone
            else whether it is working right now, and has been.
          </p>
        </div>
      </Panel>
    </div>
  );
}
