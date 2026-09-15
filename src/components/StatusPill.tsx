import type { CheckStatus } from '../api/types';
import { STATUS_EXPLANATIONS, STATUS_LABELS } from '../lib/checkCopy';

/**
 * Each status gets its own fill and its own glyph, so a list of results scans
 * by shape as well as colour. The fills are pinned by tests and stay; the
 * glyph is aria-hidden because the label next to it already carries the word.
 */
const STATUS_STYLES: Record<CheckStatus, string> = {
  pass: 'bg-emerald-100 text-emerald-800',
  fail: 'bg-rose-100 text-rose-800',
  skip: 'bg-slate-100 text-slate-600',
  error: 'bg-fuchsia-100 text-fuchsia-800',
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
