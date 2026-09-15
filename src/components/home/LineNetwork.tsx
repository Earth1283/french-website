import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { A1_UNIT_IDS } from '../../data/units';
import { LEVELS, LINES } from '../../data/lines';
import type { Line } from '../../data/lines';
import { Roundel } from '../ui/Roundel';
import { LevelTag, StationDots } from '../ui/Signage';

interface LineNetworkProps {
  completedLessons: string[];
  slangUnlocked: boolean;
  query: string;
}

function fuzzyMatch(query: string, target: string): boolean {
  const needle = query.toLowerCase();
  const haystack = target.toLowerCase();
  let matched = 0;
  for (let i = 0; i < haystack.length && matched < needle.length; i++) {
    if (haystack[i] === needle[matched]) matched++;
  }
  return matched === needle.length;
}

function LineRow({ line, completedLessons, locked }: { line: Line; completedLessons: string[]; locked: boolean }) {
  const { unit } = line;
  const done = unit.lessons.filter(lesson => completedLessons.includes(lesson.id)).length;

  if (locked) {
    return (
      <Link to={`/unit/${unit.slug}`} className="linerow linerow--locked">
        <Roundel line={line} locked />
        <span className="min-w-0">
          <span className="linerow__title block">{unit.title}</span>
          <span className="linerow__sub block">Finish 2 lines to open this one</span>
        </span>
        <span className="t-small flex items-center gap-1.5">
          <Lock size={16} aria-hidden="true" />
          Locked
        </span>
      </Link>
    );
  }

  return (
    <Link to={`/unit/${unit.slug}`} className="linerow">
      <Roundel line={line} />
      <span className="min-w-0">
        <span className="linerow__title block">{unit.title}</span>
        <span className="linerow__sub block">{unit.tagline}</span>
      </span>
      <StationDots line={line} done={done} total={unit.lessons.length} />
    </Link>
  );
}

export function LineNetwork({ completedLessons, slangUnlocked, query }: LineNetworkProps) {
  const isLocked = (line: Line) => line.unit.id === 'slang' && !slangUnlocked;
  const trimmed = query.trim();

  if (trimmed) {
    const matches = LINES.filter(line => fuzzyMatch(trimmed, `${line.unit.title} ${line.unit.tagline}`));
    if (matches.length === 0) {
      return <p className="t-body py-8">No lines match “{trimmed}”. Try a topic such as food or trains.</p>;
    }
    return (
      <div className="lines lines--2 mt-4">
        {matches.map(line => (
          <LineRow key={line.unit.id} line={line} completedLessons={completedLessons} locked={isLocked(line)} />
        ))}
      </div>
    );
  }

  return (
    <>
      {LEVELS.map(level => (
        <section key={level.id} aria-labelledby={`level-${level.id}`}>
          <div className="line-group">
            <h3 id={`level-${level.id}`} className="line-group__name">
              {level.name}
            </h3>
            <LevelTag level={level} />
          </div>
          {level.id === 'core' && (
            <p className="line-group__note">
              The A1 curriculum. Finish all {A1_UNIT_IDS.length} lines to earn the A1 stamp.
            </p>
          )}
          <div className="lines lines--2">
            {LINES.filter(line => line.level.id === level.id).map(line => (
              <LineRow key={line.unit.id} line={line} completedLessons={completedLessons} locked={isLocked(line)} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
