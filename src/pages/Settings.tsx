import { useState, useEffect } from 'react';
import {
  AlertTriangle, ChevronDown, ChevronUp, Check, Download, Upload, RotateCcw, RefreshCw,
} from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useConversationStore } from '../stores/conversationStore';
import { Button } from '../components/ui/Button';
import { Switch, Tabs } from '../components/ui/Controls';
import type { Difficulty } from '../types';

const DIFFICULTY_LABELS: Record<Difficulty, { name: string; desc: string }> = {
  1: { name: 'Guided', desc: 'Multiple choice answers' },
  2: { name: 'Standard', desc: 'Type your response' },
  3: { name: 'Challenge', desc: 'AI judges freely' },
};

export function Settings() {
  const {
    darkMode, setDarkMode,
    unit12Mode, setUnit12Mode,
    xp, streak,
    setXP, setStreak,
    resetProgress, resetOnboarding,
  } = useProgressStore();

  const { geminiApiKey, difficulty, setApiKey, setDifficulty } = useConversationStore();

  const [dangerOpen, setDangerOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmOnboarding, setConfirmOnboarding] = useState(false);
  const [xpDraft, setXpDraft] = useState(String(xp));
  const [streakDraft, setStreakDraft] = useState(String(streak));
  const [keyDraft, setKeyDraft] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useEffect(() => { setXpDraft(String(xp)); }, [xp]);
  useEffect(() => { setStreakDraft(String(streak)); }, [streak]);

  function handleExport() {
    const state = useProgressStore.getState();
    const data = {
      completedLessons: state.completedLessons,
      xp: state.xp,
      streak: state.streak,
      lastStudiedDate: state.lastStudiedDate,
      earnedBadges: state.earnedBadges,
      bookmarkedLessons: state.bookmarkedLessons,
      srsData: state.srsData,
      unit12Mode: state.unit12Mode,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bonjour-survival-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const raw = ev.target?.result as string;
        const data = JSON.parse(raw);
        const store = useProgressStore.getState();
        // Only restore fields we recognise; ignore unknown keys
        if (Array.isArray(data.completedLessons)) store.resetProgress();
        if (Array.isArray(data.completedLessons)) {
          useProgressStore.setState({
            completedLessons: data.completedLessons ?? [],
            xp: typeof data.xp === 'number' ? data.xp : 0,
            streak: typeof data.streak === 'number' ? data.streak : 0,
            lastStudiedDate: data.lastStudiedDate ?? '',
            earnedBadges: Array.isArray(data.earnedBadges) ? data.earnedBadges : [],
            bookmarkedLessons: Array.isArray(data.bookmarkedLessons) ? data.bookmarkedLessons : [],
            srsData: data.srsData && typeof data.srsData === 'object' ? data.srsData : {},
            ...(data.unit12Mode ? { unit12Mode: data.unit12Mode } : {}),
          });
        }
        setImportStatus('ok');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function applyXP() {
    const v = parseInt(xpDraft);
    if (!isNaN(v) && v >= 0) setXP(v);
  }

  function applyStreak() {
    const v = parseInt(streakDraft);
    if (!isNaN(v) && v >= 0) setStreak(v);
  }

  return (
    <div className="page page--narrow">
      <h1 className="h-page">Settings</h1>

      <section>
        <h2 className="h-section">Appearance</h2>
        <div className="sheet rows">
          <div className="row">
            <div>
              <p className="font-semibold text-ink">Dark Mode</p>
              <p className="t-small text-ink-2">Easy on the eyes at night.</p>
            </div>
            <Switch checked={darkMode} onChange={setDarkMode} label="Dark Mode" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="h-section">Slang unit access</h2>
        <div className="sheet rows">
          {[
            { value: 'full-freedom' as const, label: 'Full Freedom', desc: 'Slang unit open from the start' },
            { value: 'earned-reward' as const, label: 'Earned Reward', desc: 'Unlock after completing any 2 units' },
          ].map(opt => (
            <label key={opt.value} className="choice">
              <input
                type="radio"
                name="unit12mode"
                value={opt.value}
                checked={unit12Mode === opt.value}
                onChange={() => setUnit12Mode(opt.value)}
                className="sr-only"
              />
              <span className="choice__dot" />
              <div>
                <p className="t-title">{opt.label}</p>
                <p className="t-small text-ink-2">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="h-section">Difficulty</h2>
        <div className="sheet p-4">
          <Tabs
            items={([1, 2, 3] as Difficulty[]).map(d => ({
              value: d,
              label: `${d} · ${DIFFICULTY_LABELS[d].name}`,
            }))}
            value={difficulty}
            onChange={setDifficulty}
            label="Default difficulty"
          />
          <p className="t-small text-ink-3 mt-3">{DIFFICULTY_LABELS[difficulty].desc}</p>
        </div>
      </section>

      <section>
        <h2 className="h-section">Conversation AI</h2>
        <div className="sheet p-4">
          <p className="font-semibold text-ink mb-2">Gemini API Key</p>
          <p className="t-small text-ink-2 mb-3">
            Stored locally only. Enables AI-powered conversations in Converse mode.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="password"
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              placeholder={geminiApiKey ? '••••••••••••••••' : 'AIza...'}
              className="field flex-1"
            />
            <Button
              variant="primary"
              size="sm"
              disabled={!keyDraft.trim()}
              onClick={() => { setApiKey(keyDraft.trim()); setKeyDraft(''); }}
            >
              Save
            </Button>
            {geminiApiKey && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setApiKey(''); setKeyDraft(''); }}
              >
                Remove
              </Button>
            )}
          </div>
          {geminiApiKey && (
            <p className="t-small text-go flex items-center gap-1.5">
              <Check size={16} aria-hidden="true" />
              AI mode active.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="h-section">Data & Privacy</h2>
        <div className="sheet rows">
          <div className="row justify-between">
            <div>
              <p className="font-semibold text-ink">Export Progress</p>
              <p className="t-small text-ink-2">Download your progress as a JSON file.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download size={16} /> Export
            </Button>
          </div>

          <div className="row justify-between">
            <div>
              <p className="font-semibold text-ink">Import Progress</p>
              <p className="t-small text-ink-2">Restore from a previously exported JSON file.</p>
              {importStatus === 'ok' && (
                <p className="t-small text-go flex items-center gap-1 mt-2">
                  <Check size={16} aria-hidden="true" />
                  Progress restored successfully.
                </p>
              )}
              {importStatus === 'error' && (
                <p className="t-small text-signal-text mt-2">Invalid file — could not import.</p>
              )}
            </div>
            <label className="btn btn--secondary btn--sm">
              <input type="file" accept=".json" className="sr-only" onChange={handleImport} />
              <Upload size={16} /> Import
            </label>
          </div>
        </div>
        <div className="sheet mt-[var(--stack)] p-4 space-y-1">
          <p className="t-small text-ink-3">
            <span className="font-semibold text-ink">Bonjour Survival</span> — All data is stored locally in your browser.
            Nothing is sent to any server, except your Gemini key being sent directly to Google's API when you
            use Conversation mode.
          </p>
          <p className="t-small text-ink-3">v0.1.0</p>
        </div>
      </section>

      <section>
        <button
          onClick={() => setDangerOpen(v => !v)}
          className="w-full flex items-center justify-between bg-sheet rounded-sheet p-4 border border-rule-strong"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-signal" aria-hidden="true" />
            <h2 className="h-section">Danger zone</h2>
          </div>
          {dangerOpen
            ? <ChevronUp size={20} className="text-signal" aria-hidden="true" />
            : <ChevronDown size={20} className="text-signal" aria-hidden="true" />
          }
        </button>

        {dangerOpen && (
          <div className="sheet rows mt-4 space-y-6 p-4">
            <div>
              <p className="font-semibold text-ink mb-1">Set XP</p>
              <p className="t-small text-ink-2 mb-2">Override your current XP total.</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  value={xpDraft}
                  onChange={e => setXpDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyXP()}
                  className="field w-32"
                />
                <Button variant="secondary" size="sm" onClick={applyXP}>Apply</Button>
              </div>
            </div>

            <div>
              <p className="font-semibold text-ink mb-1">Set Streak</p>
              <p className="t-small text-ink-2 mb-2">Override your current day streak.</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  value={streakDraft}
                  onChange={e => setStreakDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyStreak()}
                  className="field w-32"
                />
                <Button variant="secondary" size="sm" onClick={applyStreak}>Apply</Button>
              </div>
            </div>

            <div className="pt-4 border-t border-rule">
              <p className="font-semibold text-ink mb-1">Reset Onboarding</p>
              <p className="t-small text-ink-2 mb-3">
                Re-trigger the welcome modal on your next visit to Home.
              </p>
              {!confirmOnboarding ? (
                <button
                  onClick={() => setConfirmOnboarding(true)}
                  className="text-signal-text flex items-center gap-1.5"
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Reset onboarding
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="t-body">
                    This will show the welcome modal on your next visit to Home.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setConfirmOnboarding(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => { resetOnboarding(); setConfirmOnboarding(false); }}>
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold text-ink mb-1">Reset All Progress</p>
              <p className="t-small text-ink-2 mb-3">
                Wipes completed lessons, XP, streak, and badges. Appearance and AI settings are kept.
              </p>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="text-signal-text flex items-center gap-1.5"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  Reset all progress
                </button>
              ) : (
                <div className="p-4 space-y-3 rounded-sheet border border-rule-strong bg-paper">
                  <p className="font-semibold text-ink">
                    This wipes all lessons, XP, streak, and badges. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => { resetProgress(); setConfirmReset(false); }}>
                      Yes, reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
