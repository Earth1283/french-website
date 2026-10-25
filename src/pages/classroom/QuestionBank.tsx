import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FilePlus2, Pencil, Plus, Trash2 } from 'lucide-react';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { BankQuestionList } from '../../components/classroom/BankQuestionList';
import { tagsFromInput } from '../../utils/classroomAttention';
import type { ExerciseType } from '../../types';
import type { BankQuestion, ClassroomContent } from '../../types/classroom';

const TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'translation', label: 'Translation' },
];

interface Draft {
  type: ExerciseType;
  prompt: string;
  answer: string;
  optionsCsv: string;
  hint: string;
  tagsCsv: string;
  readingId: string;
  page: string;
}

const blankDraft: Draft = { type: 'multiple-choice', prompt: '', answer: '', optionsCsv: '', hint: '', tagsCsv: '', readingId: '', page: '' };

function draftFromQuestion(q: BankQuestion): Draft {
  return {
    type: q.type,
    prompt: q.prompt,
    answer: q.answer,
    optionsCsv: (q.options ?? []).join(', '),
    hint: q.hint ?? '',
    tagsCsv: q.tags.join(', '),
    readingId: q.readingId ?? '',
    page: q.page ? String(q.page) : '',
  };
}

export function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<BankQuestion[] | null>(null);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [article, setArticle] = useState<string | null>(null);
  const [readings, setReadings] = useState<ClassroomContent[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [bankRes, contentRes] = await Promise.all([
      classroomApi.get<{ questions: BankQuestion[] }>('/api/teacher/bank'),
      classroomApi.get<{ content: ClassroomContent[] }>('/api/teacher/content'),
    ]);
    setQuestions(bankRes.questions);
    setReadings(contentRes.content.filter((c) => c.kind === 'reading'));
  }

  useEffect(() => {
    load().catch(() => setError('Could not load the question bank.'));
  }, []);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  async function save() {
    if (!draft) return;
    setError(null);
    const payload = {
      type: draft.type,
      prompt: draft.prompt.trim(),
      answer: draft.answer.trim(),
      options: draft.type === 'multiple-choice' ? draft.optionsCsv.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
      hint: draft.hint.trim() || undefined,
      tags: tagsFromInput(draft.tagsCsv),
      readingId: draft.readingId || null,
      page: draft.readingId && draft.page.trim() ? Number(draft.page) : null,
    };
    try {
      if (editingId) await classroomApi.put(`/api/teacher/bank/${editingId}`, payload);
      else await classroomApi.post('/api/teacher/bank', payload);
      setDraft(null);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof ClassroomApiError ? `Could not save: ${e.message}` : 'Could not save this question.');
    }
  }

  async function removeSelected() {
    await classroomApi.post('/api/teacher/bank/delete', { ids: [...selected] });
    setSelected(new Set());
    setConfirmDelete(false);
    await load();
  }

  function makeQuiz() {
    const chosen = (questions ?? []).filter((q) => selected.has(q.id));
    navigate('/classes/content/new', { state: { bankQuestions: chosen, kind: 'quiz' } });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/classes"
            className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline"
            style={{ color: 'var(--accent)' }}
          >
            <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> Classes
          </Link>
          <h1 className="text-3xl font-bold text-primary">Question Bank</h1>
          <p className="text-sm text-secondary mt-1">
            Questions you reuse. Adding one to a quiz or article copies it, so editing those never changes the bank. Tie a
            question to the article it was written for to find it again from that article's editor.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingId(null);
            setDraft(blankDraft);
          }}
        >
          <Plus size={14} /> New
        </Button>
      </div>

      {draft && (
        <div className="card p-4 space-y-2">
          <select
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value as ExerciseType })}
            aria-label="Question type"
            className="ios-input py-1.5 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} placeholder="Prompt" className="ios-input py-1.5 text-sm" />
          <input value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} placeholder="Correct answer" className="ios-input py-1.5 text-sm" />
          {draft.type === 'multiple-choice' && (
            <input
              value={draft.optionsCsv}
              onChange={(e) => setDraft({ ...draft, optionsCsv: e.target.value })}
              placeholder="Options, comma-separated (include the correct answer)"
              className="ios-input py-1.5 text-sm"
            />
          )}
          <input value={draft.hint} onChange={(e) => setDraft({ ...draft, hint: e.target.value })} placeholder="Hint (optional)" className="ios-input py-1.5 text-sm" />
          <input value={draft.tagsCsv} onChange={(e) => setDraft({ ...draft, tagsCsv: e.target.value })} placeholder="Tags, comma-separated (e.g. verbs, food)" className="ios-input py-1.5 text-sm" />
          <div className="flex items-center gap-2">
            <select
              value={draft.readingId}
              onChange={(e) => setDraft({ ...draft, readingId: e.target.value })}
              aria-label="Based on article"
              className="ios-input py-1.5 text-sm flex-1"
            >
              <option value="">Not tied to an article</option>
              {readings.map((r) => (
                <option key={r.id} value={r.id}>
                  Based on “{r.title}”
                </option>
              ))}
            </select>
            {draft.readingId && (
              <input
                type="number"
                min={1}
                value={draft.page}
                onChange={(e) => setDraft({ ...draft, page: e.target.value })}
                placeholder="Page"
                aria-label="Page"
                className="ios-input py-1.5 text-sm w-20"
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={!draft.prompt.trim() || !draft.answer.trim()}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}

      {questions === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <BankQuestionList
          questions={questions}
          search={search}
          onSearchChange={setSearch}
          tag={tag}
          onTagChange={setTag}
          article={article}
          onArticleChange={setArticle}
          selected={selected}
          onToggle={toggle}
          renderActions={(q) => (
            <button
              onClick={() => {
                setEditingId(q.id);
                setDraft(draftFromQuestion(q));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Edit question"
              className="p-1.5 rounded-full cursor-pointer flex-shrink-0"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
            >
              <Pencil size={14} />
            </button>
          )}
        />
      )}

      {selected.size > 0 && (
        <div
          className="sticky bottom-4 card p-3 flex items-center justify-between gap-2"
          style={{ boxShadow: 'var(--shadow-3)' }}
        >
          <p className="text-sm text-primary">{selected.size} selected</p>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button onClick={removeSelected} className="chip cursor-pointer" style={{ border: 'none', color: 'var(--danger)' }}>
                Delete {selected.size}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted hover:underline cursor-pointer" style={{ background: 'transparent', border: 'none' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={13} /> Delete
              </Button>
              <Button size="sm" onClick={makeQuiz}>
                <FilePlus2 size={14} /> New quiz from selected
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
