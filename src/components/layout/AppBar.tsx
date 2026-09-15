import { Link, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';
import { useClassroomStore } from '../../stores/classroomStore';
import { useLearnSearch } from '../../stores/learnSearchStore';
import { StatChip, Wordmark } from '../ui/Signage';
import { FlipText } from '../ui/FlipText';
import { isTabActive, tabsFor } from './navigation';

export function AppBar() {
  const { pathname } = useLocation();
  const role = useClassroomStore(s => s.role);
  const xp = useProgressStore(s => s.xp);
  const streak = useProgressStore(s => s.streak);
  const searchOpen = useLearnSearch(s => s.open);
  const toggleSearch = useLearnSearch(s => s.toggle);

  const progressLabel = [streak > 0 && `${streak}-day streak`, `${xp} XP`].filter(Boolean).join(', ');

  return (
    <header className="appbar">
      <div className="appbar__inner">
        <Wordmark to="/learn" />
        <nav className="appbar__nav" aria-label="Main">
          {tabsFor(role).map(tab => (
            <Link key={tab.to} to={tab.to} aria-current={isTabActive(tab, pathname) ? 'page' : undefined}>
              <tab.icon size={20} aria-hidden="true" />
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="appbar__end">
          {pathname === '/learn' && (
            <button
              type="button"
              className="appbar__icon"
              aria-label={searchOpen ? 'Close search' : 'Search lines'}
              aria-expanded={searchOpen}
              onClick={toggleSearch}
            >
              {searchOpen ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
            </button>
          )}
          {(xp > 0 || streak > 0) && (
            <Link to="/profile" className="flex items-center gap-2 rounded-control" aria-label={`${progressLabel}. Your progress`}>
              {streak > 0 && (
                <StatChip kind="streak">
                  <span className="hidden sm:inline">{streak}-day streak</span>
                  <span className="sm:hidden">{streak}</span>
                </StatChip>
              )}
              <StatChip kind="xp">
                <FlipText value={String(xp)} />
                <span aria-hidden="true">XP</span>
              </StatChip>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
