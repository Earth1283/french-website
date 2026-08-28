import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClassroomProfile } from '../types/classroom';

type Role = 'teacher' | 'student';

interface ClassroomStore {
  backendUrl: string | null;
  certTrusted: boolean;
  role: Role | null;
  token: string | null;
  profile: ClassroomProfile | null;
  recentBackendUrls: string[];
  setConnection: (backendUrl: string) => void;
  markCertTrusted: () => void;
  setAuth: (role: Role, token: string, profile: ClassroomProfile) => void;
  setToken: (token: string) => void;
  disconnect: () => void;
  forgetBackend: () => void;
}

export const useClassroomStore = create<ClassroomStore>()(
  persist(
    (set, get) => ({
      backendUrl: null,
      certTrusted: false,
      role: null,
      token: null,
      profile: null,
      recentBackendUrls: [],

      setConnection: (backendUrl) => {
        const trimmed = backendUrl.trim().replace(/\/+$/, '');
        const recent = [trimmed, ...get().recentBackendUrls.filter((u) => u !== trimmed)].slice(0, 5);
        set({ backendUrl: trimmed, certTrusted: false, role: null, token: null, profile: null, recentBackendUrls: recent });
      },

      markCertTrusted: () => set({ certTrusted: true }),

      setAuth: (role, token, profile) => set({ role, token, profile }),

      setToken: (token) => set({ token }),

      disconnect: () => set({ role: null, token: null, profile: null }),

      forgetBackend: () =>
        set({ backendUrl: null, certTrusted: false, role: null, token: null, profile: null }),
    }),
    { name: 'french-classroom' }
  )
);
