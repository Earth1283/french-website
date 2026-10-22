import { Megaphone, Pin } from 'lucide-react';
import type { AnnouncementInfo } from '../../types/classroom';

export function formatPostedDate(createdAt: string): string {
  const posted = new Date(`${createdAt.replace(' ', 'T')}Z`);
  return posted.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function AnnouncementCard({
  announcement,
  actions,
}: {
  announcement: AnnouncementInfo;
  actions?: React.ReactNode;
}) {
  return (
    <div className="p-4 space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {announcement.pinned ? (
            <Pin size={13} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
          ) : (
            <Megaphone size={13} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
          )}
          <p className="text-sm font-semibold text-primary truncate">{announcement.title}</p>
        </div>
        <span className="text-xs text-muted flex-shrink-0">{formatPostedDate(announcement.created_at)}</span>
      </div>
      {announcement.body && <p className="text-sm text-secondary whitespace-pre-wrap">{announcement.body}</p>}
      {actions}
    </div>
  );
}

export function AnnouncementFeed({ announcements }: { announcements: AnnouncementInfo[] }) {
  if (announcements.length === 0) return null;
  return (
    <div className="inset-group">
      {announcements.map((announcement, index) => (
        <div key={announcement.id} className={index > 0 ? 'inset-divider' : undefined}>
          <AnnouncementCard announcement={announcement} />
        </div>
      ))}
    </div>
  );
}
