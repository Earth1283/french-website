import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Save, Eye, Pencil, Library, BookmarkPlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { BankQuestionList } from '../../components/classroom/BankQuestionList';
import { MarkdownField } from '../../components/classroom/MarkdownField';
import { MarkdownFormattingGuide } from '../../components/classroom/MarkdownFormattingGuide';
import {
  ListeningEditor,
  blankListeningDraft,
  listeningBodyFromDraft,
  listeningDraftFromBody,
} from '../../components/classroom/ListeningEditor';
import { WritingEditor, blankWritingDraft, writingBodyFromDraft, writingDraftFromBody } from '../../components/classroom/WritingEditor';
import { parseMarkdownPage } from '../../utils/markdownPage';
import type { ExerciseType } from '../../types';
import type { BankQuestion, ClassroomContent, ClassroomContentBody, ClassroomContentKind } from '../../types/classroom';

interface VocabRow {
  french: string;
  english: string;
  pronunciation: string;
}

interface ExerciseRow {
  type: ExerciseType;
  prompt: string;
  answer: string;
  optionsCsv: string;
  hint: string;
  page: string;
}

type ContentKind = ClassroomContentKind;

const KINDS: ContentKind[] = ['lesson', 'quiz', 'reading', 'listening', 'writing'];

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'translation', label: 'Translation' },
];

function blankExercise(): ExerciseRow {
  return { type: 'multiple-choice', prompt: '', answer: '', optionsCsv: '', hint: '', page: '' };
}
function exerciseFromBank(q: BankQuestion): ExerciseRow {
  return {
    type: q.type,
    prompt: q.prompt,
    answer: q.answer,
    optionsCsv: (q.options ?? []).join(', '),
    hint: q.hint ?? '',
    page: q.page ? String(q.page) : '',
  };
}
function blankVocab(): VocabRow {
  return { french: '', english: '', pronunciation: '' };
}
function blankPage(): string {
  return '# Page title\n\nWrite this page\'s content here, in markdown. *Italic French words* pick up the site\'s accent styling automatically.';
}

export function ContentEditor() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const fromBank = (useLocation().state as { bankQuestions?: BankQuestion[]; kind?: ContentKind } | null) ?? null;
  const isEditing = !!contentId;

  const [kind, setKind] = useState<ContentKind>(fromBank?.kind ?? 'lesson');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [xpReward, setXpReward] = useState(10);
  const [vocab, setVocab] = useState<VocabRow[]>([blankVocab()]);
  const [exercises, setExercises] = useState<ExerciseRow[]>(
    fromBank?.bankQuestions?.length ? fromBank.bankQuestions.map(exerciseFromBank) : [blankExercise()]
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bank, setBank] = useState<BankQuestion[] | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [bankTag, setBankTag] = useState<string | null>(null);
  const [bankArticle, setBankArticle] = useState<string | null>(null);
  const [bankSelected, setBankSelected] = useState<Set<string>>(new Set());
  const [bankNotice, setBankNotice] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([blankPage()]);
  const [gradable, setGradable] = useState(true);
  const [listening, setListening] = useState(blankListeningDraft);
  const [writing, setWriting] = useState(blankWritingDraft);
  const [previewOn, setPreviewOn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!isEditing);

  useEffect(() => {
    if (!contentId) return;
    classroomApi.get<{ content: ClassroomContent }>(`/api/teacher/content/${contentId}`).then((res) => {
      const c = res.content;
      const body = (c.body ?? JSON.parse(c.body_json ?? '{}')) as ClassroomContentBody;
      setTitle(c.title);
      setSubtitle(c.subtitle);
      setKind(body.kind);
      setXpReward(body.xpReward);
      if (body.kind === 'lesson') {
        setVocab(body.vocab.length ? body.vocab.map((v) => ({ ...v, pronunciation: v.pronunciation })) : [blankVocab()]);
        setExercises(
          body.exercises.map((e) => ({
            type: e.type,
            prompt: e.prompt,
            answer: e.answer,
            optionsCsv: (e.options ?? []).join(', '),
            hint: e.hint ?? '',
            page: '',
          }))
        );
      } else if (body.kind === 'reading') {
        setPages(body.pages.length ? body.pages : [blankPage()]);
        setGradable(body.gradable);
        setExercises(
          body.questions?.length
            ? body.questions.map((q) => ({
                type: q.type,
                prompt: q.prompt,
                answer: q.answer,
                optionsCsv: (q.options ?? []).join(', '),
                hint: q.hint ?? '',
                page: q.page ? String(q.page) : '',
              }))
            : [blankExercise()]
        );
      } else if (body.kind === 'listening') {
        setListening(listeningDraftFromBody(body));
      } else if (body.kind === 'writing') {
        setWriting(writingDraftFromBody(body));
      } else {
        setExercises(
          body.items.map((e) => ({
            type: e.type,
            prompt: e.prompt,
            answer: e.answer,
            optionsCsv: (e.options ?? []).join(', '),
            hint: e.hint ?? '',
            page: '',
          }))
        );
      }
      setLoaded(true);
    });
  }, [contentId]);

  function toExercise(row: ExerciseRow) {
    return {
      type: row.type,
      prompt: row.prompt.trim(),
      answer: row.answer.trim(),
      options: row.type === 'multiple-choice' ? row.optionsCsv.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
      hint: row.hint.trim() || undefined,
      ...(kind === 'reading' && row.page.trim() ? { page: Number(row.page) } : {}),
    };
  }

  async function openBankPicker() {
    setBankSelected(new Set());
    setBankArticle(kind === 'reading' ? (contentId ?? null) : null);
    setPickerOpen(true);
    const res = await classroomApi.get<{ questions: BankQuestion[] }>('/api/teacher/bank');
    setBank(res.questions);
  }

  function addFromBank() {
    const chosen = (bank ?? []).filter((q) => bankSelected.has(q.id)).map(exerciseFromBank);
    setExercises((rows) => {
      const filled = rows.filter((r) => r.prompt.trim() || r.answer.trim());
      return [...filled, ...chosen];
    });
    setPickerOpen(false);
  }

  async function saveToBank(rows: ExerciseRow[]) {
    const complete = rows.filter((e) => e.prompt.trim() && e.answer.trim()).map(toExercise);
    if (complete.length === 0) return;
    setBankNotice(null);
    try {
      const res = await classroomApi.post<{ created: unknown[]; skipped: number; linked: number }>('/api/teacher/bank/import', {
        questions: complete.map((q) => ({
          ...q,
          tags: [],
          ...(kind === 'reading' && contentId ? { readingId: contentId } : {}),
        })),
      });
      const parts = [`Saved ${res.created.length} to the bank`];
      if (res.linked) parts.push(`${res.linked} linked to this article`);
      if (res.skipped) parts.push(`${res.skipped} already there`);
      setBankNotice(`${parts.join(', ')}.${kind === 'reading' && !contentId ? ' Save the article first to link them to it.' : ''}`);
    } catch (e) {
      setBankNotice(e instanceof ClassroomApiError ? `Could not save to the bank: ${e.message}` : 'Could not save to the bank.');
    }
  }

  async function save() {
    setSaving(true);
    setError(null);

    let body: ClassroomContentBody;
    if (kind === 'listening' || kind === 'writing') {
      const built = kind === 'listening' ? listeningBodyFromDraft(listening, xpReward) : writingBodyFromDraft(writing, xpReward);
      if (typeof built === 'string' || !title.trim()) {
        setError(typeof built === 'string' ? built : 'A title is required.');
        setSaving(false);
        return;
      }
      body = built;
    } else if (kind === 'reading') {
      const cleanPages = pages.map((p) => p.trim()).filter(Boolean);
      if (!title.trim() || cleanPages.length === 0) {
        setError('A title and at least one non-empty page are required.');
        setSaving(false);
        return;
      }
      body = {
        kind: 'reading',
        pages: cleanPages,
        questions: exercises.filter((e) => e.prompt.trim() && e.answer.trim()).map(toExercise),
        xpReward,
        gradable,
      };
    } else {
      const cleanExercises = exercises.filter((e) => e.prompt.trim() && e.answer.trim()).map(toExercise);
      if (!title.trim() || cleanExercises.length === 0) {
        setError('A title and at least one complete exercise are required.');
        setSaving(false);
        return;
      }
      body =
        kind === 'lesson'
          ? {
              kind: 'lesson',
              vocab: vocab.filter((v) => v.french.trim() && v.english.trim() && v.pronunciation.trim()),
              exercises: cleanExercises,
              xpReward,
            }
          : { kind: 'quiz', items: cleanExercises, xpReward };
    }

    try {
      if (isEditing) {
        await classroomApi.put(`/api/teacher/content/${contentId}`, { title: title.trim(), subtitle: subtitle.trim(), body });
      } else {
        await classroomApi.post('/api/teacher/content', { title: title.trim(), subtitle: subtitle.trim(), body });
      }
      navigate(-1);
    } catch (e) {
      setError(e instanceof ClassroomApiError && e.status === 400 ? `Could not save: ${e.message}` : 'Could not save this content.');
    } finally {
      setSaving(false);
    }
  }

  const exercisesSection = (
      <section>
        <div className="section-label">{kind === 'lesson' ? 'Exercises' : kind === 'reading' ? 'Comprehension questions' : 'Questions'}</div>
        <div className="inset-group">
          {exercises.map((ex, i) => (
            <div key={i} className="p-4 inset-divider space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={ex.type}
                  onChange={(e) =>
                    setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, type: e.target.value as ExerciseType } : r)))
                  }
                  className="ios-input py-1.5 text-sm flex-1"
                >
                  {EXERCISE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => saveToBank([ex])}
                  aria-label="Save question to the bank"
                  title="Save to question bank"
                  className="p-1.5 cursor-pointer flex-shrink-0"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                >
                  <BookmarkPlus size={14} />
                </button>
                <button
                  onClick={() => setExercises((rows) => rows.filter((_, j) => j !== i))}
                  aria-label="Remove exercise"
                  className="p-1.5 cursor-pointer flex-shrink-0"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                value={ex.prompt}
                onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, prompt: e.target.value } : r)))}
                placeholder="Prompt"
                className="ios-input py-1.5 text-sm"
              />
              <input
                value={ex.answer}
                onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, answer: e.target.value } : r)))}
                placeholder="Correct answer"
                className="ios-input py-1.5 text-sm"
              />
              {ex.type === 'multiple-choice' && (
                <input
                  value={ex.optionsCsv}
                  onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, optionsCsv: e.target.value } : r)))}
                  placeholder="Options, comma-separated (include the correct answer)"
                  className="ios-input py-1.5 text-sm"
                />
              )}
              <input
                value={ex.hint}
                onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, hint: e.target.value } : r)))}
                placeholder="Hint (optional)"
                className="ios-input py-1.5 text-sm"
              />
              {kind === 'reading' && (
                <label className="flex items-center gap-2 text-xs text-secondary">
                  Answer is on page
                  <input
                    type="number"
                    min={1}
                    max={pages.length}
                    value={ex.page}
                    onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, page: e.target.value } : r)))}
                    placeholder="optional"
                    className="ios-input py-1 text-sm w-24"
                  />
                </label>
              )}
            </div>
          ))}
          <div className="p-3 flex flex-wrap gap-1">
            <Button variant="ghost" size="sm" onClick={() => setExercises((rows) => [...rows, blankExercise()])}>
              <Plus size={14} /> Add {kind === 'lesson' ? 'exercise' : 'question'}
            </Button>
            <Button variant="ghost" size="sm" onClick={openBankPicker}>
              <Library size={14} /> Add from bank
            </Button>
            <Button variant="ghost" size="sm" onClick={() => saveToBank(exercises)}>
              <BookmarkPlus size={14} /> Save all to bank
            </Button>
          </div>
          {bankNotice && <p className="px-4 pb-3 text-xs text-secondary">{bankNotice}</p>}
        </div>
      </section>
  );

  if (!loaded) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          to="/classes"
          className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> Classes
        </Link>
        <h1 className="text-3xl font-bold text-primary">{isEditing ? 'Edit Content' : 'New Content'}</h1>
      </div>

      <div className="inset-group">
        <div className="p-4 space-y-3">
          <div className="seg-control">
            {KINDS.map((k) => (
              <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className="seg-item capitalize text-[0.75rem] sm:text-[0.85rem] px-1">
                {k}
              </button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="ios-input py-2 text-sm" />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle (optional)"
            className="ios-input py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">XP reward</span>
            <input
              type="number"
              min={0}
              value={xpReward}
              onChange={(e) => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
              className="ios-input py-1.5 text-sm w-24"
            />
          </div>
          {kind === 'reading' && (
            <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer pt-1">
              <input type="checkbox" checked={gradable} onChange={(e) => setGradable(e.target.checked)} />
              Counts toward XP and grades
              <span className="text-xs text-muted">— uncheck for supplementary reading students just mark as read</span>
            </label>
          )}
        </div>
      </div>

      {kind === 'lesson' && (
        <section>
          <div className="section-label">Vocabulary</div>
          <div className="inset-group">
            {vocab.map((v, i) => (
              <div key={i} className="p-4 inset-divider grid grid-cols-3 gap-2 items-start">
                <input
                  value={v.french}
                  onChange={(e) => setVocab((rows) => rows.map((r, j) => (j === i ? { ...r, french: e.target.value } : r)))}
                  placeholder="French"
                  className="ios-input py-1.5 text-sm"
                />
                <input
                  value={v.english}
                  onChange={(e) => setVocab((rows) => rows.map((r, j) => (j === i ? { ...r, english: e.target.value } : r)))}
                  placeholder="English"
                  className="ios-input py-1.5 text-sm"
                />
                <div className="flex gap-1">
                  <input
                    value={v.pronunciation}
                    onChange={(e) => setVocab((rows) => rows.map((r, j) => (j === i ? { ...r, pronunciation: e.target.value } : r)))}
                    placeholder="Pronunciation"
                    className="ios-input py-1.5 text-sm flex-1"
                  />
                  <button
                    onClick={() => setVocab((rows) => rows.filter((_, j) => j !== i))}
                    aria-label="Remove vocab item"
                    className="p-1.5 cursor-pointer flex-shrink-0"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <div className="p-3 inset-divider">
              <Button variant="ghost" size="sm" onClick={() => setVocab((rows) => [...rows, blankVocab()])}>
                <Plus size={14} /> Add word
              </Button>
            </div>
          </div>
        </section>
      )}

      {kind === 'listening' && (
        <div>
          <ListeningEditor value={listening} onChange={setListening} onImportTitle={(t) => { if (!title.trim()) setTitle(t); }} />
        </div>
      )}

      {kind === 'writing' && (
        <div>
          <WritingEditor value={writing} onChange={setWriting} onImportTitle={(t) => { if (!title.trim()) setTitle(t); }} />
        </div>
      )}

      {(kind === 'lesson' || kind === 'quiz') && exercisesSection}

      {kind === 'reading' && (
        <section>
          <div className="flex items-center justify-between mb-1">
            <div className="section-label !mb-0">Pages</div>
            <button
              onClick={() => setPreviewOn((p) => !p)}
              className="text-xs font-medium flex items-center gap-1 cursor-pointer mr-1"
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)' }}
            >
              {previewOn ? <><Pencil size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
            </button>
          </div>
          <div className="mb-3">
            <MarkdownFormattingGuide />
          </div>
          <div className="space-y-3">
            {pages.map((pageText, i) => {
              const parsed = parseMarkdownPage(pageText);
              return (
                <div key={i} className="card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Page {i + 1}</span>
                    <button
                      onClick={() => setPages((rows) => rows.filter((_, j) => j !== i))}
                      aria-label="Remove page"
                      className="p-1.5 cursor-pointer flex-shrink-0"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                      disabled={pages.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {previewOn ? (
                    <div>
                      {parsed.title && <h3 className="font-display text-xl font-bold mb-2 text-primary">{parsed.title}</h3>}
                      <div className="prose-reading text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.body}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <MarkdownField
                      value={pageText}
                      onChange={(v) => setPages((rows) => rows.map((r, j) => (j === i ? v : r)))}
                      placeholder={'# Page title\n\nMarkdown content…'}
                      rows={8}
                    />
                  )}
                </div>
              );
            })}
            <Button variant="ghost" size="sm" onClick={() => setPages((rows) => [...rows, blankPage()])}>
              <Plus size={14} /> Add page
            </Button>
          </div>
        </section>
      )}

      {kind === 'reading' && (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            Optional. Students answer these after the last page, and the article is marked from their answers. Leave it empty
            to credit the reading itself. Unticked "counts toward XP and grades" still records answers but gives no score.
          </p>
          {exercisesSection}
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Question bank">
        <div className="space-y-3">
          {bank === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <BankQuestionList
              questions={bank}
              search={bankSearch}
              onSearchChange={setBankSearch}
              tag={bankTag}
              onTagChange={setBankTag}
              article={bankArticle}
              onArticleChange={setBankArticle}
              selected={bankSelected}
              onToggle={(id) =>
                setBankSelected((current) => {
                  const next = new Set(current);
                  if (!next.delete(id)) next.add(id);
                  return next;
                })
              }
            />
          )}
          <Button size="sm" className="w-full" onClick={addFromBank} disabled={bankSelected.size === 0}>
            Add {bankSelected.size || ''} selected
          </Button>
        </div>
      </Modal>

      <Button onClick={save} disabled={saving} className="w-full">
        <Save size={16} /> {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}
