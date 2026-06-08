import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  closeable?: boolean;
}

export function Modal({ open, onClose, children, title, closeable = true }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeable ? onClose : undefined}
          />
          <motion.div
            className="relative card p-6 w-full max-w-md z-10"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {(title || closeable) && (
              <div className="flex items-center justify-between mb-4">
                {title && <h2 className="text-xl font-bold text-[--text-primary]">{title}</h2>}
                {closeable && onClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors"
                  >
                    <X size={18} />
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
