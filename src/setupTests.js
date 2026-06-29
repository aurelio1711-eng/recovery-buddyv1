// Extend Vitest assertions with jest-dom matchers (toBeInTheDocument, etc.)
import '@testing-library/jest-dom';

// Mock window.matchMedia for environments where it's not available (e.g., jsdom)
window.matchMedia = window.matchMedia || (() => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
}));
