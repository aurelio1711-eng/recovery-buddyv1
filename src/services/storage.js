import { getToday } from './nycTime';
import { parseISO, differenceInDays, addDays, format, isAfter } from 'date-fns';

// localStorage keys used for data persistence
const STORAGE_KEY = 'clinical-program-tracker';
const CHECKINS_KEY = 'clinical-program-checkins';
const SETTINGS_KEY = 'clinical-program-settings';

// Load saved group progress from localStorage, returns null if none exists
export const loadProgram = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
    return null;
  } catch (e) {
    console.error('Failed to load program:', e);
    return null;
  }
};

// Persist group progress array to localStorage
export const saveProgram = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    return true;
  } catch (e) {
    console.error('Failed to save program:', e);
    return false;
  }
};

// Load all check-in records from localStorage, returns {} if none
export const loadCheckIns = () => {
  try {
    const data = localStorage.getItem(CHECKINS_KEY);
    if (data) return JSON.parse(data);
    return {};
  } catch (e) {
    console.error('Failed to load check-ins:', e);
    return {};
  }
};

// Persist the check-ins object to localStorage
export const saveCheckIns = (checkIns) => {
  try {
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
    return true;
  } catch (e) {
    console.error('Failed to save check-ins:', e);
    return false;
  }
};

// Record a check-in for a group on a given date with optional notes
export const addCheckIn = (groupId, date = getToday(), notes = '') => {
  const checkIns = loadCheckIns();
  const key = `${groupId}-${date}`;
  checkIns[key] = { groupId, date, notes, timestamp: Date.now() };
  saveCheckIns(checkIns);
  return checkIns[key];
};

// Remove a check-in record for a group on a given date
export const removeCheckIn = (groupId, date = getToday()) => {
  const checkIns = loadCheckIns();
  const key = `${groupId}-${date}`;
  delete checkIns[key];
  saveCheckIns(checkIns);
};

// Check whether a group has already been checked in on a given date
export const hasCheckIn = (groupId, date = getToday()) => {
  const checkIns = loadCheckIns();
  return !!checkIns[`${groupId}-${date}`];
};

// Get all check-in records for a specific date
export const getCheckInsForDate = (date = getToday()) => {
  const checkIns = loadCheckIns();
  return Object.values(checkIns).filter(c => c.date === date);
};

// Load settings from localStorage, merging defaults for any missing fields
export const loadSettings = () => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const today = getToday();
      const merged = { ...parsed, notifications: true };
      if (!merged.startDate) merged.startDate = today;
      if (!merged.programStartDate) merged.programStartDate = today;
      if (!merged.lastPassDate) merged.lastPassDate = null;
      if (!merged.passHistory) merged.passHistory = [];
      return merged;
    }
    return {
      startDate: getToday(),
      notifications: true,
      programStartDate: getToday(),
      lastPassDate: null,
      passHistory: [],
    };
  } catch (e) {
    const today = getToday();
    return {
      startDate: today,
      notifications: true,
      programStartDate: today,
      lastPassDate: null,
      passHistory: [],
    };
  }
};

// Persist settings object to localStorage (normalizes optional fields)
export const saveSettings = (settings) => {
  try {
    const normalized = {
      startDate: settings.startDate,
      notifications: settings.notifications || true,
      programStartDate: settings.programStartDate,
      lastPassDate: settings.lastPassDate,
      passHistory: settings.passHistory || [],
      passHistoryLabels: settings.passHistoryLabels || [],
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
};

// Remove all app data from localStorage (program, check-ins, settings)
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CHECKINS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
};

// Record a weekend pass claim on a given date
export const updatePassStatus = (date = getToday()) => {
  const settings = loadSettings();
  settings.lastPassDate = date;
  saveSettings(settings);
  return settings;
};

// Calculate the number of days since the program start date
export const getDaysSinceProgramStart = () => {
  const settings = loadSettings();
  const startDate = settings.programStartDate;
  if (!startDate) return 0;

  const start = parseISO(startDate);
  const today = parseISO(getToday());

  return Math.max(0, differenceInDays(today, start));
};

// Calculate days remaining until the next weekend pass is available
export const getDaysUntilNextPass = () => {
  const daysSinceStart = getDaysSinceProgramStart();
  if (daysSinceStart < 30) {
    return 30 - daysSinceStart;
  }

  const settings = loadSettings();
  const lastPassDate = settings.lastPassDate;

  if (!lastPassDate) {
    return 0;
  }

  const lastPass = parseISO(lastPassDate);
  const nextPassDate = addDays(lastPass, 30);
  const today = parseISO(getToday());

  return Math.max(0, differenceInDays(nextPassDate, today));
};

// Get the calendar date of the next weekend pass as YYYY-MM-DD (or null if available today)
export const getNextPassDate = () => {
  const daysUntilPass = getDaysUntilNextPass();
  if (daysUntilPass === 0) return null;

  const today = parseISO(getToday());
  return format(addDays(today, daysUntilPass), 'yyyy-MM-dd');
};

// Check whether the participant has completed 30+ days and is eligible for a weekend pass
export const isEligibleForPass = () => {
  const daysSinceStart = getDaysSinceProgramStart();
  return daysSinceStart >= 30;
};

// Export all data (program, check-ins, settings) as a portable JSON object
export const exportData = () => {
  return {
    program: loadProgram(),
    checkIns: loadCheckIns(),
    settings: loadSettings(),
    exportDate: new Date().toISOString(),
  };
};

const IMPORT_SCHEMA = {
  program: {
    required: true,
    validate: (data) =>
      Array.isArray(data) && data.every(g => g && typeof g.id === 'string' && typeof g.name === 'string' && typeof g.category === 'string' && typeof g.required === 'number' && typeof g.completed === 'number')
  },
  checkIns: {
    required: true,
    validate: (data) =>
      typeof data === 'object' && data !== null && Object.values(data).every(c =>
        c && typeof c.groupId === 'string' && typeof c.date === 'string' && typeof c.timestamp === 'number'
      )
  },
  settings: {
    required: true,
    validate: (data) =>
      data && typeof data === 'object' &&
      typeof data.startDate === 'string' &&
      typeof data.notifications === 'boolean' &&
      typeof data.programStartDate === 'string' &&
      (data.lastPassDate === null || typeof data.lastPassDate === 'string') &&
      Array.isArray(data.passHistory)
  }
};

export const validateImportData = (data) => {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid import: expected an object'] };
  }

  for (const [key, schema] of Object.entries(IMPORT_SCHEMA)) {
    if (schema.required && !data[key]) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }
    if (data[key] && !schema.validate(data[key])) {
      errors.push(`Invalid data format for: ${key}`);
    }
  }

  return { valid: errors.length === 0, errors };
};

export const importData = (data) => {
  const validation = validateImportData(data);
  if (!validation.valid) {
    console.error('Import validation failed:', validation.errors);
    throw new Error(`Invalid import data: ${validation.errors.join(', ')}`);
  }
  
  if (data.program) saveProgram(data.program);
  if (data.checkIns) saveCheckIns(data.checkIns);
  if (data.settings) saveSettings(data.settings);
  
  return validation;
};