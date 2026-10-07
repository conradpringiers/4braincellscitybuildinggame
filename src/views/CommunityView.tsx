import { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext'
import Sheet from '../components/Sheet'
import { Icon } from '../components/Icon'
import type { ChatTab } from '../state/types'
import '../components/views.css'
import './CommunityView.css'

const TABS: ChatTab[] = ['GLOBAL', 'PARTY', 'DISTRICT', 'INITIATIVE']

export default function CommunityView() {
  const { state, closeSheet, setChatTab, sendChat, openProblem, openInitiative } = useGame()
  const [draft, setDraft] = useState('')
  const msgsRef = useRef<HTMLDivElement>(null)

  const messages = state.chat[state.activeChatTab]

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight })
  }, [messages.length, state.activeChatTab])

  const submit = () => {
    if (!draft.trim()) return
    sendChat(draft)
    setDraft('')
  }

  return (
    <Sheet
      eyebrow="Community"
      title="The city is talking"
      subtitle="A living feed of what's happening in Civitas, and a place for citizens to debate."
      onClose={closeSheet}
      size="xl"
    >
      <div className="community">
        {/* ---------- city feed ---------- */}
        <section className="community__feed">
          <div className="vsection__head">
            <span className="vsection__title--caps">City feed</span>
            <span className="live-dot">
              <span className="live-dot__dot" /> live
            </span>
          </div>

          <div className="feed">
            {state.feed.map((f) => (
              <div key={f.id} className="feed__item">
                <span className={`feed__icon feed__icon--${f.tone}`}>{f.icon}</span>
                <span className="feed__text">{f.text}</span>
                <span className="feed__time">{f.time}</span>
              </div>
            ))}
          </div>

          <div className="vsection" style={{ marginTop: 18, marginBottom: 0 }}>
            <span className="vsection__title--caps">Needs your attention</span>
            <div className="stack-sm">
              {state.problems
                .filter((p) => !p.resolved)
                .slice(0, 3)
                .map((p) => (
                  <button key={p.id} className="attention" onClick={() => openProblem(p.id)}>
                    <span className={`sev sev--${p.severity}`}>{p.severity}</span>
                    <span className="attention__title">{p.title}</span>
                    <span className="attention__metric">{p.metric}</span>
                    <Icon name="chevron" size={16} />
                  </button>
                ))}
              {state.initiatives
                .filter((i) => i.status === 'open')
                .slice(0, 1)
                .map((i) => (
                  <button key={i.id} className="attention" onClick={() => openInitiative(i.id)}>
                    <span className="sev sev--watch">vote</span>
                    <span className="attention__title">{i.question}</span>
                    <span className="attention__metric">closes in {i.closesIn}</span>
                    <Icon name="chevron" size={16} />
                  </button>
                ))}
            </div>
          </div>
        </section>

        {/* ---------- chat ---------- */}
        <section className="community__chat vcard">
          <div className="chat">
            <div className="chat__tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`chat__tab ${state.activeChatTab === t ? 'is-active' : ''}`}
                  onClick={() => setChatTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="chat__msgs" ref={msgsRef}>
              {messages.map((m) => (
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
                placeholder={`Message ${state.activeChatTab.toLowerCase()}…`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                aria-label="Message"
              />
              <button className="chat__send" onClick={submit} disabled={!draft.trim()} aria-label="Send">
                <Icon name="send" size={19} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </Sheet>
  )
}
