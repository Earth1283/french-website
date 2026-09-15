import { BookOpen, Map as MapIcon, Target, Timer } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';
import { useTestStore } from '../../stores/testStore';
import { getNextLesson } from '../../utils/nextLesson';
import { lineFor } from '../../data/lines';
import { Board, BoardGlyph, BoardRow } from '../ui/Board';
import { Roundel } from '../ui/Roundel';
import { FlipClock } from './FlipClock';
import { greetingFor } from './greeting';

export function DepartureBoard({ now }: { now: Date }) {
  const completedLessons = useProgressStore(s => s.completedLessons);
  const slangUnlocked = useProgressStore(s => s.isUnit12Unlocked());
  const latestResult = useTestStore(s => s.history[s.history.length - 1]);
  const next = getNextLesson(completedLessons, slangUnlocked);
  const greeting = greetingFor(now.getHours());

  return (
    <Board
      lead={<FlipClock now={now} />}
      titleAs="h1"
      titleId="board-title"
      title={greeting.french}
      lang="fr"
      gloss={greeting.english}
      aside={
        <span className="board__status" lang="fr">
          Départs
        </span>
      }
    >
      {next ? (
        <BoardRow
          to={`/unit/${next.unit.slug}/lesson/${next.lesson.id}`}
          glyph={<Roundel line={lineFor(next.unit)} />}
          dest={next.lesson.title}
          via={`${next.unit.title}, lesson ${next.unit.lessons.indexOf(next.lesson) + 1} of ${next.unit.lessons.length}`}
          status="Now"
          now
        />
      ) : (
        <BoardRow to="/learn" glyph={<BoardGlyph><MapIcon size={16} /></BoardGlyph>} dest="Learn" via="Every line is finished" status="Open" />
      )}
      <BoardRow to="/phrasebook" glyph={<BoardGlyph><BookOpen size={16} /></BoardGlyph>} dest="Phrasebook" via="Every phrase, with audio" status="Open" />
      <BoardRow
        to="/practice"
        glyph={<BoardGlyph><Target size={16} /></BoardGlyph>}
        dest="Practice"
        via="Converse, or find your level"
        status={latestResult ? `Last: ${latestResult.cefrLevel}` : 'Open'}
      />
      <BoardRow
        to="/focus"
        glyph={<BoardGlyph><Timer size={16} /></BoardGlyph>}
        dest="Focus"
        via="A study timer with a new word every 30 seconds"
        status="25 min"
      />
    </Board>
  );
}
