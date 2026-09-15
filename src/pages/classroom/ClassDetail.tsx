import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, BarChart3, Check, ChevronLeft, ChevronRight, Ellipsis, Flag, KeyRound, Plus, Trash2 } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { JoinTicket } from '../../components/classroom/JoinTicket';
import { Meter } from '../../components/ui/Meter';
import { Button, ButtonLink } from '../../components/ui/Button';
import type { AssignmentInfo, ClassInfo, ClassroomContent, RosterStudent } from '../../types/classroom';

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [roster, setRoster] = useState<RosterStudent[] | null>(null);
  const [assignments, setAssignments] = useState<AssignmentInfo[] | null>(null);
  const [content, setContent] = useState<ClassroomContent[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [resetPasswordFor, setResetPasswordFor] = useState<string | null>(null);
  const [newPasswordDraft, setNewPasswordDraft] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccessFor, setResetSuccessFor] = useState<string | null>(null);

  async function load() {
    if (!classId) return;
    const [classesRes, rosterRes, assignmentsRes, contentRes] = await Promise.all([
      classroomApi.get<{ classes: ClassInfo[] }>('/api/teacher/classes'),
      classroomApi.get<{ roster: RosterStudent[] }>(`/api/teacher/classes/${classId}/roster`),
      classroomApi.get<{ assignments: AssignmentInfo[] }>(`/api/teacher/classes/${classId}/assignments`),
      classroomApi.get<{ content: ClassroomContent[] }>('/api/teacher/content'),
    ]);
    setCls(classesRes.classes.find((item) => item.id === classId) ?? null);
    setRoster(rosterRes.roster);
    setAssignments(assignmentsRes.assignments);
    setContent(contentRes.content);
  }

  useEffect(() => { load(); }, [classId]);

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

  async function resetStudentPassword(studentId: string) {
    if (!classId || newPasswordDraft.trim().length < 8) return;
    setResetSubmitting(true);
    try {
      await classroomApi.post(`/api/teacher/classes/${classId}/students/${studentId}/reset-password`, { newPassword: newPasswordDraft.trim() });
      setResetPasswordFor(null);
      setNewPasswordDraft('');
      setResetSuccessFor(studentId);
      window.setTimeout(() => setResetSuccessFor(null), 4000);
    } finally {
      setResetSubmitting(false);
    }
  }

  async function setArchived(archived: boolean) {
    if (!classId) return;
    await classroomApi.patch(`/api/teacher/classes/${classId}`, { archived });
    setConfirmArchive(false);
    await load();
  }

  const assignedIds = new Set(assignments?.map((item) => item.content_id));
  const available = content?.filter((item) => !assignedIds.has(item.id)) ?? [];

  if (!cls) return <div className="page text-center text-ink-3 py-16">Loading…</div>;

  return (
    <div className="page">
      <ButtonLink to="/classes" variant="quiet" size="sm" className="-ml-2 mb-2"><ChevronLeft size={18} /> Classes</ButtonLink>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="h-page">{cls.name}</h1>
        <Button onClick={() => setPickerOpen(true)}><Plus size={16} /> Assign content</Button>
      </header>

      {cls.archived_at && (
        <div className="sheet p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="t-small text-ink-2 inline-flex items-center gap-2"><Archive size={16} /> This class is archived — students can no longer join.</p>
          <Button variant="secondary" size="sm" onClick={() => setArchived(false)}><ArchiveRestore size={16} /> Unarchive</Button>
        </div>
      )}

      <div className="class-grid">
        <aside className="class-side">
          <JoinTicket code={cls.join_code} onRotate={async () => { if (classId) { await classroomApi.post(`/api/teacher/classes/${classId}/rotate-join-code`); await load(); } }} />

          <section className="sheet" aria-labelledby="assignments-title">
            <div className="panel__head"><h2 id="assignments-title" className="h-section">Assignments</h2><span className="t-small text-ink-3">{assignments?.length ?? 0}</span></div>
            {assignments?.length === 0 && <p className="p-4 border-t border-rule t-small text-ink-3">Nothing assigned yet.</p>}
            {assignments?.map((assignment) => (
              <div key={assignment.id} className="asg">
                <Link to={`/classes/${classId}/assignments/${assignment.id}/results`} className="contents">
                  <span className="asg__title">{assignment.title}</span>
                  <span className="asg__meta capitalize">{assignment.kind}</span>
                </Link>
                <span className="asg__end">
                  {!!assignment.unresolvedFlagCount && <span className="flagcount"><Flag size={13} />{assignment.unresolvedFlagCount}</span>}
                  <Link to={`/classes/${classId}/assignments/${assignment.id}/results`} aria-label={`View results for ${assignment.title}`}><BarChart3 size={16} /></Link>
                  <button type="button" onClick={() => removeAssignment(assignment.id)} aria-label={`Remove ${assignment.title}`}><Trash2 size={16} /></button>
                </span>
              </div>
            ))}
            {pickerOpen && <div className="panel__foot">
              {pickerOpen && (
                <div className="space-y-2 mb-3">
                  {available.length === 0 ? <p className="t-small text-ink-3">No unassigned content. <Link to="/classes/content/new" className="text-enamel-text underline">Create content</Link> first.</p> : available.map((item) => (
                    <button key={item.id} type="button" onClick={() => assignContent(item.id)} className="field w-full text-left">
                      <span className="font-semibold">{item.title}</span> <span className="t-small text-ink-3 capitalize">· {item.kind}</span>
                    </button>
                  ))}
                  <Button variant="quiet" size="sm" onClick={() => setPickerOpen(false)}>Cancel</Button>
                </div>
              )}
            </div>}
          </section>

          {!cls.archived_at && (
            <div>
              {!confirmArchive ? <Button variant="quiet" size="sm" onClick={() => setConfirmArchive(true)}><Archive size={16} /> Archive this class</Button> : (
                <div className="sheet p-4 space-y-3"><p className="t-small text-ink-2">Archiving stops new students joining. Existing work is kept.</p><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setConfirmArchive(false)}>Cancel</Button><Button variant="danger" size="sm" onClick={() => setArchived(true)}>Archive</Button></div></div>
              )}
            </div>
          )}
        </aside>

        <section className="sheet" aria-labelledby="roster-title">
          <div className="panel__head"><h2 id="roster-title" className="h-section">Roster</h2><span className="t-small text-ink-3">{roster?.length ?? 0} students</span></div>
          {roster?.length === 0 && <p className="p-4 border-t border-rule t-small text-ink-3">No students enrolled yet.</p>}
          {!!roster?.length && (
            <div className="ledger-wrap"><table className="ledger"><thead><tr><th>Name</th><th>Email</th><th className="n">Assignments done</th><th className="n">Average score</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
              {roster.map((student) => (
                <tr key={student.id}>
                  <td className="who">{student.name}{resetSuccessFor === student.id && <span className="block text-go font-normal"><Check size={12} className="inline" /> Password reset</span>}</td>
                  <td className="mail">{student.email}</td>
                  <td className="n">{student.completedAssignments} / {student.totalAssignments}</td>
                  <td className="n">{Math.round(student.averageScore)}% <Meter percent={student.averageScore} label={`${Math.round(student.averageScore)} percent average`} /></td>
                  <td>
                    <button type="button" className="rowmenu" aria-label={`Reset password for ${student.name}`} onClick={() => { setResetPasswordFor(student.id); setNewPasswordDraft(''); }}><KeyRound size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody></table></div>
          )}
          {resetPasswordFor && (
            <div className="panel__foot">
              <label className="field-label" htmlFor="student-password">New password</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input id="student-password" type="password" value={newPasswordDraft} onChange={(e) => setNewPasswordDraft(e.target.value)} placeholder="New password (min. 8 characters)" className="field flex-1" />
                <Button variant="secondary" size="sm" onClick={() => resetStudentPassword(resetPasswordFor)} disabled={resetSubmitting || newPasswordDraft.trim().length < 8}>Set password</Button>
                <Button variant="quiet" size="sm" onClick={() => setResetPasswordFor(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
