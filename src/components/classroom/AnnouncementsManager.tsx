import { useEffect, useState } from 'react';
import { Pin, PinOff, Plus, Trash2 } from 'lucide-react';
import { classroomApi } from '../../services/classroom';
import { Button } from '../ui/Button';
import { AnnouncementCard } from './AnnouncementFeed';
import type { AnnouncementInfo } from '../../types/classroom';

export function AnnouncementsManager({ classId }: { classId: string }) {
  const [announcements, setAnnouncements] = useState<AnnouncementInfo[] | null>(null);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await classroomApi.get<{ announcements: AnnouncementInfo[] }>(
      `/api/teacher/classes/${classId}/announcements`
    );
    setAnnouncements(res.announcements);
  }

  useEffect(() => {
    load().catch(() => setError('Could not load announcements.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function closeComposer() {
    setComposing(false);
    setTitle('');
    setBody('');
    setPinned(false);
  }

  async function post() {
    if (!title.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await classroomApi.post(`/api/teacher/classes/${classId}/announcements`, {
        title: title.trim(),
        body: body.trim(),
        pinned,
      });
      closeComposer();
      await load();
    } catch {
      setError('Could not post the announcement.');
    } finally {
      setPosting(false);
    }
  }

  async function togglePinned(announcement: AnnouncementInfo) {
    await classroomApi.patch(`/api/teacher/announcements/${announcement.id}`, { pinned: !announcement.pinned });
    await load();
  }

  async function remove(announcement: AnnouncementInfo) {
    await classroomApi.del(`/api/teacher/announcements/${announcement.id}`);
    await load();
  }

  return (
    <section>
      <div className="section-label">Announcements</div>
      <div className="inset-group">
        {announcements?.length === 0 && !composing && (
          <p className="p-4 text-sm text-muted">Nothing posted yet — students see announcements at the top of their class.</p>
        )}
        {announcements?.map((announcement, index) => (
          <div key={announcement.id} className={index > 0 ? 'inset-divider' : undefined}>
            <AnnouncementCard
              announcement={announcement}
              actions={
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => togglePinned(announcement)}
                    className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    {announcement.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                    {announcement.pinned ? 'Unpin' : 'Pin to top'}
                  </button>
                  <button
                    onClick={() => remove(announcement)}
                    className="text-xs text-muted hover:underline cursor-pointer flex items-center gap-1"
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              }
            />
          </div>
        ))}

        <div className="p-4 inset-divider space-y-2.5">
          {!composing ? (
            <Button variant="secondary" size="sm" onClick={() => setComposing(true)}>
              <Plus size={14} /> New announcement
            </Button>
          ) : (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title, e.g. Quiz on Friday"
                maxLength={200}
                className="ios-input py-2 text-sm w-full"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Details (optional)"
                rows={3}
                maxLength={5000}
                className="ios-input py-2 text-sm w-full"
              />
              <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                Pin to the top
              </label>
              <div className="flex gap-2">
                <Button size="sm" onClick={post} disabled={posting || !title.trim()}>
                  Post
                </Button>
                <Button variant="ghost" size="sm" onClick={closeComposer}>
                  Cancel
                </Button>
              </div>
            </>
          )}
          {error && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
