import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, KeyRound, LogOut, ShieldQuestion, UserPlus } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Board, BoardGlyph, BoardRow } from '../../components/ui/Board';
import { ClassroomPrivacyNotice } from '../../components/classroom/ClassroomPrivacyNotice';
import type { AssignmentInfo, ClassInfo } from '../../types/classroom';

interface ClassWithAssignments extends ClassInfo { assignments: AssignmentInfo[]; }

function assignmentStatus(assignment: AssignmentInfo) {
  if (assignment.completed) return `Done${assignment.score == null ? '' : ` · ${assignment.score}%`}`;
  if (!assignment.due_at) return 'Open';
  return `Due ${new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(assignment.due_at))}`;
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
    setClasses(await Promise.all(res.classes.map(async (cls) => ({ ...cls, assignments: (await classroomApi.get<{ assignments: AssignmentInfo[] }>(`/api/student/classes/${cls.id}/assignments`)).assignments }))));
  }

  useEffect(() => { load().catch(() => setError('Could not load your classes.')); }, []);

  async function join() {
    if (!joinCode.trim()) return;
    setJoining(true);
    setError(null);
    try {
      await classroomApi.post('/api/student/enroll', { joinCode: joinCode.trim().toUpperCase() });
      setJoinCode('');
      await load();
    } catch (caught) {
      setError(caught instanceof ClassroomApiError ? caught.message : 'Could not join that class.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="page">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div><h1 className="h-page">My classes</h1><p className="t-small text-ink-2 mt-1">{profile?.name}</p></div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Classroom account">
          <Button variant="quiet" size="sm" onClick={() => setPrivacyOpen(true)}><ShieldQuestion size={16} /> What does my teacher see?</Button>
          <ButtonLink to="/classes/account" variant="quiet" size="sm"><KeyRound size={16} /> Account</ButtonLink>
          <Button variant="quiet" size="sm" onClick={disconnect}><LogOut size={16} /> Log out</Button>
        </nav>
      </header>

      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Your data"><ClassroomPrivacyNotice /></Modal>

      <section className="sheet p-4 mb-6" aria-labelledby="join-title">
        <h2 id="join-title" className="h-section mb-3">Join a class</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && join()} placeholder="Join code, e.g. GEZ6-4F4T" className="field flex-1 uppercase tracking-wider" />
          <Button onClick={join} disabled={joining || !joinCode.trim()}><UserPlus size={16} /> Join</Button>
        </div>
        {error && <p className="t-small text-signal-text mt-2" role="alert">{error}</p>}
      </section>

      {classes === null && <p className="sheet p-6 t-body text-ink-3">Loading…</p>}
      {classes?.length === 0 && <p className="sheet p-6 t-body text-ink-3">Not enrolled in any classes yet — join one above.</p>}
      <div className="grid gap-5 lg:grid-cols-2">
        {classes?.map((cls) => (
          <Board key={cls.id} title={cls.name} gloss="Assignments" titleId={`class-${cls.id}`}>
            {cls.assignments.length === 0 && <div className="board__row"><BoardGlyph><Circle size={16} /></BoardGlyph><span className="board__via">Nothing assigned yet.</span></div>}
            {cls.assignments.map((assignment) => (
              <BoardRow key={assignment.id} to={`/classes/assignment/${assignment.id}`} glyph={<BoardGlyph>{assignment.completed ? <CheckCircle2 size={17} /> : <Circle size={17} />}</BoardGlyph>} dest={assignment.title} via={<span className="capitalize">{assignment.kind}</span>} status={assignmentStatus(assignment)} now={!assignment.completed && !!assignment.due_at} />
            ))}
          </Board>
        ))}
      </div>
    </div>
  );
}
