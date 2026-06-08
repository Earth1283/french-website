import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BookOpen, Home, User, MessageSquare } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';

export function Navbar() {
  const { darkMode, setDarkMode, xp, streak } = useProgressStore();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/phrasebook', icon: BookOpen, label: 'Phrases' },
    { to: '/converse', icon: MessageSquare, label: 'Converse' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[--border] bg-[--bg]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl">🇫🇷</span>
          <span className="font-bold text-base text-[--text-primary]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Bonjour Survival
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold mr-2">
              🔥 {streak}
            </div>
          )}

          {xp > 0 && (
            <div className="hidden sm:flex items-center gap-1 xp-badge mr-2">
              ⚡ {xp} XP
            </div>
          )}

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${
                  location.pathname === to
                    ? 'bg-[--accent] text-white'
                    : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-card-hover]'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-1 p-2 rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-card-hover] transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
