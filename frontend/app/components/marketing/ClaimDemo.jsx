'use client';
import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, ExternalLink, CheckCircle, Info } from 'lucide-react';
import {
  SAMPLE_QUESTION,
  SAMPLE_SOURCES,
  CONFLICT_NOTICE,
  SAMPLE_ANSWER_BLOCKS
} from '@/content/sampleAnswer';

export default function ClaimDemo() {
  const [query, setQuery] = useState(SAMPLE_QUESTION);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedSource, setSelectedSource] = useState(SAMPLE_SOURCES[0]);
  const [customQueryWarning, setCustomQueryWarning] = useState(false);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim() !== SAMPLE_QUESTION.trim()) {
      setCustomQueryWarning(true);
    } else {
      setCustomQueryWarning(false);
    }
  };

  const handleAsk = (e) => {
    e.preventDefault();
    if (query.trim() !== SAMPLE_QUESTION.trim()) {
      setCustomQueryWarning(true);
      return;
    }

    setCustomQueryWarning(false);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReducedMotion ? 0 : 700;

    setIsSearching(true);
    setHasSearched(false);

    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      setSelectedSource(SAMPLE_SOURCES[0]);
    }, delay);
  };

  const handleSelectSourceById = (sourceId) => {
    if (sourceId === 'conflict-spec') {
      setSelectedSource(CONFLICT_NOTICE);
    } else {
      const src = SAMPLE_SOURCES.find((s) => s.id === sourceId);
      if (src) setSelectedSource(src);
    }
  };

  return (
    <section id="demo" style={{
      padding: '48px 0 64px',
      borderTop: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)',
      backgroundColor: 'var(--bg2)'
    }}>
      <div className="landing-container">
        {/* Section Intro */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(129, 140, 248, 0.12)',
            color: 'var(--ind)',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '0.78rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '12px'
          }}>
            Interactive Demo &bull; Static Sample Data
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 8px 0',
            fontWeight: 400
          }}>
            Ask once. Trace every sentence to its source.
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '0.98rem',
            maxWidth: '620px',
            margin: '0 auto'
          }}>
            Click any colored claim chip below to inspect the verified evidence snippet from Jira, GitHub, Slack or Notion.
          </p>
        </div>

        {/* Demo Box */}
        <div style={{
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          {/* Search Header / Form */}
          <form onSubmit={handleAsk} style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--line)',
            padding: '12px 16px',
            gap: '12px',
            backgroundColor: 'var(--bg2)'
          }}>
            <Search size={18} style={{ color: 'var(--mute)', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              aria-label="Ask CognitRAG a question"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--ink)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            {query.trim() !== SAMPLE_QUESTION.trim() && (
              <button
                type="button"
                onClick={() => {
                  setQuery(SAMPLE_QUESTION);
                  setCustomQueryWarning(false);
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  color: 'var(--mute)',
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                Reset sample
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              style={{
                backgroundColor: 'var(--ind)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: isSearching ? 'wait' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isSearching ? 'Searching…' : 'Ask CognitRAG'}
            </button>
          </form>

          {/* Custom Question Warning */}
          {customQueryWarning && (
            <div style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderBottom: '1px solid var(--am)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: 'var(--am)'
            }}>
              <AlertTriangle size={16} />
              <span>This demo answers one sample question. Request early access to try your own team&apos;s sources.</span>
            </div>
          )}

          {/* Searching Status Indicator */}
          {isSearching && (
            <div
              aria-live="polite"
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--mute)',
                fontSize: '0.95rem'
              }}
            >
              Searching Slack, Jira, GitHub and Notion…
            </div>
          )}

          {/* Answer + Evidence Two-Column View */}
          {hasSearched && !isSearching && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              divideX: '1px solid var(--line)'
            }}>
              {/* Left: Generated Answer with Claim Chips */}
              <div
                aria-live="polite"
                style={{
                  padding: '24px 20px',
                  borderRight: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--mute)',
                    letterSpacing: '0.04em'
                  }}>
                    Synthesized Answer
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--em)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={14} /> 4 citations verified
                  </span>
                </div>

                <div style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  color: 'var(--ink)'
                }}>
                  {SAMPLE_ANSWER_BLOCKS.map((block, idx) => (
                    <span key={idx}>
                      {block.text}
                      {block.chips.map((chip) => {
                        const isSelected = selectedSource?.id === chip.sourceId;
                        let chipColor = 'var(--em)';
                        let chipBg = 'rgba(34, 197, 94, 0.12)';
                        if (chip.tier === 'extracted') {
                          chipColor = 'var(--cy)';
                          chipBg = 'rgba(56, 189, 248, 0.12)';
                        } else if (chip.tier === 'outdated') {
                          chipColor = 'var(--am)';
                          chipBg = 'rgba(245, 158, 11, 0.12)';
                        }

                        return (
                          <button
                            key={chip.sourceId}
                            onClick={() => handleSelectSourceById(chip.sourceId)}
                            aria-pressed={isSelected}
                            aria-label={chip.label}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 7px',
                              margin: '0 3px',
                              borderRadius: '4px',
                              border: isSelected ? `1.5px solid ${chipColor}` : '1px solid transparent',
                              backgroundColor: chipBg,
                              color: chipColor,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              verticalAlign: 'baseline',
                              fontFamily: 'inherit'
                            }}
                          >
                            [{chip.label}]
                          </button>
                        );
                      })}
                    </span>
                  ))}
                </div>

                {/* Conflict Notice Trigger Chip */}
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--am)' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      Notice: 1 conflicting doc detected between Notion &amp; GitHub PR
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectSourceById('conflict-spec')}
                    aria-pressed={selectedSource?.id === 'conflict-spec'}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--am)',
                      borderRadius: '4px',
                      color: 'var(--am)',
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Inspect Conflict
                  </button>
                </div>
              </div>

              {/* Right: Evidence Inspector Panel */}
              <div style={{
                padding: '24px 20px',
                backgroundColor: 'var(--bg2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--mute)',
                    letterSpacing: '0.04em'
                  }}>
                    Evidence Inspector
                  </span>
                  {selectedSource && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: selectedSource.color,
                      border: `1px solid ${selectedSource.color}`
                    }}>
                      {selectedSource.tierName}
                    </span>
                  )}
                </div>

                {selectedSource ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        marginBottom: '4px'
                      }}>
                        {selectedSource.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--mute)' }}>
                        {selectedSource.author ? `${selectedSource.author} • ` : ''}{selectedSource.date}
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      color: 'var(--ink)',
                      fontFamily: 'monospace'
                    }}>
                      {selectedSource.snippet}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: 'var(--mute)'
                    }}>
                      <Info size={14} />
                      <span>Retrieved using tenant audience access rules. Withheld sources are never exposed.</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
                    Select a source chip to view exact citation evidence.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '20px',
          fontSize: '0.82rem',
          color: 'var(--mute)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--em)' }} />
            <span>Green = Structured (Read from tool)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--cy)' }} />
            <span>Cyan = Extracted (Inferred from text)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--am)' }} />
            <span>Amber = Conflicting or outdated</span>
          </div>
        </div>
      </div>
    </section>
  );
}
