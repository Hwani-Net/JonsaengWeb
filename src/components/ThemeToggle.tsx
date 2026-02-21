'use client';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
