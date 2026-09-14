import type { Grade } from '../api/types';
import { formatScore, sepLabel } from '../lib/format';
import { ScoreBar } from './ScoreBadge';

/**
 * A SEP the anchor does not implement is shown as "not implemented" rather
 * than as a zero. That is what the API means by `applicable: false`, and the
 * scoring already excludes it from the overall figure.
 */
export function GradeSummary({
  overallScore,
  grades,
}: {
  overallScore: number | null;
  grades: readonly Grade[];
}) {
  return (
    <div className="grid gap-5 px-4 py-4 sm:grid-cols-[minmax(0,10rem)_1fr]">
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Overall</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
          {formatScore(overallScore)}
        </p>
        <div className="mt-2">
          <ScoreBar score={overallScore} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          The share of applicable <code className="font-mono">MUST</code> checks that passed.
        </p>
      </div>

      <div>
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">By SEP</p>
        {grades.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">No SEP grades recorded for this run.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {grades.map((grade) => (
              <li key={grade.sep} className="grid grid-cols-[4rem_1fr] items-center gap-3">
                <span className="text-sm font-medium text-slate-700">{sepLabel(grade.sep)}</span>
                {grade.applicable ? (
                  <div className="flex items-center gap-3">
                    <ScoreBar score={grade.score} />
                    <span className="w-16 text-right text-sm tabular-nums text-slate-700">
                      {formatScore(grade.score)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">
                    not implemented — excluded from the score
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
