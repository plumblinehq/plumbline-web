import type { Severity } from '../api/types';
import { SEVERITY_EXPLANATIONS, SEVERITY_LABELS } from '../lib/checkCopy';

const SEVERITY_STYLES: Record<Severity, string> = {
  error: 'bg-slate-900 text-white',
  warning: 'bg-slate-200 text-slate-700',
  info: 'bg-slate-100 text-slate-500',
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
