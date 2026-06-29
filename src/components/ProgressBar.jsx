import { motion } from 'motion/react';

// Animated horizontal bar — fills to the given percentage on mount/update
export default function ProgressBar({ value }) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-bar">
      <motion.div
        className="progress-bar-inner"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}