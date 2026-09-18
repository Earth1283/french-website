import { useState } from 'react';
import { motion } from 'framer-motion';
import { Route, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { PersonalizeModal } from './PersonalizeModal';
import { useLearnerStore } from '../../stores/learnerStore';
import { UNITS } from '../../data/units';
import { GOAL_LABELS, type LearningPath } from '../../utils/learningPath';

function summarize(path: LearningPath, goalText: string): string[] {
  const parts = [`For ${goalText}`];
  if (path.daysUntilTarget !== null) {
    parts.push(path.daysUntilTarget === 0 ? 'Target date is today' : `${path.daysUntilTarget} day${path.daysUntilTarget !== 1 ? 's' : ''} to go`);
  }
  if (path.testedOutUnitIds.length > 0) {
    const titles = path.testedOutUnitIds.map(id => UNITS.find(u => u.id === id)?.tagline ?? id);
    parts.push(`Tested out of ${titles.length === 1 ? titles[0] : `${titles.length} units`}`);
  }
  if (path.deferredLessonCount > 0) {
    parts.push(`${path.deferredLessonCount} lesson${path.deferredLessonCount !== 1 ? 's' : ''} saved for after your date`);
  }
  return parts;
}

export function PathPanel({ path }: { path: LearningPath }) {
  const profile = useLearnerStore(s => s.profile);
  const dismissed = useLearnerStore(s => s.personalizePromptDismissed);
  const dismiss = useLearnerStore(s => s.dismissPersonalizePrompt);
  const [editing, setEditing] = useState(false);

  if (!profile && dismissed) return null;

  return (
    <>
      <PersonalizeModal open={editing} onClose={() => setEditing(false)} />
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        {profile ? (
          <div className="card p-4 flex items-center gap-3">
            <Route size={16} className="flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <p className="text-xs text-muted flex-1 min-w-0">
              <span className="font-semibold text-primary">Your path</span>
              {' · '}
              {summarize(path, profile.goals.map(g => GOAL_LABELS[g]).join(' + ')).join(' · ')}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          </div>
        ) : (
          <div className="card p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--accent-soft-bg)' }}>
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Route size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-primary">Personalize your path</p>
              <p className="text-xs text-muted">Three questions reorder lessons around your goals. No account needed.</p>
            </div>
            <Button size="sm" onClick={() => setEditing(true)}>Start</Button>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="p-1.5 rounded-full ios-press cursor-pointer flex-shrink-0"
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
