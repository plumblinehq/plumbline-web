import { formatScore, scoreTone, type ScoreTone } from '../lib/format';

/**
 * The tone classes are written out in full because Tailwind scans source text:
 * a class assembled at runtime would never be generated.
 */
const TONE_PILL: Record<ScoreTone, string> = {
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  fair: 'bg-amber-50 text-amber-700 ring-amber-200',
  poor: 'bg-rose-50 text-rose-700 ring-rose-200',
  unknown: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const TONE_BAR: Record<ScoreTone, string> = {
  good: 'bg-emerald-500',
  fair: 'bg-amber-500',
  poor: 'bg-rose-500',
  unknown: 'bg-slate-300',
};

export function ScoreBadge({
  score,
  className = '',
}: {
  score: number | null;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums ring-1 ring-inset ${TONE_PILL[scoreTone(score)]} ${className}`}
    >
      {formatScore(score)}
    </span>
  );
}

/**
 * A missing score renders as an empty track rather than a full or zero-width
 * bar, so "not scanned yet" cannot be read as either extreme.
 */
export function ScoreBar({ score }: { score: number | null }) {
  const percent = score === null || !Number.isFinite(score) ? 0 : Math.round(score * 100);

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
      role="img"
      aria-label={score === null ? 'No score recorded' : `Score ${formatScore(score)}`}
    >
      <div
        className={`h-full rounded-full ${TONE_BAR[scoreTone(score)]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
