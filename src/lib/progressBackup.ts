import type { ReadingResult } from '../types/exam';
import { useNotebookStore } from '../stores/notebookStore';
import { isMistake } from '../utils/notebook';
import { useProgressStore } from '../stores/progressStore';
import { useTestStore } from '../stores/testStore';
import { useLearnerStore } from '../stores/learnerStore';
import { useExamStore } from '../stores/examStore';
import { useConversationStore } from '../stores/conversationStore';

function isReadingResult(value: unknown): value is ReadingResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as ReadingResult;
  return [r.id, r.docId, r.date].every(v => typeof v === 'string')
    && (r.mode === 'exam' || r.mode === 'practice')
    && Number.isInteger(r.total) && r.total > 0 && Number.isInteger(r.correct) && r.correct >= 0 && r.correct <= r.total
    && Array.isArray(r.answers) && r.answers.every(a => a == null || typeof a === 'string');
}

export function exportProgress() {
  const progressState = useProgressStore.getState();
  const testState = useTestStore.getState();
  const learnerState = useLearnerStore.getState();
  const examState = useExamStore.getState();

  const data = {
    version: 5,
    notebook: { mistakes: useNotebookStore.getState().mistakes, historyImported: useNotebookStore.getState().historyImported },
    completedLessons: progressState.completedLessons,
    xp: progressState.xp,
    streak: progressState.streak,
    daysPracticed: progressState.daysPracticed,
    lastStudiedDate: progressState.lastStudiedDate,
    earnedBadges: progressState.earnedBadges,
    bookmarkedLessons: progressState.bookmarkedLessons,
    srsData: progressState.srsData,
    unit12Mode: progressState.unit12Mode,
    accentColor: progressState.accentColor,
    testHistory: testState.history,
    learnerProfile: learnerState.profile,
    exerciseStats: learnerState.exerciseStats,
    examPrep: {
      level: examState.level,
      listeningResults: examState.listeningResults,
      readingResults: examState.readingResults,
      writingSubmissions: examState.writingSubmissions,
      speakingAttempts: examState.speakingAttempts,
      mockResults: examState.mockResults,
    },
    conversationHistory: useConversationStore.getState().history,
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
            daysPracticed: typeof data.daysPracticed === 'number' ? data.daysPracticed : (typeof data.streak === 'number' ? data.streak : 0),
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

        useNotebookStore.setState({
          mistakes: Array.isArray(data.notebook?.mistakes) ? data.notebook.mistakes.filter(isMistake) : [],
          historyImported: data.notebook?.historyImported === true,
        });

        const exam = data.examPrep;
        if (exam && typeof exam === 'object') {
          useExamStore.setState({
            ...(['a1', 'a2', 'b1', 'b2'].includes(exam.level) ? { level: exam.level } : {}),
            ...(Array.isArray(exam.readingResults) ? { readingResults: exam.readingResults.filter(isReadingResult).map((r: ReadingResult) => ({ ...r, answers: r.answers.map(a => a ?? undefined) })) } : { readingResults: [] }),
            ...(Array.isArray(exam.listeningResults) ? { listeningResults: exam.listeningResults } : {}),
            ...(Array.isArray(exam.writingSubmissions) ? { writingSubmissions: exam.writingSubmissions } : {}),
            ...(Array.isArray(exam.speakingAttempts) ? { speakingAttempts: exam.speakingAttempts } : {}),
            ...(Array.isArray(exam.mockResults) ? { mockResults: exam.mockResults } : {}),
          });
        }

        if (Array.isArray(data.conversationHistory)) {
          useConversationStore.setState({ history: data.conversationHistory });
        }

        resolve('ok');
      } catch {
        resolve('error');
      }
    };
    reader.readAsText(file);
  });
}
