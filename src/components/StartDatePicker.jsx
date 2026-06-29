import { useState } from 'react';
import { loadSettings, saveSettings } from '../services/storage';
import { getToday } from '../services/nycTime';
import { format, parseISO } from 'date-fns';

export default function StartDatePicker({ onSettingsChange }) {
  const [settings, setSettings] = useState(loadSettings());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleStartDateChange = (event) => {
    const newStartDate = event.target.value;
    const updatedSettings = {
      ...settings,
      programStartDate: newStartDate,
      startDate: newStartDate,
      lastPassDate: null,
    };
    saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setShowDatePicker(false);
    if (onSettingsChange) onSettingsChange();
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <h3>Program Start Date</h3>
      <div className="start-date-display">
        {getFormattedDate(settings.programStartDate)}
      </div>
      <button
        className="btn-change-start-date"
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        Change Start Date
      </button>
      {showDatePicker && (
        <div className="date-picker-popup">
          <input
            type="date"
            value={settings.programStartDate || ''}
            onChange={handleStartDateChange}
            min="2020-01-01"
            max={getToday()}
          />
        </div>
      )}
    </>
  );
}
