import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import { MeasureCard } from '../components/MeasureCard'
import { stagger } from '../components/motion'
import '../components/views.css'
import './PartiesView.css'

export default function PartiesView() {
  const { state, parties, closeSheet, openParty, openView, openPartyHq, joinParty } = useGame()
  const activeId = state.activePartyId ?? parties[0].id
  const party = parties.find((p) => p.id === activeId)!
  const myPartyId = state.profile.partyId
  const isMember = myPartyId === party.id

  const measures = state.measures.filter((m) => m.partyId === party.id)

  return (
    <Sheet
      eyebrow="Political Parties"
      title="Who shapes the city"
      subtitle="Parties take the decisions. Each one has a leader, deputies, a public record of measures and announcements."
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
                  <span className="party-mini__pop num">
                    {p.popularity}% · {p.seats} {p.seats > 1 ? 'seats' : 'seat'}
                  </span>
                </span>
                {p.headOfGovernment && <span className="party-mini__gov">Gov</span>}
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
              <div className="party-detail__chips">
                <span className="chip" style={{ background: party.colorSoft, color: party.accent }}>
                  <Icon name="flag" size={13} /> Led by {party.leader}
                </span>
                {party.headOfGovernment && (
                  <span className="chip chip--yellow">
                    <Icon name="shield" size={13} /> Head of Government
                  </span>
                )}
                {isMember && (
                  <span className="chip chip--sage">
                    <Icon name="check" size={13} /> Your party
                  </span>
                )}
              </div>
            </div>
            <div className="party-detail__cta">
              {isMember ? (
                <button className="btn btn--primary btn--sm" onClick={() => openPartyHq()}>
                  <Icon name="key" size={15} /> Enter Party HQ
                </button>
              ) : (
                <button className="btn btn--primary btn--sm" onClick={() => joinParty(party.id)}>
                  Join party
                </button>
              )}
            </div>
          </header>

          <div className="party-stats">
            <div className="pstat-block">
              <span className="pstat-block__num">{party.popularity}%</span>
              <span className="pstat-block__label">City support</span>
              <span className="meter">
                <span className="meter__fill" style={{ width: `${party.popularity}%`, background: party.color }} />
              </span>
            </div>
            <div className="pstat-block">
              <span className="pstat-block__num">{party.seats}</span>
              <span className="pstat-block__label">Council seats</span>
            </div>
            <div className="pstat-block">
              <span className="pstat-block__num">{party.members.toLocaleString()}</span>
              <span className="pstat-block__label">Members</span>
            </div>
          </div>

          <div className="vsection" style={{ marginBottom: 0 }}>
            <div className="vsection__head">
              <span className="vsection__title--caps">
                Députés ({party.mps.length})
              </span>
            </div>
            <div className="roster stagger">
              {party.mps.map((mp, i) => (
                <div
                  key={mp.id}
                  className={`mp ${mp.role.includes('Leader') ? 'mp--leader' : ''}`}
                  style={stagger(i)}
                >
                  <span className="mp__avatar" style={{ background: party.color }}>
                    {mp.initials}
                    <span className={`mp__online ${mp.online ? 'is-on' : ''}`} />
                  </span>
                  <span className="mp__meta">
                    <span className="mp__name">{mp.name}</span>
                    <span className="mp__role">{mp.role}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="vsection" style={{ marginBottom: 0 }}>
            <span className="vsection__title--caps">Manifesto</span>
            <p className="party-manifesto">{party.manifesto}</p>
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

          <div className="vsection" style={{ marginBottom: 0 }}>
            <div className="vsection__head">
              <span className="vsection__title--caps">Announcements</span>
              <span className="hint">{party.announcements.length} recent</span>
            </div>
            <div className="announce-list stagger">
              {party.announcements.map((a, i) => (
                <div
                  key={a.id}
                  className="announce"
                  style={{ ...stagger(i), borderLeftColor: party.color }}
                >
                  <Icon name="megaphone" size={16} style={{ color: party.accent, flex: 'none' }} />
                  <span className="announce__text">{a.text}</span>
                  <span className="announce__time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="vsection" style={{ marginBottom: 0 }}>
            <div className="vsection__head">
              <span className="vsection__title--caps">Their measures ({measures.length})</span>
              {measures.length > 0 && (
                <button className="btn btn--ghost btn--sm" onClick={() => openView('measures')}>
                  All measures
                </button>
              )}
            </div>
            {measures.length === 0 ? (
              <div className="empty">
                <span className="empty__icon">📭</span>
                <div className="stack-sm" style={{ gap: 4 }}>
                  <strong className="empty__title">Nothing adopted yet</strong>
                  <span className="hint">This party hasn’t carried a measure through its internal vote.</span>
                </div>
              </div>
            ) : (
              <div className="stack-sm stagger">
                {measures.map((m, i) => (
                  <MeasureCard key={m.id} index={i} measure={m} party={party} showBody={false} />
                ))}
              </div>
            )}
          </div>

          <div className="party-detail__foot">
            <span className="hint">
              {state.hq.electionIn !== '' && `Next election in ${state.hq.electionIn}.`} Council seats decide who governs.
            </span>
            <button className="btn btn--sm" onClick={() => openView('election')}>
              <Icon name="ballot" size={16} /> See election
            </button>
          </div>

          {/* the slightly hidden door */}
          <button className="hq-door" onClick={() => openPartyHq()} title="Deputy access">
            <Icon name="key" size={13} />
            <span>Deputy access</span>
          </button>
        </section>
      </div>
    </Sheet>
  )
}
