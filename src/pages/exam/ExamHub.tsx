import { Link } from 'react-router-dom';
import { ChevronRight, Headphones, PenLine, Mic, ClipboardCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import { LISTENING_DOCS } from '../../data/exam/listening';
import { WRITING_TASKS } from '../../data/exam/writing';
import { SPEAKING_TASKS } from '../../data/exam/speaking';
import { delfLevelFromPlacement, mockVerdict } from '../../utils/mockExam';
import { toOutOf25 } from '../../data/exam/rubric';
import { useExamStore } from '../../stores/examStore';
import { useTestStore } from '../../stores/testStore';
import type { DelfLevel } from '../../types/exam';

const LEVELS: DelfLevel[] = ['a1', 'a2', 'b1', 'b2'];

// DELF tout public: each of the four skills is out of 25; the diploma needs
// 50/100 overall and at least 5/25 in every skill.
const LEVEL_FACTS: Record<DelfLevel, { listening: string; writing: string; speaking: string }> = {
  a1: {
    listening: 'About 20 min · short recordings heard twice',
    writing: '30 min · a form, then a 40-word message',
    speaking: '5–7 min · interview, asking questions, a shopping role-play',
  },
  a2: {
    listening: 'About 25 min · short recordings heard twice',
    writing: '45 min · two texts of 60+ words',
    speaking: '6–8 min · interview, a short talk, a role-play',
  },
  b1: {
    listening: 'About 25 min · recordings heard twice',
    writing: '45 min · one 160-word opinion text',
    speaking: '15 min · interview, a role-play, your view on a text',
  },
  b2: {
    listening: 'About 30 min · long documents twice, short ones once',
    writing: '1 hour · one 250-word argued text',
    speaking: '20 min after 30 min prep · present and defend a view on a text',
  },
};

export function ExamHub() {
  const storedLevel = useExamStore(s => s.level);
  const setLevel = useExamStore(s => s.setLevel);
  const listeningResults = useExamStore(s => s.listeningResults);
  const writingSubmissions = useExamStore(s => s.writingSubmissions);
  const speakingAttempts = useExamStore(s => s.speakingAttempts);
  const mockResults = useExamStore(s => s.mockResults);
  const lastPlacement = useTestStore(s => s.history[s.history.length - 1]);
  const level = storedLevel ?? delfLevelFromPlacement(lastPlacement?.cefrLevel);

  const docs = LISTENING_DOCS.filter(d => d.level === level);
  const tasks = WRITING_TASKS.filter(t => t.level === level);
  const speakingTasks = SPEAKING_TASKS.filter(t => t.level === level);
  const lastMock = [...mockResults].reverse().find(r => r.level === level);

  const bestListening = (docId: string) => {
    const results = listeningResults.filter(r => r.docId === docId);
    if (results.length === 0) return null;
    return results.reduce((best, r) => (r.correct / r.total > best.correct / best.total ? r : best));
  };
  const lastWriting = (taskId: string) => {
    const subs = writingSubmissions.filter(s => s.taskId === taskId && s.evaluation);
    return subs[subs.length - 1] ?? null;
  };
  const lastSpeaking = (taskId: string) => {
    const attempts = speakingAttempts.filter(a => a.taskId === taskId && a.evaluation);
    return attempts[attempts.length - 1] ?? null;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">DELF Prep</h1>
        <p className="text-secondary mt-1 text-sm">
          Listening, writing and speaking practice in the format of the DELF tout public papers, and full mock exams.
          Everything here is original material written to the official task types.
        </p>
      </div>

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

      <Link to="/exam/mock" className="card p-4 flex items-center gap-3 no-underline">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)' }}>
          <ClipboardCheck size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">Mock exam · DELF {level.toUpperCase()}</p>
          <p className="text-xs text-muted">
            {lastMock
              ? `Last: ${mockVerdict(lastMock).total}/${lastMock.reading === null ? 75 : 100} on ${lastMock.date}`
              : 'Listening, writing and speaking back to back, scored like the real thing'}
          </p>
        </div>
        <ChevronRight size={16} className="text-muted" />
      </Link>

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

      <section>
        <div className="section-label flex items-center gap-1.5">
          <Mic size={13} /> Production orale
        </div>
        <p className="text-xs text-muted mb-2 px-1">{LEVEL_FACTS[level].speaking}</p>
        <div className="inset-group">
          {speakingTasks.map(task => {
            const last = lastSpeaking(task.id);
            return (
              <Link key={task.id} to={`/exam/speaking/${task.id}`} className="inset-row no-underline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{task.title}</p>
                  <p className="text-xs text-muted truncate">{task.parts.map(p => p.title).join(' · ')}</p>
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
          listening, writing and speaking; reading is tested too. Work through the official sample papers, which come with
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
