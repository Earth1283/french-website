import { useMemo } from 'react';
import { useProgressStore } from '../stores/progressStore';
import { useLearnerStore } from '../stores/learnerStore';
import { useTestStore } from '../stores/testStore';
import { LESSON_META } from '../data/lessonMeta';
import { buildPath } from '../utils/learningPath';
import { getFixUps } from '../utils/mastery';
import { todayString } from '../utils/streak';

const prereqsOf = (lessonId: string) => LESSON_META[lessonId]?.prereqs ?? [];

export function useLearningPath() {
  const completedLessons = useProgressStore(s => s.completedLessons);
  const srsData = useProgressStore(s => s.srsData);
  const unit12Mode = useProgressStore(s => s.unit12Mode);
  const isUnit12Unlocked = useProgressStore(s => s.isUnit12Unlocked);
  const profile = useLearnerStore(s => s.profile);
  const exerciseStats = useLearnerStore(s => s.exerciseStats);
  const history = useTestStore(s => s.history);
  const latestTest = history[history.length - 1];

  const unit12Unlocked = useMemo(() => isUnit12Unlocked(), [isUnit12Unlocked, completedLessons, unit12Mode]);

  const path = useMemo(
    () => buildPath({ profile, completedLessons, unit12Unlocked, latestTest, today: todayString() }),
    [profile, completedLessons, unit12Unlocked, latestTest],
  );

  const fixUps = useMemo(
    () => getFixUps(completedLessons, { exerciseStats, srsData, latestTest }, prereqsOf),
    [completedLessons, exerciseStats, srsData, latestTest],
  );

  return { path, fixUps, profile };
}
