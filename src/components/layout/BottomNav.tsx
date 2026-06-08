import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageSquare, User, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/phrasebook', icon: BookOpen, label: 'Phrases' },
  { to: '/converse', icon: MessageSquare, label: 'Converse' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[--border] bg-[--bg]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
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
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
