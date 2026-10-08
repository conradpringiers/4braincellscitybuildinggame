import type { CSSProperties } from 'react'
import { INDICATOR_META } from '../state/mockData'
import type { CityProblem, IndicatorKey, Measure, Party } from '../state/types'
import { Icon } from './Icon'

interface Props {
  measure: Measure
  party?: Party
  problem?: CityProblem | null
  onOpenProblem?: (id: string) => void
  showBody?: boolean
  /** position in a staggered list */
  index?: number
}

export function MeasureCard({ measure, party, problem, onOpenProblem, showBody = true, index }: Props) {
  const effects = (Object.keys(measure.effects) as IndicatorKey[]).filter(
    (k) => measure.effects[k] !== 0,
  )

  return (
    <article
      className="measure"
      style={{ borderLeftColor: party?.color ?? 'var(--ink)', '--i': index ?? 0 } as CSSProperties}
    >
      <div className="measure__head">
        <span className="crest crest--sm" style={{ background: party?.colorSoft, color: party?.accent }}>
          {party?.mark ?? '⚖️'}
        </span>
        <span className="measure__title">{measure.title}</span>
        <span className={`sev sev--${measure.status === 'applied' ? 'done' : measure.status === 'adopted' ? 'progress' : 'open'}`}>
          {measure.status}
        </span>
      </div>

      {showBody && <p className="measure__body">{measure.body}</p>}

      <div className="impacts">
        {measure.tags.map((t) => (
          <span key={t} className="impact impact--neutral">
            <span className="impact__value">{t}</span>
          </span>
        ))}
        {effects.map((k) => {
          const meta = INDICATOR_META.find((m) => m.key === k)!
          const v = measure.effects[k]!
          return (
            <span key={k} className={`impact impact--${v > 0 ? 'good' : 'bad'}`}>
              <span className="impact__label">
                {meta.icon} {meta.label}
              </span>
              <span className="impact__value num">
                {v > 0 ? '+' : ''}
                {v}
              </span>
            </span>
          )
        })}
        <span className="impact impact--bad">
          <span className="impact__label">
            <Icon name="coin" size={12} /> Cost
          </span>
          <span className="impact__value num">{measure.cost}</span>
        </span>
      </div>

      <div className="measure__foot">
        <span className="measure__sponsor">
          <span className="measure__dot" style={{ background: party?.color }} />
          {party?.name ?? 'Unknown'}
        </span>
        {problem && (
          <button className="measure__problem" onClick={() => onOpenProblem?.(problem.id)}>
            {problem.title}
          </button>
        )}
        <span className="measure__votes">
          vote {measure.votes.for}–{measure.votes.against}
        </span>
        <span>{measure.createdAt}</span>
      </div>
    </article>
  )
}
