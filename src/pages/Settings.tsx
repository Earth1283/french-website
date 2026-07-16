import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, BookOpen, MessageSquare, Database, AlertTriangle,
  ChevronDown, ChevronUp, Key, Download, Upload, RotateCcw, RefreshCw,
} from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useConversationStore } from '../stores/conversationStore';
import { Button } from '../components/ui/Button';
import type { Difficulty } from '../types';

const ACCENT_PRESETS = [
  { hex: '#E63946', label: 'French Red' },
  { hex: '#3B82F6', label: 'Bleu de France' },
  { hex: '#8B5CF6', label: 'Lavender' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#EC4899', label: 'Rose' },
  { hex: '#0EA5E9', label: 'Sky' },
];

const DIFFICULTY_LABELS: Record<Difficulty, { name: string; desc: string }> = {
  1: { name: 'Guided', desc: 'Multiple choice answers' },
  2: { name: 'Standard', desc: 'Type your response' },
  3: { name: 'Challenge', desc: 'AI judges freely' },
};

export function Settings() {
  const {
    darkMode, setDarkMode,
    accentColor, setAccentColor,
    appleMode, setAppleMode,
    reducedGpu, setReducedGpu,
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
      accentColor: state.accentColor,
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
            ...(data.accentColor ? { accentColor: data.accentColor } : {}),
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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary mb-1">Settings</h1>
        <p className="text-secondary text-sm font-display italic">Personnalisez votre expérience.</p>
      </motion.div>

      {/* ── Appearance ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      >
        <GroupLabel icon={<Palette size={12} />} title="Appearance" />
        <div className="inset-group">
          <SettingRow label="Dark Mode" description="Easy on the eyes at night.">
            <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
          </SettingRow>

          <div className="inset-divider flex flex-col items-start gap-2 px-4 py-4 text-left">
            <div>
              <p className="text-sm font-semibold text-primary mb-0.5">Accent Color</p>
              <p className="text-xs text-muted">Buttons, active states, and highlights.</p>
            </div>
            <div className="flex gap-3 flex-wrap mt-1.5">
              {ACCENT_PRESETS.map(({ hex, label }) => (
                <motion.button
                  key={hex}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 500 }}
                  title={label}
                  onClick={() => setAccentColor(hex)}
                  aria-label={`Set accent to ${label}`}
                  className="w-8 h-8 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: hex,
                    border: '2px solid var(--bg-card)',
                    boxShadow: accentColor === hex
                      ? `0 0 0 2.5px ${hex}`
                      : 'var(--shadow-1)',
                    opacity: appleMode ? 0.5 : 1,
                  }}
                />
              ))}
            </div>
            {appleMode && (
              <p className="text-xs text-muted italic">Overridden by Apple-ify 🍎</p>
            )}
          </div>

          {/* Liquid glass nav — mobile only setting */}
          <div className="sm:hidden inset-divider">
            <SettingRow
              label="⚡ Reduce GPU load"
              description="Swaps the liquid glass nav for a flat bar. Helps on older phones."
            >
              <ToggleSwitch checked={reducedGpu} onChange={setReducedGpu} />
            </SettingRow>
          </div>

          {/* Apple-ify — mobile only easter egg, now a pure color skin */}
          <div className="sm:hidden inset-divider">
            <SettingRow label="🍎 Apple-ify" description="You didn't hear this from us.">
              <ToggleSwitch checked={appleMode} onChange={setAppleMode} />
            </SettingRow>
          </div>
        </div>
      </motion.section>

      {/* ── Learning ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        <GroupLabel icon={<BookOpen size={12} />} title="Learning" />
        <div className="inset-group p-4">
          <p className="text-sm font-semibold text-primary mb-0.5">Unit 12 Access (Slang & Swearing)</p>
          <p className="text-xs text-muted mb-3">How should the spicy final unit be unlocked?</p>
          <div className="space-y-2">
            {[
              { value: 'full-freedom' as const, label: '🚀 Full Freedom', desc: 'Unit 12 open from the start' },
              { value: 'earned-reward' as const, label: '🔓 Earned Reward', desc: 'Unlock after completing any 2 units' },
            ].map(opt => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-3 cursor-pointer transition-colors ios-press"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: unit12Mode === opt.value
                    ? '1.5px solid var(--accent)'
                    : '1.5px solid var(--hairline)',
                  backgroundColor: unit12Mode === opt.value ? 'var(--accent-tint)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="unit12mode"
                  value={opt.value}
                  checked={unit12Mode === opt.value}
                  onChange={() => setUnit12Mode(opt.value)}
                  className="sr-only"
                />
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    border: unit12Mode === opt.value ? 'none' : '1.5px solid var(--border)',
                    backgroundColor: unit12Mode === opt.value ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {unit12Mode === opt.value && <span className="w-2 h-2 rounded-full bg-white" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary">{opt.label}</p>
                  <p className="text-xs text-muted">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          {unit12Mode === null && (
            <p className="text-xs text-muted italic mt-2">
              Not set yet — configure this during onboarding or reset it below.
            </p>
          )}
        </div>
      </motion.section>

      {/* ── Conversation AI ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      >
        <GroupLabel icon={<MessageSquare size={12} />} title="Conversation AI" />
        <div className="inset-group">
          <div className="p-4">
            <p className="text-sm font-semibold text-primary mb-2.5">Default Difficulty</p>
            <div className="seg-control">
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
                      layoutId="settings-difficulty-seg"
                      className="absolute inset-0 rounded-[10px]"
                      style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-1)', zIndex: 0 }}
                      transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {d} · {DIFFICULTY_LABELS[d].name}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2 italic">{DIFFICULTY_LABELS[difficulty].desc}</p>
          </div>

          <div className="p-4 inset-divider">
            <p className="text-sm font-semibold text-primary mb-0.5">Gemini API Key</p>
            <p className="text-xs text-muted mb-3">
              Stored locally only. Enables AI-powered conversations in Converse mode.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={keyDraft}
                  onChange={e => setKeyDraft(e.target.value)}
                  placeholder={geminiApiKey ? '••••••••••••••••' : 'AIza...'}
                  className="ios-input pl-9 py-2 text-sm"
                />
              </div>
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
              <p className="text-xs font-semibold mt-2" style={{ color: 'var(--success)' }}>
                ✓ AI mode active.
              </p>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── Data & Privacy ── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <GroupLabel icon={<Database size={12} />} title="Data & Privacy" />
        <div className="inset-group">
          <div className="inset-row justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Export Progress</p>
              <p className="text-xs text-muted mt-0.5">Download your progress as a JSON file.</p>
            </div>
            <Button variant="tinted" size="sm" onClick={handleExport}>
              <Download size={14} /> Export
            </Button>
          </div>

          <div className="inset-row inset-divider justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Import Progress</p>
              <p className="text-xs text-muted mt-0.5">Restore from a previously exported JSON file.</p>
              {importStatus === 'ok' && (
                <p className="text-xs font-semibold mt-1" style={{ color: 'var(--success)' }}>✓ Progress restored successfully.</p>
              )}
              {importStatus === 'error' && (
                <p className="text-xs font-semibold mt-1" style={{ color: 'var(--danger)' }}>Invalid file — could not import.</p>
              )}
            </div>
            <label className="cursor-pointer flex-shrink-0">
              <input type="file" accept=".json" className="sr-only" onChange={handleImport} />
              <span className="btn-tinted text-sm !py-1.5 !px-3.5">
                <Upload size={14} /> Import
              </span>
            </label>
          </div>

          <div className="p-4 inset-divider space-y-1">
            <p className="text-xs text-muted">
              <span className="font-semibold">Bonjour Survival</span> — All data is stored locally in your browser.
              Nothing is sent to any server, except your Gemini key being sent directly to Google's API when you
              use Conversation mode.
            </p>
            <p className="text-xs text-muted">v0.1.0</p>
          </div>
        </div>
      </motion.section>

      {/* ── Danger Zone ── */}
      <motion.section
        className="overflow-hidden"
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
        }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      >
        <button
          onClick={() => setDangerOpen(v => !v)}
          className="w-full p-4 flex items-center justify-between text-left transition-colors cursor-pointer"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--danger) 7%, var(--bg-card))',
            border: 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>Danger Zone</p>
          </div>
          {dangerOpen
            ? <ChevronUp size={15} style={{ color: 'var(--danger)', opacity: 0.6 }} />
            : <ChevronDown size={15} style={{ color: 'var(--danger)', opacity: 0.6 }} />
          }
        </button>

        <AnimatePresence>
          {dangerOpen && (
            <motion.div
              key="danger-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6" style={{ backgroundColor: 'var(--bg-card)' }}>

                {/* Set XP */}
                <div>
                  <p className="text-sm font-semibold text-primary mb-0.5">Set XP</p>
                  <p className="text-xs text-muted mb-2">Override your current XP total.</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      value={xpDraft}
                      onChange={e => setXpDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyXP()}
                      className="ios-input w-28 py-2 text-sm"
                    />
                    <Button variant="secondary" size="sm" onClick={applyXP}>Apply</Button>
                  </div>
                </div>

                {/* Set Streak */}
                <div>
                  <p className="text-sm font-semibold text-primary mb-0.5">Set Streak</p>
                  <p className="text-xs text-muted mb-2">Override your current day streak.</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      value={streakDraft}
                      onChange={e => setStreakDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyStreak()}
                      className="ios-input w-28 py-2 text-sm"
                    />
                    <Button variant="secondary" size="sm" onClick={applyStreak}>Apply</Button>
                  </div>
                </div>

                {/* Reset Onboarding */}
                <div className="pt-5" style={{ borderTop: '0.5px solid var(--hairline)' }}>
                  <p className="text-sm font-semibold text-primary mb-0.5">Reset Onboarding</p>
                  <p className="text-xs text-muted mb-3">
                    Re-trigger the welcome modal on your next visit to Home.
                  </p>
                  <AnimatePresence mode="wait" initial={false}>
                    {!confirmOnboarding ? (
                      <motion.button
                        key="trigger"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setConfirmOnboarding(true)}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:underline"
                        style={{ color: '#ea7317', background: 'transparent', border: 'none' }}
                      >
                        <RefreshCw size={14} /> Reset onboarding
                      </motion.button>
                    ) : (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-3"
                      >
                        <p className="text-sm text-primary">
                          This will show the welcome modal on your next visit to Home.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setConfirmOnboarding(false)}>
                            Cancel
                          </Button>
                          <button
                            onClick={() => { resetOnboarding(); setConfirmOnboarding(false); }}
                            className="px-3.5 py-1.5 rounded-full text-white text-sm font-semibold cursor-pointer ios-press"
                            style={{ backgroundColor: '#ea7317', border: 'none' }}
                          >
                            Reset
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reset Progress */}
                <div>
                  <p className="text-sm font-semibold text-primary mb-0.5">Reset All Progress</p>
                  <p className="text-xs text-muted mb-3">
                    Wipes completed lessons, XP, streak, and badges. Appearance and AI settings are kept.
                  </p>
                  <AnimatePresence mode="wait" initial={false}>
                    {!confirmReset ? (
                      <motion.button
                        key="trigger"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setConfirmReset(true)}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:underline"
                        style={{ color: 'var(--danger)', background: 'transparent', border: 'none' }}
                      >
                        <RotateCcw size={14} /> Reset all progress
                      </motion.button>
                    ) : (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="p-4 space-y-3"
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid color-mix(in srgb, var(--danger) 35%, transparent)',
                        }}
                      >
                        <p className="text-sm font-semibold text-primary">
                          This wipes all lessons, XP, streak, and badges. Are you sure?
                        </p>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>
                            Cancel
                          </Button>
                          <button
                            onClick={() => { resetProgress(); setConfirmReset(false); }}
                            className="px-4 py-2 rounded-full text-white text-sm font-semibold cursor-pointer ios-press"
                            style={{ backgroundColor: 'var(--danger)', border: 'none' }}
                          >
                            Yes, reset
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <div className="h-4" />
    </div>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function GroupLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="section-label flex items-center gap-1.5">
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      {title}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inset-row justify-between">
      <div>
        <p className="text-sm font-semibold text-primary">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-[51px] h-[31px] rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer"
      style={{
        backgroundColor: checked ? 'var(--success)' : 'var(--bg-inset)',
        border: 'none',
        boxShadow: checked ? 'none' : 'inset 0 0 0 1px var(--hairline)',
      }}
    >
      <motion.span
        className="absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full"
        style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2), 0 0.5px 1px rgba(0,0,0,0.1)' }}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 420 }}
      />
    </button>
  );
}
