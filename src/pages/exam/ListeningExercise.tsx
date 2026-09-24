import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, RotateCcw, FileText } from 'lucide-react';
import { getListeningDoc } from '../../data/exam/listening';
import { ListeningPlayer } from '../../components/exam/ListeningPlayer';
import { ListeningQuestions } from '../../components/exam/ListeningQuestions';
import { Transcript } from '../../components/exam/Transcript';
import { Button } from '../../components/ui/Button';
import { useExamStore } from '../../stores/examStore';
import { useProgressStore } from '../../stores/progressStore';
import { gradeListening } from '../../utils/listeningGrade';
import { todayString } from '../../utils/streak';

type Mode = 'exam' | 'practice';

export function ListeningExercise() {
  const { docId } = useParams<{ docId: string }>();
  const doc = docId ? getListeningDoc(docId) : undefined;
  const addListeningResult = useExamStore(s => s.addListeningResult);
  const listeningResults = useExamStore(s => s.listeningResults);
  const history = listeningResults.filter(r => r.docId === docId);

  const [mode, setMode] = useState<Mode>('exam');
  const [attempt, setAttempt] = useState(0);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(string | undefined)[]>([]);
  const [results, setResults] = useState<boolean[] | null>(null);

  if (!doc) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted">This listening exercise doesn't exist.</p>
        <Link to="/exam"><Button className="mt-4">Back to DELF Prep</Button></Link>
      </div>
    );
  }

  const answeredCount = answers.filter(a => a && a.trim()).length;

  function submit() {
    if (!doc) return;
    const graded = gradeListening(doc.questions, answers);
    setResults(graded);
    const correct = graded.filter(Boolean).length;
    addListeningResult({
      id: `listening-${Date.now()}`,
      docId: doc.id,
      date: todayString(),
      mode,
      correct,
      total: doc.questions.length,
    });
    // First completion of a document earns XP; retakes are for practice.
    if (history.length === 0) useProgressStore.getState().addXP(15);
  }

  function retry() {
    setAnswers([]);
    setResults(null);
    setStarted(false);
    setAttempt(a => a + 1);
  }

  const correct = results?.filter(Boolean).length ?? 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div>
        <Link to="/exam" className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline" style={{ color: 'var(--accent)' }}>
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> DELF Prep
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="chip text-xs">DELF {doc.level.toUpperCase()}</span>
          <span className="chip text-xs">Compréhension de l'oral</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">{doc.title}</h1>
        <p className="text-sm text-secondary mt-1" lang="fr">{doc.situation}</p>
      </div>

      {!results && (
        <div className="space-y-2">
          <div className="seg-control" role="tablist" aria-label="Mode">
            <button className="seg-item" role="tab" aria-pressed={mode === 'exam'} aria-selected={mode === 'exam'} disabled={started} onClick={() => setMode('exam')}>
              Exam conditions
            </button>
            <button className="seg-item" role="tab" aria-pressed={mode === 'practice'} aria-selected={mode === 'practice'} disabled={started} onClick={() => setMode('practice')}>
              Practice
            </button>
          </div>
          <p className="text-xs text-muted px-1">
            {mode === 'exam'
              ? `Heard ${doc.plays === 1 ? 'once' : 'twice'} at natural speed, like the real paper. Read the questions before you press play.`
              : 'Unlimited replays and slower speeds. Useful for a first pass — then retry under exam conditions.'}
          </p>
        </div>
      )}

      <ListeningPlayer
        key={`${mode}-${attempt}`}
        script={doc.script}
        maxPlays={mode === 'exam' && !results ? doc.plays : null}
        allowRateChange={mode === 'practice' || !!results}
        onFirstPlay={() => setStarted(true)}
      />

      {results && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              {correct} / {doc.questions.length} correct
            </p>
            <p className="text-xs text-muted">
              {mode === 'exam' ? 'Exam conditions' : 'Practice mode'} · Explanations and the transcript are below.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={retry}>
            <RotateCcw size={14} /> Retry
          </Button>
        </motion.div>
      )}

      <ListeningQuestions
        questions={doc.questions}
        answers={answers}
        results={results}
        onAnswer={(i, v) => setAnswers(prev => {
          const next = [...prev];
          next[i] = v;
          return next;
        })}
      />

      {!results ? (
        <Button onClick={submit} disabled={answeredCount === 0} className="w-full">
          Check answers ({answeredCount}/{doc.questions.length})
        </Button>
      ) : (
        <section>
          <div className="section-label flex items-center gap-1.5">
            <FileText size={13} /> Transcription
          </div>
          <Transcript script={doc.script} />
        </section>
      )}
    </div>
  );
}
