import { Link } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={isLocked ? {} : { scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`card card-lift p-5 flex flex-col gap-3 relative overflow-hidden cursor-pointer ${
        isLocked ? 'opacity-70' : ''
      }`}
    >
      {/* Color stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-[var(--radius)]"
        style={{ backgroundColor: unit.color }}
      />

      <div className="flex items-start justify-between gap-2 mt-1">
        <span className="text-3xl">{unit.emoji}</span>
        <div className="flex flex-col items-end gap-1">
          {isLocked && (
            <span className="flex items-center gap-1 text-xs text-[--text-muted] font-medium">
              <Lock size={12} /> Locked
            </span>
          )}
          {isComplete && !isLocked && (
            <CheckCircle2 size={20} className="text-[--success]" />
          )}
          {unit.isA1 && !unit.isBeyondA1 && (
            <span className="a1-tag">A1</span>
          )}
          {unit.isBeyondA1 && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
              Bonus
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base text-[--text-primary] leading-tight">
          {unit.title}
        </h3>
        <p className="text-xs text-[--text-muted] font-medium mt-0.5">{unit.tagline}</p>
      </div>

      <p className="text-sm text-[--text-secondary] leading-relaxed line-clamp-2">
        {unit.funnyDescription.split('.')[0]}.
      </p>

      <div className="mt-auto">
        <ProgressBar value={progress} color={unit.color} height={5} />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-[--text-muted]">
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
          </span>
          <span className="text-xs font-semibold" style={{ color: unit.color }}>
            {progress}% done
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (isLocked) {
    return <div className="select-none">{content}</div>;
  }

  return (
    <Link to={`/unit/${unit.slug}`} className="no-underline block">
      {content}
    </Link>
  );
}
