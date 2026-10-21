import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { REVEAL } from '../../utils/motion';
import {
  ChevronLeft, ChevronRight, ChevronDown, Headphones, PenLine, Mic, BookOpen, ClipboardCheck, ExternalLink, Sparkles, Timer,
} from 'lucide-react';
import { getListeningDoc } from '../../data/exam/listening';
import { getWritingTask } from '../../data/exam/writing';
import { getSpeakingTask } from '../../data/exam/speaking';
import { RUBRIC_CRITERIA, SECTION_MINIMUM, buildEvaluation, countWords, toOutOf25 } from '../../data/exam/rubric';
import { ListeningPlayer } from '../../components/exam/ListeningPlayer';
import { ListeningQuestions } from '../../components/exam/ListeningQuestions';
import { WritingWorkspace, formatClock } from '../../components/exam/WritingWorkspace';
import { RubricScorecard } from '../../components/exam/RubricScorecard';
import { SpeakingSession } from '../../components/exam/SpeakingSession';
import { SpeakingFeedback, SpeakingMarking } from '../../components/exam/SpeakingResult';
import { Button } from '../../components/ui/Button';
import { useExamStore } from '../../stores/examStore';
import { useConversationStore } from '../../stores/conversationStore';
import { useTestStore } from '../../stores/testStore';
import { useProgressStore } from '../../stores/progressStore';
import { evaluateWriting } from '../../lib/gemini';
import { gradeListening } from '../../utils/listeningGrade';
import { todayString } from '../../utils/streak';
import {
  MOCK_MINUTES, delfLevelFromPlacement, listeningScore, mockVerdict, pickMockPaper, writingScore, type MockPaper,
} from '../../utils/mockExam';
import type { Recording } from '../../utils/audioRecording';
import type {
  DelfLevel, MockExamResult, RubricBand, RubricCriterionId, SpeakingEvaluation, WritingEvaluation,
} from '../../types/exam';

const LEVELS: DelfLevel[] = ['a1', 'a2', 'b1', 'b2'];

type Stage =
  | { kind: 'intro' }
  | { kind: 'listening'; doc: number }
  | { kind: 'writing'; task: number }
  | { kind: 'speaking' }
  | { kind: 'collecting' }
  | { kind: 'mark-writing'; task: number }
  | { kind: 'mark-speaking' }
  | { kind: 'results' };

interface WrittenText {
  text: string;
  seconds: number;
}

const MIDDLE_BANDS = Object.fromEntries(RUBRIC_CRITERIA.map(c => [c.id, 2])) as Record<RubricCriterionId, RubricBand>;

function SectionClock({ minutes, label }: { minutes: number; label: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const over = elapsed > minutes * 60;
  return (
    <div className="flex items-center justify-between text-xs px-1">
      <span className="font-semibold text-muted uppercase tracking-wide">{label}</span>
      <span className="inline-flex items-center gap-1 tabular-nums" style={{ color: over ? 'var(--accent)' : 'var(--text-secondary)' }}>
        <Timer size={12} /> {formatClock(elapsed)} / {formatClock(minutes * 60)}
      </span>
    </div>
  );
}

export function MockExam() {
  const storedLevel = useExamStore(s => s.level);
  const setLevel = useExamStore(s => s.setLevel);
  const mockResults = useExamStore(s => s.mockResults);
  const addMockResult = useExamStore(s => s.addMockResult);
  const lastPlacement = useTestStore(s => s.history[s.history.length - 1]);
  const apiKey = useConversationStore(s => s.geminiApiKey);
  const level = storedLevel ?? delfLevelFromPlacement(lastPlacement?.cefrLevel);

  const [stage, setStage] = useState<Stage>({ kind: 'intro' });
  const [paper, setPaper] = useState<MockPaper | null>(null);
  const [answers, setAnswers] = useState<(string | undefined)[][]>([]);
  const [texts, setTexts] = useState<WrittenText[]>([]);
  const [writingEvals, setWritingEvals] = useState<(WritingEvaluation | null)[]>([]);
  const [selfBands, setSelfBands] = useState(MIDDLE_BANDS);
  const [recordings, setRecordings] = useState<(Recording | null)[]>([]);
  const [speakingEval, setSpeakingEval] = useState<SpeakingEvaluation | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [justFinishedId, setJustFinishedId] = useState<string | null>(null);
  const writingMarking = useRef<Promise<(WritingEvaluation | null)[]> | null>(null);

  const inProgress = stage.kind !== 'intro' && stage.kind !== 'results';
  useEffect(() => {
    if (!inProgress) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [inProgress]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [stage]);

  const docs = useMemo(() => paper?.listeningDocIds.map(id => getListeningDoc(id)!).filter(Boolean) ?? [], [paper]);
  const tasks = useMemo(() => paper?.writingTaskIds.map(id => getWritingTask(id)!).filter(Boolean) ?? [], [paper]);
  const speakingTask = paper ? getSpeakingTask(paper.speakingTaskId) : undefined;
  const result = resultId ? mockResults.find(r => r.id === resultId) ?? null : null;

  function start() {
    const p = pickMockPaper(level, mockResults.filter(r => r.level === level));
    setPaper(p);
    setAnswers(p.listeningDocIds.map(() => []));
    setTexts([]);
    setWritingEvals([]);
    setRecordings([]);
    setSpeakingEval(null);
    setResultId(null);
    writingMarking.current = null;
    setStage({ kind: 'listening', doc: 0 });
  }

  function submitText(index: number, text: string, seconds: number) {
    const next = [...texts];
    next[index] = { text, seconds };
    setTexts(next);
    if (index < tasks.length - 1) {
      setStage({ kind: 'writing', task: index + 1 });
      return;
    }
    if (apiKey) {
      writingMarking.current = Promise.all(tasks.map((t, i) =>
        evaluateWriting(apiKey, t, next[i].text).catch(() => null),
      ));
    }
    setStage({ kind: 'speaking' });
  }

  async function speakingDone(recs: (Recording | null)[]) {
    setRecordings(recs);
    setStage({ kind: 'collecting' });
    const evals = writingMarking.current ? await writingMarking.current : tasks.map(() => null);
    setWritingEvals(evals);
    const firstUnmarked = evals.findIndex(e => !e);
    setSelfBands(MIDDLE_BANDS);
    setStage(firstUnmarked >= 0 ? { kind: 'mark-writing', task: firstUnmarked } : { kind: 'mark-speaking' });
  }

  function saveWritingSelfMark(index: number) {
    const task = tasks[index];
    const evaluation = buildEvaluation(task.level, 'self', selfBands, countWords(texts[index].text), task.minWords, { comments: {} });
    const next = writingEvals.map((e, i) => (i === index ? evaluation : e));
    setWritingEvals(next);
    setSelfBands(MIDDLE_BANDS);
    const nextUnmarked = next.findIndex(e => !e);
    setStage(nextUnmarked >= 0 ? { kind: 'mark-writing', task: nextUnmarked } : { kind: 'mark-speaking' });
  }

  function finish(speaking: SpeakingEvaluation) {
    if (!paper || !speakingTask) return;
    setSpeakingEval(speaking);
    const store = useExamStore.getState();
    const date = todayString();
    const stamp = Date.now();

    const graded = docs.map((d, i) => gradeListening(d.questions, answers[i] ?? []));
    docs.forEach((d, i) => store.addListeningResult({
      id: `listening-${stamp}-${i}`, docId: d.id, date, mode: 'exam',
      correct: graded[i].filter(Boolean).length, total: d.questions.length,
    }));
    const writing = writingEvals.map(e => e!);
    tasks.forEach((t, i) => store.addWritingSubmission({
      id: `writing-${stamp}-${i}`, taskId: t.id, date, text: texts[i].text,
      wordCount: countWords(texts[i].text), secondsSpent: texts[i].seconds, evaluation: writing[i],
    }));
    store.addSpeakingAttempt({
      id: `speaking-${stamp}`, taskId: speakingTask.id, date,
      secondsPerPart: recordings.map(r => Math.round(r?.seconds ?? 0)), evaluation: speaking,
    });

    const correct = graded.flat().filter(Boolean).length;
    const total = graded.flat().length;
    const mock: MockExamResult = {
      id: `mock-${stamp}`,
      level: paper.level,
      date,
      listening: { score: listeningScore(correct, total), source: 'auto' },
      writing: { score: writingScore(writing), source: writing.every(e => e.source === 'ai') ? 'ai' : 'self' },
      speaking: { score: toOutOf25(speaking.score, speaking.maxScore), source: speaking.source },
      reading: null,
      listeningDocIds: paper.listeningDocIds,
      writingTaskIds: paper.writingTaskIds,
      speakingTaskId: paper.speakingTaskId,
    };
    addMockResult(mock);
    useProgressStore.getState().addXP(60);
    setResultId(mock.id);
    setJustFinishedId(mock.id);
    setStage({ kind: 'results' });
  }

  if (stage.kind === 'intro' || !paper) {
    const minutes = MOCK_MINUTES[level];
    const past = mockResults.filter(r => r.level === level).reverse();
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <Link to="/exam" className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline" style={{ color: 'var(--accent)' }}>
            <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> DELF Prep
          </Link>
          <h1 className="text-2xl font-bold text-primary">Mock exam</h1>
          <p className="text-sm text-secondary mt-1">
            A full paper in exam conditions, in the order of the real one. No replays, no hints, no feedback until the end.
          </p>
        </div>

        <div className="seg-control" role="tablist" aria-label="DELF level">
          {LEVELS.map(l => (
            <button key={l} role="tab" aria-selected={level === l} aria-pressed={level === l} className="seg-item" onClick={() => setLevel(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="inset-group">
          {[
            { icon: Headphones, name: 'Compréhension de l’oral', detail: `${minutes.listening} min · about 4 recordings` },
            { icon: BookOpen, name: 'Compréhension des écrits', detail: 'Not in the app · add your score from an official sample paper', muted: true },
            { icon: PenLine, name: 'Production écrite', detail: `${minutes.writing} min${level === 'a2' ? ' · two texts' : ''}` },
            { icon: Mic, name: 'Production orale', detail: 'Preparation, then the whole speaking paper' },
          ].map(({ icon: Icon, name, detail, muted }, i) => (
            <div key={name} className="inset-row gap-3" style={{ borderTop: i > 0 ? '0.5px solid var(--hairline)' : 'none', opacity: muted ? 0.6 : 1 }}>
              <Icon size={16} className="text-muted flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{name}</p>
                <p className="text-xs text-muted">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted px-1">
          Set aside about {minutes.listening + minutes.writing + (level === 'b2' ? 45 : 25)} minutes somewhere you can speak
          out loud. {apiKey
            ? 'Writing and speaking are marked by Gemini at the end.'
            : <>Without a Gemini key you mark the writing and speaking yourself at the end. <Link to="/settings" style={{ color: 'var(--accent)' }}>Add one in Settings</Link>.</>}
        </p>

        <Button onClick={start} className="w-full"><ClipboardCheck size={15} /> Start the DELF {level.toUpperCase()} mock</Button>

        {past.length > 0 && (
          <section>
            <div className="section-label">Previous mocks</div>
            <div className="inset-group">
              {past.map((r, i) => {
                const v = mockVerdict(r);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setResultId(r.id); setPaper({ level: r.level, listeningDocIds: r.listeningDocIds, writingTaskIds: r.writingTaskIds, speakingTaskId: r.speakingTaskId }); setStage({ kind: 'results' }); }}
                    className="inset-row w-full justify-between cursor-pointer text-left"
                    style={{ background: 'transparent', border: 'none', borderTop: i > 0 ? '0.5px solid var(--hairline)' : 'none' }}
                  >
                    <span className="text-sm text-primary">{r.date}</span>
                    <span className="text-xs font-semibold text-secondary">
                      {v.total}/{r.reading === null ? 75 : 100}
                      {v.kind === 'pass' ? ' · admis' : v.kind === 'fail' ? ' · non admis' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="chip text-xs">Mock DELF {paper.level.toUpperCase()}</span>
        {stage.kind !== 'results' && (
          <span className="text-xs text-muted">Leaving this page ends the mock.</span>
        )}
      </div>

      {stage.kind === 'listening' && (() => {
        const doc = docs[stage.doc];
        const isLast = stage.doc === docs.length - 1;
        return (
          <div className="space-y-4">
            <SectionClock key="listening" minutes={MOCK_MINUTES[paper.level].listening} label={`Compréhension de l’oral · ${stage.doc + 1}/${docs.length}`} />
            <div>
              <h1 className="text-xl font-bold text-primary">{doc.title}</h1>
              <p className="text-sm text-secondary mt-1" lang="fr">{doc.situation}</p>
            </div>
            <ListeningPlayer key={doc.id} script={doc.script} maxPlays={doc.plays} allowRateChange={false} />
            <ListeningQuestions
              questions={doc.questions}
              answers={answers[stage.doc] ?? []}
              onAnswer={(q, v) => setAnswers(prev => prev.map((a, i) => {
                if (i !== stage.doc) return a;
                const next = [...a];
                next[q] = v;
                return next;
              }))}
            />
            <Button
              onClick={() => setStage(isLast ? { kind: 'writing', task: 0 } : { kind: 'listening', doc: stage.doc + 1 })}
              className="w-full"
            >
              {isLast ? 'Finish listening — on to writing' : 'Next recording'} <ChevronRight size={15} />
            </Button>
          </div>
        );
      })()}

      {stage.kind === 'writing' && (() => {
        const task = tasks[stage.task];
        return (
          <div className="space-y-4">
            <SectionClock key="writing" minutes={MOCK_MINUTES[paper.level].writing} label={`Production écrite${tasks.length > 1 ? ` · ${stage.task + 1}/${tasks.length}` : ''}`} />
            <div className="card p-4 space-y-1">
              <p className="text-base font-bold text-primary">{task.title}</p>
              <p className="text-[0.95rem] text-primary leading-relaxed" lang="fr">{task.consigne}</p>
            </div>
            <WritingWorkspace
              key={task.id}
              minWords={task.minWords}
              timeMinutes={task.timeMinutes}
              onSubmit={(text, seconds) => submitText(stage.task, text, seconds)}
              submitLabel={stage.task < tasks.length - 1 ? 'Hand in — next text' : 'Hand in — on to speaking'}
            />
          </div>
        );
      })()}

      {stage.kind === 'speaking' && speakingTask && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide px-1">Production orale</p>
          <SpeakingSession task={speakingTask} examMode onComplete={speakingDone} />
        </div>
      )}

      {stage.kind === 'collecting' && (
        <div className="card p-8 text-center space-y-2">
          <Sparkles size={22} className="mx-auto" style={{ color: 'var(--accent)' }} />
          <p className="text-sm text-secondary">Collecting your writing marks…</p>
        </div>
      )}

      {stage.kind === 'mark-writing' && (() => {
        const task = tasks[stage.task];
        const text = texts[stage.task];
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Marking · production écrite</p>
              <h1 className="text-xl font-bold text-primary">{task.title}</h1>
              {apiKey && <p className="text-xs text-secondary mt-1">AI marking didn’t come back for this text — mark it yourself.</p>}
            </div>
            <div className="card p-4 space-y-2">
              <p className="text-sm font-semibold text-primary">Your text · {countWords(text.text)} mots</p>
              <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{text.text}</p>
            </div>
            <div className="card p-4 space-y-2">
              <p className="text-sm font-semibold text-primary">Model answer</p>
              <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{task.modelAnswer}</p>
              <ul className="text-xs text-secondary space-y-0.5 list-disc pl-5">
                {task.checklist.map(c => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <RubricScorecard level={task.level} bands={selfBands} onBandChange={(id, b) => setSelfBands(prev => ({ ...prev, [id]: b }))} />
            <Button onClick={() => saveWritingSelfMark(stage.task)} className="w-full">Save marks <ChevronRight size={15} /></Button>
          </div>
        );
      })()}

      {stage.kind === 'mark-speaking' && speakingTask && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide px-1">Marking · production orale</p>
          <SpeakingMarking task={speakingTask} recordings={recordings} apiKey={apiKey} onEvaluated={finish} />
        </div>
      )}

      {stage.kind === 'results' && result && (
        <MockResults
          result={result}
          fresh={result.id === justFinishedId}
          docs={docs}
          answers={answers}
          tasks={tasks}
          texts={texts}
          writingEvals={writingEvals}
          speakingEval={speakingEval}
          recordings={recordings}
          onDone={() => setStage({ kind: 'intro' })}
        />
      )}
    </div>
  );
}

interface MockResultsProps {
  result: MockExamResult;
  /** Just sat, so answers, texts and recordings are still in memory to review. */
  fresh: boolean;
  docs: NonNullable<ReturnType<typeof getListeningDoc>>[];
  answers: (string | undefined)[][];
  tasks: NonNullable<ReturnType<typeof getWritingTask>>[];
  texts: WrittenText[];
  writingEvals: (WritingEvaluation | null)[];
  speakingEval: SpeakingEvaluation | null;
  recordings: (Recording | null)[];
  onDone: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-4 cursor-pointer text-left"
        style={{ background: 'transparent', border: 'none' }}
      >
        <span className="text-sm font-semibold text-primary">{title}</span>
        <ChevronDown size={16} className="text-muted transition-transform" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}

function MockResults({ result, fresh, docs, answers, tasks, texts, writingEvals, speakingEval, recordings, onDone }: MockResultsProps) {
  const setMockReading = useExamStore(s => s.setMockReading);
  const [readingDraft, setReadingDraft] = useState(result.reading === null ? '' : String(result.reading));
  const verdict = mockVerdict(result);
  const speakingTask = getSpeakingTask(result.speakingTaskId);

  function saveReading(value: string) {
    setReadingDraft(value);
    const n = Number(value.replace(',', '.'));
    if (value.trim() === '') setMockReading(result.id, null);
    else if (Number.isFinite(n) && n >= 0 && n <= 25) setMockReading(result.id, Math.round(n * 2) / 2);
  }

  const rows: { label: string; score: number | null; source?: string }[] = [
    { label: 'Compréhension de l’oral', score: result.listening.score },
    { label: 'Compréhension des écrits', score: result.reading },
    { label: 'Production écrite', score: result.writing.score, source: result.writing.source },
    { label: 'Production orale', score: result.speaking.score, source: result.speaking.source },
  ];

  return (
    <motion.div {...REVEAL} className="space-y-5">
      <div className="card p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-primary">Résultats · DELF {result.level.toUpperCase()}</h1>
          <p>
            <span className="text-3xl font-bold text-primary">{verdict.total}</span>
            <span className="text-muted"> / {result.reading === null ? 75 : 100}</span>
          </p>
        </div>

        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.label} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-primary">
                  {r.label}
                  {r.source && r.source !== 'auto' && <span className="text-xs text-muted"> · {r.source === 'ai' ? 'AI-marked' : 'self-marked'}</span>}
                </span>
                <span className="font-semibold" style={{ color: r.score !== null && r.score < SECTION_MINIMUM ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {r.score === null ? '—' : r.score} / 25
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-inset)' }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${((r.score ?? 0) / 25) * 100}%`,
                    backgroundColor: r.score !== null && r.score < SECTION_MINIMUM ? 'var(--danger)' : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold" style={{ color: verdict.kind === 'pass' ? 'var(--success)' : verdict.kind === 'needs-reading' ? 'var(--text-primary)' : 'var(--danger)' }}>
          {verdict.kind === 'pass' && 'Admis — that’s a pass: 50 or more, and at least 5 in every section.'}
          {verdict.kind === 'fail' && (rows.some(r => r.score !== null && r.score < SECTION_MINIMUM)
            ? 'Non admis — a section is under 5/25, which fails the diploma whatever the total.'
            : 'Non admis — under 50/100 overall.')}
          {verdict.kind === 'needs-reading' && `On track if you score ${verdict.readingNeeded}/25 or more in reading.`}
          {verdict.kind === 'cannot-pass' && 'Not a pass yet, whatever the reading score: a section is under 5/25 or the total is too low.'}
        </p>
      </div>

      <div className="card p-4 space-y-2">
        <label htmlFor="reading-score" className="text-sm font-semibold text-primary">Reading score (optional)</label>
        <p className="text-xs text-secondary">
          Do the reading section of an official sample paper, mark it with its answer key, and enter your score to see a full result.
        </p>
        <div className="flex items-center gap-2">
          <input
            id="reading-score"
            inputMode="decimal"
            value={readingDraft}
            onChange={e => saveReading(e.target.value)}
            placeholder="0–25"
            className="w-24 text-sm rounded-xl px-3 py-2"
            style={{ background: 'var(--bg-inset)', border: '0.5px solid var(--hairline)', color: 'var(--text-primary)' }}
          />
          <span className="text-sm text-muted">/ 25</span>
          <a
            href={`https://www.france-education-international.fr/diplome/delf-tout-public/niveau-${result.level}/exemples-sujets`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium inline-flex items-center gap-1 no-underline ml-auto"
            style={{ color: 'var(--accent)' }}
          >
            Sample papers <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {fresh && (
        <>
          <Section title="Review · compréhension de l’oral">
            {docs.map((doc, i) => (
              <div key={doc.id} className="space-y-2">
                <p className="text-sm font-semibold text-primary">{doc.title}</p>
                <ListeningQuestions
                  questions={doc.questions}
                  answers={answers[i] ?? []}
                  results={gradeListening(doc.questions, answers[i] ?? [])}
                  onAnswer={() => {}}
                />
              </div>
            ))}
          </Section>

          <Section title="Review · production écrite">
            {tasks.map((task, i) => writingEvals[i] && (
              <div key={task.id} className="space-y-3">
                <p className="text-sm font-semibold text-primary">{task.title}</p>
                <RubricScorecard level={task.level} evaluation={writingEvals[i]} />
                {writingEvals[i]!.summary && <p className="text-sm text-secondary">{writingEvals[i]!.summary}</p>}
                {writingEvals[i]!.corrections?.map((c, j) => (
                  <p key={j} className="text-sm" lang="fr">
                    <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{c.original}</span>
                    {' → '}
                    <span style={{ color: 'var(--success)' }} className="font-medium">{c.corrected}</span>
                    {c.explanation && <span className="block text-xs text-muted">{c.explanation}</span>}
                  </p>
                ))}
                <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed" lang="fr">{texts[i]?.text}</p>
              </div>
            ))}
          </Section>

          {speakingTask && speakingEval && (
            <Section title="Review · production orale">
              <SpeakingFeedback task={speakingTask} evaluation={speakingEval} recordings={recordings} />
            </Section>
          )}
        </>
      )}

      {!fresh && (
        <p className="text-xs text-muted px-1 flex items-start gap-1.5">
          <Sparkles size={12} className="mt-0.5 flex-shrink-0" />
          Each section’s marking is also saved with that exercise in DELF Prep, under its previous attempts.
        </p>
      )}

      <Button variant="secondary" onClick={onDone} className="w-full">Done</Button>
    </motion.div>
  );
}
