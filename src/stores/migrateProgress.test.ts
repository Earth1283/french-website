import { describe, expect, it } from 'vitest';
import { migrateProgress } from './migrateProgress';

describe('progress store migration to version 1', () => {
  it('drops the retired appearance settings and keeps everything else', () => {
    const migrated = migrateProgress({
      completedLessons: ['food-1'],
      xp: 240,
      darkMode: true,
      accentColor: '#E63946',
      appleMode: true,
      reducedGpu: false,
    });
    expect(migrated).toEqual({ completedLessons: ['food-1'], xp: 240, darkMode: true });
  });

  it('tolerates an empty persisted state', () => {
    expect(migrateProgress(undefined)).toEqual({});
  });
});
