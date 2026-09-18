import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useLearnerStore } from '../../stores/learnerStore';
import { useTestStore } from '../../stores/testStore';
import { todayString } from '../../utils/streak';
import type { LearnerGoal, PriorLevel } from '../../types';

const GOAL_OPTIONS: Array<{ goal: LearnerGoal; emoji: string; label: string }> = [
  { goal: 'trip', emoji: '✈️', label: 'A trip' },
  { goal: 'moving', emoji: '🏡', label: 'Moving to France' },
  { goal: 'exam', emoji: '🎓', label: 'A class or exam' },
  { goal: 'fun', emoji: '🎬', label: 'Just for fun' },
];

const LEVEL_OPTIONS: Array<{ level: PriorLevel; label: string; desc: string }> = [
  { level: 'none', label: 'Total beginner', desc: 'Start from the first sound.' },
  { level: 'some', label: 'I know some French', desc: 'Pronunciation basics move to the back.' },
  { level: 'placed', label: 'Place me', desc: 'A quick adaptive test skips units you already know.' },
];

interface PersonalizeFormProps {
  onDone: () => void;
  cancelLabel: string;
}

export function PersonalizeForm({ onDone, cancelLabel }: PersonalizeFormProps) {
  const navigate = useNavigate();
  const saved = useLearnerStore(s => s.profile);
  const setProfile = useLearnerStore(s => s.setProfile);
  const hasTestResult = useTestStore(s => s.history.length > 0);

  const [goals, setGoals] = useState<LearnerGoal[]>(saved?.goals ?? []);
  const [targetDate, setTargetDate] = useState(saved?.targetDate ?? '');
  const [priorLevel, setPriorLevel] = useState<PriorLevel>(saved?.priorLevel ?? 'none');

  const toggleGoal = (goal: LearnerGoal) =>
    setGoals(gs => (gs.includes(goal) ? gs.filter(g => g !== goal) : [...gs, goal]));

  const save = () => {
    setProfile({ goals, targetDate: targetDate || null, priorLevel });
    onDone();
    if (priorLevel === 'placed' && !hasTestResult) navigate('/test');
  };

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-semibold text-primary mb-2">What are you learning French for?</legend>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map(({ goal, emoji, label }) => {
            const selected = goals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleGoal(goal)}
                className="flex items-center gap-2 p-3 text-left text-sm font-medium cursor-pointer ios-press"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selected ? 'var(--accent-tint)' : 'var(--bg-inset)',
                  color: selected ? 'var(--accent)' : 'var(--text-primary)',
                  border: `1px solid ${selected ? 'var(--accent)' : 'transparent'}`,
                }}
              >
                <span className="text-lg leading-none">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-1.5">Pick as many as apply.</p>
      </fieldset>

      <label className="block">
        <span className="text-sm font-semibold text-primary">Need it by a certain date?</span>
        <span className="block text-xs text-muted mb-2">Optional. Close dates trim the path to what matters in time.</span>
        <input
          type="date"
          min={todayString()}
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
          className="ios-input w-full"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-semibold text-primary mb-2">How much French do you know?</legend>
        <div className="space-y-1.5">
          {LEVEL_OPTIONS.map(({ level, label, desc }) => (
            <label
              key={level}
              className="flex items-start gap-3 p-3 cursor-pointer"
              style={{ borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-inset)' }}
            >
              <input
                type="radio"
                name="prior-level"
                checked={priorLevel === level}
                onChange={() => setPriorLevel(level)}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-primary">{label}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 pt-1">
        <Button variant="primary" className="w-full" onClick={save} disabled={goals.length === 0}>
          {priorLevel === 'placed' && !hasTestResult ? 'Save and take the test →' : 'Build my path →'}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onDone}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
