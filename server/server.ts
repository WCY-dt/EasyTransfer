import { Server, Socket } from "socket.io";

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

const generateId = (): string => {
  // Generate a random 4 character string
  let id: string;
  do {
    id = Math.random().toString(36).substring(2, 6).toUpperCase();
  } while (
    id.includes("0") ||
    id.includes("1") ||
    id.includes("O") ||
    id.includes("I") ||
    id.includes("L") ||
    Object.keys(clients).includes(id)
  );
  return id;
};

io.on("connection", (socket: Socket) => {
  console.log("[client connected] ", socket.id);

  socket.on("register", (maxConnectionNumber: number) => {
    const clientId = generateId();
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
      try {
        clients[targetId].emit(
          "offer",
          sdp,
          srcId,
          maxConnectionNumbers[srcId],
        );
      } catch (error) {
        console.error("[error] ", error);
        clients[srcId].emit("error", "Target client not found");
      }
    },
  );

  socket.on(
    "answer",
    (sdp: RTCSessionDescriptionInit, srcId: string, targetId: string) => {
      console.log("[answer] ", srcId, " --> ", targetId);
      try {
        clients[targetId].emit("answer", sdp, srcId);
      } catch (error) {
        console.error("[error] ", error);
        clients[srcId].emit("error", "Target client not found");
      }
    },
  );

  socket.on("candidate", (candidate: RTCIceCandidate, targetId: string) => {
    console.log("[candidate] ", targetId);
    try {
      clients[targetId].emit("candidate", candidate);
    } catch (error) {
      console.error("[error] ", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("[client disconnected] ", socket.id);
    for (const clientId in clients) {
      if (clients[clientId] === socket) {
        delete clients[clientId];
        break;
      }
    }
  });
});
