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
    <div className="space-y-6">
      {/*
       * The hero: one sentence of what this is, set large in the display
       * face, so the first screen answers "what am I looking at" before any
       * data asks to be parsed.
       */}
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          Stellar anchor conformance directory
        </h1>
        <p className="mt-3 text-sm font-medium tracking-wide text-signal uppercase">
          Every public anchor, graded against the SEPs it claims
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
          Whether public Stellar anchors conform to the Stellar Ecosystem Proposals they claim to
          implement. Checks run read-only against the unauthenticated surface on a{' '}
          <strong className="font-medium">15-minute schedule</strong>, not continuously. A grade
          below is the share of the applicable <code className="font-mono text-xs">MUST</code>{' '}
          checks that passed;{' '}
          <Link to="/about" className="underline decoration-line underline-offset-2 transition-colors hover:text-signal">
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
            <span className="text-xs text-ink-faint">
              An anchor that does not implement a SEP is not listed for it.
            </span>
          }
        />
        <div className="border-b border-line">
          <DirectoryFilters filters={filters} seps={seps} onChange={setFilter} onReset={reset} />
        </div>
        {results}
      </Panel>
    </div>
  );
}
