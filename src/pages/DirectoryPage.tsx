import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useAnchors, useChecks } from '../api/queries';
import { AnchorTable } from '../components/AnchorTable';
import { DirectoryFilters } from '../components/DirectoryFilters';
import { Panel, PanelHeader } from '../components/Panel';
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../components/StatePanels';
import { isDefaultFilters, toAnchorQuery, useDirectoryFilters } from '../hooks/useDirectoryFilters';

export function DirectoryPage() {
  const { filters, setFilter, reset } = useDirectoryFilters();
  const query = useMemo(() => toAnchorQuery(filters), [filters]);
  const anchors = useAnchors(query);
  const checks = useChecks();

  // The SEP filter offers what the catalogue actually grades, so it cannot
  // drift from the checks that run.
  const seps = useMemo(() => {
    const found = new Set<number>();
    for (const check of checks.data ?? []) {
      found.add(check.sep);
    }
    return [...found].sort((a, b) => a - b);
  }, [checks.data]);

  const count = anchors.data?.length ?? 0;
  const filtered = !isDefaultFilters(filters);

  let results: ReactNode;
  if (anchors.isPending) {
    results = <LoadingPanel label="Loading anchors" />;
  } else if (anchors.isError) {
    results = <ErrorPanel error={anchors.error} onRetry={() => void anchors.refetch()} />;
  } else if (anchors.data.length === 0) {
    // The clear action lives in the filter bar directly above, so the empty
    // state points at it rather than rendering a second identical button.
    results = filtered ? (
      <EmptyPanel message="No anchors match these filters. Clear them above to see the full list." />
    ) : (
      <EmptyPanel message="No anchors are being monitored yet." />
    );
  } else {
    results = <AnchorTable anchors={anchors.data} />;
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Stellar anchor conformance directory
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Whether public Stellar anchors conform to the Stellar Ecosystem Proposals they claim to
          implement. Checks run read-only against the unauthenticated surface on a{' '}
          <strong className="font-medium">15-minute schedule</strong>, not continuously. A grade
          below is the share of the applicable <code className="font-mono text-xs">MUST</code>{' '}
          checks that passed;{' '}
          <Link to="/about" className="underline decoration-slate-300 underline-offset-2">
            how grades are computed
          </Link>
          .
        </p>
      </header>

      <Panel>
        <PanelHeader
          title="Anchors"
          description={
            anchors.data === undefined
              ? 'Loading the anchor list.'
              : `${count} anchor${count === 1 ? '' : 's'} match${count === 1 ? 'es' : ''} these filters.`
          }
          aside={
            <span className="text-xs text-slate-500">
              An anchor that does not implement a SEP is not listed for it.
            </span>
          }
        />
        <div className="border-b border-slate-200">
          <DirectoryFilters filters={filters} seps={seps} onChange={setFilter} onReset={reset} />
        </div>
        {results}
      </Panel>
    </div>
  );
}
