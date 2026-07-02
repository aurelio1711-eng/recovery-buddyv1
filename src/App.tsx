import { useState, useEffect, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { FlagValues } from '@vercel/flags/react';
import { MotionConfig, AnimatePresence, motion } from 'motion/react';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './components/Landing';
import { flags } from './flags';

const Dashboard = lazy(() => import('./components/Dashboard'));

function App() {
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          {showDashboard ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Suspense fallback={<div className="landing" style={{ minHeight: '100dvh' }} />}>
                <Dashboard darkMode={darkMode} onToggleDark={() => setDarkMode(v => !v)} />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Landing onStart={() => setShowDashboard(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>

      <Analytics />
      <FlagValues values={flags} />
      <div className="dev-banner">This site is still in development</div>
    </ErrorBoundary>
  );
}

export default App;
