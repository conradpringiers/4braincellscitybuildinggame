import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { IndicatorKey } from './types'
import {
  INITIAL_BUDGET,
  INITIAL_CHALLENGES,
  INITIAL_CHAT,
  INITIAL_FEED,
  INITIAL_HQ,
  INITIAL_INDICATORS,
  INITIAL_MEASURES,
  INITIAL_POPULATION,
  INITIAL_PROBLEMS,
  INITIAL_PROFILE,
  INDICATOR_META,
  PARTIES,
} from './mockData'
import type {
  ChatMessage,
  ChatTab,
  CityIndicators,
  CityProblem,
  Challenge,
  CitizenProfile,
  FeedEvent,
  HqAgendaItem,
  Measure,
  Party,
  PartyHq,
  Toast,
  ViewKey,
} from './types'

/* ============================================================
   State
   ============================================================ */

export interface CityStats {
  population: number
  budget: number
  districts: number
  tramBuilt: boolean
  parkUnlocked: boolean
}

export interface AdoptionRecord {
  measureId: string
  problemId: string
  before: CityIndicators
  after: CityIndicators
  deltas: { key: IndicatorKey; icon: string; label: string; delta: number }[]
  resolved: boolean
}

export interface MeasureInput {
  problemId: string
  title: string
  body: string
  tags: string[]
  cost: number
  effects: Partial<Record<IndicatorKey, number>>
  summary: string
  flags: { tram?: boolean; park?: boolean; housing?: boolean }
  votes: { for: number; against: number }
}

interface GameState {
  stats: CityStats
  indicators: CityIndicators
  problems: CityProblem[]
  measures: Measure[]
  parties: Party[]
  challenges: Challenge[]
  feed: FeedEvent[]
  chat: Record<ChatTab, ChatMessage[]>
  profile: CitizenProfile
  hq: PartyHq
  lastAdoption: AdoptionRecord | null

  view: ViewKey
  activeProblemId: string | null
  activePartyId: string | null
  activeChatTab: ChatTab
  toasts: Toast[]
  arrivalPulse: number
}

type Action =
  | { type: 'OPEN_VIEW'; view: ViewKey }
  | { type: 'CLOSE_SHEET' }
  | { type: 'OPEN_PROBLEM'; problemId: string }
  | { type: 'OPEN_PARTY'; partyId: string }
  | { type: 'JOIN_PARTY'; partyId: string }
  | { type: 'OPEN_HQ'; problemId?: string }
  | { type: 'ADOPT_MEASURE'; input: MeasureInput }
  | { type: 'SET_CHAT_TAB'; tab: ChatTab }
  | { type: 'SEND_CHAT'; text: string }
  | { type: 'SEND_HQ_CHAT'; text: string }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: string }
  | { type: 'JOIN_CHALLENGE'; challengeId: string }
  | { type: 'ADD_CITIZENS'; count: number }
  | { type: 'DISMISS_TOAST'; id: string }

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

let seed = 0
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seed++}`
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const makeToast = (icon: string, title: string, tone: Toast['tone'], body?: string): Toast => ({
  id: uid('toast'),
  icon,
  title,
  tone,
  body,
})

const initialState: GameState = {
  stats: {
    population: INITIAL_POPULATION,
    budget: INITIAL_BUDGET,
    districts: 8,
    tramBuilt: false,
    parkUnlocked: false,
  },
  indicators: { ...INITIAL_INDICATORS },
  problems: INITIAL_PROBLEMS.map((p) => ({ ...p, timeline: [...p.timeline] })),
  measures: INITIAL_MEASURES.map((m) => ({ ...m })),
  parties: PARTIES.map((p) => ({
    ...p,
    mps: p.mps.map((m) => ({ ...m })),
    announcements: p.announcements.map((a) => ({ ...a })),
  })),
  challenges: INITIAL_CHALLENGES.map((c) => ({ ...c })),
  feed: INITIAL_FEED.map((f) => ({ ...f })),
  chat: {
    GLOBAL: INITIAL_CHAT.GLOBAL.map((m) => ({ ...m })),
    PARTY: INITIAL_CHAT.PARTY.map((m) => ({ ...m })),
    DISTRICT: INITIAL_CHAT.DISTRICT.map((m) => ({ ...m })),
    MEASURES: INITIAL_CHAT.MEASURES.map((m) => ({ ...m })),
  },
  profile: { ...INITIAL_PROFILE, badges: INITIAL_PROFILE.badges.map((b) => ({ ...b })) },
  hq: {
    ...INITIAL_HQ,
    coalition: [...INITIAL_HQ.coalition],
    chat: INITIAL_HQ.chat.map((m) => ({ ...m })),
    agenda: INITIAL_HQ.agenda.map((a) => ({ ...a })),
  },
  lastAdoption: null,

  view: 'city',
  activeProblemId: null,
  activePartyId: null,
  activeChatTab: 'GLOBAL',
  toasts: [],
  arrivalPulse: 0,
}

/* ============================================================
   Helpers
   ============================================================ */

function applyEffects(
  indicators: CityIndicators,
  effect?: Partial<Record<IndicatorKey, number>>,
): CityIndicators {
  if (!effect) return indicators
  const next = { ...indicators }
  for (const key of Object.keys(effect) as IndicatorKey[]) {
    next[key] = clamp(next[key] + (effect[key] ?? 0))
  }
  return next
}

function diffIndicators(
  before: CityIndicators,
  after: CityIndicators,
): AdoptionRecord['deltas'] {
  return INDICATOR_META.map((m) => ({
    key: m.key,
    icon: m.icon,
    label: m.label,
    delta: after[m.key] - before[m.key],
  })).filter((d) => d.delta !== 0)
}

/** how much a measure moves a problem toward resolution */
function progressGain(effects: Partial<Record<IndicatorKey, number>>): number {
  const total = Object.values(effects).reduce((a, b) => a + Math.max(0, b ?? 0), 0)
  return Math.min(70, 18 + total * 1.6)
}

function approvalGain(effects: Partial<Record<IndicatorKey, number>>): number {
  const total = Object.values(effects).reduce((a, b) => a + (b ?? 0), 0)
  return Math.round(Math.max(-6, Math.min(9, total / 4)))
}

/* ============================================================
   Reducer
   ============================================================ */

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'OPEN_VIEW':
      return { ...state, view: action.view }

    case 'CLOSE_SHEET':
      return {
        ...state,
        view: 'city',
        activeProblemId: null,
        activePartyId: null,
        lastAdoption: null,
      }

    case 'OPEN_PROBLEM':
      return { ...state, activeProblemId: action.problemId, view: 'issues' }

    case 'OPEN_PARTY':
      return { ...state, activePartyId: action.partyId, view: 'parties' }

    case 'OPEN_HQ':
      return {
        ...state,
        view: 'partyhq',
        activeProblemId: action.problemId ?? state.activeProblemId,
      }

    case 'JOIN_PARTY': {
      if (state.profile.partyId === action.partyId) return state
      const party = state.parties.find((p) => p.id === action.partyId)
      return {
        ...state,
        profile: { ...state.profile, partyId: action.partyId },
        hq: { ...state.hq, partyId: action.partyId },
        feed: [
          { id: uid('feed'), icon: '🤝', text: `Conrad joined ${party?.name ?? 'a party'}.`, time: 'now', tone: 'teal' },
          ...state.feed,
        ],
        toasts: [
          ...state.toasts,
          makeToast(party?.mark ?? '🤝', `Joined ${party?.name ?? 'party'}`, 'teal', party?.tagline),
        ],
      }
    }

    case 'ADOPT_MEASURE': {
      const { input } = action
      const party = state.parties.find((p) => p.id === state.hq.partyId)
      const problem = state.problems.find((p) => p.id === input.problemId) ?? null

      const measure: Measure = {
        id: uid('measure'),
        problemId: input.problemId,
        partyId: state.hq.partyId,
        title: input.title,
        body: input.body,
        tags: input.tags,
        cost: input.cost,
        status: 'applied',
        createdAt: 'just now',
        votes: input.votes,
        effects: input.effects,
        summary: input.summary,
        flags: input.flags,
      }

      const before = { ...state.indicators }
      const after = applyEffects(state.indicators, input.effects)

      const gain = progressGain(input.effects)

      const nextProblems: CityProblem[] = state.problems.map((p) => {
        if (p.id !== input.problemId) return p
        const progress = clamp(p.progress + gain)
        const status: CityProblem['status'] = progress >= 100 ? 'resolved' : 'in-progress'
        return {
          ...p,
          progress,
          status,
          metric: status === 'resolved' ? 'Under control' : p.metric,
          timeline: [
            {
              time: 'now',
              text: `${party?.name ?? 'The party'} applied: ${input.title}.`,
              partyId: state.hq.partyId,
            },
            ...p.timeline,
          ],
        }
      })

      const nextProblem = nextProblems.find((p) => p.id === input.problemId) ?? null
      const justResolved = Boolean(problem && nextProblem && nextProblem.status === 'resolved' && problem.status !== 'resolved')

      const agendaItem: HqAgendaItem = {
        id: uid('ag'),
        time: nowTime(),
        text: `Measure adopted: ${input.title}`,
        tone: 'sage',
      }

      const announcements = party
        ? [
            { id: uid('an'), time: 'now', text: `${input.title} adopted by internal vote (${input.votes.for}–${input.votes.against}).` },
            ...party.announcements,
          ]
        : []

      const nextParties = state.parties.map((p) =>
        p.id !== state.hq.partyId ? p : { ...p, announcements },
      )

      const feedEvents: FeedEvent[] = [
        {
          id: uid('feed'),
          icon: '⚖️',
          text: `${party?.name ?? 'A party'} adopted: ${input.title}.`,
          time: 'now',
          tone: 'sage',
        },
      ]
      if (justResolved && nextProblem) {
        feedEvents.push({
          id: uid('feed'),
          icon: '✅',
          text: `${nextProblem.title} is now under control.`,
          time: 'now',
          tone: 'teal',
        })
      }

      const record: AdoptionRecord = {
        measureId: measure.id,
        problemId: input.problemId,
        before,
        after,
        deltas: diffIndicators(before, after),
        resolved: justResolved,
      }

      const approval = Math.max(0, Math.min(100, state.hq.approval + approvalGain(input.effects)))

      return {
        ...state,
        measures: [measure, ...state.measures],
        problems: nextProblems,
        parties: nextParties,
        indicators: after,
        stats: {
          ...state.stats,
          tramBuilt: state.stats.tramBuilt || Boolean(input.flags.tram),
          parkUnlocked: state.stats.parkUnlocked || Boolean(input.flags.park),
        },
        hq: {
          ...state.hq,
          treasury: Math.max(0, state.hq.treasury - input.cost),
          approval,
          agenda: [agendaItem, ...state.hq.agenda],
        },
        profile: {
          ...state.profile,
          civicScore: state.profile.civicScore + 25,
        },
        feed: [...feedEvents, ...state.feed],
        lastAdoption: record,
        toasts: [
          ...state.toasts,
          makeToast('⚖️', 'Measure applied', 'sage', input.title),
          ...(justResolved && nextProblem
            ? [makeToast('✅', `${nextProblem.title} resolved`, 'teal', 'The city is under control here.')]
            : []),
        ],
      }
    }

    case 'SET_CHAT_TAB':
      return { ...state, activeChatTab: action.tab }

    case 'SEND_CHAT': {
      const text = action.text.trim()
      if (!text) return state
      const msg: ChatMessage = {
        id: uid('me'),
        author: 'You',
        initials: 'C',
        color: '#2B2740',
        text,
        time: nowTime(),
        mine: true,
      }
      return {
        ...state,
        chat: { ...state.chat, [state.activeChatTab]: [...state.chat[state.activeChatTab], msg] },
      }
    }

    case 'SEND_HQ_CHAT': {
      const text = action.text.trim()
      if (!text) return state
      const msg: ChatMessage = {
        id: uid('hqme'),
        author: 'You',
        initials: 'C',
        color: '#2B2740',
        text,
        time: nowTime(),
        mine: true,
      }
      return { ...state, hq: { ...state.hq, chat: [...state.hq.chat, msg] } }
    }

    case 'JOIN_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map((c) => (c.id === action.challengeId ? { ...c, joined: true } : c)),
      }

    case 'COMPLETE_CHALLENGE': {
      const challenge = state.challenges.find((c) => c.id === action.challengeId)
      if (!challenge || challenge.completed) return state
      const isMobility = challenge.id === 'mobility'
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.challengeId ? { ...c, progress: c.goal, completed: true, joined: true } : c,
        ),
        indicators: isMobility ? applyEffects(state.indicators, { happiness: 4, environment: 3 }) : state.indicators,
        stats: {
          ...state.stats,
          parkUnlocked: state.stats.parkUnlocked || isMobility,
          population: isMobility ? state.stats.population + 52 : state.stats.population,
        },
        profile: {
          ...state.profile,
          challenges: state.profile.challenges + 1,
          civicScore: state.profile.civicScore + 50,
          sustainability: clamp(state.profile.sustainability + 6),
        },
        feed: [
          { id: uid('feed'), icon: challenge.icon, text: `${challenge.goal} citizens completed the ${challenge.title}.`, time: 'now', tone: 'sage' },
          { id: uid('feed'), icon: '🌳', text: `The community unlocked the ${challenge.unlockedLabel}.`, time: 'now', tone: 'sage' },
          ...state.feed,
        ],
        toasts: [
          ...state.toasts,
          makeToast(challenge.icon, 'City goal achieved', 'sage', `🌳 ${challenge.unlockedLabel} unlocked`),
        ],
      }
    }

    case 'ADD_CITIZENS': {
      const population = state.stats.population + action.count
      const districts = Math.max(state.stats.districts, Math.floor(population / 300))
      const unlocked = districts > state.stats.districts
      const feed: FeedEvent[] = [
        { id: uid('feed'), icon: '🏘️', text: `${action.count.toLocaleString()} new citizens joined Civitas.`, time: 'now', tone: 'blue' },
      ]
      if (unlocked) {
        feed.unshift({ id: uid('feed'), icon: '🏙️', text: 'A new residential block has appeared on the map.', time: 'now', tone: 'orange' })
      }
      return {
        ...state,
        stats: { ...state.stats, population, districts },
        feed: [...feed, ...state.feed],
        arrivalPulse: state.arrivalPulse + 1,
        toasts: [
          ...state.toasts,
          makeToast('🏘️', `${action.count} citizens arrived`, 'blue', unlocked ? 'A new neighbourhood is blooming.' : undefined),
        ],
      }
    }

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }

    default:
      return state
  }
}

/* ============================================================
   Context
   ============================================================ */

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<Action>
  parties: Party[]
  openView: (view: ViewKey) => void
  closeSheet: () => void
  openProblem: (problemId: string) => void
  openParty: (partyId: string) => void
  joinParty: (partyId: string) => void
  openPartyHq: (problemId?: string) => void
  adoptMeasure: (input: MeasureInput) => void
  completeChallenge: (challengeId: string) => void
  joinChallenge: (challengeId: string) => void
  addCitizens: (count: number) => void
  setChatTab: (tab: ChatTab) => void
  sendChat: (text: string) => void
  sendHqChat: (text: string) => void
  dismissToast: (id: string) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const openView = useCallback((view: ViewKey) => dispatch({ type: 'OPEN_VIEW', view }), [])
  const closeSheet = useCallback(() => dispatch({ type: 'CLOSE_SHEET' }), [])
  const openProblem = useCallback((problemId: string) => dispatch({ type: 'OPEN_PROBLEM', problemId }), [])
  const openParty = useCallback((partyId: string) => dispatch({ type: 'OPEN_PARTY', partyId }), [])
  const joinParty = useCallback((partyId: string) => dispatch({ type: 'JOIN_PARTY', partyId }), [])
  const openPartyHq = useCallback((problemId?: string) => dispatch({ type: 'OPEN_HQ', problemId }), [])
  const adoptMeasure = useCallback((input: MeasureInput) => dispatch({ type: 'ADOPT_MEASURE', input }), [])
  const completeChallenge = useCallback((challengeId: string) => dispatch({ type: 'COMPLETE_CHALLENGE', challengeId }), [])
  const joinChallenge = useCallback((challengeId: string) => dispatch({ type: 'JOIN_CHALLENGE', challengeId }), [])
  const addCitizens = useCallback((count: number) => dispatch({ type: 'ADD_CITIZENS', count }), [])
  const setChatTab = useCallback((tab: ChatTab) => dispatch({ type: 'SET_CHAT_TAB', tab }), [])
  const sendChat = useCallback((text: string) => dispatch({ type: 'SEND_CHAT', text }), [])
  const sendHqChat = useCallback((text: string) => dispatch({ type: 'SEND_HQ_CHAT', text }), [])
  const dismissToast = useCallback((id: string) => dispatch({ type: 'DISMISS_TOAST', id }), [])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      parties: state.parties,
      openView,
      closeSheet,
      openProblem,
      openParty,
      joinParty,
      openPartyHq,
      adoptMeasure,
      completeChallenge,
      joinChallenge,
      addCitizens,
      setChatTab,
      sendChat,
      sendHqChat,
      dismissToast,
    }),
    [
      state,
      openView,
      closeSheet,
      openProblem,
      openParty,
      joinParty,
      openPartyHq,
      adoptMeasure,
      completeChallenge,
      joinChallenge,
      addCitizens,
      setChatTab,
      sendChat,
      sendHqChat,
      dismissToast,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
