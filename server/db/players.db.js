/**
 * Database service for player-related operations
 */

const { assignRoles } = require("../utils/helpers");

const players = [];

/**
 * Get all players
 * @returns {Array} Array of player objects
 */
const getAllPlayers = () => {
  return players;
};

/**
 * Add a new player
 * @param {string} nickname - Player's nickname
 * @param {string} socketId - Player's socket ID
 * @returns {Object} The created player
 */
const addPlayer = (nickname, socketId) => {
  const newPlayer = { 
    id: socketId, 
    nickname,
    score: 0,
    role: null
  };
  players.push(newPlayer);
  return newPlayer;
};

/**
 * Find a player by their socket ID
 * @param {string} socketId - Player's socket ID
 * @returns {Object|null} Player object or null if not found
 */
const findPlayerById = (socketId) => {
  return players.find((player) => player.id === socketId) || null;
};

/**
 * Find players by role
 * @param {string|Array} role - Role or array of roles to find
 * @returns {Array} Array of players with the specified role(s)
 */
const findPlayersByRole = (role) => {
  if (Array.isArray(role)) {
    return players.filter((player) => role.includes(player.role));
  }
  return players.filter((player) => player.role === role);
};

/**
 * Assign roles to all players
 * @returns {Array} Array of players with assigned roles
 */
const assignPlayerRoles = () => {
  const playersWithRoles = assignRoles(players);
  // Update the players array with the new values
  players.splice(0, players.length, ...playersWithRoles);
  return players;
};

/**
 * Update player score
 * @param {string} playerId - Player's socket ID
 * @param {number} points - Points to add (can be negative)
 * @returns {Object|null} Updated player or null if not found
 */
const updatePlayerScore = (playerId, points) => {
  const player = findPlayerById(playerId);
  if (player) {
    player.score += points;
    return player;
  }
  return null;
};

/**
 * Check if any player has won (score >= 100)
 * @returns {Object|null} Winner player or null if no winner
 */
const checkWinner = () => {
  const winner = players.find(player => player.score >= 100);
  return winner || null;
};

/**
 * Get all game data (includes players)
 * @returns {Object} Object containing players array
 */
const getGameData = () => {
  return { players };
};

/**
 * Reset game data
 * @returns {void}
 */
const resetGame = () => {
  players.forEach(player => {
    player.score = 0;
    player.role = null;
  });
};

module.exports = {
  getAllPlayers,
  addPlayer,
  findPlayerById,
  assignPlayerRoles,
  findPlayersByRole,
  updatePlayerScore,
  checkWinner,
  getGameData,
  resetGame,
};
