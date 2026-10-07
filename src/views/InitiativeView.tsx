import { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import { INDICATOR_META } from '../state/mockData'
import '../components/views.css'
import './InitiativeView.css'

const LETTERS = ['A', 'B', 'C', 'D']

const OPTION_COLORS = ['#7fb7b0', '#cf8a55', '#7fa878', '#7ba3cc']

export default function InitiativeView() {
  const { state, closeSheet, castVote, openInitiative } = useGame()
  const activeId = state.activeInitiativeId
  const initiative = state.initiatives.find((i) => i.id === activeId) ?? null
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    setSelected(null)
  }, [activeId])

  // ---- no initiative chosen: show the docket ----
  if (!initiative) {
    return (
      <Sheet
        eyebrow="Initiatives"
        title="Open votes"
        subtitle="Citizens propose, debate and decide. Here is what is on the ballot in Civitas right now."
        onClose={closeSheet}
        size="lg"
      >
        <div className="stack-sm">
          {state.initiatives.map((i) => {
            const passed = i.status === 'passed'
            const chosen = i.options.find((o) => o.id === i.chosenOptionId)
            return (
              <button
                key={i.id}
                className="vcard docket"
                onClick={() => openInitiative(i.id)}
                style={{ textAlign: 'left' }}
              >
                <div className="flex-between flex-wrap" style={{ gap: 12 }}>
                  <div className="stack-sm" style={{ gap: 6, minWidth: 0 }}>
                    <span className="issue__title">{i.question}</span>
                    <span className="issue__detail">{i.context}</span>
                  </div>
                  {passed ? (
                    <span className="chip chip--sage">
                      <Icon name="check" size={14} /> Passed · {chosen?.title}
                    </span>
                  ) : (
                    <span className="chip chip--orange">Closes in {i.closesIn}</span>
                  )}
                </div>
                <div className="flex-between" style={{ marginTop: 4 }}>
                  <span className="hint">{i.voters.toLocaleString()} citizens voting</span>
                  <span className="docket__go">
                    {passed ? 'View result' : 'Vote now'} <Icon name="chevron" size={15} />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </Sheet>
    )
  }

  const passed = initiative.status === 'passed'
  const chosenId = initiative.chosenOptionId
  const decision = state.lastDecision?.initiativeId === initiative.id ? state.lastDecision : null
  const totalVoters = initiative.voters

  /* ---------- success reveal ---------- */
  if (passed && decision) {
    const chosen = initiative.options.find((o) => o.id === chosenId)
    return (
      <Sheet bare onClose={closeSheet} size="lg">
        <div className="passreveal">
          <div className="passreveal__badge">
            <span className="passreveal__check">
              <Icon name="check" size={34} />
            </span>
          </div>
          <span className="eyebrow" style={{ color: '#4f7049' }}>
            Decision recorded
          </span>
          <h2 className="display passreveal__title">{chosen?.title} approved</h2>
          <p className="passreveal__sub">
            {totalVoters.toLocaleString()} citizens took part. The city will act on this immediately.
          </p>

          <div className="passreveal__stats">
            {decision.deltas
              .filter((d) => d.key !== 'energy')
              .map((d) => {
                const meta = INDICATOR_META.find((m) => m.key === d.key)!
                return (
                  <div key={d.key} className="pstat">
                    <span className="pstat__icon">{meta.icon}</span>
                    <span className="pstat__label">{meta.label}</span>
                    <span className="pstat__values">
                      <span className="pstat__from num">{decision.before[d.key]}</span>
                      <span className={`pstat__arrow ${d.delta > 0 ? 'is-up' : 'is-down'}`}>
                        {d.delta > 0 ? '▲' : '▼'}
                      </span>
                      <span className="pstat__to num">{decision.after[d.key]}</span>
                      <span className={`pstat__delta ${d.delta > 0 ? 'is-up' : 'is-down'}`}>
                        {d.delta > 0 ? '+' : ''}
                        {d.delta}
                      </span>
                    </span>
                  </div>
                )
              })}
            {decision.deltas.length === 0 && (
              <p className="hint">No immediate indicator change was recorded.</p>
            )}
          </div>

          <div className="passreveal__actions">
            <button className="btn btn--primary" onClick={closeSheet}>
              Return to the city
              <Icon name="chevron" size={16} />
            </button>
            <button className="btn btn--ghost" onClick={() => openInitiative(initiative.id)}>
              View full result
            </button>
          </div>
        </div>
      </Sheet>
    )
  }

  /* ---------- voting ---------- */
  return (
    <Sheet
      eyebrow={passed ? 'Result' : `Open vote · closes in ${initiative.closesIn}`}
      title={initiative.question}
      subtitle={initiative.context}
      onClose={closeSheet}
      size="lg"
      footer={
        passed ? (
          <>
            <span className="hint">
              Approved: <strong>{initiative.options.find((o) => o.id === chosenId)?.title}</strong>
            </span>
            <button className="btn btn--primary" onClick={closeSheet}>
              Return to the city
            </button>
          </>
        ) : (
          <>
            <span className="hint">
              {selected ? 'Your vote is ready.' : 'Select an option to cast your vote.'} ·{' '}
              {totalVoters.toLocaleString()} citizens voting
            </span>
            <button
              className="btn btn--primary"
              disabled={!selected}
              onClick={() => selected && castVote(initiative.id, selected)}
            >
              <Icon name="ballot" size={17} />
              Cast your vote
            </button>
          </>
        )
      }
    >
      <div className="vsection">
        <div className="vsection__head">
          <span className="vsection__title--caps">Choose a policy</span>
          <span className="hint">Impacts are forecasts from the city planning office</span>
        </div>

        <div className="grid-3">
          {initiative.options.map((o, idx) => {
            const isSelected = selected === o.id
            const isChosen = passed && chosenId === o.id
            return (
              <button
                key={o.id}
                className={`opt ${isSelected ? 'is-selected' : ''} ${isChosen ? 'is-chosen' : ''}`}
                onClick={() => !passed && setSelected(o.id)}
                disabled={passed}
                style={{ textAlign: 'left' }}
              >
                <div className="opt__head">
                  <span className="opt__letter">{LETTERS[idx]}</span>
                  {isChosen ? (
                    <span className="chip chip--sage">
                      <Icon name="check" size={13} /> Approved
                    </span>
                  ) : (
                    <span className="opt__cost">Cost {o.cost.toLocaleString()}</span>
                  )}
                </div>

                <span className="opt__title">{o.title}</span>
                <span className="opt__blurb">{o.blurb}</span>

                <div className="impacts">
                  {o.impacts.map((im) => (
                    <span key={im.label} className={`impact impact--${im.tone}`}>
                      <span className="impact__label">{im.label}</span>
                      <span className="impact__value num">{im.value}</span>
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="vsection">
        <div className="vsection__head">
          <span className="vsection__title--caps">Current vote</span>
          <span className="hint">{totalVoters.toLocaleString()} citizens</span>
        </div>
        <div className="vote-list">
          {initiative.options.map((o, idx) => (
            <div key={o.id} className="vote-row">
              <span className="vote-row__name">
                {o.title}
                {state.userVotes[initiative.id] === o.id && (
                  <span className="chip chip--sage" style={{ marginLeft: 8, padding: '2px 8px' }}>
                    your vote
                  </span>
                )}
              </span>
              <span className="vote-row__pct">{o.votes}%</span>
              <span className="vote-row__bar">
                <span
                  className="vote-row__fill"
                  style={{ width: `${o.votes}%`, background: OPTION_COLORS[idx % OPTION_COLORS.length] }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
