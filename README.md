# Recovery Buddy

A single-page application for tracking attendance in clinical and non-clinical group therapy sessions. Built with React 18, Vite, and Framer Motion.

## Features

- **Group Management** — Track progress across clinical, mandatory, after-30-days, and support groups
- **Check-In / Check-Out** — Record daily session attendance with optional notes and undo support
- **Progress Tracking** — Visual progress bars and rings per category and overall
- **Weekend Pass Eligibility** — 30-day countdown tracker with pass claiming and history
- **Certificate Tracking** — Automatic completion detection across certificate categories
- **NYC Time Sync** — Clock synchronized to America/New_York timezone via API-Ninjas, with local fallback
- **Data Export/Import** — JSON-based backup and restore of all program data
- **Dark Mode** — Automatic theme via `prefers-color-scheme`
- **Mobile Layout** — Bottom-tab navigation on viewports ≤768px

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 8 | Build tool and dev server |
| Vitest 4 | Testing framework |
| Testing Library | Component testing utilities |
| motion (Framer Motion) | Animations and transitions |
| api-ninjas.com | NYC timezone API |

## Available Scripts

```
npm start      — Start development server
npm run build  — Production build to dist/
npm test       — Run test suite
npm run preview — Preview production build
```

## Project Structure

```
src/
├── components/       # React components (Dashboard, GroupCard, etc.)
│   ├── Dashboard.jsx       # Main orchestrator / state management
│   ├── GroupCard.jsx       # Individual group progress card
│   ├── DailyCheckIn.jsx    # Check-in modal with focus trapping
│   ├── CategoryTabs.jsx    # Category filter tabs
│   ├── PassCountdown.jsx   # Weekend pass eligibility tracker
│   ├── CertificateTracker.jsx  # Certificate completion status
│   ├── ProgressOverview.jsx    # Per-category progress bars
│   ├── ProgressBar.jsx     # Reusable animated progress bar
│   ├── MobileLayout.jsx    # Mobile bottom-tab layout
│   ├── StartDateButton.jsx # Program start date picker + reset
│   ├── ToastContainer.jsx  # Toast notification stack
│   ├── ErrorBoundary.jsx   # React error boundary
│   └── Icons.jsx           # SVG icon components
├── data/             # Static data definitions
│   ├── programData.js      # Group definitions and helpers
│   └── categories.js       # Category definitions
├── services/         # Business logic / persistence
│   ├── storage.js          # localStorage CRUD with validation
│   ├── nycTime.js          # NYC time sync and drift calculation
│   └── api.js              # API fetch for world time
├── hooks/            # Custom React hooks
│   └── useMediaQuery.js    # Reactive media query hook
├── index.jsx         # App entry point
└── App.jsx           # Root component
```

## Data Storage

All data is persisted in the browser's `localStorage` under three keys:
- `clinical-program-tracker` — group progress (completed counts)
- `clinical-program-checkins` — individual check-in records
- `clinical-program-settings` — program start date, pass history, preferences

## License

MIT
