import { describe, expect, it } from 'vitest';
import {
  applicableGrades,
  countByStatus,
  EMPTY_VALUE,
  formatCounts,
  formatDuration,
  formatRelativeTime,
  formatScore,
  formatTimestamp,
  groupBySep,
  scoreTone,
  sepLabel,
  sortResultsForDisplay,
} from './format';
import type { CheckResult, Grade } from '../api/types';

function result(overrides: Partial<CheckResult> & Pick<CheckResult, 'checkId'>): CheckResult {
  return {
    sep: 1,
    status: 'pass',
    severity: 'error',
    message: null,
    specRef: null,
    evidence: [],
    durationMs: 0,
    title: 'title',
    ...overrides,
  };
}

describe('formatScore', () => {
  it('renders a score as a percentage with one decimal', () => {
    expect(formatScore(0.941)).toBe('94.1%');
    expect(formatScore(1)).toBe('100.0%');
    expect(formatScore(0)).toBe('0.0%');
  });

  it('renders a missing score as a dash, never as a zero', () => {
    expect(formatScore(null)).toBe(EMPTY_VALUE);
    expect(formatScore(undefined)).toBe(EMPTY_VALUE);
    expect(formatScore(Number.NaN)).toBe(EMPTY_VALUE);
  });
});

describe('scoreTone', () => {
  it('buckets scores for colour only', () => {
    expect(scoreTone(1)).toBe('good');
    expect(scoreTone(0.9)).toBe('good');
    expect(scoreTone(0.899)).toBe('fair');
    expect(scoreTone(0.7)).toBe('fair');
    expect(scoreTone(0.699)).toBe('poor');
    expect(scoreTone(0)).toBe('poor');
  });

  it('reports unknown rather than poor for a missing score', () => {
    expect(scoreTone(null)).toBe('unknown');
    expect(scoreTone(undefined)).toBe('unknown');
  });
});

describe('sortResultsForDisplay', () => {
  it('leads with what a reader needs to act on', () => {
    const sorted = sortResultsForDisplay([
      result({ checkId: 'sep1.pass', status: 'pass' }),
      result({ checkId: 'sep1.skip', status: 'skip' }),
      result({ checkId: 'sep1.fail', status: 'fail' }),
      result({ checkId: 'sep1.error', status: 'error' }),
    ]);

    expect(sorted.map((entry) => entry.checkId)).toEqual([
      'sep1.error',
      'sep1.fail',
      'sep1.pass',
      'sep1.skip',
    ]);
  });

  it('puts spec-weight failures before advisory ones at the same status', () => {
    const sorted = sortResultsForDisplay([
      result({ checkId: 'sep1.warning', status: 'fail', severity: 'warning' }),
      result({ checkId: 'sep1.info', status: 'fail', severity: 'info' }),
      result({ checkId: 'sep1.error', status: 'fail', severity: 'error' }),
    ]);

    expect(sorted.map((entry) => entry.checkId)).toEqual([
      'sep1.error',
      'sep1.warning',
      'sep1.info',
    ]);
  });

  it('does not mutate the input', () => {
    const input = [result({ checkId: 'sep1.b', status: 'skip' }), result({ checkId: 'sep1.a' })];
    sortResultsForDisplay(input);
    expect(input.map((entry) => entry.checkId)).toEqual(['sep1.b', 'sep1.a']);
  });
});

describe('groupBySep', () => {
  it('groups by SEP in ascending SEP order', () => {
    const grouped = groupBySep([
      result({ checkId: 'sep10.a', sep: 10 }),
      result({ checkId: 'sep1.a', sep: 1 }),
      result({ checkId: 'sep1.b', sep: 1 }),
    ]);

    expect([...grouped.keys()]).toEqual([1, 10]);
    expect(grouped.get(1)?.map((entry) => entry.checkId)).toEqual(['sep1.a', 'sep1.b']);
  });
});

describe('applicableGrades', () => {
  it('drops the SEPs the anchor does not implement', () => {
    const grades: Grade[] = [
      { sep: 1, score: 1, applicable: true },
      { sep: 10, score: 0, applicable: false },
    ];

    expect(applicableGrades(grades)).toEqual([{ sep: 1, score: 1, applicable: true }]);
  });
});

describe('formatDuration', () => {
  it('renders milliseconds below a second and seconds above', () => {
    expect(formatDuration(0)).toBe('0 ms');
    expect(formatDuration(999)).toBe('999 ms');
    expect(formatDuration(1500)).toBe('1.5 s');
  });

  it('renders a missing duration as a dash', () => {
    expect(formatDuration(null)).toBe(EMPTY_VALUE);
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-09-14T12:00:00.000Z');

  it('renders the near past as "just now"', () => {
    expect(formatRelativeTime('2026-09-14T11:59:45.000Z', now)).toBe('just now');
  });

  it('picks the largest sensible unit', () => {
    expect(formatRelativeTime('2026-09-14T11:55:00.000Z', now)).toBe('5 minutes ago');
    expect(formatRelativeTime('2026-09-14T09:00:00.000Z', now)).toBe('3 hours ago');
    expect(formatRelativeTime('2026-09-11T12:00:00.000Z', now)).toBe('3 days ago');
  });

  it('renders a missing or unparseable timestamp as a dash', () => {
    expect(formatRelativeTime(null, now)).toBe(EMPTY_VALUE);
    expect(formatRelativeTime('not a date', now)).toBe(EMPTY_VALUE);
  });
});

describe('formatTimestamp', () => {
  it('renders in UTC so a reader is not misled by an offset', () => {
    expect(formatTimestamp('2026-09-14T10:39:06.393Z')).toContain('UTC');
    expect(formatTimestamp('2026-09-14T10:39:06.393Z')).toContain('2026');
  });

  it('renders a missing timestamp as a dash', () => {
    expect(formatTimestamp(null)).toBe(EMPTY_VALUE);
    expect(formatTimestamp('nope')).toBe(EMPTY_VALUE);
  });
});

describe('countByStatus', () => {
  it('counts the rows it was given, per status', () => {
    expect(
      countByStatus([
        result({ checkId: 'a' }),
        result({ checkId: 'b', status: 'fail' }),
        result({ checkId: 'c', status: 'fail' }),
        result({ checkId: 'd', status: 'skip' }),
      ]),
    ).toEqual({ pass: 1, fail: 2, skip: 1, error: 0 });
  });

  it('counts nothing as zero rather than as absent', () => {
    expect(countByStatus([])).toEqual({ pass: 0, fail: 0, skip: 0, error: 0 });
  });
});

describe('formatCounts', () => {
  it('omits zero counts rather than padding the line', () => {
    expect(formatCounts({ pass: 38, fail: 3, skip: 11, error: 0 })).toBe(
      '38 pass · 3 fail · 11 skip',
    );
  });

  it('says so when there is nothing to count', () => {
    expect(formatCounts({ pass: 0, fail: 0, skip: 0, error: 0 })).toBe('no results');
  });
});

describe('sepLabel', () => {
  it('labels a SEP the way the specs do', () => {
    expect(sepLabel(1)).toBe('SEP-1');
    expect(sepLabel(10)).toBe('SEP-10');
  });
});
