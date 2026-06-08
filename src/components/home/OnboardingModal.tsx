import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useProgressStore } from '../../stores/progressStore';

interface OnboardingModalProps {
  open: boolean;
}

export function OnboardingModal({ open }: OnboardingModalProps) {
  const { setUnit12Mode, setOnboardingDone } = useProgressStore();

  const choose = (mode: 'full-freedom' | 'earned-reward') => {
    setUnit12Mode(mode);
    setOnboardingDone();
  };

  return (
    <Modal open={open} closeable={false}>
      <div className="text-center">
        <div className="text-5xl mb-3">🇫🇷</div>
        <h2 className="text-2xl font-bold text-[--text-primary] mb-2">
          Bienvenue!
        </h2>
        <p className="text-[--text-secondary] text-sm mb-6 leading-relaxed">
          You've been teleported to France. You have zero French.
          This course will fix that. No tests. No locked units. Just learning.
        </p>

        <div className="border-t border-[--border] pt-5 mb-5">
          <p className="text-sm font-semibold text-[--text-primary] mb-1">
            One quick question about Unit 12 (slang & swearing):
          </p>
          <p className="text-xs text-[--text-muted] mb-4">
            It's the spicy unit. How do you want to access it?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => choose('full-freedom')}
              className="w-full p-4 rounded-xl border-2 border-[--border] hover:border-[--accent] hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-semibold text-sm text-[--text-primary]">Full Freedom</p>
                  <p className="text-xs text-[--text-muted]">Unit 12 is open from the start. Chaos reigns.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => choose('earned-reward')}
              className="w-full p-4 rounded-xl border-2 border-[--border] hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔓</span>
                <div>
                  <p className="font-semibold text-sm text-[--text-primary]">Earned Reward</p>
                  <p className="text-xs text-[--text-muted]">Unlock after completing any 2 units. The anticipation.</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <p className="text-xs text-[--text-muted]">
          No prerequisites on anything else. Skip whatever you want.
        </p>
      </div>
    </Modal>
  );
}
