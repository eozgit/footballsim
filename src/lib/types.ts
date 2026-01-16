interface MatchDetails {
  matchID: number | string;
  kickOffTeam: Team;
  secondTeam: Team;
  pitchSize: [number, number, number];
  ball: Ball;
  half: number;
  kickOffTeamStatistics: TeamStatistics;
  secondTeamStatistics: TeamStatistics;
  iterationLog: string[];
  endIteration?: boolean;
  ballIntended?: BallPosition;
}

interface Ball {
  position: BallPosition;
  withPlayer: boolean;
  Player: number | string;
  withTeam: number | string;
  direction: string;
  ballOverIterations: Array<BallPosition>;
  lastTouch: LastTouch;
}

interface LastTouch {
  playerName: string;
  playerID: number;
  teamID: number;
}

interface Team {
  name: string;
  description: string;
  primaryColour: string;
  secondaryColour: string;
  awayColour: string;
  rating: number;
  players: Player[];
  intent: string;
  teamID: number;
}

interface Player {
  name: string;
  shirtNumber: number;
  position: string;
  rating: string;
  skill: Skill;
  currentPOS: readonly [number | 'NP', number];
  fitness: number;
  injured: boolean;
  playerID: number;
  originPOS: [number, number];
  intentPOS: [number, number];
  action: string;
  offside: boolean;
  hasBall: boolean;
  stats: Stats;
}

interface Skill {
  passing: number;
  shooting: number;
  tackling: number;
  saving: number;
  agility: number;
  strength: number;
  penalty_taking: number;
  jumping: number;
}

interface Stats {
  goals: number;
  shots: Shots;
  cards: Cards;
  passes: Shots;
  tackles: Shots;
  saves?: number;
}

interface Cards {
  yellow: number;
  red: number;
}

interface Shots {
  total: number;
  on?: number;
  off: number;
  fouls?: number;
}

interface TeamStatistics {
  goals: number;
  shots: Shots | number;
  corners: number;
  freekicks: number;
  penalties: number;
  fouls: number;
}

interface PitchDetails {
  pitchWidth: number;
  pitchHeight: number;
  goalWidth: number;
}

type MatchEventWeights<T = number> = [T, T, T, T, T, T, T, T, T, T, T];

type BallPosition = readonly [x: number, y: number, z?: number];

interface ProximityContext {
  proxPOS: [number, number];
}

type PlayerProximityDetails = ProximityContext & {
  thePlayer?: Player;
  proxToBall?: number;
};
interface MatchContext {
  matchDetails: MatchDetails;
  team: Team;
  opp: Team;
}
interface ActionContext extends MatchContext {
  player: Player;
}
interface BallContext {
  matchDetails: MatchDetails;
  ball: BallPosition; // Consolidated ballX, ballY, and ball state
}
export {
  MatchDetails,
  Ball,
  LastTouch,
  Team,
  Player,
  Skill,
  Stats,
  Cards,
  Shots,
  TeamStatistics,
  PitchDetails,
  MatchEventWeights,
  BallPosition,
  ProximityContext,
  PlayerProximityDetails,
  MatchContext,
  ActionContext,
  BallContext,
};
