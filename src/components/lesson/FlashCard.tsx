import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import type { PanInfo } from 'framer-motion';
import type { VocabItem } from '../../types';
import { speak } from '../../utils/speech';

interface FlashCardProps {
  item: VocabItem;
  index: number;
  total: number;
  flipped: boolean;
  onFlipToggle: () => void;
}

const SWIPE_THRESHOLD = 50;

export function FlashCard({ item, index, total, flipped, onFlipToggle }: FlashCardProps) {
  // Auto-play French audio when card first appears and when flipping back to front
  useEffect(() => {
    if (!flipped) speak(item.french);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.french, flipped]);

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onFlipToggle();
    }
  }

  const faceStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-2)',
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center text-xs text-muted mb-4 font-medium">
        Card {index + 1} of {total} — tap or swipe to flip
      </div>

      <motion.div
        className="relative w-full cursor-grab active:cursor-grabbing"
        style={{ perspective: '1000px', height: 290 }}
        drag="x"
        dragSnapToOrigin
        dragElastic={0.2}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={onFlipToggle}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`flip-card-inner absolute inset-0 ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flip-card-front absolute inset-0 card flex flex-col items-center justify-center p-8 text-center gap-3" style={faceStyle}>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">French</div>
            <p className="text-3xl font-bold font-display" style={{ color: 'var(--accent)' }}>
              {item.french}
            </p>
            {item.pronunciation && (
              <p className="text-sm text-muted italic">/{item.pronunciation}/</p>
            )}
            <button
              onClick={e => { e.stopPropagation(); speak(item.french); }}
              className="mt-2 w-10 h-10 flex items-center justify-center rounded-full ios-press cursor-pointer"
              style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)', border: 'none' }}
              aria-label="Play pronunciation"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Back */}
          <div
            className="flip-card-back absolute inset-0 card flex flex-col items-center justify-center p-8 text-center gap-3"
            style={{ ...faceStyle, background: 'var(--bg-card)' }}
          >
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">English</div>
            <p className="text-2xl font-bold text-primary">{item.english}</p>

            {item.example && (
              <div className="mt-3 p-3 text-left w-full" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
                <p className="text-sm italic font-medium font-display" style={{ color: 'var(--accent)' }}>{item.example}</p>
                <p className="text-xs text-muted mt-0.5">{item.exampleTranslation}</p>
              </div>
            )}

            {item.funnyNote && (
              <p className="text-xs text-secondary italic mt-1 leading-relaxed pt-2" style={{ borderTop: '0.5px solid var(--hairline)' }}>
                💬 {item.funnyNote}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
