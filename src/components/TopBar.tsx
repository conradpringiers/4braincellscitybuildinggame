import { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext'
import { INDICATOR_META } from '../state/mockData'
import { useCountUp } from '../hooks/useCountUp'
import { Icon } from './Icon'
import './TopBar.css'

/** Shows a value and, briefly, the delta when it changes. */
function IndicatorStat({
  icon,
  label,
  tone,
  value,
}: {
  icon: string
  label: string
  tone: string
  value: number
}) {
  const prev = useRef(value)
  const [delta, setDelta] = useState<number | null>(null)
  const shown = useCountUp(value, 750)

  useEffect(() => {
    if (prev.current === value) return
    const d = value - prev.current
    prev.current = value
    setDelta(d)
    const t = setTimeout(() => setDelta(null), 3200)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className={`stat stat--${tone}`}>
      <span className="stat__icon" aria-hidden>
        {icon}
      </span>
      <span className="stat__meta">
        <span className="stat__label">{label}</span>
        <span className="stat__value num">{Math.round(shown)}</span>
      </span>
      {delta !== null && (
        <span className={`stat__delta ${delta > 0 ? 'is-up' : 'is-down'}`} key={`${label}-${value}`}>
          {delta > 0 ? '+' : ''}
          {delta}
        </span>
      )}
    </div>
  )
}

export default function TopBar() {
  const { state, openView, addCitizens } = useGame()
  const population = useCountUp(state.stats.population, 1100)
  const [bump, setBump] = useState(false)

  const handleAdd = () => {
    addCitizens(50)
    setBump(true)
    setTimeout(() => setBump(false), 700)
  }

  return (
    <header className="topbar">
      <div className="topbar__brand paper-glass">
        <button className="brand" onClick={() => openView('city')} aria-label="Go to city">
          <span className="brand__mark" aria-hidden>
            <Icon name="leaf" size={18} filled />
          </span>
          <span className="brand__text">
            <span className="brand__word display">Urbloom</span>
            <span className="brand__sub">City of Civitas</span>
          </span>
        </button>

        <span className="topbar__rule" />

        <div className={`pop ${bump ? 'is-bump' : ''}`}>
          <span className="pop__num num">{Math.round(population).toLocaleString()}</span>
          <span className="pop__label">citizens</span>
          <button className="pop__add" onClick={handleAdd} title="Demo: 50 new citizens join">
            <Icon name="plus" size={14} />
            <span>Add citizens</span>
          </button>
        </div>
      </div>

      <div className="topbar__indicators paper-glass">
        {INDICATOR_META.map((m) => (
          <IndicatorStat key={m.key} icon={m.icon} label={m.label} tone={m.tone} value={state.indicators[m.key]} />
        ))}
      </div>
    </header>
  )
}
