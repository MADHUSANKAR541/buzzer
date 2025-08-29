// src/lib/useSocket.js
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

let sock: Socket | null;
let initialized = false;

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const init = async () => {
      if (!initialized) {
        try { await fetch("/api/socketio"); } catch {}
        initialized = true;
      }
      if (!sock) {
        const baseUrl = window.location.origin;
        sock = io(baseUrl, { path: "/api/socketio", transports: ["websocket", "polling"] });
      }
      setSocket(sock);
    };
    void init();
    return () => {
      // keep socket alive across pages; don't disconnect here to preserve admin/participant connections
    };
  }, []);

  return socket;
}
