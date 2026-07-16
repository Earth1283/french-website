import React from 'react';
import { motion } from 'framer-motion';
import { TAP_SPRING } from '../../utils/motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'tinted' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// iOS button roles: primary = filled, tinted = accent-tinted fill,
// secondary = bordered, ghost = plain
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2';

  const variants = {
    primary: 'text-white hover:brightness-95',
    tinted: 'hover:brightness-95',
    secondary: 'hover:bg-[var(--bg-card-hover)]',
    ghost: 'hover:bg-[var(--bg-card-hover)]',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--accent)' },
    tinted: { backgroundColor: 'var(--accent-tint)', color: 'var(--accent)' },
    secondary: {
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--hairline)',
      boxShadow: 'var(--shadow-1)',
    },
    ghost: { backgroundColor: 'transparent', color: 'var(--text-secondary)' },
  };

  const sizes = {
    sm: 'text-sm px-3.5 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={TAP_SPRING}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variantStyles[variant]}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
