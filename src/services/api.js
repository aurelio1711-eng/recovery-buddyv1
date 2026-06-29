const API_KEY = 't8I7ZoqV4PMh4BCyCvOrFMHgIVw3naLJQyvyzTKO';
const BASE_URL = 'https://api.api-ninjas.com/v1/timezone';

// Fetch current NYC time from the API-Ninjas timezone API
// Returns an object with utc_datetime, timezone, etc.
export const fetchNycTime = async () => {
  const response = await fetch(`${BASE_URL}?city=New_York_City`, {
    headers: { 'X-Api-Key': API_KEY },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};
