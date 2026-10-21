import type { ConversationDebrief, Scenario } from '../types';

export interface PlayerReply {
  text: string;
  /** Scripted mode only: whether the reply matched what the turn was after. */
  correct?: boolean;
}

/**
 * The debrief for a scripted (no-AI) conversation, built from the scenario
 * itself: each missed turn becomes a correction, and the expected replies for
 * the turns reached are the phrases to keep.
 */
export function scriptedDebrief(scenario: Scenario, replies: PlayerReply[], missionComplete: boolean): ConversationDebrief {
  const turns = scenario.turns.slice(0, replies.length);
  const firstTime = replies.filter(r => r.correct).length;
  const missed = replies
    .map((reply, i) => ({ reply, turn: turns[i] }))
    .filter(({ reply, turn }) => turn && reply.correct === false);

  const strengths: string[] = [];
  if (missionComplete) strengths.push('You got all the way through the mission.');
  if (replies.length > 0 && firstTime === replies.length) strengths.push('Every reply did what the moment needed.');
  else if (firstTime > 0) strengths.push(`${firstTime} of ${replies.length} replies did what the moment needed.`);

  const summary = replies.length === 0
    ? `You left before replying to ${scenario.npcName}.`
    : missionComplete
      ? `Mission complete in ${replies.length} ${replies.length === 1 ? 'exchange' : 'exchanges'}.${missed.length ? ' Have a look at the replies below that could have been more natural.' : ''}`
      : `You stopped after ${replies.length} of ${scenario.turns.length} exchanges. The phrases below get you through the rest next time.`;

  return {
    source: 'scripted',
    summary,
    strengths,
    corrections: missed.map(({ reply, turn }) => ({
      original: reply.text,
      corrected: turn.correctResponse,
      explanation: `The moment called for this: ${turn.playerHint.charAt(0).toLowerCase()}${turn.playerHint.slice(1)}.`,
    })),
    // The whole script's replies when the mission was cut short, so the learner sees how it ends.
    phrases: (missionComplete ? turns : scenario.turns).slice(0, 6).map(t => ({ french: t.correctResponse, english: t.playerHint })),
  };
}
