import type { CheckResult, Evidence } from '../api/types';
import { formatDuration } from '../lib/format';
import { SeverityTag } from './SeverityTag';
import { SpecRefLink } from './SpecRefLink';
import { StatusPill } from './StatusPill';

/**
 * Every result can be opened to the evidence it rests on. A directory that
 * says "this anchor fails SEP-10" without showing what was requested and what
 * came back is asking to be trusted rather than checked, which is the
 * opposite of the point.
 */
export function CheckRow({ result }: { result: CheckResult }) {
  const hasDetails = result.message !== null || result.evidence.length > 0;

  return (
    <li className="border-b border-slate-100 last:border-0">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 hover:bg-slate-50">
          <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <StatusPill status={result.status} />
            <SeverityTag severity={result.severity} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-slate-900">{result.title}</span>
            <span className="block truncate font-mono text-xs text-slate-500">
              {result.checkId}
            </span>
          </span>
          <span className="shrink-0 pt-0.5 text-xs text-slate-400 group-open:hidden">
            {hasDetails ? 'Details' : ''}
          </span>
          <span className="hidden shrink-0 pt-0.5 text-xs text-slate-400 group-open:inline">
            Hide
          </span>
        </summary>

        <div className="space-y-3 px-4 pt-1 pb-4">
          {result.message ? (
            <p className="text-sm text-slate-700">{result.message}</p>
          ) : (
            <p className="text-sm text-slate-500">This check produced no message.</p>
          )}

          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-slate-500">Spec reference</dt>
            <dd className="text-slate-700">
              <SpecRefLink specRef={result.specRef} />
            </dd>
            <dt className="text-slate-500">Duration</dt>
            <dd className="tabular-nums text-slate-700">{formatDuration(result.durationMs)}</dd>
          </dl>

          <EvidenceList evidence={result.evidence} />
        </div>
      </details>
    </li>
  );
}

function EvidenceList({ evidence }: { evidence: readonly Evidence[] }) {
  if (evidence.length === 0) {
    return <p className="text-xs text-slate-500">No HTTP exchange was recorded for this check.</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Evidence ({evidence.length})
      </h4>
      {evidence.map((item, index) => (
        <div
          key={`${item.method}-${item.url}-${index}`}
          className="rounded-md border border-slate-200"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
            <code className="font-mono font-semibold text-slate-700">{item.method}</code>
            <code className="min-w-0 flex-1 truncate font-mono text-slate-600" title={item.url}>
              {item.url}
            </code>
            <span className="tabular-nums text-slate-500">{item.statusCode}</span>
          </div>

          {item.headers !== undefined && Object.keys(item.headers).length > 0 ? (
            <dl className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-0.5 px-3 py-2 text-xs">
              {Object.entries(item.headers).map(([name, value]) => (
                <div key={name} className="contents">
                  <dt className="truncate font-mono text-slate-500" title={name}>
                    {name}
                  </dt>
                  <dd className="break-all font-mono text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="px-3 py-2 text-xs text-slate-500">
              No response headers were recorded for this exchange.
            </p>
          )}

          {item.body ? (
            <div className="border-t border-slate-200">
              <pre className="max-h-64 overflow-auto px-3 py-2 text-xs whitespace-pre-wrap text-slate-700">
                <code>{item.body}</code>
              </pre>
              <p className="border-t border-slate-100 px-3 py-1 text-[11px] text-slate-400">
                The checks package truncates a stored body to 2 KB and redacts it before
                persistence.
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
