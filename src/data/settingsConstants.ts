import type { Difficulty } from '../types';

export const ACCENT_PRESETS = [
  { hex: '#E63946', label: 'French Red' },
  { hex: '#3B82F6', label: 'Bleu de France' },
  { hex: '#8B5CF6', label: 'Lavender' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#EC4899', label: 'Rose' },
  { hex: '#0EA5E9', label: 'Sky' },
];

export const DIFFICULTY_LABELS: Record<Difficulty, { name: string; desc: string }> = {
  1: { name: 'Guided', desc: 'Multiple choice answers' },
  2: { name: 'Standard', desc: 'Type your response' },
  3: { name: 'Challenge', desc: 'AI judges freely' },
};
