import { Eye, Lock, Server, Flag, KeyRound, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

function Row({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-enamel-text flex-shrink-0 mt-0.5">
        {icon}
      </span>
      <div>
        <p className="t-small font-semibold text-ink">{title}</p>
        <p className="t-small text-ink-3 mt-1">{children}</p>
      </div>
    </div>
  );
}

export function ClassroomPrivacyNotice() {
  return (
    <div className="sheet p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={16} className="text-enamel-text" />
        <p className="t-small font-semibold text-ink">Your privacy in the classroom</p>
      </div>
      <Row icon={<Eye size={13} />} title="Your teacher can see">
        Your name, email, which classes you've joined, and — per assignment — whether you completed it and
        your score. They can also see, for the whole class at once, which questions students commonly get
        wrong — as a chart of counts, not a list of who missed what.
      </Row>
      <Row icon={<Flag size={13} />} title="If you flag a question">
        Your name is attached to it — flags go straight to your teacher on purpose, so that one's not
        anonymous.
      </Row>
      <Row icon={<KeyRound size={13} />} title="About your password">
        It's stored as an unreadable hash — nobody, including your teacher, can see it. If you forget it,
        your teacher <em>can</em> set a new one for your account (there's no self-service email reset on a
        self-hosted server), which logs you out everywhere until you sign in again with the new one.
      </Row>
      <Row icon={<Lock size={13} />} title="Stays private">
        Which specific question <em>you personally</em> got wrong (only class-wide patterns are visible, not
        per-student), and your regular progress on this device (XP, streaks, badges) — a separate,
        local-only account that's never sent anywhere.
      </Row>
      <Row icon={<Server size={13} />} title="Where it's stored">
        On your teacher's own self-hosted server — not on servers run by the people who made this website,
        and not shared with any other teacher's server.
      </Row>
    </div>
  );
}
