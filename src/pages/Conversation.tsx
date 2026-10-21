import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAP_TRANSITION, NO_OVERSHOOT_SPRING, REWARD_SPRING, REVEAL, COLLAPSE } from '../utils/motion';
import {
  ChevronLeft, ArrowUp, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle,
  Bot, Key, ChevronDown, ChevronUp, Volume2, VolumeX, Flag, Sparkles,
} from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';
import { useConversationStore } from '../stores/conversationStore';
import { Button } from '../components/ui/Button';
import type { Scenario, Difficulty, ConversationRecord } from '../types';
import { callGemini, debriefConversation } from '../lib/gemini';
import { scriptedDebrief } from '../utils/debrief';
import { todayString } from '../utils/streak';
import { speak } from '../utils/speech';
import { listenErrorMessage } from '../utils/recognition';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { useSpeechStore } from '../stores/speechStore';
import { MicButton } from '../components/ui/MicButton';

interface ChatMessage {
  role: 'npc' | 'player';
  text: string;
  translation?: string;
  feedback?: string;
  correct?: boolean;
}

type View = 'picker' | 'chat' | 'complete';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFFICULTY_LABELS: Record<Difficulty, { name: string; desc: string }> = {
  1: { name: 'Guided', desc: 'Options + translations shown' },
  2: { name: 'Standard', desc: 'French only, type your response' },
  3: { name: 'Challenge', desc: 'Strict grammar, no scaffolding' },
};

export function Conversation() {
  const { geminiApiKey, difficulty, setApiKey, setDifficulty, history, addRecord } = useConversationStore();
  const [view, setView] = useState<View>('picker');
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [playerInput, setPlayerInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [missionSuccess, setMissionSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showKeySection, setShowKeySection] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [record, setRecord] = useState<ConversationRecord | null>(null);
  const [debriefing, setDebriefing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAiMode = !!geminiApiKey;
  const { autoSpeakReplies, setAutoSpeakReplies } = useSpeechStore();
  const mic = useSpeechInput(readings => {
    setPlayerInput(readings[0]);
    inputRef.current?.focus();
  });

  const currentTurn = activeScenario?.turns[turnIndex];
  const shuffledOptions = useMemo(
    () => (currentTurn ? shuffle(currentTurn.options) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turnIndex, activeScenario?.id],
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (view === 'chat') inputRef.current?.focus();
  }, [view, turnIndex]);

  function startScenario(scenario: Scenario) {
    const firstTurn = scenario.turns[0];
    setActiveScenario(scenario);
    setTurnIndex(0);
    setMessages([{
      role: 'npc',
      text: firstTurn.npcFrench,
      translation: difficulty === 1 ? firstTurn.npcEnglish : undefined,
    }]);
    setAiHistory([{ role: 'model', text: firstTurn.npcFrench }]);
    if (autoSpeakReplies) speak(firstTurn.npcFrench);
    setPlayerInput('');
    setAiError(null);
    setShowHint(false);
    setMissionSuccess(false);
    setView('chat');
  }

  /** `pending`: messages pushed in the same handler, which this render's `messages` doesn't have yet. */
  async function endConversation(success: boolean, pending: ChatMessage[] = []) {
    if (!activeScenario) return;
    const scenario = activeScenario;
    const all = [...messages, ...pending];
    const replies = all.filter(m => m.role === 'player');
    setMissionSuccess(success);
    setRecord(null);
    setView('complete');

    let debrief;
    if (isAiMode && replies.length > 0) {
      setDebriefing(true);
      try {
        debrief = await debriefConversation(geminiApiKey, scenario, difficulty, all.map(m => ({ role: m.role, text: m.text })));
      } catch (err) {
        debrief = {
          source: 'ai' as const,
          summary: `Couldn't get a debrief from Gemini (${err instanceof Error ? err.message : 'unknown error'}).`,
          strengths: [],
          corrections: [],
          phrases: all.filter(m => m.role === 'npc').slice(0, 6).map(m => ({ french: m.text, english: '' })),
        };
      } finally {
        setDebriefing(false);
      }
    } else {
      debrief = scriptedDebrief(scenario, replies.map(r => ({ text: r.text, correct: r.correct })), success);
    }

    const rec: ConversationRecord = {
      id: `conversation-${Date.now()}`,
      scenarioId: scenario.id,
      date: todayString(),
      missionComplete: success,
      exchanges: replies.length,
      debrief,
    };
    if (replies.length > 0) addRecord(rec);
    setRecord(rec);
  }

  function openRecord(rec: ConversationRecord) {
    const scenario = SCENARIOS.find(s => s.id === rec.scenarioId);
    if (!scenario) return;
    setActiveScenario(scenario);
    setMissionSuccess(rec.missionComplete);
    setRecord(rec);
    setView('complete');
  }

  function pushNpc(text: string, translation?: string, feedback?: string) {
    setMessages(prev => [...prev, { role: 'npc', text, translation, feedback }]);
    if (autoSpeakReplies) speak(text);
  }

  function pushPlayer(text: string, correct?: boolean, feedback?: string) {
    setMessages(prev => [...prev, { role: 'player', text, correct, feedback }]);
  }

  function advanceScripted(playerText: string, isCorrect: boolean) {
    if (!activeScenario) return;
    const turn = activeScenario.turns[turnIndex];
    const correction = isCorrect ? undefined : `Suggested: ${turn.correctResponse}`;
    pushPlayer(playerText, isCorrect, correction);
    setShowHint(false);

    if (turn.missionComplete) {
      endConversation(true, [{ role: 'player', text: playerText, correct: isCorrect }]);
      return;
    }

    const next = activeScenario.turns[turnIndex + 1];
    if (next) {
      setTurnIndex(i => i + 1);
      setTimeout(() => {
        pushNpc(next.npcFrench, difficulty === 1 ? next.npcEnglish : undefined);
      }, 400);
    }
  }

  function handleOptionClick(option: string) {
    if (!activeScenario) return;
    const isCorrect = option === activeScenario.turns[turnIndex].options[0];
    advanceScripted(option, isCorrect);
  }

  function handleScriptedSubmit() {
    if (!activeScenario || !playerInput.trim()) return;
    const turn = activeScenario.turns[turnIndex];
    const lower = playerInput.trim().toLowerCase();
    const isCorrect = turn.acceptedKeywords.some(kw => lower.includes(kw.toLowerCase()));
    advanceScripted(playerInput.trim(), isCorrect);
    setPlayerInput('');
  }

  async function handleAiSubmit() {
    if (!activeScenario || !playerInput.trim() || isLoading) return;
    const text = playerInput.trim();
    setPlayerInput('');
    pushPlayer(text);
    setIsLoading(true);
    setAiError(null);
    setShowHint(false);

    try {
      const result = await callGemini(geminiApiKey, activeScenario, difficulty, aiHistory, text);
      setAiHistory(prev => [
        ...prev,
        { role: 'user', text },
        { role: 'model', text: result.npcResponse },
      ]);
      pushNpc(result.npcResponse, undefined, result.playerFeedback);
      if (result.missionComplete) {
        endConversation(true, [{ role: 'player', text }, { role: 'npc', text: result.npcResponse }]);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit() {
    if (isAiMode) handleAiSubmit();
    else handleScriptedSubmit();
  }

  if (view === 'picker') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Conversation Mode</h1>
          <p className="text-secondary mb-6">
            Practice real French conversations. Pick a scenario and survive.
          </p>

          {/* Difficulty selector — segmented control */}
          <div className="card p-4 mb-6">
            <p className="section-label" style={{ paddingLeft: 0 }}>Difficulty</p>
            <div className="seg-control max-w-md">
              {([1, 2, 3] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  aria-pressed={difficulty === d}
                  className="seg-item"
                  style={{ position: 'relative' }}
                >
                  {difficulty === d && (
                    <motion.span
                      layoutId="conversation-difficulty-seg"
                      className="absolute inset-0 rounded-[10px]"
                      style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-1)', zIndex: 0 }}
                      transition={NO_OVERSHOOT_SPRING}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {d} · {DIFFICULTY_LABELS[d].name}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2 italic">
              {DIFFICULTY_LABELS[difficulty].desc}
            </p>
          </div>

          {/* Mode notice */}
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 mb-5 rounded-xl"
            style={{ backgroundColor: geminiApiKey ? 'var(--success-light)' : 'var(--bg-inset)', border: '0.5px solid var(--hairline)' }}
          >
            <div className="flex items-center gap-2.5">
              <Bot size={15} style={{ color: geminiApiKey ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0 }} />
              <span className="text-xs font-medium" style={{ color: geminiApiKey ? 'var(--success)' : 'var(--text-secondary)' }}>
                {geminiApiKey ? 'AI mode active — conversations powered by Gemini' : 'Scripted mode — scenarios use a fixed dialogue tree'}
              </span>
            </div>
            {!geminiApiKey && (
              <button
                onClick={() => setShowKeySection(v => !v)}
                className="text-xs font-semibold flex-shrink-0 cursor-pointer ios-press"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0 }}
              >
                Add API key →
              </button>
            )}
          </div>

          {/* Scenario cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {SCENARIOS.map(s => (
              <motion.button
                key={s.id}
                transition={TAP_TRANSITION}
                whileTap={{ scale: 0.97 }}
                onClick={() => startScenario(s)}
                className="card card-lift p-5 text-left w-full group cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: 'var(--accent-tint)' }}
                  >
                    {s.emoji}
                  </span>
                  <div>
                    <p className="font-bold text-primary transition-colors group-hover:text-[var(--accent)]">
                      {s.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{s.npcRole}</p>
                  </div>
                </div>
                <p className="text-xs text-secondary mb-3 italic leading-relaxed">
                  {s.setting}
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}>Mission:</span>
                  <span className="text-xs text-secondary">{s.mission}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted">Rec. difficulty:</span>
                  {[1, 2, 3].map(d => (
                    <div
                      key={d}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: d <= s.recommendedDifficulty ? 'var(--accent)' : 'var(--bg-inset)',
                      }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>

          {/* AI / BYOK section */}
          <div className="inset-group">
            <button
              onClick={() => setShowKeySection(v => !v)}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ background: 'transparent', border: 'none' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: geminiApiKey ? 'var(--success-light)' : 'var(--bg-inset)',
                    color: geminiApiKey ? 'var(--success)' : 'var(--text-muted)',
                  }}
                >
                  <Bot size={17} />
                </span>
                <div>
                  <p className="font-semibold text-sm text-primary">AI Mode (BYOK)</p>
                  <p className="text-xs text-muted">
                    {geminiApiKey
                      ? '✓ Gemini key active — conversations are AI-powered'
                      : 'Add your Gemini API key to unlock dynamic AI conversations'}
                  </p>
                </div>
              </div>
              {showKeySection ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
            </button>

            {showKeySection && (
              <motion.div
                {...COLLAPSE}
                className="p-4 space-y-3"
                style={{ borderTop: '0.5px solid var(--hairline)' }}
              >
                <p className="text-xs text-secondary">
                  Your key is stored in your browser's localStorage and sent directly to Google's Generative AI API — it never touches our servers.
                  <strong className="text-primary"> Do not use a key with billing limits you can't afford to exceed</strong>, and avoid entering it on shared devices.
                  Without a key, scenarios use a scripted dialogue tree that still teaches great French.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="password"
                      value={keyDraft}
                      onChange={e => setKeyDraft(e.target.value)}
                      placeholder="AIza..."
                      className="ios-input pl-9 py-2 text-sm"
                      onKeyDown={e => { if (e.key === 'Enter' && keyDraft.trim()) { setApiKey(keyDraft.trim()); setKeyDraft(''); } }}
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => { if (keyDraft.trim()) { setApiKey(keyDraft.trim()); setKeyDraft(''); } }}
                    disabled={!keyDraft.trim()}
                  >
                    Save
                  </Button>
                  {geminiApiKey && (
                    <Button variant="secondary" onClick={() => { setApiKey(''); setKeyDraft(''); }}>
                      Remove
                    </Button>
                  )}
                </div>
                {geminiApiKey && (
                  <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>✓ Key saved. AI mode is active.</p>
                )}
              </motion.div>
            )}
          </div>

          {history.length > 0 && (
            <section className="mt-6">
              <p className="section-label">Recent debriefs</p>
              <div className="inset-group">
                {[...history].reverse().slice(0, 5).map((rec, i) => {
                  const scenario = SCENARIOS.find(s => s.id === rec.scenarioId);
                  if (!scenario) return null;
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => openRecord(rec)}
                      className="inset-row w-full justify-between gap-3 cursor-pointer text-left"
                      style={{ background: 'transparent', border: 'none', borderTop: i > 0 ? '0.5px solid var(--hairline)' : 'none' }}
                    >
                      <span className="text-sm text-primary truncate">{scenario.emoji} {scenario.title}</span>
                      <span className="text-xs text-muted flex-shrink-0">
                        {rec.date} · {rec.missionComplete ? 'mission done' : `${rec.exchanges} exchanges`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  if (view === 'complete') {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={REWARD_SPRING}
            className="text-6xl mb-5"
          >
            {missionSuccess ? '🎉' : '💪'}
          </motion.div>
          <h2 className="text-3xl font-bold text-primary mb-1 font-display">
            {missionSuccess ? 'Mission accomplie !' : 'Bonne tentative !'}
          </h2>
          {record && (
            <p className="text-secondary">
              You had {record.exchanges} exchange{record.exchanges !== 1 ? 's' : ''} with {activeScenario?.npcName}.
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4 text-left">
          {debriefing && (
            <div className="card p-6 text-center space-y-2">
              <Sparkles size={20} className="mx-auto" style={{ color: 'var(--accent)' }} />
              <p className="text-sm text-secondary">Putting your debrief together…</p>
            </div>
          )}

          {record && (
            <motion.div {...REVEAL} className="space-y-4">
              {record.debrief.summary && (
                <div className="card p-4 space-y-2">
                  <p className="text-sm font-semibold text-primary">Debrief</p>
                  <p className="text-sm text-secondary">{record.debrief.summary}</p>
                  {record.debrief.strengths.length > 0 && (
                    <ul className="space-y-1 list-none p-0 m-0">
                      {record.debrief.strengths.map(s => (
                        <li key={s} className="text-sm text-primary flex items-start gap-2">
                          <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} /> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {record.debrief.corrections.length > 0 && (
                <div className="card p-4 space-y-3">
                  <p className="text-sm font-semibold text-primary">
                    {record.debrief.source === 'scripted' ? 'A more natural reply' : 'Corrections'}
                  </p>
                  {record.debrief.corrections.map((c, i) => (
                    <div key={i} className="text-sm space-y-0.5">
                      <p lang="fr">
                        <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{c.original}</span>
                        {' → '}
                        <span style={{ color: 'var(--success)' }} className="font-medium">{c.corrected}</span>
                      </p>
                      {c.explanation && <p className="text-xs text-muted">{c.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}

              {record.debrief.phrases.length > 0 && (
                <div className="card p-4 space-y-2">
                  <p className="text-sm font-semibold text-primary">Phrases to keep</p>
                  <ul className="space-y-1.5 list-none p-0 m-0">
                    {record.debrief.phrases.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => speak(p.french)}
                          aria-label={`Hear “${p.french}”`}
                          className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer"
                          style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)', border: 'none' }}
                        >
                          <Volume2 size={13} />
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-primary" lang="fr">{p.french}</p>
                          {p.english && <p className="text-xs text-muted">{p.english}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="flex gap-3 justify-center flex-wrap mt-8">
          <Button variant="secondary" onClick={() => startScenario(activeScenario!)} disabled={debriefing}>
            <RefreshCw size={15} /> Replay
          </Button>
          <Button variant="primary" onClick={() => setView('picker')} disabled={debriefing}>
            New scenario
          </Button>
        </div>
      </div>
    );
  }

  const showOptions = !isAiMode && difficulty === 1;
  const showTextInput = isAiMode || difficulty >= 2;
  const canShowHint = difficulty <= 2;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-5.75rem)] sm:h-[calc(100dvh-3.5rem)]">
      {/* Header — glass, iMessage-style */}
      <div
        className="glass flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderBottom: '0.5px solid var(--hairline)' }}
      >
        <button
          onClick={() => setView('picker')}
          aria-label="Back to scenarios"
          className="w-8 h-8 flex items-center justify-center rounded-full ios-press cursor-pointer"
          style={{ color: 'var(--accent)', background: 'transparent', border: 'none' }}
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-tint)' }}
        >
          {activeScenario?.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-primary truncate">{activeScenario?.title}</p>
          <p className="text-xs text-muted truncate">
            <span className="font-bold" style={{ color: 'var(--accent)' }}>Mission:</span> {activeScenario?.mission}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {messages.some(m => m.role === 'player') && (
            <button
              onClick={() => endConversation(false)}
              disabled={isLoading}
              aria-label="End and see your debrief"
              title="End and see your debrief"
              className="h-8 px-2.5 flex items-center gap-1 rounded-full ios-press cursor-pointer text-xs font-semibold disabled:opacity-40"
              style={{ color: 'var(--accent)', background: 'var(--accent-tint)', border: 'none' }}
            >
              <Flag size={13} /> End
            </button>
          )}
          <button
            onClick={() => setAutoSpeakReplies(!autoSpeakReplies)}
            aria-label={autoSpeakReplies ? 'Stop reading replies aloud' : 'Read replies aloud'}
            aria-pressed={autoSpeakReplies}
            className="w-8 h-8 flex items-center justify-center rounded-full ios-press cursor-pointer"
            style={{ color: autoSpeakReplies ? 'var(--accent)' : 'var(--text-muted)', background: 'transparent', border: 'none' }}
          >
            {autoSpeakReplies ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          {isAiMode && (
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--success)' }}>
              <Bot size={12} /> AI
            </div>
          )}
          <div className="chip text-xs !py-0.5 !px-2">
            D{difficulty}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              {...REVEAL}
              className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.role === 'player' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.role === 'npc' && (
                  <span className="text-xs text-muted ml-2">{activeScenario?.npcName}</span>
                )}
                <div
                  className="px-4 py-2.5 text-[0.95rem] leading-relaxed"
                  style={msg.role === 'player'
                    ? {
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                        borderRadius: '20px',
                        borderBottomRightRadius: '6px',
                      }
                    : {
                        backgroundColor: 'var(--bg-card)',
                        border: '0.5px solid var(--hairline)',
                        color: 'var(--text-primary)',
                        borderRadius: '20px',
                        borderBottomLeftRadius: '6px',
                        boxShadow: 'var(--shadow-1)',
                      }
                  }
                >
                  <p className={msg.role === 'npc' ? 'font-display' : undefined} lang={msg.role === 'npc' ? 'fr' : undefined}>
                    {msg.text}
                    {msg.role === 'npc' && (
                      <button
                        type="button"
                        onClick={() => speak(msg.text)}
                        aria-label="Hear this line"
                        className="inline-flex align-middle ml-1.5 cursor-pointer ios-press"
                        style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', padding: 0 }}
                      >
                        <Volume2 size={14} />
                      </button>
                    )}
                  </p>
                  {msg.translation && (
                    <p className="text-xs mt-1 opacity-60 italic">{msg.translation}</p>
                  )}
                </div>

                {/* Correct / incorrect badge */}
                {msg.role === 'player' && msg.correct !== undefined && (
                  <div
                    className="flex items-center gap-1 text-xs mr-1"
                    style={{ color: msg.correct ? 'var(--success)' : 'var(--accent)' }}
                  >
                    {msg.correct
                      ? <><CheckCircle2 size={12} /> Bien dit !</>
                      : <><XCircle size={12} /> Close</>
                    }
                  </div>
                )}
                {msg.feedback && msg.role === 'player' && !msg.correct && (
                  <p className="text-xs text-muted italic max-w-xs mr-1">{msg.feedback}</p>
                )}

                {/* AI feedback (shown below NPC message) */}
                {msg.role === 'npc' && msg.feedback && (
                  <p className="text-xs text-muted italic ml-2">💬 {msg.feedback}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start" role="status" aria-live="polite" aria-label={`${activeScenario?.npcName} is responding…`}>
            <div
              className="px-4 py-3"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '0.5px solid var(--hairline)',
                borderRadius: '20px',
                borderBottomLeftRadius: '6px',
              }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(d => (
                  <motion.div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--text-muted)' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {aiError && (
          <div
            className="text-xs text-center p-3"
            style={{
              color: 'var(--danger)',
              backgroundColor: 'color-mix(in srgb, var(--danger) 8%, var(--bg-card))',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {aiError}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area — glass bar */}
      <div
        className="glass flex-shrink-0 px-4 py-3 space-y-3"
        style={{
          borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
          borderTop: '0.5px solid var(--hairline)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        }}
      >
        {/* Hint */}
        {currentTurn && canShowHint && (
          <div className="flex items-center gap-2">
            {difficulty === 1 ? (
              <p className="text-xs text-muted italic">💡 {currentTurn.playerHint}</p>
            ) : (
              <button
                onClick={() => setShowHint(v => !v)}
                className="flex items-center gap-1 text-xs text-muted cursor-pointer transition-colors hover:text-[var(--text-primary)]"
                style={{ background: 'transparent', border: 'none' }}
              >
                {showHint ? <EyeOff size={11} /> : <Eye size={11} />}
                {showHint ? currentTurn.playerHint : 'Show hint'}
              </button>
            )}
          </div>
        )}

        {/* Options (easy + scripted) */}
        {showOptions && currentTurn && (
          <div className="grid grid-cols-1 gap-2">
            {shuffledOptions.map(option => (
              <motion.button
                key={option}
                whileTap={{ scale: 0.97 }}
                transition={TAP_TRANSITION}
                onClick={() => handleOptionClick(option)}
                className="text-left px-4 py-2.5 text-sm text-primary font-medium font-display cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--hairline)',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow-1)',
                }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}

        {/* Text input (medium/hard scripted or AI) — iMessage pill + send */}
        {showTextInput && mic.error && (
          <p className="text-xs text-muted text-center" role="status">{listenErrorMessage(mic.error)}</p>
        )}
        {showTextInput && (
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={mic.listening ? mic.interim : playerInput}
              onChange={e => setPlayerInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={
                mic.listening
                  ? 'Listening…'
                  : isAiMode
                    ? `Reply to ${activeScenario?.npcName}…`
                    : 'Type your response in French…'
              }
              lang="fr"
              disabled={isLoading || mic.listening}
              className="ios-input flex-1 font-display disabled:opacity-50"
              style={{ borderRadius: 99 }}
            />
            {mic.available && (
              <MicButton listening={mic.listening} onClick={mic.toggle} disabled={isLoading} idleLabel="Say your reply" diameter={36} />
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={TAP_TRANSITION}
              onClick={handleSubmit}
              disabled={!playerInput.trim() || isLoading}
              aria-label="Send"
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-40 flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none' }}
            >
              <ArrowUp size={18} strokeWidth={2.6} className={isLoading ? 'animate-pulse' : ''} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
