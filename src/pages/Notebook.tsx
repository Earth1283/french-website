import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Check, ChevronLeft, RotateCcw, Search, Volume2 } from 'lucide-react';
import { useNotebookStore, captureCorrections } from '../stores/notebookStore';
import { useConversationStore } from '../stores/conversationStore';
import { useExamStore } from '../stores/examStore';
import { Button } from '../components/ui/Button';
import { MultipleChoice } from '../components/lesson/MultipleChoice';
import { FillInBlank } from '../components/lesson/FillInBlank';
import { TranslationChallenge } from '../components/lesson/TranslationChallenge';
import { isReadingAnswerCorrect } from '../utils/readingGrade';
import { speak } from '../utils/speech';
import type { Mistake, MistakeSource } from '../types/notebook';

const LABELS: Record<MistakeSource, string> = { lesson: 'Lessons', conversation: 'Conversations', writing: 'Writing', reading: 'Reading' };

function Practice({ mistake, onDone }: { mistake: Mistake; onDone: () => void }) {
  const [finished, setFinished] = useState<boolean | null>(null);
  const recordPractice = useNotebookStore(s => s.recordPractice);
  const setResolved = useNotebookStore(s => s.setResolved);
  const finish = (correct: boolean) => { recordPractice(mistake.id, correct); setFinished(correct); };
  const props = { exercise: mistake.exercise, teach: true, onCorrect: () => finish(true), onWrong: () => finish(false), gradeAnswer: mistake.source === 'reading' ? (given: string, expected: string) => isReadingAnswerCorrect({ type: 'short', answer: expected }, given) ? 'correct' as const : 'wrong' as const : undefined };
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <Button variant="ghost" onClick={onDone}><ChevronLeft size={16} /> Mistakes notebook</Button>
      {finished === null && mistake.context && <div className="card p-5 text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{mistake.context}</div>}
      {finished === null ? (
        mistake.exercise.type === 'multiple-choice' ? <MultipleChoice {...props} />
          : mistake.exercise.type === 'fill-blank' ? <FillInBlank {...props} /> : <TranslationChallenge {...props} speech={mistake.source !== 'reading'} />
      ) : (
        <div className="card p-5 space-y-4" role="status">
          <h1 className="text-xl font-bold text-primary">{finished ? 'You recalled it.' : 'Keep this one handy.'}</h1>
          <p className="text-sm text-secondary">{finished ? 'You can mark this resolved, or leave it in your notebook for more practice.' : 'Try it again later, or add it to review from your notebook.'}</p>
          <p className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>{mistake.corrected}</p>
          {mistake.explanation && <p className="text-sm text-muted">{mistake.explanation}</p>}
          <div className="flex gap-2 flex-wrap">
            {finished && <Button onClick={() => { setResolved(mistake.id, true); onDone(); }}><Check size={14} /> Mark resolved</Button>}
            <Button variant="secondary" onClick={onDone}>Back to notebook</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Notebook() {
  const { mistakes, historyImported, finishHistoryImport, setResolved, setInReview } = useNotebookStore();
  const [filter, setFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [source, setSource] = useState<MistakeSource | 'all'>('all');
  const [query, setQuery] = useState('');
  const [practicing, setPracticing] = useState<Mistake | null>(null);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [practicing?.id]);
  useEffect(() => {
    if (historyImported) return;
    for (const record of useConversationStore.getState().history) captureCorrections('conversation', record.scenarioId, record.debrief.corrections, true);
    for (const submission of useExamStore.getState().writingSubmissions) captureCorrections('writing', submission.taskId, submission.evaluation?.corrections, true);
    finishHistoryImport();
  }, [historyImported, finishHistoryImport]);

  if (practicing) return <Practice key={practicing.id} mistake={practicing} onDone={() => setPracticing(null)} />;
  const active = mistakes.filter(m => !m.resolved).length;
  const shown = mistakes.filter(m => (filter === 'all' || m.resolved === (filter === 'resolved'))
    && (source === 'all' || m.source === source)
    && `${m.prompt} ${m.original} ${m.corrected} ${m.explanation} ${m.sourceTitle}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div>
        <Link to="/learn" className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline" style={{ color: 'var(--accent)' }}><ChevronLeft size={18} /> Home</Link>
        <h1 className="text-3xl font-bold text-primary">Mistakes notebook</h1>
        <p className="text-sm text-secondary mt-1">A second chance at the French that tripped you up. {active} to practice · {mistakes.length - active} resolved.</p>
      </div>
      <div className="seg-control" role="tablist" aria-label="Mistake status">
        {(['active', 'resolved', 'all'] as const).map(value => <button key={value} className="seg-item capitalize" role="tab" aria-selected={filter === value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</button>)}
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input className="ios-input pl-10" aria-label="Search mistakes" placeholder="Search your mistakes" value={query} onChange={e => setQuery(e.target.value)} /></div>
        <select className="ios-input text-sm w-auto" aria-label="Mistake source" value={source} onChange={e => setSource(e.target.value as typeof source)}><option value="all">All sources</option>{Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      {mistakes.some(m => m.inReview && !m.resolved) && <Link to="/review" className="card p-4 flex items-center gap-2 no-underline text-sm font-semibold" style={{ color: 'var(--accent)' }}><RotateCcw size={16} /> Open spaced review</Link>}
      {shown.length === 0 ? (
        <div className="card p-8 text-center space-y-3"><BookOpenCheck size={30} className="mx-auto text-muted" /><h2 className="text-lg font-semibold text-primary">{mistakes.length ? 'No mistakes match this view.' : 'Your next mistake has a home.'}</h2><p className="text-sm text-secondary">{mistakes.length ? 'Try another filter or search.' : 'Missed lesson answers, conversation corrections, and DELF feedback collect here automatically.'}</p>{!mistakes.length && <Link to="/learn" className="inline-block"><Button variant="secondary">Explore lessons</Button></Link>}</div>
      ) : shown.map(m => (
        <article key={m.id} className="card p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs text-muted"><Link to={m.sourceHref} className="no-underline" style={{ color: 'var(--accent)' }}>{m.sourceTitle}</Link><span>{m.occurrences > 1 ? `${m.occurrences} times · ` : ''}{new Date(m.lastSeen).toLocaleDateString()}</span></div>
          <p className="text-sm font-semibold text-primary">{m.prompt}</p>
          <div className="p-3 space-y-1" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
            <p className="text-xs text-muted">Your answer</p><p className="text-sm" style={{ color: 'var(--danger)' }}>{m.original || 'No answer'}</p>
            <p className="text-xs text-muted pt-1">Expected answer</p><div className="flex items-start gap-2"><p className="text-sm font-semibold text-primary flex-1">{m.corrected}</p><button type="button" className="ios-press cursor-pointer p-1" style={{ color: 'var(--accent)', background: 'transparent', border: 'none' }} aria-label={`Hear ${m.corrected}`} onClick={() => speak(m.corrected)}><Volume2 size={16} /></button></div>
          </div>
          {m.explanation && <p className="text-xs text-secondary">{m.explanation}</p>}
          {m.practiceAttempts > 0 && <p className="text-xs text-muted">Recalled {m.practiceCorrect} of {m.practiceAttempts} practice attempts</p>}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setPracticing(m)}>Practice this</Button>
            <Button size="sm" variant="secondary" onClick={() => setInReview(m.id, !m.inReview)} aria-pressed={m.inReview}><RotateCcw size={13} />{m.inReview ? 'Remove from review' : 'Add to review'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setResolved(m.id, !m.resolved)}><Check size={13} />{m.resolved ? 'Reopen' : 'Mark resolved'}</Button>
          </div>
        </article>
      ))}
    </div>
  );
}
