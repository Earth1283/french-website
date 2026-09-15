import { lineFor } from '../../data/lines';
import type { NextUp } from '../../utils/nextLesson';
import { Roundel } from '../ui/Roundel';
import { Ticket } from '../ui/Signage';
import { ButtonLink } from '../ui/Button';

export function TodayTicket({ unit, lesson }: NextUp) {
  const line = lineFor(unit);
  const position = unit.lessons.findIndex(candidate => candidate.id === lesson.id) + 1;

  return (
    <Ticket
      stub={
        <>
          <Roundel line={line} size="lg" />
          <span aria-hidden="true">Line {line.number}</span>
        </>
      }
    >
      <h3 className="ticket__title">{lesson.title}</h3>
      <p className="ticket__unit">{unit.title}</p>
      <p className="ticket__meta num">
        <span>
          Lesson {position} of {unit.lessons.length}
        </span>
        <b>+{lesson.xpReward} XP</b>
      </p>
      <ButtonLink to={`/unit/${unit.slug}/lesson/${lesson.id}`} block className="mt-4">
        Start lesson
      </ButtonLink>
    </Ticket>
  );
}
