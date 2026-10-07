import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import '../components/views.css'
import './PartiesView.css'

export default function PartiesView() {
  const { state, parties, closeSheet, openParty, openView, joinParty } = useGame()
  const activeId = state.activePartyId ?? parties[0].id
  const party = parties.find((p) => p.id === activeId)!
  const myPartyId = state.profile.partyId
  const isMember = myPartyId === party.id

  return (
    <Sheet
      eyebrow="Political Parties"
      title="Who shapes the city"
      subtitle="Communities of citizens who share a vision. Join one, shape policy, stand for election."
      onClose={closeSheet}
      size="xl"
    >
      <div className="party-layout">
        <aside className="party-list">
          {parties.map((p) => {
            const active = p.id === activeId
            return (
              <button
                key={p.id}
                className={`party-mini ${active ? 'is-active' : ''}`}
                onClick={() => openParty(p.id)}
                style={{ borderColor: active ? p.color : undefined }}
              >
                <span className="crest crest--sm" style={{ background: p.colorSoft, color: p.accent }}>
                  {p.mark}
                </span>
                <span className="party-mini__meta">
                  <span className="party-mini__name">{p.name}</span>
                  <span className="party-mini__pop num">{p.popularity}% support</span>
                </span>
                {p.id === myPartyId && <span className="party-mini__you">You</span>}
              </button>
            )
          })}
        </aside>

        <section className="party-detail vcard" style={{ borderTop: `6px solid ${party.color}` }}>
          <header className="party-detail__head">
            <span className="crest" style={{ background: party.colorSoft, color: party.accent }}>
              {party.mark}
            </span>
            <div className="party-detail__id">
              <h3 className="display party-detail__name">{party.name}</h3>
              <p className="party-detail__tag">“{party.tagline}”</p>
              <span className="chip" style={{ background: party.colorSoft, color: party.accent }}>
                Led by {party.leader}
              </span>
            </div>
            <div className="party-detail__cta">
              {isMember ? (
                <span className="chip chip--sage">
                  <Icon name="check" size={14} /> Your party
                </span>
              ) : (
                <button className="btn btn--primary btn--sm" onClick={() => joinParty(party.id)}>
                  Join party
                </button>
              )}
            </div>
          </header>

          <div className="party-stats">
            <div className="pstat-block">
              <span className="pstat-block__num num">{party.popularity}%</span>
              <span className="pstat-block__label">City support</span>
              <span className="meter">
                <span className="meter__fill" style={{ width: `${party.popularity}%`, background: party.color }} />
              </span>
            </div>
            <div className="pstat-block">
              <span className="pstat-block__num num">{party.seats}</span>
              <span className="pstat-block__label">Council seats</span>
            </div>
            <div className="pstat-block">
              <span className="pstat-block__num num">{party.members.toLocaleString()}</span>
              <span className="pstat-block__label">Members</span>
            </div>
          </div>

          <div className="vsection" style={{ marginBottom: 0 }}>
            <span className="vsection__title--caps">Manifesto</span>
            <p className="party-manifesto">{party.manifesto}</p>
          </div>

          <div className="vsection" style={{ marginBottom: 0 }}>
            <span className="vsection__title--caps">Priorities</span>
            <div className="priority-grid">
              {party.priorities.map((pr) => (
                <div key={pr.label} className="priority" style={{ background: party.colorSoft }}>
                  <span className="priority__icon">{pr.icon}</span>
                  <span className="priority__label" style={{ color: party.accent }}>
                    {pr.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="party-detail__foot">
            <span className="hint">Elections decide how many council seats each party holds.</span>
            <button className="btn btn--sm" onClick={() => openView('election')}>
              <Icon name="ballot" size={16} /> See election
            </button>
          </div>
        </section>
      </div>
    </Sheet>
  )
}
