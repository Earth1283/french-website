import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, LogOut, ChevronRight, ChevronDown, BookOpen, Archive, KeyRound } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import type { ClassInfo } from '../../types/classroom';

function ClassRow({ cls, index }: { cls: ClassInfo; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
      <Link to={`/classes/${cls.id}`} className="card p-4 flex items-center justify-between no-underline ios-press">
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cls.archived_at ? 'var(--bg-inset)' : 'var(--accent-tint)' }}
          >
            <Users size={16} style={{ color: cls.archived_at ? 'var(--text-muted)' : 'var(--accent)' }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">{cls.name}</p>
            <p className="text-xs text-muted mt-0.5 font-mono">{cls.join_code}</p>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
      </Link>
    </motion.div>
  );
}

export function TeacherDashboard() {
  const { profile, disconnect } = useClassroomStore();
  const [classes, setClasses] = useState<ClassInfo[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  async function load() {
    const res = await classroomApi.get<{ classes: ClassInfo[] }>('/api/teacher/classes');
    setClasses(res.classes);
  }

  useEffect(() => {
    load().catch(() => setError('Could not load your classes.'));
  }, []);

  async function createClass() {
    if (!nameDraft.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await classroomApi.post('/api/teacher/classes', { name: nameDraft.trim() });
      setNameDraft('');
      await load();
    } catch {
      setError('Could not create the class.');
    } finally {
      setCreating(false);
    }
  }

  const active = classes?.filter((c) => !c.archived_at) ?? [];
  const archived = classes?.filter((c) => c.archived_at) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Your Classes</h1>
          <p className="text-secondary text-sm">{profile?.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Link
            to="/classes/content"
            className="text-xs text-muted hover:underline flex items-center gap-1 no-underline"
          >
            <BookOpen size={12} /> Content library
          </Link>
          <Link to="/classes/account" className="text-xs text-muted hover:underline flex items-center gap-1 no-underline">
            <KeyRound size={12} /> Account
          </Link>
          <button
            onClick={disconnect}
            className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
            style={{ background: 'transparent', border: 'none' }}
          >
            <LogOut size={12} /> Log out
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-4">
        <div className="flex gap-2">
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createClass()}
            placeholder="New class name, e.g. Period 1"
            className="ios-input py-2 text-sm flex-1"
          />
          <Button onClick={createClass} disabled={creating || !nameDraft.trim()}>
            <Plus size={15} /> Create
          </Button>
        </div>
        {error && (
          <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
      </motion.div>

      <div className="space-y-2.5">
        {classes === null && <p className="text-sm text-muted text-center py-8">Loading…</p>}
        {classes?.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No classes yet — create your first one above.</p>
        )}
        {active.map((cls, i) => (
          <ClassRow key={cls.id} cls={cls} index={i} />
        ))}
      </div>

      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
            style={{ background: 'transparent', border: 'none' }}
          >
            <Archive size={12} />
            {showArchived ? 'Hide' : 'Show'} {archived.length} archived {archived.length === 1 ? 'class' : 'classes'}
            <ChevronDown size={12} style={{ transform: showArchived ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          <AnimatePresence>
            {showArchived && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2.5 pt-2.5">
                  {archived.map((cls, i) => (
                    <ClassRow key={cls.id} cls={cls} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
