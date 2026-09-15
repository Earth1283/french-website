import { Gauge, MessagesSquare, RotateCcw, Timer } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useConversationStore } from '../stores/conversationStore';
import { useTestStore } from '../stores/testStore';
import { Board, BoardGlyph, BoardRow } from '../components/ui/Board';
import { ButtonLink } from '../components/ui/Button';
import type { TestResult } from '../types';

function levelSummary(result: TestResult | undefined) {
  if (!result) return 'Adaptive test that places you on the CEFR scale.';
  const band = result.cefrBand ? `, ${result.cefrBand} band` : '';
  return `Adaptive test. Last result: ${result.cefrLevel}${band}.`;
}

export function Practice() {
  const hasAiKey = useConversationStore(s => Boolean(s.geminiApiKey));
  const latestResult = useTestStore(s => s.history[s.history.length - 1]);
  const dueCount = useProgressStore(s => s.getDueReviewCount());

  return (
    <div className="page page--narrow">
      <h1 className="h-page">Practice</h1>
      <p className="t-body mt-2 mb-6">Use what you've learned before a real waiter asks.</p>

      <Board title="Entraînement" lang="fr" aside={<span className="board__status">3 modes</span>}>
        <BoardRow
          to="/converse"
          glyph={<BoardGlyph><MessagesSquare size={16} /></BoardGlyph>}
          dest="Converse"
          via={hasAiKey ? 'Free conversation, marked by AI.' : 'Order food, check in, ask for help. Scripted dialogue.'}
          status="Start"
          now
        />
        <BoardRow
          to="/test"
          glyph={<BoardGlyph><Gauge size={16} /></BoardGlyph>}
          dest="Find your level"
          via={levelSummary(latestResult)}
          status={latestResult ? 'Retake' : 'Start'}
        />
        <BoardRow
          to="/focus"
          glyph={<BoardGlyph><Timer size={16} /></BoardGlyph>}
          dest="Focus"
          via="A study timer with a new word every 30 seconds."
          status="25 min"
        />
      </Board>

      <div className="sheet mt-[var(--stack)] flex flex-wrap items-center gap-4 p-4">
        <RotateCcw size={24} className="text-enamel-text" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          <span className="t-title block">
            {dueCount > 0 ? `${dueCount} ${dueCount === 1 ? 'card' : 'cards'} due for review` : 'No cards due'}
          </span>
          <span className="t-small block">
            {dueCount > 0 ? 'Words from lessons you have finished.' : 'Finish a lesson and its words come back here.'}
          </span>
        </p>
        {dueCount > 0 && (
          <ButtonLink to="/review" variant="secondary">
            Review cards
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
