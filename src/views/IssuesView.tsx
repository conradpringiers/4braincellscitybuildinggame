import { useEffect, useRef } from 'react'
import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import { MeasureCard } from '../components/MeasureCard'
import { stagger } from '../components/motion'
import { PROBLEM_ICON } from '../state/mockData'
import type { CityProblem } from '../state/types'
import '../components/views.css'
import './IssuesView.css'

const STATUS_LABEL: Record<CityProblem['status'], string> = {
  open: 'Open',
  'in-progress': 'In progress',
  resolved: 'Resolved',
}

const SEV_CLASS: Record<CityProblem['severity'], string> = {
  critical: 'critical',
  warning: 'warning',
  watch: 'watch',
}

export default function IssuesView() {
  const { state, closeSheet, openProblem, openPartyHq, openView } = useGame()
  const { problems, measures, parties, activeProblemId } = state
  const detailRef = useRef<HTMLDivElement>(null)

  const selected =
    problems.find((p) => p.id === activeProblemId) ?? problems[0] ?? null

  const openCount = problems.filter((p) => p.status !== 'resolved').length

  // on phones the list stacks above the detail — bring the detail into view
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth <= 900 && activeProblemId) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeProblemId])

  const problemMeasures = selected
    ? measures.filter((m) => m.problemId === selected.id)
    : []

  return (
    <Sheet
      eyebrow="City Issues"
      title="What needs fixing"
      subtitle={`${openCount} active pressures are tracked across Civitas. Details below, and the measures the parties have already taken.`}
      onClose={closeSheet}
      size="xl"
    >
      <div className="issues-layout">
        {/* ---------- list ---------- */}
        <aside className="issues-list stagger">
          <span className="vsection__title--caps">Live pressures</span>
          {problems.map((p, i) => {
            const isActive = selected?.id === p.id
            return (
              <button
                key={p.id}
                className={`prow ${isActive ? 'is-active' : ''}`}
                onClick={() => openProblem(p.id)}
                style={stagger(i)}
              >
                <span className={`prow__icon prow__icon--${p.severity}`}>{PROBLEM_ICON[p.kind]}</span>
                <span className="prow__body">
                  <span className="prow__top">
                    <span className="prow__title">{p.title}</span>
                    <span className={`sev sev--${p.severity === 'critical' ? 'critical' : p.severity === 'warning' ? 'warning' : 'watch'}`}>
                      {p.severity}
                    </span>
                  </span>
                  <span className="prow__metric">{p.metric}</span>
                  <span className="prow__bar">
                    <span
                      className="prow__fill"
                      style={{
                        width: `${p.progress}%`,
                        background: p.status === 'resolved' ? 'var(--sage)' : 'var(--teal)',
                      }}
                    />
                  </span>
                </span>
              </button>
            )
          })}
        </aside>

        {/* ---------- detail ---------- */}
        <div className="issues-detail" ref={detailRef}>
          {selected && (
            <div className="vcard pdetail">
              <div className="pdetail__head">
                <span className="pdetail__icon">{PROBLEM_ICON[selected.kind]}</span>
                <div className="pdetail__id">
                  <div className="issue__top">
                    <span className={`sev sev--${SEV_CLASS[selected.severity]}`}>
                      {selected.severity}
                    </span>
                    <span className={`sev sev--${selected.status === 'resolved' ? 'done' : selected.status === 'in-progress' ? 'progress' : 'open'}`}>
                      {STATUS_LABEL[selected.status]}
                    </span>
                  </div>
                  <h3 className="pdetail__title">{selected.title}</h3>
                  <span className="pdetail__metric">{selected.metric}</span>
                </div>
              </div>

              <div className="prog">
                <div className="prog__labels">
                  <span className="hint">Resolution progress</span>
                  <span className="prog__count">{selected.progress}%</span>
                </div>
                <div className="prog__track">
                  <div
                    className="prog__fill"
                    style={{ width: `${selected.progress}%`, backgroundColor: 'var(--teal)' }}
                  />
                </div>
              </div>

              <p className="pdetail__text">{selected.detail}</p>

              <div className="vsection" style={{ marginBottom: 0 }}>
                <span className="vsection__title--caps">Recent activity</span>
                <div className="timeline">
                  {selected.timeline.map((t, i) => {
                    const party = parties.find((p) => p.id === t.partyId)
                    return (
                      <div key={i} className="timeline__item">
                        <span
                          className="timeline__dot"
                          style={{ background: party?.color ?? 'var(--paper-3)' }}
                        />
                        <span className="timeline__text">{t.text}</span>
                        <span className="timeline__time">{t.time}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="vsection" style={{ marginTop: 20 }}>
            <div className="vsection__head">
              <span className="vsection__title--caps">
                Measures on this problem ({problemMeasures.length})
              </span>
              {measures.length > 0 && (
                <button className="btn btn--ghost btn--sm" onClick={() => openView('measures')}>
                  All measures
                </button>
              )}
            </div>

            {problemMeasures.length === 0 ? (
              <div className="empty">
                <span className="empty__icon">🗳️</span>
                <div className="stack-sm" style={{ gap: 4 }}>
                  <strong className="empty__title">No measure yet</strong>
                  <span className="hint">
                    Parties haven’t acted on this problem. As a deputy you can draft the first
                    measure in Party HQ.
                  </span>
                </div>
              </div>
            ) : (
              <div className="stack-sm">
                {problemMeasures.map((m) => (
                  <MeasureCard
                    key={m.id}
                    measure={m}
                    party={parties.find((p) => p.id === m.partyId)}
                    showBody={false}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="vsection" style={{ marginBottom: 0 }}>
            <div className="vcard issues-cta">
              <div className="stack-sm" style={{ gap: 4, maxWidth: '52ch' }}>
                <span className="eyebrow" style={{ color: '#2A7268' }}>
                  Party HQ
                </span>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>
                  Parties decide. You are a deputy.
                </strong>
                <span className="hint" style={{ color: '#3F6B48' }}>
                  Open your party desk to write a measure for this problem — the policy analyst
                  turns your text into a real city impact.
                </span>
              </div>
              <button className="btn btn--teal" onClick={() => selected && openPartyHq(selected.id)}>
                <Icon name="key" size={16} /> Raise a measure
              </button>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
