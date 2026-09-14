import { Link, useParams } from 'react-router';
import { useAnchor } from '../api/queries';
import { BadgeEmbed } from '../components/BadgeEmbed';
import { GradeSummary } from '../components/GradeSummary';
import { NetworkTag } from '../components/NetworkTag';
import { Panel, PanelHeader } from '../components/Panel';
import { ErrorPanel, LoadingPanel } from '../components/StatePanels';
import { formatRelativeTime, formatTimestamp } from '../lib/format';

export function AnchorPage() {
  const { homeDomain = '' } = useParams<{ homeDomain: string }>();
  const anchor = useAnchor(homeDomain);

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

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {detail.displayName ?? detail.homeDomain}
          </h1>
          <NetworkTag network={detail.network} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
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
          <GradeSummary overallScore={run.overallScore} grades={run.grades} />
        ) : (
          <p className="px-4 py-6 text-sm text-slate-500">
            No results yet. The scan runs on a schedule, so check back shortly.
          </p>
        )}
      </Panel>

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
