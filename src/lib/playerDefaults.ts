import type { Player } from './types.js';

/**
 * Creates a new Player object with default attributes.
 * Refactored to comply with the 50-line limit by extracting nested structures.
 */
function initializePlayerObject(position: string): Player {
  return {
    position,
    shirtNumber: 55,
    currentPOS: [320, 15],
    originPOS: [320, 5],
    name: 'string',
    rating: '99',
    skill: getDefaultPlayerSkills(),
    fitness: 50,
    injured: false,
    playerID: -99,
    intentPOS: [0, 0],
    action: '',
    offside: false,
    hasBall: false,
    stats: getDefaultPlayerStats(),
  };
}

/**
 * Returns the default skill set for a new player.
 */
function getDefaultPlayerSkills() {
  return {
    passing: 80,
    shooting: 80,
    tackling: 80,
    saving: 80,
    agility: 80,
    strength: 80,
    penalty_taking: 80,
    jumping: 90,
  };
}

/**
 * Returns the initial empty statistics object for a new player.
 */
function getDefaultPlayerStats() {
  const emptyCounter = { total: 0, on: 0, off: 0, fouls: 0 };

  return {
    goals: 0,
    saves: 0,
    shots: { ...emptyCounter },
    passes: { ...emptyCounter },
    tackles: { ...emptyCounter },
    cards: { yellow: 0, red: 0 },
  };
}

export { initializePlayerObject };
