import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import '../components/views.css'
import './ProfileView.css'

export default function ProfileView() {
  const { state, parties, closeSheet, openParty, openView, addCitizens, openPartyHq } = useGame()
  const p = state.profile
  const party = parties.find((x) => x.id === p.partyId)
  const earned = p.badges.filter((b) => b.earned).length

  const civicEnergy = Math.min(100, Math.round((p.civicScore % 1000) / 10))

  return (
    <Sheet
      eyebrow="Citizen Profile"
      title="Your citizen record"
      subtitle="Everything you do in Civitas feeds back into the shared city."
      onClose={closeSheet}
      size="lg"
    >
      <div className="profile">
        <aside className="profile__card vcard">
          <span className="profile__avatar">{p.name.slice(0, 1)}</span>
          <h3 className="display profile__name">{p.name}</h3>
          <span className="chip">{p.rank}</span>
          <span className="hint">Citizen since {p.since}</span>

          {party && (
            <button
              className="profile__party"
              style={{ background: party.colorSoft, color: party.accent }}
              onClick={() => openParty(party.id)}
            >
              <span>{party.mark}</span> {party.name}
              <Icon name="chevron" size={15} />
            </button>
          )}

          <div className="profile__energy">
            <div className="flex-between">
              <span className="vsection__title--caps">Civic energy</span>
              <span className="num" style={{ fontWeight: 700 }}>{civicEnergy}%</span>
            </div>
            <span className="meter">
              <span
                className="meter__fill meter__fill--yellow"
                style={{ width: `${civicEnergy}%` }}
              />
            </span>
          </div>
        </aside>

        <div className="profile__main">
          <div className="profile__stats">
            <div className="bigstat vcard">
              <span className="bigstat__num num">{p.civicScore.toLocaleString()}</span>
              <span className="bigstat__label">Civic score</span>
              <span className="bigstat__sub">Votes, proposals & challenges</span>
            </div>
            <div className="bigstat vcard">
              <span className="bigstat__num num">{p.sustainability}</span>
              <span className="bigstat__label">Sustainability</span>
              <span className="meter">
                <span className="meter__fill meter__fill--sage" style={{ width: `${p.sustainability}%` }} />
              </span>
            </div>
            <div className="bigstat vcard">
              <span className="bigstat__num num">{p.challenges}</span>
              <span className="bigstat__label">Challenges done</span>
              <span className="bigstat__sub">Contributing to city goals</span>
            </div>
          </div>

          <div className="vsection">
            <div className="vsection__head">
              <span className="vsection__title--caps">Badges</span>
              <span className="hint">
                {earned} of {p.badges.length} earned
              </span>
            </div>
            <div className="badge-grid">
              {p.badges.map((b) => (
                <div key={b.id} className={`badge ${b.earned ? 'is-earned' : ''}`}>
                  <span className="badge__icon">{b.earned ? b.icon : '🔒'}</span>
                  <span className="badge__label">{b.label}</span>
                  <span className="badge__state">{b.earned ? 'Earned' : 'Locked'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="vsection" style={{ marginBottom: 0 }}>
            <span className="vsection__title--caps">Quick actions</span>
            <div className="profile__actions">
              <button className="btn" onClick={() => openView('challenges')}>
                <Icon name="leaf" size={16} /> Take a challenge
              </button>
              <button className="btn" onClick={() => openPartyHq()}>
                <Icon name="key" size={16} /> Party HQ
              </button>
              <button className="btn" onClick={() => addCitizens(50)}>
                <Icon name="plus" size={16} /> Invite citizens
              </button>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
