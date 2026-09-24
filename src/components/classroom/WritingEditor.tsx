import { WRITING_TASKS } from '../../data/exam/writing';
import type { ClassroomWritingBody } from '../../types/classroom';
import type { DelfLevel } from '../../types/exam';

export interface WritingDraft {
  level: DelfLevel;
  consigne: string;
  minWords: number;
  timeMinutes: number;
  checklistText: string;
  modelAnswer: string;
}

const DEFAULT_WORDS: Record<DelfLevel, number> = { a1: 40, a2: 60, b1: 160, b2: 250 };
const DEFAULT_MINUTES: Record<DelfLevel, number> = { a1: 20, a2: 25, b1: 45, b2: 60 };

export function blankWritingDraft(): WritingDraft {
  return { level: 'b1', consigne: '', minWords: 160, timeMinutes: 45, checklistText: '', modelAnswer: '' };
}

export function writingDraftFromBody(body: Omit<ClassroomWritingBody, 'kind' | 'xpReward'>): WritingDraft {
  return {
    level: body.level,
    consigne: body.consigne,
    minWords: body.minWords,
    timeMinutes: body.timeMinutes ?? DEFAULT_MINUTES[body.level],
    checklistText: body.checklist.join('\n'),
    modelAnswer: body.modelAnswer ?? '',
  };
}

export function writingBodyFromDraft(d: WritingDraft, xpReward: number): ClassroomWritingBody | string {
  if (!d.consigne.trim()) return 'Write the task instructions (consigne).';
  return {
    kind: 'writing',
    level: d.level,
    consigne: d.consigne.trim(),
    minWords: Math.max(1, d.minWords),
    timeMinutes: Math.max(1, d.timeMinutes),
    checklist: d.checklistText.split('\n').map(s => s.trim()).filter(Boolean),
    ...(d.modelAnswer.trim() ? { modelAnswer: d.modelAnswer.trim() } : {}),
    xpReward,
  };
}

interface Props {
  value: WritingDraft;
  onChange: (d: WritingDraft) => void;
  onImportTitle?: (title: string) => void;
}

export function WritingEditor({ value: d, onChange, onImportTitle }: Props) {
  const set = (patch: Partial<WritingDraft>) => onChange({ ...d, ...patch });
  return (
    <div className="inset-group">
      <div className="p-4 space-y-3">
        <label className="block text-xs text-muted">
          Start from a DELF Prep task (optional)
          <select
            className="ios-input py-1.5 text-sm mt-1"
            value=""
            onChange={e => {
              const task = WRITING_TASKS.find(t => t.id === e.target.value);
              if (!task) return;
              onChange(writingDraftFromBody(task));
              onImportTitle?.(task.title);
            }}
          >
            <option value="">Choose a task…</option>
            {WRITING_TASKS.map(t => (
              <option key={t.id} value={t.id}>{t.level.toUpperCase()} · {t.title}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs text-muted">
            DELF level
            <select
              className="ios-input py-1.5 text-sm mt-1"
              value={d.level}
              onChange={e => {
                const level = e.target.value as DelfLevel;
                set({ level, minWords: DEFAULT_WORDS[level], timeMinutes: DEFAULT_MINUTES[level] });
              }}
            >
              {(['a1', 'a2', 'b1', 'b2'] as const).map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">
            Min. words
            <input
              type="number"
              min={1}
              value={d.minWords}
              onChange={e => set({ minWords: parseInt(e.target.value) || 0 })}
              className="ios-input py-1.5 text-sm mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Minutes
            <input
              type="number"
              min={1}
              value={d.timeMinutes}
              onChange={e => set({ timeMinutes: parseInt(e.target.value) || 0 })}
              className="ios-input py-1.5 text-sm mt-1"
            />
          </label>
        </div>
        <textarea
          value={d.consigne}
          onChange={e => set({ consigne: e.target.value })}
          placeholder="Consigne — the task as students see it, e.g. « Vous écrivez un courriel à… (160 mots minimum) »"
          rows={4}
          lang="fr"
          className="ios-input py-2 text-sm"
        />
        <textarea
          value={d.checklistText}
          onChange={e => set({ checklistText: e.target.value })}
          placeholder={'What you will look for, one per line (shown to students)\ne.g. Give your opinion with two examples'}
          rows={3}
          className="ios-input py-2 text-sm"
        />
        <textarea
          value={d.modelAnswer}
          onChange={e => set({ modelAnswer: e.target.value })}
          placeholder="Model answer (optional) — students only see it after submitting"
          rows={5}
          lang="fr"
          className="ios-input py-2 text-sm"
        />
        <p className="text-xs text-muted">
          You mark submissions on the DELF grid for this level (five criteria, four bands each) from the assignment's results page.
        </p>
      </div>
    </div>
  );
}
