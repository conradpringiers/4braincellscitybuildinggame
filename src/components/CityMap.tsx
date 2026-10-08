/* ============================================================
   CityMap — the hero of Urbloom.

   The city ARTWORK is a single image:
   ┌──────────────────────────────────────────────────────────┐
   │  CITY_MAP_PLACEHOLDER                                    │
   │  Replace  public/city-map.png  with your own 1600 × 1000 │
   │  render (the placeholder PNG ships with zone guides).    │
   │                                                          │
   │  Everything below the <image> is the INTERACTIVE overlay │
   │  layer — problem markers, congestion, the tram line and  │
   │  unlock zones — in the same 1600 × 1000 coordinate space.│
   └──────────────────────────────────────────────────────────┘

   Pan & zoom: the whole SVG is transformed, so markers stay
   glued to their spot on the artwork. Marker labels are
   counter-scaled so they remain readable at any zoom level.
   ============================================================ */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useGame } from '../state/GameContext'
import type { CityProblem } from '../state/types'
import './CityMap.css'

const VB_W = 1600
const VB_H = 1000

const MIN_SCALE = 1
const MAX_SCALE = 2.4
const DRAG_THRESHOLD = 5

interface View {
  scale: number
  x: number
  y: number
}

const DEFAULT_VIEW: View = { scale: 1, x: 0, y: 0 }

/** keep the artwork covering its frame — never show a gap */
function clampView(v: View, w: number, h: number): View {
  const minX = w - w * v.scale
  const minY = h - h * v.scale
  return {
    scale: v.scale,
    x: Math.min(0, Math.max(minX, v.x)),
    y: Math.min(0, Math.max(minY, v.y)),
  }
}

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

/* ------------------------------------------------------------
   Problem pin
   ------------------------------------------------------------ */

const SEVERITY: Record<CityProblem['severity'], { fill: string; label: string }> = {
  critical: { fill: '#DA7A93', label: '#B24A66' },
  warning: { fill: '#DC8A4C', label: '#A9622B' },
  watch: { fill: '#3AA091', label: '#2A7268' },
}

const PROBLEM_ICON: Record<CityProblem['kind'], string> = {
  traffic: '🚗',
  water: '💧',
  housing: '🏠',
  energy: '⚡',
  waste: '🗑️',
  pollution: '🌫️',
  health: '🏥',
}

function ProblemPin({
  problem,
  onOpen,
  zoom,
}: {
  problem: CityProblem
  onOpen: (id: string) => void
  zoom: number
}) {
  const { title, metric } = problem
  const cardW = Math.max(title.length * 9 + 26, metric.length * 7 + 26, 150)
  const cardH = 56
  const cardX = -(cardW / 2)
  const cardY = -cardH - 20
  const sev = SEVERITY[problem.severity]
  const inverse = 1 / zoom

  const inner = problem.status === 'resolved' ? (
    <>
      <rect x={-13} y={-11} width={26} height={26} rx={4} fill="#FFFDF6" stroke="#2B2740" strokeWidth={2.5} />
      <rect x={-10} y={-8} width={20} height={20} rx={2} fill="#56A867" />
      <path
        d="M -4.5 0 L -1.2 3.6 L 5 -3.6"
        fill="none"
        stroke="#FFFDF6"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ) : (
    <>
      <rect className="pin__pulse" x={-14} y={-12} width={28} height={28} rx={6} fill={sev.fill} opacity={0.4} />
      <rect
        className="pin__pulse pin__pulse--2"
        x={-14}
        y={-12}
        width={28}
        height={28}
        rx={6}
        fill={sev.fill}
        opacity={0.28}
      />
      <line x1={0} y1={-6} x2={0} y2={-18} stroke={sev.label} strokeWidth={2.5} opacity={0.55} />
      <rect x={-13} y={-11} width={26} height={26} rx={4} fill="#FFFDF6" stroke="#2B2740" strokeWidth={2.5} />
      <rect x={-10} y={-8} width={20} height={20} rx={2} fill={sev.fill} />
      <text y={5} textAnchor="middle" fontSize={13} className="pin__icon">
        {PROBLEM_ICON[problem.kind]}
      </text>

      <g className="pin__card">
        <rect x={cardX + 3} y={cardY + 3} width={cardW} height={cardH} rx={5} fill="#2B2740" opacity={0.22} />
        <rect
          x={cardX}
          y={cardY}
          width={cardW}
          height={cardH}
          rx={5}
          fill="#FFFDF6"
          stroke="#2B2740"
          strokeWidth={2.5}
        />
        <rect x={cardX} y={cardY} width={7} height={cardH} rx={2} fill={sev.fill} />
        <text
          className="pin__title"
          x={cardX + 18}
          y={cardY + 24}
          fontSize={13.5}
          fill={sev.label}
          letterSpacing="0.06em"
        >
          {title}
        </text>
        <text className="pin__metric" x={cardX + 18} y={cardY + 43} fontSize={12} fill="#8B83A3">
          {metric}
        </text>
      </g>
    </>
  )

  const isResolved = problem.status === 'resolved'
  const className = isResolved ? 'pin pin--resolved' : 'pin pin--problem'

  return (
    <g
      className={className}
      transform={`translate(${problem.x} ${problem.y})`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(problem.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(problem.id)
      }}
    >
      {/* counter-scale so labels keep a constant size while zooming */}
      <g transform={`scale(${inverse})`}>{inner}</g>
    </g>
  )
}

/* ------------------------------------------------------------
   The map
   ------------------------------------------------------------ */

export default function CityMap() {
  const { state, openProblem } = useGame()
  const { problems, stats, arrivalPulse } = state
  const trafficOpen = problems.some((p) => p.kind === 'traffic' && p.status !== 'resolved')

  const containerRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>(DEFAULT_VIEW)
  const [smooth, setSmooth] = useState(false)
  const [dragging, setDragging] = useState(false)

  const smoothTimer = useRef(0)
  const drag = useRef({
    active: false,
    moved: false,
    captured: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    tx: 0,
    ty: 0,
  })

  const pulseSmooth = useCallback(() => {
    setSmooth(true)
    window.clearTimeout(smoothTimer.current)
    smoothTimer.current = window.setTimeout(() => setSmooth(false), 190)
  }, [])

  useEffect(() => () => window.clearTimeout(smoothTimer.current), [])

  const panEnabled = () =>
    typeof window !== 'undefined' && window.innerWidth > 720 && window.matchMedia('(pointer: fine)').matches

  /* ---------- wheel / trackpad zoom, anchored on the cursor ---------- */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth <= 720) return
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const intensity = e.ctrlKey ? 0.01 : 0.0016
      const factor = Math.exp(-e.deltaY * intensity)
      setView((v) => {
        const scale = clampScale(v.scale * factor)
        const cx = (px - v.x) / v.scale
        const cy = (py - v.y) / v.scale
        return clampView({ scale, x: px - cx * scale, y: py - cy * scale }, rect.width, rect.height)
      })
      pulseSmooth()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [pulseSmooth])

  /* ---------- keep the clamp valid on resize ---------- */
  useEffect(() => {
    const onResize = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setView((v) => (v.scale === 1 ? v : clampView(v, rect.width, rect.height)))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ---------- drag to pan ---------- */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!panEnabled()) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = {
      active: true,
      moved: false,
      captured: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      tx: view.x,
      ty: view.y,
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (!d.moved) {
      if (Math.hypot(dx, dy) <= DRAG_THRESHOLD) return
      // only capture once a real drag starts, so plain clicks still hit the pins
      d.moved = true
      d.captured = true
      setDragging(true)
      try {
        containerRef.current?.setPointerCapture(e.pointerId)
      } catch {
        d.captured = false
      }
    }

    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setView((v) => clampView({ ...v, x: d.tx + dx, y: d.ty + dy }, rect.width, rect.height))
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.active) return
    if (d.captured) {
      try {
        containerRef.current?.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
    d.active = false
    d.captured = false
    setDragging(false)
    // let the click event pass through first, then forget the drag
    window.setTimeout(() => {
      drag.current.moved = false
    }, 80)
  }

  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  /* ---------- controls ---------- */
  const zoomTo = (factor: number, px?: number, py?: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ax = px ?? rect.width / 2
    const ay = py ?? rect.height / 2
    setView((v) => {
      const scale = clampScale(v.scale * factor)
      const cx = (ax - v.x) / v.scale
      const cy = (ay - v.y) / v.scale
      return clampView({ scale, x: ax - cx * scale, y: ay - cy * scale }, rect.width, rect.height)
    })
    pulseSmooth()
  }

  const resetView = () => {
    setView(DEFAULT_VIEW)
    pulseSmooth()
  }

  const isDefault = view.scale === 1 && view.x === 0 && view.y === 0
  const svgStyle: CSSProperties = {
    transformOrigin: '0 0',
    transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
    transition: smooth && !dragging ? 'transform 190ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
  }

  const tagStyle = (x: number, y: number, inv: number) =>
    `translate(${x} ${y}) scale(${inv})`

  const inv = 1 / view.scale

  return (
    <div
      className={`citymap ${view.scale > 1 ? 'is-zoomed' : ''} ${dragging ? 'is-dragging' : ''}`}
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={resetView}
      onClickCapture={onClickCapture}
    >
      <svg
        className="citymap__svg"
        style={svgStyle}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-label="Aerial view of the city of Civitas"
      >
        <defs>
          <radialGradient id="congest" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DA7A93" stopOpacity={0.4} />
            <stop offset="70%" stopColor="#DA7A93" stopOpacity={0.13} />
            <stop offset="100%" stopColor="#DA7A93" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#56A867" stopOpacity={0.42} />
            <stop offset="100%" stopColor="#56A867" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6C90E0" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#6C90E0" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* fallback shown only if the artwork is missing */}
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="#F7F1E6" />
        <text
          x={VB_W / 2}
          y={VB_H / 2}
          textAnchor="middle"
          className="citymap__fallback"
          fill="#BCB4CB"
          fontSize={26}
          letterSpacing="0.2em"
        >
          CITY MAP PLACEHOLDER — add public/city-map.png
        </text>

        {/* ---------- the artwork layer ---------- */}
        <image
          href="/city-map.png"
          x={0}
          y={0}
          width={VB_W}
          height={VB_H}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* ---------- congestion heat zone ---------- */}
        {trafficOpen && (
          <g className="overlay-congestion">
            <circle cx={790} cy={430} r={230} fill="url(#congest)" />
          </g>
        )}

        {/* ---------- tram line (after the tram measure passes) ---------- */}
        {stats.tramBuilt && (
          <g className="overlay-tram">
            <circle cx={700} cy={520} r={260} fill="url(#glowGreen)" opacity={0.35} />
            <path
              d="M 470 760 C 560 700 600 640 700 600 C 820 552 900 470 940 380 C 980 300 1030 250 1120 210"
              fill="none"
              stroke="#2B2740"
              strokeWidth={11}
              strokeLinecap="round"
              opacity={0.35}
            />
            <path
              d="M 470 760 C 560 700 600 640 700 600 C 820 552 900 470 940 380 C 980 300 1030 250 1120 210"
              fill="none"
              stroke="#3AA091"
              strokeWidth={7}
              strokeLinecap="round"
            />
            <path
              d="M 470 760 C 560 700 600 640 700 600 C 820 552 900 470 940 380 C 980 300 1030 250 1120 210"
              fill="none"
              stroke="#FFFDF6"
              strokeWidth={2}
              strokeDasharray="10 10"
              strokeLinecap="round"
            />
            {[
              [470, 760],
              [640, 620],
              [790, 540],
              [900, 430],
              [970, 330],
              [1120, 210],
            ].map(([sx, sy], i) => (
              <g key={i} transform={`translate(${sx} ${sy}) scale(${inv})`}>
                <rect x={-8} y={-8} width={16} height={16} rx={3} fill="#FFFDF6" stroke="#2B2740" strokeWidth={2.5} />
                <rect x={-4} y={-4} width={8} height={8} rx={1} fill="#3AA091" />
              </g>
            ))}
            <g className="tram__car">
              <rect x={-15} y={-8} width={30} height={16} rx={4} fill="#2B2740" />
              <rect x={-12} y={-5.5} width={24} height={11} rx={2} fill="#7ED3C6" />
            </g>
            <g className="overlay-tag" transform={tagStyle(1120, 210, inv)}>
              <rect x={-64} y={-34} width={128} height={24} rx={4} fill="#2B2740" opacity={0.22} transform="translate(3 3)" />
              <rect x={-64} y={-34} width={128} height={24} rx={4} fill="#FFFDF6" stroke="#2B2740" strokeWidth={2} />
              <text className="pin__title" x={0} y={-17} textAnchor="middle" fontSize={11.5} fill="#2A7268" letterSpacing="0.08em">
                TRAM LINE
              </text>
            </g>
          </g>
        )}

        {/* ---------- unlocked community park ---------- */}
        {stats.parkUnlocked && (
          <g className="overlay-unlock">
            <circle cx={572} cy={858} r={170} fill="url(#glowGreen)" />
            <rect
              x={468}
              y={790}
              width={210}
              height={138}
              rx={16}
              fill="#9ED9A6"
              fillOpacity={0.5}
              stroke="#56A867"
              strokeWidth={3}
              strokeDasharray="12 8"
            />
            <g className="overlay-tag" transform={tagStyle(573, 858, inv)}>
              <rect x={-84} y={-34} width={168} height={26} rx={4} fill="#2B2740" opacity={0.22} transform="translate(3 3)" />
              <rect x={-84} y={-34} width={168} height={26} rx={4} fill="#FFFDF6" stroke="#2B2740" strokeWidth={2} />
              <text className="pin__title" x={0} y={-16} textAnchor="middle" fontSize={11.5} fill="#2A7268" letterSpacing="0.06em">
                🌳 COMMUNITY PARK
              </text>
            </g>
          </g>
        )}

        {/* ---------- new growth (Add citizens) ---------- */}
        {arrivalPulse > 0 && (
          <g key={arrivalPulse} className="overlay-growth">
            <circle cx={235} cy={660} r={130} fill="url(#glowBlue)" />
            <rect
              x={150}
              y={580}
              width={180}
              height={160}
              rx={16}
              fill="#A9C3F2"
              fillOpacity={0.4}
              stroke="#6C90E0"
              strokeWidth={3}
              strokeDasharray="12 8"
            />
            <g className="overlay-tag" transform={tagStyle(240, 668, inv)}>
              <rect x={-92} y={-34} width={184} height={26} rx={4} fill="#2B2740" opacity={0.22} transform="translate(3 3)" />
              <rect x={-92} y={-34} width={184} height={26} rx={4} fill="#FFFDF6" stroke="#2B2740" strokeWidth={2} />
              <text className="pin__title" x={0} y={-16} textAnchor="middle" fontSize={11.5} fill="#4A63B0" letterSpacing="0.06em">
                🏘️ NEW NEIGHBOURHOOD
              </text>
            </g>
          </g>
        )}

        {/* ---------- problem pins ---------- */}
        <g>
          {problems.map((p) => (
            <ProblemPin key={p.id} problem={p} onOpen={openProblem} zoom={view.scale} />
          ))}
        </g>
      </svg>

      <div className="citymap__vignette" />

      {/* ---------- zoom controls ---------- */}
      <div className="zoomctl" aria-label="Map zoom">
        <button className="zoomctl__btn" onClick={() => zoomTo(1.3)} aria-label="Zoom in" title="Zoom in">
          +
        </button>
        <button className="zoomctl__btn" onClick={() => zoomTo(1 / 1.3)} aria-label="Zoom out" title="Zoom out">
          −
        </button>
        <button
          className="zoomctl__btn zoomctl__btn--reset"
          onClick={resetView}
          disabled={isDefault}
          aria-label="Reset view"
          title="Reset view (double-click the map)"
        >
          ⤾
        </button>
      </div>

      {!isDefault && (
        <div className="citymap__zoomread" aria-hidden>
          {view.scale.toFixed(1)}×
        </div>
      )}
    </div>
  )
}
