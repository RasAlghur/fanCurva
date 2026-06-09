const fs = require('fs')
const path = require('path')

const outputDir = path.join('packages', 'config', 'src')
fs.mkdirSync(outputDir, { recursive: true })

const safeText = (value, width = 0) => String(value ?? '').padEnd(width)

// ── TEAM DATA ─────────────────────────────────────────────────────────────────
const teams = [
  // GROUP A
  { code: "MEX", name: "Mexico",                group: "A", flag: "🇲🇽", primary: "006847", secondary: "CE1126", accent: "FFFFFF" },
  { code: "KOR", name: "South Korea",           group: "A", flag: "🇰🇷", primary: "CD2E3A", secondary: "003478", accent: "FFFFFF" },
  { code: "RSA", name: "South Africa",          group: "A", flag: "🇿🇦", primary: "007A4D", secondary: "FFB81C", accent: "FFFFFF" },
  { code: "CZE", name: "Czechia",               group: "A", flag: "🇨🇿", primary: "D7141A", secondary: "11457E", accent: "FFFFFF" },

  // GROUP B
  { code: "CAN", name: "Canada",                group: "B", flag: "🇨🇦", primary: "FF0000", secondary: "FFFFFF", accent: "FF0000" },
  { code: "SUI", name: "Switzerland",           group: "B", flag: "🇨🇭", primary: "D52B1E", secondary: "FFFFFF", accent: "D52B1E" },
  { code: "QAT", name: "Qatar",                 group: "B", flag: "🇶🇦", primary: "8D1B3D", secondary: "FFFFFF", accent: "8D1B3D" },
  { code: "BIH", name: "Bosnia and Herzegovina",group: "B", flag: "🇧🇦", primary: "002395", secondary: "FFCD00", accent: "FFFFFF" },

  // GROUP C
  { code: "BRA", name: "Brazil",                group: "C", flag: "🇧🇷", primary: "009C3B", secondary: "FFDF00", accent: "002776" },
  { code: "MAR", name: "Morocco",               group: "C", flag: "🇲🇦", primary: "C1272D", secondary: "006233", accent: "FFFFFF" },
  { code: "SCO", name: "Scotland",              group: "C", flag: "🏴", primary: "005EB8", secondary: "FFFFFF", accent: "005EB8" },
  { code: "HAI", name: "Haiti",                 group: "C", flag: "🇭🇹", primary: "00209F", secondary: "D21034", accent: "FFFFFF" },

  // GROUP D
  { code: "USA", name: "United States",         group: "D", flag: "🇺🇸", primary: "B22234", secondary: "3C3B6E", accent: "FFFFFF" },
  { code: "AUS", name: "Australia",             group: "D", flag: "🇦🇺", primary: "00008B", secondary: "FFCD00", accent: "FFFFFF" },
  { code: "PAR", name: "Paraguay",              group: "D", flag: "🇵🇾", primary: "D52B1E", secondary: "002868", accent: "FFFFFF" },
  { code: "TUR", name: "Türkiye",               group: "D", flag: "🇹🇷", primary: "E30A17", secondary: "FFFFFF", accent: "E30A17" },

  // GROUP E
  { code: "GER", name: "Germany",               group: "E", flag: "🇩🇪", primary: "000000", secondary: "DD0000", accent: "FFCE00" },
  { code: "ECU", name: "Ecuador",               group: "E", flag: "🇪🇨", primary: "FFD100", secondary: "007934", accent: "003087" },
  { code: "CIV", name: "Ivory Coast",           group: "E", flag: "🇨🇮", primary: "F77F00", secondary: "009A44", accent: "FFFFFF" },
  { code: "CUW", name: "Curaçao",               group: "E", flag: "🇨🇼", primary: "003DA5", secondary: "F9E716", accent: "FFFFFF" },

  // GROUP F
  { code: "NED", name: "Netherlands",           group: "F", flag: "🇳🇱", primary: "FF6600", secondary: "FFFFFF", accent: "003DA5" },
  { code: "JPN", name: "Japan",                 group: "F", flag: "🇯🇵", primary: "BC002D", secondary: "FFFFFF", accent: "BC002D" },
  { code: "SWE", name: "Sweden",                group: "F", flag: "🇸🇪", primary: "006AA7", secondary: "FECC02", accent: "006AA7" },
  { code: "TUN", name: "Tunisia",               group: "F", flag: "🇹🇳", primary: "E70013", secondary: "FFFFFF", accent: "E70013" },

  // GROUP G
  { code: "BEL", name: "Belgium",               group: "G", flag: "🇧🇪", primary: "EF3340", secondary: "000000", accent: "F4E20D" },
  { code: "IRN", name: "Iran",                  group: "G", flag: "🇮🇷", primary: "239F40", secondary: "FFFFFF", accent: "DA0000" },
  { code: "EGY", name: "Egypt",                 group: "G", flag: "🇪🇬", primary: "CE1126", secondary: "FFFFFF", accent: "000000" },
  { code: "NZL", name: "New Zealand",           group: "G", flag: "🇳🇿", primary: "00247D", secondary: "CC142B", accent: "FFFFFF" },

  // GROUP H
  { code: "ESP", name: "Spain",                 group: "H", flag: "🇪🇸", primary: "AA151B", secondary: "F1BF00", accent: "FFFFFF" },
  { code: "URU", name: "Uruguay",               group: "H", flag: "🇺🇾", primary: "5EB6E4", secondary: "FFFFFF", accent: "5EB6E4" },
  { code: "KSA", name: "Saudi Arabia",          group: "H", flag: "🇸🇦", primary: "006C35", secondary: "FFFFFF", accent: "006C35" },
  { code: "CPV", name: "Cape Verde",            group: "H", flag: "🇨🇻", primary: "003893", secondary: "CF2027", accent: "F7D116" },

  // GROUP I
  { code: "FRA", name: "France",                group: "I", flag: "🇫🇷", primary: "002395", secondary: "ED2939", accent: "FFFFFF" },
  { code: "SEN", name: "Senegal",               group: "I", flag: "🇸🇳", primary: "00853F", secondary: "FDEF42", accent: "E31B23" },
  { code: "NOR", name: "Norway",                group: "I", flag: "🇳🇴", primary: "EF2B2D", secondary: "FFFFFF", accent: "002868" },
  { code: "IRQ", name: "Iraq",                  group: "I", flag: "🇮🇶", primary: "CE1126", secondary: "007A3D", accent: "FFFFFF" },

  // GROUP J
  { code: "ARG", name: "Argentina",             group: "J", flag: "🇦🇷", primary: "74ACDF", secondary: "FFFFFF", accent: "74ACDF" },
  { code: "AUT", name: "Austria",               group: "J", flag: "🇦🇹", primary: "ED2939", secondary: "FFFFFF", accent: "ED2939" },
  { code: "ALG", name: "Algeria",               group: "J", flag: "🇩🇿", primary: "006233", secondary: "FFFFFF", accent: "D21034" },
  { code: "JOR", name: "Jordan",                group: "J", flag: "🇯🇴", primary: "007A3D", secondary: "CE1126", accent: "FFFFFF" },

  // GROUP K
  { code: "POR", name: "Portugal",              group: "K", flag: "🇵🇹", primary: "006600", secondary: "FF0000", accent: "FFFFFF" },
  { code: "COL", name: "Colombia",              group: "K", flag: "🇨🇴", primary: "FCD116", secondary: "003087", accent: "CE1126" },
  { code: "UZB", name: "Uzbekistan",            group: "K", flag: "🇺🇿", primary: "1EB53A", secondary: "FFFFFF", accent: "CE1126" },
  { code: "COD", name: "DR Congo",              group: "K", flag: "🇨🇩", primary: "007FFF", secondary: "F7D618", accent: "CE1126" },

  // GROUP L
  { code: "ENG", name: "England",               group: "L", flag: "🏴", primary: "CF081F", secondary: "FFFFFF", accent: "CF081F" },
  { code: "CRO", name: "Croatia",               group: "L", flag: "🇭🇷", primary: "FF0000", secondary: "FFFFFF", accent: "171796" },
  { code: "GHA", name: "Ghana",                 group: "L", flag: "🇬🇭", primary: "006B3F", secondary: "FCD116", accent: "EF3340" },
  { code: "PAN", name: "Panama",                group: "L", flag: "🇵🇦", primary: "DA121A", secondary: "FFFFFF", accent: "005293" },
]

// ── BADGE DEFINITIONS PER TEAM ────────────────────────────────────────────────
function generateTeamBadges(team) {
  return [
    {
      badge_id: `badge_team_${team.code.toLowerCase()}`,
      name: `${team.name} Team Badge`,
      description: `Official team badge for ${team.name} fans. Earned when you select ${team.name} as your team and mint your passport.`,
      badge_type: "team",
      is_soulbound: true,
      rarity: 1,
      team_code: team.code,
      group: team.group,
      primary_color: team.primary,
      secondary_color: team.secondary,
      available_from: "2026-06-01T00:00:00Z",
      available_until: null,
      max_supply: null,
      how_to_earn: "Select this team during passport creation",
      icon: team.flag,
    },
  ]
}

// ── MATCH-DAY BADGES ──────────────────────────────────────────────────────────
// Sample — full schedule would have all 104 matches
const matchDayBadges = [
  { match_id: "m001", home: "MEX", away: "KOR", group: "A", date: "2026-06-11", venue: "SoFi Stadium, Los Angeles" },
  { match_id: "m002", home: "BRA", away: "MAR", group: "C", date: "2026-06-12", venue: "AT&T Stadium, Dallas" },
  { match_id: "m003", home: "USA", away: "PAR", group: "D", date: "2026-06-12", venue: "MetLife Stadium, New York" },
  { match_id: "m004", home: "ARG", away: "ALG", group: "J", date: "2026-06-13", venue: "Hard Rock Stadium, Miami" },
  { match_id: "m005", home: "ENG", away: "CRO", group: "L", date: "2026-06-13", venue: "Empower Field, Denver" },
  { match_id: "m006", home: "FRA", away: "SEN", group: "I", date: "2026-06-14", venue: "Gillette Stadium, Boston" },
  { match_id: "m007", home: "GER", away: "ECU", group: "E", date: "2026-06-14", venue: "Lumen Field, Seattle" },
  { match_id: "m008", home: "ESP", away: "URU", group: "H", date: "2026-06-15", venue: "Arrowhead Stadium, Kansas City" },
].map(m => ({
  badge_id: `badge_match_${m.match_id}`,
  name: `${m.home} vs ${m.away} — Match Day`,
  description: `Earned for checking in during the ${m.home} vs ${m.away} Group ${m.group} match on ${m.date}.`,
  badge_type: "match_day",
  is_soulbound: true,
  rarity: 1,
  match_id: m.match_id,
  match_date: m.date,
  venue: m.venue,
  home_team: m.home,
  away_team: m.away,
  group: m.group,
  primary_color: "4A9EFF",
  available_from: `${m.date}T00:00:00Z`,
  available_until: `${m.date}T23:59:59Z`,
  max_supply: null,
  how_to_earn: `Check in during the live match on ${m.date}`,
}))

// ── CITY BADGES ───────────────────────────────────────────────────────────────
const cityBadges = [
  {
    badge_id: "badge_city_usa",
    name: "USA Host City Badge",
    description: "Earned for engaging with US host city content and campaigns during the 2026 World Cup.",
    badge_type: "city",
    is_soulbound: true,
    rarity: 1,
    country: "USA",
    primary_color: "B22234",
    secondary_color: "3C3B6E",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Complete 3 USA host city quests",
    venues: ["MetLife Stadium NY", "SoFi Stadium LA", "AT&T Stadium Dallas", "Lumen Field Seattle", "Empower Field Denver", "Gillette Stadium Boston", "Arrowhead Stadium Kansas City", "Allegiant Stadium Las Vegas", "Lincoln Financial Field Philadelphia", "NRG Stadium Houston"],
  },
  {
    badge_id: "badge_city_canada",
    name: "Canada Host City Badge",
    description: "Earned for engaging with Canadian host city content and campaigns during the 2026 World Cup.",
    badge_type: "city",
    is_soulbound: true,
    rarity: 1,
    country: "Canada",
    primary_color: "FF0000",
    secondary_color: "FFFFFF",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Complete 3 Canada host city quests",
    venues: ["BC Place, Vancouver", "BMO Field, Toronto"],
  },
  {
    badge_id: "badge_city_mexico",
    name: "Mexico Host City Badge",
    description: "Earned for engaging with Mexican host city content and campaigns during the 2026 World Cup.",
    badge_type: "city",
    is_soulbound: true,
    rarity: 1,
    country: "Mexico",
    primary_color: "006847",
    secondary_color: "CE1126",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Complete 3 Mexico host city quests",
    venues: ["Estadio Azteca, Mexico City", "Estadio BBVA, Monterrey", "Estadio Akron, Guadalajara"],
  },
]

// ── KNOCKOUT BADGES ───────────────────────────────────────────────────────────
const knockoutBadges = [
  {
    badge_id: "badge_round_of_32",
    name: "Round of 32",
    description: "Earned for checking in during a Round of 32 knockout match.",
    badge_type: "knockout",
    stage: "Round of 32",
    is_soulbound: true,
    rarity: 2,
    primary_color: "4A9EFF",
    available_from: "2026-06-28T00:00:00Z",
    available_until: "2026-07-01T23:59:59Z",
    max_supply: null,
    how_to_earn: "Check in during any Round of 32 match",
  },
  {
    badge_id: "badge_round_of_16",
    name: "Round of 16",
    description: "Earned for checking in during a Round of 16 knockout match.",
    badge_type: "knockout",
    stage: "Round of 16",
    is_soulbound: true,
    rarity: 2,
    primary_color: "4A9EFF",
    available_from: "2026-07-02T00:00:00Z",
    available_until: "2026-07-05T23:59:59Z",
    max_supply: null,
    how_to_earn: "Check in during any Round of 16 match",
  },
  {
    badge_id: "badge_quarter_final",
    name: "Quarter Final",
    description: "Earned for checking in during a Quarter Final match.",
    badge_type: "knockout",
    stage: "Quarter Final",
    is_soulbound: true,
    rarity: 2,
    primary_color: "C084FC",
    available_from: "2026-07-08T00:00:00Z",
    available_until: "2026-07-09T23:59:59Z",
    max_supply: null,
    how_to_earn: "Check in during any Quarter Final match",
  },
  {
    badge_id: "badge_semi_final",
    name: "Semi Final",
    description: "Earned for checking in during a Semi Final match.",
    badge_type: "knockout",
    stage: "Semi Final",
    is_soulbound: true,
    rarity: 3,
    primary_color: "C084FC",
    available_from: "2026-07-14T00:00:00Z",
    available_until: "2026-07-15T23:59:59Z",
    max_supply: null,
    how_to_earn: "Check in during either Semi Final match",
  },
  {
    badge_id: "badge_third_place",
    name: "Third Place Match",
    description: "Earned for checking in during the Third Place match.",
    badge_type: "knockout",
    stage: "Third Place",
    is_soulbound: true,
    rarity: 2,
    primary_color: "CD7F32",
    available_from: "2026-07-18T00:00:00Z",
    available_until: "2026-07-18T23:59:59Z",
    max_supply: null,
    how_to_earn: "Check in during the Third Place match on July 18",
  },
  {
    badge_id: "badge_finals",
    name: "Finals Badge",
    description: "Earned for checking in during the World Cup Final. One of the rarest badges of the tournament.",
    badge_type: "knockout",
    stage: "Final",
    is_soulbound: true,
    rarity: 3,
    primary_color: "FFD700",
    available_from: "2026-07-19T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Check in during the World Cup Final on July 19",
  },
  {
    badge_id: "badge_champion",
    name: "Champion",
    description: "The rarest badge of the 2026 World Cup. Awarded exclusively to fans whose team wins the tournament.",
    badge_type: "champion",
    stage: "Champion",
    is_soulbound: true,
    rarity: 4,
    primary_color: "FFD700",
    available_from: "2026-07-19T00:00:00Z",
    available_until: "2026-07-20T23:59:59Z",
    max_supply: null,
    how_to_earn: "Support the winning team throughout the tournament",
  },
]

// ── PARTICIPATION BADGES ──────────────────────────────────────────────────────
const participationBadges = [
  {
    badge_id: "badge_starter",
    name: "First Step",
    description: "Awarded for completing your very first quest on FanCurva.",
    badge_type: "starter",
    is_soulbound: true,
    rarity: 1,
    primary_color: "1D9E75",
    available_from: "2026-06-01T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Complete your first quest",
  },
  {
    badge_id: "badge_neutral_fan",
    name: "Neutral Fan",
    description: "Your team has been eliminated but your passion remains. Awarded when neutral fan mode activates.",
    badge_type: "neutral_fan",
    is_soulbound: true,
    rarity: 1,
    primary_color: "888780",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Automatically awarded when your team is eliminated from the tournament",
  },
  {
    badge_id: "badge_watch_party",
    name: "Watch Party",
    description: "Earned for attending or hosting a registered FanCurva watch party.",
    badge_type: "watch_party",
    is_soulbound: true,
    rarity: 1,
    primary_color: "1D9E75",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Attend or host a registered watch party",
  },
  {
    badge_id: "badge_watch_party_host",
    name: "Watch Party Host",
    description: "Earned for hosting your own FanCurva watch party event.",
    badge_type: "watch_party",
    is_soulbound: true,
    rarity: 1,
    primary_color: "085041",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Register and host a watch party",
  },
  {
    badge_id: "badge_trivia_streak_5",
    name: "Trivia Streak x5",
    description: "Earned for answering 5 consecutive trivia questions correctly.",
    badge_type: "trivia_streak",
    is_soulbound: true,
    rarity: 1,
    streak: 5,
    primary_color: "4A9EFF",
    available_from: "2026-06-11T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Answer 5 trivia questions correctly in a row",
  },
  {
    badge_id: "badge_trivia_streak_10",
    name: "Trivia Streak x10",
    description: "Earned for answering 10 consecutive trivia questions correctly. A true football scholar.",
    badge_type: "trivia_streak",
    is_soulbound: true,
    rarity: 2,
    streak: 10,
    primary_color: "C084FC",
    available_from: "2026-06-11T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Answer 10 trivia questions correctly in a row",
  },
  {
    badge_id: "badge_trivia_streak_20",
    name: "Trivia Streak x20",
    description: "Answer 20 consecutive trivia questions correctly. Legendary football knowledge.",
    badge_type: "trivia_streak",
    is_soulbound: true,
    rarity: 3,
    streak: 20,
    primary_color: "FFD700",
    available_from: "2026-06-11T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Answer 20 trivia questions correctly in a row",
  },
  {
    badge_id: "badge_referral_1",
    name: "Referral — 1 Friend",
    description: "Earned for successfully referring your first friend to FanCurva.",
    badge_type: "referral",
    is_soulbound: true,
    rarity: 1,
    referral_count: 1,
    primary_color: "9FE1CB",
    available_from: "2026-06-01T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Invite 1 friend who signs up and completes their first quest",
  },
  {
    badge_id: "badge_referral_5",
    name: "Referral — 5 Friends",
    description: "Earned for referring 5 active friends to FanCurva.",
    badge_type: "referral",
    is_soulbound: true,
    rarity: 2,
    referral_count: 5,
    primary_color: "1D9E75",
    available_from: "2026-06-01T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Invite 5 friends who each complete their first quest",
  },
  {
    badge_id: "badge_referral_10",
    name: "Referral — 10 Friends",
    description: "A true FanCurva ambassador. Earned for referring 10 active fans.",
    badge_type: "referral",
    is_soulbound: true,
    rarity: 3,
    referral_count: 10,
    primary_color: "085041",
    available_from: "2026-06-01T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Invite 10 friends who each complete their first quest",
  },
  {
    badge_id: "badge_legend_tier",
    name: "Legend",
    description: "Awarded when you reach the Legend status tier — 3,500+ points. The elite of FanCurva.",
    badge_type: "legend",
    is_soulbound: true,
    rarity: 3,
    primary_color: "FFD700",
    available_from: "2026-06-01T00:00:00Z",
    available_until: null,
    max_supply: null,
    how_to_earn: "Earn 3,500 or more points during the tournament",
  },
  {
    badge_id: "badge_finals_week",
    name: "Finals Week",
    description: "Earned for active participation during the final week of the World Cup (July 14-19).",
    badge_type: "finals",
    is_soulbound: true,
    rarity: 2,
    primary_color: "FFD700",
    available_from: "2026-07-14T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Complete at least 3 quests during finals week (July 14-19)",
  },
  {
    badge_id: "badge_early_adopter",
    name: "Early Adopter",
    description: "Awarded to fans who joined FanCurva before the tournament began. A mark of being there from the start.",
    badge_type: "commemorative",
    is_soulbound: true,
    rarity: 2,
    primary_color: "1D9E75",
    available_from: "2026-05-01T00:00:00Z",
    available_until: "2026-06-10T23:59:59Z",
    max_supply: 10000,
    how_to_earn: "Sign up and mint your passport before June 11, 2026",
  },
  {
    badge_id: "badge_perfect_group_stage",
    name: "Perfect Group Stage",
    description: "Earned for checking in to every single group stage match — all 72 games.",
    badge_type: "commemorative",
    is_soulbound: true,
    rarity: 3,
    primary_color: "C084FC",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-06-28T23:59:59Z",
    max_supply: null,
    how_to_earn: "Check in during all 72 group stage matches",
  },
  {
    badge_id: "badge_reaction_king",
    name: "Reaction King",
    description: "Posted a match reaction after 10 or more matches.",
    badge_type: "commemorative",
    is_soulbound: true,
    rarity: 2,
    primary_color: "F97316",
    available_from: "2026-06-11T00:00:00Z",
    available_until: "2026-07-19T23:59:59Z",
    max_supply: null,
    how_to_earn: "Post a match reaction after 10 or more matches",
  },
]

// ── ASSEMBLE ALL DATA ─────────────────────────────────────────────────────────
const allTeamBadges = teams.flatMap(generateTeamBadges)

const allBadges = [
  ...participationBadges,
  ...allTeamBadges,
  ...matchDayBadges,
  ...cityBadges,
  ...knockoutBadges,
]

// ── SUMMARY STATS ─────────────────────────────────────────────────────────────
const summary = {
  total_badges: allBadges.length,
  by_type: {},
  by_rarity: { 1: 0, 2: 0, 3: 0, 4: 0 },
  teams_count: teams.length,
  groups: ["A","B","C","D","E","F","G","H","I","J","K","L"],
}
allBadges.forEach(b => {
  summary.by_type[b.badge_type] = (summary.by_type[b.badge_type] || 0) + 1
  if (b.rarity) summary.by_rarity[b.rarity]++
})

// ── WRITE OUTPUT FILES ────────────────────────────────────────────────────────

// 1. Full badge data as JSON
fs.writeFileSync(
  path.join(outputDir, 'badges.json'),
  JSON.stringify({ summary, teams, badges: allBadges }, null, 2)
)
console.log('Written: packages/config/src/badges.json')

// 2. Teams config TypeScript file
const teamsTS = `// FanCurva — 2026 World Cup Teams
// Auto-generated — do not edit manually
// Source: scripts/generate-team-badges.js

export interface Team {
  code: string
  name: string
  group: string
  flag: string
  primary: string
  secondary: string
  accent: string
}

export const TEAMS: Team[] = ${JSON.stringify(teams, null, 2)}

export const TEAMS_BY_CODE: Record<string, Team> = Object.fromEntries(
  TEAMS.map(t => [t.code, t])
)

export const TEAMS_BY_GROUP: Record<string, Team[]> = TEAMS.reduce((acc, t) => {
  if (!acc[t.group]) acc[t.group] = []
  acc[t.group].push(t)
  return acc
}, {} as Record<string, Team[]>)

export const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
`
fs.writeFileSync(path.join(outputDir, 'teams.ts'), teamsTS)
console.log('Written: packages/config/src/teams.ts')

// 3. Badges config TypeScript file
const badgesTS = `// FanCurva — Badge Definitions
// Auto-generated — do not edit manually

export interface BadgeDefinition {
  badge_id: string
  name: string
  description: string
  badge_type: string
  is_soulbound: boolean
  rarity: number
  primary_color: string
  available_from: string
  available_until: string | null
  max_supply: number | null
  how_to_earn: string
  [key: string]: any
}

export const BADGES: BadgeDefinition[] = ${JSON.stringify(allBadges, null, 2)}

export const BADGES_BY_ID: Record<string, BadgeDefinition> = Object.fromEntries(
  BADGES.map(b => [b.badge_id, b])
)

export const BADGES_BY_TYPE: Record<string, BadgeDefinition[]> = BADGES.reduce((acc, b) => {
  if (!acc[b.badge_type]) acc[b.badge_type] = []
  acc[b.badge_type].push(b)
  return acc
}, {} as Record<string, BadgeDefinition[]>)

export const RARITY_LABELS: Record<number, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Legendary',
}
`
fs.writeFileSync(path.join(outputDir, 'badges.ts'), badgesTS)
console.log('Written: packages/config/src/badges.ts')

// 4. Human-readable summary text file
let summaryText = `FANCURVA — BADGE AND TEAM REFERENCE
World Cup 2026
Generated: ${new Date().toISOString()}
${'='.repeat(80)}

SUMMARY
-------
Total badges defined : ${allBadges.length}
Total teams          : ${teams.length}
Groups               : A through L (12 groups)

BADGES BY TYPE
--------------
`
Object.entries(summary.by_type).sort((a,b) => b[1]-a[1]).forEach(([type, count]) => {
  summaryText += `  ${safeText(type, 25)} ${count}\n`
})

summaryText += `
BADGES BY RARITY
----------------
  Common (1 star)     : ${summary.by_rarity[1]}
  Uncommon (2 stars)  : ${summary.by_rarity[2]}
  Rare (3 stars)      : ${summary.by_rarity[3]}
  Legendary (4 stars) : ${summary.by_rarity[4]}

${'='.repeat(80)}
TEAMS BY GROUP
${'='.repeat(80)}
`

const groups = {}
teams.forEach(t => {
  if (!groups[t.group]) groups[t.group] = []
  groups[t.group].push(t)
})

Object.keys(groups).sort().forEach(g => {
  summaryText += `\nGROUP ${g}\n${'─'.repeat(40)}\n`
  groups[g].forEach(t => {
    summaryText += `  ${t.flag}  ${safeText(t.code, 5)} ${safeText(t.name, 30)} #${t.primary}\n`
  })
})

summaryText += `\n${'='.repeat(80)}\n`
summaryText += `PARTICIPATION BADGES (${participationBadges.length} total)\n${'='.repeat(80)}\n`
participationBadges.forEach(b => {
  summaryText += `\n  ${b.badge_id}\n`
  summaryText += `  Name     : ${b.name}\n`
  summaryText += `  Type     : ${b.badge_type}\n`
  summaryText += `  Rarity   : ${'★'.repeat(b.rarity)}${'☆'.repeat(4-b.rarity)} (${['','Common','Uncommon','Rare','Legendary'][b.rarity]})\n`
  summaryText += `  Earn     : ${b.how_to_earn}\n`
  summaryText += `  Soulbound: ${b.is_soulbound ? 'Yes' : 'No'}\n`
  summaryText += `  Supply   : ${b.max_supply || 'Unlimited'}\n`
})

summaryText += `\n${'='.repeat(80)}\n`
summaryText += `TEAM BADGES (${allTeamBadges.length} total — one per team)\n${'='.repeat(80)}\n`
allTeamBadges.forEach(b => {
  summaryText += `  ${b.icon || ''}  ${safeText(b.team_code, 5)} ${safeText(b.name, 35)} Group ${b.group}  #${b.primary_color}\n`
})

summaryText += `\n${'='.repeat(80)}\n`
summaryText += `KNOCKOUT STAGE BADGES (${knockoutBadges.length} total)\n${'='.repeat(80)}\n`
knockoutBadges.forEach(b => {
  summaryText += `\n  ${b.badge_id}\n`
  summaryText += `  Name     : ${b.name}\n`
  summaryText += `  Stage    : ${b.stage}\n`
  summaryText += `  Rarity   : ${'★'.repeat(b.rarity)}${'☆'.repeat(4-b.rarity)}\n`
  summaryText += `  Dates    : ${b.available_from} to ${b.available_until || 'open'}\n`
  summaryText += `  Earn     : ${b.how_to_earn}\n`
})

summaryText += `\n${'='.repeat(80)}\n`
summaryText += `CITY BADGES (${cityBadges.length} total)\n${'='.repeat(80)}\n`
cityBadges.forEach(b => {
  summaryText += `\n  ${b.badge_id}\n`
  summaryText += `  Country  : ${b.country}\n`
  summaryText += `  Earn     : ${b.how_to_earn}\n`
  summaryText += `  Venues   : ${b.venues ? b.venues.join(', ') : 'N/A'}\n`
})

summaryText += `\n${'='.repeat(80)}\n`
summaryText += `MATCH-DAY BADGES (${matchDayBadges.length} sample — full schedule = 104 badges)\n${'='.repeat(80)}\n`
matchDayBadges.forEach(b => {
  summaryText += `  ${safeText(b.match_id, 8)} ${safeText(b.home)} vs ${safeText(b.away, 8)} ${safeText(b.match_date)}  ${safeText(b.venue)}\n`
})
summaryText += `\n  Note: The full tournament has 104 matches = 104 unique match-day badges.\n`
summaryText += `  Generate the full match schedule separately and add to matchDayBadges array.\n`

summaryText += `\n${'='.repeat(80)}\nEND OF BADGE REFERENCE\n${'='.repeat(80)}\n`

fs.writeFileSync('FanCurva_BadgeReference.txt', summaryText)
console.log('Written: FanCurva_BadgeReference.txt')

console.log('\n' + '='.repeat(60))
console.log('BADGE GENERATION COMPLETE')
console.log('='.repeat(60))
console.log(`Teams          : ${teams.length}`)
console.log(`Total badges   : ${allBadges.length}`)
console.log('  - Participation badges  :', participationBadges.length)
console.log('  - Team badges           :', allTeamBadges.length)
console.log('  - Match-day badges      :', matchDayBadges.length, '(sample — full = 104)')
console.log('  - City badges           :', cityBadges.length)
console.log('  - Knockout badges       :', knockoutBadges.length)
console.log('\nFiles written:')
console.log('  packages/config/src/badges.json  — full data')
console.log('  packages/config/src/teams.ts     — TypeScript team config')
console.log('  packages/config/src/badges.ts    — TypeScript badge config')
console.log('  FanCurva_BadgeReference.txt       — human-readable reference')