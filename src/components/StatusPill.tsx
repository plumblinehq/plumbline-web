import type { CheckStatus } from '../api/types';
import { STATUS_EXPLANATIONS, STATUS_LABELS } from '../lib/checkCopy';

const STATUS_STYLES: Record<CheckStatus, string> = {
  pass: 'bg-emerald-100 text-emerald-800',
  fail: 'bg-rose-100 text-rose-800',
  skip: 'bg-slate-100 text-slate-600',
  error: 'bg-fuchsia-100 text-fuchsia-800',
};

export function StatusPill({ status }: { status: CheckStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
      title={STATUS_EXPLANATIONS[status]}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
