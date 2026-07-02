import StartDatePicker from './StartDatePicker';
import ResetButton from './ResetButton';
import './StartDateButton.css';

interface StartDateButtonProps {
  onReset: () => void;
  onSettingsChange: () => void;
}

export default function StartDateButton({ onReset, onSettingsChange }: StartDateButtonProps) {
  return (
    <div className="start-date-section">
      <div className="start-date-card">
        <StartDatePicker onSettingsChange={onSettingsChange} />
        <ResetButton onReset={onReset} />
      </div>
    </div>
  );
}
