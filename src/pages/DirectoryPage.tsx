import { Link } from 'react-router';
import { useAnchors } from '../api/queries';
import { AnchorTable } from '../components/AnchorTable';
import { Panel } from '../components/Panel';
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../components/StatePanels';

export function DirectoryPage() {
  const anchors = useAnchors({});

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

      {anchors.isPending ? (
        <LoadingPanel label="Loading anchors" />
      ) : anchors.isError ? (
        <ErrorPanel error={anchors.error} onRetry={() => void anchors.refetch()} />
      ) : anchors.data.length === 0 ? (
        <EmptyPanel message="No anchors are being monitored yet." />
      ) : (
        <Panel>
          <AnchorTable anchors={anchors.data} />
        </Panel>
      )}
    </div>
  );
}
