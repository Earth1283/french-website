import { Eye, Lock, Server } from 'lucide-react';
import type { ReactNode } from 'react';

function Row({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)' }}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-primary">{title}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export function ClassroomPrivacyNotice() {
  return (
    <div className="space-y-4">
      <Row icon={<Eye size={13} />} title="Your teacher can see">
        Your name, email, which classes you've joined, and — per assignment — whether you completed it and
        your score. Not which individual questions you got right or wrong.
      </Row>
      <Row icon={<Lock size={13} />} title="Stays private">
        Your password (stored as an unreadable hash — not even your teacher can see it), and your regular
        progress on this device (XP, streaks, badges). That's a separate, local-only account and is never
        sent anywhere.
      </Row>
      <Row icon={<Server size={13} />} title="Where it's stored">
        On your teacher's own self-hosted server — not on servers run by the people who made this website,
        and not shared with any other teacher's server.
      </Row>
    </div>
  );
}
