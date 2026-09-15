import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { Wordmark } from '../../components/ui/Signage';

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
      <div className="page page--form">
        <div className="mb-6 flex justify-center">
          <Wordmark size="lg" />
        </div>
        <h1 className="h-page text-center">Trust this server</h1>

        <div className="sheet p-6 space-y-5">
          <h2 className="h-section">Follow these steps</h2>
          <ol className="list-decimal pl-5 t-body space-y-3">
            <li>Open the server page to set up the certificate in your browser.</li>
            <li>Click through your browser's warning about the self-signed certificate.</li>
            <li>Come back here and click the button below.</li>
          </ol>

          <div className="flex flex-col gap-2">
            <a
              href={`${backendUrl}/api/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary"
            >
              <ExternalLink size={16} /> Open server page
            </a>
            <Button onClick={checkTrust} disabled={checking} variant="primary" block>
              {checking ? 'Checking…' : 'I trusted it — Continue'}
            </Button>
          </div>

          {error && (
            <p className="t-small text-signal-text" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={forgetBackend}
            className="btn btn--quiet btn--sm self-start"
          >
            Use a different server address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--form">
      <div className="mb-6 flex justify-center">
        <Wordmark size="lg" />
      </div>
      <h1 className="h-page text-center">Connect to a Class</h1>

      <div className="sheet p-6 space-y-5">
        <p className="t-small">
          Your teacher runs their own classroom server and can give you its address — ask them for it,
          or if you're the teacher, see your server's terminal output after starting it.{' '}
          <a
            href="https://github.com/Earth1283/french-website/blob/main/server/SETUP.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-enamel-text hover:underline"
          >
            Setting one up for the first time? Read the setup guide.
          </a>
        </p>

        <div className="field">
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && connect(urlDraft)}
            placeholder="https://192.168.1.42:8443"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <Button onClick={() => connect(urlDraft)} disabled={!urlDraft.trim()} variant="primary" block>
          Connect <ArrowRight size={16} />
        </Button>

        {recentBackendUrls.length > 0 && (
          <div className="pt-4 border-t border-rule">
            <p className="t-micro text-ink-3 mb-3">Recent servers</p>
            <div className="sheet rows">
              {recentBackendUrls.map((url) => (
                <button
                  key={url}
                  onClick={() => connect(url)}
                  className="row w-full text-left"
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
