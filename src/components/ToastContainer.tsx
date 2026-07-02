import { motion, AnimatePresence } from 'motion/react';
import type { Toast } from '../types';

interface Props {
  toasts: Toast[];
  onUndo: (toast: Toast) => void;
}

export default function ToastContainer({ toasts, onUndo }: Props) {
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
              <button className="toast-undo-btn" onClick={() => onUndo(t)} aria-label={`Undo: ${t.message}`}>Undo</button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
