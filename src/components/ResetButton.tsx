import { useState } from 'react';
import { loadSettings, saveSettings, clearAllData } from '../services/storage';
import type { Settings } from '../types';
import { getToday } from '../services/nycTime';
import ConfirmModal from './ConfirmModal';
import './StartDateButton.css';

interface Props {
  onReset: () => void;
}

export default function ResetButton({ onReset }: Props) {
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    clearAllData();
    const today = getToday();
    const newSettings: Settings = {
      startDate: today,
      notifications: true,
      programStartDate: today,
      lastPassDate: null,
      passHistory: [],
    };
    saveSettings(newSettings);
    setSettings(newSettings);
    setShowConfirm(false);
    if (onReset) onReset();
  };

  return (
    <>
      <button className="btn-reset-all" onClick={() => setShowConfirm(true)}>
        Reset All Data
      </button>
      {showConfirm && (
        <ConfirmModal
          title="Reset All Data"
          message="Are you sure you want to reset all data and start over? This will clear all progress, settings, and check-ins. This action cannot be undone."
          confirmLabel="Reset Everything"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleReset}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
