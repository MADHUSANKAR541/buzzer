// src/app/admin/page.js
"use client";
import { useEffect, useState } from "react";
import useSocket from "../lib/useSocket";
import "../styles/admin.scss";

export default function AdminPage(){
  const socket = useSocket();
  const [isActive,setIsActive] = useState<boolean>(false);
  const [participants,setParticipants] = useState<Array<{id:string; name:string}>>([]);
  const [results,setResults] = useState<Array<{round:number; participantId:string; participantName:string; position:number; timestamp:number}>>([]);
  const [roundHistory,setRoundHistory] = useState<Array<{ round:number; results: Array<{ participantId:string; participantName:string; position:number; timestamp:number }>; duration:number }>>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundStart, setRoundStart] = useState<number | null>(null);

  useEffect(()=>{
    if(!socket) return;
    socket.on("currentState", (s:{ isActive:boolean; participants:Array<{id:string; name:string}>; results:Array<{round:number; participantId:string; participantName:string; position:number; timestamp:number}>; currentRound:number })=>{
      setIsActive(s.isActive);
      setParticipants(s.participants||[]);
      setResults((s.results||[]).filter(r=>r.round===s.currentRound));
      setCurrentRound(s.currentRound||1);
    });
    socket.on("buzzerStarted", ({round}:{round:number})=>{
      setIsActive(true);
      setResults([]);
      setCurrentRound(round);
      setRoundStart(Date.now());
      notify(`Round ${round} started`);
    });
    socket.on("buzzerStopped", ()=>{
      setIsActive(false);
      const duration = roundStart ? (Date.now() - roundStart) : 0;
      setRoundHistory(prev => [{ round: currentRound, results, duration }, ...prev].slice(0,10));
      setRoundStart(null);
      notify('Round stopped');
    });
    socket.on("buzzerReset", ()=>{
      setIsActive(false);
      setParticipants([]);
      setResults([]);
      setRoundHistory([]);
      setCurrentRound(1);
      notify('Reset done');
    });
    socket.on("updateParticipants", (ps:Array<{id:string; name:string}>) => setParticipants(ps));
    socket.on("participantJoined", (p:{id:string; name:string}) => setParticipants((prev)=> {
      const without = prev.filter(x=>x.id!==p.id);
      return [...without, p];
    }));
    socket.on("buzzerResult", (r:{round:number; participantId:string; participantName:string; position:number; timestamp:number}) => setResults((prev)=> [...prev, r]));
    socket.on("updateResults", (rs:Array<{round:number; participantId:string; participantName:string; position:number; timestamp:number}>) => setResults(rs));
    return ()=>{ socket.off(); }
  }, [socket, roundStart, currentRound, results]);

  function start(){
    socket?.emit("startBuzzer");
  }
  function stop(){
    socket?.emit("stopBuzzer");
  }
  function reset(){
    if(!confirm("Reset the buzzer system? This clears participants and history.")) return;
    socket?.emit("resetBuzzer");
  }

  function notify(m:string){
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = m;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('visible'));
    setTimeout(()=>{ el.classList.remove('visible'); setTimeout(()=>el.remove(),300) },2000);
  }

  const avgResponse = () => {
    const times = roundHistory.flatMap(r => r.results?.map(x=>x.timestamp) || []);
    if(times.length<2) return 0;
    // naive average delta
    return Math.round((times.reduce((a,b)=>a+b,0) / times.length));
  }

  return (
    <main className="admin-container">
      <header className="admin-header">
        <h1>Admin Panel - UnlockTheWishes</h1>
        <div className="control-buttons">
          <button className={`control-btn start-btn`} onClick={start} disabled={isActive}>
            <span className="btn-icon">▶</span>
            <span className="btn-text">Start</span>
          </button>
          <button className="control-btn stop-btn" onClick={stop} disabled={!isActive}>
            <span className="btn-icon">⏸</span>
            <span className="btn-text">Stop</span>
          </button>
          <button className="control-btn reset-btn" onClick={reset}>
            <span className="btn-icon">↺</span>
            <span className="btn-text">Reset</span>
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="results-panel">
          <h3>Live Results (Round {currentRound})</h3>
          <ol className="live-results">
            {results.length ? results.map(r=>(
              <li key={r.participantId} className="result-item">
                <span className="result-position">{r.position}.</span>
                <span className="result-name">{r.participantName}</span>
              </li>
            )) : <li className="muted">No results yet</li>}
          </ol>
        </div>

        <div className="participants-panel">
          <h3>Participants ({participants.length})</h3>
          <ul className="participants-list">
            {participants.length ? participants.map(p=>(
              <li key={p.id} className="participant-item">
                <span className="participant-name">{p.name}</span>
              </li>
            )) : <li className="muted">No participants</li>}
          </ul>
        </div>

        <div className="history-panel">
          <h3>Round History</h3>
          <ul className="round-history">
            {roundHistory.length ? roundHistory.map(h=>(
              <li key={h.round} className="round-item">
                <div className="round-header">
                  <span className="round-number">Round {h.round}</span>
                  <span className="round-participants">{h.results.length} presses • {Math.round(h.duration/1000)}s</span>
                </div>
                <div className="round-results">
                  {h.results.map(r=> (
                    <div key={r.participantId} className="round-result">
                      <span className="result-position">{r.position}.</span>
                      <span className="result-name">{r.participantName}</span>
                    </div>
                  ))}
                </div>
              </li>
            )) : <li className="muted">No rounds yet</li>}
          </ul>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-value">{participants.length}</div>
              <div className="stat-label">Total Participants</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-value">{roundHistory.length}</div>
              <div className="stat-label">Rounds Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-value">{roundHistory.length ? Math.round(roundHistory.reduce((a,b)=>a+b.duration,0)/roundHistory.length/1000) + 's' : '—'}</div>
              <div className="stat-label">Avg Round Duration</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
