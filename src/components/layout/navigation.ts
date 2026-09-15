import { BookOpen, CircleUserRound, GraduationCap, Map as MapIcon, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  matches: string[];
}

const LEARN: Tab = { to: '/learn', label: 'Learn', icon: MapIcon, matches: ['/learn', '/unit', '/review'] };
const PRACTICE: Tab = { to: '/practice', label: 'Practice', icon: Target, matches: ['/practice', '/converse', '/test', '/focus'] };
const PHRASEBOOK: Tab = { to: '/phrasebook', label: 'Phrasebook', icon: BookOpen, matches: ['/phrasebook'] };
const ME: Tab = { to: '/profile', label: 'Me', icon: CircleUserRound, matches: ['/profile', '/settings'] };
const CLASS: Tab = { to: '/classes', label: 'Class', icon: GraduationCap, matches: ['/classes'] };

const SIGNED_OUT_ME: Tab = { ...ME, matches: [...ME.matches, '/classes/connect', '/classes/auth'] };

export const ALL_TABS: Tab[] = [LEARN, PRACTICE, PHRASEBOOK, SIGNED_OUT_ME, CLASS];

export function tabsFor(classroomRole: string | null): Tab[] {
  return classroomRole ? [LEARN, PRACTICE, PHRASEBOOK, ME, CLASS] : [LEARN, PRACTICE, PHRASEBOOK, SIGNED_OUT_ME];
}

export function isTabActive(tab: Tab, pathname: string): boolean {
  return tab.matches.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function activeTab(tabs: Tab[], pathname: string): Tab | undefined {
  return tabs.find(tab => isTabActive(tab, pathname));
}

const TAB_ROOTS = [LEARN, PRACTICE, PHRASEBOOK, ME, CLASS].map(tab => tab.to);

export function routeDepth(pathname: string): number {
  if (TAB_ROOTS.includes(pathname)) return 0;
  return pathname.split('/').filter(Boolean).length;
}

export function isLessonRoute(pathname: string): boolean {
  return /^\/unit\/[^/]+\/lesson\//.test(pathname);
}
