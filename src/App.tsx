import { useEffect, useState } from 'react'
import CityMap from './components/CityMap'
import TopBar from './components/TopBar'
import NavDock from './components/NavDock'
import Toasts from './components/Toasts'
import MobilePanel from './components/MobilePanel'
import { Icon } from './components/Icon'
import { AnimatedNumber } from './components/AnimatedNumber'
import { useGame } from './state/GameContext'
import IssuesView from './views/IssuesView'
import MeasuresView from './views/MeasuresView'
import PartiesView from './views/PartiesView'
import ElectionView from './views/ElectionView'
import ChallengesView from './views/ChallengesView'
import CommunityView from './views/CommunityView'
import ProfileView from './views/ProfileView'
import PartyHQView from './views/PartyHQView'
import type { ViewKey } from './state/types'
import './App.css'

const VIEWS: ViewKey[] = [
  'city',
  'issues',
  'measures',
  'parties',
  'election',
  'challenges',
  'community',
  'profile',
  'partyhq',
]

export default function App() {
  const { state, openProblem, openView, openParty, openPartyHq } = useGame()
  const [hintOpen, setHintOpen] = useState(true)
  const isCity = state.view === 'city'
  const traffic = state.problems.find((p) => p.kind === 'traffic')
  const trafficOpen = traffic && traffic.status !== 'resolved'

  // Deep links let a presenter jump straight to a screen:
  //   /?view=parties  ·  /?hq=1&problem=traffic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hq = params.get('hq')
    const problem = params.get('problem') ?? undefined
    if (hq) {
      openPartyHq(problem)
      return
    }
    const view = params.get('view')
    if (!view || !VIEWS.includes(view as ViewKey)) return
    const party = params.get('party')
    if (party) openParty(party)
    else if (problem && view === 'issues') openProblem(problem)
    else openView(view as ViewKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hidden shortcut to the deputy desk.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === 'h') openPartyHq()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPartyHq])

  return (
    <div className={`app ${isCity ? '' : 'app--dimmed'}`}>
      {/* ---------- hero: the city ---------- */}
      <CityMap />

      {/* ---------- HUD ---------- */}
      <TopBar />

      {/* ---------- status cluster (bottom-left) ---------- */}
      <div className="status-cluster">
        <div className="status paper-glass">
          <span className="status__icon">💰</span>
          <span className="status__meta">
            <span className="status__label">Civic budget</span>
            <span className="status__value num">
              <AnimatedNumber value={state.stats.budget} />
            </span>
          </span>
        </div>
        <div className="status paper-glass">
          <span className="status__icon">⚖️</span>
          <span className="status__meta">
            <span className="status__label">Measures</span>
            <span className="status__value num">
              <AnimatedNumber value={state.measures.length} duration={450} />
            </span>
          </span>
        </div>
      </div>

      {/* ---------- guided demo hint ---------- */}
      {isCity && hintOpen && trafficOpen && (
        <div className="demo-hint">
          <span className="demo-hint__emoji">👋</span>
          <div className="demo-hint__text">
            <strong>Start the demo</strong>
            <span>Open the TRAFFIC CRISIS issue, then draft the tram measure in Party HQ.</span>
          </div>
          <button className="btn btn--sm btn--primary" onClick={() => openProblem('traffic')}>
            Open issue
          </button>
          <button className="demo-hint__close" onClick={() => setHintOpen(false)} aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* ---------- the slightly hidden door to the deputy desk ---------- */}
      <button
        className="hq-key"
        onClick={() => openPartyHq()}
        title="Deputy access — Party HQ (shortcut: H)"
        aria-label="Open Party HQ"
      >
        <Icon name="key" size={16} />
      </button>

      {/* ---------- navigation ---------- */}
      <NavDock />

      {/* ---------- mobile companions (hidden on desktop) ---------- */}
      <MobilePanel />

      {/* ---------- overlays ---------- */}
      {state.view === 'issues' && <IssuesView />}
      {state.view === 'measures' && <MeasuresView />}
      {state.view === 'parties' && <PartiesView />}
      {state.view === 'election' && <ElectionView />}
      {state.view === 'challenges' && <ChallengesView />}
      {state.view === 'community' && <CommunityView />}
      {state.view === 'profile' && <ProfileView />}
      {state.view === 'partyhq' && <PartyHQView />}

      <Toasts />
    </div>
  )
}
