import { useState } from 'react';
import { loadSettings, saveSettings, clearAllData } from '../services/storage';
import { getToday } from '../services/nycTime';
import './StartDateButton.css';

export default function ResetButton({ onReset }) {
  const [settings, setSettings] = useState(loadSettings());

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data and start over? This will clear all progress, settings, and check-ins.')) {
      clearAllData();
      const today = getToday();
      const newSettings = {
        startDate: today,
        notifications: true,
        programStartDate: today,
        lastPassDate: null,
        passHistory: [],
      };
      saveSettings(newSettings);
      setSettings(newSettings);
      if (onReset) onReset();
    }
  };

  return (
    <button className="btn-reset-all" onClick={handleReset}>
      Reset All Data
    </button>
  );
}
