import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { AnchorQuery } from './types';

/**
 * Every request carries its parameters, so a change to any of them is a new
 * cache entry rather than a stale one. That matters on the directory, where
 * the filters are in the URL and two tabs can legitimately show different
 * views of the same anchor list.
 */
export const queryKeys = {
  anchors: (query: AnchorQuery) => ['anchors', query] as const,
  anchor: (homeDomain: string) => ['anchor', homeDomain] as const,
  runs: (homeDomain: string, limit: number) => ['runs', homeDomain, limit] as const,
  history: (homeDomain: string, days: number) => ['history', homeDomain, days] as const,
  run: (runId: string) => ['run', runId] as const,
  checks: () => ['checks'] as const,
};

export function useAnchors(query: AnchorQuery) {
  return useQuery({
    queryKey: queryKeys.anchors(query),
    queryFn: ({ signal }) => api.listAnchors(query, signal),
  });
}

export function useAnchor(homeDomain: string) {
  return useQuery({
    queryKey: queryKeys.anchor(homeDomain),
    queryFn: ({ signal }) => api.getAnchor(homeDomain, signal),
    enabled: homeDomain.length > 0,
  });
}

export function useRuns(homeDomain: string, limit = 20) {
  return useQuery({
    queryKey: queryKeys.runs(homeDomain, limit),
    queryFn: ({ signal }) => api.listRuns(homeDomain, limit, signal),
    enabled: homeDomain.length > 0,
  });
}

export function useHistory(homeDomain: string, days = 30) {
  return useQuery({
    queryKey: queryKeys.history(homeDomain, days),
    queryFn: ({ signal }) => api.getHistory(homeDomain, days, signal),
    enabled: homeDomain.length > 0,
  });
}

export function useRun(runId: string) {
  return useQuery({
    queryKey: queryKeys.run(runId),
    queryFn: ({ signal }) => api.getRun(runId, signal),
    enabled: runId.length > 0,
  });
}

export function useChecks() {
  return useQuery({
    queryKey: queryKeys.checks(),
    queryFn: ({ signal }) => api.listChecks(signal),
    // The catalogue only changes when the server bumps its checks dependency,
    // which is a deploy, so it can sit in cache far longer than run data.
    staleTime: 30 * 60 * 1000,
  });
}
