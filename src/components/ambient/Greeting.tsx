import { useClock } from '../../hooks/useClock';
import { FrenchFlag } from '../ui/FrenchFlag';

/** Time-aware French greeting with an English subtitle. */
function greetingFor(hour: number): { fr: string; en: string } {
  if (hour >= 5 && hour < 12) return { fr: 'Bonjour', en: 'Good morning' };
  if (hour >= 12 && hour < 18) return { fr: 'Bon après-midi', en: 'Good afternoon' };
  return { fr: 'Bonsoir', en: 'Good evening' };
}

export function Greeting({ name }: { name?: string }) {
  const now = useClock(60_000);
  const { fr, en } = greetingFor(now.getHours());

  return (
    <div className="text-center text-white">
      <h1 className="font-display text-[clamp(1.6rem,5vw,2.4rem)] font-semibold tracking-tight inline-flex items-center gap-2">
        {fr}
        {name ? `, ${name}` : ''}
        <FrenchFlag size={22} className="opacity-70 inline-block" />
      </h1>
      <p className="mt-0.5 text-sm text-white/65">{en}</p>
    </div>
  );
}
