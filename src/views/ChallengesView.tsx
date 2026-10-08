import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import { stagger } from '../components/motion'
import type { Challenge } from '../state/types'
import '../components/views.css'
import './ChallengesView.css'

function ChallengeProgress({ c }: { c: Challenge }) {
  const pct = Math.round((c.progress / c.goal) * 100)
  return (
    <div className="prog">
      <div className="prog__labels">
        <span className="hint">{c.completed ? 'Goal reached' : `${c.goal - c.progress} more needed`}</span>
        <span className="prog__count">
          {c.progress.toLocaleString()} / {c.goal.toLocaleString()}
        </span>
      </div>
      <div className="prog__track">
        <div
          className="prog__fill"
          style={{
            width: `${pct}%`,
            backgroundColor: c.completed ? 'var(--sage)' : 'var(--teal)',
          }}
        />
      </div>
    </div>
  )
}

export default function ChallengesView() {
  const { state, closeSheet, completeChallenge, joinChallenge, openView } = useGame()
  const todays = state.challenges[0]
  const others = state.challenges.slice(1)

  return (
    <Sheet
      eyebrow="Sustainability Challenges"
      title="Today's Challenge"
      subtitle="Small individual choices, made together, unlock real changes in Civitas."
      onClose={closeSheet}
      size="lg"
    >
      {/* ---------- today's challenge ---------- */}
      <div className={`today ${todays.completed ? 'is-complete' : ''}`}>
        <div className="today__head">
          <span className="today__icon">{todays.icon}</span>
          <div className="today__id">
            <span className="eyebrow" style={{ color: 'var(--teal-deep)' }}>
              Mobility Challenge
            </span>
            <h3 className="display today__title">
              {todays.completed ? 'City goal achieved' : 'Move greener today'}
            </h3>
            <p className="today__brief">{todays.brief}</p>
          </div>
          <div className="today__reward">
            <span className="today__reward-label">Reward</span>
            <span className="today__reward-value">{todays.reward}</span>
          </div>
        </div>

        <ChallengeProgress c={todays} />

        {todays.completed ? (
          <div className="unlock-banner">
            <span className="unlock-banner__leaf">🌳</span>
            <div className="unlock-banner__text">
              <strong>City goal achieved</strong>
              <span>New community park unlocked — it's blooming on the map now.</span>
            </div>
            <button className="btn btn--sage btn--sm" onClick={closeSheet}>
              See it on the map <Icon name="chevron" size={15} />
            </button>
          </div>
        ) : (
          <div className="today__foot">
            <div className="today__people">
              <span className="today__avatars">
                {['#56A867', '#DC8A4C', '#3AA091', '#6C90E0'].map((col, i) => (
                  <span key={i} className="today__avatar" style={{ background: col }} />
                ))}
              </span>
              <span className="hint">
                You + {todays.progress.toLocaleString()} citizens are taking part
              </span>
            </div>
            <button className="btn btn--teal" onClick={() => completeChallenge(todays.id)}>
              <Icon name="check" size={17} /> I completed my journey
            </button>
          </div>
        )}

        {todays.completed && (
          <p className="today__recap">
            Your action added the 500th journey. Together the city unlocked{' '}
            <strong>{todays.unlockedLabel}</strong>.
          </p>
        )}
      </div>

      {/* ---------- how the loop works ---------- */}
      <div className="vsection" style={{ marginTop: 24 }}>
        <span className="vsection__title--caps">The Urbloom loop</span>
        <div className="loop">
          {[
            { icon: '🚶', label: 'Real-world green behaviour' },
            { icon: '🎯', label: 'Urbloom challenge' },
            { icon: '🏅', label: 'Civic reward' },
            { icon: '🌳', label: 'City improvement' },
          ].map((s, i) => (
            <div key={s.label} className="loop__step">
              <span className="loop__icon">{s.icon}</span>
              <span className="loop__label">{s.label}</span>
              {i < 3 && <span className="loop__arrow">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- other challenges ---------- */}
      <div className="vsection">
        <div className="vsection__head">
          <span className="vsection__title--caps">More challenges</span>
          <span className="hint">Join to start contributing</span>
        </div>
        <div className="grid-2 stagger">
          {others.map((c, i) => (
            <article key={c.id} className="chal vcard" style={stagger(i)}>
              <div className="chal__head">
                <span className="chal__icon">{c.icon}</span>
                <div className="chal__id">
                  <strong>{c.title}</strong>
                  <span className="hint">{c.brief}</span>
                </div>
              </div>
              <ChallengeProgress c={c} />
              <div className="chal__foot">
                <span className="chip chip--yellow">{c.reward}</span>
                {c.completed ? (
                  <span className="chip chip--sage">
                    <Icon name="check" size={13} /> Done
                  </span>
                ) : c.joined ? (
                  <button className="btn btn--sm btn--teal" onClick={() => completeChallenge(c.id)}>
                    Mark complete
                  </button>
                ) : (
                  <button className="btn btn--sm" onClick={() => joinChallenge(c.id)}>
                    <Icon name="plus" size={15} /> Join
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="vsection" style={{ marginBottom: 0 }}>
        <div className="vcard" style={{ background: 'var(--blue-pale)', borderColor: 'transparent' }}>
          <div className="flex-between flex-wrap" style={{ gap: 14 }}>
            <span className="hint" style={{ color: '#43678c', maxWidth: '60ch' }}>
              Completed challenges feed into the city feed and unlock new infrastructure. See how
              the city is responding right now.
            </span>
            <button className="btn btn--sm" onClick={() => openView('community')}>
              <Icon name="chat" size={16} /> Open city feed
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
