// NOTE: In production, this key should be served from a serverless proxy
// to avoid embedding it in the client bundle. For now, it's loaded from
// an environment variable with a fallback for local development.
const API_KEY = import.meta.env.VITE_API_NINJAS_KEY || 't8I7ZoqV4PMh4BCyCvOrFMHgIVw3naLJQyvyzTKO';
const BASE_URL = 'https://api.api-ninjas.com/v1/timezone';

// Fetch current NYC time from the API-Ninjas timezone API
// Returns an object with utc_datetime, timezone, etc.
export const fetchNycTime = async () => {
  const response = await fetch(`${BASE_URL}?city=New%20York&country=US`, {
    headers: { 'X-Api-Key': API_KEY },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};
