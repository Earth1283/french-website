import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Trash2 } from 'lucide-react';
import { NO_OVERSHOOT_SPRING } from '../../utils/motion';
import { useSpeechStore, type VoiceEngine } from '../../stores/speechStore';
import { useConversationStore } from '../../stores/conversationStore';
import { GEMINI_VOICES, cachedClipCount, clearClipCache } from '../../lib/geminiTts';
import { previewVoice } from '../../utils/speech';
import { recognitionSupported } from '../../utils/recognition';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { Button } from '../ui/Button';
import { GroupLabel, SettingRow } from './SettingsParts';

const ENGINES: { value: VoiceEngine; label: string; desc: string }[] = [
  { value: 'device', label: 'Device', desc: 'Your device’s built-in French voice. Free and works offline.' },
  {
    value: 'gemini',
    label: 'Gemini',
    desc: 'More human voices from Gemini, using your API key. Each phrase is generated once, then replayed from this device. DELF listening keeps device voices.',
  },
];

const PREVIEW_LINE = 'Bonjour ! Un café et un croissant, s’il vous plaît.';

export function SpeechSettings() {
  const { micEnabled, setMicEnabled, voiceEngine, setVoiceEngine, geminiVoice, setGeminiVoice } = useSpeechStore();
  const geminiApiKey = useConversationStore(s => s.geminiApiKey);
  const [preview, setPreview] = useState<{ state: 'idle' | 'loading' } | { state: 'error'; message: string }>({ state: 'idle' });
  const [savedClips, setSavedClips] = useState(0);

  const engine = voiceEngine === 'gemini' && geminiApiKey ? 'gemini' : 'device';
  const canListen = recognitionSupported();

  useEffect(() => {
    cachedClipCount().then(setSavedClips);
  }, [preview.state]);

  async function playPreview(voice: string) {
    setGeminiVoice(voice);
    setPreview({ state: 'loading' });
    try {
      await previewVoice(geminiApiKey, voice, PREVIEW_LINE);
      setPreview({ state: 'idle' });
    } catch (err) {
      setPreview({ state: 'error', message: err instanceof Error ? err.message : 'Gemini voice failed' });
    }
  }

  async function clearClips() {
    await clearClipCache();
    setSavedClips(0);
  }

  return (
    <section>
      <GroupLabel icon={<Mic size={12} />} title="Speech" />
      <div className="inset-group">
        <SettingRow
          label="Speaking practice"
          description={
            canListen
              ? 'Answer “Say it in French” exercises, review cards and conversations out loud.'
              : 'This browser can’t listen. Chrome, Edge and Safari can.'
          }
        >
          {canListen && <ToggleSwitch checked={micEnabled} onChange={setMicEnabled} />}
        </SettingRow>

        <div className="p-4 inset-divider">
          <p className="text-sm font-semibold text-primary mb-2.5">Voice</p>
          <div className="seg-control">
            {ENGINES.map(e => (
              <button
                key={e.value}
                onClick={() => setVoiceEngine(e.value)}
                disabled={e.value === 'gemini' && !geminiApiKey}
                aria-pressed={engine === e.value}
                className="seg-item disabled:opacity-40"
                style={{ position: 'relative' }}
              >
                {engine === e.value && (
                  <motion.span
                    layoutId="settings-voice-seg"
                    className="absolute inset-0 rounded-[10px]"
                    style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-1)', zIndex: 0 }}
                    transition={NO_OVERSHOOT_SPRING}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{e.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2 italic">
            {geminiApiKey ? ENGINES.find(e => e.value === engine)!.desc : 'Add a Gemini API key above to use Gemini voices.'}
          </p>

          {engine === 'gemini' && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GEMINI_VOICES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => playPreview(v.id)}
                    aria-pressed={geminiVoice === v.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-left cursor-pointer ios-press"
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      border: geminiVoice === v.id ? '1.5px solid var(--accent)' : '1.5px solid var(--hairline)',
                      backgroundColor: geminiVoice === v.id ? 'var(--accent-tint)' : 'transparent',
                    }}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-primary">{v.id}</span>
                      <span className="block text-xs text-muted">{v.desc}</span>
                    </span>
                    <Play
                      size={13}
                      className={preview.state === 'loading' && geminiVoice === v.id ? 'animate-pulse' : undefined}
                      style={{ color: 'var(--accent)', flexShrink: 0 }}
                    />
                  </button>
                ))}
              </div>
              {preview.state === 'error' && (
                <p className="text-xs font-semibold" style={{ color: 'var(--danger)' }} role="status">
                  {preview.message}. Speech will use your device voice until this works.
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  {savedClips === 1 ? '1 phrase' : `${savedClips} phrases`} saved on this device
                </p>
                {savedClips > 0 && (
                  <Button variant="secondary" size="sm" onClick={clearClips}>
                    <Trash2 size={13} /> Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {canListen && (
          <div className="p-4 inset-divider">
            <p className="text-xs text-muted">
              Your browser turns your voice into text. Chrome and Edge send the audio to Google or Microsoft to do it;
              Safari may do it on your device. This app never records or keeps audio.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
