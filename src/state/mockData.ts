import type {
  CityIndicators,
  CityProblem,
  Challenge,
  ChatMessage,
  ChatTab,
  CitizenProfile,
  FeedEvent,
  Measure,
  Party,
  PartyHq,
} from './types'

/* ============================================================
   URBLOOM — mock data
   Everything below is fictional demo data for the prototype.
   ============================================================ */

export const INDICATOR_META: {
  key: keyof CityIndicators
  icon: string
  label: string
  tone: 'sage' | 'teal' | 'blue' | 'orange' | 'yellow' | 'pink'
}[] = [
  { key: 'environment', icon: '🌱', label: 'Environment', tone: 'sage' },
  { key: 'mobility', icon: '🚗', label: 'Mobility', tone: 'orange' },
  { key: 'water', icon: '💧', label: 'Water', tone: 'blue' },
  { key: 'energy', icon: '⚡', label: 'Energy', tone: 'yellow' },
  { key: 'happiness', icon: '😊', label: 'Happiness', tone: 'pink' },
]

export const INITIAL_INDICATORS: CityIndicators = {
  environment: 72,
  mobility: 61,
  water: 78,
  energy: 67,
  happiness: 76,
}

export const INITIAL_POPULATION = 2481
export const INITIAL_BUDGET = 4200

export const PROBLEM_ICON: Record<CityProblem['kind'], string> = {
  traffic: '🚗',
  water: '💧',
  housing: '🏠',
  energy: '⚡',
  waste: '🗑️',
  pollution: '🌫️',
  health: '🏥',
}

/* ------------------------------------------------------------
   City problems — pinned to coordinates on the city map
   ------------------------------------------------------------ */
export const INITIAL_PROBLEMS: CityProblem[] = [
  {
    id: 'traffic',
    kind: 'traffic',
    title: 'TRAFFIC CRISIS',
    metric: '+18% congestion',
    detail:
      'Downtown arterials are running 18% above capacity during peak hours. Average commute times have risen to 41 minutes, and the river bridges are the worst bottlenecks in the city.',
    x: 690,
    y: 372,
    severity: 'critical',
    status: 'open',
    progress: 12,
    timeline: [
      { time: '6h ago', text: 'Congestion passed the critical threshold downtown.' },
      { time: '3d ago', text: 'Growth First widened the northern interchange.', partyId: 'growth' },
      { time: '2w ago', text: 'Green Future opened the riverside cycle network.', partyId: 'green' },
    ],
  },
  {
    id: 'water',
    kind: 'water',
    title: 'WATER PRESSURE',
    metric: 'Reservoir at 54%',
    detail:
      'The east reservoir is dropping faster than the seasonal average. Brackish intrusion has been detected near the river delta and two districts face summer restrictions.',
    x: 1430,
    y: 468,
    severity: 'warning',
    status: 'in-progress',
    progress: 46,
    timeline: [
      { time: '1d ago', text: 'Community First demanded a household support scheme.' },
      { time: '4d ago', text: 'Green Future adopted a greywater retrofit programme.', partyId: 'green' },
    ],
  },
  {
    id: 'housing',
    kind: 'housing',
    title: 'HOUSING SHORTAGE',
    metric: '1,900 on waiting list',
    detail:
      'Rental vacancy has fallen below 1%. New districts cannot absorb the incoming population wave and eviction notices are rising in the old town.',
    x: 360,
    y: 690,
    severity: 'warning',
    status: 'in-progress',
    progress: 34,
    timeline: [
      { time: '2d ago', text: 'Community First proposed a compact eco-district.' },
      { time: '1w ago', text: 'Emergency rental support scheme applied.', partyId: 'community' },
    ],
  },
  {
    id: 'pollution',
    kind: 'pollution',
    title: 'AIR POLLUTION',
    metric: 'PM2.5 elevated',
    detail:
      'Industrial emissions drift over the north residential belt. The air quality index sits at 143 and asthma admissions are climbing in schools near the works district.',
    x: 1360,
    y: 648,
    severity: 'watch',
    status: 'in-progress',
    progress: 40,
    timeline: [
      { time: '5h ago', text: 'A citizens’ petition reached 2,000 signatures.' },
      { time: '2d ago', text: 'Growth First adopted an air-filters mandate.', partyId: 'growth' },
    ],
  },
  {
    id: 'energy',
    kind: 'energy',
    title: 'ENERGY DEMAND',
    metric: 'Grid at 91% peak',
    detail:
      'Evening peak demand is brushing the grid’s safe limit. The works district and the new towers both draw heavily between 18:00 and 21:00.',
    x: 1450,
    y: 870,
    severity: 'warning',
    status: 'open',
    progress: 20,
    timeline: [
      { time: '9h ago', text: 'Two brownouts recorded in the works district.' },
      { time: '5d ago', text: 'Green Future opened talks on rooftop solar.', partyId: 'green' },
    ],
  },
  {
    id: 'health',
    kind: 'health',
    title: 'HEALTHCARE PRESSURE',
    metric: 'ER wait +34 min',
    detail:
      'Central Hospital reports rising emergency admissions. Staff shortages in the eastern clinics are pushing wait times above the regional threshold.',
    x: 820,
    y: 700,
    severity: 'watch',
    status: 'open',
    progress: 15,
    timeline: [{ time: '1d ago', text: 'Nursing union filed a formal complaint.' }],
  },
]

/* ------------------------------------------------------------
   Measures — decisions already taken by the parties
   ------------------------------------------------------------ */
export const INITIAL_MEASURES: Measure[] = [
  {
    id: 'm-cycyle',
    problemId: 'traffic',
    partyId: 'green',
    title: 'Riverside cycling network',
    body:
      'Open a continuous protected cycling corridor along the river, linking the garden district to downtown with 14 km of separated lanes and 900 secure parking spaces.',
    tags: ['Mobility', 'Environment'],
    cost: 320,
    status: 'applied',
    createdAt: '2 weeks ago',
    votes: { for: 6, against: 1 },
    effects: { mobility: 12, environment: 5 },
    summary: 'Classified as Mobility / Environment. Projected impact: mobility +12, environment +5.',
    flags: {},
  },
  {
    id: 'm-greywater',
    problemId: 'water',
    partyId: 'green',
    title: 'East reservoir greywater retrofit',
    body:
      'Retrofit the eastern district with closed-loop greywater recycling and rain gardens, cutting potable water demand by 18%.',
    tags: ['Water'],
    cost: 520,
    status: 'adopted',
    createdAt: '4 days ago',
    votes: { for: 5, against: 2 },
    effects: { water: 12, environment: 4 },
    summary: 'Classified as Water. Projected impact: water +12.',
    flags: {},
  },
  {
    id: 'm-interchange',
    problemId: 'traffic',
    partyId: 'growth',
    title: 'Northern interchange widening',
    body:
      'Widen the northern arterial to three lanes each way and rebuild the interchange to move freight faster through the works district.',
    tags: ['Mobility'],
    cost: 500,
    status: 'applied',
    createdAt: '3 days ago',
    votes: { for: 4, against: 0 },
    effects: { mobility: 8, environment: -6 },
    summary: 'Classified as Mobility. Projected impact: mobility +8, environment −6.',
    flags: {},
  },
  {
    id: 'm-rent',
    problemId: 'housing',
    partyId: 'community',
    title: 'Emergency rental support scheme',
    body:
      'A six-month rent guarantee for households on the waiting list, paired with a cap on short-term holiday lets in the old town.',
    tags: ['Housing', 'Services'],
    cost: 180,
    status: 'applied',
    createdAt: '1 week ago',
    votes: { for: 1, against: 0 },
    effects: { happiness: 8 },
    summary: 'Classified as Housing / Services. Projected impact: happiness +8.',
    flags: {},
  },
  {
    id: 'm-filters',
    problemId: 'pollution',
    partyId: 'growth',
    title: 'Industrial air-filters mandate',
    body:
      'Require every works-district operator to install particulate filters within 12 months and publish live emissions data.',
    tags: ['Environment'],
    cost: 260,
    status: 'adopted',
    createdAt: '2 days ago',
    votes: { for: 3, against: 1 },
    effects: { environment: 9, happiness: -3 },
    summary: 'Classified as Environment. Projected impact: environment +9, happiness −3.',
    flags: {},
  },
]

/* ------------------------------------------------------------
   Fictional political parties (NOT real parties)
   ------------------------------------------------------------ */
export const PARTIES: Party[] = [
  {
    id: 'green',
    name: 'Green Future',
    short: 'Green',
    mark: '🌱',
    color: '#56A867',
    colorSoft: '#D9F1DA',
    accent: '#2F7A48',
    tagline: 'Grow the city, not the footprint.',
    manifesto:
      'Green Future believes a thriving city and a living planet are the same project. We invest in public transport, protect the greenbelt and make every neighbourhood walkable, shaded and clean.',
    priorities: [
      { icon: '🌱', label: 'Environment first' },
      { icon: '🚇', label: 'Public transport' },
      { icon: '🌳', label: 'Green spaces' },
      { icon: '🚲', label: 'Active mobility' },
    ],
    members: 1120,
    popularity: 54,
    seats: 7,
    leader: 'Maya Okonkwo',
    headOfGovernment: true,
    mps: [
      { id: 'mp-maya', name: 'Maya Okonkwo', initials: 'MO', role: 'Leader · Head of Government', online: true },
      { id: 'mp-lena', name: 'Lena Farkas', initials: 'LF', role: 'Water & Health', online: true },
      { id: 'mp-tomas', name: 'Tomás Beltrán', initials: 'TB', role: 'Transport', online: false },
      { id: 'mp-aiko', name: 'Aiko Nakamura', initials: 'AN', role: 'Environment', online: true },
      { id: 'mp-ravi', name: 'Ravi Menon', initials: 'RM', role: 'Energy', online: false },
      { id: 'mp-sofia', name: 'Sofia Bergström', initials: 'SB', role: 'Housing', online: true },
      { id: 'mp-noah', name: 'Noah Adeyemi', initials: 'NA', role: 'Chief Whip', online: false },
    ],
    announcements: [
      { id: 'ga1', time: '2h', text: 'The riverside cycle network is now open to the public.' },
      { id: 'ga2', time: '1d', text: 'We are drafting a greywater retrofit for the east reservoir.' },
      { id: 'ga3', time: '3d', text: 'Greenbelt protection clause attached to every new permit.' },
      { id: 'ga4', time: '6d', text: 'Rooftop solar talks opened with the works district.' },
    ],
  },
  {
    id: 'growth',
    name: 'Growth First',
    short: 'Growth',
    mark: '🏗️',
    color: '#DC8A4C',
    colorSoft: '#FCE3CC',
    accent: '#A9622B',
    tagline: 'Build now. Prosper together.',
    manifesto:
      'Growth First argues the city must build its way out of every shortage. More homes, more industry, more jobs — infrastructure is the engine of opportunity for the next generation.',
    priorities: [
      { icon: '🏗️', label: 'Infrastructure' },
      { icon: '💰', label: 'Economy & jobs' },
      { icon: '🏭', label: 'Industry' },
      { icon: '🚗', label: 'Road capacity' },
    ],
    members: 690,
    popularity: 31,
    seats: 4,
    leader: 'Alex Renard',
    headOfGovernment: false,
    mps: [
      { id: 'mp-alex', name: 'Alex Renard', initials: 'AR', role: 'Leader · Opposition', online: true },
      { id: 'mp-jonas', name: 'Jonas Keller', initials: 'JK', role: 'Infrastructure', online: true },
      { id: 'mp-marta', name: 'Marta Ruiz', initials: 'MR', role: 'Economy', online: false },
      { id: 'mp-dmitri', name: 'Dmitri Volkov', initials: 'DV', role: 'Industry', online: false },
    ],
    announcements: [
      { id: 'xa1', time: '4h', text: 'The northern interchange reopens with three lanes each way.' },
      { id: 'xa2', time: '2d', text: 'Air-filters mandate adopted for the works district.' },
      { id: 'xa3', time: '5d', text: 'We will oppose any new tax on freight.' },
    ],
  },
  {
    id: 'community',
    name: 'Community First',
    short: 'Community',
    mark: '🏘️',
    color: '#3AA091',
    colorSoft: '#CDF0E8',
    accent: '#2A7268',
    tagline: 'A city is its people.',
    manifesto:
      'Community First puts care at the centre of the city. Affordable housing, strong public services and healthy neighbourhoods come before towers and traffic lanes.',
    priorities: [
      { icon: '🏠', label: 'Affordable housing' },
      { icon: '🏥', label: 'Healthcare' },
      { icon: '😊', label: 'Public services' },
      { icon: '🎓', label: 'Schools & childcare' },
    ],
    members: 471,
    popularity: 15,
    seats: 1,
    leader: 'Priya Raman',
    headOfGovernment: false,
    mps: [{ id: 'mp-priya', name: 'Priya Raman', initials: 'PR', role: 'Leader · Housing & Care', online: true }],
    announcements: [
      { id: 'ca1', time: '1d', text: 'Emergency rental support is now live for 400 households.' },
      { id: 'ca2', time: '4d', text: 'We tabled a motion on eastern clinic staffing.' },
    ],
  },
]

/* ------------------------------------------------------------
   Party HQ — the desk of a Green Future deputy
   ------------------------------------------------------------ */
export const INITIAL_HQ: PartyHq = {
  partyId: 'green',
  treasury: 3400,
  approval: 58,
  coalition: ['community'],
  electionIn: '3d 04h',
  chat: [
    {
      id: 'hq1',
      author: 'Maya',
      initials: 'MO',
      color: '#56A867',
      text: 'Whip check in ten. How is the downtown congestion measure coming along?',
      time: '09:02',
    },
    {
      id: 'hq2',
      author: 'Tomás',
      initials: 'TB',
      color: '#6C90E0',
      text: 'Draft is ready. A tram loop beats another lane — the model agrees.',
      time: '09:05',
    },
    {
      id: 'hq3',
      author: 'Aiko',
      initials: 'AN',
      color: '#3AA091',
      text: 'Attach a planting clause to the corridor and I can move it through committee.',
      time: '09:07',
    },
  ],
  agenda: [
    { id: 'ag1', time: '09:30', text: 'Committee vote on the water retrofit', tone: 'blue' },
    { id: 'ag2', time: '11:00', text: 'Coalition meeting with Community First', tone: 'teal' },
    { id: 'ag3', time: '14:15', text: 'Press briefing on downtown congestion', tone: 'orange' },
    { id: 'ag4', time: '16:00', text: 'Whip count for the tram measure', tone: 'sage' },
  ],
}

/* ------------------------------------------------------------
   Sustainability challenges
   ------------------------------------------------------------ */
export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'mobility',
    title: 'Mobility Challenge',
    icon: '🚲',
    brief: 'Choose walking, cycling or public transport for one journey today.',
    reward: '+50 Civic Energy',
    progress: 472,
    goal: 500,
    unlockedLabel: 'New Community Park',
    joined: true,
    completed: false,
  },
  {
    id: 'water',
    title: 'Water Wise Week',
    icon: '💧',
    brief: 'Shave 10 litres off your daily use for five days straight.',
    reward: '+35 Civic Energy',
    progress: 218,
    goal: 400,
    unlockedLabel: 'Rain Garden Network',
    joined: false,
    completed: false,
  },
  {
    id: 'energy',
    title: 'Switch It Off',
    icon: '⚡',
    brief: 'Drop your household peak-hour energy use by 12%.',
    reward: '+40 Civic Energy',
    progress: 96,
    goal: 300,
    unlockedLabel: 'Solar Roof Subsidy',
    joined: false,
    completed: false,
  },
]

/* ------------------------------------------------------------
   City feed
   ------------------------------------------------------------ */
export const INITIAL_FEED: FeedEvent[] = [
  {
    id: 'f1',
    icon: '🚗',
    text: 'Downtown traffic has reached critical levels.',
    time: '2m',
    tone: 'orange',
  },
  {
    id: 'f2',
    icon: '⚖️',
    text: 'Green Future adopted the greywater retrofit programme.',
    time: '14m',
    tone: 'sage',
  },
  {
    id: 'f3',
    icon: '🏘️',
    text: '300 new citizens joined Civitas this week.',
    time: '18m',
    tone: 'blue',
  },
  {
    id: 'f4',
    icon: '🌫️',
    text: 'Growth First adopted an industrial air-filters mandate.',
    time: '41m',
    tone: 'orange',
  },
  {
    id: 'f5',
    icon: '🏥',
    text: 'Central Hospital reports rising emergency admissions.',
    time: '1h',
    tone: 'pink',
  },
  {
    id: 'f6',
    icon: '💧',
    text: 'East reservoir dropped below 55% capacity.',
    time: '2h',
    tone: 'teal',
  },
]

/* ------------------------------------------------------------
   Chat (fictional citizens)
   ------------------------------------------------------------ */
export const INITIAL_CHAT: Record<ChatTab, ChatMessage[]> = {
  GLOBAL: [
    {
      id: 'g1',
      author: 'Maya',
      initials: 'MO',
      color: '#56A867',
      text: 'We need better public transport before expanding the suburbs.',
      time: '09:14',
    },
    {
      id: 'g2',
      author: 'Alex',
      initials: 'AR',
      color: '#DC8A4C',
      text: 'I support the tram, but where will the money come from?',
      time: '09:16',
    },
    {
      id: 'g3',
      author: 'Priya',
      initials: 'PR',
      color: '#3AA091',
      text: 'The greywater retrofit would free up a lot of budget downstream.',
      time: '09:18',
    },
    {
      id: 'g4',
      author: 'Jonas',
      initials: 'JK',
      color: '#6C90E0',
      text: 'Anyone else stuck on the north bridge for 40 minutes today?',
      time: '09:21',
    },
  ],
  PARTY: [
    {
      id: 'p1',
      author: 'Maya',
      initials: 'MO',
      color: '#56A867',
      text: 'Greens — our council bloc is voting yes on the tram. Sound good?',
      time: '08:55',
    },
    {
      id: 'p2',
      author: 'You',
      initials: 'C',
      color: '#2B2740',
      text: 'Yes. And let’s attach the greenbelt protection clause to it.',
      time: '08:58',
      mine: true,
    },
    {
      id: 'p3',
      author: 'Lena',
      initials: 'LF',
      color: '#3AA091',
      text: 'Agreed. I’ll draft the planting plan for the tram corridor.',
      time: '09:02',
    },
  ],
  DISTRICT: [
    {
      id: 'd1',
      author: 'Jonas',
      initials: 'JK',
      color: '#6C90E0',
      text: 'Riverside district: our crossing is still flooding after rain.',
      time: '07:40',
    },
    {
      id: 'd2',
      author: 'Sofia',
      initials: 'SB',
      color: '#DA7A93',
      text: 'Same on the east side. I raised a report with the water office.',
      time: '07:52',
    },
  ],
  MEASURES: [
    {
      id: 'i1',
      author: 'Priya',
      initials: 'PR',
      color: '#3AA091',
      text: 'On the tram: 6.2 km loop serves 14,000 daily riders at full build.',
      time: '09:05',
    },
    {
      id: 'i2',
      author: 'Alex',
      initials: 'AR',
      color: '#DC8A4C',
      text: 'Costs are real though. Highway is 300 cheaper for similar relief.',
      time: '09:09',
    },
  ],
}

/* ------------------------------------------------------------
   Citizen profile
   ------------------------------------------------------------ */
export const INITIAL_PROFILE: CitizenProfile = {
  name: 'Conrad',
  since: 'October 2026',
  civicScore: 742,
  sustainability: 68,
  partyId: 'green',
  challenges: 24,
  rank: 'Deputy · Green Future',
  badges: [
    { id: 'first-vote', label: 'First Measure', icon: '📜', earned: true },
    { id: 'city-builder', label: 'City Builder', icon: '🏗️', earned: true },
    { id: 'green-commuter', label: 'Green Commuter', icon: '🚲', earned: true },
    { id: 'community-hero', label: 'Community Hero', icon: '🏅', earned: false },
  ],
}
