// src/app/buzzer/page.js
"use client";
import { useEffect, useState, useRef } from "react";
import useSocket from "../lib/useSocket";
import BuzzerButton from "../components/BuzzerButton";
import ResultsList from "../components/ResultsList";
import "../styles/buzzer.scss";

type Result = { round: number; participantId: string; participantName: string; position: number; timestamp: number };

export default function BuzzerPage() {
  const socket = useSocket();
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const storedRef = useRef(false);

  useEffect(() => {
    const n = localStorage.getItem("playerName") || "Guest";
    setName(n);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("currentState", (s: { isActive: boolean; results: Result[]; currentRound: number }) => {
      setIsActive(s.isActive);
      setResults((s.results || []).filter(r=>r.round===s.currentRound));
    });
    socket.on("buzzerStarted", ({ round }: { round: number }) => {
      setIsActive(true);
      setResults([]);
      showNotification(`Round ${round} started`);
    });
    socket.on("buzzerStopped", () => {
      setIsActive(false);
      showNotification("Round stopped");
    });
    socket.on("buzzerReset", () => {
      setIsActive(false);
      setResults([]);
      showNotification("System reset");
    });
    socket.on("buzzerResult", (r: Result) => setResults((prev: Result[]) => [...prev, r]));
    socket.on("updateResults", (rs: Result[]) => setResults(rs));
    if (!storedRef.current) {
      storedRef.current = true;
      const n = localStorage.getItem("playerName") || "Guest";
      socket.emit("register", { name: n });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isActive) handlePress();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      socket.off("currentState");
    };
  }, [socket, isActive]);

  function handlePress() {
    if (!socket || !isActive) return;
    socket.emit("buzzerPressed");
    animatePress();
  }

  function animatePress() {
    const el = document.querySelector(".buzzer-button");
    if (!el) return;
    el.classList.add("pressed");
    setTimeout(()=>el.classList.remove("pressed"), 300);
  }

  function showNotification(msg: string) {
    const n = document.createElement("div");
    n.className = "toast";
    n.textContent = msg;
    document.body.appendChild(n);
    requestAnimationFrame(()=> n.classList.add("visible"));
    setTimeout(()=> {
      n.classList.remove("visible");
      setTimeout(()=>n.remove(),300);
    }, 2000);
  }

  return (
    <main>
      <header className="header">
        <div>Player: <strong>{name}</strong></div>
        <div className="status-indicator"><span>{isActive ? 'LIVE' : 'IDLE'}</span></div>
      </header>

      <section className="buzzer-container">
        <div className="left-col">
          <div className="carpet-container">
            <div className="magic-carpet">
              <div className="carpet-pattern" />
            </div>
          </div>
          <BuzzerButton disabled={!isActive} onPress={handlePress} />
        </div>

        <aside className="panels">
          {!isActive ? (
            <ResultsList results={results} />
          ) : (
            <div className="panel results-panel">
              <h3>Results</h3>
              <div className="no-results">Results will appear when the round is stopped</div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
