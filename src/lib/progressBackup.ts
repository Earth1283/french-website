import { useProgressStore } from '../stores/progressStore';

export function exportProgress() {
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
        resolve('ok');
      } catch {
        resolve('error');
      }
    };
    reader.readAsText(file);
  });
}
