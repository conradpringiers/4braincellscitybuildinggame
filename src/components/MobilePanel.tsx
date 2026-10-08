import { useGame } from '../state/GameContext'
import { Icon } from './Icon'
import { stagger } from './motion'
import './views.css'
import './MobilePanel.css'

/**
 * Mobile-only companion under the city board. On phones the map is shown
 * whole (16:10) so markers would be too small to tap — this list is the
 * primary way to open issues and reach the deputy desk there.
 */
export default function MobilePanel() {
  const { state, openProblem, openPartyHq, openView } = useGame()
  const problems = state.problems.filter((p) => p.status !== 'resolved')
  const measures = state.measures.slice(0, 3)

  return (
    <section className="mobile-panel">
      <div className="vsection" style={{ marginBottom: 20 }}>
        <span className="vsection__title--caps">Needs your attention</span>
        <div className="stack-sm stagger">
          {problems.map((p, i) => (
            <button key={p.id} className="attention" style={stagger(i)} onClick={() => openProblem(p.id)}>
              <span className={`sev sev--${p.severity}`}>{p.severity}</span>
              <span className="attention__title">{p.title}</span>
              <span className="attention__metric">{p.metric}</span>
              <Icon name="chevron" size={16} />
            </button>
          ))}
          <button
            className="attention attention--hq"
            style={stagger(problems.length)}
            onClick={() => openPartyHq(problems[0]?.id)}
          >
            <span className="sev sev--done">HQ</span>
            <span className="attention__title">Deputy access</span>
            <span className="attention__metric">draft a measure</span>
            <Icon name="key" size={16} />
          </button>
        </div>
      </div>

      <div className="vsection" style={{ marginBottom: 20 }}>
        <div className="vsection__head">
          <span className="vsection__title--caps">Recent measures</span>
          <button className="btn btn--ghost btn--sm" onClick={() => openView('measures')}>
            All
          </button>
        </div>
        <div className="stack-sm stagger">
          {measures.map((m, i) => {
            const party = state.parties.find((p) => p.id === m.partyId)
            return (
              <div key={m.id} className="attention attention--static" style={stagger(i)}>
                <span className="measure__dot" style={{ background: party?.color }} />
                <span className="attention__title">{m.title}</span>
                <span className="attention__metric">{party?.short}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="vsection" style={{ marginBottom: 0 }}>
        <span className="vsection__title--caps">City feed</span>
        <div className="feed stagger">
          {state.feed.slice(0, 6).map((f, i) => (
            <div key={f.id} className="feed__item" style={stagger(i)}>
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
