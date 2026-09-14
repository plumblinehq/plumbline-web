/**
 * The shape of the Plumbline server API, mirrored here so the UI is typed
 * against real fields. Nothing in this directory derives a number: every
 * score, grade and count below is computed in `plumbline-server` and rendered
 * as received. If a value is missing here, it is missing in the API — add it
 * there first, then bump this file.
 */

export type CheckStatus = 'pass' | 'fail' | 'skip' | 'error';

/** Severity is the spec's own language: MUST is `error`, SHOULD is `warning`. */
export type Severity = 'error' | 'warning' | 'info';

export type RunStatus = 'running' | 'complete' | 'aborted';

export type Network = 'pubnet' | 'testnet';

/** The only ordering the API implements. */
export type AnchorSort = 'name' | 'score';

/** One recorded HTTP exchange: what the check actually saw. */
export interface Evidence {
  method: string;
  url: string;
  statusCode: number;
  headers: Record<string, string>;
  /** Response body, truncated and redacted by the checks package before storage. */
  body?: string;
}

export interface Grade {
  sep: number;
  score: number;
  /** False for a SEP the anchor does not implement; excluded from the overall score. */
  applicable: boolean;
}

export interface CheckResult {
  checkId: string;
  sep: number;
  status: CheckStatus;
  severity: Severity;
  message: string | null;
  specRef: string | null;
  evidence: Evidence[];
  durationMs: number | null;
  title: string;
}

export interface Run {
  id: string;
  anchorId: string;
  homeDomain: string;
  network: string;
  startedAt: string;
  finishedAt: string | null;
  status: RunStatus;
  overallScore: number | null;
  /** The checks package version that produced this run. */
  checksLibVersion: string;
  grades: Grade[];
  results: CheckResult[];
}

export interface AnchorSummary {
  id: string;
  homeDomain: string;
  network: string;
  displayName: string | null;
  optedOut: boolean;
  lastRunId: string | null;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  overallScore: number | null;
  grades: Grade[];
}

export interface AnchorDetail {
  id: string;
  homeDomain: string;
  network: string;
  displayName: string | null;
  addedAt: string;
  optedOut: boolean;
  optOutNote: string | null;
  latestRun: Run | null;
}

export interface RunCounts {
  pass: number;
  fail: number;
  skip: number;
  error: number;
}

export interface RunSummary {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: RunStatus;
  overallScore: number | null;
  checksLibVersion: string;
  counts: RunCounts;
}

export interface HistoryPoint {
  runId: string;
  startedAt: string;
  overallScore: number | null;
  grades: Grade[];
}

/** One entry in the check catalogue the API publishes from the checks package. */
export interface CheckDefinition {
  id: string;
  sep: number;
  title: string;
  description: string;
  severity: Severity;
  specRef: string;
  requires: string[];
}

export interface AnchorQuery {
  network?: Network;
  sep?: number;
  minScore?: number;
  sort?: AnchorSort;
}
