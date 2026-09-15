import { Meter } from '../ui/Meter';
import type { QuestionStat } from '../../types/classroom';

export function MissedQuestionsChart({ questions }: { questions: QuestionStat[] }) {
  const rows = questions
    .filter((question) => question.totalCount > 0)
    .map((question) => ({ ...question, percent: Math.round((question.wrongCount / question.totalCount) * 100) }))
    .sort((left, right) => right.percent - left.percent);

  if (!rows.length) return <p className="t-small text-ink-3 py-6">No completed attempts yet.</p>;
  return <div className="bars">{rows.map((row) => <div className="bar" key={row.index}><span className="bar__label">{row.index + 1}. {row.prompt}</span><Meter percent={row.percent} className="bar__track" label={`${row.percent}% missed`} /><span className="bar__pct">{row.percent}%</span></div>)}</div>;
}
