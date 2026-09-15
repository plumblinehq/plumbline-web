import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router';
import { useAnchor, useHistory, useRuns } from '../api/queries';
import { BadgeEmbed } from '../components/BadgeEmbed';
import { CheckResults } from '../components/CheckResults';
import { GradeSummary } from '../components/GradeSummary';
import { NetworkTag } from '../components/NetworkTag';
import { Panel, PanelHeader } from '../components/Panel';
import { RunList } from '../components/RunList';
import { ErrorPanel, LoadingPanel } from '../components/StatePanels';
import { formatRelativeTime, formatTimestamp } from '../lib/format';

const HISTORY_DAYS = 30;
const RUN_PAGE_SIZE = 20;

/**
 * The charting library is the heaviest dependency in the app and only this
 * page uses it, so it loads as its own chunk rather than on the way to the
 * directory.
 */
const ScoreHistoryChart = lazy(() =>
  import('../components/ScoreHistoryChart').then((module) => ({
    default: module.ScoreHistoryChart,
  })),
);

export function AnchorPage() {
  const { homeDomain = '' } = useParams<{ homeDomain: string }>();
  const anchor = useAnchor(homeDomain);
  const history = useHistory(homeDomain, HISTORY_DAYS);
  const runs = useRuns(homeDomain, RUN_PAGE_SIZE);

  if (anchor.isPending) {
    return <LoadingPanel label="Loading anchor" />;
  }

  if (anchor.isError) {
    return (
      <>
        <Breadcrumb />
        <ErrorPanel error={anchor.error} onRetry={() => void anchor.refetch()} />
      </>
    );
  }

  const detail = anchor.data;
  const run = detail.latestRun;

  return (
    <div className="space-y-4">
      <Breadcrumb />

      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {detail.displayName ?? detail.homeDomain}
          </h1>
          <NetworkTag network={detail.network} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-sm text-slate-500">
          <a
            className="font-mono underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            href={`https://${detail.homeDomain}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            {detail.homeDomain}
          </a>
          <a
            className="text-xs underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            href={`https://${detail.homeDomain}/.well-known/stellar.toml`}
            target="_blank"
            rel="noreferrer noopener"
          >
            stellar.toml
          </a>
          <span className="text-xs text-slate-500">Added {formatTimestamp(detail.addedAt)}</span>
          {run ? (
            <span className="text-xs text-slate-500">
              Last scanned {formatRelativeTime(run.startedAt)}
            </span>
          ) : null}
        </div>
      </header>

      {detail.optedOut ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This anchor asked to be removed from Plumbline and is no longer scanned.{' '}
          {detail.optOutNote ?? ''}
        </div>
      ) : null}

      <Panel>
        <PanelHeader
          title="Grade"
          description={
            run
              ? `From the run at ${formatTimestamp(run.startedAt)}.`
              : 'This anchor has not been scanned yet.'
          }
          aside={
            run ? (
              <span className="text-xs text-slate-500">
                checks <code className="font-mono">v{run.checksLibVersion}</code>
              </span>
            ) : undefined
          }
        />
        {run ? (
          <GradeSummary
            overallScore={run.overallScore}
            grades={run.grades}
            erroredCount={run.results.filter((result) => result.status === 'error').length}
          />
        ) : (
          <p className="px-4 py-6 text-sm text-slate-500">
            No results yet. The scan runs on a schedule, so check back shortly.
          </p>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Score history"
          description={`Every recorded run in the last ${HISTORY_DAYS} days.`}
          aside={<span className="text-xs text-slate-500">Points are runs, not days.</span>}
        />
        {history.isError ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            The history for this anchor could not be loaded.
          </p>
        ) : history.data === undefined ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading history…</p>
        ) : (
          <Suspense
            fallback={
              <p className="px-4 py-8 text-center text-sm text-slate-500">Loading chart…</p>
            }
          >
            <ScoreHistoryChart points={history.data} />
          </Suspense>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Recent runs"
          description={`The last ${RUN_PAGE_SIZE} runs, newest first.`}
        />
        {runs.isError ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            The run history for this anchor could not be loaded.
          </p>
        ) : runs.data === undefined ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading runs…</p>
        ) : (
          <RunList runs={runs.data} />
        )}
      </Panel>

      {run ? (
        <Panel>
          <PanelHeader
            title="Checks"
            description="Every check this run performed, grouped by SEP. Open one to see its message, the spec clause it enforces and the HTTP exchange behind it."
            aside={
              <span className="text-xs text-slate-500">
                {run.results.length} check{run.results.length === 1 ? '' : 's'} ran
              </span>
            }
          />
          <CheckResults results={run.results} />
        </Panel>
      ) : null}

      <Panel>
        <PanelHeader
          title="Badge"
          description="Embed the live score in a README. It is served by the API and refreshed hourly."
        />
        <BadgeEmbed homeDomain={detail.homeDomain} />
      </Panel>
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
      <Link
        to="/"
        className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
      >
        Directory
      </Link>
      <span aria-hidden="true"> / </span>
      <span>Anchor</span>
    </nav>
  );
}
