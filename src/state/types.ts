/* ============================================================
   URBLOOM — game types
   Frontend-only prototype. All data is fictional mock data.
   The shape of this state is intentionally backend-ready:
   each slice could later be hydrated from an API.
   ============================================================ */

export type IndicatorKey =
  | 'environment'
  | 'mobility'
  | 'water'
  | 'energy'
  | 'happiness'

export type CityIndicators = Record<IndicatorKey, number>

export type ProblemKind =
  | 'traffic'
  | 'water'
  | 'housing'
  | 'energy'
  | 'waste'
  | 'pollution'
  | 'health'

export type ProblemStatus = 'open' | 'in-progress' | 'resolved'

export interface ProblemTimelineEntry {
  time: string
  text: string
  partyId?: string
}

export interface CityProblem {
  id: string
  kind: ProblemKind
  title: string
  /** short line shown on the floating map label, e.g. "+18% congestion" */
  metric: string
  detail: string
  /** x/y are in city-map viewBox units (0..1600, 0..1000) */
  x: number
  y: number
  severity: 'critical' | 'warning' | 'watch'
  status: ProblemStatus
  /** 0..100 — how far the city has got toward solving it */
  progress: number
  timeline: ProblemTimelineEntry[]
}

/* ------------------------------------------------------------
   Measures — the decisions political parties actually take
   ------------------------------------------------------------ */

export type MeasureStatus = 'applied' | 'adopted' | 'rejected'

export interface Measure {
  id: string
  problemId: string
  /** null when a measure is not tied to a specific problem */
  partyId: string
  title: string
  /** the raw text the deputy wrote */
  body: string
  tags: string[]
  cost: number
  status: MeasureStatus
  createdAt: string
  /** internal party vote that carried it */
  votes: { for: number; against: number }
  effects: Partial<Record<IndicatorKey, number>>
  summary: string
  /** structural flags the "AI" picked up, used to change the map */
  flags: { tram?: boolean; park?: boolean; housing?: boolean }
}

/* ------------------------------------------------------------
   Parties
   ------------------------------------------------------------ */

export interface Mp {
  id: string
  name: string
  initials: string
  role: string
  online: boolean
}

export interface Announcement {
  id: string
  time: string
  text: string
}

export interface Party {
  id: string
  name: string
  short: string
  mark: string
  color: string
  colorSoft: string
  accent: string
  tagline: string
  manifesto: string
  priorities: { icon: string; label: string }[]
  members: number
  popularity: number
  seats: number
  leader: string
  headOfGovernment: boolean
  mps: Mp[]
  announcements: Announcement[]
}

/* ------------------------------------------------------------
   Party HQ — the deputy's desk (hidden screen)
   ------------------------------------------------------------ */

export interface HqAgendaItem {
  id: string
  time: string
  text: string
  tone: 'sage' | 'teal' | 'blue' | 'orange' | 'pink' | 'yellow'
}

export interface PartyHq {
  partyId: string
  treasury: number
  approval: number
  coalition: string[]
  /** next election countdown */
  electionIn: string
  chat: ChatMessage[]
  agenda: HqAgendaItem[]
}

/* ------------------------------------------------------------
   Shared
   ------------------------------------------------------------ */

export interface Challenge {
  id: string
  title: string
  icon: string
  brief: string
  reward: string
  progress: number
  goal: number
  unlockedLabel: string
  joined: boolean
  completed: boolean
}

export interface FeedEvent {
  id: string
  icon: string
  text: string
  time: string
  tone: 'sage' | 'teal' | 'blue' | 'orange' | 'pink' | 'yellow'
}

export type ChatTab = 'GLOBAL' | 'PARTY' | 'DISTRICT' | 'MEASURES'

export interface ChatMessage {
  id: string
  author: string
  initials: string
  color: string
  text: string
  time: string
  mine?: boolean
}

export interface Badge {
  id: string
  label: string
  icon: string
  earned: boolean
}

export interface CitizenProfile {
  name: string
  since: string
  civicScore: number
  sustainability: number
  partyId: string
  challenges: number
  rank: string
  badges: Badge[]
}

export interface Toast {
  id: string
  icon: string
  title: string
  body?: string
  tone: 'sage' | 'teal' | 'blue' | 'orange' | 'yellow' | 'pink'
}

export type ViewKey =
  | 'city'
  | 'issues'
  | 'measures'
  | 'parties'
  | 'election'
  | 'challenges'
  | 'community'
  | 'profile'
  | 'partyhq'
