import { describe, expect, it } from 'vitest';
import { buildChartRows, chartSeps, seriesKey } from './chartData';
import type { HistoryPoint } from '../api/types';

function point(overrides: Partial<HistoryPoint> = {}): HistoryPoint {
  return {
    runId: '1',
    startedAt: '2026-09-14T10:39:06.393Z',
    overallScore: 0.9,
    grades: [
      { sep: 1, score: 0.8, applicable: true },
      { sep: 10, score: 1, applicable: true },
    ],
    ...overrides,
  };
}

describe('seriesKey', () => {
  it('cannot collide with the non-SEP columns', () => {
    expect(seriesKey(1)).toBe('sep-1');
    expect(seriesKey(1)).not.toBe('at');
    expect(seriesKey(1)).not.toBe('overall');
  });
});

describe('chartSeps', () => {
  it('collects the applicable SEPs across the whole history', () => {
    expect(
      chartSeps([
        point({ grades: [{ sep: 1, score: 1, applicable: true }] }),
        point({ grades: [{ sep: 10, score: 1, applicable: true }] }),
      ]),
    ).toEqual([1, 10]);
  });

  it('leaves out a SEP the anchor does not implement', () => {
    expect(chartSeps([point({ grades: [{ sep: 10, score: 0, applicable: false }] })])).toEqual([]);
  });

  it('returns nothing for an empty history', () => {
    expect(chartSeps([])).toEqual([]);
  });
});

describe('buildChartRows', () => {
  it('turns the run time into a sortable epoch value', () => {
    const rows = buildChartRows([point()], [1]);

    expect(rows[0]?.at).toBe(Date.parse('2026-09-14T10:39:06.393Z'));
  });

  it('puts each SEP under its own key', () => {
    const rows = buildChartRows([point()], [1, 10]);

    expect(rows[0]?.['sep-1']).toBe(0.8);
    expect(rows[0]?.['sep-10']).toBe(1);
  });

  it('breaks the line for a SEP that was not implemented on that run', () => {
    const rows = buildChartRows(
      [
        point({
          overallScore: 1,
          grades: [{ sep: 10, score: 0, applicable: false }],
        }),
      ],
      [10],
    );

    expect(rows[0]?.['sep-10']).toBeNull();
  });

  it('carries a missing overall score through as null rather than zero', () => {
    const rows = buildChartRows([point({ overallScore: null })], []);

    expect(rows[0]?.overall).toBeNull();
  });

  it('keeps one row per run, in the order given', () => {
    const rows = buildChartRows(
      [point({ runId: '1' }), point({ runId: '2', startedAt: '2026-09-14T11:00:00.000Z' })],
      [],
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]!.at).toBeLessThan(rows[1]!.at);
  });
});
