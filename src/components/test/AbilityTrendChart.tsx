import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTestStore } from '../../stores/testStore';
import type { TestResult } from '../../types';

interface TooltipPayloadEntry {
  payload: { index: number; theta: number; date: string; level: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="px-3 py-2 text-xs"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-2)',
      }}
    >
      <p className="font-bold text-primary text-sm">{d.level}</p>
      <p className="text-muted">
        {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · θ {d.theta.toFixed(2)}
      </p>
    </div>
  );
}

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

// Endpoint labeling: only the last point gets a direct label (the CEFR
// level), per the sparing-labels rule -- the rest ride the tooltip/axis.
function makeEndpointDot(lastIndex: number, lastLevel: string) {
  return function EndpointDot({ cx, cy, index }: DotProps) {
    if (cx === undefined || cy === undefined) return null;
    const isLast = index === lastIndex;
    return (
      <g>
        <circle cx={cx} cy={cy} r={isLast ? 5 : 4} fill="var(--accent)" stroke="var(--bg-card)" strokeWidth={2} />
        {isLast && (
          <text x={cx} y={cy - 14} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--text-primary)">
            {lastLevel}
          </text>
        )}
      </g>
    );
  };
}

// Only renders once there's a real trend to show (2+ attempts).
export function AbilityTrendChart() {
  const history = useTestStore(s => s.history);
  if (history.length < 2) return null;

  const data = history.map((r: TestResult, i: number) => ({
    index: i + 1,
    theta: Math.round(r.theta * 100) / 100,
    date: r.date,
    level: r.cefrLevel,
  }));

  const lastIndex = data.length - 1;
  const Dot = makeEndpointDot(lastIndex, data[lastIndex].level);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 24, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--hairline)" />
        <XAxis dataKey="index" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--hairline)' }} />
        <Line type="monotone" dataKey="theta" stroke="var(--accent)" strokeWidth={2} dot={<Dot />} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
