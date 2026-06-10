import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, BookOpen, MessageSquare, Database, AlertTriangle,
  ChevronDown, ChevronUp, Key, Download, Upload, RotateCcw, RefreshCw,
  type LucideIcon,
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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[--text-primary] mb-1">Settings</h1>
        <p className="text-[--text-secondary] text-sm">Personnalisez votre expérience.</p>
      </motion.div>

      {/* ── Appearance ── */}
      <motion.section
        className="card p-5 space-y-5"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      >
        <SectionHeader icon={Palette} title="Appearance" />

        <SettingRow label="Dark Mode" description="Easy on the eyes at night.">
          <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
        </SettingRow>

        <div>
          <p className="text-sm font-semibold text-[--text-primary] mb-0.5">Accent Color</p>
          <p className="text-xs text-[--text-muted] mb-3">The color used for buttons, active states, and highlights.</p>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_PRESETS.map(({ hex, label }) => (
              <button
                key={hex}
                title={label}
                onClick={() => setAccentColor(hex)}
                aria-label={`Set accent to ${label}`}
                className="w-8 h-8 rounded-full transition-all cursor-pointer border-2"
                style={{
                  backgroundColor: hex,
                  borderColor: accentColor === hex ? 'var(--text-primary)' : 'transparent',
                  boxShadow: accentColor === hex
                    ? '0 0 0 2px var(--bg), 0 0 0 4px var(--text-primary)'
                    : 'none',
                  opacity: appleMode ? 0.5 : 1,
                }}
              />
            ))}
          </div>
          {appleMode && (
            <p className="text-xs text-[--text-muted] italic mt-2">Overridden by Apple-ify 🍎</p>
          )}
        </div>

        {/* Apple-ify — mobile only */}
        <div className="sm:hidden border-t border-[--border] pt-4 space-y-4">
          <SettingRow label="🍎 Apple-ify" description="You didn't hear this from us.">
            <ToggleSwitch checked={appleMode} onChange={setAppleMode} />
          </SettingRow>

          {appleMode && (
            <SettingRow
              label="⚡ Reduce GPU load"
              description="Disables the liquid glass nav. Helps on older phones."
            >
              <ToggleSwitch checked={reducedGpu} onChange={setReducedGpu} />
            </SettingRow>
          )}
        </div>
      </motion.section>

      {/* ── Learning ── */}
      <motion.section
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        <SectionHeader icon={BookOpen} title="Learning" />

        <div>
          <p className="text-sm font-semibold text-[--text-primary] mb-0.5">Unit 12 Access (Slang & Swearing)</p>
          <p className="text-xs text-[--text-muted] mb-3">How should the spicy final unit be unlocked?</p>
          <div className="space-y-2">
            {[
              { value: 'full-freedom' as const, label: '🚀 Full Freedom', desc: 'Unit 12 open from the start' },
              { value: 'earned-reward' as const, label: '🔓 Earned Reward', desc: 'Unlock after completing any 2 units' },
            ].map(opt => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-[--bg-card-hover]"
                style={{ borderColor: unit12Mode === opt.value ? 'var(--accent)' : 'var(--border)' }}
              >
                <input
                  type="radio"
                  name="unit12mode"
                  value={opt.value}
                  checked={unit12Mode === opt.value}
                  onChange={() => setUnit12Mode(opt.value)}
                  className="mt-0.5 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-semibold text-[--text-primary]">{opt.label}</p>
                  <p className="text-xs text-[--text-muted]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          {unit12Mode === null && (
            <p className="text-xs text-[--text-muted] italic mt-2">
              Not set yet — configure this during onboarding or reset it below.
            </p>
          )}
        </div>
      </motion.section>

      {/* ── Conversation AI ── */}
      <motion.section
        className="card p-5 space-y-5"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      >
        <SectionHeader icon={MessageSquare} title="Conversation AI" />

        <div>
          <p className="text-sm font-semibold text-[--text-primary] mb-3">Default Difficulty</p>
          <div className="flex gap-2 flex-wrap">
            {([1, 2, 3] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="flex-1 min-w-[5rem] px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left"
                style={difficulty === d
                  ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                  : { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border)' }
                }
              >
                <span className="block font-bold">{d} — {DIFFICULTY_LABELS[d].name}</span>
                <span className="block text-xs font-normal opacity-80 mt-0.5">{DIFFICULTY_LABELS[d].desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[--text-primary] mb-0.5">Gemini API Key</p>
          <p className="text-xs text-[--text-muted] mb-3">
            Stored locally only. Enables AI-powered conversations in Converse mode.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]" />
              <input
                type="password"
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                placeholder={geminiApiKey ? '••••••••••••••••' : 'AIza...'}
                className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
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
      </motion.section>

      {/* ── Data & Privacy ── */}
      <motion.section
        className="card p-5 space-y-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <SectionHeader icon={Database} title="Data & Privacy" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[--text-primary]">Export Progress</p>
            <p className="text-xs text-[--text-muted] mt-0.5">Download your progress as a JSON file.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} /> Export
          </Button>
        </div>

        <div className="flex items-start justify-between gap-4 border-t border-[--border] pt-4">
          <div>
            <p className="text-sm font-semibold text-[--text-primary]">Import Progress</p>
            <p className="text-xs text-[--text-muted] mt-0.5">Restore from a previously exported JSON file.</p>
            {importStatus === 'ok' && (
              <p className="text-xs font-semibold mt-1" style={{ color: 'var(--success)' }}>✓ Progress restored successfully.</p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs font-semibold mt-1 text-red-500">Invalid file — could not import.</p>
            )}
          </div>
          <label className="cursor-pointer flex-shrink-0">
            <input type="file" accept=".json" className="sr-only" onChange={handleImport} />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-[--border] text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors">
              <Upload size={14} /> Import
            </span>
          </label>
        </div>

        <div className="border-t border-[--border] pt-4 space-y-1">
          <p className="text-xs text-[--text-muted]">
            <span className="font-semibold">Bonjour Survival</span> — All data is stored locally in your browser.
            Nothing is sent to any server, except your Gemini key being sent directly to Google's API when you
            use Conversation mode.
          </p>
          <p className="text-xs text-[--text-muted]">v0.1.0</p>
        </div>
      </motion.section>

      {/* ── Danger Zone ── */}
      <motion.section
        className="rounded-xl border overflow-hidden border-red-300 dark:border-red-800"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      >
        <button
          onClick={() => setDangerOpen(v => !v)}
          className="w-full p-4 flex items-center justify-between text-left transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="font-semibold text-sm text-red-700 dark:text-red-400">Danger Zone</p>
          </div>
          {dangerOpen
            ? <ChevronUp size={15} className="text-red-400" />
            : <ChevronDown size={15} className="text-red-400" />
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
                  <p className="text-sm font-semibold text-[--text-primary] mb-0.5">Set XP</p>
                  <p className="text-xs text-[--text-muted] mb-2">Override your current XP total.</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      value={xpDraft}
                      onChange={e => setXpDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyXP()}
                      className="w-28 px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Button variant="secondary" size="sm" onClick={applyXP}>Apply</Button>
                  </div>
                </div>

                {/* Set Streak */}
                <div>
                  <p className="text-sm font-semibold text-[--text-primary] mb-0.5">Set Streak</p>
                  <p className="text-xs text-[--text-muted] mb-2">Override your current day streak.</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      value={streakDraft}
                      onChange={e => setStreakDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyStreak()}
                      className="w-28 px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Button variant="secondary" size="sm" onClick={applyStreak}>Apply</Button>
                  </div>
                </div>

                {/* Reset Onboarding */}
                <div className="border-t border-[--border] pt-5">
                  <p className="text-sm font-semibold text-[--text-primary] mb-0.5">Reset Onboarding</p>
                  <p className="text-xs text-[--text-muted] mb-3">
                    Re-trigger the welcome modal on your next visit to Home.
                  </p>
                  {!confirmOnboarding ? (
                    <button
                      onClick={() => setConfirmOnboarding(true)}
                      className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      <RefreshCw size={14} /> Reset onboarding
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-[--text-primary]">
                        This will show the welcome modal on your next visit to Home.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setConfirmOnboarding(false)}>
                          Cancel
                        </Button>
                        <button
                          onClick={() => { resetOnboarding(); setConfirmOnboarding(false); }}
                          className="px-3 py-1.5 rounded-lg text-white text-sm font-semibold transition-colors bg-orange-500 hover:bg-orange-600"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Progress */}
                <div>
                  <p className="text-sm font-semibold text-[--text-primary] mb-0.5">Reset All Progress</p>
                  <p className="text-xs text-[--text-muted] mb-3">
                    Wipes completed lessons, XP, streak, and badges. Appearance and AI settings are kept.
                  </p>
                  {!confirmReset ? (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="flex items-center gap-2 text-sm text-red-500 hover:underline"
                    >
                      <RotateCcw size={14} /> Reset all progress
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border border-red-300 dark:border-red-700 space-y-3">
                      <p className="text-sm font-semibold text-[--text-primary]">
                        This wipes all lessons, XP, streak, and badges. Are you sure?
                      </p>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>
                          Cancel
                        </Button>
                        <button
                          onClick={() => { resetProgress(); setConfirmReset(false); }}
                          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors bg-red-500 hover:bg-red-600"
                        >
                          Yes, reset
                        </button>
                      </div>
                    </div>
                  )}
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

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-[--accent]" />
      <h2 className="text-xs font-bold uppercase tracking-wider text-[--text-muted]">{title}</h2>
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
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[--text-primary]">{label}</p>
        {description && <p className="text-xs text-[--text-muted] mt-0.5">{description}</p>}
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
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer"
      style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--border)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}
