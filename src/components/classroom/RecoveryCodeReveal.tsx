import { useState } from 'react';
import { Copy, Check, Download, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface RecoveryCodeRevealProps {
  code: string;
  email: string;
  backendUrl: string | null;
  onDone?: () => void;
  doneLabel?: string;
}

export function RecoveryCodeReveal({ code, email, backendUrl, onDone, doneLabel = 'Continue' }: RecoveryCodeRevealProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const body = [
      'Oh Non! Le French Website — Classroom Recovery Code',
      `Account: ${email}`,
      backendUrl ? `Server: ${backendUrl}` : null,
      `Generated: ${new Date().toISOString()}`,
      '',
      `Recovery code: ${code}`,
      '',
      "Keep this somewhere safe. If you forget your password, use this code",
      '(with your email) on the "Forgot password?" screen to set a new one.',
      'This code stops working as soon as you use it once — you get a new one then.',
    ]
      .filter(Boolean)
      .join('\n');
    const blob = new Blob([body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classroom-recovery-code.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 15%, transparent)' }}
        >
          <ShieldAlert size={17} style={{ color: '#f59e0b' }} />
        </span>
        <div>
          <p className="text-sm font-semibold text-primary">Save your recovery code</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            This is the only way to reset your password if you forget it — nobody, including your teacher's
            server, can show it to you again. Save it now.
          </p>
        </div>
      </div>

      <p
        className="text-center text-lg font-mono font-bold tracking-wide py-3"
        style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
      >
        {code}
      </p>

      <div className="flex gap-2">
        <Button variant="tinted" size="sm" onClick={copy} className="flex-1 justify-center">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="secondary" size="sm" onClick={download} className="flex-1 justify-center">
          <Download size={14} /> Download as file
        </Button>
      </div>

      {onDone && (
        <Button onClick={onDone} className="w-full">
          {doneLabel}
        </Button>
      )}
    </div>
  );
}
