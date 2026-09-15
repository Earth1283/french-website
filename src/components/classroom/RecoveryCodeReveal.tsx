import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
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
      'Bonjour Survival — Classroom Recovery Code',
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
    <div className="sheet p-4 space-y-4">
      <p className="t-small text-ink-3">
        Save your recovery code somewhere safe. This is the only way to reset your password if you forget it — nobody, including your teacher's
        server, can show it to you again.
      </p>

      <p className="joincode text-24 text-center">
        {code}
      </p>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={copy} className="flex-1 justify-center">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="secondary" size="sm" onClick={download} className="flex-1 justify-center">
          <Download size={14} /> Download
        </Button>
      </div>

      {onDone && (
        <Button onClick={onDone} variant="primary" block>
          {doneLabel}
        </Button>
      )}
    </div>
  );
}
