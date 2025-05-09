import { navigateTo, socket } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen1" class="results-container">
        <h2>Jugadores Activos</h2>
        <div id="players-list" class="players-list">
          <div class="loading">Cargando jugadores...</div>
        </div>
      </div>
    `;

  const playersList = document.getElementById("players-list");


  // Escuchar actualizaciones de jugadores
  socket.on("players-update", (players) => {
    console.log("Recibida actualización de jugadores:", players);
    if (Array.isArray(players) && players.length > 0) {
      updatePlayersList(players);
    } else {
      playersList.innerHTML = '<div class="no-players">No hay jugadores activos</div>';
    }
  });

  // Escuchar cuando un nuevo jugador se une
  socket.on("userJoined", (data) => {
    console.log("Nuevo jugador unido:", data);
    if (data.players && Array.isArray(data.players)) {
      updatePlayersList(data.players);
    }
  });

  function updatePlayersList(players) {
    if (!Array.isArray(players)) {
      console.error("players no es un array:", players);
      return;
    }

    const sortedPlayers = players.sort((a, b) => b.score - a.score);
    playersList.innerHTML = sortedPlayers
      .map((player, index) => `
        <div class="player-item">
          <span class="player-position">${index + 1}.</span>
          <span class="player-name">${player.nickname}</span>
          <span class="player-score">${player.score} pts</span>
          <span class="player-role">${player.role || 'Sin rol'}</span>
        </div>
      `)
      .join("");

    // Verificar si algún jugador alcanzó 100 puntos
    const hasWinner = sortedPlayers.some(player => player.score >= 100);
    if (hasWinner) {
      navigateTo("/screen2", { players: sortedPlayers });
    }
  }

  // Solicitar datos iniciales
  console.log("Solicitando datos iniciales de jugadores...");
  socket.emit("get-players");

  // También solicitar datos cuando el socket se reconecte
  socket.on("connect", () => {
    console.log("Socket reconectado, solicitando datos...");
    socket.emit("get-players");
  });
}
