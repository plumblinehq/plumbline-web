import type { Network } from '../api/types';
import {
  isDefaultFilters,
  MIN_SCORE_CHOICES,
  type DirectoryFilters as Filters,
} from '../hooks/useDirectoryFilters';
import { sepLabel } from '../lib/format';

const ALL = 'all';

const SELECT_CLASS =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none';

const LABEL_CLASS = 'flex flex-col gap-1 text-xs font-medium text-slate-600';

export function DirectoryFilters({
  filters,
  seps,
  onChange,
  onReset,
}: {
  filters: Filters;
  /** Offered SEPs, taken from the published catalogue rather than assumed. */
  seps: readonly number[];
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4 px-4 py-3">
      <label className={LABEL_CLASS} htmlFor="filter-network">
        Network
        <select
          id="filter-network"
          className={SELECT_CLASS}
          value={filters.network ?? ALL}
          onChange={(event) =>
            onChange(
              'network',
              event.target.value === ALL ? undefined : (event.target.value as Network),
            )
          }
        >
          <option value={ALL}>Any network</option>
          <option value="pubnet">pubnet</option>
          <option value="testnet">testnet</option>
        </select>
      </label>

      <label className={LABEL_CLASS} htmlFor="filter-sep">
        Implements
        <select
          id="filter-sep"
          className={SELECT_CLASS}
          value={filters.sep === undefined ? ALL : String(filters.sep)}
          onChange={(event) =>
            onChange('sep', event.target.value === ALL ? undefined : Number(event.target.value))
          }
        >
          <option value={ALL}>Any SEP</option>
          {seps.map((sep) => (
            <option key={sep} value={sep}>
              {sepLabel(sep)}
            </option>
          ))}
        </select>
      </label>

      <label className={LABEL_CLASS} htmlFor="filter-min-score">
        Minimum score
        <select
          id="filter-min-score"
          className={SELECT_CLASS}
          value={filters.minScore === undefined ? ALL : String(filters.minScore)}
          onChange={(event) =>
            onChange(
              'minScore',
              event.target.value === ALL ? undefined : Number(event.target.value),
            )
          }
        >
          <option value={ALL}>Any score</option>
          {MIN_SCORE_CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </label>

      <label className={LABEL_CLASS} htmlFor="filter-sort">
        Sort by
        <select
          id="filter-sort"
          className={SELECT_CLASS}
          value={filters.sort}
          onChange={(event) => onChange('sort', event.target.value as Filters['sort'])}
        >
          <option value="name">Name</option>
          <option value="score">Score, best first</option>
        </select>
      </label>

      {isDefaultFilters(filters) ? null : (
        <button
          type="button"
          onClick={onReset}
          className="rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
