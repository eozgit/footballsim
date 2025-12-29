export interface MatchDetails {
  matchID: number | string;
  kickOffTeam: Team;
  secondTeam: Team;
  pitchSize: number[];
  ball: Ball;
  half: number;
  kickOffTeamStatistics: TeamStatistics;
  secondTeamStatistics: TeamStatistics;
  iterationLog: string[];
}

export interface Ball {
  position: number[];
  withPlayer: boolean;
  Player: number | string;
  withTeam: number | string;
  direction: string;
  ballOverIterations: Array<number[]>;
  lastTouch: LastTouch | string;
}

export interface LastTouch {
  playerName: string;
  playerID: number;
  teamID: number;
}

export interface Team {
  name: string;
  rating: number;
  players: Player[];
  intent: string;
  teamID: number | string;
}

export interface Player {
  name: string;
  position: Position | string;
  rating: string;
  skill: Skill;
  currentPOS: number[];
  fitness: number;
  injured: boolean;
  playerID: number | string;
  originPOS: number[];
  intentPOS: Array<number | null | number[]>;
  action: string;
  offside: boolean;
  hasBall: boolean;
  stats: Stats;
}

// Keeping this Enum is actually good—it validates soccer positions
export enum Position {
  CM = "CM",
  Cb = "CB",
  Gk = "GK",
  LB = "LB",
  LM = "LM",
  Rb = "RB",
  Rm = "RM",
  St = "ST",
}

export interface Skill {
  passing: string; shooting: string; tackling: string; saving: string;
  agility: string; strength: string; penalty_taking: string; jumping: string;
}

export interface Stats {
  goals: number;
  shots: Shots;
  cards: Cards;
  passes: Shots;
  tackles: Shots;
  saves?: number;
}

export interface Cards { yellow: number; red: number; }

export interface Shots {
  total: number;
  on?: number;
  off: number;
  fouls?: number;
}

export interface TeamStatistics {
  goals: number;
  shots: Shots | number;
  corners: number;
  freekicks: number;
  penalties: number;
  fouls: number;
}
