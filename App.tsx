
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';

// --- KONFIGURÁCIÓ ---
// Itt állíthatod be a saját jelszavadat!
const APP_PASSWORD = "admin"; 
// --------------------

function App() {
  // Initialize theme state based on localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) {
            return saved === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initialize auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
      const auth = localStorage.getItem('mi_assistant_auth');
      return auth === 'true';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (password: string) => {
      if (password === APP_PASSWORD) {
          setIsAuthenticated(true);
          localStorage.setItem('mi_assistant_auth', 'true');
          return true;
      }
      return false;
  };

  // Ha nincs belépve, mutassuk a LoginScreen-t
  if (!isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen w-full font-sans p-4 sm:p-6 lg:p-8 bg-light animate-fade-in transition-colors duration-300">
      <main>
        <Dashboard toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </main>
      <footer className="text-center mt-12 text-muted text-xs border-t border-medium pt-8 opacity-50">
        <p>&copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;
