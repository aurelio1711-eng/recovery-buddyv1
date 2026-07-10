import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as storage from '../storage';
import type { Group, CheckIn, CheckInsRecord, Settings } from '../../types';

vi.mock('../nycTime', () => ({
  getToday: vi.fn(() => '2026-07-10'),
}));

beforeEach(() => {
  localStorage.clear();
});

describe('loadProgram / saveProgram', () => {
  it('returns null when no program is stored', () => {
    expect(storage.loadProgram()).toBeNull();
  });

  it('saves and loads program groups', () => {
    const groups: Group[] = [
      { id: 'test', name: 'Test Group', required: 10, category: 'clinical', completed: 3 },
    ];
    const ok = storage.saveProgram(groups);
    expect(ok).toBe(true);
    const loaded = storage.loadProgram();
    expect(loaded).toEqual(groups);
  });

  it('returns null when program version mismatches', () => {
    localStorage.setItem('program-version', '0');
    expect(storage.loadProgram()).toBeNull();
  });
});

describe('loadCheckIns / saveCheckIns / addCheckIn', () => {
  it('returns empty object when no check-ins stored', () => {
    expect(storage.loadCheckIns()).toEqual({});
  });

  it('adds and retrieves a check-in', () => {
    const ci = storage.addCheckIn('test-group', '2026-07-10', 'test note', null);
    expect(ci.groupId).toBe('test-group');
    expect(ci.date).toBe('2026-07-10');
    expect(ci.notes).toBe('test note');
    expect(ci.signature).toBeNull();

    const all = storage.loadCheckIns();
    expect(all['test-group-2026-07-10']).toBeDefined();
  });

  it('rejects oversized check-in data', () => {
    const largeSig = 'data:image/png;base64,' + 'A'.repeat(5 * 1024 * 1024);
    const ci = storage.addCheckIn('g1', '2026-07-10', '', largeSig);
    expect(ci.signature).toBeNull();
  });

  it('removes a check-in', () => {
    storage.addCheckIn('g1', '2026-07-10');
    expect(storage.hasCheckIn('g1', '2026-07-10')).toBe(true);
    storage.removeCheckIn('g1', '2026-07-10');
    expect(storage.hasCheckIn('g1', '2026-07-10')).toBe(false);
  });

  it('gets check-ins for a specific date', () => {
    storage.addCheckIn('g1', '2026-07-10');
    storage.addCheckIn('g2', '2026-07-10');
    storage.addCheckIn('g1', '2026-07-11');
    const todays = storage.getCheckInsForDate('2026-07-10');
    expect(todays).toHaveLength(2);
  });
});

describe('loadSettings / saveSettings', () => {
  it('returns defaults when no settings stored', () => {
    const s = storage.loadSettings();
    expect(s.startDate).toBe('2026-07-10');
    expect(s.notifications).toBe(true);
    expect(s.passHistory).toEqual([]);
  });

  it('saves and loads settings', () => {
    const settings: Settings = {
      startDate: '2026-01-01',
      notifications: false,
      programStartDate: '2026-01-01',
      lastPassDate: null,
      passHistory: [],
      reminderTime: '10:00',
      reminderDays: [1, 2, 3],
    };
    storage.saveSettings(settings);
    const loaded = storage.loadSettings();
    expect(loaded.startDate).toBe('2026-01-01');
    expect(loaded.notifications).toBe(true);
    expect(loaded.reminderTime).toBe('10:00');
    expect(loaded.reminderDays).toEqual([1, 2, 3]);
  });
});

describe('pass status calculations', () => {
  it('getDaysSinceProgramStart returns 0 when no start date', () => {
    localStorage.removeItem('clinical-program-settings');
    expect(storage.getDaysSinceProgramStart()).toBe(0);
  });

  it('isEligibleForPass returns false before 30 days', () => {
    const settings: Settings = {
      startDate: '2026-07-10',
      notifications: true,
      programStartDate: '2026-07-10',
      lastPassDate: null,
      passHistory: [],
      reminderTime: '09:00',
      reminderDays: [1, 2, 3, 4, 5, 6, 0],
    };
    storage.saveSettings(settings);
    expect(storage.isEligibleForPass()).toBe(false);
  });

  it('updatePassStatus saves pass date', () => {
    const updated = storage.updatePassStatus('2026-07-10');
    expect(updated.lastPassDate).toBe('2026-07-10');
    expect(updated.passHistory).toContain('2026-07-10');
  });
});

describe('export / import', () => {
  it('exportData returns structured export', () => {
    storage.saveProgram([{ id: 'g1', name: 'G1', required: 5, category: 'clinical', completed: 0 }]);
    const exported = storage.exportData();
    expect(exported.program).toHaveLength(1);
    expect(exported.exportDate).toBeDefined();
    expect(exported.settings).toBeDefined();
  });

  it('validateImportData rejects invalid data', () => {
    const result = storage.validateImportData(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validateImportData accepts valid data', () => {
    const data = {
      program: [{ id: 'g1', name: 'G1', required: 5, category: 'clinical', completed: 0 }],
      checkIns: {},
      settings: {
        startDate: '2026-01-01',
        notifications: true,
        programStartDate: '2026-01-01',
        lastPassDate: null,
        passHistory: [],
      },
    };
    const result = storage.validateImportData(data);
    expect(result.valid).toBe(true);
  });

  it('mergeProgram merges without losing data', () => {
    storage.saveProgram([{ id: 'g1', name: 'G1', required: 5, category: 'clinical', completed: 2 }]);
    storage.mergeProgram([{ id: 'g1', name: 'G1', required: 5, category: 'clinical', completed: 3 }]);
    const loaded = storage.loadProgram();
    expect(loaded?.[0].completed).toBe(3);
  });

  it('mergeCheckIns keeps latest timestamp', () => {
    storage.addCheckIn('g1', '2026-07-10', 'old', null);
    const existing = storage.loadCheckIns();
    const oldTimestamp = existing['g1-2026-07-10'].timestamp;
    storage.mergeCheckIns({ 'g1-2026-07-10': { groupId: 'g1', date: '2026-07-10', notes: 'new', timestamp: oldTimestamp + 1000, signature: null } });
    const merged = storage.loadCheckIns();
    expect(merged['g1-2026-07-10'].notes).toBe('new');
  });
});

describe('getWeekRange', () => {
  it('returns correct week boundaries for a Monday', () => {
    const range = storage.getWeekRange('2026-07-06');
    expect(range.start).toBe('2026-07-06');
    expect(range.end).toBe('2026-07-12');
  });

  it('returns correct week boundaries for a Sunday', () => {
    const range = storage.getWeekRange('2026-07-12');
    expect(range.start).toBe('2026-07-06');
    expect(range.end).toBe('2026-07-12');
  });
});

describe('clearAllData', () => {
  it('removes all stored data', () => {
    storage.saveProgram([{ id: 'g1', name: 'G1', required: 5, category: 'clinical', completed: 0 }]);
    storage.addCheckIn('g1', '2026-07-10');
    storage.clearAllData();
    expect(storage.loadProgram()).toBeNull();
    expect(storage.loadCheckIns()).toEqual({});
  });
});
