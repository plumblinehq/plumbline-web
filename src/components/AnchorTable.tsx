import { Link } from 'react-router';
import type { AnchorSummary, Grade } from '../api/types';
import { formatErrorCaveat, formatRelativeTime, formatScore, scoreTone, sepColumns, sepLabel, type ScoreTone } from '../lib/format';
import { NetworkTag } from './NetworkTag';

/** Luminous partners for the tested pill fills, for in-table figures. */
const TONE_TEXT: Record<ScoreTone, string> = {
  good: 'text-grade-good',
  fair: 'text-grade-fair',
  poor: 'text-grade-poor',
  unknown: 'text-grade-unknown',
};

const TONE_GLYPH: Record<ScoreTone, string> = {
  good: '✓',
  fair: '≈',
  poor: '✕',
  unknown: '–',
};

function gradeFor(anchor: AnchorSummary, sep: number): Grade | undefined {
  return anchor.grades.find((grade) => grade.sep === sep);
}

export function AnchorTable({
  anchors,
  now,
}: {
  anchors: readonly AnchorSummary[];
  /** Injectable so relative times are deterministic under test. */
  now?: Date;
}) {
  const seps = sepColumns(anchors);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <caption className="sr-only">
          Stellar anchors, their per-SEP and overall conformance scores, and when each was last
          scanned.
        </caption>
        <thead>
          <tr className="border-b border-line text-left text-xs tracking-wide text-ink-faint uppercase">
            <th scope="col" className="px-4 py-2 font-medium">
              Anchor
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Network
            </th>
            {seps.map((sep) => (
              <th key={sep} scope="col" className="px-4 py-2 text-right font-medium">
                {sepLabel(sep)}
              </th>
            ))}
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Overall
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Last scanned
            </th>
          </tr>
        </thead>
        <tbody>
          {anchors.map((anchor) => (
            <tr
              key={anchor.homeDomain}
              className="border-b border-line-soft last:border-0 transition-colors hover:bg-raised/60"
            >
              <td className="px-4 py-3.5 sm:px-5">
                <Link
                  to={`/anchor/${encodeURIComponent(anchor.homeDomain)}`}
                  className="font-medium text-ink transition-colors hover:text-signal"
                >
                  {anchor.displayName ?? anchor.homeDomain}
                </Link>
                <div className="font-mono text-xs text-ink-faint">{anchor.homeDomain}</div>
              </td>
              <td className="px-4 py-3">
                <NetworkTag network={anchor.network} />
              </td>
              {seps.map((sep) => {
                const grade = gradeFor(anchor, sep);
                return (
                  <td key={sep} className="px-4 py-3 text-right">
                    {grade === undefined || !grade.applicable ? (
                      <span
                        className="text-ink-faint"
                        title={`${sepLabel(sep)} is not implemented by this anchor, so its checks skip and it is excluded from the score.`}
                      >
                        —
                      </span>
                    ) : (
                      <span className={`tabular-nums ${TONE_TEXT[scoreTone(grade.score)]}`}>
                        {formatScore(grade.score)}
                      </span>
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-3.5 text-right sm:px-5">
                <div className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-1">
                  <span
                    className={`inline-flex items-baseline gap-1 text-base font-semibold tabular-nums ${TONE_TEXT[scoreTone(anchor.overallScore)]}`}
                  >
                    <span aria-hidden="true" className="text-xs">
                      {TONE_GLYPH[scoreTone(anchor.overallScore)]}
                    </span>
                    {formatScore(anchor.overallScore)}
                  </span>
                  {(() => {
                    const caveat = formatErrorCaveat(anchor.lastRunErrorCount);
                    return caveat === null ? null : (
                      <span
                        className="inline-flex items-center rounded bg-amber-400/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/40 ring-inset"
                        title={`${caveat.slice(1)} — Plumbline could not complete them, so the score covers only the checks that ran.`}
                      >
                        {caveat}
                      </span>
                    );
                  })()}
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-ink-faint">
                {anchor.lastRunAt === null ? (
                  'never'
                ) : (
                  <>
                    {formatRelativeTime(anchor.lastRunAt, now)}
                    {anchor.lastRunStatus !== null && anchor.lastRunStatus !== 'complete' ? (
                      <span className="ml-1 text-amber-400">({anchor.lastRunStatus})</span>
                    ) : null}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
