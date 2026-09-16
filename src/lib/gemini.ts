import type { Scenario, Difficulty } from '../types';

export interface GeminiTurnResult {
  npcResponse: string;
  playerFeedback: string;
  missionComplete: boolean;
}

export async function callGemini(
  apiKey: string,
  scenario: Scenario,
  difficulty: Difficulty,
  history: { role: 'user' | 'model'; text: string }[],
  playerMessage: string,
): Promise<GeminiTurnResult> {
  const levelDesc =
    difficulty === 1 ? 'Accept any attempt that conveys the right meaning. Be very encouraging.'
    : difficulty === 2 ? 'Require correct meaning. Gently note if phrasing is off.'
    : 'Require grammatically correct French. Identify specific errors by name.';

  const systemPrompt = `You are ${scenario.npcName}, a ${scenario.npcRole}.
Setting: ${scenario.setting}
The learner's mission: ${scenario.mission}
Difficulty ${difficulty}/3: ${levelDesc}

Rules:
- Respond as ${scenario.npcName} in French, 1–2 sentences, naturally in character.
- playerFeedback: one short English sentence (max 12 words) about their French. Be warm.
- Set missionComplete true only when the learner has fully achieved their mission.
- Never break character in npcResponse.

Respond ONLY with valid JSON:
{"npcResponse":"...","playerFeedback":"...","missionComplete":false}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: playerMessage }] },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini error ${res.status}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}
