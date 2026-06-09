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

export function FlashCard({ item, index, total, flipped, onFlipToggle }: FlashCardProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center text-xs text-[--text-muted] mb-4">
        Card {index + 1} of {total} — click to flip
      </div>

      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: '1000px', height: 280 }}
        onClick={onFlipToggle}
      >
        <div className={`flip-card-inner absolute inset-0 ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flip-card-front absolute inset-0 card flex flex-col items-center justify-center p-8 text-center gap-3">
            <div className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">French</div>
            <p className="text-3xl font-bold text-[--accent]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {item.french}
            </p>
            {item.pronunciation && (
              <p className="text-sm text-[--text-muted] italic">/{item.pronunciation}/</p>
            )}
            <button
              onClick={e => { e.stopPropagation(); speak(item.french); }}
              className="mt-2 p-2 rounded-lg text-[--text-muted] hover:text-[--accent] hover:bg-[--bg-card-hover] transition-colors"
              aria-label="Play pronunciation"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute inset-0 card flex flex-col items-center justify-center p-8 text-center gap-3"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-2">English</div>
            <p className="text-2xl font-bold text-[--text-primary]">{item.english}</p>

            {item.example && (
              <div className="mt-3 p-3 rounded-xl bg-[--bg] text-left w-full">
                <p className="text-sm text-[--accent] italic font-medium">{item.example}</p>
                <p className="text-xs text-[--text-muted] mt-0.5">{item.exampleTranslation}</p>
              </div>
            )}

            {item.funnyNote && (
              <p className="text-xs text-[--text-secondary] italic mt-1 leading-relaxed border-t border-[--border] pt-2">
                💬 {item.funnyNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
