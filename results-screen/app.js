import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
import renderScreen1 from "./screens/screen1.js";
import renderScreen2 from "./screens/screen2.js";

// Inicializar socket
const socket = io("http://localhost:5050", {
  path: "/real-time"
});

// Manejar conexión
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

// Manejar desconexión
socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});

// Manejar errores
socket.on("connect_error", (error) => {
  console.error("Error de conexión:", error);
});

function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

let route = { path: "/", data: {} };
renderRoute(route);

function renderRoute(currentRoute) {
  switch (currentRoute?.path) {
    case "/":
      clearScripts();
      renderScreen1(currentRoute?.data);
      break;
    case "/screen2":
      clearScripts();
      renderScreen2(currentRoute?.data);
      break;
    default:
      const app = document.getElementById("app");
      app.innerHTML = `<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>`;
  }
}

function navigateTo(path, data) {
  route = { path, data };
  renderRoute(route);
}

// Manejar navegación
window.addEventListener("popstate", () => {
  renderRoute(route);
});

export { navigateTo, socket };
