import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageSquare, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../../stores/progressStore';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/phrasebook', icon: BookOpen, label: 'Phrases' },
  { to: '/converse', icon: MessageSquare, label: 'Converse' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const TAP_SPRING = { type: 'spring', damping: 20, stiffness: 500 } as const;
const POP_SPRING = { type: 'spring', damping: 12, stiffness: 420 } as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const appleMode = useProgressStore(s => s.appleMode);
  const reducedGpu = useProgressStore(s => s.reducedGpu);
  const darkMode = useProgressStore(s => s.darkMode);
  const accentColor = useProgressStore(s => s.accentColor);

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  if (appleMode && !reducedGpu) {
    const glassBase = darkMode ? 'rgba(28, 28, 30, 0.80)' : 'rgba(255, 255, 255, 0.76)';
    const glassBorder = darkMode ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.65)';
    const inactiveTint = darkMode ? 'rgba(235, 235, 245, 0.50)' : 'rgba(60, 60, 67, 0.50)';
    const activeBubble = hexToRgba(accentColor, darkMode ? 0.22 : 0.13);

    return (
      <AnimatePresence>
        <div
          key="apple-nav-shell"
          className="sm:hidden fixed left-0 right-0 z-40 flex justify-center pointer-events-none"
          style={{ bottom: `calc(1.25rem + env(safe-area-inset-bottom))` }}
        >
          <motion.nav
            className="pointer-events-auto"
            initial={{ y: 28, opacity: 0, scale: 0.88 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{
              borderRadius: '9999px',
              backdropFilter: 'blur(32px) saturate(180%) brightness(1.04)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%) brightness(1.04)',
              backgroundColor: glassBase,
              border: `0.5px solid ${glassBorder}`,
              boxShadow: darkMode
                ? '0 12px 40px rgba(0,0,0,0.55), 0 3px 10px rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.09)'
                : '0 12px 40px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.07), inset 0 0.5px 0 rgba(255,255,255,0.80)',
              padding: '0.4rem 0.4rem',
              display: 'flex',
              gap: '0.125rem',
            }}
          >
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const active = isActive(to);
              return (
                <motion.div
                  key={to}
                  whileTap={{ scale: 0.80 }}
                  transition={TAP_SPRING}
                >
                  <Link
                    to={to}
                    aria-label={label}
                    className="no-underline"
                    style={{
                      position: 'relative',
                      borderRadius: '9999px',
                      padding: '0.5rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '2.75rem',
                      color: active ? accentColor : inactiveTint,
                      transition: 'color 0.18s',
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="apple-active-bubble"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '9999px',
                          backgroundColor: activeBubble,
                        }}
                        transition={{ type: 'spring', damping: 22, stiffness: 380 }}
                      />
                    )}
                    {/* Icon pops in when tab becomes active */}
                    <motion.span
                      key={`${to}-${active}`}
                      initial={{ scale: active ? 0.68 : 1 }}
                      animate={{ scale: 1 }}
                      transition={POP_SPRING}
                      style={{ position: 'relative', zIndex: 1, display: 'flex' }}
                    >
                      <Icon size={22} strokeWidth={active ? 2.2 : 1.5} />
                    </motion.span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        </div>
      </AnimatePresence>
    );
  }

  // Default nav (also handles apple mode + reducedGpu — iOS colors still apply via .apple-mode CSS)
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-[--bg]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <motion.div
              key={to}
              whileTap={{ scale: 0.84 }}
              transition={TAP_SPRING}
              className="flex-1 h-full"
            >
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-0.5 w-full h-full no-underline transition-colors relative"
                style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {active && (
                  <motion.span
                    layoutId="regular-active-indicator"
                    className="absolute top-0 w-8 h-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--accent)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                    transition={{ type: 'spring', damping: 22, stiffness: 380 }}
                  />
                )}
                {/* Icon pops in when tab becomes active — behind reducedGpu */}
                {!reducedGpu ? (
                  <motion.span
                    key={`${to}-${active}`}
                    initial={{ scale: active ? 0.72 : 1 }}
                    animate={{ scale: 1 }}
                    transition={POP_SPRING}
                  >
                    <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                  </motion.span>
                ) : (
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                )}
                <span className="text-xs font-medium">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
