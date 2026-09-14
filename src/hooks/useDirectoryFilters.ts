import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { AnchorQuery, AnchorSort, Network } from '../api/types';

/**
 * Filters live in the URL, not in component state: a filtered directory is a
 * link someone can paste into a wallet team's chat, and the server already
 * implements every one of these filters — re-deriving them here would make
 * the web app a second, disagreeing implementation of the same query.
 */
export interface DirectoryFilters {
  network: Network | undefined;
  sep: number | undefined;
  minScore: number | undefined;
  sort: AnchorSort;
}

export const DEFAULT_FILTERS: DirectoryFilters = {
  network: undefined,
  sep: undefined,
  minScore: undefined,
  sort: 'name',
};

const NETWORKS: readonly string[] = ['pubnet', 'testnet'];
const SORTS: readonly string[] = ['name', 'score'];

export const MIN_SCORE_CHOICES: ReadonlyArray<{ value: number; label: string }> = [
  { value: 0.9, label: '90% or better' },
  { value: 0.7, label: '70% or better' },
  { value: 0.5, label: '50% or better' },
];

/**
 * A hand-edited or stale URL must not produce an error page or a request the
 * API rejects with a 400, so anything unrecognised is treated as "no filter".
 */
export function parseDirectoryFilters(params: URLSearchParams): DirectoryFilters {
  const network = params.get('network');
  const sepRaw = params.get('sep');
  const minScoreRaw = params.get('min_score');
  const sortRaw = params.get('sort');

  // Digits only: parseInt would quietly turn a mangled `sep=2.5` into 2.
  const sep = sepRaw !== null && /^\d+$/.test(sepRaw) ? Number.parseInt(sepRaw, 10) : Number.NaN;
  const minScore = minScoreRaw === null ? Number.NaN : Number(minScoreRaw);

  return {
    network: network !== null && NETWORKS.includes(network) ? (network as Network) : undefined,
    sep: Number.isInteger(sep) && sep > 0 ? sep : undefined,
    minScore: Number.isFinite(minScore) && minScore >= 0 && minScore <= 1 ? minScore : undefined,
    sort: sortRaw !== null && SORTS.includes(sortRaw) ? (sortRaw as AnchorSort) : 'name',
  };
}

/** Defaults are omitted so the unfiltered directory has a clean URL. */
export function toSearchParams(filters: DirectoryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.network !== undefined) {
    params.set('network', filters.network);
  }
  if (filters.sep !== undefined) {
    params.set('sep', String(filters.sep));
  }
  if (filters.minScore !== undefined) {
    params.set('min_score', String(filters.minScore));
  }
  if (filters.sort !== 'name') {
    params.set('sort', filters.sort);
  }
  return params;
}

export function toAnchorQuery(filters: DirectoryFilters): AnchorQuery {
  return {
    network: filters.network,
    sep: filters.sep,
    minScore: filters.minScore,
    sort: filters.sort,
  };
}

export function isDefaultFilters(filters: DirectoryFilters): boolean {
  return (
    filters.network === undefined &&
    filters.sep === undefined &&
    filters.minScore === undefined &&
    filters.sort === 'name'
  );
}

export interface DirectoryFiltersState {
  filters: DirectoryFilters;
  setFilter: <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => void;
  reset: () => void;
}

export function useDirectoryFilters(): DirectoryFiltersState {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseDirectoryFilters(searchParams), [searchParams]);

  const setFilter = useCallback<DirectoryFiltersState['setFilter']>(
    (key, value) => {
      const next = { ...parseDirectoryFilters(searchParams), [key]: value } as DirectoryFilters;
      // Replace rather than push: filtering is not navigation, and a back
      // button that walks through every keystroke of a filter is a nuisance.
      setSearchParams(toSearchParams(next), { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return { filters, setFilter, reset };
}
