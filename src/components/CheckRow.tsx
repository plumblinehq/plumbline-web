import type { CheckResult, Evidence } from '../api/types';
import { formatDuration } from '../lib/format';
import { SeverityTag } from './SeverityTag';
import { SpecRefLink } from './SpecRefLink';
import { StatusPill } from './StatusPill';

/**
 * A two-pixel rail on the row's left edge, tinted by status, so the list
 * reads as a column of verdicts before a single word is parsed. Full class
 * strings, because Tailwind scans source text.
 */
const STATUS_RAIL: Record<CheckResult['status'], string> = {
  pass: 'border-l-emerald-500',
  fail: 'border-l-rose-500',
  skip: 'border-l-line',
  error: 'border-l-fuchsia-500',
};

/**
 * Every result can be opened to the evidence it rests on. A directory that
 * says "this anchor fails SEP-10" without showing what was requested and what
 * came back is asking to be trusted rather than checked, which is the
 * opposite of the point.
 */
export function CheckRow({ result }: { result: CheckResult }) {
  const hasDetails = result.message !== null || result.evidence.length > 0;

  return (
    <li
      className={`border-y-0 border-b border-l-2 border-line-soft ${STATUS_RAIL[result.status]} last:border-b-0`}
    >
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 transition-colors hover:bg-raised/60 sm:px-5">
          <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <StatusPill status={result.status} />
            <SeverityTag severity={result.severity} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-ink">{result.title}</span>
            <span className="block truncate font-mono text-xs text-ink-faint">
              {result.checkId}
            </span>
          </span>
          <span className="shrink-0 pt-0.5 text-xs text-ink-faint group-open:hidden">
            {hasDetails ? 'Details' : ''}
          </span>
          <span className="hidden shrink-0 pt-0.5 text-xs text-ink-faint group-open:inline">
            Hide
          </span>
        </summary>

        <div className="space-y-3 px-4 pt-1 pb-4 sm:px-5">
          {result.message ? (
            <p className="text-sm text-ink-soft">{result.message}</p>
          ) : (
            <p className="text-sm text-ink-faint">This check produced no message.</p>
          )}

          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-ink-faint">Spec reference</dt>
            <dd className="text-ink-soft">
              <SpecRefLink specRef={result.specRef} />
            </dd>
            <dt className="text-ink-faint">Duration</dt>
            <dd className="tabular-nums text-ink-soft">{formatDuration(result.durationMs)}</dd>
          </dl>

          <EvidenceList evidence={result.evidence} />
        </div>
      </details>
    </li>
  );
}

function EvidenceList({ evidence }: { evidence: readonly Evidence[] }) {
  if (evidence.length === 0) {
    return <p className="text-xs text-ink-faint">No HTTP exchange was recorded for this check.</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium tracking-wide text-ink-faint uppercase">
        Evidence ({evidence.length})
      </h4>
      {evidence.map((item, index) => (
        <div
          key={`${item.method}-${item.url}-${index}`}
          className="rounded-md border border-line"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-raised/50 px-3 py-1.5 text-xs">
            <code className="font-mono font-semibold text-signal">{item.method}</code>
            <code className="min-w-0 flex-1 truncate font-mono text-ink-soft" title={item.url}>
              {item.url}
            </code>
            <span className="tabular-nums text-ink-faint">{item.statusCode}</span>
          </div>

          {item.headers !== undefined && Object.keys(item.headers).length > 0 ? (
            <dl className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-0.5 px-3 py-2 text-xs">
              {Object.entries(item.headers).map(([name, value]) => (
                <div key={name} className="contents">
                  <dt className="truncate font-mono text-ink-faint" title={name}>
                    {name}
                  </dt>
                  <dd className="break-all font-mono text-ink-soft">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="px-3 py-2 text-xs text-ink-faint">
              No response headers were recorded for this exchange.
            </p>
          )}

          {item.body ? (
            <div className="border-t border-line">
              <pre className="max-h-64 overflow-auto bg-canvas/40 px-3 py-2 text-xs whitespace-pre-wrap text-ink-soft">
                <code>{item.body}</code>
              </pre>
              <p className="border-t border-line-soft px-3 py-1 text-[11px] text-ink-faint">
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
