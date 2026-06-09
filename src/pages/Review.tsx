import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { UNITS } from '../data/units';
import { useProgressStore } from '../stores/progressStore';
import { vocabKey, defaultCard, isDue } from '../utils/srs';
import { speak } from '../utils/speech';
import { Button } from '../components/ui/Button';
import type { VocabItem } from '../types';

interface ReviewCard extends VocabItem {
  key: string;
  lessonTitle: string;
  unitEmoji: string;
}

export function Review() {
  const completedLessons = useProgressStore(s => s.completedLessons);
  const srsData = useProgressStore(s => s.srsData);
  const updateSRS = useProgressStore(s => s.updateSRS);

  const dueCards = useMemo<ReviewCard[]>(() => {
    const cards: ReviewCard[] = [];
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) continue;
        lesson.vocab.forEach((v, idx) => {
          const key = vocabKey(lesson.id, idx);
          const card = srsData[key] ?? defaultCard();
          if (isDue(card)) {
            cards.push({ ...v, key, lessonTitle: lesson.title, unitEmoji: unit.emoji });
          }
        });
      }
    }
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  // Only recompute at mount — srsData changes as we review, but we don't want the deck to shift mid-session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [idx, setIdx] = useState(0);
  const [showing, setShowing] = useState<'front' | 'back'>('front');
  const [tally, setTally] = useState({ correct: 0, wrong: 0 });

  const handleReveal = () => {
    setShowing('back');
    if (dueCards[idx]) speak(dueCards[idx].french);
  };

  const handleRate = (correct: boolean) => {
    if (idx >= dueCards.length) return;
    updateSRS(dueCards[idx].key, correct);
    setTally(t => correct ? { ...t, correct: t.correct + 1 } : { ...t, wrong: t.wrong + 1 });
    setIdx(i => i + 1);
    setShowing('front');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (idx >= dueCards.length) return;
      if (showing === 'front') {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleReveal();
        }
      } else {
        if (e.key === 'ArrowRight' || e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRate(true);
        } else if (e.key === 'ArrowLeft' || e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleRate(false);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showing, idx, dueCards]);

  if (dueCards.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-[--text-primary]">All caught up!</h1>
          <p className="text-[--text-secondary]">
            No cards due right now. Complete more lessons to grow your review deck,
            or come back tomorrow.
          </p>
          <Link to="/" className="inline-block mt-4">
            <Button variant="secondary">← Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (idx >= dueCards.length) {
    const total = tally.correct + tally.wrong;
    const pct = total > 0 ? Math.round((tally.correct / total) * 100) : 0;
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="text-5xl">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
          <h1 className="text-2xl font-bold text-[--text-primary]">Session complete!</h1>
          <p className="text-[--text-secondary]">
            {tally.correct} correct out of {total} · {pct}%
          </p>
          <div className="mt-6">
            <Link to="/"><Button variant="secondary">← Back to Home</Button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const card = dueCards[idx];

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/"
          className="p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-[--text-muted] mb-1">
            <span>Review session</span>
            <span>{idx + 1} / {dueCards.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
              animate={{ width: `${(idx / dueCards.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showing === 'front' ? (
          <motion.div
            key={`front-${idx}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div
              className="card p-8 text-center min-h-[220px] flex flex-col items-center justify-center gap-3 cursor-pointer select-none"
              onClick={handleReveal}
            >
              <p className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">
                {card.unitEmoji} {card.lessonTitle}
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: 'var(--accent)', fontFamily: 'Playfair Display, serif' }}
              >
                {card.french}
              </p>
              {card.pronunciation && (
                <p className="text-sm text-[--text-muted] italic">/{card.pronunciation}/</p>
              )}
              <button
                onClick={e => { e.stopPropagation(); speak(card.french); }}
                className="mt-1 p-2 rounded-lg text-[--text-muted] hover:text-[--accent] hover:bg-[--bg-card-hover] transition-colors"
                aria-label="Play pronunciation"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <button
              onClick={handleReveal}
              className="w-full py-3 text-sm text-[--text-muted] border-2 border-dashed border-[--border] rounded-xl hover:border-[--accent] hover:text-[--accent] transition-colors"
            >
              Tap to reveal · Space / Enter
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`back-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="card p-8 min-h-[220px] flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">English</p>
              <p className="text-2xl font-bold text-[--text-primary]">{card.english}</p>

              {card.example && (
                <div className="mt-2 p-3 rounded-xl bg-[--bg] text-left w-full">
                  <p className="text-sm italic font-medium" style={{ color: 'var(--accent)' }}>{card.example}</p>
                  <p className="text-xs text-[--text-muted] mt-0.5">{card.exampleTranslation}</p>
                </div>
              )}

              {card.funnyNote && (
                <p className="text-xs text-[--text-secondary] italic border-t border-[--border] pt-2">
                  💬 {card.funnyNote}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRate(false)}
                className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <XCircle size={20} /> Not quite
              </button>
              <button
                onClick={() => handleRate(true)}
                className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold transition-colors hover:opacity-90"
                style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
              >
                <CheckCircle2 size={20} /> Got it
              </button>
            </div>
            <p className="text-center text-xs text-[--text-muted]">← Not quite · Got it →</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
