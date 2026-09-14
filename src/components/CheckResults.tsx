import { useMemo } from 'react';
import type { CheckResult } from '../api/types';
import {
  countByStatus,
  formatCounts,
  groupBySep,
  sepLabel,
  sortResultsForDisplay,
} from '../lib/format';
import { CheckRow } from './CheckRow';

/**
 * Grouped by SEP and ordered with failures first, because the reader is
 * usually looking for what broke rather than confirming what did not.
 */
export function CheckResults({ results }: { results: readonly CheckResult[] }) {
  const grouped = useMemo(() => {
    const sorted = groupBySep(results);
    return new Map(
      [...sorted.entries()].map(([sep, group]) => [sep, sortResultsForDisplay(group)] as const),
    );
  }, [results]);

  if (results.length === 0) {
    return <p className="px-4 py-6 text-sm text-slate-500">This run recorded no check results.</p>;
  }

  return (
    <div className="divide-y divide-slate-200">
      {[...grouped.entries()].map(([sep, group]) => (
        <section key={sep}>
          <h3 className="flex flex-wrap items-baseline gap-2 px-4 pt-4 pb-1">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {sepLabel(sep)}
            </span>
            {/* The separator is part of the text because a flex heading drops
                the whitespace between items from its accessible name. */}
            <span className="text-xs text-slate-400">
              {`· ${formatCounts(countByStatus(group))}`}
            </span>
          </h3>
          <ul>
            {group.map((result) => (
              <CheckRow key={result.checkId} result={result} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
