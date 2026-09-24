import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ListeningPlayer } from '../exam/ListeningPlayer';
import { LISTENING_DOCS } from '../../data/exam/listening';
import type { ClassroomListeningBody } from '../../types/classroom';
import type { DelfLevel, ListeningDoc } from '../../types/exam';

interface LineRow { speaker: string; text: string }
interface QuestionRow { type: 'multiple-choice' | 'short'; prompt: string; optionsText: string; answer: string; explanation: string }

export interface ListeningDraft {
  level: DelfLevel | '';
  situation: string;
  plays: number;
  lines: LineRow[];
  questions: QuestionRow[];
}

export function blankListeningDraft(): ListeningDraft {
  return {
    level: '',
    situation: '',
    plays: 2,
    lines: [{ speaker: '', text: '' }],
    questions: [{ type: 'multiple-choice', prompt: '', optionsText: '', answer: '', explanation: '' }],
  };
}

export function listeningDraftFromBody(body: Omit<ClassroomListeningBody, 'kind' | 'xpReward'> | ListeningDoc): ListeningDraft {
  return {
    level: body.level ?? '',
    situation: body.situation ?? '',
    plays: body.plays,
    lines: body.script.map(l => ({ speaker: l.speaker ?? '', text: l.text })),
    questions: body.questions.map(q => ({
      type: q.type,
      prompt: q.prompt,
      // One option per line: French options often contain commas.
      optionsText: (q.options ?? []).join('\n'),
      answer: q.answer,
      explanation: q.explanation ?? '',
    })),
  };
}

export function listeningBodyFromDraft(d: ListeningDraft, xpReward: number): ClassroomListeningBody | string {
  const script = d.lines
    .filter(l => l.text.trim())
    .map(l => ({ text: l.text.trim(), ...(l.speaker.trim() ? { speaker: l.speaker.trim() } : {}) }));
  const questions = d.questions
    .filter(q => q.prompt.trim() && q.answer.trim())
    .map(q => {
      const options = q.optionsText.split('\n').map(o => o.trim()).filter(Boolean);
      return {
        type: q.type,
        prompt: q.prompt.trim(),
        answer: q.answer.trim(),
        ...(q.type === 'multiple-choice' ? { options } : {}),
        ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
      };
    });
  if (script.length === 0) return 'Write at least one line of the script.';
  if (questions.length === 0) return 'Add at least one complete question.';
  const bad = questions.findIndex(q => q.type === 'multiple-choice' && !q.options?.includes(q.answer));
  if (bad >= 0) return `Question ${bad + 1}: the correct answer must be one of the options, spelled exactly the same.`;
  return {
    kind: 'listening',
    ...(d.level ? { level: d.level } : {}),
    situation: d.situation.trim(),
    plays: d.plays,
    script,
    questions,
    xpReward,
  };
}

interface Props {
  value: ListeningDraft;
  onChange: (d: ListeningDraft) => void;
  onImportTitle?: (title: string) => void;
}

export function ListeningEditor({ value: d, onChange, onImportTitle }: Props) {
  const set = (patch: Partial<ListeningDraft>) => onChange({ ...d, ...patch });
  const setLine = (i: number, patch: Partial<LineRow>) => set({ lines: d.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const setQuestion = (i: number, patch: Partial<QuestionRow>) =>
    set({ questions: d.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) });
  const previewScript = d.lines.filter(l => l.text.trim()).map(l => ({ speaker: l.speaker.trim() || undefined, text: l.text }));

  return (
    <div className="space-y-5">
      <div className="inset-group">
        <div className="p-4 space-y-3">
          <label className="block text-xs text-muted">
            Start from a DELF Prep document (optional)
            <select
              className="ios-input py-1.5 text-sm mt-1"
              value=""
              onChange={e => {
                const doc = LISTENING_DOCS.find(x => x.id === e.target.value);
                if (!doc) return;
                onChange(listeningDraftFromBody(doc));
                onImportTitle?.(doc.title);
              }}
            >
              <option value="">Choose a document…</option>
              {LISTENING_DOCS.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.level.toUpperCase()} · {doc.title}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">
              DELF level (optional)
              <select className="ios-input py-1.5 text-sm mt-1" value={d.level} onChange={e => set({ level: e.target.value as DelfLevel | '' })}>
                <option value="">—</option>
                {(['a1', 'a2', 'b1', 'b2'] as const).map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted">
              Plays allowed
              <select className="ios-input py-1.5 text-sm mt-1" value={d.plays} onChange={e => set({ plays: Number(e.target.value) })}>
                <option value={1}>Once</option>
                <option value={2}>Twice (DELF default)</option>
                <option value={3}>Three times</option>
              </select>
            </label>
          </div>
          <input
            value={d.situation}
            onChange={e => set({ situation: e.target.value })}
            placeholder="Situation, e.g. « Vous êtes à la gare. Vous entendez cette annonce. »"
            className="ios-input py-2 text-sm"
          />
        </div>
      </div>

      <section>
        <div className="section-label">Script</div>
        <p className="text-xs text-muted mb-2 px-1">
          Read aloud by the student's browser. Give each speaker a name to get a different voice; leave it blank for an announcement.
        </p>
        <div className="inset-group">
          {d.lines.map((line, i) => (
            <div key={i} className="p-3 inset-divider flex gap-2 items-start">
              <input
                value={line.speaker}
                onChange={e => setLine(i, { speaker: e.target.value })}
                placeholder="Speaker"
                className="ios-input py-1.5 text-sm w-28 flex-shrink-0"
              />
              <textarea
                value={line.text}
                onChange={e => setLine(i, { text: e.target.value })}
                placeholder="What they say, in French"
                rows={2}
                lang="fr"
                className="ios-input py-1.5 text-sm flex-1"
              />
              <button
                onClick={() => set({ lines: d.lines.filter((_, j) => j !== i) })}
                aria-label="Remove line"
                disabled={d.lines.length === 1}
                className="p-1.5 cursor-pointer flex-shrink-0"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="p-3 inset-divider">
            <Button variant="ghost" size="sm" onClick={() => set({ lines: [...d.lines, { speaker: '', text: '' }] })}>
              <Plus size={14} /> Add line
            </Button>
          </div>
        </div>
        {previewScript.length > 0 && (
          <div className="mt-3">
            <ListeningPlayer key={JSON.stringify(previewScript)} script={previewScript} maxPlays={null} allowRateChange />
          </div>
        )}
      </section>

      <section>
        <div className="section-label">Questions</div>
        <div className="inset-group">
          {d.questions.map((q, i) => (
            <div key={i} className="p-4 inset-divider space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={q.type}
                  onChange={e => setQuestion(i, { type: e.target.value as QuestionRow['type'] })}
                  className="ios-input py-1.5 text-sm flex-1"
                >
                  <option value="multiple-choice">Multiple choice (DELF uses 3 options)</option>
                  <option value="short">Short written answer</option>
                </select>
                <button
                  onClick={() => set({ questions: d.questions.filter((_, j) => j !== i) })}
                  aria-label="Remove question"
                  className="p-1.5 cursor-pointer flex-shrink-0"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <input value={q.prompt} onChange={e => setQuestion(i, { prompt: e.target.value })} placeholder="Question" className="ios-input py-1.5 text-sm" />
              {q.type === 'multiple-choice' && (
                <textarea
                  value={q.optionsText}
                  onChange={e => setQuestion(i, { optionsText: e.target.value })}
                  placeholder={'Options, one per line\n(include the correct answer)'}
                  rows={3}
                  className="ios-input py-1.5 text-sm"
                />
              )}
              <input value={q.answer} onChange={e => setQuestion(i, { answer: e.target.value })} placeholder="Correct answer" className="ios-input py-1.5 text-sm" />
              <input
                value={q.explanation}
                onChange={e => setQuestion(i, { explanation: e.target.value })}
                placeholder="Explanation shown after answering (optional)"
                className="ios-input py-1.5 text-sm"
              />
            </div>
          ))}
          <div className="p-3 inset-divider">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => set({ questions: [...d.questions, { type: 'multiple-choice', prompt: '', optionsText: '', answer: '', explanation: '' }] })}
            >
              <Plus size={14} /> Add question
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
