import { Settings, GraduationCap, ChevronRight } from 'lucide-react';
import { useProgressStore, BADGES } from '../stores/progressStore';
import { useTestStore } from '../stores/testStore';
import { useClassroomStore } from '../stores/classroomStore';
import { UNITS } from '../data/units';
import { Badge } from '../components/ui/Badge';
import { badgeIcon, stampTilt } from '../components/ui/badgeIcons';
import { ButtonLink } from '../components/ui/Button';
import { Roundel } from '../components/ui/Roundel';
import { StationDots } from '../components/ui/Signage';
import { Meter } from '../components/ui/Meter';
import { lineFor } from '../data/lines';
import { getLevelProgress, MAX_LEVEL } from '../utils/levels';

export function Profile() {
  const { xp, completedLessons, earnedBadges, isA1Complete, getCompletedUnits } = useProgressStore();
  const latestTestResult = useTestStore(s => s.latestResult());
  const role = useClassroomStore(s => s.role);
  const completedUnits = getCompletedUnits();
  const levelInfo = getLevelProgress(xp);

  const totalLessons = UNITS.reduce((s, u) => s + u.lessons.length, 0);

  const getUnitProgress = (unitId: string) => {
    const unit = UNITS.find(u => u.id === unitId);
    if (!unit) return { done: 0, total: 0 };
    const done = unit.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { done, total: unit.lessons.length };
  };

  return (
    <div className="page page--narrow">
      <h1 className="h-page">Me</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="sheet p-4 text-center">
          <p className="text-36 font-bold num text-amber-text leading-none">{xp}</p>
          <p className="t-small mt-2">XP earned</p>
        </div>
        <div className="sheet p-4 text-center">
          <p className="text-36 font-bold num text-ink leading-none">{levelInfo.level}</p>
          <p className="t-small mt-2">Level</p>
        </div>
        <div className="sheet p-4 text-center">
          <p className="text-36 font-bold num text-ink leading-none">{completedUnits}/{UNITS.length}</p>
          <p className="t-small mt-2">Lines done</p>
        </div>
      </div>

      {/* Level progress */}
      <div className="mt-6">
        <span className="fr-solo text-24" lang="fr">{levelInfo.name}</span>
        {!levelInfo.isMaxLevel && (
          <>
            <Meter percent={Math.min(100, (levelInfo.currentLevelXP / levelInfo.levelSpan) * 100)} label={`${levelInfo.currentLevelXP} of ${levelInfo.levelSpan} XP`} className="meter meter--wide meter--amber mt-4" />
            <p className="t-small text-ink-3 mt-2">{levelInfo.currentLevelXP} / {levelInfo.levelSpan} XP to Level {levelInfo.level + 1}</p>
          </>
        )}
        {levelInfo.isMaxLevel && (
          <p className="t-small text-ink-3 mt-2">Maximum level reached</p>
        )}
      </div>

      {/* Test result link */}
      {latestTestResult && (
        <div className="mt-6">
          <ButtonLink to="/test" variant="quiet" className="text-14">
            Last test result: {latestTestResult.cefrLevel}{latestTestResult.cefrBand ? ` · ${latestTestResult.cefrBand}` : ''}
          </ButtonLink>
        </div>
      )}

      {/* Stamps section */}
      <h2 className="h-section mt-6">Stamps</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        {Object.values(BADGES).map((badge, idx) => {
          const icon = badgeIcon(badge.id);
          const tilt = stampTilt(idx);
          return (
            <Badge
              key={badge.id}
              icon={icon}
              name={badge.name}
              description={badge.description}
              earned={earnedBadges.includes(badge.id)}
              tilt={tilt}
            />
          );
        })}
      </div>

      {/* Lines section */}
      <h2 className="h-section mt-6">Lines</h2>
      <div className="sheet rows mt-4">
        {UNITS.map((unit, idx) => {
          const { done, total } = getUnitProgress(unit.id);
          const line = lineFor(unit);
          return (
            <div key={unit.id} className="row">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Roundel line={line} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{unit.title}</p>
                  <p className="t-small text-ink-3">{done} of {total} lessons</p>
                </div>
              </div>
              <StationDots line={line} done={done} total={total} />
            </div>
          );
        })}
      </div>

      {/* Classroom and settings section */}
      <h2 className="h-section mt-6">Classroom and settings</h2>
      <div className="sheet rows mt-4">
        <ButtonLink to="/settings" variant="quiet" className="row justify-between hover:bg-inset">
          <span className="flex items-center gap-3">
            <Settings size={20} />
            <span>Settings</span>
          </span>
          <ChevronRight size={20} aria-hidden="true" />
        </ButtonLink>
        {role === null && (
          <ButtonLink to="/classes/connect" variant="quiet" className="row justify-between hover:bg-inset">
            <span className="flex items-center gap-3">
              <GraduationCap size={20} />
              <span>Join a class</span>
            </span>
            <ChevronRight size={20} aria-hidden="true" />
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
