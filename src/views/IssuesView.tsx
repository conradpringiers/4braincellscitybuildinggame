import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import type { CityProblem } from '../state/types'
import '../components/views.css'

const KIND_ICON: Record<CityProblem['kind'], string> = {
  traffic: '🚗',
  water: '💧',
  housing: '🏠',
  energy: '⚡',
  waste: '🗑️',
  pollution: '🌫️',
  health: '🏥',
}

const SEV_TONE: Record<CityProblem['severity'], string> = {
  critical: 'critical',
  warning: 'warning',
  watch: 'watch',
}

export default function IssuesView() {
  const { state, closeSheet, openInitiative, openView } = useGame()
  const { problems, activeProblemId } = state
  const openCount = problems.filter((p) => !p.resolved).length

  return (
    <Sheet
      eyebrow="City Issues"
      title="What needs fixing"
      subtitle={`${openCount} active pressures are being tracked across Civitas. Citizens decide how to respond.`}
      onClose={closeSheet}
      size="lg"
    >
      <div className="vsection">
        <div className="vsection__head">
          <span className="vsection__title--caps">Live pressures</span>
          <span className="hint">Tap an issue to open its initiative</span>
        </div>

        <div className="stack-sm">
          {problems.map((p) => {
            const initiative = state.initiatives.find((i) => i.id === p.initiativeId)
            const resolved = p.resolved
            return (
              <article
                key={p.id}
                className={`issue ${resolved ? 'is-resolved' : ''} ${
                  activeProblemId === p.id ? 'is-active' : ''
                }`}
              >
                <span
                  className="issue__icon"
                  style={{ background: resolved ? 'var(--sage-pale)' : 'var(--paper-2)' }}
                  aria-hidden
                >
                  {resolved ? '✅' : KIND_ICON[p.kind]}
                </span>

                <div className="issue__body">
                  <div className="issue__top">
                    <span className="issue__title">{p.title}</span>
                    <span className={`sev sev--${resolved ? 'ok' : SEV_TONE[p.severity]}`}>
                      {resolved ? 'Resolved' : p.severity}
                    </span>
                  </div>
                  <span className="issue__metric">{p.metric}</span>
                  <span className="issue__detail">{p.detail}</span>
                </div>

                {resolved ? (
                  <span className="chip chip--sage">
                    <Icon name="check" size={14} /> Addressed
                  </span>
                ) : (
                  <button
                    className="btn btn--sm btn--primary"
                    onClick={() => (initiative ? openInitiative(initiative.id) : openView('initiatives'))}
                  >
                    Open initiative
                    <Icon name="chevron" size={15} />
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </div>

      <div className="vsection">
        <div className="vcard" style={{ background: 'var(--sage-pale)', borderColor: 'transparent' }}>
          <div className="flex-between flex-wrap" style={{ gap: 14 }}>
            <div className="stack-sm" style={{ gap: 4, maxWidth: '58ch' }}>
              <span className="eyebrow" style={{ color: '#4f7049' }}>
                How it works
              </span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
                Growth creates problems. Citizens solve them together.
              </strong>
              <span className="hint" style={{ color: '#5c7a56' }}>
                Every issue opens an initiative. Parties take positions, citizens vote, and the
                winning policy changes the city's indicators on the map.
              </span>
            </div>
            <button className="btn btn--sage" onClick={() => openView('initiatives')}>
              <Icon name="scroll" size={17} /> Go to initiatives
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
