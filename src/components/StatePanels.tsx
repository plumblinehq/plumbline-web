import { ApiError, apiBase } from '../api/client';
import { Panel } from './Panel';

export function LoadingPanel({ label = 'Loading' }: { label?: string }) {
  return (
    <Panel className="p-8">
      <div className="flex items-center justify-center gap-3 text-sm text-ink-faint" role="status">
        <span
          className="size-4 animate-spin rounded-full border-2 border-raised border-t-signal"
          aria-hidden="true"
        />
        {label}…
      </div>
    </Panel>
  );
}

/**
 * The server runs on a free plan and sleeps when idle, so the first request
 * after a quiet spell can take the better part of a minute. Saying so is
 * kinder than a bare "something went wrong", and it is a fact about this
 * deployment rather than an excuse.
 */
const COLD_START_HINT =
  'The API sleeps when idle and takes up to a minute to answer a first request. Retrying usually works.';

export function ErrorPanel({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const isApiError = error instanceof ApiError;
  /**
   * A non-HTTP failure means the request never got an answer — the free
   * tier spinning up, or the browser blocking the request. Showing the raw
   * TypeError there names our plumbing, not the reader's problem; the honest
   * message is what happened and that retrying works.
   */
  const isNetworkError = !isApiError && error instanceof Error;
  const heading = isApiError
    ? error.status === 404
      ? 'Not found'
      : 'Could not load this data'
    : isNetworkError
      ? 'Could not reach the API'
      : 'Could not load this data';

  return (
    <Panel className="p-6">
      <div role="alert">
        <h2 className="text-sm font-semibold text-rose-400">{heading}</h2>
        {isApiError ? (
          <p className="mt-1 text-sm text-ink-soft">{error.message}</p>
        ) : isNetworkError ? (
          <p className="mt-1 text-sm text-ink-soft">
            The request failed before the API answered. This is what its free tier waking up looks
            like from the outside.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">An unexpected error occurred.</p>
        )}
        <p className="mt-2 text-xs text-ink-faint">{COLD_START_HINT}</p>
        <p className="mt-2 text-xs text-ink-faint">
          API base: <code className="font-mono">{apiBase}</code>
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}            className="mt-4 rounded-md bg-signal px-3 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-signal-soft">
            Retry
          </button>
        ) : null}
      </div>
    </Panel>
  );
}

export function EmptyPanel({ message }: { message: string }) {
  return (
    <Panel className="p-8 text-center text-sm text-ink-faint">
      <p>{message}</p>
    </Panel>
  );
}
