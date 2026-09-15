import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, BookOpen, ChevronDown, KeyRound, LogOut, Plus } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi } from '../../services/classroom';
import { Button, ButtonLink } from '../../components/ui/Button';
import type { ClassInfo } from '../../types/classroom';

function ClassTable({ classes }: { classes: ClassInfo[] }) {
  return (
    <div className="sheet ledger-wrap">
      <table className="ledger">
        <thead><tr><th>Class</th><th>Join code</th><th>Created</th></tr></thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id}>
              <td><Link to={`/classes/${cls.id}`} className="who">{cls.name}</Link></td>
              <td className="font-semibold tracking-wider tabular-nums">{cls.join_code}</td>
              <td>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(cls.created_at))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

  useEffect(() => { load().catch(() => setError('Could not load your classes.')); }, []);

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
    <div className="page">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div><h1 className="h-page">Your classes</h1><p className="t-small text-ink-2 mt-1">{profile?.name}</p></div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Classroom account">
          <ButtonLink to="/classes/content" variant="secondary" size="sm"><BookOpen size={16} /> Content library</ButtonLink>
          <ButtonLink to="/classes/account" variant="quiet" size="sm"><KeyRound size={16} /> Account</ButtonLink>
          <Button variant="quiet" size="sm" onClick={disconnect}><LogOut size={16} /> Log out</Button>
        </nav>
      </header>

      <section className="sheet p-4 mb-6" aria-labelledby="new-class-title">
        <h2 id="new-class-title" className="h-section mb-3">Create a class</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createClass()} placeholder="New class name, e.g. Period 1" className="field flex-1" />
          <Button onClick={createClass} disabled={creating || !nameDraft.trim()}><Plus size={16} /> Create</Button>
        </div>
        {error && <p className="t-small text-signal-text mt-2" role="alert">{error}</p>}
      </section>

      <section aria-labelledby="active-classes-title">
        <div className="panel__head"><h2 id="active-classes-title" className="h-section">Classes</h2><span className="t-small text-ink-3">{active.length} active</span></div>
        {classes === null && <p className="sheet p-6 t-body text-ink-3">Loading…</p>}
        {classes?.length === 0 && <p className="sheet p-6 t-body text-ink-3">No classes yet — create your first one above.</p>}
        {active.length > 0 && <ClassTable classes={active} />}
      </section>

      {archived.length > 0 && (
        <section className="mt-6">
          <Button variant="quiet" size="sm" onClick={() => setShowArchived((value) => !value)} aria-expanded={showArchived}>
            <Archive size={16} /> {showArchived ? 'Hide' : 'Show'} {archived.length} archived {archived.length === 1 ? 'class' : 'classes'}
            <ChevronDown size={16} className={showArchived ? 'rotate-180' : ''} />
          </Button>
          {showArchived && <div className="mt-2"><ClassTable classes={archived} /></div>}
        </section>
      )}
    </div>
  );
}
