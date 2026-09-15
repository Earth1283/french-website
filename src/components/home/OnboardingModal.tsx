import { BellOff, HardDrive, LockOpen } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Wordmark } from '../ui/Signage';
import { useProgressStore } from '../../stores/progressStore';

const PROMISES = [
  { icon: BellOff, title: 'No nagging.', description: "No streak anxiety, no notifications. Your phone won't judge you." },
  { icon: LockOpen, title: 'Every line is open.', description: 'All 21 lines are there from day one. Skip whatever you want.' },
  { icon: HardDrive, title: 'Your data stays here.', description: 'Progress lives in your browser. No account, no tracking, free forever.' },
];

export function OnboardingModal({ open }: { open: boolean }) {
  const setOnboardingDone = useProgressStore(s => s.setOnboardingDone);

  return (
    <Modal open={open} closeable={false} title="Welcome">
      <div className="mb-4 flex justify-center">
        <Wordmark />
      </div>
      <p className="read-display text-center text-36" lang="fr">
        Bienvenue&#8239;!
      </p>
      <p className="t-body mt-2 text-center">You've been teleported to France. Here's how this works.</p>

      <ul className="sheet rows my-6">
        {PROMISES.map(({ icon: Icon, title, description }) => (
          <li key={title} className="row items-start">
            <Icon size={20} className="mt-0.5 text-enamel-text" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-ink">{title}</span>
              <span className="t-small block">{description}</span>
            </span>
          </li>
        ))}
      </ul>

      <Button variant="primary" block onClick={setOnboardingDone}>
        Let's go!
      </Button>
    </Modal>
  );
}
