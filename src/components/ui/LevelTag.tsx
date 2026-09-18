import type { Unit } from '../../types';

const ADVANCED_TAGS = [
  { flag: 'isBridge', label: 'A2→B1', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  { flag: 'isB1', label: 'B1', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { flag: 'isB2', label: 'B2', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
] as const;

export function AdvancedLevelTag({ unit, size = 'sm' }: { unit: Unit; size?: 'sm' | 'md' }) {
  const tag = ADVANCED_TAGS.find(t => unit[t.flag]);
  if (!tag) return null;
  const text = size === 'sm' ? 'text-[0.68rem]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${text} ${tag.className}`}>
      {tag.label}
    </span>
  );
}
