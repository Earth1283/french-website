import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, Eye } from 'lucide-react';
import type { Sentence, Token } from '../types';
import { englishText, frenchOrder } from '../sentence';
import { roleColor } from '../roles';
import { Button } from '../../components/ui/Button';

const MISSES_BEFORE_REVEAL = 2;

interface TileBuilderProps {
  sentence: Sentence;
  solved: boolean;
  calm: boolean;
  onSolved: () => void;
}

/** Deterministic shuffle that never hands back the answer already in order. */
export function scrambleTiles(tokens: Token[]): Token[] {
  if (tokens.length < 2) return tokens;
  const seed = tokens.map(t => t.id).join('|');
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const out = [...tokens];
  for (let i = out.length - 1; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    const j = hash % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  const inOrder = out.every((t, i) => t.fr === tokens[i].fr);
  return inOrder ? [...out.slice(1), out[0]] : out;
}

export function TileBuilder({ sentence, solved, calm, onSolved }: TileBuilderProps) {
  const answer = useMemo(() => frenchOrder(sentence), [sentence]);
  const tiles = useMemo(() => scrambleTiles(answer), [answer]);
  const [placed, setPlaced] = useState<number[]>(() => (solved ? answer.map(t => tiles.indexOf(t)) : []));
  const [wrongAt, setWrongAt] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const place = (tileIndex: number) => {
    if (solved) return;
    const next = [...placed, tileIndex];
    setPlaced(next);
    setWrongAt(new Set());
    if (next.length < tiles.length) return;
    const wrong = new Set(next.flatMap((ti, pos) => (tiles[ti].fr === answer[pos].fr ? [] : [pos])));
    if (wrong.size === 0) {
      onSolved();
    } else {
      setWrongAt(wrong);
      setMisses(m => m + 1);
      setAttempt(a => a + 1);
    }
  };

  const unplace = (pos: number) => {
    if (solved) return;
    setPlaced(placed.filter((_, i) => i !== pos));
    setWrongAt(new Set());
  };

  const reveal = () => {
    setPlaced(answer.map(t => tiles.indexOf(t)));
    setWrongAt(new Set());
    onSolved();
  };

  const tileStyle = (token: Token, state: 'idle' | 'wrong' | 'solved') => {
    const color = roleColor(token.role);
    return {
      color: 'var(--text-primary)',
      backgroundColor: state === 'wrong'
        ? 'color-mix(in srgb, var(--danger) 10%, var(--bg-card))'
        : `color-mix(in srgb, ${color} 11%, var(--bg-card))`,
      border: state === 'wrong' ? '1.5px dashed var(--danger)' : `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
      borderBottom: state === 'wrong' ? '3px solid var(--danger)' : `3px solid ${color}`,
    };
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        Build it in French: <span className="font-semibold text-primary">“{englishText(sentence)}”</span>
      </p>

      <div
        data-testid="tile-answer"
        className="min-h-[3.25rem] rounded-xl px-2 py-2 flex flex-wrap items-center gap-1.5"
        style={{
          backgroundColor: 'var(--bg-inset)',
          border: `1.5px ${solved ? 'solid var(--success)' : 'dashed var(--border)'}`,
        }}
      >
        {placed.length === 0 && <span className="text-xs text-muted px-1">Tap the words below in French order</span>}
        {placed.map((ti, pos) => (
          <motion.button
            key={`${ti}-${pos}-${wrongAt.has(pos) ? attempt : 0}`}
            type="button"
            layout={!calm}
            onClick={() => unplace(pos)}
            disabled={solved}
            aria-label={`Remove ${tiles[ti].fr}`}
            className={`rounded-lg px-2.5 py-1 text-base font-semibold cursor-pointer disabled:cursor-default ${wrongAt.has(pos) && !calm ? 'tile-shake' : ''}`}
            style={tileStyle(tiles[ti], wrongAt.has(pos) ? 'wrong' : 'idle')}
          >
            {tiles[ti].fr}
          </motion.button>
        ))}
      </div>

      {!solved && (
        <div className="flex flex-wrap gap-1.5" data-testid="tile-pool">
          {tiles.map((token, ti) => placed.includes(ti) ? null : (
            <motion.button
              key={ti}
              type="button"
              layout={!calm}
              onClick={() => place(ti)}
              className="rounded-lg px-2.5 py-1 text-base font-semibold cursor-pointer"
              style={tileStyle(token, 'idle')}
            >
              {token.fr}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap min-h-[2.25rem]">
        {solved ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={16} /> Parfait — that's the French order.
          </p>
        ) : (
          <>
            {wrongAt.size > 0 && (
              <p className="text-sm flex-1" style={{ color: 'var(--danger)' }}>
                Not quite — tap the dashed {wrongAt.size === 1 ? 'word' : 'words'} to take {wrongAt.size === 1 ? 'it' : 'them'} back.
              </p>
            )}
            {placed.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setPlaced([]); setWrongAt(new Set()); }}>
                <RotateCcw size={14} /> Reset
              </Button>
            )}
            {misses >= MISSES_BEFORE_REVEAL && (
              <Button variant="tinted" size="sm" onClick={reveal}>
                <Eye size={14} /> Show me
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
