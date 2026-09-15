import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Eye, Pencil } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classroomApi } from '../../services/classroom';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Controls';
import { MarkdownField } from '../../components/classroom/MarkdownField';
import { MarkdownFormattingGuide } from '../../components/classroom/MarkdownFormattingGuide';
import { parseMarkdownPage } from '../../utils/markdownPage';
import type { ExerciseType } from '../../types';
import type { ClassroomContent, ClassroomContentBody } from '../../types/classroom';

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
}

type ContentKind = 'lesson' | 'quiz' | 'reading';

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'translation', label: 'Translation' },
];

function blankExercise(): ExerciseRow {
  return { type: 'multiple-choice', prompt: '', answer: '', optionsCsv: '', hint: '' };
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
  const isEditing = !!contentId;

  const [kind, setKind] = useState<ContentKind>('lesson');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [xpReward, setXpReward] = useState(10);
  const [vocab, setVocab] = useState<VocabRow[]>([blankVocab()]);
  const [exercises, setExercises] = useState<ExerciseRow[]>([blankExercise()]);
  const [pages, setPages] = useState<string[]>([blankPage()]);
  const [gradable, setGradable] = useState(true);
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
          }))
        );
      } else if (body.kind === 'reading') {
        setPages(body.pages.length ? body.pages : [blankPage()]);
        setGradable(body.gradable);
      } else {
        setExercises(
          body.items.map((e) => ({
            type: e.type,
            prompt: e.prompt,
            answer: e.answer,
            optionsCsv: (e.options ?? []).join(', '),
            hint: e.hint ?? '',
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
    };
  }

  async function save() {
    setSaving(true);
    setError(null);

    let body: ClassroomContentBody;
    if (kind === 'reading') {
      const cleanPages = pages.map((p) => p.trim()).filter(Boolean);
      if (!title.trim() || cleanPages.length === 0) {
        setError('A title and at least one non-empty page are required.');
        setSaving(false);
        return;
      }
      body = { kind: 'reading', pages: cleanPages, xpReward, gradable };
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
      navigate('/classes/content');
    } catch {
      setError('Could not save this content.');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <div className="page text-center text-ink-3 py-16">Loading…</div>;
  }

  return (
    <div className="page page--narrow">
      <ButtonLink
        to="/classes"
        variant="quiet"
        className="-ml-1.5 mb-2"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </ButtonLink>
      <h1 className="h-page">{isEditing ? 'Edit content' : 'New content'}</h1>

      <div className="sheet p-4 mt-6">
        <div className="space-y-3">
          <Tabs
            items={[
              { value: 'lesson', label: 'Lesson' },
              { value: 'quiz', label: 'Quiz' },
              { value: 'reading', label: 'Reading' }
            ]}
            value={kind}
            onChange={(v) => setKind(v as ContentKind)}
            label="Content type"
          />
          <div>
            <label className="field-label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="field" />
          </div>
          <div>
            <label className="field-label">Subtitle</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle (optional)"
              className="field"
            />
          </div>
          <div>
            <label className="field-label">XP reward</label>
            <input
              type="number"
              min={0}
              value={xpReward}
              onChange={(e) => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
              className="field w-24"
            />
          </div>
          {kind === 'reading' && (
            <label className="flex items-center gap-2 t-small text-ink cursor-pointer pt-1">
              <input type="checkbox" checked={gradable} onChange={(e) => setGradable(e.target.checked)} />
              Counts toward XP and grades
              <span className="text-ink-3">— uncheck for supplementary reading students just mark as read</span>
            </label>
          )}
        </div>
      </div>

      {kind === 'lesson' && (
        <section className="mt-6">
          <h2 className="h-section">Vocabulary</h2>
          <div className="sheet p-4">
            {vocab.map((v, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 items-start pb-3 mb-3 border-b border-rule last:border-0 last:pb-0 last:mb-0">
                <div>
                  <label className="field-label">French</label>
                  <input
                    value={v.french}
                    onChange={(e) => setVocab((rows) => rows.map((r, j) => (j === i ? { ...r, french: e.target.value } : r)))}
                    placeholder="French"
                    className="field text-14"
                  />
                </div>
                <div>
                  <label className="field-label">English</label>
                  <input
                    value={v.english}
                    onChange={(e) => setVocab((rows) => rows.map((r, j) => (j === i ? { ...r, english: e.target.value } : r)))}
                    placeholder="English"
                    className="field text-14"
                  />
                </div>
                <div>
                  <label className="field-label">Pronunciation</label>
                  <div className="flex gap-1">
                    <input
                      value={v.pronunciation}
                      onChange={(e) => setVocab((rows) => rows.map((r, j) => (j === i ? { ...r, pronunciation: e.target.value } : r)))}
                      placeholder="Pronunciation"
                      className="field text-14 flex-1"
                    />
                    <button
                      onClick={() => setVocab((rows) => rows.filter((_, j) => j !== i))}
                      aria-label="Remove vocab item"
                      className="btn btn--quiet btn--sm"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="quiet" size="sm" onClick={() => setVocab((rows) => [...rows, blankVocab()])} className="mt-3">
              <Plus size={14} /> Add word
            </Button>
          </div>
        </section>
      )}

      {kind !== 'reading' && (
        <section className="mt-6">
          <h2 className="h-section">{kind === 'lesson' ? 'Exercises' : 'Questions'}</h2>
          <div className="sheet p-4">
            {exercises.map((ex, i) => (
              <div key={i} className="pb-4 mb-4 border-b border-rule last:border-0 last:pb-0 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={ex.type}
                    onChange={(e) =>
                      setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, type: e.target.value as ExerciseType } : r)))
                    }
                    className="field flex-1"
                  >
                    {EXERCISE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setExercises((rows) => rows.filter((_, j) => j !== i))}
                    aria-label="Remove exercise"
                    className="btn btn--quiet btn--sm"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="field-label">Prompt</label>
                    <input
                      value={ex.prompt}
                      onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, prompt: e.target.value } : r)))}
                      placeholder="Prompt"
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="field-label">Correct answer</label>
                    <input
                      value={ex.answer}
                      onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, answer: e.target.value } : r)))}
                      placeholder="Correct answer"
                      className="field"
                    />
                  </div>
                  {ex.type === 'multiple-choice' && (
                    <div>
                      <label className="field-label">Options</label>
                      <input
                        value={ex.optionsCsv}
                        onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, optionsCsv: e.target.value } : r)))}
                        placeholder="Options, comma-separated (include the correct answer)"
                        className="field"
                      />
                    </div>
                  )}
                  <div>
                    <label className="field-label">Hint</label>
                    <input
                      value={ex.hint}
                      onChange={(e) => setExercises((rows) => rows.map((r, j) => (j === i ? { ...r, hint: e.target.value } : r)))}
                      placeholder="Hint (optional)"
                      className="field"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="quiet" size="sm" onClick={() => setExercises((rows) => [...rows, blankExercise()])} className="mt-3">
              <Plus size={14} /> Add {kind === 'lesson' ? 'exercise' : 'question'}
            </Button>
          </div>
        </section>
      )}

      {kind === 'reading' && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="h-section">Pages</h2>
            <button
              onClick={() => setPreviewOn((p) => !p)}
              className="t-small text-enamel-text hover:underline"
            >
              {previewOn ? <>Edit</> : <>Preview</>}
            </button>
          </div>
          <div className="mb-6">
            <MarkdownFormattingGuide />
          </div>
          <div className="space-y-4">
            {pages.map((pageText, i) => {
              const parsed = parseMarkdownPage(pageText);
              return (
                <div key={i} className="sheet p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="t-micro text-ink-2">Page {i + 1}</span>
                    <button
                      onClick={() => setPages((rows) => rows.filter((_, j) => j !== i))}
                      aria-label="Remove page"
                      className="btn btn--quiet btn--sm"
                      disabled={pages.length === 1}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                  {previewOn ? (
                    <div>
                      {parsed.title && <h3 className="text-21 font-semibold text-ink mb-2">{parsed.title}</h3>}
                      <div className="prose-reading">
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
            <Button variant="quiet" size="sm" onClick={() => setPages((rows) => [...rows, blankPage()])}>
              <Plus size={14} /> Add page
            </Button>
          </div>
        </section>
      )}

      {error && (
        <p className="t-small text-signal-text mt-6">
          {error}
        </p>
      )}

      <Button onClick={save} disabled={saving} className="w-full mt-6" variant="primary">
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}
