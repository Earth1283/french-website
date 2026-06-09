import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useProgressStore } from '../../stores/progressStore';

const SLIDE = {
  enter: { x: 28, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -28, opacity: 0 },
};
const SLIDE_TRANSITION = { duration: 0.22, ease: 'easeInOut' } as const;

interface OnboardingModalProps {
  open: boolean;
}

export function OnboardingModal({ open }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const { setUnit12Mode, setOnboardingDone } = useProgressStore();

  const choose = (mode: 'full-freedom' | 'earned-reward') => {
    setUnit12Mode(mode);
    setOnboardingDone();
  };

  return (
    <Modal open={open} closeable={false}>
      {/* overflow-hidden so exiting slides don't escape the card */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div
              key="philosophy"
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_TRANSITION}
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🕊️</div>
                <h2 className="text-2xl font-bold text-[--text-primary] mb-2">
                  We trust you.
                </h2>
                <p className="text-[--text-secondary] text-sm leading-relaxed">
                  This app doesn't push. It just shows up when you do.
                </p>
              </div>

              <div className="space-y-3 mb-6 rounded-xl p-4" style={{ backgroundColor: 'var(--bg)' }}>
                {[
                  {
                    emoji: '🔕',
                    title: 'No nagging.',
                    desc: "No notifications, no streak anxiety, no guilt trips about missed days. Your phone won't judge you.",
                  },
                  {
                    emoji: '🗝️',
                    title: 'Everything is open.',
                    desc: 'All units are skippable and accessible from day one. Learn insults before greetings if that motivates you.',
                  },
                  {
                    emoji: '🧠',
                    title: 'You know yourself.',
                    desc: "The best study schedule is the one you'll actually stick to. We don't pretend to know better.",
                  },
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

              <Button variant="primary" className="w-full" onClick={() => setStep(1)}>
                Sounds good →
              </Button>

              <StepDots total={2} current={0} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="unit12"
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_TRANSITION}
            >
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
                      className="w-full p-4 rounded-xl border-2 border-[--border] hover:border-[--accent] hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-all"
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
                      className="w-full p-4 rounded-xl border-2 border-[--border] hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-left transition-all"
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

                <StepDots total={2} current={1} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-2 mt-5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className="h-1.5 rounded-full"
          animate={{ width: i === current ? '1.5rem' : '0.375rem' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ backgroundColor: i === current ? 'var(--accent)' : 'var(--border)' }}
        />
      ))}
    </div>
  );
}
