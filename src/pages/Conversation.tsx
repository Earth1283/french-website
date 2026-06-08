import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Send, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle,
  Zap, Bot, Key, ChevronDown, ChevronUp,
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
          <h1 className="text-3xl font-bold text-[--text-primary] mb-1">Conversation Mode</h1>
          <p className="text-[--text-secondary] mb-6">
            Practice real French conversations. Pick a scenario and survive.
          </p>

          {/* Difficulty selector */}
          <div className="card p-4 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[--text-muted] mb-3">Difficulty</p>
            <div className="flex gap-2 flex-wrap">
              {([1, 2, 3] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    difficulty === d
                      ? 'bg-[--accent] text-white border-[--accent]'
                      : 'border-[--border] text-[--text-muted] hover:border-[--accent] hover:text-[--text-primary]'
                  }`}
                >
                  {d} · {DIFFICULTY_LABELS[d].name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[--text-muted] mt-2 italic">
              {DIFFICULTY_LABELS[difficulty].desc}
            </p>
          </div>

          {/* Scenario cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {SCENARIOS.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => startScenario(s)}
                className="card card-lift p-5 text-left w-full group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{s.emoji}</span>
                  <div>
                    <p className="font-bold text-[--text-primary] group-hover:text-[--accent] transition-colors">
                      {s.title}
                    </p>
                    <p className="text-xs text-[--text-muted] mt-0.5">{s.npcRole}</p>
                  </div>
                </div>
                <p className="text-xs text-[--text-secondary] mb-3 italic leading-relaxed">
                  {s.setting}
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-[--accent] mt-0.5 flex-shrink-0">Mission:</span>
                  <span className="text-xs text-[--text-secondary]">{s.mission}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-[--text-muted]">Rec. difficulty:</span>
                  {[1, 2, 3].map(d => (
                    <div
                      key={d}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: d <= s.recommendedDifficulty ? 'var(--accent)' : 'var(--border)',
                      }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>

          {/* AI / BYOK section */}
          <div className="card overflow-hidden">
            <button
              onClick={() => setShowKeySection(v => !v)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Bot size={18} className={geminiApiKey ? 'text-[--success]' : 'text-[--text-muted]'} />
                <div>
                  <p className="font-semibold text-sm text-[--text-primary]">AI Mode (BYOK)</p>
                  <p className="text-xs text-[--text-muted]">
                    {geminiApiKey
                      ? '✓ Gemini key active — conversations are AI-powered'
                      : 'Add your Gemini API key to unlock dynamic AI conversations'}
                  </p>
                </div>
              </div>
              {showKeySection ? <ChevronUp size={15} className="text-[--text-muted]" /> : <ChevronDown size={15} className="text-[--text-muted]" />}
            </button>

            {showKeySection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-[--border] p-4 space-y-3"
              >
                <p className="text-xs text-[--text-secondary]">
                  Your key is stored locally in your browser and never sent anywhere except directly to Google's API.
                  Without a key, scenarios use a scripted dialogue tree that still teaches great French.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]" />
                    <input
                      type="password"
                      value={keyDraft}
                      onChange={e => setKeyDraft(e.target.value)}
                      placeholder="AIza..."
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-[--border] bg-[--bg] text-sm text-[--text-primary] outline-none focus:border-[--accent] transition-colors"
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
                  <p className="text-xs text-[--success] font-semibold">✓ Key saved. AI mode is active.</p>
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
          <h2 className="text-3xl font-bold text-[--text-primary] mb-1">
            {missionSuccess ? 'Mission accomplie !' : 'Bonne tentative !'}
          </h2>
          <p className="text-[--text-secondary]">
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[--border] bg-[--bg]/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={() => setView('picker')}
          className="p-1.5 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xl">{activeScenario?.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[--text-primary] truncate">{activeScenario?.title}</p>
          <p className="text-xs text-[--text-muted] truncate">
            <span className="font-bold text-[--accent]">Mission:</span> {activeScenario?.mission}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAiMode && (
            <div className="flex items-center gap-1 text-xs text-[--success] font-semibold">
              <Bot size={12} /> AI
            </div>
          )}
          <div className="text-xs text-[--text-muted] font-semibold border border-[--border] rounded-lg px-2 py-0.5">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.role === 'player' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.role === 'npc' && (
                  <span className="text-xs text-[--text-muted] ml-1">{activeScenario?.npcName}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'npc'
                      ? 'bg-[--bg-card] border border-[--border] text-[--text-primary] rounded-tl-sm'
                      : 'bg-[--accent] text-white rounded-tr-sm'
                  }`}
                >
                  <p style={{ fontFamily: msg.role === 'npc' ? "'Playfair Display', serif" : 'inherit' }}>
                    {msg.text}
                  </p>
                  {msg.translation && (
                    <p className="text-xs mt-1 opacity-60 italic">{msg.translation}</p>
                  )}
                </div>

                {/* Correct / incorrect badge */}
                {msg.role === 'player' && msg.correct !== undefined && (
                  <div className={`flex items-center gap-1 text-xs ${msg.correct ? 'text-[--success]' : 'text-[--accent]'}`}>
                    {msg.correct
                      ? <><CheckCircle2 size={12} /> Bien dit !</>
                      : <><XCircle size={12} /> Close</>
                    }
                  </div>
                )}
                {msg.feedback && msg.role === 'player' && !msg.correct && (
                  <p className="text-xs text-[--text-muted] italic max-w-xs">{msg.feedback}</p>
                )}

                {/* AI feedback (shown below NPC message) */}
                {msg.role === 'npc' && msg.feedback && (
                  <p className="text-xs text-[--text-muted] italic ml-1">💬 {msg.feedback}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[--bg-card] border border-[--border] px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(d => (
                  <motion.div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-[--text-muted]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {aiError && (
          <div className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
            {aiError}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-[--border] bg-[--bg] px-4 py-3 space-y-3">
        {/* Hint */}
        {currentTurn && canShowHint && (
          <div className="flex items-center gap-2">
            {difficulty === 1 ? (
              <p className="text-xs text-[--text-muted] italic">💡 {currentTurn.playerHint}</p>
            ) : (
              <button
                onClick={() => setShowHint(v => !v)}
                className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-primary] transition-colors"
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
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className="text-left px-4 py-2.5 rounded-xl border border-[--border] text-sm text-[--text-primary] hover:border-[--accent] hover:bg-[--bg-card-hover] transition-all font-medium"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Text input (medium/hard scripted or AI) */}
        {showTextInput && (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={playerInput}
              onChange={e => setPlayerInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={
                isAiMode
                  ? `Reply to ${activeScenario?.npcName}...`
                  : 'Type your response in French...'
              }
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[--border] bg-[--bg] text-sm text-[--text-primary] outline-none focus:border-[--accent] transition-colors disabled:opacity-50"
              style={{ fontFamily: "'Playfair Display', serif" }}
            />
            <button
              onClick={handleSubmit}
              disabled={!playerInput.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-[--accent] text-white disabled:opacity-40 hover:bg-[--accent-hover] transition-colors"
            >
              {isLoading ? <Zap size={16} className="animate-pulse" /> : <Send size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
