import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageSquare, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgressStore } from '../../stores/progressStore';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/phrasebook', icon: BookOpen, label: 'Phrases' },
  { to: '/converse', icon: MessageSquare, label: 'Converse' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const TAP_SPRING = { type: 'spring', damping: 20, stiffness: 500 } as const;
const POP_SPRING = { type: 'spring', damping: 12, stiffness: 420 } as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const reducedGpu = useProgressStore(s => s.reducedGpu);

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

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
      <motion.nav
        className="pointer-events-auto flex"
        initial={{ y: 28, opacity: 0, scale: 0.88 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        style={{
          borderRadius: '9999px',
          backdropFilter: 'blur(32px) saturate(180%) brightness(1.04)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%) brightness(1.04)',
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
            <motion.div key={to} whileTap={{ scale: 0.8 }} transition={TAP_SPRING}>
              <Link
                to={to}
                aria-label={label}
                className="no-underline relative flex items-center justify-center"
                style={{
                  borderRadius: '9999px',
                  padding: '0.5rem 1rem',
                  minWidth: '2.75rem',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'color 0.18s',
                }}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-bubble"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: 'var(--accent-tint)' }}
                    transition={{ type: 'spring', damping: 22, stiffness: 380 }}
                  />
                )}
                {/* Icon pops in when tab becomes active */}
                <motion.span
                  key={`${to}-${active}`}
                  initial={{ scale: active ? 0.68 : 1 }}
                  animate={{ scale: 1 }}
                  transition={POP_SPRING}
                  className="relative z-10 flex"
                >
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.5} />
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>
    </div>
  );
}
