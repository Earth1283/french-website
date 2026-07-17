import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { ITEM_BANK, resolveTestItemExercise } from '../data/testItemBank';
import { MultipleChoice } from '../components/lesson/MultipleChoice';
import { FillInBlank } from '../components/lesson/FillInBlank';
import { TranslationChallenge } from '../components/lesson/TranslationChallenge';
import { ConfidenceMeter } from '../components/test/ConfidenceMeter';
import { TestResultBreakdown } from '../components/test/TestResultBreakdown';
import { Button } from '../components/ui/Button';
import { useTestStore } from '../stores/testStore';
import { useProgressStore } from '../stores/progressStore';
import { estimateAbilityEAP, selectNextItem, shouldStop, thetaToCEFR } from '../utils/irt';
import { todayString } from '../utils/streak';
import type { TestItem, TestResponseLog, TestResult } from '../types';

type View = 'intro' | 'testing' | 'results';

const PROGRESS_KEY = 'adaptive-test-progress';

function loadSavedTestProgress(): { administeredIds: string[]; responses: TestResponseLog[] } | null {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function recentTopicsFrom(responses: TestResponseLog[]): string[] {
  return responses.slice(-2).map(r => r.topic);
}

interface AttemptRowProps {
  result: TestResult;
  delta: number | null;
  expanded: boolean;
  onToggle: () => void;
}

function AttemptRow({ result, delta, expanded, onToggle }: AttemptRowProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
        style={{ background: 'transparent', border: 'none' }}
      >
        <div>
          <p className="text-sm font-semibold text-primary">{result.cefrLevel}</p>
          <p className="text-xs text-muted">
            {new Date(result.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {delta !== null && (
            <span className="text-xs font-semibold" style={{ color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
            </span>
          )}
          {expanded ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-4">
          <TestResultBreakdown result={result} compact />
        </div>
      )}
    </div>
  );
}

export function AdaptiveTest() {
  const history = useTestStore(s => s.history);
  const addResult = useTestStore(s => s.addResult);

  const saved = loadSavedTestProgress();
  const initialEst = saved && saved.responses.length > 0 ? estimateAbilityEAP(saved.responses) : { theta: 0, se: 1 };

  const [view, setView] = useState<View>(saved ? 'testing' : 'intro');
  const [administeredIds, setAdministeredIds] = useState<string[]>(saved?.administeredIds ?? []);
  const [responses, setResponses] = useState<TestResponseLog[]>(saved?.responses ?? []);
  const [theta, setTheta] = useState(initialEst.theta);
  const [se, setSe] = useState(initialEst.se);
  const [currentItem, setCurrentItem] = useState<TestItem | null>(() => {
    if (!saved) return null;
    const candidates = ITEM_BANK.filter(item => !saved.administeredIds.includes(item.id));
    if (candidates.length === 0) return null;
    return selectNextItem(candidates, initialEst.theta, recentTopicsFrom(saved.responses));
  });
  const [completedResult, setCompletedResult] = useState<TestResult | null>(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  // Persist in-progress sessions so a refresh mid-test can resume.
  useEffect(() => {
    if (view !== 'testing') {
      sessionStorage.removeItem(PROGRESS_KEY);
      return;
    }
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify({ administeredIds, responses }));
  }, [view, administeredIds, responses]);

  // Safety net: the bank (300+ items) should never be exhausted within a
  // 40-item session, but bail out gracefully rather than render nothing.
  useEffect(() => {
    if (view === 'testing' && !currentItem) setView('intro');
  }, [view, currentItem]);

  const attemptsWithDelta = history.map((result, i) => ({
    result,
    delta: i > 0 ? result.theta - history[i - 1].theta : null,
  }));
  const reversedAttempts = [...attemptsWithDelta].reverse();

  function startTest() {
    sessionStorage.removeItem(PROGRESS_KEY);
    setAdministeredIds([]);
    setResponses([]);
    setTheta(0);
    setSe(1);
    setCompletedResult(null);
    setCurrentItem(selectNextItem(ITEM_BANK, 0, []));
    setView('testing');
  }

  function finalizeTest(finalResponses: TestResponseLog[], finalTheta: number, finalSe: number) {
    const { level, band } = thetaToCEFR(finalTheta);
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    finalResponses.forEach(r => {
      const t = topicBreakdown[r.topic] ?? { correct: 0, total: 0 };
      t.total += 1;
      if (r.correct) t.correct += 1;
      topicBreakdown[r.topic] = t;
    });

    const result: TestResult = {
      id: `test-${Date.now()}`,
      date: todayString(),
      theta: finalTheta,
      se: finalSe,
      cefrLevel: level,
      cefrBand: band,
      itemsAdministered: finalResponses.length,
      correctCount: finalResponses.filter(r => r.correct).length,
      topicBreakdown,
      responses: finalResponses,
    };

    addResult(result);
    useProgressStore.getState().addXP(30);
    setCompletedResult(result);
    setView('results');
  }

  function submitResponse(correct: boolean) {
    if (!currentItem) return;

    const log: TestResponseLog = {
      itemId: currentItem.id,
      topic: currentItem.topic,
      correct,
      thetaAtTime: theta,
      a: currentItem.a,
      b: currentItem.b,
    };
    const newResponses = [...responses, log];
    const newAdministeredIds = [...administeredIds, currentItem.id];
    const est = estimateAbilityEAP(newResponses);

    setResponses(newResponses);
    setAdministeredIds(newAdministeredIds);
    setTheta(est.theta);
    setSe(est.se);

    if (shouldStop(newResponses.length, est.se)) {
      finalizeTest(newResponses, est.theta, est.se);
      return;
    }

    const candidates = ITEM_BANK.filter(item => !newAdministeredIds.includes(item.id));
    setCurrentItem(selectNextItem(candidates, est.theta, recentTopicsFrom(newResponses)));
  }

  // ─── Intro view ─────────────────────────────────────────────────────────────
  if (view === 'intro') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="space-y-6"
        >
          <span
            className="w-20 h-20 mx-auto rounded-[22px] flex items-center justify-center text-5xl"
            style={{ backgroundColor: 'var(--accent-tint)' }}
          >
            🎯
          </span>
          <div>
            <h1 className="text-3xl font-bold text-primary">Find Your Level</h1>
            <p className="text-secondary mt-2">
              An adaptive test that gets harder or easier based on how you're doing — 25 to 40 questions, untimed.
              Answer honestly; there's no studying for this one.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="chip">🧠 Adapts to you</span>
            <span className="chip">⏱️ Untimed</span>
            <span className="xp-badge text-sm px-3 py-1.5">+30 XP</span>
          </div>
          <Button size="lg" onClick={startTest} className="w-full max-w-xs mx-auto">
            Start Test <ArrowRight size={17} />
          </Button>
        </motion.div>

        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-left"
          >
            <p className="section-label" style={{ paddingLeft: 0 }}>Past attempts</p>
            <div className="inset-group">
              {reversedAttempts.map((a, i) => (
                <div key={a.result.id} style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}>
                  <AttemptRow
                    result={a.result}
                    delta={a.delta}
                    expanded={expandedAttemptId === a.result.id}
                    onToggle={() => setExpandedAttemptId(id => (id === a.result.id ? null : a.result.id))}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // ─── Testing view ───────────────────────────────────────────────────────────
  if (view === 'testing' && currentItem) {
    const exercise = resolveTestItemExercise(currentItem);
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <ConfidenceMeter se={se} questionNumber={responses.length + 1} />
        </div>

        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        >
          {exercise.type === 'multiple-choice' && (
            <MultipleChoice
              key={currentItem.id}
              exercise={exercise}
              onCorrect={() => submitResponse(true)}
              onWrong={() => submitResponse(false)}
            />
          )}
          {exercise.type === 'fill-blank' && (
            <FillInBlank
              key={currentItem.id}
              exercise={exercise}
              onCorrect={() => submitResponse(true)}
              onWrong={() => submitResponse(false)}
            />
          )}
          {exercise.type === 'translation' && (
            <TranslationChallenge
              key={currentItem.id}
              exercise={exercise}
              onCorrect={() => submitResponse(true)}
              onWrong={() => submitResponse(false)}
            />
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Results view ───────────────────────────────────────────────────────────
  const result = completedResult ?? history[history.length - 1];

  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted">No result to show.</p>
        <Button className="mt-4" onClick={() => setView('intro')}>Back</Button>
      </div>
    );
  }

  const otherAttempts = reversedAttempts.filter(a => a.result.id !== result.id);

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Your Level</h1>
        <p className="text-secondary text-sm mt-1">This is an informal estimate, not a certified placement.</p>
      </motion.div>

      <TestResultBreakdown result={result} />

      <div className="flex gap-3 justify-center flex-wrap mt-8">
        <Button variant="secondary" onClick={startTest}>
          <RotateCcw size={15} /> Retake
        </Button>
        <Link to="/learn" className="flex flex-col">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>

      {otherAttempts.length > 0 && (
        <div className="mt-10">
          <p className="section-label" style={{ paddingLeft: 0 }}>Past attempts</p>
          <div className="inset-group">
            {otherAttempts.map((a, i) => (
              <div key={a.result.id} style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}>
                <AttemptRow
                  result={a.result}
                  delta={a.delta}
                  expanded={expandedAttemptId === a.result.id}
                  onToggle={() => setExpandedAttemptId(id => (id === a.result.id ? null : a.result.id))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
