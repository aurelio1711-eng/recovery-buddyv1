import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetchNycTime = vi.fn();

vi.mock('../api', () => ({
  fetchNycTime: (...args: unknown[]) => mockFetchNycTime(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// Use dynamic imports to get fresh module state per test
async function importNycTime() {
  return import('../nycTime');
}

describe('nycTime', () => {
  describe('initNycTime', () => {
    it('returns true and syncs clock when API succeeds', async () => {
      const now = Date.now();
      mockFetchNycTime.mockResolvedValue({
        utc_datetime: new Date(now).toISOString().replace('Z', '').replace('T', ' '),
        timezone: 'America/New_York',
      });

      const { initNycTime } = await importNycTime();
      const result = await initNycTime();
      expect(result).toBe(true);
    });

    it('returns false when API call fails', async () => {
      mockFetchNycTime.mockRejectedValue(new Error('Network error'));

      const { initNycTime } = await importNycTime();
      const result = await initNycTime();
      expect(result).toBe(false);
    });

    it('returns false when API key is not configured', async () => {
      mockFetchNycTime.mockRejectedValue(new Error('API key not configured'));

      const { initNycTime } = await importNycTime();
      const result = await initNycTime();
      expect(result).toBe(false);
    });
  });

  describe('getToday', () => {
    it('returns a date string in YYYY-MM-DD format', async () => {
      const { getToday } = await importNycTime();
      const today = getToday();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getLocalTimestamp', () => {
    it('returns a formatted timestamp string', async () => {
      const { getLocalTimestamp } = await importNycTime();
      const ts = getLocalTimestamp();
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('getNycTimestamp', () => {
    it('returns a formatted NYC timestamp string', async () => {
      const { getNycTimestamp } = await importNycTime();
      const ts = getNycTimestamp();
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });
});
