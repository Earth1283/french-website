import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap } from 'lucide-react';
import { levelStyle, lineStyle } from '../../data/lines';
import type { Level, Line } from '../../data/lines';

export function Wordmark({ size = 'md', to }: { size?: 'md' | 'lg'; to?: string }) {
  const classes = size === 'lg' ? 'wordmark wordmark--lg' : 'wordmark';
  const letters = (
    <>
      <span className="wordmark__small">Bonjour</span>
      <span className="wordmark__big">Survival</span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes} aria-label="Bonjour Survival, home">
        {letters}
      </Link>
    );
  }
  return (
    <span className={classes} role="img" aria-label="Bonjour Survival">
      {letters}
    </span>
  );
}

export function LevelTag({ level }: { level: Level }) {
  return (
    <span className="tag" style={levelStyle(level)}>
      {level.tag}
    </span>
  );
}

export function StatChip({ kind, children, label }: { kind: 'streak' | 'xp'; children: ReactNode; label?: string }) {
  const Icon = kind === 'streak' ? Flame : Zap;
  return (
    <span className="stat" aria-label={label}>
      <Icon aria-hidden="true" />
      {children}
    </span>
  );
}

export function StationDots({ line, done, total }: { line: Line; done: number; total: number }) {
  return (
    <span className="stations" style={lineStyle(line)} role="img" aria-label={`${done} of ${total} lessons done`}>
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < done ? 'done' : index === done && done > 0 ? 'here' : undefined} />
      ))}
    </span>
  );
}

export function TripProgress({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="trip" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={step}>
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < step ? 'done' : undefined} />
      ))}
    </div>
  );
}

export function Ticket({ stub, children, className }: { stub: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className ? `ticket ${className}` : 'ticket'}>
      <div className="ticket__stub">{stub}</div>
      <div className="ticket__body">{children}</div>
    </div>
  );
}

export function KeyCap({ children }: { children: ReactNode }) {
  return (
    <kbd className="key" aria-hidden="true">
      {children}
    </kbd>
  );
}
