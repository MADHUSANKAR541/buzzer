// src/app/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LampAnimation from "./components/LampAnimation";
import "./styles/main.scss";

export default function Page() {
  const [name, setName] = useState("");
  const router = useRouter();

  function join(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return alert("Enter a name");
    localStorage.setItem("playerName", n);
    router.push("/buzzer");
  }

  return (
    <main className="login-container">
      <div className="container">
        <LampAnimation />
        <h1 className="title">UnlockTheWishes</h1>
        <p className="subtitle">Aladdin Buzzer System</p>
        <form onSubmit={join} className="login-form" onTouchStart={(e)=>{}}>
          <div className="input-group">
            <input
              aria-label="name"
              className="name-input"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="Your name"
              maxLength={30}
            />
          </div>
          <button type="submit" className="join-btn">Join the Magic</button>
        </form>
      </div>
    </main>
  );
}
