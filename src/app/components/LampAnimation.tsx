"use client";
// src/components/LampAnimation.js
export default function LampAnimation(){
    return (
      <div className="lamp-wrap magic-lamp" aria-hidden>
        <div className="lamp">
          <div className="lamp-body"></div>
          <div className="lamp-spout"></div>
        </div>
        <div className="smoke">
          <div></div><div></div><div></div>
        </div>
      </div>
    );
  }
  