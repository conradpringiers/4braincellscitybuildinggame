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
  INITIAL_INDICATORS,
  INITIAL_INITIATIVES,
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
  Initiative,
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

export interface DecisionRecord {
  initiativeId: string
  optionId: string
  before: CityIndicators
  after: CityIndicators
  deltas: { key: IndicatorKey; icon: string; label: string; delta: number }[]
}

interface GameState {
  stats: CityStats
  indicators: CityIndicators
  problems: CityProblem[]
  initiatives: Initiative[]
  challenges: Challenge[]
  feed: FeedEvent[]
  chat: Record<ChatTab, ChatMessage[]>
  profile: CitizenProfile
  userVotes: Record<string, string>
  lastDecision: DecisionRecord | null

  view: ViewKey
  activeProblemId: string | null
  activeInitiativeId: string | null
  activePartyId: string | null
  activeChatTab: ChatTab
  toasts: Toast[]

  /** purely visual: bumps to retrigger an "arrival" animation on the map */
  arrivalPulse: number
}

type Action =
  | { type: 'OPEN_VIEW'; view: ViewKey }
  | { type: 'CLOSE_SHEET' }
  | { type: 'OPEN_PROBLEM'; problemId: string }
  | { type: 'OPEN_INITIATIVE'; initiativeId: string }
  | { type: 'OPEN_PARTY'; partyId: string }
  | { type: 'JOIN_PARTY'; partyId: string }
  | { type: 'CAST_VOTE'; initiativeId: string; optionId: string }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: string }
  | { type: 'JOIN_CHALLENGE'; challengeId: string }
  | { type: 'ADD_CITIZENS'; count: number }
  | { type: 'SET_CHAT_TAB'; tab: ChatTab }
  | { type: 'SEND_CHAT'; text: string }
  | { type: 'DISMISS_TOAST'; id: string }

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

let toastSeed = 0
const nextToastId = () => `toast-${Date.now()}-${toastSeed++}`

let feedSeed = 0
const nextFeedId = () => `feed-x-${Date.now()}-${feedSeed++}`

const makeToast = (
  icon: string,
  title: string,
  tone: Toast['tone'],
  body?: string,
): Toast => ({ id: nextToastId(), icon, title, tone, body })

const initialState: GameState = {
  stats: {
    population: INITIAL_POPULATION,
    budget: INITIAL_BUDGET,
    districts: 8,
    tramBuilt: false,
    parkUnlocked: false,
  },
  indicators: { ...INITIAL_INDICATORS },
  problems: INITIAL_PROBLEMS.map((p) => ({ ...p })),
  initiatives: INITIAL_INITIATIVES.map((i) => ({
    ...i,
    options: i.options.map((o) => ({ ...o, impacts: o.impacts.map((x) => ({ ...x })) })),
  })),
  challenges: INITIAL_CHALLENGES.map((c) => ({ ...c })),
  feed: INITIAL_FEED.map((f) => ({ ...f })),
  chat: {
    GLOBAL: INITIAL_CHAT.GLOBAL.map((m) => ({ ...m })),
    PARTY: INITIAL_CHAT.PARTY.map((m) => ({ ...m })),
    DISTRICT: INITIAL_CHAT.DISTRICT.map((m) => ({ ...m })),
    INITIATIVE: INITIAL_CHAT.INITIATIVE.map((m) => ({ ...m })),
  },
  profile: { ...INITIAL_PROFILE, badges: INITIAL_PROFILE.badges.map((b) => ({ ...b })) },
  userVotes: {},
  lastDecision: null,

  view: 'city',
  activeProblemId: null,
  activeInitiativeId: null,
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

/** Blend a single user vote into the displayed percentages so the bar moves. */
function blendVotes(votes: number[], chosenIndex: number): number[] {
  const boosted = votes.map((v, i) => (i === chosenIndex ? v + 7 : v))
  const total = boosted.reduce((a, b) => a + b, 0)
  const scaled = boosted.map((v) => Math.round((v / total) * 100))
  const drift = 100 - scaled.reduce((a, b) => a + b, 0)
  scaled[chosenIndex] += drift
  return scaled
}

function diffIndicators(
  before: CityIndicators,
  after: CityIndicators,
): DecisionRecord['deltas'] {
  return INDICATOR_META.map((m) => ({
    key: m.key,
    icon: m.icon,
    label: m.label,
    delta: after[m.key] - before[m.key],
  })).filter((d) => d.delta !== 0)
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
        activeInitiativeId: null,
        activePartyId: null,
        lastDecision: null,
      }

    case 'OPEN_PROBLEM': {
      const problem = state.problems.find((p) => p.id === action.problemId)
      return {
        ...state,
        activeProblemId: action.problemId,
        activeInitiativeId: problem ? problem.initiativeId : null,
        view: 'issues',
      }
    }

    case 'OPEN_INITIATIVE':
      return {
        ...state,
        activeInitiativeId: action.initiativeId,
        view: 'initiatives',
      }

    case 'OPEN_PARTY':
      return { ...state, activePartyId: action.partyId, view: 'parties' }

    case 'JOIN_PARTY': {
      if (state.profile.partyId === action.partyId) return state
      const party = PARTIES.find((p) => p.id === action.partyId)
      return {
        ...state,
        profile: { ...state.profile, partyId: action.partyId },
        feed: [
          {
            id: nextFeedId(),
            icon: '🤝',
            text: `${state.profile.name} joined ${party?.name ?? 'a party'}.`,
            time: 'now',
            tone: 'teal',
          },
          ...state.feed,
        ],
        toasts: [
          ...state.toasts,
          makeToast(
            party?.mark ?? '🤝',
            `Joined ${party?.name ?? 'party'}`,
            'teal',
            party?.tagline,
          ),
        ],
      }
    }

    case 'SET_CHAT_TAB':
      return { ...state, activeChatTab: action.tab }

    case 'SEND_CHAT': {
      const text = action.text.trim()
      if (!text) return state
      const msg: ChatMessage = {
        id: `me-${Date.now()}`,
        author: 'You',
        initials: 'C',
        color: '#2f3238',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mine: true,
      }
      return {
        ...state,
        chat: { ...state.chat, [state.activeChatTab]: [...state.chat[state.activeChatTab], msg] },
      }
    }

    case 'CAST_VOTE': {
      const initiative = state.initiatives.find((i) => i.id === action.initiativeId)
      if (!initiative || initiative.status === 'passed') return state

      const chosenIndex = initiative.options.findIndex((o) => o.id === action.optionId)
      if (chosenIndex < 0) return state
      const chosen = initiative.options[chosenIndex]

      const blended = blendVotes(
        initiative.options.map((o) => o.votes),
        chosenIndex,
      )

      const before = { ...state.indicators }
      const after = applyEffects(state.indicators, chosen.effect)

      const nextInitiatives = state.initiatives.map((i) =>
        i.id !== initiative.id
          ? i
          : {
              ...i,
              status: 'passed' as const,
              chosenOptionId: action.optionId,
              options: i.options.map((o, idx) => ({ ...o, votes: blended[idx] })),
            },
      )

      const nextProblems: CityProblem[] = state.problems.map((p) =>
        p.initiativeId === initiative.id ? { ...p, resolved: true } : p,
      )

      const decision: DecisionRecord = {
        initiativeId: initiative.id,
        optionId: chosen.id,
        before,
        after,
        deltas: diffIndicators(before, after),
      }

      const feedEvents: FeedEvent[] = [
        {
          id: nextFeedId(),
          icon: chosen.id === 'tram' ? '🚇' : '📜',
          text:
            chosen.id === 'tram'
              ? 'The Downtown Tram Line has been approved by citizens.'
              : `Citizens approved: ${chosen.title}.`,
          time: 'now',
          tone: chosen.id === 'tram' ? 'teal' : 'blue',
        },
        {
          id: nextFeedId(),
          icon: '✅',
          text: `${initiative.question
            .toLowerCase()
            .replace(/\?$/, '')} — decision recorded.`,
          time: 'now',
          tone: 'sage',
        },
      ]

      const tramBuilt = state.stats.tramBuilt || chosen.id === 'tram'

      return {
        ...state,
        indicators: after,
        initiatives: nextInitiatives,
        problems: nextProblems,
        stats: {
          ...state.stats,
          budget: state.stats.budget - chosen.cost,
          tramBuilt,
        },
        feed: [...feedEvents, ...state.feed],
        lastDecision: decision,
        userVotes: { ...state.userVotes, [initiative.id]: chosen.id },
        toasts: [
          ...state.toasts,
          makeToast(
            chosen.id === 'tram' ? '🚇' : '📜',
            chosen.id === 'tram' ? 'Tram line approved' : 'Decision recorded',
            'teal',
            chosen.id === 'tram'
              ? 'Downtown relief works begin this season.'
              : chosen.title,
          ),
        ],
      }
    }

    case 'JOIN_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.challengeId ? { ...c, joined: true } : c,
        ),
      }

    case 'COMPLETE_CHALLENGE': {
      const challenge = state.challenges.find((c) => c.id === action.challengeId)
      if (!challenge || challenge.completed) return state

      const nextChallenges = state.challenges.map((c) =>
        c.id === action.challengeId
          ? { ...c, progress: c.goal, completed: true, joined: true }
          : c,
      )

      const feedEvents: FeedEvent[] = [
        {
          id: nextFeedId(),
          icon: challenge.icon,
          text: `${challenge.goal} citizens completed the ${challenge.title}.`,
          time: 'now',
          tone: 'sage',
        },
        {
          id: nextFeedId(),
          icon: '🌳',
          text: `The community unlocked the ${challenge.unlockedLabel}.`,
          time: 'now',
          tone: 'sage',
        },
      ]

      const isMobility = challenge.id === 'mobility'

      return {
        ...state,
        challenges: nextChallenges,
        indicators: isMobility
          ? applyEffects(state.indicators, { happiness: 4, environment: 3 })
          : state.indicators,
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
        feed: [...feedEvents, ...state.feed],
        toasts: [
          ...state.toasts,
          makeToast(
            challenge.icon,
            'City goal achieved',
            'sage',
            `🌳 ${challenge.unlockedLabel} unlocked`,
          ),
        ],
      }
    }

    case 'ADD_CITIZENS': {
      const population = state.stats.population + action.count
      const districts = Math.max(state.stats.districts, Math.floor(population / 300))
      const unlocked = districts > state.stats.districts

      const feed: FeedEvent[] = [
        {
          id: nextFeedId(),
          icon: '🏘️',
          text: `${action.count.toLocaleString()} new citizens joined Civitas.`,
          time: 'now',
          tone: 'blue',
        },
      ]
      if (unlocked) {
        feed.push({
          id: nextFeedId(),
          icon: '🏙️',
          text: 'A new residential block has appeared on the map.',
          time: 'now',
          tone: 'orange',
        })
      }

      return {
        ...state,
        stats: { ...state.stats, population, districts },
        feed: [...feed, ...state.feed],
        arrivalPulse: state.arrivalPulse + 1,
        toasts: [
          ...state.toasts,
          makeToast(
            '🏘️',
            `${action.count} citizens arrived`,
            'blue',
            unlocked ? 'A new neighbourhood is blooming.' : undefined,
          ),
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
  openView: (view: ViewKey) => void
  closeSheet: () => void
  openProblem: (problemId: string) => void
  openInitiative: (initiativeId: string) => void
  openParty: (partyId: string) => void
  joinParty: (partyId: string) => void
  castVote: (initiativeId: string, optionId: string) => void
  completeChallenge: (challengeId: string) => void
  joinChallenge: (challengeId: string) => void
  addCitizens: (count: number) => void
  setChatTab: (tab: ChatTab) => void
  sendChat: (text: string) => void
  dismissToast: (id: string) => void
  parties: typeof PARTIES
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const openView = useCallback((view: ViewKey) => dispatch({ type: 'OPEN_VIEW', view }), [])
  const closeSheet = useCallback(() => dispatch({ type: 'CLOSE_SHEET' }), [])
  const openProblem = useCallback(
    (problemId: string) => dispatch({ type: 'OPEN_PROBLEM', problemId }),
    [],
  )
  const openInitiative = useCallback(
    (initiativeId: string) => dispatch({ type: 'OPEN_INITIATIVE', initiativeId }),
    [],
  )
  const openParty = useCallback((partyId: string) => dispatch({ type: 'OPEN_PARTY', partyId }), [])
  const joinParty = useCallback((partyId: string) => dispatch({ type: 'JOIN_PARTY', partyId }), [])
  const castVote = useCallback(
    (initiativeId: string, optionId: string) =>
      dispatch({ type: 'CAST_VOTE', initiativeId, optionId }),
    [],
  )
  const completeChallenge = useCallback(
    (challengeId: string) => dispatch({ type: 'COMPLETE_CHALLENGE', challengeId }),
    [],
  )
  const joinChallenge = useCallback(
    (challengeId: string) => dispatch({ type: 'JOIN_CHALLENGE', challengeId }),
    [],
  )
  const addCitizens = useCallback(
    (count: number) => dispatch({ type: 'ADD_CITIZENS', count }),
    [],
  )
  const setChatTab = useCallback((tab: ChatTab) => dispatch({ type: 'SET_CHAT_TAB', tab }), [])
  const sendChat = useCallback((text: string) => dispatch({ type: 'SEND_CHAT', text }), [])
  const dismissToast = useCallback((id: string) => dispatch({ type: 'DISMISS_TOAST', id }), [])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      openView,
      closeSheet,
      openProblem,
      openInitiative,
      openParty,
      joinParty,
      castVote,
      completeChallenge,
      joinChallenge,
      addCitizens,
      setChatTab,
      sendChat,
      dismissToast,
      parties: PARTIES,
    }),
    [
      state,
      openView,
      closeSheet,
      openProblem,
      openInitiative,
      openParty,
      joinParty,
      castVote,
      completeChallenge,
      joinChallenge,
      addCitizens,
      setChatTab,
      sendChat,
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
