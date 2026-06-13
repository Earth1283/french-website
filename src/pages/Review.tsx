import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
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
  const addXP = useProgressStore(s => s.addXP);

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
  const [sessionXP, setSessionXP] = useState(0);

  const handleReveal = () => {
    setShowing('back');
    if (dueCards[idx]) speak(dueCards[idx].french);
  };

  const handleRate = (correct: boolean) => {
    if (idx >= dueCards.length) return;
    updateSRS(dueCards[idx].key, correct);
    setTally(t => correct ? { ...t, correct: t.correct + 1 } : { ...t, wrong: t.wrong + 1 });
    if (correct) {
      addXP(2);
      setSessionXP(x => x + 2);
    }
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

  const nextLessons = useMemo(() => {
    const items: { unit: (typeof UNITS)[0]; lesson: (typeof UNITS)[0]['lessons'][0] }[] = [];
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          items.push({ unit, lesson });
          if (items.length >= 3) return items;
        }
      }
    }
    return items;
  }, [completedLessons]);

  if (dueCards.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 22, stiffness: 300 }} className="space-y-5">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-primary">All caught up!</h1>
          <p className="text-secondary">
            No cards due right now.{completedLessons.length > 0 ? ' Come back tomorrow — or keep going with a new lesson.' : ' Complete some lessons to grow your review deck.'}
          </p>

          {nextLessons.length > 0 && (
            <div className="text-left mt-2">
              <p className="section-label text-left">Up next</p>
              <div className="inset-group">
                {nextLessons.map(({ unit, lesson }, i) => (
                  <Link
                    key={lesson.id}
                    to={`/unit/${unit.slug}/lesson/${lesson.id}`}
                    className="no-underline flex items-center gap-3 p-3.5 transition-colors hover:bg-[var(--bg-card-hover)]"
                    style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
                  >
                    <span
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `color-mix(in srgb, ${unit.color} 14%, transparent)` }}
                    >
                      {unit.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary leading-snug">{lesson.title}</p>
                      <p className="text-xs text-muted">{unit.title}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted opacity-50 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link to="/" className="inline-block">
            <Button variant="tinted">Back to Home</Button>
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
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 18, stiffness: 280 }} className="space-y-4">
          <div className="text-5xl">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
          <h1 className="text-2xl font-bold text-primary">Session complete!</h1>
          <p className="text-secondary">
            {tally.correct} correct out of {total} · {pct}%
          </p>
          {sessionXP > 0 && (
            <div className="inline-flex items-center gap-1.5 xp-badge text-sm px-3 py-1.5">
              ⚡ +{sessionXP} XP earned
            </div>
          )}
          <div className="mt-6">
            <Link to="/"><Button variant="tinted">Back to Home</Button></Link>
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
          aria-label="Back to home"
          className="w-9 h-9 flex items-center justify-center rounded-full ios-press no-underline"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-1)' }}
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted mb-1 font-medium">
            <span>Review session</span>
            <span>{idx + 1} / {dueCards.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
              animate={{ width: `${(idx / dueCards.length) * 100}%` }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
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
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="space-y-4"
          >
            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', damping: 20, stiffness: 500 }}
              className="card p-8 text-center min-h-[240px] flex flex-col items-center justify-center gap-3 cursor-pointer select-none"
              style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-2)' }}
              onClick={handleReveal}
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                {card.unitEmoji} {card.lessonTitle}
              </p>
              <p className="text-3xl font-bold font-display" style={{ color: 'var(--accent)' }}>
                {card.french}
              </p>
              {card.pronunciation && (
                <p className="text-sm text-muted italic">/{card.pronunciation}/</p>
              )}
              <button
                onClick={e => { e.stopPropagation(); speak(card.french); }}
                className="mt-1 w-10 h-10 flex items-center justify-center rounded-full ios-press cursor-pointer"
                style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)', border: 'none' }}
                aria-label="Play pronunciation"
              >
                <Volume2 size={18} />
              </button>
            </motion.div>

            <motion.button
              onClick={handleReveal}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', damping: 20, stiffness: 500 }}
              className="w-full py-3.5 text-sm font-medium text-muted rounded-2xl cursor-pointer transition-colors hover:text-primary"
              style={{ border: '1.5px dashed var(--border)', background: 'transparent' }}
            >
              Tap to reveal · Space / Enter
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key={`back-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="space-y-4"
          >
            <div
              className="card p-8 min-h-[240px] flex flex-col items-center justify-center gap-3 text-center"
              style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-2)' }}
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">English</p>
              <p className="text-2xl font-bold text-primary">{card.english}</p>

              {card.example && (
                <div className="mt-2 p-3 text-left w-full" style={{ backgroundColor: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)' }}>
                  <p className="text-sm italic font-medium font-display" style={{ color: 'var(--accent)' }}>{card.example}</p>
                  <p className="text-xs text-muted mt-0.5">{card.exampleTranslation}</p>
                </div>
              )}

              {card.funnyNote && (
                <p className="text-xs text-secondary italic pt-2" style={{ borderTop: '0.5px solid var(--hairline)' }}>
                  💬 {card.funnyNote}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', damping: 20, stiffness: 500 }}
                onClick={() => handleRate(false)}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)',
                  color: 'var(--danger)',
                  border: 'none',
                }}
              >
                <XCircle size={20} /> Not quite
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', damping: 20, stiffness: 500 }}
                onClick={() => handleRate(true)}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  border: 'none',
                }}
              >
                <CheckCircle2 size={20} /> Got it
              </motion.button>
            </div>
            <p className="text-center text-xs text-muted">← Not quite · Got it →</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
