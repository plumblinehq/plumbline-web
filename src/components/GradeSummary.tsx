import type { Grade } from '../api/types';
import { formatErrorCaveat, formatScore, sepLabel } from '../lib/format';
import { ScoreBar, ScoreHero } from './ScoreBadge';

/**
 * A SEP the anchor does not implement is shown as "not implemented" rather
 * than as a zero. That is what the API means by `applicable: false`, and the
 * scoring already excludes it from the overall figure.
 */
export function GradeSummary({
  overallScore,
  grades,
  erroredCount,
}: {
  overallScore: number | null;
  grades: readonly Grade[];
  /** Checks the latest run could not complete. Excluded from the score, but never hidden. */
  erroredCount?: number | null;
}) {
  const caveat = formatErrorCaveat(erroredCount ?? null);

  return (
    <div className="grid gap-6 px-4 py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:px-6 sm:py-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">Overall</p>
        <ScoreHero score={overallScore} className="mt-2" />
        <div className="mt-4">
          <ScoreBar score={overallScore} />
        </div>
        {caveat === null ? (
          <p className="mt-3 text-xs text-ink-faint">
            The share of applicable <code className="font-mono">MUST</code> checks that passed.
          </p>
        ) : (
          /*
           * The caveat is a warning about the score's coverage, not a footnote:
           * an unverified clause must be impossible to miss next to a number
           * that quietly excludes it.
           */
          <p className="mt-3 rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-2 text-xs leading-relaxed text-amber-300">
            <span className="font-semibold">{caveat}</span> — those results are excluded from this
            score because Plumbline could not complete them, so the score covers only the checks
            that ran.
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">By SEP</p>
        {grades.length === 0 ? (
          <p className="mt-2 text-sm text-ink-faint">No SEP grades recorded for this run.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {grades.map((grade) => (
              <li key={grade.sep} className="grid grid-cols-[4rem_1fr] items-center gap-3">
                <span className="text-sm font-medium text-ink-soft">{sepLabel(grade.sep)}</span>
                {grade.applicable ? (
                  <div className="flex items-center gap-3">
                    <ScoreBar score={grade.score} />
                    <span className="w-16 text-right text-sm tabular-nums text-ink-soft">
                      {formatScore(grade.score)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-ink-faint">
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
