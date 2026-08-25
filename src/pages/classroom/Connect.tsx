import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, ServerCog, ShieldCheck, ArrowRight } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';

export function Connect() {
  const navigate = useNavigate();
  const { backendUrl, certTrusted, recentBackendUrls, setConnection, markCertTrusted, forgetBackend } =
    useClassroomStore();

  const [urlDraft, setUrlDraft] = useState(backendUrl ?? '');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function connect(url: string) {
    if (!url.trim()) return;
    setConnection(url);
    setError(null);
  }

  async function checkTrust() {
    setChecking(true);
    setError(null);
    try {
      await classroomApi.health();
      markCertTrusted();
      navigate('/classes/auth');
    } catch (err) {
      setError(
        err instanceof ClassroomApiError && err.status === 0
          ? "Still can't reach it — make sure you clicked through the warning in the tab that opened, and double-check the address (including https:// and the port)."
          : 'Something went wrong reaching the server.'
      );
    } finally {
      setChecking(false);
    }
  }

  if (backendUrl && !certTrusted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-primary mb-1">Trust this server</h1>
          <p className="text-secondary text-sm font-display italic">Une seule fois.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5 mt-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-tint)' }}
            >
              <ShieldCheck size={17} style={{ color: 'var(--accent)' }} />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">{backendUrl}</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                This classroom server uses a self-signed certificate, which is completely normal for a
                self-hosted class — your browser just doesn't recognize it yet. Open it once below and
                click through your browser's warning. You'll only need to do this once per device.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={`${backendUrl}/api/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm flex-1 justify-center"
            >
              <ExternalLink size={14} /> Open server page
            </a>
            <Button onClick={checkTrust} disabled={checking} className="flex-1">
              {checking ? 'Checking…' : "I trusted it — Continue"}
            </Button>
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button
            onClick={forgetBackend}
            className="text-xs text-muted hover:underline cursor-pointer"
            style={{ background: 'transparent', border: 'none' }}
          >
            Use a different server address
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary mb-1">Connect to a Class</h1>
        <p className="text-secondary text-sm font-display italic">Votre professeur a l'adresse.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-5 mt-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--accent-tint)' }}
          >
            <ServerCog size={17} style={{ color: 'var(--accent)' }} />
          </span>
          <p className="text-xs text-muted leading-relaxed">
            Your teacher runs their own classroom server and can give you its address — ask them for it,
            or if you're the teacher, see your server's terminal output after starting it.{' '}
            <a
              href="https://github.com/Earth1283/french-website/blob/main/server/SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}
            >
              Setting one up for the first time? Read the setup guide.
            </a>
          </p>
        </div>

        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && connect(urlDraft)}
          placeholder="https://192.168.1.42:8443"
          className="ios-input py-2.5 text-sm"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button onClick={() => connect(urlDraft)} disabled={!urlDraft.trim()} className="w-full">
          Connect <ArrowRight size={16} />
        </Button>

        {recentBackendUrls.length > 0 && (
          <div className="pt-2" style={{ borderTop: '0.5px solid var(--hairline)' }}>
            <p className="text-xs text-muted mb-2">Recent servers</p>
            <div className="flex flex-wrap gap-2">
              {recentBackendUrls.map((url) => (
                <button
                  key={url}
                  onClick={() => connect(url)}
                  className="chip cursor-pointer"
                  style={{ border: 'none' }}
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
