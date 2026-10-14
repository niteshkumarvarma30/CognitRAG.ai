
'use client';
import React from 'react';

export default function NeuralGraphBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {/* Subtle top ambient radial glow (Indigo / Cyan whisper) */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '500px',
        background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.04) 45%, transparent 75%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Precision architectural dot/cross grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(99, 102, 241, 0.045) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99, 102, 241, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 75% 65% at 50% 30%, #000 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 30%, #000 40%, transparent 100%)',
        opacity: 0.85
      }} />
    </div>
  );
}
