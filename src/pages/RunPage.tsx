import { Link, useParams } from 'react-router';
import { useRun } from '../api/queries';
import { CheckResults } from '../components/CheckResults';
import { GradeSummary } from '../components/GradeSummary';
import { NetworkTag } from '../components/NetworkTag';
import { Panel, PanelHeader } from '../components/Panel';
import { ErrorPanel, LoadingPanel } from '../components/StatePanels';
import { countByStatus, formatElapsed, formatTimestamp } from '../lib/format';

export function RunPage() {
  const { runId = '' } = useParams<{ runId: string }>();
  const run = useRun(runId);

  if (run.isPending) {
    return <LoadingPanel label="Loading run" />;
  }

  if (run.isError) {
    return <ErrorPanel error={run.error} onRetry={() => void run.refetch()} />;
  }

  const detail = run.data;

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link
          to="/"
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
        >
          Directory
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to={`/anchor/${encodeURIComponent(detail.homeDomain)}`}
          className="underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
        >
          {detail.homeDomain}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Run #{detail.id}</span>
      </nav>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Run #{detail.id}</h1>
          <NetworkTag network={detail.network} />
          {detail.status !== 'complete' ? (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {detail.status}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="text-xs">Started {formatTimestamp(detail.startedAt)}</span>
          <span className="text-xs">Finished {formatTimestamp(detail.finishedAt)}</span>
          <span className="text-xs">Took {formatElapsed(detail.startedAt, detail.finishedAt)}</span>
          <span className="text-xs text-slate-500">
            checks <code className="font-mono">v{detail.checksLibVersion}</code>
          </span>
        </div>
      </header>

      <Panel>
        <PanelHeader
          title="Grade"
          description="As computed by the API for this run. This site derives no scores of its own."
        />
        <GradeSummary
          overallScore={detail.overallScore}
          grades={detail.grades}
          erroredCount={countByStatus(detail.results).error}
        />
      </Panel>

      <Panel>
        <PanelHeader
          title="Checks"
          description="Every check this run performed, grouped by SEP and ordered with failures first."
          aside={<span className="text-xs text-slate-500">{detail.results.length} ran</span>}
        />
        <CheckResults results={detail.results} />
      </Panel>
    </div>
  );
}
