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
    return <p className="px-4 py-6 text-sm text-ink-faint">No runs recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">Recent runs for this anchor.</caption>
        <thead>
          <tr className="border-b border-line text-left text-xs tracking-wide text-ink-faint uppercase">
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
            <tr key={run.id} className="border-b border-line-soft last:border-0 transition-colors hover:bg-raised/60">
              <td className="px-4 py-3">
                <Link
                  to={`/run/${encodeURIComponent(run.id)}`}
                  className="font-mono text-ink transition-colors hover:text-signal"
                >
                  #{run.id}
                </Link>
                {run.status !== 'complete' ? (
                  <span className="ml-2 text-xs text-amber-400">{run.status}</span>
                ) : null}
              </td>
              <td
                className="px-4 py-3 text-xs text-ink-faint"
                title={formatTimestamp(run.startedAt)}
              >
                {formatRelativeTime(run.startedAt, now)}
              </td>
              <td className="px-4 py-3 text-xs tabular-nums text-ink-faint">
                {formatElapsed(run.startedAt, run.finishedAt)}
              </td>
              <td className="px-4 py-3 text-xs text-ink-soft">{formatCounts(run.counts)}</td>
              <td className="px-4 py-3 font-mono text-xs text-ink-faint">
                v{run.checksLibVersion}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink-soft">
                {formatScore(run.overallScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
