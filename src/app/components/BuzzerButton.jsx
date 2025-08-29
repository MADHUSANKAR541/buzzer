// src/components/BuzzerButton.js
export default function BuzzerButton({ disabled, onPress }) {
  return (
    <button
      className="buzzer-button"
      onTouchStart={(e)=>{ e.preventDefault(); if(!disabled) onPress(); }}
      onClick={(e)=>{ e.preventDefault(); if(!disabled) onPress(); }}
      aria-disabled={disabled}
      disabled={disabled}
    >
      <div className="buzzer-inner">
        <span className="buzzer-text">PRESS</span>
        <div className="buzzer-glow" />
      </div>
    </button>
  );
}
  