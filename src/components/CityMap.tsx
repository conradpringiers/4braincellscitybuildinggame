/* ============================================================
   CityMap — the hero of Urbloom.
   A hand-composed, top-down pastel "paper diorama" of the city
   of Civitas, drawn as inline SVG.

   ┌──────────────────────────────────────────────────────────┐
   │  CITY_MAP_PLACEHOLDER                                    │
   │  This SVG is a deliberately self-contained illustration. │
   │  It can be swapped for a generated image later by        │
   │  replacing <CityArt/> while keeping the overlay layers   │
   │  (pins, congestion, tram, growth) in the same 1600×1000  │
   │  coordinate space.                                       │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

import { useMemo } from 'react'
import { useGame } from '../state/GameContext'
import type { CityProblem } from '../state/types'
import './CityMap.css'

const VB_W = 1600
const VB_H = 1000

/* Palette mirrored from CSS tokens so the SVG is self-contained. */
const C = {
  sand: '#efe6d3',
  grass: '#e0ead4',
  grassDeep: '#cfe0bf',
  grassLight: '#e9f0de',
  road: '#dcd5c7',
  roadDark: '#ccc4b2',
  roadLine: '#fbf8f0',
  water: '#bfdbe8',
  waterDeep: '#a7cadb',
  waterLine: '#d7ebf3',
  sage: '#a8c6a0',
  sageDeep: '#86ac7e',
  teal: '#7fb7b0',
  tealDeep: '#5c9a93',
  blue: '#a9c6e2',
  blueDeep: '#7ba3cc',
  orange: '#e6a878',
  orangeDeep: '#cf8a55',
  yellow: '#f0d493',
  pink: '#e9b7b7',
  cream: '#faf5ea',
  white: '#fffdf8',
  ink: '#2f3238',
  roofDark: '#bcab92',
  shadow: 'rgba(74,63,48,0.16)',
}

/* ------------------------------------------------------------
   Building primitives
   ------------------------------------------------------------ */

interface BuildingProps {
  x: number
  y: number
  w: number
  h: number
  fill: string
  rx?: number
  /** how far the soft shadow is cast — a proxy for building height */
  height?: number
  roofUnits?: number
  courtyard?: boolean
  green?: boolean
}

function Building({
  x,
  y,
  w,
  h,
  fill,
  rx = 3,
  height = 5,
  roofUnits = 0,
  courtyard = false,
  green = false,
}: BuildingProps) {
  const units = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number }[] = []
    let seed = Math.round(x * 13 + y * 7 + w * 3 + h * 5) || 1
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    for (let i = 0; i < roofUnits; i++) {
      const uw = 4 + rnd() * 7
      const uh = 4 + rnd() * 7
      out.push({
        x: x + 5 + rnd() * Math.max(1, w - uw - 10),
        y: y + 5 + rnd() * Math.max(1, h - uh - 10),
        w: uw,
        h: uh,
      })
    }
    return out
  }, [x, y, w, h, roofUnits])

  return (
    <g>
      {/* cast shadow — offset grows with building height */}
      <rect
        x={x + height * 0.26}
        y={y + height * 0.6}
        width={w}
        height={h}
        rx={rx}
        fill={C.shadow}
      />
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} />
      <rect
        x={x}
        y={y}
        width={w}
        height={Math.min(6, h * 0.22)}
        rx={rx}
        fill="#ffffff"
        opacity={0.3}
      />
      {green && (
        <rect
          x={x + w * 0.18}
          y={y + h * 0.18}
          width={w * 0.64}
          height={h * 0.64}
          rx={2}
          fill={C.sage}
          opacity={0.85}
        />
      )}
      {courtyard && (
        <rect
          x={x + w * 0.26}
          y={y + h * 0.26}
          width={w * 0.48}
          height={h * 0.48}
          rx={2}
          fill="#f6f1e7"
          opacity={0.6}
        />
      )}
      {units.map((u, i) => (
        <rect key={i} x={u.x} y={u.y} width={u.w} height={u.h} rx={1} fill={C.ink} opacity={0.1} />
      ))}
    </g>
  )
}

function Tree({ x, y, r = 9, tone = C.sage }: { x: number; y: number; r?: number; tone?: string }) {
  return (
    <g>
      <ellipse cx={x + r * 0.32} cy={y + r * 0.46} rx={r * 1.02} ry={r * 0.82} fill={C.shadow} opacity={0.5} />
      <circle cx={x} cy={y} r={r} fill={tone} />
      <circle cx={x - r * 0.3} cy={y - r * 0.32} r={r * 0.6} fill={C.grassLight} opacity={0.7} />
      <circle cx={x + r * 0.34} cy={y + r * 0.14} r={r * 0.48} fill={C.sageDeep} opacity={0.32} />
    </g>
  )
}

function Car({ x, y, rotate = 0, color = C.blue }: { x: number; y: number; rotate?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x={-7} y={-3.5} width={14} height={8} rx={3} fill={C.shadow} />
      <rect x={-7} y={-4.5} width={14} height={8} rx={3} fill={color} />
      <rect x={-2} y={-3} width={4} height={6} rx={1} fill="#ffffff" opacity={0.5} />
    </g>
  )
}

/* ------------------------------------------------------------
   Composition data
   ------------------------------------------------------------ */

/* Garden district — an 8 × 6 street grid of little houses. */
const HOUSES: { x: number; y: number; roof: string }[] = []
{
  const cols = [60, 116, 172, 228, 284, 340]
  const rows = [200, 260, 320, 380, 440, 500, 560, 620]
  const roofs = [C.sage, C.yellow, C.pink, C.blue, C.orange, C.sage, C.blue]
  let i = 0
  for (const ry of rows) {
    for (const rx of cols) {
      i++
      HOUSES.push({ x: rx, y: ry, roof: roofs[i % roofs.length] })
    }
  }
}

const APARTMENTS: BuildingProps[] = [
  { x: 470, y: 240, w: 62, h: 42, fill: C.cream, height: 8, roofUnits: 3 },
  { x: 470, y: 312, w: 62, h: 42, fill: C.yellow, height: 8, roofUnits: 2 },
  { x: 470, y: 384, w: 62, h: 42, fill: C.cream, height: 8, courtyard: true },
  { x: 470, y: 456, w: 62, h: 42, fill: C.blue, height: 8, roofUnits: 2 },
  { x: 552, y: 240, w: 56, h: 42, fill: C.pink, height: 8, roofUnits: 2 },
  { x: 552, y: 312, w: 56, h: 42, fill: C.cream, height: 8, green: true },
  { x: 552, y: 384, w: 56, h: 42, fill: C.orange, height: 8, roofUnits: 2 },
  { x: 552, y: 456, w: 56, h: 42, fill: C.cream, height: 8, roofUnits: 3 },

  { x: 960, y: 240, w: 58, h: 42, fill: C.cream, height: 8, roofUnits: 3 },
  { x: 960, y: 312, w: 58, h: 42, fill: C.yellow, height: 8, roofUnits: 2 },
  { x: 960, y: 384, w: 58, h: 42, fill: C.cream, height: 8, courtyard: true },
  { x: 960, y: 456, w: 58, h: 42, fill: C.blue, height: 8, roofUnits: 2 },
  { x: 1038, y: 240, w: 54, h: 42, fill: C.orange, height: 8, roofUnits: 2 },
  { x: 1038, y: 312, w: 54, h: 42, fill: C.cream, height: 8, green: true },
  { x: 1038, y: 384, w: 54, h: 42, fill: C.pink, height: 8, roofUnits: 2 },
  { x: 1038, y: 456, w: 54, h: 42, fill: C.cream, height: 8, roofUnits: 3 },

  // south of downtown, between avenue B2 and B3
  { x: 470, y: 596, w: 66, h: 44, fill: C.cream, height: 9, roofUnits: 3 },
  { x: 556, y: 596, w: 60, h: 44, fill: C.yellow, height: 9, roofUnits: 2 },
  { x: 640, y: 596, w: 60, h: 44, fill: C.cream, height: 9, courtyard: true },
  { x: 960, y: 596, w: 62, h: 44, fill: C.blue, height: 9, roofUnits: 2 },
  { x: 1042, y: 596, w: 62, h: 44, fill: C.cream, height: 9, roofUnits: 3 },
]

const TOWERS: BuildingProps[] = [
  { x: 700, y: 320, w: 54, h: 54, fill: C.cream, height: 18, roofUnits: 4, rx: 4 },
  { x: 764, y: 314, w: 46, h: 60, fill: C.blue, height: 24, roofUnits: 3, rx: 4 },
  { x: 820, y: 324, w: 58, h: 50, fill: C.cream, height: 16, roofUnits: 4, rx: 4 },
  { x: 694, y: 392, w: 50, h: 58, fill: C.teal, height: 22, roofUnits: 3, rx: 4, green: true },
  { x: 754, y: 390, w: 62, h: 62, fill: C.cream, height: 30, roofUnits: 5, rx: 5 },
  { x: 828, y: 392, w: 50, h: 56, fill: C.yellow, height: 20, roofUnits: 3, rx: 4 },
  { x: 700, y: 462, w: 52, h: 50, fill: C.cream, height: 15, roofUnits: 3, rx: 4 },
  { x: 764, y: 464, w: 48, h: 48, fill: C.pink, height: 17, roofUnits: 3, rx: 4 },
  { x: 824, y: 460, w: 54, h: 52, fill: C.cream, height: 19, roofUnits: 4, rx: 4 },
]

const WAREHOUSES: BuildingProps[] = [
  { x: 1170, y: 585, w: 96, h: 44, fill: C.orange, height: 11, rx: 4, roofUnits: 2 },
  { x: 1290, y: 585, w: 110, h: 44, fill: C.cream, height: 10, rx: 4, roofUnits: 2 },
  { x: 1170, y: 690, w: 100, h: 92, fill: C.cream, height: 10, rx: 4 },
  { x: 1290, y: 690, w: 100, h: 92, fill: C.orange, height: 13, rx: 4, roofUnits: 2 },
  { x: 1170, y: 860, w: 100, h: 80, fill: C.orange, height: 11, rx: 4, roofUnits: 2 },
  { x: 1290, y: 860, w: 100, h: 80, fill: C.cream, height: 10, rx: 4, roofUnits: 2 },
  { x: 1470, y: 585, w: 100, h: 44, fill: C.cream, height: 10, rx: 4, roofUnits: 2 },
  { x: 1470, y: 690, w: 100, h: 92, fill: C.orange, height: 12, rx: 4, roofUnits: 2 },
  { x: 1470, y: 860, w: 100, h: 80, fill: C.cream, height: 10, rx: 4, roofUnits: 2 },
]

const TREES: { x: number; y: number; r: number; tone?: string }[] = []
{
  let seed = 20261007
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  // riverbank trees
  for (let i = 0; i < 26; i++) {
    TREES.push({
      x: 40 + i * 20 + rnd() * 10,
      y: 690 + Math.sin(i * 0.5) * 24 + rnd() * 14,
      r: 7 + rnd() * 4,
    })
  }
  // riverside park groves (top-right)
  for (let i = 0; i < 34; i++) {
    TREES.push({ x: 1160 + rnd() * 390, y: 200 + rnd() * 250, r: 8 + rnd() * 6, tone: C.sageDeep })
  }
  // street trees along the two central avenues
  for (let i = 0; i < 15; i++) {
    TREES.push({ x: 650, y: 180 + i * 24, r: 5.5 })
    TREES.push({ x: 970, y: 180 + i * 24, r: 5.5 })
  }
  // scattered garden-district trees (kept off the street grid)
  for (let i = 0; i < 34; i++) {
    TREES.push({ x: 100 + rnd() * 250, y: 225 + rnd() * 420, r: 5.5 + rnd() * 3 })
  }
  // industrial fringe
  for (let i = 0; i < 12; i++) {
    TREES.push({ x: 1150 + rnd() * 110, y: 960 + rnd() * 30, r: 6 + rnd() * 3, tone: C.grassDeep })
  }
}

/* ------------------------------------------------------------
   Problem pin
   ------------------------------------------------------------ */

const SEVERITY: Record<CityProblem['severity'], { fill: string; label: string }> = {
  critical: { fill: '#d98a7a', label: '#a94c3c' },
  warning: { fill: '#e0a95e', label: '#96651f' },
  watch: { fill: '#7fb7b0', label: '#3f6f69' },
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
}: {
  problem: CityProblem
  onOpen: (id: string) => void
}) {
  const { title, metric } = problem
  const cardW = Math.max(title.length * 8.4 + 22, metric.length * 6.6 + 22, 150)
  const cardH = 54
  const cardX = -(cardW / 2)
  const cardY = -cardH - 18
  const sev = SEVERITY[problem.severity]

  if (problem.resolved) {
    return (
      <g className="pin pin--resolved" transform={`translate(${problem.x} ${problem.y})`}>
        <circle r={13} fill="#ffffff" opacity={0.9} />
        <circle r={11} fill="#7fa878" />
        <path
          d="M -5 0 L -1.6 3.8 L 5.4 -3.6"
          fill="none"
          stroke="#fff"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    )
  }

  return (
    <g
      className="pin pin--problem"
      transform={`translate(${problem.x} ${problem.y})`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(problem.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(problem.id)
      }}
    >
      <circle className="pin__pulse" r={16} fill={sev.fill} opacity={0.35} />
      <circle className="pin__pulse pin__pulse--2" r={16} fill={sev.fill} opacity={0.25} />
      <line x1={0} y1={-6} x2={0} y2={-16} stroke={sev.label} strokeWidth={2} opacity={0.5} />
      <circle r={13} fill="#fffdf8" />
      <circle r={11} fill={sev.fill} />
      <text y={4.5} textAnchor="middle" fontSize={12.5} className="pin__icon">
        {PROBLEM_ICON[problem.kind]}
      </text>

      <g className="pin__card">
        <rect
          x={cardX}
          y={cardY}
          width={cardW}
          height={cardH}
          rx={13}
          fill="#fffdf8"
          stroke="rgba(60,52,40,0.08)"
        />
        <rect x={cardX} y={cardY} width={4.5} height={cardH} rx={2.2} fill={sev.fill} />
        <text x={cardX + 15} y={cardY + 23} fontSize={13.5} fontWeight={700} fill={sev.label} letterSpacing="0.04em">
          {title}
        </text>
        <text x={cardX + 15} y={cardY + 42} fontSize={11.5} fontWeight={500} fill="#8b8f98">
          {metric}
        </text>
      </g>
    </g>
  )
}

/* ------------------------------------------------------------
   The map
   ------------------------------------------------------------ */

export default function CityMap() {
  const { state, openProblem } = useGame()
  const { problems, stats, arrivalPulse } = state
  const trafficOpen = problems.some((p) => p.kind === 'traffic' && !p.resolved)

  return (
    <div className="citymap">
      <svg
        className="citymap__svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-label="Aerial illustration of the city of Civitas"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8f3e9" />
            <stop offset="100%" stopColor="#f1ead9" />
          </linearGradient>
          <linearGradient id="river" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.water} />
            <stop offset="100%" stopColor={C.waterDeep} />
          </linearGradient>
          <linearGradient id="pond" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.waterDeep} />
            <stop offset="100%" stopColor={C.water} />
          </linearGradient>
          <radialGradient id="congest" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d98a7a" stopOpacity={0.42} />
            <stop offset="70%" stopColor="#d98a7a" stopOpacity={0.14} />
            <stop offset="100%" stopColor="#d98a7a" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7fa878" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#7fa878" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* ---------- ground ---------- */}
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#sky)" />
        <g opacity={0.9}>
          <ellipse cx={200} cy={300} rx={340} ry={240} fill={C.grass} />
          <ellipse cx={1360} cy={340} rx={300} ry={220} fill={C.grass} opacity={0.75} />
          <ellipse cx={780} cy={900} rx={380} ry={150} fill={C.grass} opacity={0.55} />
          <ellipse cx={110} cy={840} rx={250} ry={150} fill={C.sand} opacity={0.7} />
          <ellipse cx={1420} cy={780} rx={300} ry={230} fill={C.sand} opacity={0.5} />
        </g>

        {/* ---------- river ---------- */}
        <g>
          <path
            d="M -20 690 C 140 700 260 750 380 820 C 500 890 560 1000 560 1020 L 300 1020 C 300 940 250 880 160 840 C 90 808 30 800 -20 796 Z"
            fill="url(#river)"
          />
          <path
            d="M -20 690 C 140 700 260 750 380 820 C 500 890 560 1000 560 1020"
            fill="none"
            stroke={C.waterLine}
            strokeWidth={3}
            opacity={0.7}
          />
          <ellipse cx={200} cy={772} rx={40} ry={9} fill="#fff" opacity={0.28} />
          <ellipse cx={120} cy={932} rx={54} ry={10} fill="#fff" opacity={0.22} />
        </g>

        {/* ---------- roads ---------- */}
        <g>
          {/* top highway */}
          <path d="M -20 150 H 1620" stroke={C.roadDark} strokeWidth={30} fill="none" />
          <path d="M -20 150 H 1620" stroke={C.road} strokeWidth={26} fill="none" />
          <path
            d="M -20 150 H 1620"
            stroke={C.roadLine}
            strokeWidth={2.4}
            strokeDasharray="16 16"
            fill="none"
            opacity={0.9}
          />
          {/* right spine highway */}
          <path d="M 1120 -20 V 1020" stroke={C.roadDark} strokeWidth={28} fill="none" />
          <path d="M 1120 -20 V 1020" stroke={C.road} strokeWidth={24} fill="none" />
          <path
            d="M 1120 -20 V 1020"
            stroke={C.roadLine}
            strokeWidth={2.2}
            strokeDasharray="14 16"
            fill="none"
            opacity={0.85}
          />

          {/* central avenues */}
          <path d="M 440 -20 V 1020" stroke={C.road} strokeWidth={18} fill="none" />
          <path d="M 620 -20 V 1020" stroke={C.road} strokeWidth={18} fill="none" />
          <path d="M 940 -20 V 1020" stroke={C.road} strokeWidth={18} fill="none" />

          {/* central cross streets */}
          <path d="M 440 300 H 1120" stroke={C.road} strokeWidth={16} fill="none" />
          <path d="M 440 560 H 1120" stroke={C.road} strokeWidth={16} fill="none" />
          <path d="M 440 700 H 1120" stroke={C.road} strokeWidth={16} fill="none" />
          <path d="M 440 880 H 1120" stroke={C.road} strokeWidth={14} fill="none" />

          {/* avenue centre lines */}
          <g stroke={C.roadLine} strokeWidth={1.8} strokeDasharray="10 12" opacity={0.7}>
            <path d="M 620 -20 V 1020" fill="none" />
            <path d="M 940 -20 V 1020" fill="none" />
            <path d="M 440 300 H 1120" fill="none" />
            <path d="M 440 560 H 1120" fill="none" />
          </g>

          {/* garden-district street grid */}
          <g stroke={C.road} strokeWidth={8} fill="none" opacity={0.95}>
            <path d="M 103 180 V 680" />
            <path d="M 215 180 V 680" />
            <path d="M 327 180 V 680" />
            <path d="M 40 243 H 400" />
            <path d="M 40 303 H 400" />
            <path d="M 40 363 H 400" />
            <path d="M 40 423 H 400" />
            <path d="M 40 483 H 400" />
            <path d="M 40 543 H 400" />
            <path d="M 40 603 H 400" />
          </g>

          {/* industrial service roads */}
          <g stroke={C.road} strokeWidth={12} fill="none" opacity={0.95}>
            <path d="M 1440 560 V 1010" />
            <path d="M 1150 640 H 1600" />
            <path d="M 1150 830 H 1600" />
          </g>

          {/* bridge where the western avenue crosses the river */}
          <g>
            <rect x={422} y={846} width={36} height={104} rx={4} fill={C.roadDark} />
            <rect x={422} y={846} width={36} height={104} rx={4} fill={C.road} />
            <path d="M 440 848 V 948" stroke={C.roadLine} strokeWidth={2} strokeDasharray="7 7" opacity={0.85} />
          </g>
          {/* footbridge */}
          <g>
            <rect x={252} y={790} width={26} height={70} rx={4} fill={C.sand} transform="rotate(24 265 825)" />
          </g>

          {/* crosswalks at central intersections */}
          <g fill={C.white} opacity={0.85}>
            <rect x={612} y={292} width={16} height={16} rx={2} />
            <rect x={932} y={292} width={16} height={16} rx={2} />
            <rect x={612} y={552} width={16} height={16} rx={2} />
            <rect x={932} y={552} width={16} height={16} rx={2} />
            <rect x={612} y={692} width={16} height={16} rx={2} />
            <rect x={932} y={872} width={16} height={16} rx={2} />
          </g>

          {/* roundabouts */}
          <g>
            <circle cx={620} cy={150} r={30} fill={C.roadDark} />
            <circle cx={620} cy={150} r={27} fill={C.road} />
            <circle cx={620} cy={150} r={13} fill={C.sage} />
            <circle cx={620} cy={150} r={13} fill="none" stroke={C.sageDeep} strokeWidth={2} opacity={0.5} />
          </g>
          <g>
            <circle cx={940} cy={560} r={24} fill={C.roadDark} />
            <circle cx={940} cy={560} r={21} fill={C.road} />
            <circle cx={940} cy={560} r={9} fill={C.grassDeep} />
          </g>
        </g>

        {/* ---------- riverside park (top-right) ---------- */}
        <g>
          <rect x={1150} y={190} width={420} height={300} rx={22} fill={C.grass} />
          <rect x={1150} y={190} width={420} height={300} rx={22} fill={C.grassDeep} opacity={0.32} />
          <path
            d="M 1160 470 C 1250 400 1240 320 1330 300 C 1430 278 1470 350 1560 340"
            fill="none"
            stroke={C.sand}
            strokeWidth={9}
            strokeLinecap="round"
            opacity={0.9}
          />
          <ellipse cx={1420} cy={270} rx={78} ry={46} fill="url(#pond)" />
          <ellipse cx={1420} cy={270} rx={78} ry={46} fill="none" stroke="#fff" strokeWidth={2} opacity={0.35} />
        </g>

        {/* ---------- parking lots ---------- */}
        <g>
          <rect x={1170} y={520} width={200} height={44} rx={6} fill={C.roadDark} opacity={0.5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={1182 + i * 38} y={528} width={16} height={28} rx={3} fill={C.white} opacity={0.7} />
          ))}
          <rect x={690} y={810} width={150} height={40} rx={6} fill={C.roadDark} opacity={0.42} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={702 + i * 34} y={817} width={14} height={26} rx={3} fill={C.white} opacity={0.65} />
          ))}
        </g>

        {/* ---------- landmarks (south of downtown) ---------- */}
        <g>
          {/* hospital */}
          <Building x={960} y={720} w={110} h={70} fill={C.white} height={12} rx={8} />
          <rect x={1004} y={742} width={22} height={26} rx={3} fill={C.pink} />
          <rect x={998} y={748} width={34} height={14} rx={3} fill={C.pink} />

          {/* school + sports field */}
          <Building x={470} y={720} w={100} h={58} fill={C.blue} height={10} rx={7} />
          <rect x={586} y={716} width={130} height={78} rx={14} fill={C.grass} />
          <rect x={586} y={716} width={130} height={78} rx={14} fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
          <line x1={651} y1={716} x2={651} y2={794} stroke={C.white} strokeWidth={2} opacity={0.6} />
          <circle cx={651} cy={755} r={14} fill="none" stroke={C.white} strokeWidth={2} opacity={0.6} />

          {/* civic hall + library */}
          <Building x={690} y={720} w={90} h={56} fill={C.yellow} height={11} rx={7} />
          <Building x={800} y={730} w={76} h={52} fill={C.cream} height={9} rx={6} />

          {/* water tower */}
          <g>
            <ellipse cx={1540} cy={522} rx={26} ry={9} fill={C.shadow} />
            <rect x={1526} y={472} width={28} height={52} rx={6} fill={C.blue} />
            <ellipse cx={1540} cy={472} rx={22} ry={9} fill={C.blueDeep} />
            <ellipse cx={1540} cy={472} rx={15} ry={6} fill="#fff" opacity={0.3} />
          </g>
        </g>

        {/* ---------- industrial zone ---------- */}
        <g>
          <rect x={1150} y={560} width={430} height={400} rx={20} fill={C.sand} opacity={0.5} />
          {WAREHOUSES.map((b, i) => (
            <Building key={i} {...b} />
          ))}
          {/* smokestacks */}
          <g>
            <ellipse cx={1498} cy={582} rx={9} ry={3} fill={C.shadow} />
            <rect x={1490} y={505} width={16} height={76} rx={7} fill={C.roadDark} />
            <rect x={1516} y={495} width={16} height={86} rx={7} fill={C.roofDark} />
          </g>
        </g>

        {/* ---------- apartments ---------- */}
        <g>
          {APARTMENTS.map((b, i) => (
            <Building key={i} {...b} />
          ))}
        </g>

        {/* ---------- downtown towers ---------- */}
        <g>
          {TOWERS.map((b, i) => (
            <Building key={i} {...b} />
          ))}
        </g>

        {/* ---------- garden district houses ---------- */}
        <g>
          {HOUSES.map((b, i) => (
            <Building key={i} x={b.x} y={b.y} w={30} h={26} fill={b.roof} height={5} rx={3} />
          ))}
        </g>

        {/* ---------- tram line ---------- */}
        {stats.tramBuilt && (
          <g className="tram">
            <path
              d="M 470 760 C 560 700 600 640 700 600 C 820 552 900 470 940 380 C 980 300 1030 250 1120 210"
              fill="none"
              stroke={C.tealDeep}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.9}
            />
            <path
              d="M 470 760 C 560 700 600 640 700 600 C 820 552 900 470 940 380 C 980 300 1030 250 1120 210"
              fill="none"
              stroke="#fbf8f0"
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
              <circle key={i} cx={sx} cy={sy} r={6} fill="#fffdf8" stroke={C.tealDeep} strokeWidth={3} />
            ))}
            <g className="tram__car">
              <rect x={-13} y={-6} width={26} height={12} rx={4} fill={C.tealDeep} />
              <rect x={-9} y={-3.5} width={18} height={7} rx={2} fill="#e6f3f1" />
            </g>
          </g>
        )}

        {/* ---------- unlocked community park ---------- */}
        {stats.parkUnlocked && (
          <g className="unlock unlock--park">
            <circle cx={572} cy={858} r={150} fill="url(#glowGreen)" />
            <rect x={468} y={790} width={210} height={138} rx={24} fill={C.grass} />
            <rect x={468} y={790} width={210} height={138} rx={24} fill={C.grassDeep} opacity={0.3} />
            <path
              d="M 478 900 C 520 862 560 830 610 828 C 650 828 660 880 668 908"
              fill="none"
              stroke={C.sand}
              strokeWidth={7}
              strokeLinecap="round"
            />
            <ellipse cx={540} cy={858} rx={32} ry={19} fill="url(#pond)" />
            <circle cx={628} cy={852} r={13} fill={C.yellow} />
            <rect x={640} y={872} width={28} height={6} rx={3} fill={C.pink} />
          </g>
        )}

        {/* ---------- new growth (Add Citizens) ---------- */}
        {arrivalPulse > 0 && (
          <g key={arrivalPulse} className="growth">
            <circle cx={235} cy={660} r={120} fill="url(#glowGreen)" opacity={0.7} />
            {[
              { x: 200, y: 655, roof: C.sage },
              { x: 236, y: 655, roof: C.yellow },
              { x: 272, y: 655, roof: C.pink },
              { x: 200, y: 689, roof: C.blue },
              { x: 236, y: 689, roof: C.orange },
              { x: 272, y: 689, roof: C.sage },
            ].map((b, i) => (
              <Building key={i} x={b.x - 15} y={b.y - 13} w={30} h={26} fill={b.roof} height={5} rx={3} />
            ))}
          </g>
        )}

        {/* ---------- trees ---------- */}
        <g>
          {TREES.map((t, i) => (
            <Tree key={i} x={t.x} y={t.y} r={t.r} tone={t.tone} />
          ))}
        </g>

        {/* ---------- congestion overlay ---------- */}
        {trafficOpen && (
          <g className="congestion">
            <circle cx={790} cy={430} r={220} fill="url(#congest)" />
          </g>
        )}

        {/* ---------- vehicles ---------- */}
        <g>
          <Car x={320} y={141} color={C.blue} />
          <Car x={520} y={159} rotate={180} color={C.orange} />
          <Car x={880} y={141} color={C.pink} />
          <Car x={700} y={291} color={C.sage} />
          <Car x={150} y={291} rotate={180} color={C.yellow} />
          <Car x={1108} y={420} rotate={90} color={C.blue} />
          <Car x={1132} y={760} rotate={270} color={C.orange} />
          <Car x={612} y={420} rotate={90} color={C.pink} />
          <Car x={628} y={520} rotate={90} color={C.blue} />
          <Car x={932} y={470} rotate={270} color={C.sage} />
          <Car x={250} y={551} color={C.blue} />
          <Car x={600} y={700} rotate={90} color={C.yellow} />
          {!stats.tramBuilt && (
            <>
              <Car x={612} y={640} rotate={90} color={C.orange} />
              <Car x={628} y={330} rotate={90} color={C.yellow} />
              <Car x={700} y={141} color={C.pink} />
              <Car x={790} y={552} color={C.blue} />
              <Car x={932} y={330} rotate={270} color={C.pink} />
            </>
          )}
        </g>

        {/* ---------- district labels ---------- */}
        <g className="maplabels" fill={C.ink} opacity={0.38}>
          <text x={150} y={175} fontSize={15} letterSpacing="0.28em" fontWeight={700}>
            GARDEN DISTRICT
          </text>
          <text x={770} y={278} fontSize={15} letterSpacing="0.28em" fontWeight={700}>
            DOWNTOWN
          </text>
          <text x={1300} y={176} fontSize={15} letterSpacing="0.28em" fontWeight={700}>
            RIVERSIDE PARK
          </text>
          <text x={1300} y={952} fontSize={15} letterSpacing="0.28em" fontWeight={700}>
            WORKS DISTRICT
          </text>
          <text x={70} y={952} fontSize={15} letterSpacing="0.28em" fontWeight={700}>
            OLD TOWN
          </text>
        </g>

        {/* ---------- problem pins ---------- */}
        <g>
          {problems.map((p) => (
            <ProblemPin key={p.id} problem={p} onOpen={openProblem} />
          ))}
        </g>
      </svg>

      <div className="citymap__vignette" />
    </div>
  )
}
