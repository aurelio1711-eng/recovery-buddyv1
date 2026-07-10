import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
});

async function importApi() {
  return import('../api');
}

describe('fetchNycTime', () => {
  it('returns data on successful fetch', async () => {
    const mockData = { utc_datetime: '2026-07-10 12:00:00', timezone: 'America/New_York' };
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { fetchNycTime } = await importApi();
    const result = await fetchNycTime();
    expect(result).toEqual(mockData);
  });

  it('throws on non-ok response', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { fetchNycTime } = await importApi();
    await expect(fetchNycTime()).rejects.toThrow('Unauthorized');
  });

  it('throws generic error when response JSON is missing error', async () => {
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve(null),
    });

    const { fetchNycTime } = await importApi();
    await expect(fetchNycTime()).rejects.toThrow('API error: 500');
  });

  it('throws on network failure', async () => {
    window.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { fetchNycTime } = await importApi();
    await expect(fetchNycTime()).rejects.toThrow('Network error');
  });
});
