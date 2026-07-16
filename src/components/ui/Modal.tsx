import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  closeable?: boolean;
}

// Mobile: iOS sheet sliding up from the bottom with a grabber.
// Desktop (sm+): centered card with a spring scale-in.
export function Modal({ open, onClose, children, title, closeable = true }: ModalProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !closeable || !onClose) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeable, onClose]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const offscreenY = reduceMotion ? 0 : (isMobile ? '100%' : 24);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 0 }}
            onClick={closeable ? onClose : undefined}
          />
          <motion.div
            className="relative z-10 w-full sm:max-w-md max-h-[90dvh] overflow-y-auto p-6 sm:p-6 rounded-t-[26px] rounded-b-none sm:rounded-[26px]"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-3)',
              border: '0.5px solid var(--hairline)',
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
            }}
            initial={{ y: offscreenY, scale: reduceMotion ? 1 : 0.96, opacity: 0 }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
              transition: { type: 'spring', damping: 28, stiffness: 320 },
            }}
            exit={{
              y: offscreenY,
              scale: reduceMotion ? 1 : 0.96,
              opacity: 0,
              transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
            }}
          >
            {/* Sheet grabber — mobile only */}
            <div
              className="sm:hidden mx-auto mb-4 rounded-full"
              style={{ width: 36, height: 5, backgroundColor: 'var(--hairline)' }}
            />
            {(title || closeable) && (
              <div className="flex items-center justify-between mb-4">
                {title && <h2 className="text-xl font-bold text-primary">{title}</h2>}
                {closeable && onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="ml-auto p-1.5 rounded-full ios-press cursor-pointer"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-inset)', border: 'none' }}
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
