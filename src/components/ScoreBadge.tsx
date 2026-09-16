import { formatScore, scoreTone, type ScoreTone } from '../lib/format';

/**
 * The tone classes are written out in full because Tailwind scans source text:
 * a class assembled at runtime would never be generated. On the dark surface
 * the tone is carried by the 300-level text — the readable part, and what the
 * test pins — over a 15% tint of the same hue with a hairline ring, the same
 * chip language as the network and caveat tags. As supplementary signals
 * these sit around 3:1 contrast, on par with the pale-on-light chips they
 * replaced; the tone is repeated in the glyphs and rails so nothing rides on
 * colour alone.
 */
const TONE_PILL: Record<ScoreTone, string> = {
  good: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40 ring-inset',
  fair: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40 ring-inset',
  poor: 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/40 ring-inset',
  unknown: 'bg-raised text-ink-faint ring-1 ring-line ring-inset',
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
      className="h-1.5 w-full overflow-hidden rounded-full bg-raised"
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
