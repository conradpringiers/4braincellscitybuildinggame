# Urbloom

**One city. Everyone decides.**

Urbloom is a frontend-only interactive prototype for a community city builder. The
whole city belongs to a group of players: every new citizen is population growth,
growth creates urban problems, and citizens solve them together through discussion,
parties, initiatives and votes.

The goal is not to build the biggest city — it is to build one that is **prosperous,
healthy, fair and sustainable**.

> **Demo / prototype.** Fictional data, local state only. No backend, auth, database,
> real multiplayer or real AI.

---

## ⭐ Replacing the city artwork (read this first)

The city art is a **single image**. All the game logic, markers and overlays sit on top
of it in a fixed coordinate space, so you can swap the art whenever you like.

```
public/city-map.png      ← your image lives here
```

**How it works**

- The SVG in `src/components/CityMap.tsx` uses a `1600 × 1000` coordinate space
  (16:10).
- Your image is drawn to cover that space (`preserveAspectRatio="xMidYMid slice"`), so
  a slightly different aspect ratio gets centre-cropped — nothing breaks.
- Every interactive layer is positioned in that same `1600 × 1000` space, so markers
  stay put no matter what you draw.

**Positioning your markers**

The problem markers are plain data. Move them by editing `x` / `y` in
`src/state/mockData.ts` (`INITIAL_PROBLEMS`), in `1600 × 1000` units:

| Marker | x | y | Suggested zone |
| --- | --- | --- | --- |
| Traffic crisis | 690 | 372 | downtown |
| Water pressure | 1430 | 468 | reservoir / park |
| Housing shortage | 360 | 690 | residential |
| Air pollution | 1360 | 648 | industrial |

The other overlays live in `src/components/CityMap.tsx` and use the same units: the
congestion heat zone, the tram line path + stops, the unlocked community park, and the
"new neighbourhood" growth zone.

**Tips**

- Ship a `1600 × 1000` (or any 16:10) render and no cropping happens at all.
- Prefer `meet` over `slice` if you'd rather letterbox than crop — change
  `preserveAspectRatio` on the `<image>` in `CityMap.tsx`.
- `public/city-mapor.png` is the original placeholder (with zone guides + marker
  anchors) — handy as a layout reference.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # serve the production build
```

Stack: **React + TypeScript + Vite**, hand-written modern CSS (design tokens in
`src/styles/tokens.css`). No UI framework, no state library, no extra dependencies.

---

## Look & feel

**Modern pixel pastel.**
- Display type: **Pixelify Sans** (pixel headings, logo).
- Body type: **IBM Plex Sans**; all numerals + labels: **IBM Plex Mono** (tabular,
  unambiguous digits — pixel display fonts render `5` and `8` too similarly for data).
- Chunky 2px ink outlines and hard offset shadows (`4px 4px 0`) instead of blur/glass.
- A pastel palette: mint, teal, periwinkle, peach, butter, blush on warm cream, with an
  indigo-charcoal ink (`#2b2740`) for all outlines.

All of that is driven by tokens, so retheming is a matter of editing
`src/styles/tokens.css`.

## Mobile

On phones (≤720px) the layout becomes a column: compact HUD → framed city board →
a "needs your attention" list (the primary way to open issues, since map markers would
be too small to tap) → city feed → bottom tab bar. Sheets go full-screen with a sticky
header and footer.

---

## The 60–90 second demo flow

1. **Start on the city.** 2,481 citizens.
2. Open the **TRAFFIC CRISIS** issue (marker on the map, or the "Start the demo" hint).
3. **Open initiative** → *BUILD A NEW TRAM LINE?* with three policy options and live votes.
4. Select **Build tram line** → **Cast your vote**.
5. Reveal: **approved**, with indicators before → after (**Mobility 61 → 79**,
   **Environment 72 → 81**).
6. **Return to the city** — the tram line animates onto the map, the congestion zone
   clears, the traffic problem shows as resolved.
7. Open **Challenges** → Mobility Challenge at **472 / 500**.
8. Click **I completed my journey** → **500 / 500** → 🎉 *City goal achieved — new
   community park unlocked*, which blooms onto the map.

Presenter deep links (also handy for sharing a screen):

- `/?view=parties` · `?view=election` · `?view=challenges` · `?view=community` · `?view=profile`
- `/?view=parties&party=green`
- `/?view=initiatives&initiative=tram`
- `/?view=initiatives&initiative=tram&cast=tram:tram` — jumps straight to the approved reveal

---

## Screens

| Screen | What it does |
| --- | --- |
| **City** | The hero map, HUD indicators, floating problem markers, budget & neighbourhood count |
| **Issues** | Live urban pressures → open the related initiative |
| **Initiatives** | Policy options with cost/impact forecasts, live vote bars, casting a vote and the approved reveal |
| **Parties** | Fictional parties with manifestos, priorities, members and popularity |
| **Election** | Results with a hemicycle council chart (12 seats) and turnout |
| **Challenges** | Sustainability challenges, collective progress, unlocked city improvements |
| **Community** | Live city feed + chat tabs (Global / Party / District / Initiative) |
| **Profile** | Citizen record — civic score, sustainability, party, badges |

---

## The core idea

```
real-world sustainable behaviour → Urbloom challenge → civic reward → city improvement
```

Individual green actions feed a collective city goal; hitting the goal unlocks a real
change on the map.

---

## Project structure

```
public/
  city-map.png            ← YOUR city artwork (swap freely)
  city-mapor.png          ← original placeholder, with zone guides
src/
  App.tsx                 app shell, deep links, guided demo hint, mobile layout
  styles/                 tokens + base CSS (pixel-pastel design system)
  state/
    types.ts              backend-ready state shapes
    mockData.ts           all fictional demo data (+ marker coordinates)
    GameContext.tsx       the reducer that simulates the city
  components/
    CityMap.tsx           artwork layer + interactive overlays (1600×1000 space)
    TopBar.tsx            population + indicator HUD
    NavDock.tsx           floating game navigation
    Sheet.tsx             overlay panel every screen renders inside
    MobilePanel.tsx       phone-only attention list + feed
    Toasts.tsx            civic event toasts
  views/                  Issues, Initiatives, Parties, Election, Challenges, Community, Profile
  hooks/useCountUp.ts     animated counters
```
