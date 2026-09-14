import type { HistoryPoint } from '../api/types';

/**
 * Recharts wants one flat key per line, so a SEP becomes `sep-1` rather than
 * a nested object. The prefix keeps those keys away from `at` and `overall`.
 */
export function seriesKey(sep: number): string {
  return `sep-${sep}`;
}

/** Only SEPs the anchor actually implements get a line. */
export function chartSeps(points: readonly HistoryPoint[]): number[] {
  const seps = new Set<number>();
  for (const point of points) {
    for (const grade of point.grades) {
      if (grade.applicable) {
        seps.add(grade.sep);
      }
    }
  }
  return [...seps].sort((a, b) => a - b);
}

export interface ChartRow {
  at: number;
  overall: number | null;
  [series: string]: number | null;
}

/**
 * A SEP the anchor did not implement on a given run is `null`, not zero, so
 * the line breaks rather than dropping to the axis and implying a failure.
 */
export function buildChartRows(
  points: readonly HistoryPoint[],
  seps: readonly number[],
): ChartRow[] {
  return points.map((point) => {
    const row: ChartRow = {
      at: new Date(point.startedAt).getTime(),
      overall: point.overallScore,
    };
    for (const sep of seps) {
      const grade = point.grades.find((candidate) => candidate.sep === sep);
      row[seriesKey(sep)] = grade !== undefined && grade.applicable ? grade.score : null;
    }
    return row;
  });
}
