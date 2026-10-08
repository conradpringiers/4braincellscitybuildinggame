/* ============================================================
   measureAI — the simulated policy analyst.

   In the real game an LLM would read the deputy's free text and
   return a structured measure. Here we fake that deterministically
   with keyword heuristics so the prototype is fully offline and the
   demo is repeatable.
   ============================================================ */

import type { CityProblem, IndicatorKey, ProblemKind } from './types'

export interface MeasureDraft {
  title: string
  tags: string[]
  cost: number
  effects: Partial<Record<IndicatorKey, number>>
  summary: string
  confidence: number
  flags: { tram?: boolean; park?: boolean; housing?: boolean }
}

interface Rule {
  tag: string
  keywords: string[]
  key: IndicatorKey
  mag: number
}

const RULES: Rule[] = [
  {
    tag: 'Mobility',
    key: 'mobility',
    mag: 15,
    keywords: [
      'tram', 'tramway', 'bus', 'metro', 'métro', 'rail', 'train', 'bike', 'cycle',
      'velo', 'vélo', 'walk', 'pedestrian', 'piéton', 'lane', 'road', 'traffic',
      'transit', 'commute', 'parking', 'crossing', 'bridge', 'shuttle',
    ],
  },
  {
    tag: 'Environment',
    key: 'environment',
    mag: 13,
    keywords: [
      'park', 'tree', 'green', 'plant', 'forest', 'recycle', 'compost', 'emission',
      'air', 'pollution', 'nature', 'garden', 'greenbelt', 'biodiversity', 'reforest',
    ],
  },
  {
    tag: 'Water',
    key: 'water',
    mag: 13,
    keywords: ['water', 'reservoir', 'greywater', 'rain', 'pipe', 'river', 'flood', 'drain', 'irrigation'],
  },
  {
    tag: 'Energy',
    key: 'energy',
    mag: 13,
    keywords: ['solar', 'wind', 'energy', 'grid', 'battery', 'insulat', 'heat pump', 'renewable', 'geothermal'],
  },
  {
    tag: 'Housing',
    key: 'happiness',
    mag: 11,
    keywords: ['housing', 'home', 'apartment', 'rent', 'district', 'neighbourhood', 'neighborhood', 'shelter', 'tenant'],
  },
  {
    tag: 'Services',
    key: 'happiness',
    mag: 12,
    keywords: ['hospital', 'clinic', 'health', 'school', 'care', 'childcare', 'library', 'service', 'nurse', 'teacher'],
  },
]

const HIGH_COST = ['build', 'construct', 'plant', 'network', 'retrofit', 'renovate', 'renovat', 'install', 'expand', 'extend', 'line', 'station', 'plant', 'planting']
const LOW_COST = ['ban', 'tax', 'levy', 'charge', 'fee', 'limit', 'regulate', 'zone', 'campaign', 'subsidy', 'awareness', 'scheme', 'pledge']
const FRICTION = ['ban', 'tax', 'levy', 'charge', 'limit', 'regulate', 'restrict', 'fine', 'mandatory', 'remove']

/** if the text names no sector, fall back to the problem being addressed */
const KIND_FALLBACK: Record<ProblemKind, { tag: string; key: IndicatorKey; mag: number }> = {
  traffic: { tag: 'Mobility', key: 'mobility', mag: 12 },
  water: { tag: 'Water', key: 'water', mag: 12 },
  housing: { tag: 'Housing', key: 'happiness', mag: 10 },
  energy: { tag: 'Energy', key: 'energy', mag: 12 },
  waste: { tag: 'Environment', key: 'environment', mag: 8 },
  pollution: { tag: 'Environment', key: 'environment', mag: 12 },
  health: { tag: 'Services', key: 'happiness', mag: 11 },
}

const clean = (s: string) => s.toLowerCase()

/** Turn free text into a structured measure draft. */
export function analyzeMeasure(text: string, problem: CityProblem | null): MeasureDraft {
  const t = clean(text)
  const tags: string[] = []
  const effects: Partial<Record<IndicatorKey, number>> = {}
  const flags: MeasureDraft['flags'] = {}

  for (const rule of RULES) {
    const hits = rule.keywords.filter((k) => t.includes(k)).length
    if (hits > 0) {
      tags.push(rule.tag)
      const mag = Math.min(rule.mag + (hits - 1) * 3, rule.mag + 9)
      effects[rule.key] = (effects[rule.key] ?? 0) + mag
    }
  }

  // nothing recognised? assume the deputy is acting on the chosen problem
  if (tags.length === 0 && problem) {
    const fb = KIND_FALLBACK[problem.kind]
    tags.push(fb.tag)
    effects[fb.key] = (effects[fb.key] ?? 0) + fb.mag
  }

  // tram / rail is a structural change the map knows about
  if (/(tram|tramway|light rail|metro|métro|rail line)/.test(t)) flags.tram = true
  if (/(park|garden|green space|playground|woodland)/.test(t) && /(new|create|build|open|plant)/.test(t)) {
    flags.park = true
  }
  if (/(housing|homes|apartments|neighbourhood|neighborhood|district|block)/.test(t)) flags.housing = true

  // friction: bans & taxes annoy people a little
  if (FRICTION.some((k) => t.includes(k))) {
    effects.happiness = (effects.happiness ?? 0) - 4
  }
  if (/(park|tree|green|garden)/.test(t)) {
    effects.environment = (effects.environment ?? 0) + 3
  }

  // ---- cost ----
  let cost = 0
  const explicit = t.match(/(\d[\d\s.,]{1,7})\s*(k|m|million|thousand)?/)
  const highHits = HIGH_COST.filter((k) => t.includes(k)).length
  const lowHits = LOW_COST.filter((k) => t.includes(k)).length
  if (explicit) {
    let n = parseInt(explicit[1].replace(/[^\d]/g, ''), 10)
    if (isNaN(n)) n = 0
    const unit = explicit[2]
    if (unit === 'k' || unit === 'thousand') n *= 1000
    if (unit === 'm' || unit === 'million') n *= 1_000_000
    cost = Math.min(n, 20000)
  }
  if (!cost) {
    cost = 120 + highHits * 260 + tags.length * 60 - lowHits * 90
    if (flags.tram) cost = Math.max(cost, 800)
    cost = Math.max(0, Math.round(cost / 10) * 10)
  }

  // ---- title ----
  const title = makeTitle(text)

  // ---- summary ----
  const effectList = (Object.keys(effects) as IndicatorKey[])
    .map((k) => `${k} ${effects[k]! > 0 ? '+' : ''}${effects[k]}`)
    .join(', ')
  const summary = tags.length
    ? `Classified as ${tags.join(' / ')}. Projected impact: ${effectList || 'no measurable change'}.${
        flags.tram ? ' Structural change: adds a transit line to the city model.' : ''
      }`
    : 'The measure could not be mapped to a city indicator. Try to name the sector (transport, water, energy, housing, green space…).'

  const confidence = Math.min(0.98, 0.42 + tags.length * 0.16 + (text.length > 60 ? 0.08 : 0) - (lowHits > 0 ? 0.04 : 0))

  return {
    title,
    tags: tags.length ? tags : ['General'],
    cost,
    effects,
    summary,
    confidence: Math.max(0.31, Math.round(confidence * 100) / 100),
    flags,
  }
}

function makeTitle(text: string): string {
  const words = text.trim().replace(/\s+/g, ' ').split(' ')
  const short = words.slice(0, 8).join(' ')
  const base = short.length > 54 ? short.slice(0, 54).trim() + '…' : short
  if (!base) return 'Untitled measure'
  return base.charAt(0).toUpperCase() + base.slice(1)
}

/** Fake but plausible internal vote, scaled by the party's cohesion. */
export function simulateInternalVote(seats: number, effects: Partial<Record<IndicatorKey, number>>) {
  const sum = Object.values(effects).reduce((a, b) => a + (b ?? 0), 0)
  const cohesion = 0.62 + Math.min(0.3, Math.max(-0.2, sum / 120))
  const forVotes = Math.max(1, Math.round(seats * cohesion))
  const against = Math.max(0, seats - forVotes)
  return { for: forVotes, against }
}
