const RETIRED_SETTINGS = ['accentColor', 'appleMode', 'reducedGpu'];

export function migrateProgress(persisted: unknown): Record<string, unknown> {
  const state = { ...(persisted as Record<string, unknown> | undefined) };
  for (const key of RETIRED_SETTINGS) delete state[key];
  return state;
}
