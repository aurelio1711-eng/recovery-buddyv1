import { useState } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'motion/react';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import Landing from './components/Landing';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

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
              <Dashboard />
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
    </ErrorBoundary>
  );
}

export default App;
