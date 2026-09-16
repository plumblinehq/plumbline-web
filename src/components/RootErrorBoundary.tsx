import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Panel } from './Panel';

/**
 * Routed errors — a bad URL, a thrown render — land here rather than on a
 * blank screen. The data-loading failures are handled per page instead, so a
 * failed request never takes the header and navigation down with it.
 */
export function RootErrorBoundary() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong';
  const detail = isRouteErrorResponse(error)
    ? ((error.data as string | undefined) ?? 'That page could not be found.')
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <Panel className="p-6">
      <h1 className="text-base font-semibold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{detail}</p>
      <a
        className="mt-4 inline-block text-sm font-medium text-ink underline decoration-line underline-offset-2 transition-colors hover:text-signal"
        href="/"
      >
        Back to the directory
      </a>
    </Panel>
  );
}
