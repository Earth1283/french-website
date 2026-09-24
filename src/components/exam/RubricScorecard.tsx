import { BAND_POINTS, RUBRIC_CRITERIA, bandLabel, maxWritingScore, scoreBands, toOutOf25 } from '../../data/exam/rubric';
import type { DelfLevel, RubricBand, RubricCriterionId, WritingEvaluation } from '../../types/exam';

interface RubricScorecardProps {
  level: DelfLevel;
  evaluation?: WritingEvaluation | null;
  /** Editable mode: a band picker per criterion (self-assessment, teacher review). */
  bands?: Record<RubricCriterionId, RubricBand>;
  onBandChange?: (id: RubricCriterionId, band: RubricBand) => void;
}

const BANDS: RubricBand[] = [0, 1, 2, 3];

export function RubricScorecard({ level, evaluation, bands, onBandChange }: RubricScorecardProps) {
  const editable = !!onBandChange && !!bands;
  const active = editable ? bands : evaluation?.bands;
  const points = BAND_POINTS[level];
  const max = maxWritingScore(level);
  const score = editable ? scoreBands(level, bands) : evaluation?.score ?? 0;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-primary">Grille DELF {level.toUpperCase()}</p>
        <p className="text-sm">
          <span className="text-2xl font-bold text-primary">{score}</span>
          <span className="text-muted"> / {max}</span>
          {max !== 25 && <span className="text-xs text-muted"> · ≈ {toOutOf25(score, max)} / 25</span>}
        </p>
      </div>

      {evaluation?.tooShort && (
        <p className="text-xs" style={{ color: 'var(--danger)' }}>
          Under half the required length: the official grid gives 0 on every criterion.
        </p>
      )}

      <div className="space-y-3">
        {RUBRIC_CRITERIA.map(c => {
          const band = active?.[c.id] ?? 0;
          const comment = evaluation?.comments?.[c.id];
          return (
            <div key={c.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-primary">
                  {c.labelFr} <span className="text-xs font-normal text-muted">· {c.labelEn}</span>
                </p>
                <span className="text-xs font-semibold text-secondary whitespace-nowrap">
                  {points[band]} / {points[3]}
                </span>
              </div>
              {editable ? (
                <div className="seg-control" role="radiogroup" aria-label={c.labelEn}>
                  {BANDS.map(b => (
                    <button
                      key={b}
                      type="button"
                      role="radio"
                      aria-checked={band === b}
                      aria-pressed={band === b}
                      className="seg-item text-[0.7rem]"
                      onClick={() => onBandChange!(c.id, b)}
                      title={bandLabel(level, b)}
                    >
                      {b === 0 ? '0' : b === 1 ? `< ${level.toUpperCase()}` : bandLabel(level, b)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-1" aria-label={`${c.labelEn}: ${bandLabel(level, band)}`}>
                  {BANDS.slice(1).map(b => (
                    <span
                      key={b}
                      className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: b <= band ? 'var(--accent)' : 'var(--bg-inset)' }}
                    />
                  ))}
                </div>
              )}
              {editable && <p className="text-xs text-muted">At level: {c.atLevel}</p>}
              {comment && <p className="text-xs text-secondary">{comment}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
