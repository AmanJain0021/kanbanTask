import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Sync state with localStorage changes across tabs or window instances
  useEffect(() => {
    const handleStorage = () => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      setTheme(currentTheme);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Listen to local theme changes emitted within the same tab
  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      setTheme(currentTheme);
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Trigger custom event so other mounted toggle instances sync instantly
    window.dispatchEvent(new Event('theme-change'));
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 animate-fade-in" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-500 animate-fade-in" />
      )}
    </button>
  );
};

export default ThemeToggle;
