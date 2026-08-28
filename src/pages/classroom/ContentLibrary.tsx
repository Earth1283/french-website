import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import type { ClassroomContent } from '../../types/classroom';

export function ContentLibrary() {
  const [content, setContent] = useState<ClassroomContent[] | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function load() {
    const res = await classroomApi.get<{ content: ClassroomContent[] }>('/api/teacher/content');
    setContent(res.content);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    await classroomApi.del(`/api/teacher/content/${id}`);
    setConfirmId(null);
    await load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
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
        <Link to="/classes/content/new">
          <Button size="sm">
            <Plus size={14} /> New
          </Button>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="inset-group">
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
      </motion.div>
    </div>
  );
}
