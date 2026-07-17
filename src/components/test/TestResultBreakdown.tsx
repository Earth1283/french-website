import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { TestResult } from '../../types';
import { getTopicMeta } from '../../data/testItemBank';
import { useTestStore } from '../../stores/testStore';
import { SkillsBreakdownChart } from './SkillsBreakdownChart';
import { AbilityTrendChart } from './AbilityTrendChart';

interface TestResultBreakdownProps {
  result: TestResult;
  compact?: boolean;
}

export function TestResultBreakdown({ result, compact = false }: TestResultBreakdownProps) {
  const historyCount = useTestStore(s => s.history.length);
  const topics = Object.entries(result.topicBreakdown)
    .filter(([, stats]) => stats.total >= 2)
    .map(([topic, stats]) => ({ topic, ...stats, pct: Math.round((stats.correct / stats.total) * 100) }))
    .sort((a, b) => a.pct - b.pct);

  const focusAreas = topics.slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="chip text-sm px-3 py-1.5">
          {result.cefrLevel}{result.cefrBand ? ` · ${result.cefrBand} range` : ''}
        </span>
        <p className="text-3xl font-bold text-primary mt-3">
          {result.correctCount}/{result.itemsAdministered} correct
        </p>
        <p className="text-xs text-muted mt-1">
          {new Date(result.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Desktop-only: richer charts. The list below remains the accessible
          "table view" twin on every screen size, so nothing is chart-gated. */}
      {!compact && (topics.length > 0 || historyCount > 1) && (
        <div className="hidden md:block space-y-6">
          {historyCount > 1 && (
            <div>
              <p className="section-label" style={{ paddingLeft: 0 }}>Ability over time</p>
              <div className="card p-4">
                <AbilityTrendChart />
              </div>
            </div>
          )}
          {topics.length > 0 && (
            <div>
              <p className="section-label" style={{ paddingLeft: 0 }}>Skills breakdown</p>
              <div className="card p-4">
                <SkillsBreakdownChart topics={topics} />
              </div>
            </div>
          )}
        </div>
      )}

      {!compact && topics.length > 0 && (
        <div>
          <p className="section-label" style={{ paddingLeft: 0 }}>Topic breakdown</p>
          <div className="inset-group">
            {topics.map((t, i) => {
              const meta = getTopicMeta(t.topic);
              return (
                <div
                  key={t.topic}
                  className="p-3 flex items-center gap-3"
                  style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
                >
                  <span
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}
                  >
                    {meta.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">{meta.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                        <div className="h-full rounded-full" style={{ backgroundColor: meta.color, width: `${t.pct}%` }} />
                      </div>
                      <span className="text-xs text-muted whitespace-nowrap">{t.correct}/{t.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!compact && focusAreas.length > 0 && (
        <div>
          <p className="section-label" style={{ paddingLeft: 0 }}>Focus areas</p>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map(t => {
              const meta = getTopicMeta(t.topic);
              return meta.unitSlug ? (
                <Link key={t.topic} to={`/unit/${meta.unitSlug}`} className="chip no-underline">
                  {meta.emoji} {meta.title}
                </Link>
              ) : (
                <span key={t.topic} className="chip">{meta.emoji} {meta.title}</span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
