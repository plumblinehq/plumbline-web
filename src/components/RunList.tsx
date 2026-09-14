import { Link } from 'react-router';
import type { RunSummary } from '../api/types';
import {
  formatCounts,
  formatElapsed,
  formatRelativeTime,
  formatScore,
  formatTimestamp,
} from '../lib/format';

/**
 * Counts come from the API's own run summary rather than being tallied from
 * the results on screen, so this table and the grade cannot disagree.
 */
export function RunList({ runs, now }: { runs: readonly RunSummary[]; now?: Date }) {
  if (runs.length === 0) {
    return <p className="px-4 py-6 text-sm text-slate-500">No runs recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">Recent runs for this anchor.</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
            <th scope="col" className="px-4 py-2 font-medium">
              Run
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Started
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Duration
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Results
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Checks version
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Overall
            </th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link
                  to={`/run/${encodeURIComponent(run.id)}`}
                  className="font-mono text-slate-900 hover:underline"
                >
                  #{run.id}
                </Link>
                {run.status !== 'complete' ? (
                  <span className="ml-2 text-xs text-amber-700">{run.status}</span>
                ) : null}
              </td>
              <td
                className="px-4 py-3 text-xs text-slate-500"
                title={formatTimestamp(run.startedAt)}
              >
                {formatRelativeTime(run.startedAt, now)}
              </td>
              <td className="px-4 py-3 text-xs tabular-nums text-slate-500">
                {formatElapsed(run.startedAt, run.finishedAt)}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">{formatCounts(run.counts)}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">
                v{run.checksLibVersion}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                {formatScore(run.overallScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
