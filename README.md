# PlayVault — College Sports Management (Beginner React Project)

A simple React app with pages for **Dashboard** (stats + team creation +
match filter), **Rulebook** (5 sports as clickable cards + a dynamic
per-sport detail page), and **Equipment** (equipment manager). Team and
equipment data are saved to and loaded from `localStorage`. Matches,
leaderboard, and roster stay as static mock UI.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## File structure

```
playvault/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                # Renders <App /> inside <BrowserRouter>
    ├── App.jsx                  # All <Routes> live here
    ├── index.css                # Light green theme
    ├── data/
    │   ├── mockData.js          # Dummy matches / leaderboard / roster / announcements
    │   └── rulebookData.js      # Shared sports-rules data (list + detail pages)
    ├── components/
    │   ├── Navbar.jsx           # Dashboard / Rulebook / Equipment links
    │   ├── StatCards.jsx        # 3 summary cards on the Dashboard
    │   ├── AnnouncementBanner.jsx
    │   ├── MatchesList.jsx      # Upcoming/Past toggle
    │   ├── Leaderboard.jsx
    │   ├── PlayerRoster.jsx
    │   └── TeamForm.jsx         # Team + player list -> localStorage
    └── pages/
        ├── HomePage.jsx         # Dashboard, route "/"
        ├── RulebookPage.jsx     # Sport cards, route "/rulebook"
        ├── SportDetailPage.jsx  # One sport's rules, route "/rulebook/:sportId"
        ├── EquipmentPage.jsx    # Equipment manager, route "/equipment"
        └── NotFoundPage.jsx     # Wildcard 404 route
```

## Where each syllabus concept shows up

| Concept | Where |
|---|---|
| JSX / Components / Props | Everywhere — e.g. `StatCards` receives `teamsCount` as a prop from `HomePage` |
| `useState` | `TeamForm.jsx`, `EquipmentPage.jsx`, `MatchesList.jsx`, `HomePage.jsx`, `StatCards.jsx`, `AnnouncementBanner.jsx` |
| `useEffect` | `AnnouncementBanner.jsx` (timer), `HomePage.jsx` / `EquipmentPage.jsx` / `StatCards.jsx` (loading saved data from `localStorage` on mount) |
| Derived / computed values | `StatCards.jsx` — Upcoming Matches count and the equipment total are both calculated (`.filter().length`, `.reduce()`) rather than stored directly |
| Controlled components / forms / events | `TeamForm.jsx`, `EquipmentPage.jsx` |
| Conditional rendering | `MatchesList.jsx`, `HomePage.jsx`, `EquipmentPage.jsx`, `TeamForm.jsx`, `SportDetailPage.jsx` (sport-not-found fallback) |
| Rendering lists (`.map` + `key`) | `MatchesList.jsx`, `Leaderboard.jsx`, `PlayerRoster.jsx`, `TeamForm.jsx`, `HomePage.jsx`, `EquipmentPage.jsx`, `RulebookPage.jsx`, `SportDetailPage.jsx` |
| Lifting state up | `TeamForm` → `HomePage` via `onTeamAdded`; `HomePage` → `StatCards` via `teamsCount` |
| React Router basics | `App.jsx` (`<Routes>`, `<Route>`), `Navbar.jsx` / `RulebookPage.jsx` / `SportDetailPage.jsx` (`<Link>`) |
| **Dynamic routes + `useParams`** | `App.jsx` (`path="/rulebook/:sportId"`), `SportDetailPage.jsx` (`useParams()`) |
| 404 page | `NotFoundPage.jsx`, wildcard route `path="*"` |

## How the two new features work

**Live Stat Cards** (`StatCards.jsx`, shown at the top of `HomePage.jsx`)
- **Teams Registered** is passed in as a *prop* (`teamsCount={teams.length}`)
  from `HomePage`, which already keeps a live `teams` array in state. Because
  of this, the number updates immediately after clicking "Save Team" — no
  page reload needed.
- **Equipment in Stock** is read from `localStorage` (`playvault_equipment`)
  inside a `useEffect` that runs once when the Dashboard mounts, then summed
  with `.reduce()` to get the total quantity across all saved items.
- **Upcoming Matches** is a plain *derived value* — `matches.filter(m => m.status === 'upcoming').length` — computed fresh on every render straight from the mock data, with no state needed since the mock data never changes while the app runs.

**Dynamic Rulebook route** (`RulebookPage.jsx` + `SportDetailPage.jsx`)
- `rulebookData.js` now holds one array of sport objects, each with an
  `id` (used in the URL, e.g. `"basketball"`), a display name, and a
  rules list. Both pages import this same array.
- `RulebookPage.jsx` renders one clickable card per sport using `.map()`,
  where each card is a `<Link to={`/rulebook/${entry.id}`}>`.
- `App.jsx` declares the dynamic route: `<Route path="/rulebook/:sportId" element={<SportDetailPage />} />`. The `:sportId` part is a placeholder that matches any URL segment.
- `SportDetailPage.jsx` calls `useParams()` to read that `sportId` value
  out of the URL, then does `sportsRules.find(entry => entry.id === sportId)`
  to look up the matching sport and display its rules. If no match is
  found (someone typed a bad URL), it conditionally renders a
  "Sport Not Found" message instead of crashing.
- A "← Back to Rulebook" `<Link>` at the bottom returns to the card list.

## Notes / limitations (intentional, since this is a beginner project)

- No backend — everything persists only in the browser's `localStorage`.
- Matches, leaderboard, roster, and rulebook rules are hardcoded data files.
- No form validation library — just simple manual checks (e.g. empty-field checks).
- The Equipment count on the Dashboard only refreshes when the Dashboard
  page (re)mounts (e.g. navigating there from another page) — it does not
  live-update while you're sitting on the Equipment page in another tab.
