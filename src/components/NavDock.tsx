import { useGame } from '../state/GameContext'
import type { ViewKey } from '../state/types'
import { Icon, type IconName } from './Icon'
import './NavDock.css'

const ITEMS: { key: ViewKey; label: string; icon: IconName }[] = [
  { key: 'city', label: 'City', icon: 'city' },
  { key: 'issues', label: 'Issues', icon: 'alert' },
  { key: 'measures', label: 'Measures', icon: 'scroll' },
  { key: 'parties', label: 'Parties', icon: 'flag' },
  { key: 'election', label: 'Election', icon: 'ballot' },
  { key: 'challenges', label: 'Challenges', icon: 'leaf' },
  { key: 'community', label: 'Community', icon: 'chat' },
]

export default function NavDock() {
  const { state, openView } = useGame()
  const active = state.view
  const openProblems = state.problems.filter((p) => p.status !== 'resolved').length
  const challengeReady = state.challenges.some((c) => !c.completed)

  const badgeFor = (key: ViewKey) => {
    if (key === 'issues') return openProblems || undefined
    if (key === 'challenges' && challengeReady) return '!'
    return undefined
  }

  return (
    <nav className="dock" aria-label="Main navigation">
      <ul className="dock__list">
        {ITEMS.map((item) => {
          const isActive = active === item.key
          const badge = badgeFor(item.key)
          return (
            <li key={item.key}>
              <button
                className={`dock__item ${isActive ? 'is-active' : ''}`}
                onClick={() => openView(item.key)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="dock__icon">
                  <Icon name={item.icon} size={21} />
                  {badge !== undefined && <span className="dock__badge">{badge}</span>}
                </span>
                <span className="dock__label">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <span className="dock__rule" />

      <button
        className={`dock__profile ${active === 'profile' ? 'is-active' : ''}`}
        onClick={() => openView('profile')}
        aria-label="Open citizen profile"
      >
        <span className="dock__avatar">C</span>
        <span className="dock__profile-meta">
          <span className="dock__profile-name">{state.profile.name}</span>
          <span className="dock__profile-score num">{state.profile.civicScore} civic</span>
        </span>
      </button>
    </nav>
  )
}
