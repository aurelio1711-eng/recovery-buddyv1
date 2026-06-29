import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Basic smoke test — verifies the app renders the main heading without crashing
test('renders program tracker title', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { level: 1, name: /Recovery Buddy/i });
  expect(heading).toBeDefined();
});