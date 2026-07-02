# Recovery Buddy

A single-page application for tracking attendance in clinical and non-clinical group therapy sessions within recovery programs. All data stays client-side in the browser's `localStorage` — nothing is uploaded.

Built with React 18, Vite 8, and Motion (Framer Motion).

## Features

- **Group Management** — Track progress across 19 groups in 5 categories (Orientation, Clinical, Mandatory, After 30 Days, Support)
- **Check-In / Check-Out** — Record daily session attendance with date picker, optional notes, and signature capture via HTML5 Canvas
- **Progress Tracking** — Visual progress bars, ring charts, and fraction displays per group and category
- **Performance Review** — Full analytics dashboard with summary cards, weekly attendance table with signatures, completion status, and pass history
- **Weekend Pass Eligibility** — 30-day countdown tracker with pass claiming, history, and eligibility badges
- **NYC Time Sync** — Clock synchronized to America/New_York timezone via API-Ninjas, with automatic local fallback when unreachable
- **Data Export/Import** — JSON-based backup and restore of all program data with schema validation
- **Dark Mode** — Automatic via `prefers-color-scheme` with manual toggle
- **Mobile Layout** — Bottom-tab navigation on viewports ≤768px with responsive header
- **Navigation Drawer** — Slide-out sidebar with dashboard, performance review, category progress, settings, and dark mode toggle
- **Signature Capture** — Canvas-based signature pad with mouse and touch support, saved as PNG data URLs
- **Toast Notifications** — Non-intrusive notifications with undo support for check-ins
- **Accessibility** — Skip-to-content link, focus trapping in modals, `aria-live` regions, `prefers-reduced-motion` support

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 8 | Build tool and dev server |
| Vitest 4 | Testing framework |
| Testing Library | Component testing utilities |
| Motion (Framer Motion) | Animations and transitions |
| date-fns | Date arithmetic and formatting |
| api-ninjas.com | NYC timezone API |
| Vercel Analytics | Usage analytics |
| Vercel Flags | Feature flag management |

## Available Scripts

```
npm start        — Start development server (port 3000)
npm run build    — Production build to dist/
npm test         — Run test suite (Vitest)
npm run preview  — Preview production build
```

## Project Structure

```
src/
├── components/           # React components
│   ├── App.jsx                  # Root component with routing (Landing / Dashboard)
│   ├── Dashboard.jsx            # Main orchestrator / state management hub
│   ├── Landing.jsx              # Welcome / splash screen
│   ├── NavMenu.jsx              # Slide-out navigation drawer
│   ├── MobileLayout.jsx         # Mobile bottom-tab layout (≤768px)
│   ├── GroupCard.jsx            # Individual group progress card
│   ├── DailyCheckIn.jsx         # Check-in modal with focus trapping
│   ├── CategoryTabs.jsx         # Category filter tabs
│   ├── ProgressOverview.jsx     # Per-category progress summary
│   ├── ProgressBar.jsx          # Reusable animated progress bar
│   ├── PassCountdown.jsx        # Weekend pass eligibility tracker
│   ├── PerformanceReview.jsx    # Full analytics and review page
│   ├── SettingsPage.jsx         # Settings view (dates, data management)
│   ├── GroupsPage.jsx           # Groups listing view
│   ├── StartDateButton.jsx      # Start date picker + reset container
│   ├── StartDatePicker.jsx      # Program start date selector
│   ├── ResetButton.jsx          # Destructive data reset
│   ├── ConfirmModal.jsx         # Confirmation dialog
│   ├── SignaturePad.jsx         # Canvas-based signature capture
│   ├── ToastContainer.jsx       # Toast notification stack
│   ├── ErrorBoundary.jsx        # React error boundary
│   └── Icons.jsx                # SVG icon components
├── data/                # Static data definitions
│   ├── programData.js          # Group definitions (19 groups, 5 categories)
│   └── categories.js           # Category definitions with icons
├── services/            # Business logic and persistence
│   ├── storage.js              # localStorage CRUD with validation
│   ├── nycTime.js              # NYC time sync and drift calculation
│   └── api.js                  # API fetch for world time
├── hooks/               # Custom React hooks
│   └── useMediaQuery.js        # Reactive media query hook
├── flags.js             # Vercel feature flags
├── index.jsx            # App entry point
└── index.css            # Global styles and design tokens
```

## Data Storage

All data is persisted in the browser's `localStorage` under three keys:

| Key | Content |
|---|---|
| `clinical-program-tracker` | Array of group objects with `id`, `name`, `required`, `completed`, `category`, `recurring`, `note` |
| `clinical-program-checkins` | Object keyed by `{groupId}-{date}` storing `{ groupId, date, notes, timestamp, signature }` |
| `clinical-program-settings` | Object with `startDate`, `programStartDate`, `lastPassDate`, `passHistory`, `notifications` |

## Deployment

Deployed on Vercel at [recoverybuddy.vercel.app](https://recoverybuddy.vercel.app).

```
vercel --prod    — Deploy to production
```

## License

MIT
