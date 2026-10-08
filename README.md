# Urbloom

**One city. Everyone decides.**

Urbloom is a frontend-only prototype for a community city builder. The city of Civitas
belongs to everyone: citizens arrive, the city grows, growth creates problems — and the
**political parties decide how to fix them**.

You are not voting on three options. You are a **deputy**. You write a measure in plain
language, and a policy analyst turns it into a real, costed, applied city intervention.

> **Demo / prototype.** Fictional data, local state only. No backend, auth, database,
> real multiplayer or real AI.

---

## How it plays

**Issues → Measures → Party HQ**

- **Issues** — the city's live pressures (traffic, water, housing, pollution, energy,
  health). Clicking a problem shows **details only**: severity, resolution progress, a
  timeline of what happened, and the **measures already taken on it**. No option cards,
  no public vote.
- **Measures** — the dedicated record of everything the parties have done: sponsor,
  cost, tags, projected indicator effects, the internal vote that carried it, and the
  problem it targets. Filter by status or party.
- **Parties** — each party has a leader, a **head of government** (the majority party),
  a bench of **députés**, an **announcement feed**, their **measures**, and their
  manifesto.
- **Party HQ** (hidden — see below) — the deputy's desk: internal party chat, today's
  agenda, the bench, the problem list, and the measure drafting room with the
  **simulated policy analyst**.

### The hidden door to Party HQ

It's meant to be a little tucked away. Three ways in:

1. 🔑 the faint **key button** bottom-right of the city screen,
2. the keyboard shortcut **`H`**,
3. the discreet **“Deputy access”** link at the bottom of a party page.

### The policy analyst (simulated AI)

In a real game an LLM would read the deputy's text and return a structured measure.
Here `src/state/measureAI.ts` fakes it deterministically with keyword heuristics, in
four visible stages (*parsing → classifying → estimating → cross-checking*):

```
"Build a tram line linking the garden district to downtown, with trees along the corridor"
        ↓
  Mobility / Environment / Housing
  mobility +15 · environment +19 · happiness +11 · cost 820
  confidence 98% · structural change: adds a transit line to the city model
```

If the text names no sector, the analyst falls back to the problem you're addressing.
Adopting the measure runs an internal party vote, applies the indicator changes, advances
the problem's resolution progress, updates the treasury and approval, posts an
announcement, an agenda item and city feed entries — and can **physically change the map**
(a tram line appears, a park blooms).

---

## ⭐ Replacing the city artwork

The city art is a **single image**; every overlay sits on top in a fixed coordinate space.

```
public/city-map.png      ← your image lives here
```

- `src/components/CityMap.tsx` uses a **1600 × 1000 (16:10)** coordinate space. Your
  image covers it (`preserveAspectRatio="xMidYMid slice"`), so a slightly different
  aspect ratio is centre-cropped — nothing breaks.
- Interactive layers in that same space: problem markers, the congestion heat zone, the
  tram line + stops, the unlocked community park, the "new neighbourhood" growth zone.
- Marker positions are data — edit `x` / `y` on each problem in
  `src/state/mockData.ts` (`INITIAL_PROBLEMS`):

| Marker | x | y |
| --- | --- | --- |
| Traffic crisis | 690 | 372 |
| Water pressure | 1430 | 468 |
| Housing shortage | 360 | 690 |
| Air pollution | 1360 | 648 |
| Energy demand | 1450 | 870 |
| Healthcare pressure | 820 | 700 |

- `public/city-mapor.png` is the original placeholder (with zone guides + marker anchors),
  useful as a layout reference.
- Prefer letterboxing to cropping? Change `preserveAspectRatio` on the `<image>` to `meet`.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # serve the production build
```

Stack: **React + TypeScript + Vite**, hand-written CSS (tokens in `src/styles/tokens.css`).
No UI framework, no state library, no extra dependencies.

---

## Look & feel

**Modern pixel pastel.**

- Display: **Pixelify Sans** · body: **IBM Plex Sans** · all numerals & labels:
  **IBM Plex Mono** (tabular, unambiguous digits — pixel display fonts render `5` and `8`
  too similarly for data).
- Chunky 2px ink outlines and hard offset shadows (`4px 4px 0`) instead of blur/glass.
- Pastel palette (mint, teal, periwinkle, peach, butter, blush) on warm cream, with an
  indigo-charcoal ink (`#2b2740`) for every outline.

Retheming = editing `src/styles/tokens.css`.

## Mobile

On phones (≤720px) the layout becomes a column: compact HUD → framed city board →
**Needs your attention** list (the primary way in, since map markers would be too small
to tap — it includes the *Deputy access* row) → recent measures → city feed → bottom tab
bar. Sheets go full-screen with sticky header/footer.

---

## Demo flow (60–90 seconds)

1. **Start on the city.** 2,481 citizens; the TRAFFIC CRISIS marker pulses.
2. Open the issue → details, 12% resolved, and the two measures already taken on it.
3. Hit **Raise a measure** → **Party HQ**.
4. The traffic problem is already selected. Type (or tap an idea):
   *“Build a tram line linking the garden district to downtown, with trees along the
   corridor.”*
5. **Analyze with analyst** → watch the four stages → structured output with cost 820,
   mobility +15, environment +19, happiness +11 and a confidence score.
6. **Adopt measure** → internal vote 6–1, treasury −820, approval 58 → 67%, traffic
   progress 12 → 82%, indicators move, a **tram line appears on the map**, and a new
   announcement lands on the party page.
7. Optional: **Challenges** → the Mobility Challenge at 472/500 → complete it → the
   community park blooms on the map.

### Presenter deep links

- `/?view=issues` · `/?view=measures` · `/?view=parties` · `/?view=election` ·
  `/?view=challenges` · `/?view=community` · `/?view=profile`
- `/?view=issues&problem=traffic`
- `/?view=parties&party=growth`
- `/?hq=1&problem=traffic` — straight to the deputy desk
- `/?hq=1&problem=traffic&draft=<text>&analyze=1` — jump to the analyst output
- `/?hq=1&problem=traffic&draft=<text>&analyze=1&adopt=1` — apply it instantly

---

## Screens

| Screen | What it does |
| --- | --- |
| **City** | The hero map, HUD indicators, problem markers, budget & measure counters |
| **Issues** | Master–detail: problem details, progress, timeline, measures already taken |
| **Measures** | The full record of party decisions, with filters by status and party |
| **Parties** | Leader, head of government, députés bench, announcements, manifesto, their measures |
| **Party HQ** | Deputy desk: internal chat, agenda, bench, problem list, measure drafting + analyst |
| **Election** | Results with a hemicycle council chart (12 seats) and head-of-government marker |
| **Challenges** | Sustainability challenges, collective progress, unlocked city improvements |
| **Community** | Live city feed + chat tabs (Global / Party / District / Measures) |
| **Profile** | Citizen record — civic score, sustainability, party, badges |

---

## Project structure

```
public/
  city-map.png            ← YOUR city artwork (swap freely)
  city-mapor.png          ← original placeholder, with zone guides
src/
  App.tsx                 shell, deep links, hidden door, keyboard shortcut, mobile layout
  styles/                 tokens + base CSS (pixel-pastel design system)
  state/
    types.ts              backend-ready state shapes
    mockData.ts           fictional data (problems, parties, députés, measures, HQ)
    measureAI.ts          the simulated policy analyst
    GameContext.tsx       reducer: adoption, internal votes, treasury, feed
  components/
    CityMap.tsx           artwork layer + interactive overlays (1600×1000 space)
    TopBar.tsx            population + indicator HUD
    NavDock.tsx           floating navigation
    Sheet.tsx             the overlay panel every screen renders inside
    MeasureCard.tsx       the shared measure card
    MobilePanel.tsx       phone-only attention list + feed
    Toasts.tsx            civic event toasts
  views/                  Issues, Measures, Parties, PartyHQ, Election, Challenges, Community, Profile
  hooks/useCountUp.ts     animated counters
```
