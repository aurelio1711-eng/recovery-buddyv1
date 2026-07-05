interface Props {
  value: number;
}

export default function ProgressBar({ value }: Props) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <progress
      className="h-2 bg-border rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-border [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
      value={percentage}
      max={100}
      aria-label={`${percentage}% complete`}
    />
  );
}
