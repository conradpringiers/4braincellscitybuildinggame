import { useGame } from '../state/GameContext'
import { Icon } from './Icon'
import './views.css'
import './MobilePanel.css'

/**
 * Mobile-only companion under the city board. On phones the map is shown
 * whole (16:10) so markers would be too small to tap — this list is the
 * primary way to open issues and initiatives there.
 */
export default function MobilePanel() {
  const { state, openProblem, openInitiative } = useGame()
  const problems = state.problems.filter((p) => !p.resolved)
  const initiatives = state.initiatives.filter((i) => i.status === 'open')
  const feed = state.feed.slice(0, 6)

  return (
    <section className="mobile-panel">
      <div className="vsection" style={{ marginBottom: 20 }}>
        <span className="vsection__title--caps">Needs your attention</span>
        <div className="stack-sm">
          {problems.map((p) => (
            <button key={p.id} className="attention" onClick={() => openProblem(p.id)}>
              <span className={`sev sev--${p.severity}`}>{p.severity}</span>
              <span className="attention__title">{p.title}</span>
              <span className="attention__metric">{p.metric}</span>
              <Icon name="chevron" size={16} />
            </button>
          ))}
          {initiatives.map((i) => (
            <button key={i.id} className="attention" onClick={() => openInitiative(i.id)}>
              <span className="sev sev--watch">vote</span>
              <span className="attention__title">{i.question}</span>
              <span className="attention__metric">closes {i.closesIn}</span>
              <Icon name="chevron" size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="vsection" style={{ marginBottom: 0 }}>
        <span className="vsection__title--caps">City feed</span>
        <div className="feed">
          {feed.map((f) => (
            <div key={f.id} className="feed__item">
              <span className={`feed__icon feed__icon--${f.tone}`}>{f.icon}</span>
              <span className="feed__text">{f.text}</span>
              <span className="feed__time">{f.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
