import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, RotateCcw, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { useProgressStore, BADGES } from '../stores/progressStore';
import { UNITS, A1_UNIT_IDS } from '../data/units';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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

  const isUnitComplete = (unitId: string) => {
    const unit = UNITS.find(u => u.id === unitId);
    return unit ? unit.lessons.every(l => completedLessons.includes(l.id)) : false;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[--text-primary]">Your Progress</h1>
        <p className="text-[--text-secondary] text-sm mt-1">C'est magnifique!</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'XP Earned', value: xp, color: '#F4A261' },
          { icon: Flame, label: 'Day Streak', value: streak, color: '#E63946' },
          { icon: Trophy, label: 'Units Done', value: `${completedUnits}/${UNITS.length}`, color: '#2A9D8F' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className="mx-auto mb-1.5" style={{ color }} />
            <p className="text-xl font-bold text-[--text-primary]">{value}</p>
            <p className="text-xs text-[--text-muted]">{label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-[--text-primary]">Overall Progress</span>
          <span className="text-[--text-muted]">{completedLessons.length}/{totalLessons} lessons</span>
        </div>
        <div className="w-full h-3 bg-[--border] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-right text-xs text-[--text-muted] mt-1">{overallPct}%</p>
      </div>

      {/* A1 Roadmap */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowA1(v => !v)}
          className="w-full p-5 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <GraduationCap size={20} className="text-[--success]" />
            <div>
              <p className="font-semibold text-[--text-primary]">A1 Roadmap</p>
              <p className="text-xs text-[--text-muted]">
                {a1Complete ? '🎓 A1 Complete! You\'re officially dangerous.' : 'Track your path to A1 certification'}
              </p>
            </div>
          </div>
          {showA1 ? <ChevronUp size={16} className="text-[--text-muted]" /> : <ChevronDown size={16} className="text-[--text-muted]" />}
        </button>

        {showA1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-[--border] p-4 space-y-2"
          >
            {a1Complete && (
              <div className="p-3 rounded-xl bg-[--success-light] text-[--success] text-sm font-semibold text-center mb-3">
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
                  <span className={`text-sm ${done ? 'text-[--text-primary]' : 'text-[--text-muted]'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-lg font-bold text-[--text-primary] mb-3">Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(BADGES).map(badge => (
            <Badge
              key={badge.id}
              emoji={badge.emoji}
              name={badge.name}
              description={badge.description}
              earned={earnedBadges.includes(badge.id)}
            />
          ))}
        </div>
      </div>

      {/* Unit breakdown */}
      <div>
        <h2 className="text-lg font-bold text-[--text-primary] mb-3">Unit Breakdown</h2>
        <div className="space-y-2">
          {UNITS.map(unit => {
            const done = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
            const pct = Math.round((done / unit.lessons.length) * 100);
            return (
              <div key={unit.id} className="card p-3 flex items-center gap-3">
                <span className="text-lg">{unit.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[--text-primary] truncate">{unit.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-[--border] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full progress-bar-fill"
                        style={{ width: `${pct}%`, backgroundColor: unit.color }}
                      />
                    </div>
                    <span className="text-xs text-[--text-muted] whitespace-nowrap">{done}/{unit.lessons.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="border-t border-[--border] pt-6">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 text-sm text-[--text-muted] hover:text-red-500 transition-colors"
          >
            <RotateCcw size={14} /> Reset all progress
          </button>
        ) : (
          <div className="card p-4 border-red-300 dark:border-red-700 space-y-3">
            <p className="text-sm font-semibold text-[--text-primary]">Are you sure? This will wipe everything.</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button>
              <button
                onClick={() => { resetProgress(); setConfirmReset(false); }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Yes, reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
