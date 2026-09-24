import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Headphones, PenLine, ExternalLink, CheckCircle2 } from 'lucide-react';
import { LISTENING_DOCS } from '../../data/exam/listening';
import { WRITING_TASKS } from '../../data/exam/writing';
import { toOutOf25 } from '../../data/exam/rubric';
import { useExamStore } from '../../stores/examStore';
import { useTestStore } from '../../stores/testStore';
import type { DelfLevel } from '../../types/exam';

const LEVELS: DelfLevel[] = ['a1', 'a2', 'b1', 'b2'];

// DELF tout public: each of the four skills is out of 25; the diploma needs
// 50/100 overall and at least 5/25 in every skill.
const LEVEL_FACTS: Record<DelfLevel, { listening: string; writing: string }> = {
  a1: { listening: 'About 20 min · short recordings heard twice', writing: '30 min · a form, then a 40-word message' },
  a2: { listening: 'About 25 min · short recordings heard twice', writing: '45 min · two texts of 60+ words' },
  b1: { listening: 'About 25 min · recordings heard twice', writing: '45 min · one 160-word opinion text' },
  b2: { listening: 'About 30 min · long documents twice, short ones once', writing: '1 hour · one 250-word argued text' },
};

function levelFromPlacement(cefr: string | undefined): DelfLevel {
  const l = cefr?.toLowerCase() ?? '';
  if (l.startsWith('b2') || l.startsWith('c')) return 'b2';
  if (l.startsWith('b1')) return 'b1';
  if (l.startsWith('a2')) return 'a2';
  return 'a1';
}

export function ExamHub() {
  const storedLevel = useExamStore(s => s.level);
  const setLevel = useExamStore(s => s.setLevel);
  const listeningResults = useExamStore(s => s.listeningResults);
  const writingSubmissions = useExamStore(s => s.writingSubmissions);
  const lastPlacement = useTestStore(s => s.history[s.history.length - 1]);
  const level = storedLevel ?? levelFromPlacement(lastPlacement?.cefrLevel);

  const docs = LISTENING_DOCS.filter(d => d.level === level);
  const tasks = WRITING_TASKS.filter(t => t.level === level);

  const bestListening = (docId: string) => {
    const results = listeningResults.filter(r => r.docId === docId);
    if (results.length === 0) return null;
    return results.reduce((best, r) => (r.correct / r.total > best.correct / best.total ? r : best));
  };
  const lastWriting = (taskId: string) => {
    const subs = writingSubmissions.filter(s => s.taskId === taskId && s.evaluation);
    return subs[subs.length - 1] ?? null;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary">DELF Prep</h1>
        <p className="text-secondary mt-1 text-sm">
          Listening and writing practice in the format of the DELF tout public papers. Everything here is original material
          written to the official task types and marked with the current grid.
        </p>
      </motion.div>

      <div className="seg-control" role="tablist" aria-label="DELF level">
        {LEVELS.map(l => (
          <button key={l} role="tab" aria-selected={level === l} aria-pressed={level === l} className="seg-item" onClick={() => setLevel(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      {!storedLevel && lastPlacement && (
        <p className="text-xs text-muted -mt-3">Picked from your last placement test ({lastPlacement.cefrLevel}).</p>
      )}

      <section>
        <div className="section-label flex items-center gap-1.5">
          <Headphones size={13} /> Compréhension de l'oral
        </div>
        <p className="text-xs text-muted mb-2 px-1">{LEVEL_FACTS[level].listening}</p>
        <div className="inset-group">
          {docs.map(doc => {
            const best = bestListening(doc.id);
            return (
              <Link key={doc.id} to={`/exam/listening/${doc.id}`} className="inset-row no-underline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{doc.title}</p>
                  <p className="text-xs text-muted">
                    {doc.questions.length} questions · {doc.plays === 1 ? 'heard once' : 'heard twice'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {best && (
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: best.correct === best.total ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {best.correct === best.total && <CheckCircle2 size={12} />} {best.correct}/{best.total}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-label flex items-center gap-1.5">
          <PenLine size={13} /> Production écrite
        </div>
        <p className="text-xs text-muted mb-2 px-1">{LEVEL_FACTS[level].writing}</p>
        <div className="inset-group">
          {tasks.map(task => {
            const last = lastWriting(task.id);
            return (
              <Link key={task.id} to={`/exam/writing/${task.id}`} className="inset-row no-underline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{task.title}</p>
                  <p className="text-xs text-muted">
                    {task.genre} · {task.minWords}+ mots · {task.timeMinutes} min
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {last?.evaluation && (
                    <span className="text-xs font-semibold text-secondary">
                      {toOutOf25(last.evaluation.score, last.evaluation.maxScore)}/25
                    </span>
                  )}
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card p-4 space-y-2">
        <p className="text-sm font-semibold text-primary">Before the real thing</p>
        <p className="text-xs text-secondary">
          The DELF is marked out of 100 — 25 per skill. You need 50 overall and at least 5/25 in each skill. This app covers
          listening and writing; reading and speaking are tested too. Work through the official sample papers, which come with
          real recordings and answer keys:
        </p>
        <a
          href={`https://www.france-education-international.fr/diplome/delf-tout-public/niveau-${level}/exemples-sujets`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium inline-flex items-center gap-1 no-underline"
          style={{ color: 'var(--accent)' }}
        >
          Official DELF {level.toUpperCase()} sample papers <ExternalLink size={13} />
        </a>
      </section>
    </div>
  );
}
