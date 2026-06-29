import { fetchNycTime } from './api';

// Clock drift offset (ms) between local clock and NYC time, computed once at init
let clockDrift = 0;
// Whether NYC time sync has completed successfully
let initialized = false;

// Fetch NYC time from API, compute drift between local clock and NYC time
// Falls back gracefully to local clock if the API is unreachable
export const initNycTime = async () => {
  try {
    const data = await fetchNycTime();
    const apiUtcEpoch = new Date(data.utc_datetime.replace(' ', 'T') + 'Z').getTime();
    clockDrift = apiUtcEpoch - Date.now();
    initialized = true;
    return true;
  } catch (e) {
    console.error('Failed to init NYC time, falling back to local clock:', e);
    initialized = false;
    return false;
  }
};

// Current epoch adjusted by the NYC clock drift
const adjustedEpoch = () => Date.now() + clockDrift;

// Get today's date as YYYY-MM-DD string in America/New_York timezone
export const getToday = () => {
  const epoch = adjustedEpoch();
  return new Date(epoch).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
};

// Get a full timestamp string (YYYY-MM-DD HH:mm:ss) for NYC time
export const getNycTimestamp = () => {
  const epoch = adjustedEpoch();
  const d = new Date(epoch);
  const opts = { timeZone: 'America/New_York', hour12: false };
  const time = d.toLocaleTimeString('en-US', opts);
  return `${getToday()} ${time}`;
};

// Get a full timestamp string for the local system clock (fallback display)
export const getLocalTimestamp = () => {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA');
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  return `${date} ${time}`;
};
