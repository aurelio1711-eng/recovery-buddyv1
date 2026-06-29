import { motion, AnimatePresence } from 'motion/react';

// Renders a stack of animated toast notifications with optional undo buttons
// Uses aria-live="polite" for screen reader announcements
export default function ToastContainer({ toasts, onUndo }) {
  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            className="toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span>{t.message}</span>
            {t.undoHandler && (
              <button className="toast-undo-btn" onClick={() => onUndo(t)}>Undo</button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
