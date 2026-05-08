// components/theme-toggle.tsx
'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary p-2 md:px-3 md:py-1.5 text-sm"
      aria-label="Toggle theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
      }}
    >
      {theme === 'dark' ? (
        <>
          <span className="text-base">☀️</span>
          <span className="hidden md:inline text-sm">Light</span>
        </>
      ) : (
        <>
          <span className="text-base">🌙</span>
          <span className="hidden md:inline text-sm">Dark</span>
        </>
      )}
    </button>
  );
}