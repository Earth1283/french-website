import { Link } from 'react-router-dom';
import { Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProgressBar } from '../layout/ProgressBar';
import type { Unit } from '../../types';

interface UnitCardProps {
  unit: Unit;
  progress: number;
  isLocked: boolean;
  index: number;
}

export function UnitCard({ unit, progress, isLocked, index }: UnitCardProps) {
  const isComplete = progress === 100;
  const lessonCount = unit.lessons.length;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={isLocked ? {} : { scale: 0.97 }}
      transition={{ delay: index * 0.04, type: 'spring', damping: 24, stiffness: 300 }}
      className={`card card-lift p-5 flex flex-col gap-3 relative cursor-pointer h-full ${
        isLocked ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* iOS app-icon style emoji tile, tinted with the unit color */}
        <span
          className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${unit.color} 14%, transparent)`,
            border: `0.5px solid color-mix(in srgb, ${unit.color} 22%, transparent)`,
          }}
        >
          {unit.emoji}
        </span>
        <div className="flex flex-col items-end gap-1.5">
          {isLocked && (
            <span className="flex items-center gap-1 text-xs text-muted font-medium">
              <Lock size={12} /> Locked
            </span>
          )}
          {isComplete && !isLocked && (
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-bold text-white"
              style={{ backgroundColor: 'var(--success)' }}
            >
              ✓
            </span>
          )}
          {unit.isPreA1 && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Pre-A1
            </span>
          )}
          {unit.isA1 && !unit.isBeyondA1 && <span className="a1-tag">A1</span>}
          {unit.isA1A2 && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
              A1→A2
            </span>
          )}
          {unit.isBeyondA1 && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold bg-purple-100 text-purple-700 dark:bg-purple-600 dark:text-white">
              Bonus
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base text-primary leading-tight flex items-center gap-1">
          {unit.title}
          {!isLocked && <ChevronRight size={15} className="text-muted opacity-60" />}
        </h3>
        <p className="text-xs text-muted font-medium mt-0.5">{unit.tagline}</p>
      </div>

      <p className="text-sm text-secondary leading-relaxed line-clamp-2">
        {unit.funnyDescription.split('.')[0]}.
      </p>

      <div className="mt-auto">
        <ProgressBar value={progress} color={unit.color} height={5} />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-muted">
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
          </span>
          <span className="text-xs font-semibold" style={{ color: unit.color }}>
            {progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (isLocked) {
    return <div className="select-none h-full">{content}</div>;
  }

  return (
    <Link to={`/unit/${unit.slug}`} className="no-underline block h-full">
      {content}
    </Link>
  );
}
