import type {
  AnchorDetail,
  AnchorQuery,
  AnchorSummary,
  CheckDefinition,
  CheckResult,
  Evidence,
  HistoryPoint,
  Run,
  RunSummary,
} from './types';

/**
 * Used when VITE_API_BASE is unset so `npm run dev` works against the public
 * deployment with no setup. The value is baked in at build time: see
 * `.env.example`, and set it on the host before building.
 */
export const DEFAULT_API_BASE = 'https://plumbline-server.onrender.com';

/** A trailing slash here would produce `//api/anchors`, which the API 404s. */
export function resolveApiBase(configured: string | undefined): string {
  const trimmed = configured?.trim() ?? '';
  const base = trimmed.length > 0 ? trimmed : DEFAULT_API_BASE;
  return base.replace(/\/+$/, '');
}

export const apiBase = resolveApiBase(import.meta.env.VITE_API_BASE);

export class ApiError extends Error {
  readonly url: string;
  readonly status: number;

  constructor(url: string, status: number, statusText: string) {
    super(`The Plumbline API returned ${status} ${statusText} for ${url}`);
    this.name = 'ApiError';
    this.url = url;
    this.status = status;
  }
}

/** The subset of `Response` the client uses, so tests can supply a plain object. */
export interface HttpResponseLike {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<HttpResponseLike>;

/**
 * `evidence` is stored as JSONB and serialised as a JSON *string* by the API,
 * so it arrives as text and has to be parsed here. Anything unrecognised is
 * dropped rather than rendered: a broken evidence payload must not blank the
 * page that exists to show it.
 */
export function parseEvidence(raw: unknown): Evidence[] {
  if (typeof raw !== 'string' || raw.length === 0) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isEvidence);
}

function isEvidence(value: unknown): value is Evidence {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.method === 'string' &&
    typeof candidate.url === 'string' &&
    typeof candidate.statusCode === 'number'
  );
}

/** Builds the query string for `/api/anchors`, omitting unset filters. */
export function buildAnchorsQuery(query: AnchorQuery): string {
  const params = new URLSearchParams();
  if (query.network !== undefined) {
    params.set('network', query.network);
  }
  if (query.sep !== undefined) {
    params.set('sep', String(query.sep));
  }
  if (query.minScore !== undefined) {
    params.set('min_score', String(query.minScore));
  }
  if (query.sort !== undefined) {
    params.set('sort', query.sort);
  }
  const serialised = params.toString();
  return serialised.length > 0 ? `?${serialised}` : '';
}

interface RawCheckResult extends Omit<CheckResult, 'evidence'> {
  evidence?: unknown;
}

interface RawRun extends Omit<Run, 'results'> {
  results?: RawCheckResult[];
}

interface RawAnchorDetail extends Omit<AnchorDetail, 'latestRun'> {
  latestRun?: RawRun | null;
}

function mapCheckResult(raw: RawCheckResult): CheckResult {
  return { ...raw, evidence: parseEvidence(raw.evidence) };
}

function mapRun(raw: RawRun): Run {
  return { ...raw, results: (raw.results ?? []).map(mapCheckResult) };
}

function mapAnchorDetail(raw: RawAnchorDetail): AnchorDetail {
  return { ...raw, latestRun: raw.latestRun ? mapRun(raw.latestRun) : null };
}

export interface ApiClient {
  readonly baseUrl: string;
  listAnchors(query?: AnchorQuery, signal?: AbortSignal): Promise<AnchorSummary[]>;
  getAnchor(homeDomain: string, signal?: AbortSignal): Promise<AnchorDetail>;
  listRuns(homeDomain: string, limit: number, signal?: AbortSignal): Promise<RunSummary[]>;
  getHistory(homeDomain: string, days: number, signal?: AbortSignal): Promise<HistoryPoint[]>;
  getRun(runId: string, signal?: AbortSignal): Promise<Run>;
  listChecks(signal?: AbortSignal): Promise<CheckDefinition[]>;
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetch?: FetchLike;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? apiBase;
  const fetchImpl: FetchLike =
    options.fetch ?? ((input, init) => globalThis.fetch(input, init) as Promise<HttpResponseLike>);

  async function getJson(path: string, signal?: AbortSignal): Promise<unknown> {
    const url = `${baseUrl}${path}`;
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      throw new ApiError(url, response.status, response.statusText);
    }

    return response.json();
  }

  return {
    baseUrl,

    async listAnchors(query = {}, signal) {
      const payload = await getJson(`/api/anchors${buildAnchorsQuery(query)}`, signal);
      return payload as AnchorSummary[];
    },

    async getAnchor(homeDomain, signal) {
      const payload = await getJson(`/api/anchors/${encodeURIComponent(homeDomain)}`, signal);
      return mapAnchorDetail(payload as RawAnchorDetail);
    },

    async listRuns(homeDomain, limit, signal) {
      const payload = await getJson(
        `/api/anchors/${encodeURIComponent(homeDomain)}/runs?limit=${limit}`,
        signal,
      );
      return payload as RunSummary[];
    },

    async getHistory(homeDomain, days, signal) {
      const payload = await getJson(
        `/api/anchors/${encodeURIComponent(homeDomain)}/history?days=${days}`,
        signal,
      );
      return payload as HistoryPoint[];
    },

    async getRun(runId, signal) {
      const payload = await getJson(`/api/runs/${encodeURIComponent(runId)}`, signal);
      return mapRun(payload as RawRun);
    },

    async listChecks(signal) {
      const payload = await getJson('/api/checks', signal);
      return payload as CheckDefinition[];
    },
  };
}

export const api = createApiClient();

/** The badge the API will serve for an anchor, for the embed snippet. */
export function badgeUrl(homeDomain: string, baseUrl: string = apiBase): string {
  return `${baseUrl}/badge/${encodeURIComponent(homeDomain)}.svg`;
}
