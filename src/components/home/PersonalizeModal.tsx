import { Modal } from '../ui/Modal';
import { PersonalizeForm } from './PersonalizeForm';

interface PersonalizeModalProps {
  open: boolean;
  onClose: () => void;
}

export function PersonalizeModal({ open, onClose }: PersonalizeModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Your learning path">
      <p className="text-xs text-muted mb-5 -mt-2">
        Shapes the order of your lessons. Stored on this device only.
      </p>
      <PersonalizeForm onDone={onClose} cancelLabel="Cancel" />
    </Modal>
  );
}
