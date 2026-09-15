import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
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
        className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer bg-transparent border-0"
      >
        <div>
          <p className="t-title font-semibold text-ink">{result.cefrLevel}</p>
          <p className="t-small text-ink-3 mt-1">
            {new Date(result.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {delta !== null && (
            <span className="t-small font-semibold text-ink-2">
              {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
            </span>
          )}
          {expanded ? <ChevronUp size={20} className="text-ink-3" /> : <ChevronDown size={20} className="text-ink-3" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
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
  const [keyboardSelect, setKeyboardSelect] = useState<number | null>(null);

  // Persist in-progress sessions so a refresh mid-test can resume.
  useEffect(() => {
    if (view !== 'testing') {
      sessionStorage.removeItem(PROGRESS_KEY);
      return;
    }
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify({ administeredIds, responses }));
  }, [view, administeredIds, responses]);

  // Safety net: the bank (350+ items) should never be exhausted within a
  // 40-item session, but bail out gracefully rather than render nothing.
  useEffect(() => {
    if (view === 'testing' && !currentItem) setView('intro');
  }, [view, currentItem]);

  useEffect(() => {
    setKeyboardSelect(null);
  }, [currentItem]);

  // Keyboard shortcuts: number keys select a multiple-choice option, mirroring Lesson.tsx.
  useEffect(() => {
    if (view !== 'testing' || !currentItem) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const exercise = resolveTestItemExercise(currentItem);
      if (exercise.type !== 'multiple-choice') return;
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 1 && n <= (exercise.options?.length ?? 0)) {
        setKeyboardSelect(n - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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
      c: currentItem.c ?? 0,
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

  if (view === 'intro') {
    return (
      <div className="page page--narrow">
        <h1 className="h-page">Find your level</h1>
        <p className="t-body mt-2 mb-6">
          An adaptive test that gets harder or easier based on how you're doing — 25 to 40 questions, untimed.
          Answer honestly; there's no studying for this one.
        </p>
        <Button onClick={startTest} variant="primary" className="w-full mb-6">
          Start test
        </Button>

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="h-section">Past attempts</h2>
            <div className="sheet rows mt-4">
              {reversedAttempts.map((a) => (
                <div key={a.result.id} className="row">
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

  if (view === 'testing' && currentItem) {
    const exercise = resolveTestItemExercise(currentItem);
    return (
      <div className="page page--narrow">
        <div className="mb-8">
          <ConfidenceMeter se={se} questionNumber={responses.length + 1} />
        </div>

        {exercise.type === 'multiple-choice' && (
          <MultipleChoice
            key={currentItem.id}
            exercise={exercise}
            onCorrect={() => submitResponse(true)}
            onWrong={() => submitResponse(false)}
            keyboardSelect={keyboardSelect}
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
      </div>
    );
  }

  const result = completedResult ?? history[history.length - 1];

  if (!result) {
    return (
      <div className="page page--narrow text-center py-16">
        <p className="text-ink-3">No result to show.</p>
        <Button className="mt-8" onClick={() => setView('intro')} variant="secondary">Back</Button>
      </div>
    );
  }

  const otherAttempts = reversedAttempts.filter(a => a.result.id !== result.id);

  return (
    <div className="page page--narrow">
      <h1 className="h-page">Your level</h1>
      <p className="t-small text-ink-3 mt-2 mb-8">This is an informal estimate, not a certified placement.</p>

      <TestResultBreakdown result={result} />

      <div className="flex gap-3 flex-col mt-8 mb-8">
        <Button variant="primary" onClick={startTest} className="w-full">
          <RotateCcw size={16} /> Retake test
        </Button>
        <Link to="/learn" className="w-full">
          <Button variant="secondary" className="w-full">Back to Learn</Button>
        </Link>
      </div>

      {otherAttempts.length > 0 && (
        <div className="mt-8">
          <h2 className="h-section">Past attempts</h2>
          <div className="sheet rows mt-4">
            {otherAttempts.map((a) => (
              <div key={a.result.id} className="row">
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
