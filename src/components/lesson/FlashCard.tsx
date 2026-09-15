import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Volume2 } from 'lucide-react';
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
  useEffect(() => {
    if (!flipped) speak(item.french);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.french, flipped]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) onFlipToggle();
  };

  return (
    <div>
      <p className="t-small mb-3 text-center num">
        Card {index + 1} of {total}. Tap or swipe to flip.
      </p>
      <motion.div
        className="flip3d"
        role="button"
        tabIndex={0}
        aria-label={flipped ? `${item.english}. Show the French side` : `${item.french}. Show the English side`}
        drag="x"
        dragSnapToOrigin
        dragElastic={0.2}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={onFlipToggle}
        onKeyDown={event => {
          if (event.key === 'Enter') onFlipToggle();
        }}
      >
        <div className={flipped ? 'flip3d__inner is-flipped' : 'flip3d__inner'}>
          <div className="flip3d__face cahier" aria-hidden={flipped}>
            <p className="cahier__word" lang="fr">
              {item.french}
            </p>
            {item.pronunciation && <p className="cahier__say">{item.pronunciation}</p>}
            <button
              type="button"
              className="say mt-2"
              onClick={event => {
                event.stopPropagation();
                speak(item.french);
              }}
              aria-label={`Hear ${item.french}`}
              tabIndex={flipped ? -1 : 0}
            >
              <Volume2 size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="flip3d__face flip3d__back cahier" aria-hidden={!flipped}>
            <p className="cahier__en">{item.english}</p>
            {item.example && (
              <p className="cahier__note">
                <span className="fr" lang="fr">
                  {item.example}
                </span>
                {item.exampleTranslation && <span className="t-small block">{item.exampleTranslation}</span>}
              </p>
            )}
            {item.funnyNote && <p className="cahier__note">{item.funnyNote}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
