import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useProgressStore } from '../../stores/progressStore';

interface OnboardingModalProps {
  open: boolean;
}

export function OnboardingModal({ open }: OnboardingModalProps) {
  const { setOnboardingDone } = useProgressStore();

  return (
    <Modal open={open} closeable={false}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🇫🇷</div>
          <h2 className="text-2xl font-bold text-primary mb-2 font-display">Bienvenue!</h2>
          <p className="text-[--text-secondary] text-sm leading-relaxed">
            You've been teleported to France. Here's how this works.
          </p>
        </div>

        <div className="space-y-3 mb-6 p-4" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
          {[
            { emoji: '🔕', title: 'No nagging.', desc: "No streak anxiety, no notifications. Your phone won't judge you." },
            { emoji: '🗝️', title: 'Everything is open.', desc: 'All 21 units are accessible from day one. Skip whatever you want.' },
            { emoji: '📱', title: 'Your data stays here.', desc: 'Progress lives in your browser. No account, no tracking, free forever.' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="flex gap-3 items-start">
              <span className="text-xl leading-none mt-0.5">{emoji}</span>
              <div>
                <p className="text-sm font-semibold text-[--text-primary]">{title}</p>
                <p className="text-xs text-[--text-muted] leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="primary" className="w-full" onClick={setOnboardingDone}>
          Let's go! →
        </Button>
      </motion.div>
    </Modal>
  );
}
