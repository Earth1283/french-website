import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
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

export function ContentEditor() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const isEditing = !!contentId;

  const [kind, setKind] = useState<'lesson' | 'quiz'>('lesson');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [xpReward, setXpReward] = useState(10);
  const [vocab, setVocab] = useState<VocabRow[]>([blankVocab()]);
  const [exercises, setExercises] = useState<ExerciseRow[]>([blankExercise()]);
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
    const cleanExercises = exercises.filter((e) => e.prompt.trim() && e.answer.trim()).map(toExercise);
    if (!title.trim() || cleanExercises.length === 0) {
      setError('A title and at least one complete exercise are required.');
      setSaving(false);
      return;
    }
    const body: ClassroomContentBody =
      kind === 'lesson'
        ? {
            kind: 'lesson',
            vocab: vocab.filter((v) => v.french.trim() && v.english.trim() && v.pronunciation.trim()),
            exercises: cleanExercises,
            xpReward,
          }
        : { kind: 'quiz', items: cleanExercises, xpReward };

    try {
      if (isEditing) {
        await classroomApi.put(`/api/teacher/content/${contentId}`, { title: title.trim(), subtitle: subtitle.trim(), body });
      } else {
        await classroomApi.post('/api/teacher/content', { title: title.trim(), subtitle: subtitle.trim(), body });
      }
      navigate(-1);
    } catch {
      setError('Could not save this content.');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/classes"
          className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> Classes
        </Link>
        <h1 className="text-3xl font-bold text-primary">{isEditing ? 'Edit Content' : 'New Content'}</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="inset-group">
        <div className="p-4 space-y-3">
          <div className="seg-control">
            {(['lesson', 'quiz'] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className="seg-item capitalize">
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
        </div>
      </motion.div>

      {kind === 'lesson' && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
        </motion.section>
      )}

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="section-label">{kind === 'lesson' ? 'Exercises' : 'Questions'}</div>
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
            </div>
          ))}
          <div className="p-3">
            <Button variant="ghost" size="sm" onClick={() => setExercises((rows) => [...rows, blankExercise()])}>
              <Plus size={14} /> Add {kind === 'lesson' ? 'exercise' : 'question'}
            </Button>
          </div>
        </div>
      </motion.section>

      {error && (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}

      <Button onClick={save} disabled={saving} className="w-full">
        <Save size={16} /> {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}
