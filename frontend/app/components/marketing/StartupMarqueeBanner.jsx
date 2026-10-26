'use client';
import React from 'react';
import { Cloud, Cpu } from 'lucide-react';

const twoPartners = [
  {
    icon: <Cloud size={24} style={{ color: '#091322', flexShrink: 0 }} />,
    text: 'PART OF GOOGLE CLOUD FOR STARTUPS PROGRAM'
  },
  {
    icon: <Cpu size={24} style={{ color: '#091322', flexShrink: 0 }} />,
    text: 'PART OF SARVAM AI STARTUP PROGRAM'
  }
];

export default function StartupMarqueeBanner() {
  // Repeat the 2 items 8 times so on all screens (including ultra-wide) it loops with 0 gap
  const displayItems = [
    ...twoPartners,
    ...twoPartners,
    ...twoPartners,
    ...twoPartners,
    ...twoPartners,
    ...twoPartners,
    ...twoPartners,
    ...twoPartners
  ];

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      background: 'linear-gradient(90deg, #2DD4BF 0%, #38BDF8 35%, #818CF8 70%, #2DD4BF 100%)',
      padding: '44px 0',
      minHeight: '112px',
      boxShadow: '0 10px 40px rgba(45, 212, 191, 0.28)',
      borderTop: '2px solid rgba(255, 255, 255, 0.4)',
      borderBottom: '2px solid rgba(0, 0, 0, 0.22)',
      position: 'relative',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center'
    }}>
      <style>{`
        @keyframes godaddySlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .godaddy-ticker-track {
          display: flex;
          width: max-content;
          animation: godaddySlide 32s linear infinite;
        }
        .godaddy-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="godaddy-ticker-track">
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              padding: '0 44px',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.12)'
            }}>
              {item.icon}
            </span>

            <span style={{
              fontWeight: 900,
              fontSize: '1.18rem',
              letterSpacing: '0.06em',
              color: '#091322',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {item.text}
            </span>

            <span style={{
              marginLeft: '36px',
              fontSize: '1.5rem',
              color: 'rgba(9, 19, 34, 0.45)',
              fontWeight: 900
            }}>
              &bull;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
