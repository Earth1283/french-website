import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Zap, RotateCcw, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { useProgressStore, BADGES } from '../stores/progressStore';
import { UNITS } from '../data/units';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getLevelProgress, MAX_LEVEL } from '../utils/levels';

const A1_COMPETENCIES = [
  { label: 'Emergency phrases & help-seeking', units: ['emergency'] },
  { label: 'Introduce yourself (name, nationality)', units: ['greetings'] },
  { label: 'Basic greetings & farewells', units: ['greetings'] },
  { label: 'Numbers, dates & time', units: ['numbers'] },
  { label: 'Food & ordering in restaurants', units: ['food'] },
  { label: 'Asking for & giving directions', units: ['directions'] },
  { label: 'Transport (metro, bus, taxi)', units: ['directions'] },
  { label: 'Shopping & pharmacy basics', units: ['shopping'] },
  { label: 'Hotel & accommodation', units: ['accommodation'] },
  { label: 'Medical vocabulary & symptoms', units: ['medical'] },
  { label: 'Simple present tense (être, avoir)', units: ['grammar'] },
  { label: 'Negation (ne...pas)', units: ['grammar'] },
  { label: 'Basic question forms', units: ['grammar', 'emergency'] },
  { label: 'Weather & small talk', units: ['smalltalk'] },
];

export function Profile() {
  const { xp, streak, completedLessons, earnedBadges, isA1Complete, getCompletedUnits, resetProgress } = useProgressStore();
  const a1Complete = isA1Complete();
  const completedUnits = getCompletedUnits();
  const [showA1, setShowA1] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const totalLessons = UNITS.reduce((s, u) => s + u.lessons.length, 0);
  const overallPct = Math.round((completedLessons.length / totalLessons) * 100);
  const levelInfo = getLevelProgress(xp);

  const isUnitComplete = (unitId: string) => {
    const unit = UNITS.find(u => u.id === unitId);
    return unit ? unit.lessons.every(l => completedLessons.includes(l.id)) : false;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary">Your Progress</h1>
        <p className="text-secondary text-sm mt-1 font-display italic">C'est magnifique!</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'XP Earned', value: xp, color: '#F4A261' },
          { icon: Flame, label: 'Day Streak', value: streak, color: '#E63946' },
          { icon: Trophy, label: 'Units Done', value: `${completedUnits}/${UNITS.length}`, color: '#2A9D8F' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', damping: 24, stiffness: 300 }}
            className="card p-4 text-center"
          >
            <span
              className="mx-auto mb-2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
            >
              <Icon size={17} style={{ color }} />
            </span>
            <p className="text-xl font-bold text-primary">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Level card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">Level {levelInfo.level}</p>
              <p className="text-xl font-bold text-primary">{levelInfo.name}</p>
            </div>
            {levelInfo.isMaxLevel ? (
              <span className="text-2xl">🏆</span>
            ) : (
              <span className="text-xs text-muted text-right">
                <span className="font-bold text-primary">{levelInfo.currentLevelXP}</span>
                {' / '}{levelInfo.levelSpan} XP<br />
                <span className="opacity-70">to Level {levelInfo.level + 1}</span>
              </span>
            )}
          </div>
          {!levelInfo.isMaxLevel && (
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--accent)', width: '100%', transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.min(1, levelInfo.currentLevelXP / levelInfo.levelSpan) }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </div>
          )}
          {levelInfo.isMaxLevel && (
            <p className="text-xs text-muted italic">Maximum level reached. Félicitations !</p>
          )}
          <p className="text-xs text-muted mt-2">Level {levelInfo.level} of {MAX_LEVEL}</p>
        </div>
      </motion.div>

      {/* Overall progress */}
      <div className="card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-primary">Overall Progress</span>
          <span className="text-muted">{completedLessons.length}/{totalLessons} lessons</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent)', width: '100%', transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: overallPct / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-right text-xs text-muted mt-1">{overallPct}%</p>
      </div>

      {/* A1 Roadmap */}
      <div className="inset-group">
        <button
          onClick={() => setShowA1(v => !v)}
          className="w-full p-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
          style={{ background: 'transparent', border: 'none' }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--success-light)' }}
            >
              <GraduationCap size={19} style={{ color: 'var(--success)' }} />
            </span>
            <div>
              <p className="font-semibold text-primary">A1 Roadmap</p>
              <p className="text-xs text-muted">
                {a1Complete ? '🎓 A1 Complete! You\'re officially dangerous.' : 'Track your path to A1 certification'}
              </p>
            </div>
          </div>
          {showA1 ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        </button>

        <AnimatePresence>
          {showA1 && (
            <motion.div
              key="a1-roadmap-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-2 overflow-hidden"
              style={{ borderTop: '0.5px solid var(--hairline)' }}
            >
              {a1Complete && (
                <div
                  className="p-3 text-sm font-semibold text-center mb-3"
                  style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)' }}
                >
                  🎓 You've reached A1 level! Félicitations!
                </div>
              )}
              {A1_COMPETENCIES.map(({ label, units }) => {
                const done = units.some(uid => isUnitComplete(uid));
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`text-lg ${done ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                      {done ? '✅' : '⬜'}
                    </span>
                    <span className={`text-sm ${done ? 'text-primary' : 'text-muted'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badges */}
      <div>
        <p className="section-label">Badges</p>
        {(() => {
          const allBadges = Object.values(BADGES);
          const earned = allBadges.filter(b => earnedBadges.includes(b.id));
          const locked = allBadges.filter(b => !earnedBadges.includes(b.id));
          return (
            <div className="space-y-4">
              {earned.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">
                    Earned · {earned.length}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {earned.map(badge => (
                      <Badge key={badge.id} emoji={badge.emoji} name={badge.name} description={badge.description} earned />
                    ))}
                  </div>
                </div>
              )}
              {locked.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">
                    {earned.length > 0 ? `Locked · ${locked.length}` : `Locked · earn them by completing units`}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {locked.map(badge => (
                      <Badge key={badge.id} emoji={badge.emoji} name={badge.name} description={badge.description} earned={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Unit breakdown */}
      <div>
        <p className="section-label">Unit Breakdown</p>
        <div className="inset-group">
          {UNITS.map((unit, i) => {
            const done = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
            const pct = Math.round((done / unit.lessons.length) * 100);
            return (
              <div
                key={unit.id}
                className="p-3 flex items-center gap-3"
                style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
              >
                <span
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${unit.color} 12%, transparent)` }}
                >
                  {unit.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{unit.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: unit.color, width: '100%', transformOrigin: 'left' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: pct / 100 }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap">{done}/{unit.lessons.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="pt-6" style={{ borderTop: '0.5px solid var(--hairline)' }}>
        <AnimatePresence mode="wait" initial={false}>
          {!confirmReset ? (
            <motion.button
              key="trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 text-sm text-muted transition-colors cursor-pointer hover:text-[var(--danger)]"
              style={{ background: 'transparent', border: 'none' }}
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
              className="card p-4 space-y-3"
              style={{ borderColor: 'color-mix(in srgb, var(--danger) 35%, transparent)' }}
            >
              <p className="text-sm font-semibold text-primary">Are you sure? This will wipe everything.</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button>
                <button
                  onClick={() => { resetProgress(); setConfirmReset(false); }}
                  className="px-4 py-2 rounded-full text-white text-sm font-semibold transition-colors cursor-pointer ios-press"
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
  );
}
