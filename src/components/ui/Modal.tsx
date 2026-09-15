import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
  closeable?: boolean;
}

export function Modal({ open, onClose, children, title, closeable = true }: ModalProps) {
  useEffect(() => {
    if (!open || !closeable || !onClose) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, closeable, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="overlay-scrim" onClick={closeable ? onClose : undefined} />
      <div className="dialog">
        {(title || (closeable && onClose)) && (
          <div className="mb-4 flex items-center justify-between gap-4">
            {title && <h2 className="h-section">{title}</h2>}
            {closeable && onClose && (
              <button type="button" onClick={onClose} aria-label="Close" className="btn btn--quiet btn--icon ml-auto">
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
