import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { Button, ButtonLink } from '../../components/ui/Button';
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
    <div className="page">
      <div className="flex items-start justify-between mb-6">
        <div>
          <ButtonLink
            to="/classes"
            variant="quiet"
            className="-ml-1.5 mb-2"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </ButtonLink>
          <h1 className="h-page">Content library</h1>
        </div>
        <ButtonLink to="/classes/content/new" variant="primary">
          <Plus size={14} /> New
        </ButtonLink>
      </div>

      {content === null && <p className="sheet p-6 t-body text-ink-3">Loading…</p>}
      {content?.length === 0 && (
        <p className="sheet p-6 t-body text-ink-3">
          No lessons or quizzes yet — <Link to="/classes/content/new" className="text-enamel-text hover:underline">create your first one</Link>.
        </p>
      )}
      {content && content.length > 0 && (
        <div className="sheet ledger-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th className="who">Title</th>
                <th>Kind</th>
                <th className="n">Items</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {content.map((c) => (
                <tr key={c.id}>
                  <td className="who">
                    <Link to={`/classes/content/${c.id}/edit`} className="text-enamel-text hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="t-small text-ink-2">{c.kind}</td>
                  <td className="n text-ink-2">—</td>
                  <td className="text-right space-x-1">
                    {confirmId === c.id ? (
                      <>
                        <button
                          onClick={() => remove(c.id)}
                          className="btn btn--secondary btn--sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="btn btn--quiet btn--sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/classes/content/${c.id}/edit`}
                          aria-label="Edit"
                          className="btn btn--quiet btn--sm"
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </Link>
                        <button
                          onClick={() => setConfirmId(c.id)}
                          aria-label="Delete"
                          className="btn btn--quiet btn--sm"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
