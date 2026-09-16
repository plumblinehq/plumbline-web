import type { CheckStatus } from '../api/types';
import { STATUS_EXPLANATIONS, STATUS_LABELS } from '../lib/checkCopy';

/**
 * Each status gets its own tint and its own glyph, so a list of results scans
 * by shape as well as colour. The 300-level text over a 15% tint of the same
 * hue is the chip language the rest of the dark theme uses; the glyph is
 * aria-hidden because the label next to it already carries the word.
 */
const STATUS_STYLES: Record<CheckStatus, string> = {
  pass: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40 ring-inset',
  fail: 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/40 ring-inset',
  skip: 'bg-raised text-ink-faint ring-1 ring-line ring-inset',
  error: 'bg-fuchsia-400/15 text-fuchsia-300 ring-1 ring-fuchsia-400/40 ring-inset',
};

const STATUS_GLYPHS: Record<CheckStatus, string> = {
  pass: '✓',
  fail: '✕',
  skip: '–',
  error: '!',
};

export function StatusPill({ status }: { status: CheckStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
      title={STATUS_EXPLANATIONS[status]}
    >
      <span aria-hidden="true" className="font-semibold">
        {STATUS_GLYPHS[status]}
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}
