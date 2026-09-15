import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { lineFor } from '../../data/lines';
import type { Lesson, Unit } from '../../types';
import { Roundel } from '../ui/Roundel';

export interface RevisitItem {
  unit: Unit;
  lesson: Lesson;
  reason: string;
}

export function Revisit({ items }: { items: RevisitItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="revisit">
      <h2 id="revisit" className="h-section mb-2 text-21">
        Revisit
      </h2>
      {items.map(({ unit, lesson, reason }) => (
        <Link key={lesson.id} to={`/unit/${unit.slug}/lesson/${lesson.id}`} className="linerow">
          <Roundel line={lineFor(unit)} size="sm" />
          <span className="min-w-0">
            <span className="linerow__title block">{lesson.title}</span>
            <span className="linerow__sub block">{reason}</span>
          </span>
          <ChevronRight size={16} className="text-ink-3" aria-hidden="true" />
        </Link>
      ))}
    </section>
  );
}
