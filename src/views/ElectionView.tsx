import { useState } from 'react'
import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import '../components/views.css'
import './ElectionView.css'

const TOTAL_SEATS = 12

/** Build a hemicycle seating chart from the parties' seat counts. */
function seatPositions(parties: { id: string; color: string; seats: number }[]) {
  const seats: { x: number; y: number; color: string }[] = []
  const seatsFlat: string[] = []
  parties.forEach((p) => {
    for (let i = 0; i < p.seats; i++) seatsFlat.push(p.color)
  })

  const cx = 210
  const cy = 168
  const rows = [
    { r: 148, count: 5, start: 175, end: 5 },
    { r: 112, count: 4, start: 175, end: 5 },
    { r: 76, count: 3, start: 175, end: 5 },
  ]
  let idx = 0
  rows.forEach((row) => {
    for (let i = 0; i < row.count && idx < seatsFlat.length; i++) {
      const t = row.count === 1 ? 0.5 : i / (row.count - 1)
      const a = ((row.start + (row.end - row.start) * t) * Math.PI) / 180
      seats.push({
        x: cx + Math.cos(a) * row.r,
        y: cy - Math.sin(a) * row.r,
        color: seatsFlat[idx],
      })
      idx++
    }
  })
  return seats
}

export default function ElectionView() {
  const { parties, closeSheet, openParty } = useGame()
  const [voted, setVoted] = useState(false)
  const totalPop = parties.reduce((a, p) => a + p.popularity, 0)
  const seats = seatPositions(parties)

  return (
    <Sheet
      eyebrow="City Council · Term 2027"
      title="CITY ELECTION"
      subtitle="Citizens of Civitas have chosen their council. Twelve seats decide the city's direction."
      onClose={closeSheet}
      size="lg"
      footer={
        <>
          <span className="hint">
            {voted ? 'Your ballot is recorded. Thank you for voting.' : 'Polls close in 3h 12m.'}
          </span>
          <button
            className={`btn ${voted ? '' : 'btn--primary'}`}
            onClick={() => setVoted(true)}
            disabled={voted}
          >
            {voted ? (
              <>
                <Icon name="check" size={16} /> You voted
              </>
            ) : (
              <>
                <Icon name="ballot" size={17} /> Cast your ballot
              </>
            )}
          </button>
        </>
      }
    >
      <div className="election">
        <div className="election__chart vcard">
          <span className="vsection__title--caps">Council composition</span>
          <svg viewBox="0 0 420 210" className="hemicycle" role="img" aria-label="Council seating chart">
            <line x1={30} y1={202} x2={390} y2={202} stroke="rgba(60,52,40,0.12)" strokeWidth={2} />
            <text x={210} y={195} textAnchor="middle" fontSize={11} fontWeight={700} letterSpacing="0.18em" fill="#8b8f98">
              MAYOR'S DESK
            </text>
            {seats.map((s, i) => (
              <g key={i} className="seat" style={{ animationDelay: `${i * 45}ms` }}>
                <circle cx={s.x} cy={s.y + 1.5} r={13} fill="rgba(60,52,40,0.12)" />
                <circle cx={s.x} cy={s.y} r={13} fill={s.color} />
                <circle cx={s.x} cy={s.y} r={13} fill="none" stroke="#fffdf8" strokeWidth={2} />
              </g>
            ))}
          </svg>
          <div className="election__turnout">
            <span className="election__turnout-num num">71%</span>
            <span className="hint">turnout · 1,762 of 2,481 citizens voted</span>
          </div>
        </div>

        <div className="election__results">
          <span className="vsection__title--caps">Result</span>
          {parties.map((p, i) => (
            <button key={p.id} className="result" onClick={() => openParty(p.id)}>
              <span className="crest crest--sm" style={{ background: p.colorSoft, color: p.accent }}>
                {p.mark}
              </span>
              <span className="result__body">
                <span className="result__top">
                  <span className="result__name">
                    {p.name}
                    {p.headOfGovernment && <span className="result__gov">Head of Gov.</span>}
                  </span>
                  <span className="result__pct num">{p.popularity}%</span>
                </span>
                <span className="result__bar">
                  <span
                    className="result__fill"
                    style={{
                      width: `${(p.popularity / totalPop) * 100}%`,
                      background: p.color,
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                </span>
                <span className="result__seats">
                  {p.seats} {p.seats === 1 ? 'seat' : 'seats'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="vsection" style={{ marginTop: 22, marginBottom: 0 }}>
        <div className="seat-legend">
          {parties.map((p) => (
            <span key={p.id} className="seat-legend__item">
              <span className="seat-legend__dot" style={{ background: p.color }} />
              {p.name}
              <strong className="num"> {p.seats}</strong>
            </span>
          ))}
          <span className="seat-legend__item seat-legend__item--total">
            City Council<strong className="num"> {TOTAL_SEATS} seats</strong>
          </span>
        </div>
      </div>
    </Sheet>
  )
}
