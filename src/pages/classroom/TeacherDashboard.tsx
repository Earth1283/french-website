import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Users, LogOut, ChevronRight } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import type { ClassInfo } from '../../types/classroom';

export function TeacherDashboard() {
  const { profile, disconnect } = useClassroomStore();
  const [classes, setClasses] = useState<ClassInfo[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Your Classes</h1>
          <p className="text-secondary text-sm">{profile?.name}</p>
        </div>
        <button
          onClick={disconnect}
          className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
          style={{ background: 'transparent', border: 'none' }}
        >
          <LogOut size={12} /> Log out
        </button>
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
        {classes?.map((cls, i) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
          >
            <Link
              to={`/classes/${cls.id}`}
              className="card p-4 flex items-center justify-between no-underline ios-press"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-tint)' }}
                >
                  <Users size={16} style={{ color: 'var(--accent)' }} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary">{cls.name}</p>
                  <p className="text-xs text-muted mt-0.5 font-mono">{cls.join_code}</p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
