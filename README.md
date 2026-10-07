# Urbloom

**One city. Everyone decides.**

Urbloom is a frontend-only interactive prototype for a community city builder. The
whole city belongs to a group of players: every new citizen is population growth,
growth creates urban problems, and citizens solve them together through discussion,
parties, initiatives and votes.

The goal is not to build the biggest city — it is to build one that is **prosperous,
healthy, fair and sustainable**.

> This is a **demo / prototype**. The data is fictional, everything runs on local
> state, and there is **no backend, auth, database, real multiplayer or real AI**.

---

## Why it doesn't look like a dashboard

The city is the hero. `src/components/CityMap.tsx` renders a hand-composed, top-down
**paper-diorama** of the fictional city of Civitas as inline SVG — downtown towers,
apartment blocks, a suburban street grid, a hospital, a school, a riverside park, an
industrial works district, a river, bridges, highways and a tram line. Everything
floats on a warm cream canvas with soft shadows and pastel fills.

The SVG is intentionally self-contained and marked with `CITY_MAP_PLACEHOLDER`. It can
be swapped for generated artwork later while keeping the overlay layers (problem pins,
the congestion heat zone, the tram, the unlocked park, population growth) positioned in
the same `1600 × 1000` coordinate space.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build
npm run preview  # serve the production build
```

Stack: **React + TypeScript + Vite**, hand-written modern CSS (design tokens in
`src/styles/tokens.css`). No UI framework, no state library, no extra dependencies.

---

## The 60–90 second demo flow

1. **Start on the city.** 2,481 citizens, a living pastel map.
2. Click the **TRAFFIC CRISIS** marker (or the “Start the demo” hint) → the issue panel.
3. **Open initiative** → *BUILD A NEW TRAM LINE?* with three policy options and live votes.
4. Select **Build tram line** → **Cast your vote**.
5. Watch the reveal: **Tram line approved**, with indicators before → after
   (**Mobility 61 → 79**, **Environment 72 → 81**).
6. **Return to the city** — the tram line animates onto the map, the congestion zone
   clears, and the traffic problem shows as *resolved*.
7. Open **Challenges** → the Mobility Challenge sits at **472 / 500**.
8. Click **I completed my journey** → **500 / 500** → 🎉 *City goal achieved — new
   community park unlocked*, which then blooms onto the map.

Presenter shortcuts (deep links, also handy for sharing a specific screen):

- `/?view=parties` · `?view=election` · `?view=challenges` · `?view=community` · `?view=profile`
- `/?view=parties&party=green`
- `/?view=initiatives&initiative=tram`
- `/?view=initiatives&initiative=tram&cast=tram:tram` — jumps straight to the approved reveal

---

## Screens

| Screen | What it does |
| --- | --- |
| **City** | The hero map, HUD indicators, floating problem markers, budget & neighbourhood count |
| **Issues** | Live urban pressures (traffic, water, housing, pollution) → open the related initiative |
| **Initiatives** | Policy options with cost/impact forecasts, live vote bars, casting a vote and the “approved” reveal |
| **Parties** | Fictional parties (Green Future, Growth First, Community First) with manifestos, priorities, members and popularity |
| **Election** | City election results with a hemicycle council chart (12 seats) and turnout |
| **Challenges** | Sustainability challenges, collective progress, and unlocked city improvements |
| **Community** | A live city feed plus fictional chat tabs (Global / Party / District / Initiative) |
| **Profile** | Citizen record — civic score, sustainability, party, badges |

---

## The core idea

```
real-world sustainable behaviour
        ↓
   Urbloom challenge
        ↓
     civic reward
        ↓
   city improvement
```

Individual green actions feed a collective city goal; hitting the goal unlocks a real
change on the map.

---

## Project structure

```
src/
  App.tsx                 app shell, deep links, guided demo hint
  styles/                 tokens + base CSS (paper pastel design system)
  state/
    types.ts              backend-ready state shapes
    mockData.ts           all fictional demo data
    GameContext.tsx       the reducer that simulates the city
  components/
    CityMap.tsx           CITY_MAP_PLACEHOLDER — the hero SVG
    TopBar.tsx            CIVITAS population + indicator HUD
    NavDock.tsx           floating game navigation
    Sheet.tsx             the overlay panel every screen renders inside
    Toasts.tsx            civic event toasts
    Icon.tsx, views.css   icons + shared view building blocks
  views/                  Issues, Initiatives, Parties, Election, Challenges, Community, Profile
  hooks/useCountUp.ts     animated counters
```

All state lives in `GameContext` as mock objects shaped like API responses, so a real
backend could be layered in later without restructuring the components.
