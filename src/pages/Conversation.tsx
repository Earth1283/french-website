import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ArrowUp, Eye, EyeOff, RefreshCw, Check, X,
  Key,
} from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';
import { useConversationStore } from '../stores/conversationStore';
import { Button } from '../components/ui/Button';
import { Board, BoardGlyph, BoardRow } from '../components/ui/Board';
import { Tabs } from '../components/ui/Controls';
import { OhNon } from '../components/ui/Feedback';
import { KeyCap } from '../components/ui/Signage';
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

  if (view === 'picker') {
    return (
      <div className="page page--narrow">
        <h1 className="h-page">Converse</h1>
        <p className="t-body mt-2 mb-6">
          Practice real French conversations. Pick a scenario and survive.
        </p>

        <Tabs
          items={([1, 2, 3] as Difficulty[]).map(d => ({
            label: DIFFICULTY_LABELS[d].name,
            value: String(d),
          }))}
          value={String(difficulty)}
          onChange={v => setDifficulty(Number(v) as Difficulty)}
          label="Difficulty"
        />
        <p className="t-small text-ink-2 mt-2 mb-6">
          {DIFFICULTY_LABELS[difficulty].desc}
        </p>

        <Board title="Conversations" lang="en">
          {SCENARIOS.map(s => (
            <BoardRow
              key={s.id}
              onClick={() => startScenario(s)}
              glyph={<BoardGlyph>
                <Key size={16} />
              </BoardGlyph>}
              dest={s.title}
              via={s.setting || s.mission}
              status={DIFFICULTY_LABELS[s.recommendedDifficulty].name}
            />
          ))}
        </Board>

        <div className="sheet p-4 mt-6 space-y-3">
          <p className="t-small text-ink-2">
            {geminiApiKey
              ? 'Gemini API key is active. Conversations are AI-powered.'
              : 'Add your Gemini API key below to unlock dynamic AI conversations. Without it, scenarios use a scripted dialogue tree.'}
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
              <input
                type="password"
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                placeholder="AIza..."
                className="field pl-9"
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
            <p className="t-small font-semibold text-go">Key saved. AI mode is active.</p>
          )}
        </div>
      </div>
    );
  }

  if (view === 'complete') {
    const exchangeCount = messages.filter(m => m.role === 'player').length;
    return (
      <div className="page page--narrow flex flex-col items-center justify-center min-h-dvh text-center">
        <div className="sheet p-6 w-full">
          <h2 className="h-section mb-4">
            {missionSuccess ? 'Mission complete' : 'Bonne tentative'}
          </h2>
          <p className="t-body text-ink-2">
            You had {exchangeCount} exchange{exchangeCount !== 1 ? 's' : ''} with {activeScenario?.npcName}.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mt-8">
            <Button variant="secondary" onClick={() => startScenario(activeScenario!)}>
              <RefreshCw size={15} /> Replay
            </Button>
            <Button variant="primary" onClick={() => setView('picker')}>
              New conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const showOptions = !isAiMode && difficulty === 1;
  const showTextInput = isAiMode || difficulty >= 2;
  const canShowHint = difficulty <= 2;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-5.75rem)] sm:h-[calc(100dvh-3.5rem)]">
      <div className="border-b border-rule flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0">
        <Button
          variant="quiet"
          onClick={() => setView('picker')}
          aria-label="Back to conversations"
          className="-ml-1.5"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="t-title truncate">{activeScenario?.title}</p>
        </div>
      </div>

      <div className="sheet mx-4 my-3 p-4">
        <p className="t-small text-ink-3">Mission</p>
        <p className="t-body text-ink mt-1">{activeScenario?.mission}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${msg.role === 'player' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              {msg.role === 'npc' && (
                <span className="t-micro text-ink-2 ml-2">{activeScenario?.npcName}</span>
              )}
              <div className={msg.role === 'player' ? 'bubble bubble--me' : 'bubble bubble--them'}>
                <p className={msg.role === 'npc' ? 'fr-solo text-18' : undefined} lang={msg.role === 'npc' ? 'fr' : undefined}>
                  {msg.text}
                </p>
                {msg.translation && (
                  <p className="t-small mt-2 text-ink-2">{msg.translation}</p>
                )}
              </div>

              {msg.role === 'player' && msg.correct !== undefined && (
                <div className={`flex items-center gap-1 t-small ml-1 ${msg.correct ? 'text-go' : 'text-signal-text'}`}>
                  {msg.correct ? <Check size={14} /> : <X size={14} />}
                  {msg.correct ? 'Bien dit!' : 'Close'}
                </div>
              )}
              {msg.feedback && msg.role === 'player' && !msg.correct && (
                <p className="t-small text-ink-2 italic max-w-xs ml-1">{msg.feedback}</p>
              )}

              {msg.role === 'npc' && msg.feedback && (
                <p className="t-small text-ink-2 italic ml-2">{msg.feedback}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start" role="status" aria-live="polite" aria-label={`${activeScenario?.npcName} is responding…`}>
            <div className="bubble bubble--them">
              <div className="flex gap-1">
                {[0, 1, 2].map(d => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-ink-3"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {aiError && (
          <OhNon>
            {aiError}
          </OhNon>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-rule flex-shrink-0 px-4 py-3 space-y-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {currentTurn && canShowHint && (
          <div className="flex items-center gap-2">
            {difficulty === 1 ? (
              <p className="t-small text-ink-2 italic">{currentTurn.playerHint}</p>
            ) : (
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setShowHint(v => !v)}
              >
                {showHint ? <EyeOff size={16} /> : <Eye size={16} />}
                {showHint ? currentTurn.playerHint : 'Show hint'}
              </Button>
            )}
          </div>
        )}

        {showOptions && currentTurn && (
          <div className="options">
            {shuffledOptions.map((option, idx) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className="option"
              >
                <KeyCap>{idx + 1}</KeyCap>
                <span className="option__text" lang="fr">{option}</span>
              </button>
            ))}
          </div>
        )}

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
              className="field flex-1 disabled:opacity-50"
            />
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!playerInput.trim() || isLoading}
              aria-label="Send"
              size="sm"
            >
              <ArrowUp size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
