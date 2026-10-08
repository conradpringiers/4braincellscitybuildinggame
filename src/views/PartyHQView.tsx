import { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import { MeasureCard } from '../components/MeasureCard'
import { PROBLEM_ICON } from '../state/mockData'
import { analyzeMeasure, simulateInternalVote, type MeasureDraft } from '../state/measureAI'
import { stagger } from '../components/motion'
import type { IndicatorKey } from '../state/types'
import '../components/views.css'
import './PartyHQView.css'

const STAGES = [
  'Parsing the measure…',
  'Classifying impact areas…',
  'Estimating cost and effects…',
  'Cross-checking against the city model…',
]

const SUGGESTIONS = [
  'Build a tram line linking the suburbs to downtown',
  'Retrofit the east district with greywater recycling',
  'Cap rent in the old town and fund 400 new homes',
  'Mandate air filters across the works district',
  'Add a congestion charge in the downtown core',
]

interface QueueItem {
  id: string
  text: string
  draft: MeasureDraft
}

export default function PartyHQView() {
  const { state, closeSheet, openProblem, adoptMeasure, sendHqChat } = useGame()
  const party = state.parties.find((p) => p.id === state.hq.partyId) ?? state.parties[0]
  const hq = state.hq

  const [selectedId, setSelectedId] = useState<string>(
    state.activeProblemId ?? state.problems[0]?.id ?? '',
  )
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'preview' | 'done'>('idle')
  const [stage, setStage] = useState(0)
  const [draft, setDraft] = useState<MeasureDraft | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [draftText, setDraftText] = useState('')
  const [chatDraft, setChatDraft] = useState('')

  const timers = useRef<number[]>([])
  const msgsRef = useRef<HTMLDivElement>(null)
  const autoAdopt = useRef(false)

  const problem = state.problems.find((p) => p.id === selectedId) ?? null
  const problemMeasures = state.measures.filter((m) => m.problemId === selectedId)
  const adoption = state.lastAdoption

  useEffect(() => {
    if (state.activeProblemId) setSelectedId(state.activeProblemId)
  }, [state.activeProblemId])

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight })
  }, [hq.chat.length])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const partyColor = party.color

  const reset = () => {
    setPhase('idle')
    setDraft(null)
    setText('')
    setDraftText('')
  }

  const commit = (d: MeasureDraft, sourceText: string) => {
    if (!problem) return
    setDraft(d)
    setDraftText(sourceText)
    adoptMeasure({
      problemId: problem.id,
      title: d.title,
      body: sourceText.trim() || d.title,
      tags: d.tags,
      cost: d.cost,
      effects: d.effects,
      summary: d.summary,
      flags: d.flags,
      votes: simulateInternalVote(party.seats, d.effects),
    })
    setPhase('done')
  }

  const runAnalysis = (textArg?: string) => {
    const source = (textArg ?? text).trim()
    if (!source) return
    setText(source)
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setPhase('analyzing')
    setStage(0)
    const kept = source
    STAGES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStage(i), i * 620))
    })
    timers.current.push(
      window.setTimeout(() => {
        const result = analyzeMeasure(kept, problem)
        setDraft(result)
        setDraftText(kept)
        setPhase('preview')
        setQueue((q) => [
          { id: `q-${Date.now()}`, text: kept, draft: result },
          ...q,
        ].slice(0, 4))
        if (autoAdopt.current) commit(result, kept)
      }, STAGES.length * 620),
    )
  }

  // presenter shortcuts:
  //   /?hq=1&problem=traffic&draft=…&analyze=1          → show the analyst output
  //   /?hq=1&problem=traffic&draft=…&analyze=1&adopt=1  → apply it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const d = params.get('draft')
    if (!d) return
    setText(d)
    autoAdopt.current = Boolean(params.get('adopt'))
    if (params.get('analyze')) {
      const t = window.setTimeout(() => runAnalysis(d), 500)
      timers.current.push(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canAfford = draft ? draft.cost <= hq.treasury : true
  const confidence = draft ? Math.round(draft.confidence * 100) : 0

  const effectList = useMemo(() => {
    if (!draft) return [] as { key: IndicatorKey; value: number }[]
    return (Object.keys(draft.effects) as IndicatorKey[])
      .filter((k) => draft.effects[k] !== 0)
      .map((k) => ({ key: k, value: draft.effects[k]! }))
  }, [draft])

  const submitChat = () => {
    if (!chatDraft.trim()) return
    sendHqChat(chatDraft)
    setChatDraft('')
  }

  return (
    <Sheet
      eyebrow={`Party HQ · ${party.name}`}
      title="Deputy desk"
      subtitle="The room where decisions are drafted. Pick a problem, write the measure in your own words, and let the analyst turn it into real city impact."
      onClose={closeSheet}
      size="xl"
    >
      {/* ---------- hero ---------- */}
      <div className="hq-head" style={{ borderColor: partyColor }}>
        <span className="crest" style={{ background: party.colorSoft, color: party.accent }}>
          {party.mark}
        </span>
        <div className="hq-head__id">
          <strong className="hq-head__name">{party.name}</strong>
          <span className="hint">
            You are <b>Conrad</b> · {state.profile.rank}
          </span>
          <div className="hq-head__chips">
            {party.headOfGovernment && (
              <span className="chip chip--yellow">
                <Icon name="shield" size={12} /> Government
              </span>
            )}
            {hq.coalition.map((cid) => {
              const c = state.parties.find((p) => p.id === cid)
              return c ? (
                <span key={cid} className="chip" style={{ background: c.colorSoft, color: c.accent }}>
                  🤝 Coalition · {c.short}
                </span>
              ) : null
            })}
            <span className="chip chip--teal">
              <Icon name="clock" size={12} /> Election in {hq.electionIn}
            </span>
          </div>
        </div>
        <div className="hq-stats">
          <div className="hq-stat">
            <span className="hq-stat__label">
              <Icon name="coin" size={12} /> Treasury
            </span>
            <span className="hq-stat__num num">{hq.treasury.toLocaleString()}</span>
          </div>
          <div className="hq-stat">
            <span className="hq-stat__label">Approval</span>
            <span className="hq-stat__num num">{hq.approval}%</span>
            <span className="meter">
              <span className="meter__fill" style={{ width: `${hq.approval}%`, background: partyColor }} />
            </span>
          </div>
          <div className="hq-stat">
            <span className="hq-stat__label">
              <Icon name="users" size={12} /> Seats
            </span>
            <span className="hq-stat__num num">{party.seats}</span>
          </div>
        </div>
      </div>

      <div className="hq-grid">
        {/* ================= LEFT ================= */}
        <div className="hq-col stagger">
          <section className="hq-panel" style={stagger(0)}>
            <header className="hq-panel__head">
              <span className="vsection__title--caps">
                <Icon name="chat" size={13} /> Internal channel
              </span>
              <span className="live-dot">
                <span className="live-dot__dot" /> {party.mps.filter((m) => m.online).length} online
              </span>
            </header>
            <div className="chat hq-chat">
              <div className="chat__msgs" ref={msgsRef}>
                {hq.chat.map((m) => (
                  <div key={m.id} className={`chat__msg ${m.mine ? 'chat__msg--mine' : ''}`}>
                    <span className="chat__avatar" style={{ background: m.color }}>
                      {m.initials}
                    </span>
                    <div className="chat__content">
                      <span className="chat__author">
                        {m.author}
                        <span className="chat__time">{m.time}</span>
                      </span>
                      <span className="chat__bubble">{m.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="chat__compose">
                <input
                  className="chat__input"
                  placeholder="Message the party…"
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitChat()}
                  aria-label="Message the party"
                />
                <button className="chat__send" onClick={submitChat} disabled={!chatDraft.trim()} aria-label="Send">
                  <Icon name="send" size={18} />
                </button>
              </div>
            </div>
          </section>

          <section className="hq-panel" style={stagger(1)}>
            <header className="hq-panel__head">
              <span className="vsection__title--caps">
                <Icon name="clock" size={13} /> Today
              </span>
            </header>
            <div className="agenda">
              {hq.agenda.map((a, i) => (
                <div key={a.id} className="agenda__item" style={stagger(i)}>
                  <span className={`agenda__time agenda__time--${a.tone}`}>{a.time}</span>
                  <span className="agenda__text">{a.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="hq-panel" style={stagger(2)}>
            <header className="hq-panel__head">
              <span className="vsection__title--caps">
                <Icon name="users" size={13} /> Bench
              </span>
            </header>
            <div className="roster stagger">
              {party.mps.map((mp, i) => (
                <div key={mp.id} className="mp" style={stagger(i)}>
                  <span className="mp__avatar" style={{ background: partyColor }}>
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
          </section>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="hq-col">
          <section className="hq-panel" style={stagger(0)}>
            <header className="hq-panel__head">
              <span className="vsection__title--caps">
                <Icon name="alert" size={13} /> Problems on the table
              </span>
              <span className="hint">{state.problems.filter((p) => p.status !== 'resolved').length} open</span>
            </header>
            <div className="hq-problems stagger">
              {state.problems.map((p, i) => {
                const count = state.measures.filter((m) => m.problemId === p.id).length
                return (
                  <button
                    key={p.id}
                    className={`hq-problem ${p.id === selectedId ? 'is-active' : ''}`}
                    onClick={() => setSelectedId(p.id)}
                    style={{ ...stagger(i), ...(p.id === selectedId ? { borderColor: partyColor } : null) }}
                  >
                    <span className="hq-problem__icon">{PROBLEM_ICON[p.kind]}</span>
                    <span className="hq-problem__meta">
                      <span className="hq-problem__title">{p.title}</span>
                      <span className="hq-problem__sub">
                        {p.metric} · {count} measure{count === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span className="hq-problem__pct num">{p.progress}%</span>
                  </button>
                )
              })}
            </div>
          </section>

          {problem && (
            <section className="hq-panel">
              <header className="hq-panel__head">
                <span className="vsection__title--caps">
                  Measures already taken · {problem.title}
                </span>
              </header>
              {problemMeasures.length === 0 ? (
                <div className="empty">
                  <span className="empty__icon">📝</span>
                  <div className="stack-sm" style={{ gap: 4 }}>
                    <strong className="empty__title">Nothing yet on this problem</strong>
                    <span className="hint">Be the first to move a measure through the party.</span>
                  </div>
                </div>
              ) : (
                <div className="stack-sm">
                  {problemMeasures.map((m) => (
                    <MeasureCard
                      key={m.id}
                      measure={m}
                      party={state.parties.find((x) => x.id === m.partyId)}
                      showBody={false}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {problem && (
            <section className="hq-panel hq-panel--draft">
              <header className="hq-panel__head">
                <span className="vsection__title--caps">
                  <Icon name="hammer" size={13} /> Draft a new measure
                </span>
                <span className="analyst-badge">
                  <Icon name="brain" size={12} /> Policy analyst v0.4
                </span>
              </header>

              {phase === 'done' && adoption ? (
                <div className="hq-result">
                  <span className="hq-result__check">
                    <Icon name="check" size={26} />
                  </span>
                  <strong className="hq-result__title">Measure applied</strong>
                  <span className="hint">
                    {problem.title} moved to {state.problems.find((p) => p.id === problem.id)?.progress}%
                    {adoption.resolved ? ' — problem resolved.' : '.'}
                  </span>
                  <div className="hq-result__stats">
                    {adoption.deltas.map((d) => (
                      <div key={d.key} className="pstat">
                        <span className="pstat__icon">{d.icon}</span>
                        <span className="pstat__label">{d.label}</span>
                        <span className="pstat__values">
                          <span className="pstat__from num">{adoption.before[d.key]}</span>
                          <span className={`pstat__arrow ${d.delta > 0 ? 'is-up' : 'is-down'}`}>
                            {d.delta > 0 ? '▲' : '▼'}
                          </span>
                          <span className="pstat__to num">{adoption.after[d.key]}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="hq-result__actions">
                    <button className="btn btn--primary" onClick={reset}>
                      <Icon name="plus" size={15} /> Draft another
                    </button>
                    <button className="btn btn--ghost" onClick={() => openProblem(problem.id)}>
                      See the issue
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <textarea
                    className="hq-textarea"
                    rows={4}
                    placeholder="Write the measure in plain language, e.g. “Build a tram line linking the garden district to downtown, with trees along the corridor.”"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={phase === 'analyzing'}
                  />

                  <div className="hq-suggest">
                    <span className="hint">Ideas:</span>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        className="suggest"
                        onClick={() => setText(s)}
                        disabled={phase === 'analyzing'}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {phase === 'analyzing' ? (
                    <div className="ai-load">
                      <span className="ai-load__pulse">
                        <Icon name="brain" size={18} />
                      </span>
                      <div className="ai-load__steps">
                        {STAGES.map((s, i) => (
                          <div
                            key={s}
                            className={`ai-step ${i < stage ? 'is-done' : i === stage ? 'is-active' : ''}`}
                          >
                            <span className="ai-step__dot" />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : phase === 'preview' && draft ? (
                    <div className="ai-out">
                      <div className="ai-out__head">
                        <span className="analyst-badge">
                          <Icon name="sparkle" size={12} /> Analyst output
                        </span>
                        <span className="hint">confidence {confidence}%</span>
                      </div>
                      <div className="meter ai-out__conf">
                        <span
                          className="meter__fill"
                          style={{ width: `${confidence}%`, background: 'var(--teal)' }}
                        />
                      </div>

                      <div className="ai-out__title">{draft.title}</div>

                      <div className="impacts">
                        {draft.tags.map((t) => (
                          <span key={t} className="impact impact--neutral">
                            <span className="impact__value">{t}</span>
                          </span>
                        ))}
                        {effectList.map(({ key, value }) => (
                          <span key={key} className={`impact impact--${value > 0 ? 'good' : 'bad'}`}>
                            <span className="impact__label">{key}</span>
                            <span className="impact__value num">
                              {value > 0 ? '+' : ''}
                              {value}
                            </span>
                          </span>
                        ))}
                        <span className="impact impact--bad">
                          <span className="impact__label">
                            <Icon name="coin" size={12} /> Cost
                          </span>
                          <span className="impact__value num">{draft.cost}</span>
                        </span>
                      </div>

                      <p className="ai-out__summary">{draft.summary}</p>
                      {!canAfford && (
                        <span className="ai-out__warn">
                          ⚠ This exceeds your treasury by {(draft.cost - hq.treasury).toLocaleString()}.
                        </span>
                      )}

                      <div className="ai-out__actions">
                        <button className="btn btn--sage" onClick={() => draft && commit(draft, draftText || text)} disabled={!canAfford}>
                          <Icon name="check" size={15} /> Adopt measure
                        </button>
                        <button className="btn btn--ghost" onClick={() => setPhase('idle')}>
                          Edit text
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="hq-actions">
                      <button className="btn btn--teal" onClick={() => runAnalysis()} disabled={!text.trim()}>
                        <Icon name="brain" size={16} /> Analyze with analyst
                      </button>
                      <span className="hint">
                        The analyst converts your text into a structured measure with cost and impact.
                      </span>
                    </div>
                  )}
                </>
              )}

              {queue.length > 0 && phase !== 'done' && (
                <div className="hq-queue">
                  <span className="vsection__title--caps">Recent drafts</span>
                  <div className="hq-queue__list">
                    {queue.map((q) => (
                      <button
                        key={q.id}
                        className="queue-item"
                        onClick={() => {
                          setText(q.text)
                          setDraftText(q.text)
                          setDraft(q.draft)
                          setPhase('preview')
                        }}
                      >
                        <span className="queue-item__title">{q.draft.title}</span>
                        <span className="queue-item__meta">{q.draft.tags.join(' · ')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {draftText && phase === 'preview' && (
                <p className="hq-src">
                  <Icon name="scroll" size={12} /> From your text: “{draftText}”
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </Sheet>
  )
}
