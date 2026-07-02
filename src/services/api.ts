export interface NycTimeResponse {
  utc_datetime: string;
  timezone: string;
}

const API_KEY = import.meta.env.VITE_API_NINJAS_KEY;
const BASE_URL = 'https://api.api-ninjas.com/v1/timezone';

export const fetchNycTime = async (): Promise<NycTimeResponse> => {
  if (!API_KEY) {
    throw new Error('API key not configured — set VITE_API_NINJAS_KEY');
  }
  const response = await fetch(`${BASE_URL}?city=New%20York&country=US`, {
    headers: { 'X-Api-Key': API_KEY },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};
