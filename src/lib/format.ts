import type {
  AnchorSummary,
  CheckResult,
  CheckStatus,
  Grade,
  RunCounts,
  Severity,
} from '../api/types';

/**
 * Presentation only. The score itself is computed once, in
 * `plumbline-server`, and every number below is that score rendered for a
 * human. These buckets decide a colour, never a grade, and the methodology
 * page says so explicitly so nobody mistakes them for a second scoring rule.
 */
export type ScoreTone = 'good' | 'fair' | 'poor' | 'unknown';

/** Shown wherever a score is missing, so an absent value never renders as zero. */
export const EMPTY_VALUE = '—';

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return EMPTY_VALUE;
  }
  return `${(score * 100).toFixed(1)}%`;
}

export function scoreTone(score: number | null | undefined): ScoreTone {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return 'unknown';
  }
  if (score >= 0.9) {
    return 'good';
  }
  if (score >= 0.7) {
    return 'fair';
  }
  return 'poor';
}

export function sepLabel(sep: number): string {
  return `SEP-${sep}`;
}

const STATUS_RANK: Record<CheckStatus, number> = { error: 0, fail: 1, pass: 2, skip: 3 };
const SEVERITY_RANK: Record<Severity, number> = { error: 0, warning: 1, info: 2 };

/**
 * What a reader wants first is what is broken: a check Plumbline could not
 * complete, then a failure, then passes, then skips. Within a status, the
 * failures that carry spec weight lead.
 */
export function sortResultsForDisplay(results: readonly CheckResult[]): CheckResult[] {
  return [...results].sort((a, b) => {
    const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (byStatus !== 0) {
      return byStatus;
    }
    const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (bySeverity !== 0) {
      return bySeverity;
    }
    return a.checkId < b.checkId ? -1 : a.checkId > b.checkId ? 1 : 0;
  });
}

export function groupBySep<T extends { sep: number }>(results: readonly T[]): Map<number, T[]> {
  const grouped = new Map<number, T[]>();
  for (const result of results) {
    const bucket = grouped.get(result.sep);
    if (bucket === undefined) {
      grouped.set(result.sep, [result]);
    } else {
      bucket.push(result);
    }
  }
  return new Map([...grouped.entries()].sort(([a], [b]) => a - b));
}

export function applicableGrades(grades: readonly Grade[]): Grade[] {
  return grades.filter((grade) => grade.applicable);
}

/**
 * The per-SEP columns of the directory come from the data rather than a
 * hard-coded 1-and-10, so a SEP the server starts grading shows up here with
 * no web change.
 */
export function sepColumns(anchors: readonly AnchorSummary[]): number[] {
  const seps = new Set<number>();
  for (const anchor of anchors) {
    for (const grade of anchor.grades) {
      seps.add(grade.sep);
    }
  }
  return [...seps].sort((a, b) => a - b);
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) {
    return EMPTY_VALUE;
  }
  if (ms < 1000) {
    return `${ms} ms`;
  }
  return `${(ms / 1000).toFixed(1)} s`;
}

/**
 * Elapsed time between the two timestamps the API already returns. This is a
 * display of that pair, not a new measurement, so it belongs here rather than
 * warranting a server change.
 */
export function formatElapsed(startIso: string, endIso: string | null): string {
  if (endIso === null) {
    return EMPTY_VALUE;
  }
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return EMPTY_VALUE;
  }
  return formatDuration(end - start);
}

const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const RELATIVE_UNITS: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
];

/** `now` is injectable so the rendering is deterministic under test. */
export function formatRelativeTime(iso: string | null | undefined, now: Date = new Date()): string {
  if (iso === null || iso === undefined) {
    return EMPTY_VALUE;
  }
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) {
    return EMPTY_VALUE;
  }

  const difference = then - now.getTime();
  for (const [unit, milliseconds] of RELATIVE_UNITS) {
    if (Math.abs(difference) >= milliseconds) {
      return RELATIVE.format(Math.round(difference / milliseconds), unit);
    }
  }
  return 'just now';
}

const TIMESTAMP = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export function formatTimestamp(iso: string | null | undefined): string {
  if (iso === null || iso === undefined) {
    return EMPTY_VALUE;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }
  return `${TIMESTAMP.format(date)} UTC`;
}

/**
 * Counts the rows currently on screen, which is a description of the list and
 * not a score. The denominator that decides a grade is the API's, and this
 * function must never be used to re-derive one.
 */
export function countByStatus(results: readonly CheckResult[]): RunCounts {
  const counts: RunCounts = { pass: 0, fail: 0, skip: 0, error: 0 };
  for (const result of results) {
    counts[result.status] += 1;
  }
  return counts;
}

/** `38 pass · 3 fail · 11 skip`, skipping the counts that are zero. */
export function formatCounts(counts: RunCounts): string {
  const parts = [
    `${counts.pass} pass`,
    `${counts.fail} fail`,
    `${counts.error} error`,
    `${counts.skip} skip`,
  ];
  const present = parts.filter((part) => !part.startsWith('0 '));
  return present.length > 0 ? present.join(' · ') : 'no results';
}

/**
 * The caveat for a score whose run had checks Plumbline itself could not
 * complete. An errored check is excluded from the score like a skip — the
 * anchor is not penalised for our network failure — but the two are not the
 * same thing: a skip is a legitimate "not applicable", an error is an
 * unverified clause. Returning null for zero keeps a fully-verified score
 * unmarked, and the caller renders the string next to the score verbatim.
 */
export function formatErrorCaveat(errorCount: number | null | undefined): string | null {
  if (errorCount === null || errorCount === undefined || !Number.isInteger(errorCount)) {
    return null;
  }
  if (errorCount <= 0) {
    return null;
  }
  return errorCount === 1 ? '*1 check could not run' : `*${errorCount} checks could not run`;
}
