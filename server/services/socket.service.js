const { Server } = require("socket.io");
const playersDb = require("../db/players.db");

let io;

const initSocketInstance = (httpServer) => {
  io = new Server(httpServer, {
    path: "/real-time",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    // Manejar conexión del cliente de resultados
    socket.on("get-players", () => {
      console.log("Solicitud de jugadores recibida");
      const players = playersDb.getAllPlayers();
      socket.emit("players-update", players);
    });

    // Manejar unión de jugadores al juego
    socket.on("player-join", (nickname) => {
      console.log("Jugador unido:", nickname);
      const player = playersDb.addPlayer(nickname, socket.id);
      emitEvent("players-update", playersDb.getAllPlayers());
      emitEvent("userJoined", { players: playersDb.getAllPlayers() });
    });

    // Manejar captura de Marco
    socket.on("marco-catch", (data) => {
      console.log("Marco intenta atrapar:", data);
      const { caughtPlayerId } = data;
      const caughtPlayer = playersDb.findPlayerById(caughtPlayerId);
      
      if (caughtPlayer && caughtPlayer.role === "polo-especial") {
        // Marco atrapó a Polo especial: +50 puntos para Marco, -10 para Polo
        playersDb.updatePlayerScore(socket.id, 50);
        playersDb.updatePlayerScore(caughtPlayerId, -10);
      } else {
        // Marco no atrapó a Polo especial: -10 puntos
        playersDb.updatePlayerScore(socket.id, -10);
      }
      
      // Verificar si hay un ganador
      const winner = playersDb.checkWinner();
      if (winner) {
        emitEvent("game-winner", {
          winner,
          players: playersDb.getAllPlayers()
        });
      } else {
        emitEvent("players-update", playersDb.getAllPlayers());
      }
    });

    // Manejar escape de Polo
    socket.on("polo-escape", () => {
      console.log("Polo escapó");
      // Polo especial no fue atrapado: +10 puntos
      playersDb.updatePlayerScore(socket.id, 10);
      emitEvent("players-update", playersDb.getAllPlayers());
    });

    // Manejar reinicio del juego
    socket.on("reset-game", () => {
      console.log("Reinicio del juego solicitado");
      playersDb.resetGame();
      
      // Obtener todos los jugadores activos
      const players = playersDb.getAllPlayers();
      
      // Emitir evento de reinicio a cada jugador
      players.forEach(player => {
        if (player.socketId) {
          emitToSpecificClient(player.socketId, "switch", {
            path: "/",
            data: { reset: true }
          });
        }
      });

      // Emitir actualización general
      emitEvent("players-update", players);
    });

    // Manejar desconexión
    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
      // Aquí podrías implementar la lógica para remover al jugador si lo deseas
    });
  });
};

const emitToSpecificClient = (socketId, eventName, data) => {
  if (!io) {
    throw new Error("Socket.io instance is not initialized");
  }
  io.to(socketId).emit(eventName, data);
};

const emitEvent = (eventName, data) => {
  if (!io) {
    throw new Error("Socket.io instance is not initialized");
  }
  io.emit(eventName, data);
};

module.exports = {
  emitEvent,
  initSocketInstance,
  emitToSpecificClient,
};
