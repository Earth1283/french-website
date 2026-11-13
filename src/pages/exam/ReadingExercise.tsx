import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { getReadingDoc } from '../../data/exam/reading';
import { ReadingDocument } from '../../components/exam/ReadingDocument';
import { ReadingClock } from '../../components/exam/ReadingClock';
import { Button } from '../../components/ui/Button';
import { useExamStore } from '../../stores/examStore';
import { useProgressStore } from '../../stores/progressStore';
import { gradeReading } from '../../utils/readingGrade';
import { toOutOf25 } from '../../data/exam/rubric';
import { todayString } from '../../utils/streak';
import { REVEAL } from '../../utils/motion';
import type { ReadingResult } from '../../types/exam';

export function ReadingExercise() {
  const { docId } = useParams<{ docId: string }>();
  const doc = docId ? getReadingDoc(docId) : undefined;
  const addReadingResult = useExamStore(s => s.addReadingResult);
  const readingResults = useExamStore(s => s.readingResults);
  const [mode, setMode] = useState<'exam' | 'practice'>('exam');
  const [started, setStarted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [answers, setAnswers] = useState<(string | undefined)[]>([]);
  const [result, setResult] = useState<ReadingResult | null>(null);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [started, result?.id]);
  if (!doc) return <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4"><p className="text-muted">This reading exercise doesn't exist.</p><Link to="/exam"><Button>Back to DELF Prep</Button></Link></div>;
  const history = readingResults.filter(r => r.docId === doc.id).slice().reverse();
  const graded = result ? gradeReading(doc.questions, result.answers) : null;
  const answeredCount = answers.filter(a => a?.trim()).length;
  function submit() {
    if (!doc || result) return;
    const correct = gradeReading(doc.questions, answers).filter(Boolean).length;
    const entry: ReadingResult = { id: `reading-${Date.now()}`, docId: doc.id, date: todayString(), mode, correct, total: doc.questions.length, answers: [...answers] };
    addReadingResult(entry);
    if (!history.length) useProgressStore.getState().addXP(15);
    setResult(entry);
  }
  function retry() { setResult(null); setStarted(false); setAnswers([]); setAttempt(a => a + 1); }
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div>
        <Link to="/exam" className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline" style={{ color: 'var(--accent)' }}><ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> DELF Prep</Link>
        <div className="flex items-center gap-2 flex-wrap mb-1"><span className="chip text-xs">DELF {doc.level.toUpperCase()}</span><span className="chip text-xs">Compréhension des écrits</span></div>
        <h1 className="text-2xl font-bold text-primary">{doc.title}</h1>
        <p className="text-sm text-secondary mt-1" lang="fr">{doc.situation}</p>
      </div>
      {!result && <>
        <div className="seg-control" role="tablist" aria-label="Mode"><button className="seg-item" role="tab" aria-selected={mode === 'exam'} aria-pressed={mode === 'exam'} disabled={started} onClick={() => setMode('exam')}>Exam conditions</button><button className="seg-item" role="tab" aria-selected={mode === 'practice'} aria-pressed={mode === 'practice'} disabled={started} onClick={() => setMode('practice')}>Practice</button></div>
        <p className="text-xs text-muted px-1">{mode === 'exam' ? `${doc.timeMinutes} minutes for this practice document. Answers are submitted when time runs out; unanswered questions score zero.` : 'Read at your own pace. Answers and explanations appear after you submit.'}</p>
      </>}
      {!started && !result ? <div className="card p-5 space-y-4"><p className="text-sm text-secondary">{doc.questions.length} questions · {doc.genre}. This is original practice material; the mock exam combines documents into a reading section.</p><Button className="w-full" onClick={() => setStarted(true)}>Begin reading</Button></div> : <>
        {started && !result && mode === 'exam' && <ReadingClock key={attempt} minutes={doc.timeMinutes} onExpire={submit} />}
        {result && <motion.div {...REVEAL} className="card p-4 flex items-center justify-between gap-3" role="status"><div><p className="text-sm font-semibold text-primary">{result.correct} / {result.total} correct · {toOutOf25(result.correct, result.total)}/25</p><p className="text-xs text-muted">{result.mode === 'exam' ? 'Exam conditions' : 'Practice mode'} · {result.date}</p></div><Button variant="secondary" size="sm" onClick={retry}><RotateCcw size={14} /> Retry</Button></motion.div>}
        <ReadingDocument doc={doc} answers={result?.answers ?? answers} results={graded} onAnswer={(i, answer) => setAnswers(prev => { const next = [...prev]; next[i] = answer; return next; })} />
        {!result && <Button className="w-full" onClick={submit}>Submit answers ({answeredCount}/{doc.questions.length})</Button>}
        {result && <Link to="/notebook" className="block text-sm font-medium no-underline" style={{ color: 'var(--accent)' }}>Review missed answers in your notebook →</Link>}
      </>}
      {!started && history.length > 0 && <section><p className="section-label">Previous attempts</p><div className="inset-group">{history.map(r => <button type="button" key={r.id} className="inset-row w-full justify-between cursor-pointer text-left" style={{ background: 'transparent', border: 'none' }} onClick={() => { setResult(r); setMode(r.mode); }}><span className="text-sm text-primary">{r.date} · {r.mode}</span><span className="text-xs font-semibold text-secondary">{r.correct}/{r.total} · {toOutOf25(r.correct, r.total)}/25</span></button>)}</div></section>}
    </div>
  );
}
