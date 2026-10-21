import type { DelfLevel, SpeakingPartKind, SpeakingTask } from '../../types/exam';
import { A1_SPEAKING } from './speaking/a1';
import { A2_SPEAKING } from './speaking/a2';
import { B1_SPEAKING } from './speaking/b1';
import { B2_SPEAKING } from './speaking/b2';

export const SPEAKING_TASKS: SpeakingTask[] = [...A1_SPEAKING, ...A2_SPEAKING, ...B1_SPEAKING, ...B2_SPEAKING];

export const SPEAKING_FORMAT: Record<DelfLevel, SpeakingPartKind[]> = {
  a1: ['entretien', 'echange', 'interaction'],
  a2: ['entretien', 'monologue', 'interaction'],
  b1: ['entretien', 'interaction', 'point-de-vue'],
  b2: ['point-de-vue', 'debat'],
};

export function getSpeakingTask(id: string): SpeakingTask | undefined {
  return SPEAKING_TASKS.find(t => t.id === id);
}
