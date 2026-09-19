import { useReducedMotion } from 'framer-motion';
import { useProgressStore } from '../stores/progressStore';

/** True when the OS asks for reduced motion or the learner turned on Reduced GPU mode. */
export function useCalmMotion(): boolean {
  const prefersReduced = useReducedMotion();
  const reducedGpu = useProgressStore(s => s.reducedGpu);
  return !!prefersReduced || reducedGpu;
}
