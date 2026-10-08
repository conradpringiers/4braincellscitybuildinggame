import { useMemo, useState } from 'react'
import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import { MeasureCard } from '../components/MeasureCard'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { stagger } from '../components/motion'
import type { MeasureStatus } from '../state/types'
import '../components/views.css'
import './MeasuresView.css'

type StatusFilter = 'all' | MeasureStatus

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: 'All statuses',
  applied: 'Applied',
  adopted: 'Adopted',
  rejected: 'Rejected',
}

export default function MeasuresView() {
  const { state, closeSheet, openProblem, openPartyHq } = useGame()
  const { measures, parties, problems } = state

  const [status, setStatus] = useState<StatusFilter>('all')
  const [partyId, setPartyId] = useState<string>('all')

  const filtered = useMemo(
    () =>
      measures.filter(
        (m) => (status === 'all' || m.status === status) && (partyId === 'all' || m.partyId === partyId),
      ),
    [measures, status, partyId],
  )

  const invested = measures.reduce((a, m) => a + m.cost, 0)
  const resolved = problems.filter((p) => p.status === 'resolved').length
  const openProblems = problems.filter((p) => p.status !== 'resolved')

  return (
    <Sheet
      eyebrow="Measures"
      title="What the parties have done"
      subtitle="Every decision taken in Civitas, who carried it, and what it changed. Parties govern — citizens watch and vote at the next election."
      onClose={closeSheet}
      size="xl"
      footer={
        <>
          <span className="hint">
            {filtered.length} of {measures.length} measures shown
          </span>
          <button className="btn btn--teal" onClick={() => openPartyHq(openProblems[0]?.id)}>
            <Icon name="key" size={16} /> Party HQ
          </button>
        </>
      }
    >
      <div className="mstats stagger">
        <div className="mstat" style={stagger(0)}>
          <span className="mstat__num num">
            <AnimatedNumber value={measures.length} duration={500} />
          </span>
          <span className="mstat__label">Measures adopted</span>
        </div>
        <div className="mstat" style={stagger(1)}>
          <span className="mstat__num num">
            <AnimatedNumber value={invested} duration={800} />
          </span>
          <span className="mstat__label">Civic budget committed</span>
        </div>
        <div className="mstat" style={stagger(2)}>
          <span className="mstat__num num">
            <AnimatedNumber value={resolved} duration={500} />
          </span>
          <span className="mstat__label">Problems resolved</span>
        </div>
        <div className="mstat" style={stagger(3)}>
          <span className="mstat__num num">
            <AnimatedNumber value={openProblems.length} duration={500} />
          </span>
          <span className="mstat__label">Still open</span>
        </div>
      </div>

      <div className="vsection">
        <div className="vsection__head">
          <span className="vsection__title--caps">Filter</span>
        </div>
        <div className="filters">
          {(['all', 'applied', 'adopted'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              className={`filter ${status === s ? 'is-active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <div className="filters">
          <button
            className={`filter ${partyId === 'all' ? 'is-active' : ''}`}
            onClick={() => setPartyId('all')}
          >
            All parties
          </button>
          {parties.map((p) => (
            <button
              key={p.id}
              className={`filter ${partyId === p.id ? 'is-active' : ''}`}
              onClick={() => setPartyId(p.id)}
              style={partyId === p.id ? { background: p.color, borderColor: 'var(--ink)' } : undefined}
            >
              {p.mark} {p.short}
            </button>
          ))}
        </div>
      </div>

      <div className="vsection" style={{ marginBottom: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">📭</span>
            <div className="stack-sm" style={{ gap: 4 }}>
              <strong className="empty__title">No measure matches</strong>
              <span className="hint">Try another filter, or open Party HQ to draft a new one.</span>
            </div>
          </div>
        ) : (
          <div className="grid-2 stagger">
            {filtered.map((m, i) => (
              <MeasureCard
                key={m.id}
                index={i}
                measure={m}
                party={parties.find((p) => p.id === m.partyId)}
                problem={problems.find((p) => p.id === m.problemId)}
                onOpenProblem={openProblem}
              />
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}
