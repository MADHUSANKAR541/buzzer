// App Router-compatible Socket.IO handler using the Node response socket
import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

let state = {
  isActive: false,
  participants: [] as Array<{ id: string; name: string; joinedAt: number }>,
  results: [] as Array<{ round: number; participantId: string; participantName: string; position: number; timestamp: number }>,
  currentRound: 1,
  hasStartedBefore: false
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // @ts-ignore - res.socket is available in Node runtime
  const anyRes: any = res as any;
  if (!anyRes.socket.server.io) {
    const io = new Server(anyRes.socket.server, {
      path: "/api/socketio",
      cors: { origin: "*", methods: ["GET", "POST"] }
    });
    anyRes.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.emit("currentState", state);

      socket.on("register", ({ name }) => {
        if (!name) return;
        const existing = state.participants.find((p) => p.id === socket.id);
        if (!existing) {
          const p = { id: socket.id, name, joinedAt: Date.now() };
          state.participants.push(p);
          io.emit("participantJoined", p);
          io.emit("updateParticipants", state.participants);
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
          participantName: (participant as any).name,
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
        } as any;
        io.emit("buzzerReset", state);
      });

      socket.on("disconnect", () => {
        state.participants = state.participants.filter((p) => p.id !== socket.id);
        io.emit("updateParticipants", state.participants);
      });
    });
  }
  res.end();
}
