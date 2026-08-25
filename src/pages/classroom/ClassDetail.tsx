import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Check, RefreshCw, Plus, Trash2, BookOpen, BarChart3, Flag } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import type { AssignmentInfo, ClassInfo, ClassroomContent, RosterStudent } from '../../types/classroom';

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [roster, setRoster] = useState<RosterStudent[] | null>(null);
  const [assignments, setAssignments] = useState<AssignmentInfo[] | null>(null);
  const [content, setContent] = useState<ClassroomContent[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function load() {
    if (!classId) return;
    const [classesRes, rosterRes, assignmentsRes, contentRes] = await Promise.all([
      classroomApi.get<{ classes: ClassInfo[] }>('/api/teacher/classes'),
      classroomApi.get<{ roster: RosterStudent[] }>(`/api/teacher/classes/${classId}/roster`),
      classroomApi.get<{ assignments: AssignmentInfo[] }>(`/api/teacher/classes/${classId}/assignments`),
      classroomApi.get<{ content: ClassroomContent[] }>('/api/teacher/content'),
    ]);
    setCls(classesRes.classes.find((c) => c.id === classId) ?? null);
    setRoster(rosterRes.roster);
    setAssignments(assignmentsRes.assignments);
    setContent(contentRes.content);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function rotateCode() {
    if (!classId) return;
    await classroomApi.post(`/api/teacher/classes/${classId}/rotate-join-code`);
    await load();
  }

  async function copyJoinCode() {
    if (!cls) return;
    await navigator.clipboard.writeText(cls.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function assignContent(contentId: string) {
    if (!classId) return;
    await classroomApi.post(`/api/teacher/classes/${classId}/assignments`, { contentId });
    setPickerOpen(false);
    await load();
  }

  async function removeAssignment(assignmentId: string) {
    await classroomApi.del(`/api/teacher/assignments/${assignmentId}`);
    await load();
  }

  const assignedContentIds = new Set(assignments?.map((a) => a.content_id));
  const availableToAssign = content?.filter((c) => !assignedContentIds.has(c.id)) ?? [];

  if (!cls) {
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
        <h1 className="text-3xl font-bold text-primary">{cls.name}</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Join code — share with students</p>
        <div className="flex items-center gap-2">
          <span
            className="flex-1 text-center text-xl font-mono font-bold tracking-widest py-3"
            style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
          >
            {cls.join_code}
          </span>
          <Button variant="tinted" size="sm" onClick={copyJoinCode}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <button
          onClick={rotateCode}
          className="text-xs text-muted hover:underline cursor-pointer mt-2.5 flex items-center gap-1"
          style={{ background: 'transparent', border: 'none' }}
        >
          <RefreshCw size={11} /> Generate a new code (invalidates the old one)
        </button>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-label">Assignments</div>
        <div className="inset-group">
          {assignments?.length === 0 && (
            <p className="p-4 text-sm text-muted">Nothing assigned yet.</p>
          )}
          {assignments?.map((a) => (
            <div key={a.id} className="inset-row justify-between">
              <Link to={`/classes/${classId}/assignments/${a.id}/results`} className="flex items-center gap-2.5 no-underline">
                <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <p className="text-sm font-semibold text-primary">{a.title}</p>
                  <p className="text-xs text-muted capitalize">{a.kind}</p>
                </div>
                {!!a.unresolvedFlagCount && (
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}
                  >
                    <Flag size={10} /> {a.unresolvedFlagCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  to={`/classes/${classId}/assignments/${a.id}/results`}
                  aria-label="View results"
                  className="p-1.5 rounded-full"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <BarChart3 size={14} />
                </Link>
                <button
                  onClick={() => removeAssignment(a.id)}
                  aria-label="Remove assignment"
                  className="p-1.5 rounded-full cursor-pointer"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="p-4 inset-divider space-y-3">
            {!pickerOpen ? (
              <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                <Plus size={14} /> Assign content
              </Button>
            ) : availableToAssign.length === 0 ? (
              <p className="text-xs text-muted">
                No unassigned content yet.{' '}
                <Link to="/classes/content/new" style={{ color: 'var(--accent)' }}>
                  Create a lesson or quiz
                </Link>{' '}
                first.
              </p>
            ) : (
              <div className="space-y-1.5">
                {availableToAssign.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => assignContent(c.id)}
                    className="w-full text-left p-2.5 text-sm cursor-pointer ios-press"
                    style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline)', background: 'var(--bg-card)' }}
                  >
                    {c.title} <span className="text-xs text-muted capitalize">· {c.kind}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="section-label">Roster</div>
        <div className="inset-group">
          {roster?.length === 0 && <p className="p-4 text-sm text-muted">No students enrolled yet.</p>}
          {roster?.map((s) => (
            <div key={s.id} className="inset-row justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">{s.name}</p>
                <p className="text-xs text-muted">{s.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  {s.completedAssignments}/{s.totalAssignments}
                </p>
                <p className="text-xs text-muted">{Math.round(s.averageScore)}% avg</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
