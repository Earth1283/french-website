import { useState, useMemo } from 'react';
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

export function Phrasebook() {
  const [query, setQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allVocab = getAllVocab();

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

  const copyPhrase = (french: string, id: string) => {
    navigator.clipboard.writeText(french).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[--text-primary] mb-1">Phrasebook</h1>
        <p className="text-[--text-secondary]">
          Every phrase from every lesson, searchable. {allVocab.length} phrases total.
        </p>
      </motion.div>

      {/* Search & filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search phrases, translations, or pronunciation..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[--border] bg-[--bg] text-sm text-[--text-primary] outline-none focus:border-[--accent] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setEmergencyOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              emergencyOnly
                ? 'bg-red-500 text-white border-red-500'
                : 'border-[--border] text-[--text-muted] hover:border-red-300'
            }`}
          >
            <Zap size={12} /> I need this NOW
          </button>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setUnitFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                unitFilter === 'all' && !emergencyOnly
                  ? 'bg-[--accent] text-white'
                  : 'text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card-hover]'
              }`}
            >
              All
            </button>
            {UNITS.map(u => (
              <button
                key={u.id}
                onClick={() => { setUnitFilter(u.id); setEmergencyOnly(false); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  unitFilter === u.id && !emergencyOnly
                    ? 'text-white'
                    : 'text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card-hover]'
                }`}
                style={unitFilter === u.id && !emergencyOnly ? { backgroundColor: u.color } : {}}
              >
                {u.emoji} {u.tagline.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-xs text-[--text-muted] mb-3">{filtered.length} phrases</div>

      <div className="space-y-2">
        {filtered.map((v, i) => {
          const id = `${v.unitId}-${v.lessonId}-${i}`;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="card p-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[--accent]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {v.french}
                </p>
                <p className="text-sm text-[--text-primary] mt-0.5">{v.english}</p>
                {v.pronunciation && (
                  <p className="text-xs text-[--text-muted] italic mt-0.5">/{v.pronunciation}/</p>
                )}
                {v.funnyNote && (
                  <p className="text-xs text-[--text-secondary] italic mt-1 line-clamp-2">
                    💬 {v.funnyNote}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => speak(v.french)}
                  className="p-1.5 rounded-lg text-[--text-muted] hover:text-[--accent] hover:bg-[--bg-card-hover] transition-colors"
                  title="Play pronunciation"
                >
                  <Volume2 size={15} />
                </button>
                <button
                  onClick={() => copyPhrase(v.french, id)}
                  className="p-1.5 rounded-lg text-[--text-muted] hover:text-[--success] hover:bg-[--bg-card-hover] transition-colors"
                  title="Copy phrase"
                >
                  {copiedId === id ? <Check size={15} className="text-[--success]" /> : <Copy size={15} />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[--text-muted]">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No phrases found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
