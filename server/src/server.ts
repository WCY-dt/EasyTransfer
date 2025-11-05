import { Server, Socket } from "socket.io";
import { generateId } from "./utils.js";

const port = process.env.PORT || 3000;
const io = new Server(Number(port), {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface Clients {
  [key: string]: Socket;
}

interface MaxConnectionNumbers {
  [key: string]: number;
}

const clients: Clients = {}; // Store client IDs and their corresponding sockets
const maxConnectionNumbers: MaxConnectionNumbers = {}; // Store client IDs and their corresponding max connection numbers

io.on("connection", (socket: Socket) => {
  console.log("[client connected] ", socket.id);

  socket.on("register", (maxConnectionNumber: number) => {
    const clientId = generateId(clients);
    console.log(
      "[register] ",
      clientId,
      " with max connection number ",
      maxConnectionNumber,
    );
    maxConnectionNumbers[clientId] = maxConnectionNumber;
    clients[clientId] = socket;
    clients[clientId].emit("success", clientId);
  });

  socket.on(
    "offer",
    (sdp: RTCSessionDescriptionInit, srcId: string, targetId: string) => {
      console.log("[offer] ", srcId, " --> ", targetId);
      if (!clients[targetId]) {
        console.error("[error] Target client not found:", targetId);
        if (clients[srcId]) {
          clients[srcId].emit("error", "Target client not found");
        }
        return;
      }
      try {
        clients[targetId].emit(
          "offer",
          sdp,
          srcId,
          maxConnectionNumbers[srcId],
        );
      } catch (error) {
        console.error("[error] ", error);
        if (clients[srcId]) {
          clients[srcId].emit("error", "Failed to send offer");
        }
      }
    },
  );

  socket.on(
    "answer",
    (sdp: RTCSessionDescriptionInit, srcId: string, targetId: string) => {
      console.log("[answer] ", srcId, " --> ", targetId);
      if (!clients[targetId]) {
        console.error("[error] Target client not found:", targetId);
        if (clients[srcId]) {
          clients[srcId].emit("error", "Target client not found");
        }
        return;
      }
      try {
        clients[targetId].emit("answer", sdp, srcId);
      } catch (error) {
        console.error("[error] ", error);
        if (clients[srcId]) {
          clients[srcId].emit("error", "Failed to send answer");
        }
      }
    },
  );

  socket.on("candidate", (candidate: RTCIceCandidate, targetId: string) => {
    console.log("[candidate] ", targetId);
    if (!clients[targetId]) {
      console.error("[error] Target client not found for candidate:", targetId);
      return;
    }
    try {
      clients[targetId].emit("candidate", candidate);
    } catch (error) {
      console.error("[error] Failed to send candidate:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("[client disconnected] ", socket.id);
    for (const clientId in clients) {
      if (clients[clientId] === socket) {
        delete clients[clientId];
        delete maxConnectionNumbers[clientId];
        console.log("[cleanup] Removed client:", clientId);
        break;
      }
    }
  });
});
