import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Lock, MousePointerClick, Sparkles, Undo2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { InteractiveLesson, Role, Scene } from './types';
import { englishText } from './sentence';
import { loadInteractive } from './registry';
import { useCalmMotion } from './useCalmMotion';
import { TooltipScope } from './primitives/Tooltip';
import { MorphSentence } from './primitives/MorphSentence';
import { AlignedSentence } from './primitives/AlignedSentence';
import { TileBuilder } from './primitives/TileBuilder';
import { RoleLegend } from './primitives/RoleLegend';
import { NumberFormula } from './primitives/NumberFormula';

interface InteractivePlayerProps {
  lessonId: string;
  accentColor?: string;
  sceneIndex: number;
  onSceneChange: (index: number) => void;
  onComplete: () => void;
  completeLabel?: string;
}

export function InteractivePlayer({
  lessonId,
  accentColor,
  sceneIndex,
  onSceneChange,
  onComplete,
  completeLabel = 'Continue',
}: InteractivePlayerProps) {
  const [lesson, setLesson] = useState<InteractiveLesson | null>(null);
  const [failed, setFailed] = useState(false);
  // Scenes before the resume point were already solved in this session.
  const [solved, setSolved] = useState<Set<number>>(() => new Set(Array.from({ length: sceneIndex }, (_, i) => i)));
  const calm = useCalmMotion();
  const accent = accentColor ?? 'var(--accent)';

  useEffect(() => {
    let live = true;
    loadInteractive(lessonId).then(l => live && setLesson(l)).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [lessonId]);

  const total = lesson?.scenes.length ?? 0;
  const index = Math.min(sceneIndex, Math.max(total - 1, 0));
  const canAdvance = solved.has(index);
  const isLast = index === total - 1;

  useEffect(() => {
    if (!lesson) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && canAdvance && !isLast) {
        e.preventDefault();
        onSceneChange(index + 1);
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        onSceneChange(index - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lesson, index, canAdvance, isLast, onSceneChange]);

  if (failed) {
    return (
      <div className="text-center space-y-4 py-10">
        <p className="text-secondary">This interactive lesson couldn't load.</p>
        <Button onClick={onComplete}>{completeLabel} <ArrowRight size={16} /></Button>
      </div>
    );
  }
  if (!lesson) return <div className="min-h-[50vh]" aria-busy="true" />;

  const scene = lesson.scenes[index];

  return (
    <TooltipScope>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <span className="chip"><Sparkles size={12} /> Interactive · {total} scenes</span>
        <div className="flex items-center gap-1.5" aria-label={`Scene ${index + 1} of ${total}`}>
          {lesson.scenes.map((s, i) => (
            <span
              key={s.id}
              className="rounded-full"
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                backgroundColor: i <= index ? accent : 'var(--border)',
                transition: 'width 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), background-color 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Enter-only transition: an exiting scene left in the DOM would sit on top of the new one and swallow clicks. */}
      <motion.div
        key={scene.id}
        initial={calm ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      >
        <SceneView
          scene={scene}
          number={index + 1}
          total={total}
          solved={solved.has(index)}
          calm={calm}
          onSolved={() => setSolved(prev => new Set(prev).add(index))}
        />
      </motion.div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="secondary" onClick={() => onSceneChange(index - 1)} disabled={index === 0}>
          <ChevronLeft size={16} /> Prev
        </Button>
        {isLast ? (
          <Button onClick={onComplete} disabled={!canAdvance}>
            {canAdvance ? <>{completeLabel} <ArrowRight size={16} /></> : <><Lock size={14} /> Solve to finish</>}
          </Button>
        ) : (
          <Button onClick={() => onSceneChange(index + 1)} disabled={!canAdvance}>
            {canAdvance ? <>Next <ChevronRight size={16} /></> : <><Lock size={14} /> Solve to continue</>}
          </Button>
        )}
      </div>
    </TooltipScope>
  );
}

interface SceneViewProps {
  scene: Scene;
  number: number;
  total: number;
  solved: boolean;
  calm: boolean;
  onSolved: () => void;
}

function SceneView({ scene, number, total, solved, calm, onSolved }: SceneViewProps) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [french, setFrench] = useState(false);
  const [seenFrench, setSeenFrench] = useState<Set<number>>(new Set());
  const sentence = scene.sentences[sentenceIndex];
  const roles = sceneRoles(scene);

  const pickSentence = (i: number) => {
    setSentenceIndex(i);
    setFrench(false);
  };

  const toggle = () => {
    setFrench(f => !f);
    setSeenFrench(prev => new Set(prev).add(sentenceIndex));
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Scene {number} of {total}</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-primary">{scene.title}</h2>
        <p className="text-secondary mt-2 leading-relaxed">{scene.idea}</p>
      </header>

      <section className="card p-4 sm:p-5 space-y-4" aria-label="Watch it move">
        {scene.sentences.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Example sentences">
            {scene.sentences.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === sentenceIndex}
                onClick={() => pickSentence(i)}
                className="text-xs font-medium rounded-full px-3 py-1 cursor-pointer transition-colors"
                style={{
                  backgroundColor: i === sentenceIndex ? 'var(--accent-tint)' : 'transparent',
                  color: i === sentenceIndex ? 'var(--accent)' : 'var(--text-secondary)',
                  border: '1px solid var(--hairline)',
                }}
              >
                {englishText(s)}
              </button>
            ))}
          </div>
        )}

        <NumberFormula sentence={sentence} idPrefix={`${scene.id}-${sentenceIndex}-formula`} />

        <p className="text-center text-[0.7rem] font-bold uppercase tracking-wider text-muted">
          {french ? 'Français' : 'English'}
        </p>
        <MorphSentence sentence={sentence} french={french} idPrefix={`${scene.id}-${sentenceIndex}`} calm={calm} />

        <div className="flex justify-center">
          <Button variant={french ? 'secondary' : 'primary'} size="sm" onClick={toggle}>
            {french ? <><Undo2 size={14} /> Back to English</> : <><Sparkles size={14} /> Make it French</>}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {seenFrench.has(sentenceIndex) && (
            <motion.div
              key={`aligned-${sentenceIndex}`}
              initial={calm ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="pt-4 space-y-3" style={{ borderTop: '1px solid var(--hairline)' }}>
                <p className="text-xs text-muted inline-flex items-center gap-1.5">
                  <MousePointerClick size={13} /> Word by word — hover or tap any word
                </p>
                <AlignedSentence sentence={sentence} idPrefix={`${scene.id}-${sentenceIndex}-aligned`} calm={calm} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <RoleLegend roles={roles} />
      </section>

      <section className="card p-4 sm:p-5 space-y-3" aria-label="Your turn">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your turn</p>
        <NumberFormula sentence={scene.check} idPrefix={`${scene.id}-check-formula`} />
        <TileBuilder sentence={scene.check} solved={solved} calm={calm} onSolved={onSolved} />
      </section>
    </div>
  );
}

const ROLE_ORDER: Role[] = ['subject', 'verb', 'object', 'negation', 'adverb', 'article', 'noun', 'adjective', 'multiplier', 'base', 'addend', 'hour', 'fraction'];

function sceneRoles(scene: Scene): Role[] {
  const used = new Set(scene.sentences.flatMap(s => s.tokens.map(t => t.role)));
  return ROLE_ORDER.filter(r => used.has(r));
}
