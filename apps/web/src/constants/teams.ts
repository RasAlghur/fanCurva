// src/constants/teams.ts

export interface Team {
  code: string;
  name: string;
  accent: string;
  secondary: string;
  continent: string;
}

// All 48 FIFA World Cup 2026 Qualified Teams
export const TEAMS: Team[] = [
  // Co-hosts (3 teams)
  {
    code: "CAN",
    name: "Canada",
    accent: "#FF0000",
    secondary: "#FFFFFF",
    continent: "Co-hosts",
  },
  {
    code: "MEX",
    name: "Mexico",
    accent: "#006847",
    secondary: "#CE1126",
    continent: "Co-hosts",
  },
  {
    code: "USA",
    name: "USA",
    accent: "#B22234",
    secondary: "#3C3B6E",
    continent: "Co-hosts",
  },

  // AFC (Asia) - 9 teams
  {
    code: "AUS",
    name: "Australia",
    accent: "#008751",
    secondary: "#FFD700",
    continent: "AFC",
  },
  {
    code: "IRQ",
    name: "Iraq",
    accent: "#CE1126",
    secondary: "#007A3D",
    continent: "AFC",
  },
  {
    code: "IRN",
    name: "IR Iran",
    accent: "#239F40",
    secondary: "#FFFFFF",
    continent: "AFC",
  },
  {
    code: "JPN",
    name: "Japan",
    accent: "#BC002D",
    secondary: "#FFFFFF",
    continent: "AFC",
  },
  {
    code: "JOR",
    name: "Jordan",
    accent: "#CE1126",
    secondary: "#007A3D",
    continent: "AFC",
  },
  {
    code: "KOR",
    name: "Korea Republic",
    accent: "#C60C30",
    secondary: "#003478",
    continent: "AFC",
  },
  {
    code: "QAT",
    name: "Qatar",
    accent: "#8A1538",
    secondary: "#FFFFFF",
    continent: "AFC",
  },
  {
    code: "KSA",
    name: "Saudi Arabia",
    accent: "#006C35",
    secondary: "#FFFFFF",
    continent: "AFC",
  },
  {
    code: "UZB",
    name: "Uzbekistan",
    accent: "#1EB53A",
    secondary: "#0099B5",
    continent: "AFC",
  },

  // CAF (Africa) - 10 teams
  {
    code: "ALG",
    name: "Algeria",
    accent: "#006633",
    secondary: "#FFFFFF",
    continent: "CAF",
  },
  {
    code: "CPV",
    name: "Cabo Verde",
    accent: "#003893",
    secondary: "#FCD116",
    continent: "CAF",
  },
  {
    code: "COD",
    name: "Congo DR",
    accent: "#007FFF",
    secondary: "#CE1126",
    continent: "CAF",
  },
  {
    code: "CIV",
    name: "Côte d'Ivoire",
    accent: "#F77F00",
    secondary: "#FFFFFF",
    continent: "CAF",
  },
  {
    code: "EGY",
    name: "Egypt",
    accent: "#CE1126",
    secondary: "#000000",
    continent: "CAF",
  },
  {
    code: "GHA",
    name: "Ghana",
    accent: "#006B3F",
    secondary: "#FCD116",
    continent: "CAF",
  },
  {
    code: "MAR",
    name: "Morocco",
    accent: "#C1272D",
    secondary: "#006233",
    continent: "CAF",
  },
  {
    code: "SEN",
    name: "Senegal",
    accent: "#00853F",
    secondary: "#FCE302",
    continent: "CAF",
  },
  {
    code: "RSA",
    name: "South Africa",
    accent: "#006B3F",
    secondary: "#FFB81C",
    continent: "CAF",
  },
  {
    code: "TUN",
    name: "Tunisia",
    accent: "#E70013",
    secondary: "#FFFFFF",
    continent: "CAF",
  },

  // CONCACAF (excluding co-hosts) - 3 teams
  {
    code: "CUW",
    name: "Curaçao",
    accent: "#003893",
    secondary: "#FCD116",
    continent: "CONCACAF",
  },
  {
    code: "HAI",
    name: "Haiti",
    accent: "#002B7F",
    secondary: "#D21034",
    continent: "CONCACAF",
  },
  {
    code: "PAN",
    name: "Panama",
    accent: "#D21034",
    secondary: "#00509E",
    continent: "CONCACAF",
  },

  // CONMEBOL (South America) - 6 teams
  {
    code: "ARG",
    name: "Argentina",
    accent: "#74ACDF",
    secondary: "#FFFFFF",
    continent: "CONMEBOL",
  },
  {
    code: "BRA",
    name: "Brazil",
    accent: "#009C3B",
    secondary: "#FFDF00",
    continent: "CONMEBOL",
  },
  {
    code: "COL",
    name: "Colombia",
    accent: "#FCD116",
    secondary: "#003893",
    continent: "CONMEBOL",
  },
  {
    code: "ECU",
    name: "Ecuador",
    accent: "#FFDD00",
    secondary: "#003893",
    continent: "CONMEBOL",
  },
  {
    code: "PAR",
    name: "Paraguay",
    accent: "#003087",
    secondary: "#FFFFFF",
    continent: "CONMEBOL",
  },
  {
    code: "URU",
    name: "Uruguay",
    accent: "#003E7E",
    secondary: "#FCD116",
    continent: "CONMEBOL",
  },

  // OFC (Oceania) - 1 team
  {
    code: "NZL",
    name: "New Zealand",
    accent: "#000000",
    secondary: "#FFFFFF",
    continent: "OFC",
  },

  // UEFA (Europe) - 16 teams
  {
    code: "AUT",
    name: "Austria",
    accent: "#ED2939",
    secondary: "#FFFFFF",
    continent: "UEFA",
  },
  {
    code: "BEL",
    name: "Belgium",
    accent: "#000000",
    secondary: "#F3E300",
    continent: "UEFA",
  },
  {
    code: "BIH",
    name: "Bosnia and Herzegovina",
    accent: "#002395",
    secondary: "#FED100",
    continent: "UEFA",
  },
  {
    code: "CRO",
    name: "Croatia",
    accent: "#D21034",
    secondary: "#FFFFFF",
    continent: "UEFA",
  },
  {
    code: "CZE",
    name: "Czechia",
    accent: "#11457E",
    secondary: "#D7141A",
    continent: "UEFA",
  },
  {
    code: "ENG",
    name: "England",
    accent: "#CF081F",
    secondary: "#FFFFFF",
    continent: "UEFA",
  },
  {
    code: "FRA",
    name: "France",
    accent: "#002395",
    secondary: "#ED2939",
    continent: "UEFA",
  },
  {
    code: "GER",
    name: "Germany",
    accent: "#000000",
    secondary: "#DD0000",
    continent: "UEFA",
  },
  {
    code: "NED",
    name: "Netherlands",
    accent: "#AE1C28",
    secondary: "#21468B",
    continent: "UEFA",
  },
  {
    code: "NOR",
    name: "Norway",
    accent: "#EF2B2D",
    secondary: "#002868",
    continent: "UEFA",
  },
  {
    code: "POR",
    name: "Portugal",
    accent: "#006600",
    secondary: "#FF0000",
    continent: "UEFA",
  },
  {
    code: "SCO",
    name: "Scotland",
    accent: "#005EB8",
    secondary: "#FFFFFF",
    continent: "UEFA",
  },
  {
    code: "ESP",
    name: "Spain",
    accent: "#AA151B",
    secondary: "#F1BF00",
    continent: "UEFA",
  },
  {
    code: "SWE",
    name: "Sweden",
    accent: "#005B99",
    secondary: "#FECC02",
    continent: "UEFA",
  },
  {
    code: "SUI",
    name: "Switzerland",
    accent: "#FF0000",
    secondary: "#FFFFFF",
    continent: "UEFA",
  },
  {
    code: "TUR",
    name: "Türkiye",
    accent: "#E30A17",
    secondary: "#FFFFFF",
    continent: "UEFA",
  },
];

export const CONTINENT_ORDER = [
  "Co-hosts",
  "CONMEBOL",
  "UEFA",
  "CAF",
  "AFC",
  "CONCACAF",
  "OFC",
];

export const TEAMS_BY_CONTINENT = TEAMS.reduce(
  (acc, team) => {
    if (!acc[team.continent]) acc[team.continent] = [];
    acc[team.continent].push(team);
    return acc;
  },
  {} as Record<string, Team[]>,
);

export function getTeamByCode(code: string): Team | undefined {
  return TEAMS.find((team) => team.code === code);
}

export function getTeamByName(name: string): Team | undefined {
  return TEAMS.find((team) => team.name === name);
}

// Add after the existing exports:
export const TEAMS_BY_CODE: Record<string, Team> = TEAMS.reduce(
  (acc, team) => ({ ...acc, [team.code]: team }),
  {} as Record<string, Team>,
);
