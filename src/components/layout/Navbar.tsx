import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BookOpen, Home, User, MessageSquare, Settings, Timer, Gauge, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { TAP_TRANSITION, NO_OVERSHOOT_SPRING } from '../../utils/motion';
import { useProgressStore } from '../../stores/progressStore';
import { FrenchFlag } from '../ui/FrenchFlag';
import { isNavActive } from '../../utils/navMatch';

const NAV_ITEMS = [
  { to: '/learn', icon: Home, label: 'Home' },
  { to: '/focus', icon: Timer, label: 'Focus' },
  { to: '/phrasebook', icon: BookOpen, label: 'Phrases' },
  { to: '/converse', icon: MessageSquare, label: 'Converse' },
  { to: '/test', icon: Gauge, label: 'Test' },
  { to: '/classes', icon: GraduationCap, label: 'Classes' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Navbar() {
  const { darkMode, setDarkMode, xp, streak } = useProgressStore();
  const hasProgressChip = streak > 0 || xp > 0;
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // iOS-style header: borderless at rest, hairline + stronger glass once content scrolls under it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 glass transition-shadow duration-300"
      style={{
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        borderBottomColor: scrolled ? 'var(--hairline)' : 'transparent',
        boxShadow: scrolled ? 'var(--shadow-1)' : 'none',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <motion.div whileTap={{ scale: 0.97 }} transition={TAP_TRANSITION} className="shrink-0">
          <Link to="/learn" className="flex items-center gap-2 no-underline whitespace-nowrap">
            <FrenchFlag size={20} className="rounded-[2px]" />
            <span className="font-bold text-[1.05rem] text-primary font-display">
              Bonjour Survival
            </span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-1.5">
          {/* Streak + XP — compact tappable chip, visible on mobile too */}
          {hasProgressChip && (
            <motion.div whileTap={{ scale: 0.97 }} transition={TAP_TRANSITION}>
              <Link
                to="/profile"
                aria-label="Your progress"
                className="no-underline flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold mr-1"
                style={{
                  backgroundColor: 'var(--gold-light)',
                  color: darkMode ? 'var(--gold)' : '#b86a20',
                }}
              >
                {streak > 0 && <span>🔥 {streak}</span>}
                {streak > 0 && xp > 0 && <span className="opacity-40">·</span>}
                {xp > 0 && <span>⚡ {xp}</span>}
              </Link>
            </motion.div>
          )}

          {/* Desktop nav — fluid sliding active pill */}
          <nav className="hidden sm:flex items-center gap-0.5 rounded-full p-1" style={{ backgroundColor: 'var(--bg-inset)' }}>
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const isActive = isNavActive(location.pathname, to);
              return (
                <motion.div key={to} whileTap={{ scale: 0.97 }} transition={TAP_TRANSITION}>
                  <Link
                    to={to}
                    className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold no-underline transition-colors isolate"
                    aria-label={label}
                    title={label}
                    style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="desktop-nav-pill"
                        layoutDependency={to}
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: 'var(--accent)', zIndex: 0 }}
                        transition={NO_OVERSHOOT_SPRING}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon size={15} strokeWidth={isActive ? 2.2 : 2} />
                      <span className={hasProgressChip ? 'hidden xl:inline' : 'hidden lg:inline'}>{label}</span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <motion.div whileTap={{ scale: 0.97 }} transition={TAP_TRANSITION} className="hidden sm:block">
            <Link
              to="/settings"
              className="flex p-2 rounded-full transition-colors no-underline ios-press"
              style={{ color: isNavActive(location.pathname, '/settings') ? 'var(--accent)' : 'var(--text-muted)' }}
              aria-label="Settings"
            >
              <Settings size={17} />
            </Link>
          </motion.div>

          {/* Dark mode toggle — animated, reachable on mobile */}
          <motion.button
            onClick={() => setDarkMode(!darkMode)}
            whileTap={{ scale: 0.97 }}
            transition={TAP_TRANSITION}
            className="p-2 rounded-full cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
