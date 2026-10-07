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
  /** id of the initiative this problem asks the city to resolve */
  initiativeId: string
  resolved: boolean
}

export interface PolicyImpact {
  label: string
  value: string
  tone: 'good' | 'bad' | 'neutral'
}

export interface PolicyOption {
  id: string
  title: string
  blurb: string
  cost: number
  impacts: PolicyImpact[]
  votes: number
  /** indicator deltas applied to the city when this option passes */
  effect?: Partial<Record<IndicatorKey, number>>
}

export interface Initiative {
  id: string
  question: string
  context: string
  problemId: string
  options: PolicyOption[]
  status: 'open' | 'passed' | 'closed'
  chosenOptionId?: string
  closesIn: string
  voters: number
}

export interface Party {
  id: string
  name: string
  short: string
  /** emoji / glyph mark */
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
}

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

export type ChatTab = 'GLOBAL' | 'PARTY' | 'DISTRICT' | 'INITIATIVE'

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
  | 'initiatives'
  | 'parties'
  | 'election'
  | 'challenges'
  | 'community'
  | 'profile'
