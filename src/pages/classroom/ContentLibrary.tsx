import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FADE } from '../../utils/motion';
import { ChevronLeft, Plus, Pencil, Trash2, Copy, Send } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { dueDateInputToIso } from '../../utils/classroomDates';
import type { ClassInfo, ClassroomContent } from '../../types/classroom';

export function ContentLibrary() {
  const [content, setContent] = useState<ClassroomContent[] | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<ClassroomContent | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [chosenClasses, setChosenClasses] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('');
  const [assignResult, setAssignResult] = useState<string | null>(null);

  async function load() {
    const res = await classroomApi.get<{ content: ClassroomContent[] }>('/api/teacher/content');
    setContent(res.content);
  }

  useEffect(() => {
    load();
  }, []);

  async function openAssign(item: ClassroomContent) {
    setAssigning(item);
    setChosenClasses(new Set());
    setDueDate('');
    setMaxAttempts('');
    setAssignResult(null);
    const res = await classroomApi.get<{ classes: ClassInfo[] }>('/api/teacher/classes');
    setClasses(res.classes.filter((c) => !c.archived_at));
  }

  async function assign() {
    if (!assigning) return;
    const res = await classroomApi.post<{ created: string[]; skipped: string[] }>('/api/teacher/assignments/bulk', {
      contentId: assigning.id,
      classIds: [...chosenClasses],
      dueAt: dueDateInputToIso(dueDate),
      maxAttempts: maxAttempts ? Number(maxAttempts) : null,
    });
    const skipped = res.skipped.length ? `, ${res.skipped.length} already had it` : '';
    setAssignResult(`Assigned to ${res.created.length} ${res.created.length === 1 ? 'class' : 'classes'}${skipped}.`);
  }

  async function duplicate(id: string) {
    await classroomApi.post(`/api/teacher/content/${id}/duplicate`, {});
    await load();
  }

  async function remove(id: string) {
    await classroomApi.del(`/api/teacher/content/${id}`);
    setConfirmId(null);
    await load();
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
          <h1 className="text-3xl font-bold text-primary">Content Library</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link to="/classes/content/new">
            <Button size="sm">
              <Plus size={14} /> New
            </Button>
          </Link>
          <Link to="/classes/bank" className="text-xs text-muted hover:underline no-underline">
            Question bank
          </Link>
        </div>
      </div>

      <div className="inset-group">
        {content === null && <p className="p-4 text-sm text-muted">Loading…</p>}
        {content?.length === 0 && (
          <p className="p-4 text-sm text-muted">
            No lessons or quizzes yet — <Link to="/classes/content/new" style={{ color: 'var(--accent)' }}>create your first one</Link>.
          </p>
        )}
        {content?.map((c) => (
          <div key={c.id} className="inset-row justify-between items-start gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">{c.title}</p>
              <p className="text-xs text-muted capitalize">{c.kind}{c.subtitle ? ` · ${c.subtitle}` : ''}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openAssign(c)}
                aria-label="Assign to classes"
                title="Assign to classes"
                className="p-1.5 rounded-full cursor-pointer"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                <Send size={14} />
              </button>
              <button
                onClick={() => duplicate(c.id)}
                aria-label="Duplicate"
                title="Duplicate"
                className="p-1.5 rounded-full cursor-pointer"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                <Copy size={14} />
              </button>
              <Link
                to={`/classes/content/${c.id}/edit`}
                aria-label="Edit"
                className="p-1.5 rounded-full"
                style={{ color: 'var(--text-muted)' }}
              >
                <Pencil size={14} />
              </Link>
              <AnimatePresence mode="wait" initial={false}>
                {confirmId === c.id ? (
                  <motion.div
                    key="confirm"
                    {...FADE}
                    className="flex items-center gap-1"
                  >
                    <button
                      onClick={() => remove(c.id)}
                      className="chip cursor-pointer"
                      style={{ border: 'none', color: 'var(--danger)' }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-xs text-muted hover:underline cursor-pointer"
                      style={{ background: 'transparent', border: 'none' }}
                    >
                      Cancel
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="trigger"
                    {...FADE}
                    onClick={() => setConfirmId(c.id)}
                    aria-label="Delete"
                    className="p-1.5 rounded-full cursor-pointer"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!assigning} onClose={() => setAssigning(null)} title="Assign to classes">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">{assigning?.title}</p>
          {classes.length === 0 && <p className="text-sm text-muted">No active classes yet.</p>}
          {classes.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={chosenClasses.has(c.id)}
                onChange={() =>
                  setChosenClasses((current) => {
                    const next = new Set(current);
                    if (!next.delete(c.id)) next.add(c.id);
                    return next;
                  })
                }
              />
              {c.name}
            </label>
          ))}
          <label className="flex items-center gap-2 text-xs text-secondary">
            Due date (optional)
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="ios-input py-1 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-xs text-secondary">
            Attempts
            <select value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className="ios-input py-1 text-sm">
              <option value="">Unlimited</option>
              {[1, 2, 3, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {assignResult && <p className="text-xs text-secondary">{assignResult}</p>}
          <Button size="sm" className="w-full" onClick={assign} disabled={chosenClasses.size === 0 || !!assignResult}>
            Assign to {chosenClasses.size || ''} {chosenClasses.size === 1 ? 'class' : 'classes'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
