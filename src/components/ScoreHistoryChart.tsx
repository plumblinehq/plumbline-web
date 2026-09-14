import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistoryPoint } from '../api/types';
import { buildChartRows, chartSeps, seriesKey } from '../lib/chartData';
import { formatScore, sepLabel } from '../lib/format';

/** Written as literals: a colour assembled at runtime is fine here, but these read better. */
const OVERALL_COLOR = '#0f172a';
const SEP_COLORS = ['#0284c7', '#059669', '#d97706', '#7c3aed', '#db2777'];

const AXIS_TICK = { fill: '#64748b', fontSize: 11 } as const;

const AT_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export function ScoreHistoryChart({ points }: { points: readonly HistoryPoint[] }) {
  const seps = useMemo(() => chartSeps(points), [points]);
  const rows = useMemo(() => buildChartRows(points, seps), [points, seps]);

  if (points.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-slate-500">
        No runs recorded in this window yet.
      </p>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="at"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value: number) => AT_FORMAT.format(new Date(value))}
              tick={AXIS_TICK}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
              tick={AXIS_TICK}
              width={44}
            />
            <Tooltip
              labelFormatter={(label) => AT_FORMAT.format(new Date(Number(label)))}
              formatter={(value, name) => [
                typeof value === 'number' ? formatScore(value) : String(value ?? ''),
                String(name ?? ''),
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="overall"
              name="Overall"
              stroke={OVERALL_COLOR}
              strokeWidth={2}
              dot={{ r: 2 }}
              // A null is a run with no score, and connecting across it would
              // draw a trend that never happened.
              connectNulls={false}
            />
            {seps.map((sep, index) => (
              <Line
                key={sep}
                type="monotone"
                dataKey={seriesKey(sep)}
                name={sepLabel(sep)}
                stroke={SEP_COLORS[index % SEP_COLORS.length]}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
