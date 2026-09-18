import { useProgressStore } from '../stores/progressStore';
import { useTestStore } from '../stores/testStore';
import { useLearnerStore } from '../stores/learnerStore';

export function exportProgress() {
  const progressState = useProgressStore.getState();
  const testState = useTestStore.getState();
  const learnerState = useLearnerStore.getState();

  const data = {
    version: 2,
    completedLessons: progressState.completedLessons,
    xp: progressState.xp,
    streak: progressState.streak,
    lastStudiedDate: progressState.lastStudiedDate,
    earnedBadges: progressState.earnedBadges,
    bookmarkedLessons: progressState.bookmarkedLessons,
    srsData: progressState.srsData,
    unit12Mode: progressState.unit12Mode,
    accentColor: progressState.accentColor,
    testHistory: testState.history,
    learnerProfile: learnerState.profile,
    exerciseStats: learnerState.exerciseStats,
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

export function importProgress(file: File): Promise<'ok' | 'error'> {
  return new Promise(resolve => {
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

        if (Array.isArray(data.testHistory)) {
          useTestStore.setState({ history: data.testHistory });
        }

        if (data.learnerProfile && typeof data.learnerProfile === 'object' && Array.isArray(data.learnerProfile.goals)) {
          useLearnerStore.getState().setProfile(data.learnerProfile);
        }

        if (data.exerciseStats && typeof data.exerciseStats === 'object') {
          useLearnerStore.setState({ exerciseStats: data.exerciseStats });
        }

        resolve('ok');
      } catch {
        resolve('error');
      }
    };
    reader.readAsText(file);
  });
}
