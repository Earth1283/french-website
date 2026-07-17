import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageSquare, User, Settings, Timer, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../../stores/progressStore';
import { TAP_SPRING } from '../../utils/motion';

const NAV_ITEMS = [
  { to: '/learn', icon: Home, label: 'Home' },
  { to: '/focus', icon: Timer, label: 'Focus' },
  { to: '/phrasebook', icon: BookOpen, label: 'Phrases' },
  { to: '/converse', icon: MessageSquare, label: 'Converse' },
  { to: '/test', icon: Gauge, label: 'Test' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const POP_SPRING = { type: 'spring', damping: 12, stiffness: 420 } as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const reducedGpu = useProgressStore(s => s.reducedGpu);

  const isActive = (to: string) =>
    to === '/learn' ? pathname === '/learn' : pathname.startsWith(to);

  // Flat translucent bar — fallback when the user opts out of the liquid glass nav
  if (reducedGpu) {
    return (
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          borderTop: '0.5px solid var(--hairline)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full no-underline transition-colors relative"
                style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Default: iOS-style floating liquid-glass pill
  return (
    <div
      className="sm:hidden fixed left-0 right-0 z-40 flex justify-center pointer-events-none"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
    >
      <nav
        className="pointer-events-auto flex bottom-nav-pill"
        style={{
          borderRadius: '9999px',
          backgroundColor: 'var(--glass-card)',
          border: '0.5px solid var(--glass-border)',
          boxShadow: 'var(--shadow-3), inset 0 0.5px 0 var(--glass-highlight)',
          padding: '0.4rem',
          gap: '0.125rem',
        }}
      >
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <motion.div key={to} whileTap={{ scale: 0.97 }} transition={TAP_SPRING}>
              <Link
                to={to}
                aria-label={label}
                className="no-underline relative flex flex-col items-center justify-center gap-0.5 isolate"
                style={{
                  borderRadius: '9999px',
                  padding: '0.45rem 0.8rem',
                  minWidth: '2.75rem',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'color 0.18s',
                }}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-bubble"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: 'var(--accent-tint)', zIndex: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 380 }}
                  />
                )}
                <motion.span
                  key={to}
                  animate={{ scale: active ? [0.68, 1] : 1 }}
                  transition={POP_SPRING}
                  className="relative flex"
                  style={{ zIndex: 10 }}
                >
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.5} />
                </motion.span>
                <span
                  className="relative text-[9px] font-semibold leading-none"
                  style={{ zIndex: 10 }}
                >
                  {label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}
