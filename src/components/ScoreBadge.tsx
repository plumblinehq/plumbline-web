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

/** Readable-on-white partners for the pill fills, for large type and glyphs. */
const TONE_TEXT: Record<ScoreTone, string> = {
  good: 'text-grade-good',
  fair: 'text-grade-fair',
  poor: 'text-grade-poor',
  unknown: 'text-grade-unknown',
};

/**
 * The one glyph a visitor scans for. Written as full class strings for the
 * same reason the tone maps are — and as text with an aria-hidden mark, so
 * screen readers keep reading the score itself.
 */
const TONE_GLYPH: Record<ScoreTone, string> = {
  good: '✓',
  fair: '≈',
  poor: '✕',
  unknown: '–',
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
 * The overall grade, sized to be found first. The glyph carries the tone a
 * second time in shape, not just colour, so the colour-blind read works too.
 */
export function ScoreHero({ score, className = '' }: { score: number | null; className?: string }) {
  const tone = scoreTone(score);

  return (
    <p
      className={`inline-flex items-baseline gap-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl ${TONE_TEXT[tone]} ${className}`}
    >
      <span aria-hidden="true" className="text-2xl font-medium sm:text-3xl">
        {TONE_GLYPH[tone]}
      </span>
      {formatScore(score)}
    </p>
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
