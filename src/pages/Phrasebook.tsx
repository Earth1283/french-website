import { useState, useMemo, useEffect } from 'react';
import { Search, Volume2, Copy, Check } from 'lucide-react';
import { UNITS, getAllVocab } from '../data/units';
import { lineFor } from '../data/lines';
import { Roundel } from '../components/ui/Roundel';
import { Button } from '../components/ui/Button';
import { speak } from '../utils/speech';

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
    <div className="page">
      <h1 className="h-page">Phrasebook</h1>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search phrases, translations, or pronunciation"
            className="field pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={unitFilter === 'all' && !emergencyOnly}
            onClick={() => setUnitFilter('all')}
          >
            All
          </Button>
          {UNITS.map(u => (
            <Button
              key={u.id}
              variant="secondary"
              size="sm"
              aria-pressed={unitFilter === u.id && !emergencyOnly}
              onClick={() => { setUnitFilter(u.id); setEmergencyOnly(false); }}
              className="flex-shrink-0"
            >
              <Roundel line={lineFor(u.id)} size="sm" />
              {u.tagline.split(/[,&]/)[0].trim()}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="sheet rows">
          {filtered.slice(0, displayCount).map((v) => {
            const id = `${v.unitId}-${v.lessonId}-${v.french}`;
            return (
              <div key={id} className="row flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <span className="fr-solo text-21" lang="fr">
                    {v.french}
                  </span>
                  <p className="t-body mt-1">{v.english}</p>
                  {v.pronunciation && (
                    <p className="say-guide mt-1">/{v.pronunciation}/</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => speak(v.french)}
                    className="say say--sm"
                    aria-label={`Hear ${v.french}`}
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={() => copyPhrase(v.french, id)}
                    className="p-2 rounded-control flex items-center justify-center"
                    title="Copy phrase"
                    aria-label="Copy phrase"
                  >
                    {copiedId === id ? (
                      <Check size={16} className="text-go" />
                    ) : (
                      <Copy size={16} className="text-ink-3" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > displayCount && (
        <div className="text-center mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDisplayCount(c => c + PAGE_SIZE)}
          >
            Show more ({filtered.length - displayCount} remaining)
          </Button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="sheet mt-[var(--stack)] p-8 text-center">
          <p className="t-body text-ink-2">
            No phrases match "{query}". Try an English word or clear the filter.
          </p>
        </div>
      )}
    </div>
  );
}
