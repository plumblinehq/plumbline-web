import { useMemo, useState } from 'react';
import type { CheckDefinition } from '../api/types';
import { useChecks } from '../api/queries';
import { Panel, PanelHeader } from '../components/Panel';
import { SeverityTag } from '../components/SeverityTag';
import { SpecRefLink } from '../components/SpecRefLink';
import { ErrorPanel, LoadingPanel } from '../components/StatePanels';
import { groupBySep, sepLabel } from '../lib/format';

export function ChecksPage() {
  const catalogue = useChecks();
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const matches = (catalogue.data ?? []).filter((check) => matchesQuery(check, query));
    return groupBySep(matches);
  }, [catalogue.data, query]);

  const shown = [...grouped.values()].reduce((total, group) => total + group.length, 0);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Check catalogue</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          Every check Plumbline can run, published by the API from the checks package itself — so
          this is the list that actually runs, not a copy of it. Each one enforces a clause in a
          Stellar Ecosystem Proposal, and its severity is that clause&apos;s own wording:{' '}
          <code className="font-mono text-xs">MUST</code> maps to error,{' '}
          <code className="font-mono text-xs">SHOULD</code> to warning, and anything else to an
          observation that does not affect a score.
        </p>
      </header>

      <Panel>
        <PanelHeader
          title="Checks"
          description={
            catalogue.data === undefined
              ? 'Loading the catalogue.'
              : `${shown} check${shown === 1 ? '' : 's'}.`
          }
          aside={
            <label className="flex items-center gap-2 text-xs text-ink-soft">
              <span className="sr-only">Search checks</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search…"
                className="w-48 rounded-md border border-line bg-raised px-2 py-1 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-signal focus:outline-none"
              />
            </label>
          }
        />

        {catalogue.isPending ? (
          <LoadingPanel label="Loading the catalogue" />
        ) : catalogue.isError ? (
          <ErrorPanel error={catalogue.error} onRetry={() => void catalogue.refetch()} />
        ) : grouped.size === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-faint">
            No check matches “{query}”.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {[...grouped.entries()].map(([sep, checks]) => (
              <section key={sep}>
                <h2 className="flex flex-wrap items-baseline gap-2 px-4 pt-4 pb-1">
                  <span className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    {sepLabel(sep)}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {`· ${checks.length} check${checks.length === 1 ? '' : 's'}`}
                  </span>
                </h2>
                <ul>
                  {checks.map((check) => (
                    <li
                      key={check.id}
                      className="border-b border-line-soft px-4 py-3.5 last:border-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityTag severity={check.severity} />
                        <span className="text-sm text-ink">{check.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">{check.description}</p>
                      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <div className="flex gap-1">
                          <dt className="text-ink-faint">id</dt>
                          <dd className="font-mono text-ink-soft">{check.id}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="text-ink-faint">spec</dt>
                          <dd className="text-ink-soft"><SpecRefLink specRef={check.specRef} /></dd>
                        </div>
                        {check.requires.length > 0 ? (
                          <div className="flex gap-1">
                            <dt className="text-ink-faint">requires</dt>
                            <dd className="font-mono text-ink-soft">
                              {check.requires.join(', ')}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/**
 * Filtering the catalogue happens in the browser because the API has no
 * search endpoint for it; this narrows the rendered list and derives nothing.
 */
function matchesQuery(check: CheckDefinition, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  return [check.id, check.title, check.description, check.specRef]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}
