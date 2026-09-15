import { useState } from 'react';
import { Check, Copy, GraduationCap, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Ticket } from '../ui/Signage';

const COPIED_MS = 1500;

export function JoinTicket({ code, onRotate }: { code: string; onRotate: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <Ticket className="ticket--join" stub={<GraduationCap size={24} aria-hidden="true" />}>
      <p className="t-small text-ink-2">Students join with this code</p>
      <p className="joincode" data-testid="join-code">
        {code}
      </p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Button variant="secondary" size="sm" onClick={copy}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy code'}
        </Button>
        <Button variant="quiet" size="sm" onClick={onRotate} title="Makes the old code stop working">
          <RefreshCw size={16} aria-hidden="true" />
          New code
        </Button>
      </div>
    </Ticket>
  );
}
