import { motion } from 'motion/react';
import StartDateButton from './StartDateButton';
import './SettingsPage.css';

export default function SettingsPage({ onExport, onImport, onReset, onSettingsChange }) {
  const spring = { type: 'spring', stiffness: 150, damping: 18, mass: 0.8 };

  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2 className="settings-section-title">Program Dates</h2>
        <p className="settings-desc">Set your start date and reset all progress.</p>
        <StartDateButton onReset={onReset} onSettingsChange={onSettingsChange} />
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">Data Management</h2>
        <p className="settings-desc">Export your data for backup or import previously saved data.</p>
        <div className="settings-actions">
          <button className="btn-export" onClick={onExport}>Export Data</button>
          <button className="btn-import" onClick={onImport}>Import Data</button>
        </div>
      </section>
    </motion.div>
  );
}
