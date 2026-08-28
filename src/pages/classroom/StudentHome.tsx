import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, UserPlus, CheckCircle2, Circle, ChevronRight, ShieldQuestion, KeyRound } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ClassroomPrivacyNotice } from '../../components/classroom/ClassroomPrivacyNotice';
import type { AssignmentInfo, ClassInfo } from '../../types/classroom';

interface ClassWithAssignments extends ClassInfo {
  assignments: AssignmentInfo[];
}

export function StudentHome() {
  const { profile, disconnect } = useClassroomStore();
  const [classes, setClasses] = useState<ClassWithAssignments[] | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  async function load() {
    const res = await classroomApi.get<{ classes: ClassInfo[] }>('/api/student/classes');
    const withAssignments = await Promise.all(
      res.classes.map(async (c) => {
        const a = await classroomApi.get<{ assignments: AssignmentInfo[] }>(`/api/student/classes/${c.id}/assignments`);
        return { ...c, assignments: a.assignments };
      })
    );
    setClasses(withAssignments);
  }

  useEffect(() => {
    load().catch(() => setError('Could not load your classes.'));
  }, []);

  async function join() {
    if (!joinCode.trim()) return;
    setJoining(true);
    setError(null);
    try {
      await classroomApi.post('/api/student/enroll', { joinCode: joinCode.trim().toUpperCase() });
      setJoinCode('');
      await load();
    } catch (err) {
      setError(err instanceof ClassroomApiError ? err.message : 'Could not join that class.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">My Classes</h1>
          <p className="text-secondary text-sm">{profile?.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={() => setPrivacyOpen(true)}
            className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
            style={{ background: 'transparent', border: 'none' }}
          >
            <ShieldQuestion size={12} /> What does my teacher see?
          </button>
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

      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Your Data">
        <ClassroomPrivacyNotice />
      </Modal>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-4">
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && join()}
            placeholder="Join code, e.g. GEZ6-4F4T"
            className="ios-input py-2 text-sm flex-1 font-mono uppercase"
          />
          <Button onClick={join} disabled={joining || !joinCode.trim()}>
            <UserPlus size={15} /> Join
          </Button>
        </div>
        {error && (
          <p className="text-xs mt-2" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
      </motion.div>

      {classes === null && <p className="text-sm text-muted text-center py-8">Loading…</p>}
      {classes?.length === 0 && (
        <p className="text-sm text-muted text-center py-8">Not enrolled in any classes yet — join one above.</p>
      )}

      {classes?.map((cls, i) => (
        <motion.section key={cls.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
          <div className="section-label">{cls.name}</div>
          <div className="inset-group">
            {cls.assignments.length === 0 && <p className="p-4 text-sm text-muted">Nothing assigned yet.</p>}
            {cls.assignments.map((a) => (
              <Link
                key={a.id}
                to={`/classes/assignment/${a.id}`}
                className="inset-row justify-between no-underline"
              >
                <div className="flex items-center gap-2.5">
                  {a.completed ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  ) : (
                    <Circle size={16} style={{ color: 'var(--text-muted)' }} />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-primary">{a.title}</p>
                    <p className="text-xs text-muted capitalize">
                      {a.kind}
                      {a.completed ? ` · ${a.score}%` : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
