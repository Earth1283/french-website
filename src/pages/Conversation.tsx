import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ArrowUp, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle,
  Bot, Key, ChevronDown, ChevronUp,
} from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';
import { useConversationStore } from '../stores/conversationStore';
import { Button } from '../components/ui/Button';
import type { Scenario, Difficulty } from '../types';

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

async function callGemini(
  apiKey: string,
  scenario: Scenario,
  difficulty: Difficulty,
  history: { role: 'user' | 'model'; text: string }[],
  playerMessage: string,
): Promise<{ npcResponse: string; playerFeedback: string; missionComplete: boolean }> {
  const levelDesc =
    difficulty === 1 ? 'Accept any attempt that conveys the right meaning. Be very encouraging.'
    : difficulty === 2 ? 'Require correct meaning. Gently note if phrasing is off.'
    : 'Require grammatically correct French. Identify specific errors by name.';

  const systemPrompt = `You are ${scenario.npcName}, a ${scenario.npcRole}.
Setting: ${scenario.setting}
The learner's mission: ${scenario.mission}
Difficulty ${difficulty}/3: ${levelDesc}

Rules:
- Respond as ${scenario.npcName} in French, 1–2 sentences, naturally in character.
- playerFeedback: one short English sentence (max 12 words) about their French. Be warm.
- Set missionComplete true only when the learner has fully achieved their mission.
- Never break character in npcResponse.

Respond ONLY with valid JSON:
{"npcResponse":"...","playerFeedback":"...","missionComplete":false}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: playerMessage }] },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini error ${res.status}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}

const DIFFICULTY_LABELS: Record<Difficulty, { name: string; desc: string }> = {
  1: { name: 'Guided', desc: 'Options + translations shown' },
  2: { name: 'Standard', desc: 'French only, type your response' },
  3: { name: 'Challenge', desc: 'Strict grammar, no scaffolding' },
};

export function Conversation() {
  const { geminiApiKey, difficulty, setApiKey, setDifficulty } = useConversationStore();
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAiMode = !!geminiApiKey;

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
    setPlayerInput('');
    setAiError(null);
    setShowHint(false);
    setMissionSuccess(false);
    setView('chat');
  }

  function pushNpc(text: string, translation?: string, feedback?: string) {
    setMessages(prev => [...prev, { role: 'npc', text, translation, feedback }]);
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
      setMissionSuccess(true);
      setView('complete');
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
        setMissionSuccess(true);
        setView('complete');
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

  // ─── Picker view ────────────────────────────────────────────────────────────
  if (view === 'picker') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
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
                  style={difficulty === d ? {
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-1)',
                  } : undefined}
                >
                  {d} · {DIFFICULTY_LABELS[d].name}
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
            {SCENARIOS.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: i * 0.06, type: 'spring', damping: 24, stiffness: 300 }}
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
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="p-4 space-y-3"
                style={{ borderTop: '0.5px solid var(--hairline)' }}
              >
                <p className="text-xs text-secondary">
                  Your key is stored locally in your browser and never sent anywhere except directly to Google's API.
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
        </motion.div>
      </div>
    );
  }

  // ─── Complete view ───────────────────────────────────────────────────────────
  if (view === 'complete') {
    const exchangeCount = messages.filter(m => m.role === 'player').length;
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 280 }}
          className="text-6xl mb-5"
        >
          {missionSuccess ? '🎉' : '💪'}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-3xl font-bold text-primary mb-1 font-display">
            {missionSuccess ? 'Mission accomplie !' : 'Bonne tentative !'}
          </h2>
          <p className="text-secondary">
            You had {exchangeCount} exchange{exchangeCount !== 1 ? 's' : ''} with {activeScenario?.npcName}.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 justify-center flex-wrap mt-8"
        >
          <Button variant="secondary" onClick={() => startScenario(activeScenario!)}>
            <RefreshCw size={15} /> Replay
          </Button>
          <Button variant="primary" onClick={() => setView('picker')}>
            New scenario
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── Chat view ───────────────────────────────────────────────────────────────
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
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 24, stiffness: 360 }}
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
                  <p className={msg.role === 'npc' ? 'font-display' : undefined}>
                    {msg.text}
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
          <div className="flex justify-start">
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
                transition={{ type: 'spring', damping: 20, stiffness: 500 }}
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
        {showTextInput && (
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={playerInput}
              onChange={e => setPlayerInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={
                isAiMode
                  ? `Reply to ${activeScenario?.npcName}…`
                  : 'Type your response in French…'
              }
              disabled={isLoading}
              className="ios-input flex-1 font-display disabled:opacity-50"
              style={{ borderRadius: 99 }}
            />
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', damping: 18, stiffness: 500 }}
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
