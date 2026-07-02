# Recovery Buddy — Sales Pitch

## The Problem

Recovery programs and clinical therapy groups rely on attendance tracking for compliance, funding, and patient progress monitoring. Most centers still use paper sign-in sheets, spreadsheets, or outdated desktop software — creating busywork for staff, gaps in data, and no real-time visibility into patient participation.

## The Solution

**Recovery Buddy** is a modern, client-side web application that replaces paper attendance logs with a clean, mobile-friendly digital tracker. No accounts, no servers, no data leaving the device.

### Core Value Proposition

| Pain Point | How Recovery Buddy Solves It |
|---|---|
| Paper logs get lost or damaged | All data persisted in-browser with JSON export/import for backup |
| Staff spends hours entering data | Patients check themselves in via a simple tap — signatures included |
| No visibility into progress | Real-time progress bars, rings, and a full Performance Review dashboard |
| Confusing multi-category tracking | 5 preset categories (Orientation, Clinical, Mandatory, After-30, Support) with 19 built-in groups |
| Hard to track recurring vs. fixed groups | Handles both fixed-requirement groups (12–24 sessions) and recurring groups (999 sessions) |
| Weekend pass eligibility is manual | Automatic 30-day countdown with pass claiming and history tracking |
| No mobile access | Full responsive mobile layout with bottom-tab navigation |
| Compliance audits are painful | Exportable JSON data, weekly attendance tables with signature thumbnails |

## Key Features at a Glance

- **19 pre-configured groups** across 5 clinical categories — ready to use out of the box
- **Signature capture** — Patients sign via touch or mouse on an HTML5 Canvas pad
- **Performance Review** — Analytics page with totals, completion status, weekly attendance tables, and pass history
- **Dark mode** — Automatic theme switching for late-shift staff
- **NYC time sync** — Ensures timestamp accuracy even if the device clock is wrong
- **Zero infrastructure** — No backend, no database, no accounts. Open the browser and go.
- **Privacy-first** — All data stays on the device. No data is ever uploaded or transmitted.
- **Free and open-source** — MIT licensed. Self-host on Vercel, Netlify, or any static host.

## Who It's For

- **Outpatient recovery clinics** tracking group therapy attendance
- **Residential treatment centers** managing multiple daily group sessions
- **Sober living homes** monitoring resident participation in required meetings
- **Clinical directors** who need visibility into program compliance
- **Case managers** tracking patient progress across multiple group types

## Competitive Advantages

| Factor | Recovery Buddy | Paper Logs | Spreadsheets | Other Apps |
|---|---|---|---|---|
| Setup time | 1 minute | 0 (but ongoing) | 30 minutes | Hours + accounts |
| Offline capable | Yes | Yes | Varies | Rarely |
| Signatures | Digital capture | Handwritten | No | Rarely |
| Progress visualization | Built-in | No | Manual | Usually |
| Data export | JSON | Manual re-entry | Native | Often limited |
| Cost | Free | Supplies cost | License cost | Usually paid |
| Mobile-friendly | Yes | N/A | No | Varies |

## Pricing

**Free.** Recovery Buddy is open-source under the MIT license. Self-host on your own infrastructure with zero recurring costs.

## Next Steps

- Try it now: [recoverybuddy.vercel.app](https://recoverybuddy.vercel.app)
- View the source: GitHub (private repository)
- Deploy your own instance: `npx vercel --prod`

---

*Recovery Buddy — attendance tracking, simplified.*
