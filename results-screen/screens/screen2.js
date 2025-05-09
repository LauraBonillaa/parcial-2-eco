import { navigateTo, socket } from "../app.js";

export default function renderScreen2(data) {
  // Limpiar listeners anteriores
  socket.off("players-update");
  
  const app = document.getElementById("app");
  app.innerHTML = `
        <div id="screen2" class="final-results-container">
            <h2>Resultados Finales</h2>
            <div class="results-controls">
                <button id="sort-alphabetical" class="btn">Ordenar alfabéticamente</button>
                <button id="sort-by-score" class="btn">Ordenar por puntuación</button>
                <button id="reset-game" class="btn btn-danger">Reiniciar Juego</button>
            </div>
            <div id="players-list" class="players-list">
                <!-- Los jugadores se mostrarán aquí -->
            </div>
            
        </div>
    `;

  const playersList = document.getElementById("players-list");
  const sortAlphabeticalBtn = document.getElementById("sort-alphabetical");
  const sortByScoreBtn = document.getElementById("sort-by-score");
  const resetGameBtn = document.getElementById("reset-game");
  

  let currentPlayers = [...(data?.players || [])];
  let currentSort = "score"; // "score" o "alphabetical"


  // Escuchar actualizaciones de jugadores solo una vez
  socket.once("players-update", (players) => {
    console.log("Recibida actualización de jugadores en screen2:", players);
    currentPlayers = [...players];
    sortPlayers();
  });

  // Escuchar cuando hay un ganador
  socket.on("game-winner", (data) => {
    console.log("¡Tenemos un ganador!", data);
    if (data.players) {
      currentPlayers = [...data.players];
      sortPlayers();
    }
  });

  // Escuchar cuando el juego se reinicia
  resetGameBtn.addEventListener("click", () => {
    console.log("Solicitando reinicio del juego");
    socket.emit("reset-game");
    navigateTo("/");
  });

  function updatePlayersList(players) {
    if (!Array.isArray(players)) {
      console.error("players no es un array:", players);
      return;
    }

    playersList.innerHTML = players
      .map((player, index) => `
        <div class="player-item">
          <span class="player-position">${index + 1}.</span>
          <span class="player-name">${player.nickname}</span>
          <span class="player-score">${player.score} pts</span>
          <span class="player-role">${player.role || 'Sin rol'}</span>
          ${index === 0 && player.score > 0 ? '<span class="winner-badge">GANADOR</span>' : ''}
        </div>
      `)
      .join("");
  }

  function sortPlayers() {
    if (currentSort === "alphabetical") {
      currentPlayers.sort((a, b) => a.nickname.localeCompare(b.nickname));
    } else {
      currentPlayers.sort((a, b) => b.score - a.score);
    }
    updatePlayersList(currentPlayers);
  }

  sortAlphabeticalBtn.addEventListener("click", () => {
    currentSort = "alphabetical";
    sortPlayers();
  });

  sortByScoreBtn.addEventListener("click", () => {
    currentSort = "score";
    sortPlayers();
  });

  socket.emit("get-players");

  sortPlayers();
}
