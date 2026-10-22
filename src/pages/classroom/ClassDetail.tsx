import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Archive,
  ArchiveRestore,
  KeyRound,
  Pencil,
  UserMinus,
  Download,
} from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { AnnouncementsManager } from '../../components/classroom/AnnouncementsManager';
import { ClassOverview } from '../../components/classroom/ClassOverview';
import { TeacherAssignmentRow } from '../../components/classroom/TeacherAssignmentRow';
import { ATTENTION_LABEL, attentionReason, describeLastActive, dueDateInputToIso } from '../../utils/classroomDates';
import { buildGradebookCsv } from '../../utils/gradebookCsv';
import type {
  AssignmentInfo,
  ClassInfo,
  ClassroomContent,
  GradebookResponse,
  RosterStudent,
} from '../../types/classroom';

function downloadTextFile(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [roster, setRoster] = useState<RosterStudent[] | null>(null);
  const [assignments, setAssignments] = useState<AssignmentInfo[] | null>(null);
  const [content, setContent] = useState<ClassroomContent[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [resetPasswordFor, setResetPasswordFor] = useState<string | null>(null);
  const [newPasswordDraft, setNewPasswordDraft] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccessFor, setResetSuccessFor] = useState<string | null>(null);
  const [removeStudentFor, setRemoveStudentFor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [pendingDueDate, setPendingDueDate] = useState('');

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
    await classroomApi.post(`/api/teacher/classes/${classId}/assignments`, {
      contentId,
      dueAt: dueDateInputToIso(pendingDueDate),
    });
    setPickerOpen(false);
    setPendingDueDate('');
    await load();
  }

  async function updateAssignment(assignmentId: string, fields: { dueAt?: string | null; visible?: boolean }) {
    await classroomApi.patch(`/api/teacher/assignments/${assignmentId}`, fields);
    await load();
  }

  async function removeAssignment(assignmentId: string) {
    await classroomApi.del(`/api/teacher/assignments/${assignmentId}`);
    await load();
  }

  async function removeStudent(studentId: string) {
    if (!classId) return;
    await classroomApi.del(`/api/teacher/classes/${classId}/students/${studentId}`);
    setRemoveStudentFor(null);
    await load();
  }

  async function saveClassName() {
    if (!classId || !nameDraft.trim()) return;
    await classroomApi.patch(`/api/teacher/classes/${classId}`, { name: nameDraft.trim() });
    setRenaming(false);
    await load();
  }

  async function exportGradebook() {
    if (!classId || !cls) return;
    const gradebook = await classroomApi.get<GradebookResponse>(`/api/teacher/classes/${classId}/gradebook`);
    const filenameStem = cls.name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'class';
    downloadTextFile(`${filenameStem}-gradebook.csv`, buildGradebookCsv(gradebook));
  }

  async function resetStudentPassword(studentId: string) {
    if (!classId || newPasswordDraft.trim().length < 8) return;
    setResetSubmitting(true);
    try {
      await classroomApi.post(`/api/teacher/classes/${classId}/students/${studentId}/reset-password`, {
        newPassword: newPasswordDraft.trim(),
      });
      setResetPasswordFor(null);
      setNewPasswordDraft('');
      setResetSuccessFor(studentId);
      setTimeout(() => setResetSuccessFor(null), 4000);
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

  const assignedContentIds = new Set(assignments?.map((a) => a.content_id));
  const availableToAssign = content?.filter((c) => !assignedContentIds.has(c.id)) ?? [];

  if (!cls) {
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
        {renaming ? (
          <div className="flex gap-2">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveClassName();
                if (e.key === 'Escape') setRenaming(false);
              }}
              aria-label="Class name"
              maxLength={120}
              autoFocus
              className="ios-input py-2 text-lg font-bold flex-1"
            />
            <Button size="sm" onClick={saveClassName} disabled={!nameDraft.trim()}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-primary">{cls.name}</h1>
            <button
              onClick={() => {
                setNameDraft(cls.name);
                setRenaming(true);
              }}
              aria-label="Rename class"
              className="p-1.5 rounded-full cursor-pointer"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>

      <ClassOverview roster={roster ?? []} assignmentCount={assignments?.length ?? 0} />

      {classId && <AnnouncementsManager classId={classId} />}

      {cls.archived_at && (
        <div
          className="flex items-center justify-between gap-3 p-3.5"
          style={{
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-inset)',
            border: '1px solid var(--hairline)',
          }}
        >
          <p className="text-xs text-muted flex items-center gap-2">
            <Archive size={13} /> This class is archived — students can no longer join with its code.
          </p>
          <button onClick={() => setArchived(false)} className="chip cursor-pointer flex-shrink-0" style={{ border: 'none' }}>
            <ArchiveRestore size={11} /> Unarchive
          </button>
        </div>
      )}

      <div className="card p-5">
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
      </div>

      <section>
        <div className="section-label">Assignments</div>
        <div className="inset-group">
          {assignments?.length === 0 && (
            <p className="p-4 text-sm text-muted">Nothing assigned yet.</p>
          )}
          {assignments?.map((a) => (
            <TeacherAssignmentRow
              key={a.id}
              classId={cls.id}
              assignment={a}
              onChange={(fields) => updateAssignment(a.id, fields)}
              onRemove={() => removeAssignment(a.id)}
            />
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
                <label className="flex items-center gap-2 text-xs text-secondary">
                  Due date (optional)
                  <input
                    type="date"
                    value={pendingDueDate}
                    onChange={(e) => setPendingDueDate(e.target.value)}
                    className="ios-input py-1 text-sm"
                  />
                </label>
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
      </section>

      <section>
        <div className="flex items-end justify-between">
          <div className="section-label">Roster</div>
          {!!roster?.length && !!assignments?.length && (
            <button
              onClick={exportGradebook}
              className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1 mb-1"
              style={{ background: 'transparent', border: 'none' }}
            >
              <Download size={11} /> Export gradebook (CSV)
            </button>
          )}
        </div>
        <div className="inset-group">
          {roster?.length === 0 && <p className="p-4 text-sm text-muted">No students enrolled yet.</p>}
          {roster?.map((s) => (
            <div key={s.id} className="inset-divider">
              <div className="inset-row justify-between" style={{ borderTop: 'none' }}>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {s.name}
                    {attentionReason(s) && (
                      <span className="ml-2 text-xs font-medium" style={{ color: 'var(--danger)' }}>
                        {ATTENTION_LABEL[attentionReason(s)!]}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">{s.email}</p>
                  <p className="text-xs text-muted">
                    {describeLastActive(s.lastActiveAt)}
                    {s.awaitingReview > 0 && ` · ${s.awaitingReview} to review`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {s.completedAssignments}/{s.totalAssignments}
                  </p>
                  <p className="text-xs text-muted">{Math.round(s.averageScore)}% avg</p>
                </div>
              </div>

              <div className="px-4 pb-3 -mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {removeStudentFor === s.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <p className="text-xs text-primary flex-1">
                      Remove {s.name.split(' ')[0]} and delete their results in this class?
                    </p>
                    <button
                      onClick={() => removeStudent(s.id)}
                      className="chip cursor-pointer flex-shrink-0"
                      style={{ border: 'none', color: 'var(--danger)' }}
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => setRemoveStudentFor(null)}
                      className="text-xs text-muted hover:underline cursor-pointer flex-shrink-0"
                      style={{ background: 'transparent', border: 'none' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRemoveStudentFor(s.id)}
                    className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    <UserMinus size={11} /> Remove from class
                  </button>
                )}
                {resetSuccessFor === s.id ? (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--success)' }}>
                    <Check size={11} /> Password reset — let {s.name.split(' ')[0]} know their new password.
                  </p>
                ) : resetPasswordFor === s.id ? (
                  <div className="flex gap-2">
                    <input
                      value={newPasswordDraft}
                      onChange={(e) => setNewPasswordDraft(e.target.value)}
                      placeholder="New password (min. 8 characters)"
                      className="ios-input py-1.5 text-sm flex-1"
                    />
                    <button
                      onClick={() => resetStudentPassword(s.id)}
                      disabled={resetSubmitting || newPasswordDraft.trim().length < 8}
                      className="chip cursor-pointer flex-shrink-0"
                      style={{ border: 'none' }}
                    >
                      Set
                    </button>
                    <button
                      onClick={() => { setResetPasswordFor(null); setNewPasswordDraft(''); }}
                      className="text-xs text-muted hover:underline cursor-pointer flex-shrink-0"
                      style={{ background: 'transparent', border: 'none' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetPasswordFor(s.id)}
                    className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    <KeyRound size={11} /> Reset password
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {!cls.archived_at && (
        <section>
          {!confirmArchive ? (
            <button
              onClick={() => setConfirmArchive(true)}
              className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
              style={{ background: 'transparent', border: 'none' }}
            >
              <Archive size={11} /> Archive this class
            </button>
          ) : (
            <div className="p-3.5 space-y-2" style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline)' }}>
              <p className="text-xs text-primary">
                Archiving stops new students from joining. Existing students, assignments, and results are kept —
                you can unarchive anytime.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setConfirmArchive(false)}>
                  Cancel
                </Button>
                <Button variant="tinted" size="sm" onClick={() => setArchived(true)}>
                  <Archive size={12} /> Archive
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
