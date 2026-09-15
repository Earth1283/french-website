import { Link } from 'react-router-dom';
import type { TestResult } from '../../types';
import { getTopicMeta } from '../../data/testItemBank';
import { useTestStore } from '../../stores/testStore';
import { SkillsBreakdownChart } from './SkillsBreakdownChart';
import { AbilityTrendChart } from './AbilityTrendChart';
import { FlipText } from '../ui/FlipText';
import { Meter } from '../ui/Meter';

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
      <div className="text-center">
        <p className="t-small num">
          {result.cefrBand ? `${result.cefrBand} band` : 'Result'}
        </p>
        <p className="text-72 font-bold num leading-none text-ink mt-2">
          <FlipText value={result.cefrLevel} />
        </p>
        <p className="t-title text-ink mt-4">
          {result.correctCount}/{result.itemsAdministered} correct
        </p>
        <p className="t-small text-ink-3 mt-2">
          {new Date(result.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {!compact && (topics.length > 0 || historyCount > 1) && (
        <div className="hidden md:block space-y-6">
          {historyCount > 1 && (
            <div className="sheet p-4">
              <h3 className="h-section text-18 mb-4">Ability over time</h3>
              <AbilityTrendChart />
            </div>
          )}
          {topics.length > 0 && (
            <div className="sheet p-4">
              <h3 className="h-section text-18 mb-4">Skills breakdown</h3>
              <SkillsBreakdownChart topics={topics} />
            </div>
          )}
        </div>
      )}

      {!compact && topics.length > 0 && (
        <div>
          <h3 className="h-section text-18 mb-4">Topic breakdown</h3>
          <div className="sheet rows">
            {topics.map((t) => {
              const meta = getTopicMeta(t.topic);
              return (
                <div key={t.topic} className="row">
                  <div className="flex-1 min-w-0">
                    <p className="t-title text-ink">{meta.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Meter percent={t.pct} label={`${t.pct}% correct`} className="meter meter--wide flex-1" />
                      <span className="t-small num whitespace-nowrap text-ink-2">{t.correct}/{t.total}</span>
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
          <h3 className="h-section text-18 mb-4">Focus areas</h3>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map(t => {
              const meta = getTopicMeta(t.topic);
              return meta.unitSlug ? (
                <Link key={t.topic} to={`/unit/${meta.unitSlug}`} className="t-small text-enamel-text hover:underline">
                  {meta.title}
                </Link>
              ) : (
                <span key={t.topic} className="t-small text-ink-2">{meta.title}</span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
