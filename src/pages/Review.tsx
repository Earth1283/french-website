import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { UNITS } from '../data/units';
import { lineFor } from '../data/lines';
import { useProgressStore } from '../stores/progressStore';
import { defaultCard, isDue, vocabKey } from '../utils/srs';
import { Button, ButtonLink } from '../components/ui/Button';
import { FlashCard } from '../components/lesson/FlashCard';
import { StationDots, StatChip, TripProgress } from '../components/ui/Signage';
import { Roundel } from '../components/ui/Roundel';
import type { VocabItem } from '../types';

interface ReviewCard extends VocabItem { key: string; lessonTitle: string; }

export function Review() {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const srsData = useProgressStore((state) => state.srsData);
  const updateSRS = useProgressStore((state) => state.updateSRS);
  const addXP = useProgressStore((state) => state.addXP);

  const dueCards = useMemo<ReviewCard[]>(() => {
    const cards: ReviewCard[] = [];
    for (const unit of UNITS) for (const lesson of unit.lessons) {
      if (!completedLessons.includes(lesson.id)) continue;
      lesson.vocab.forEach((item, index) => {
        const key = vocabKey(lesson.id, index);
        if (isDue(srsData[key] ?? defaultCard())) cards.push({ ...item, key, lessonTitle: lesson.title });
      });
    }
    for (let index = cards.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[swap]] = [cards[swap], cards[index]];
    }
    return cards;
    // Keep the deck stable while review updates its own SRS records.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ correct: 0, wrong: 0 });
  const [sessionXP, setSessionXP] = useState(0);

  function rate(correct: boolean) {
    const card = dueCards[index];
    if (!card) return;
    updateSRS(card.key, correct);
    setTally((value) => correct ? { ...value, correct: value.correct + 1 } : { ...value, wrong: value.wrong + 1 });
    if (correct) { addXP(2); setSessionXP((value) => value + 2); }
    setIndex((value) => value + 1);
    setFlipped(false);
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!dueCards[index]) return;
      if (!flipped && [' ', 'Enter', 'ArrowDown'].includes(event.key)) { event.preventDefault(); setFlipped(true); }
      else if (flipped && ['ArrowRight', 'y', 'Y'].includes(event.key)) { event.preventDefault(); rate(true); }
      else if (flipped && ['ArrowLeft', 'n', 'N'].includes(event.key)) { event.preventDefault(); rate(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, index]);

  const nextLessons = useMemo(() => {
    const result: { unit: (typeof UNITS)[number]; lesson: (typeof UNITS)[number]['lessons'][number] }[] = [];
    for (const unit of UNITS) for (const lesson of unit.lessons) if (!completedLessons.includes(lesson.id) && result.length < 3) result.push({ unit, lesson });
    return result;
  }, [completedLessons]);

  if (dueCards.length === 0) {
    return (
      <div className="page page--narrow">
        <div className="sheet p-6 text-center"><Check size={32} className="mx-auto text-go mb-3" /><h1 className="h-page">All caught up</h1><p className="t-body text-ink-2 mt-2">No cards are due now. {completedLessons.length ? 'Come back tomorrow, or keep going.' : 'Complete lessons to grow your review deck.'}</p></div>
        {nextLessons.length > 0 && <section className="mt-6"><h2 className="h-section mb-3">Up next</h2><div className="sheet">{nextLessons.map(({ unit, lesson }) => { const line = lineFor(unit); return <ButtonLink key={lesson.id} to={`/unit/${unit.slug}/lesson/${lesson.id}`} variant="quiet" className="w-full justify-start border-b border-rule last:border-0 rounded-none py-3"><Roundel line={line} size="sm" /><span className="text-left flex-1"><span className="block font-semibold text-ink">{lesson.title}</span><span className="block t-small text-ink-3">{unit.title}</span></span><StationDots line={line} done={0} total={unit.lessons.length} /><ChevronRight size={16} /></ButtonLink>; })}</div></section>}
        <ButtonLink to="/learn" variant="secondary" className="mt-6"><ChevronLeft size={16} /> Back to Learn</ButtonLink>
      </div>
    );
  }

  if (index >= dueCards.length) {
    const total = tally.correct + tally.wrong;
    const percent = total ? Math.round((tally.correct / total) * 100) : 0;
    return <div className="page page--form"><div className="sheet p-6 text-center"><Check size={32} className="mx-auto text-go mb-3" /><h1 className="h-page">Session complete</h1><p className="t-body text-ink-2 mt-2">{tally.correct} correct out of {total} · {percent}%</p>{sessionXP > 0 && <div className="mt-4"><StatChip kind="xp">+{sessionXP} XP earned</StatChip></div>}<ButtonLink to="/learn" variant="secondary" className="mt-6">Back to Learn</ButtonLink></div></div>;
  }

  const card = dueCards[index];
  return (
    <div className="page page--narrow">
      <header className="flex items-center gap-3 mb-6"><ButtonLink to="/learn" variant="quiet" iconOnly aria-label="Back to Learn"><ChevronLeft size={20} /></ButtonLink><div className="flex-1"><div className="flex justify-between t-small text-ink-3 mb-2"><span>Review · {card.lessonTitle}</span><span className="tabular-nums">{index + 1} / {dueCards.length}</span></div><TripProgress step={index} total={dueCards.length} label={`${index} of ${dueCards.length} reviewed`} /></div></header>
      <FlashCard item={card} index={index} total={dueCards.length} flipped={flipped} onFlipToggle={() => setFlipped((value) => !value)} />
      {!flipped ? <Button block variant="secondary" className="mt-5" onClick={() => setFlipped(true)}><RotateCcw size={17} /> Reveal answer</Button> : <div className="grid grid-cols-2 gap-3 mt-5"><Button variant="secondary" onClick={() => rate(false)}><X size={18} /> Not quite</Button><Button onClick={() => rate(true)}><Check size={18} /> Got it</Button></div>}
      <p className="t-small text-ink-3 text-center mt-3">{flipped ? '← Not quite · Got it →' : 'Space or Enter to reveal'}</p>
    </div>
  );
}
