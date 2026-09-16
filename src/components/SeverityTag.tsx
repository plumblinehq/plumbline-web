import type { Severity } from '../api/types';
import { SEVERITY_EXPLANATIONS, SEVERITY_LABELS } from '../lib/checkCopy';

/**
 * MUST is the signal colour — the one decoration the accent budget buys is
 * the tag that says a clause is mandatory. Warning and info stay quiet so
 * the MUST tags are the ones that read at a glance.
 */
const SEVERITY_STYLES: Record<Severity, string> = {
  error: 'bg-signal text-canvas',
  warning: 'bg-raised text-ink-soft ring-1 ring-line ring-inset',
  info: 'bg-surface text-ink-faint ring-1 ring-line ring-inset',
};

export function SeverityTag({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${SEVERITY_STYLES[severity]}`}
      title={SEVERITY_EXPLANATIONS[severity]}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
}
