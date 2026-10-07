import { useEffect, useState } from 'react'
import CityMap from './components/CityMap'
import TopBar from './components/TopBar'
import NavDock from './components/NavDock'
import Toasts from './components/Toasts'
import { Icon } from './components/Icon'
import { useGame } from './state/GameContext'
import IssuesView from './views/IssuesView'
import InitiativeView from './views/InitiativeView'
import PartiesView from './views/PartiesView'
import ElectionView from './views/ElectionView'
import ChallengesView from './views/ChallengesView'
import CommunityView from './views/CommunityView'
import ProfileView from './views/ProfileView'
import './App.css'

export default function App() {
  const { state, openProblem, openView, openInitiative, openParty, castVote } = useGame()
  const [hintOpen, setHintOpen] = useState(true)
  const isCity = state.view === 'city'
  const traffic = state.problems.find((p) => p.kind === 'traffic')
  const trafficOpen = traffic && !traffic.resolved

  // Deep links let a presenter jump straight to a screen: /?view=parties
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    if (!view) return
    const valid = ['city', 'issues', 'initiatives', 'parties', 'election', 'challenges', 'community', 'profile']
    if (!valid.includes(view)) return
    const initiative = params.get('initiative')
    const party = params.get('party')
    if (initiative) openInitiative(initiative)
    else if (party) openParty(party)
    else openView(view as Parameters<typeof openView>[0])

    // Presenter shortcut: /?view=initiatives&cast=tram:tram jumps straight to
    // the "approved" reveal for a demo.
    const cast = params.get('cast')
    if (cast) {
      const [initiativeId, optionId] = cast.split(':')
      window.setTimeout(() => castVote(initiativeId, optionId), 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            <span className="status__value num">{state.stats.budget.toLocaleString()}</span>
          </span>
        </div>
        <div className="status paper-glass">
          <span className="status__icon">🏙️</span>
          <span className="status__meta">
            <span className="status__label">Neighbourhoods</span>
            <span className="status__value num">{state.stats.districts}</span>
          </span>
        </div>
      </div>

      {/* ---------- guided demo hint ---------- */}
      {isCity && hintOpen && trafficOpen && (
        <div className="demo-hint">
          <span className="demo-hint__emoji">👋</span>
          <div className="demo-hint__text">
            <strong>Start the demo</strong>
            <span>Tap the TRAFFIC CRISIS marker on the map to open the tram initiative.</span>
          </div>
          <button className="btn btn--sm btn--primary" onClick={() => openProblem('traffic')}>
            Open issue
          </button>
          <button className="demo-hint__close" onClick={() => setHintOpen(false)} aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* ---------- navigation ---------- */}
      <NavDock />

      {/* ---------- overlays ---------- */}
      {state.view === 'issues' && <IssuesView />}
      {state.view === 'initiatives' && <InitiativeView />}
      {state.view === 'parties' && <PartiesView />}
      {state.view === 'election' && <ElectionView />}
      {state.view === 'challenges' && <ChallengesView />}
      {state.view === 'community' && <CommunityView />}
      {state.view === 'profile' && <ProfileView />}

      <Toasts />
    </div>
  )
}
