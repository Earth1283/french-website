import type { ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { getTopicMeta } from '../../data/testItemBank';

interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  pct: number;
}

interface SkillsBreakdownChartProps {
  topics: TopicStat[];
}

interface TooltipPayloadEntry {
  payload: { name: string; pct: number; correct: number; total: number };
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
      <p className="font-bold text-primary text-sm">{d.pct}%</p>
      <p className="text-muted">{d.name} · {d.correct}/{d.total}</p>
    </div>
  );
}

// Magnitude comparison across topics, one series -> a single accent hue, not
// a per-bar categorical ramp (that would double-encode length as color).
export function SkillsBreakdownChart({ topics }: SkillsBreakdownChartProps) {
  const data = topics.map(t => ({
    topic: t.topic,
    name: getTopicMeta(t.topic).title,
    pct: t.pct,
    correct: t.correct,
    total: t.total,
  }));

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
