import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FrenchFlag } from '../ui/FrenchFlag';
import { useProgressStore } from '../../stores/progressStore';
import { PersonalizeForm } from './PersonalizeForm';
import { UNITS } from '../../data/units';

interface OnboardingModalProps {
  open: boolean;
}

export function OnboardingModal({ open }: OnboardingModalProps) {
  const { setOnboardingDone } = useProgressStore();
  const [step, setStep] = useState<'welcome' | 'personalize'>('welcome');

  return (
    <Modal open={open} closeable={false}>
      {step === 'personalize' ? (
        <motion.div
          key="personalize"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-bold text-primary mb-1 font-display">Make it yours</h2>
          <p className="text-xs text-muted mb-5">
            Three quick questions shape the order of your lessons. Stored on this device only.
          </p>
          <PersonalizeForm onDone={setOnboardingDone} cancelLabel="Skip — use the standard order" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className="text-center mb-5">
            <div className="mb-3 flex justify-center">
              <FrenchFlag size={56} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2 font-display">Bienvenue!</h2>
            <p className="text-[--text-secondary] text-sm leading-relaxed">
              You've been teleported to France. Here's how this works.
            </p>
          </div>

          <div className="space-y-3 mb-6 p-4" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
            {[
              { emoji: '🔕', title: 'No nagging.', desc: "No streak anxiety, no notifications. Your phone won't judge you." },
              { emoji: '🗝️', title: 'Everything is open.', desc: `All ${UNITS.length} units are accessible from day one. Skip whatever you want.` },
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

          <Button variant="primary" className="w-full" onClick={() => setStep('personalize')}>
            Let's go! →
          </Button>
        </motion.div>
      )}
    </Modal>
  );
}
