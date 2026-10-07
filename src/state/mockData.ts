import type {
  CityIndicators,
  CityProblem,
  Challenge,
  ChatMessage,
  ChatTab,
  CitizenProfile,
  FeedEvent,
  Initiative,
  Party,
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
      'Downtown arterials are running 18% above capacity during peak hours. Average commute times have risen to 41 minutes.',
    x: 690,
    y: 372,
    severity: 'critical',
    initiativeId: 'tram',
    resolved: false,
  },
  {
    id: 'water',
    kind: 'water',
    title: 'WATER PRESSURE',
    metric: 'Reservoir at 54%',
    detail:
      'The east reservoir is dropping faster than seasonal average. Brackish intrusion detected near the river delta.',
    x: 1430,
    y: 468,
    severity: 'warning',
    initiativeId: 'reservoir',
    resolved: false,
  },
  {
    id: 'housing',
    kind: 'housing',
    title: 'HOUSING SHORTAGE',
    metric: '1,900 on waiting list',
    detail:
      'Rental vacancy has fallen below 1%. New districts cannot absorb the incoming population wave.',
    x: 360,
    y: 690,
    severity: 'warning',
    initiativeId: 'housing',
    resolved: false,
  },
  {
    id: 'pollution',
    kind: 'pollution',
    title: 'AIR POLLUTION',
    metric: 'PM2.5 elevated',
    detail:
      'Industrial emissions are drifting over the north residential belt. Air quality index sits at 143.',
    x: 1360,
    y: 648,
    severity: 'watch',
    initiativeId: 'tram',
    resolved: false,
  },
]

/* ------------------------------------------------------------
   Initiatives
   ------------------------------------------------------------ */
export const INITIAL_INITIATIVES: Initiative[] = [
  {
    id: 'tram',
    question: 'BUILD A NEW TRAM LINE?',
    context: 'Downtown congestion has increased by 18% this quarter.',
    problemId: 'traffic',
    status: 'open',
    closesIn: '2d 06h',
    voters: 1432,
    options: [
      {
        id: 'tram',
        title: 'Build tram line',
        blurb:
          'A 6.2 km light-rail loop connecting the suburbs, downtown and the riverfront.',
        cost: 800,
        votes: 54,
        impacts: [
          { label: 'Traffic', value: '-25', tone: 'good' },
          { label: 'Environment', value: '+15', tone: 'good' },
          { label: 'Budget', value: '-800', tone: 'bad' },
        ],
        effect: { mobility: 18, environment: 9 },
      },
      {
        id: 'highway',
        title: 'Expand highway',
        blurb:
          'Widen the northern arterial to three lanes each way with a new interchange.',
        cost: 500,
        votes: 31,
        impacts: [
          { label: 'Traffic', value: '-20', tone: 'good' },
          { label: 'Environment', value: '-10', tone: 'bad' },
          { label: 'Budget', value: '-500', tone: 'bad' },
        ],
        effect: { mobility: 13, environment: -8 },
      },
      {
        id: 'nothing',
        title: 'Do nothing',
        blurb:
          'Defer the decision to the next council term and monitor conditions.',
        cost: 0,
        votes: 15,
        impacts: [
          { label: 'Traffic', value: '+10', tone: 'bad' },
          { label: 'Budget', value: '0', tone: 'neutral' },
        ],
        effect: { mobility: -7 },
      },
    ],
  },
  {
    id: 'housing',
    question: 'WHERE SHOULD NEW CITIZENS LIVE?',
    context: '1,900 citizens are on the district waiting list.',
    problemId: 'housing',
    status: 'open',
    closesIn: '5d 12h',
    voters: 984,
    options: [
      {
        id: 'dense',
        title: 'Compact eco-district',
        blurb: 'Mid-rise timber blocks with shared courtyards and a car-free core.',
        cost: 640,
        votes: 61,
        impacts: [
          { label: 'Housing', value: '+900', tone: 'good' },
          { label: 'Environment', value: '+8', tone: 'good' },
          { label: 'Budget', value: '-640', tone: 'bad' },
        ],
        effect: { happiness: 4, environment: 6 },
      },
      {
        id: 'sprawl',
        title: 'Suburban expansion',
        blurb: 'Low-density housing across the greenbelt with new roads.',
        cost: 380,
        votes: 27,
        impacts: [
          { label: 'Housing', value: '+640', tone: 'good' },
          { label: 'Traffic', value: '+12', tone: 'bad' },
          { label: 'Budget', value: '-380', tone: 'bad' },
        ],
        effect: { happiness: 3, environment: -6, mobility: -4 },
      },
      {
        id: 'wait',
        title: 'Wait and review',
        blurb: 'Pause new permits while a housing strategy is drafted.',
        cost: 0,
        votes: 12,
        impacts: [
          { label: 'Housing', value: '-200', tone: 'bad' },
          { label: 'Happiness', value: '-6', tone: 'bad' },
        ],
        effect: { happiness: -6 },
      },
    ],
  },
  {
    id: 'reservoir',
    question: 'HOW DO WE SECURE THE WATER SUPPLY?',
    context: 'The east reservoir has dropped to 54% capacity.',
    problemId: 'water',
    status: 'open',
    closesIn: '1d 03h',
    voters: 612,
    options: [
      {
        id: 'recycle',
        title: 'Greywater recycling',
        blurb: 'Retrofit the eastern district with closed-loop water reuse.',
        cost: 520,
        votes: 58,
        impacts: [
          { label: 'Water', value: '+14', tone: 'good' },
          { label: 'Budget', value: '-520', tone: 'bad' },
        ],
        effect: { water: 14 },
      },
      {
        id: 'desal',
        title: 'Desalination plant',
        blurb: 'High-output plant on the river delta with heavy energy draw.',
        cost: 900,
        votes: 30,
        impacts: [
          { label: 'Water', value: '+24', tone: 'good' },
          { label: 'Energy', value: '-12', tone: 'bad' },
        ],
        effect: { water: 22, energy: -12 },
      },
      {
        id: 'ration',
        title: 'Voluntary rationing',
        blurb: 'Public campaign asking citizens to reduce use by 15%.',
        cost: 40,
        votes: 12,
        impacts: [
          { label: 'Water', value: '+6', tone: 'good' },
          { label: 'Happiness', value: '-4', tone: 'bad' },
        ],
        effect: { water: 5, happiness: -4 },
      },
    ],
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
  },
]

/* ------------------------------------------------------------
   Sustainability challenges
   ------------------------------------------------------------ */
export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'mobility',
    title: 'Mobility Challenge',
    icon: '🚲',
    brief:
      'Choose walking, cycling or public transport for one journey today.',
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
    icon: '🏘️',
    text: '300 new citizens joined Civitas this week.',
    time: '18m',
    tone: 'blue',
  },
  {
    id: 'f3',
    icon: '🌱',
    text: '486 citizens have accepted the Mobility Challenge.',
    time: '41m',
    tone: 'sage',
  },
  {
    id: 'f4',
    icon: '🏥',
    text: 'Central Hospital reports rising emergency admissions.',
    time: '1h',
    tone: 'pink',
  },
  {
    id: 'f5',
    icon: '💧',
    text: 'East reservoir dropped below 55% capacity.',
    time: '2h',
    tone: 'teal',
  },
  {
    id: 'f6',
    icon: '🌳',
    text: 'Riverfront walkway reopens after replanting.',
    time: '3h',
    tone: 'sage',
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
  INITIATIVE: [
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
  rank: 'Neighbourhood Steward',
  badges: [
    { id: 'first-vote', label: 'First Vote', icon: '🗳️', earned: true },
    { id: 'city-builder', label: 'City Builder', icon: '🏗️', earned: true },
    { id: 'green-commuter', label: 'Green Commuter', icon: '🚲', earned: true },
    { id: 'community-hero', label: 'Community Hero', icon: '🏅', earned: false },
  ],
}
