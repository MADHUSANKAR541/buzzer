import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: "/socketio",
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    methods: ["GET", "POST"]
  }
});

let state = {
  isActive: false,
  participants: [],
  results: [],
  currentRound: 1,
  hasStartedBefore: false
};

io.on("connection", (socket) => {
  socket.emit("currentState", state);

  socket.on("register", ({ name }) => {
    if (!name) return;
    const existing = state.participants.find((p) => p.id === socket.id);
    if (!existing) {
      const participant = { id: socket.id, name, joinedAt: Date.now() };
      state.participants.push(participant);
      io.emit("participantJoined", participant);
      io.emit("updateParticipants", [...state.participants]);
    }
  });

  socket.on("buzzerPressed", () => {
    if (!state.isActive) return;
    const already = state.results.find(
      (r) => r.round === state.currentRound && r.participantId === socket.id
    );
    if (already) return;
    const participant =
      state.participants.find((p) => p.id === socket.id) || { name: "Unknown" };
    const position = state.results.filter((r) => r.round === state.currentRound).length + 1;
    const result = {
      round: state.currentRound,
      participantId: socket.id,
      participantName: participant.name,
      position,
      timestamp: Date.now()
    };
    state.results.push(result);
    io.emit("buzzerResult", result);
    io.emit(
      "updateResults",
      state.results.filter((r) => r.round === state.currentRound)
    );
  });

  socket.on("startBuzzer", () => {
    if (state.hasStartedBefore) {
      state.currentRound += 1;
    } else {
      state.hasStartedBefore = true;
    }
    state.isActive = true;
    io.emit("buzzerStarted", { round: state.currentRound });
    io.emit(
      "updateResults",
      state.results.filter((r) => r.round === state.currentRound)
    );
    io.emit("updateParticipants", state.participants);
  });

  socket.on("stopBuzzer", () => {
    state.isActive = false;
    io.emit("buzzerStopped");
    io.emit(
      "updateResults",
      state.results.filter((r) => r.round === state.currentRound)
    );
  });

  socket.on("resetBuzzer", () => {
    state = {
      isActive: false,
      participants: [],
      results: [],
      currentRound: 1,
      hasStartedBefore: false
    };
    io.emit("buzzerReset", state);
  });

  socket.on("disconnect", () => {
    state.participants = state.participants.filter((p) => p.id !== socket.id);
    io.emit("updateParticipants", [...state.participants]);
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Realtime server listening on :${PORT}`);
});


