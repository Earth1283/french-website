import type { ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { QuestionStat } from '../../types/classroom';

interface MissedQuestionsChartProps {
  questions: QuestionStat[];
}

interface TooltipPayloadEntry {
  payload: { name: string; pct: number; wrongCount: number; totalCount: number };
}

function truncate(s: string, max = 42): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="px-3 py-2 text-xs max-w-[220px]"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-2)',
      }}
    >
      <p className="font-bold text-primary text-sm">{d.pct}% missed</p>
      <p className="text-muted">{d.name} · {d.wrongCount}/{d.totalCount} wrong</p>
    </div>
  );
}

// Magnitude comparison across questions, one series -> a single accent hue,
// sorted worst-first so the most-missed question reads at a glance.
export function MissedQuestionsChart({ questions }: MissedQuestionsChartProps) {
  const data = [...questions]
    .filter((q) => q.totalCount > 0)
    .map((q) => ({
      name: truncate(q.prompt),
      pct: Math.round((q.wrongCount / q.totalCount) * 100),
      wrongCount: q.wrongCount,
      totalCount: q.totalCount,
    }))
    .sort((a, b) => b.pct - a.pct);

  if (data.length === 0) {
    return <p className="text-sm text-muted text-center py-8">No completed attempts yet.</p>;
  }

  const height = Math.max(120, data.length * 38 + 24);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 4 }} barCategoryGap={10}>
        <CartesianGrid horizontal={false} stroke="var(--hairline)" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={168}
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--bg-inset)' }} />
        <Bar dataKey="pct" fill="var(--accent)" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="pct"
            position="right"
            formatter={(v: ReactNode) => `${v}%`}
            style={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
