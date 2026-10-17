import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoiceEngine = 'device' | 'gemini';

interface SpeechStore {
  micEnabled: boolean;
  voiceEngine: VoiceEngine;
  geminiVoice: string;
  autoSpeakReplies: boolean;
  setMicEnabled: (value: boolean) => void;
  setVoiceEngine: (value: VoiceEngine) => void;
  setGeminiVoice: (value: string) => void;
  setAutoSpeakReplies: (value: boolean) => void;
}

export const useSpeechStore = create<SpeechStore>()(
  persist(
    (set) => ({
      micEnabled: true,
      voiceEngine: 'device',
      geminiVoice: 'Kore',
      autoSpeakReplies: false,
      setMicEnabled: (value) => set({ micEnabled: value }),
      setVoiceEngine: (value) => set({ voiceEngine: value }),
      setGeminiVoice: (value) => set({ geminiVoice: value }),
      setAutoSpeakReplies: (value) => set({ autoSpeakReplies: value }),
    }),
    { name: 'french-speech' }
  )
);
