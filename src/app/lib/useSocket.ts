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
        const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        const baseUrl = envUrl && envUrl.length > 0 ? envUrl : window.location.origin;
        // If using external server, its path is "/socketio"; if local Next dev, still works with "/api/socketio"
        const isExternal = !!envUrl;
        const path = isExternal ? "/socketio" : "/api/socketio";
        sock = io(baseUrl, { path, transports: ["websocket", "polling"] });
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
