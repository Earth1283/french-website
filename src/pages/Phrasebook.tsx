import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Volume2, Copy, Check, Zap } from 'lucide-react';
import { UNITS, getAllVocab } from '../data/units';

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  }
}

const PAGE_SIZE = 60;

export function Phrasebook() {
  const [query, setQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // getAllVocab() builds a fresh array each call — memoize so it's a stable
  // dependency (an unstable dep here re-ran the filter every render).
  const allVocab = useMemo(() => getAllVocab(), []);

  const filtered = useMemo(() => {
    return allVocab.filter(v => {
      if (emergencyOnly && v.unitId !== 'emergency') return false;
      if (unitFilter !== 'all' && v.unitId !== unitFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        v.french.toLowerCase().includes(q) ||
        v.english.toLowerCase().includes(q) ||
        v.pronunciation?.toLowerCase().includes(q)
      );
    });
  }, [query, unitFilter, emergencyOnly, allVocab]);

  // Reset paging when the filters change (in an effect, not during render).
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [query, unitFilter, emergencyOnly]);

  const copyPhrase = (french: string, id: string) => {
    navigator.clipboard.writeText(french).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-1">Phrasebook</h1>
        <p className="text-secondary">
          Every phrase from every lesson, searchable. {allVocab.length} phrases total.
        </p>
      </motion.div>

      {/* Search & filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search phrases, translations, or pronunciation"
            className="ios-input pl-10"
            style={{ borderRadius: 99 }}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <motion.button
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', damping: 20, stiffness: 500 }}
            onClick={() => setEmergencyOnly(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            style={emergencyOnly
              ? { backgroundColor: 'var(--danger)', color: '#fff', border: '1px solid transparent' }
              : { backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--hairline)' }
            }
          >
            <Zap size={12} /> I need this NOW
          </motion.button>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setUnitFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ios-press"
              style={unitFilter === 'all' && !emergencyOnly
                ? { backgroundColor: 'var(--accent)', color: '#fff', border: '1px solid transparent' }
                : { backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--hairline)' }
              }
            >
              All
            </button>
            {UNITS.map(u => (
              <button
                key={u.id}
                onClick={() => { setUnitFilter(u.id); setEmergencyOnly(false); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ios-press"
                style={unitFilter === u.id && !emergencyOnly
                  ? { backgroundColor: u.color, color: '#fff', border: '1px solid transparent' }
                  : { backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--hairline)' }
                }
              >
                {u.emoji} {u.tagline.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <p className="section-label">{filtered.length} phrases</p>

      {filtered.length > 0 && <div className="inset-group">
        {filtered.slice(0, displayCount).map((v, i) => {
          const id = `${v.unitId}-${v.lessonId}-${i}`;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.015, 0.25) }}
              className="p-4 flex items-start gap-4"
              style={i > 0 ? { borderTop: '0.5px solid var(--hairline)' } : undefined}
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold font-display" style={{ color: 'var(--accent)' }}>
                  {v.french}
                </p>
                <p className="text-sm text-primary mt-0.5">{v.english}</p>
                {v.pronunciation && (
                  <p className="text-xs text-muted italic mt-0.5">/{v.pronunciation}/</p>
                )}
                {v.funnyNote && (
                  <p className="text-xs text-secondary italic mt-1 line-clamp-2">
                    💬 {v.funnyNote}
                  </p>
                )}
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => speak(v.french)}
                  className="w-8 h-8 flex items-center justify-center rounded-full ios-press cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)', border: 'none' }}
                  title="Play pronunciation"
                  aria-label="Play pronunciation"
                >
                  <Volume2 size={14} />
                </button>
                <button
                  onClick={() => copyPhrase(v.french, id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full ios-press cursor-pointer"
                  style={{
                    backgroundColor: copiedId === id ? 'var(--success-light)' : 'var(--bg-inset)',
                    color: copiedId === id ? 'var(--success)' : 'var(--text-muted)',
                    border: 'none',
                  }}
                  title="Copy phrase"
                  aria-label="Copy phrase"
                >
                  {copiedId === id ? <Check size={14} /> : <Copy size={13} />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>}

      {filtered.length > displayCount && (
        <div className="text-center mt-4">
          <button
            onClick={() => setDisplayCount(c => c + PAGE_SIZE)}
            className="px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-colors ios-press"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--hairline)' }}
          >
            Show more ({filtered.length - displayCount} remaining)
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No phrases found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
