import StartDatePicker from './StartDatePicker';
import ResetButton from './ResetButton';
import './StartDateButton.css';

export default function StartDateButton({ onReset, onSettingsChange }) {
  return (
    <div className="start-date-section">
      <div className="start-date-card">
        <StartDatePicker onSettingsChange={onSettingsChange} />
        <ResetButton onReset={onReset} />
      </div>
    </div>
  );
}