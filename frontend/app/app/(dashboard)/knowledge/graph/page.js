'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import * as THREE from 'three';
import {
  Network,
  Search,
  RotateCcw,
  Play,
  Pause,
  FileText,
  FileCode,
  Cpu,
  Sparkles,
  GitPullRequest,
  X,
  ExternalLink,
  Layers,
  Activity,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import react-force-graph-3d with SSR disabled
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

const CATEGORIES = [
  { id: 'all', label: 'All Intelligence', color: '#4F46E5', icon: Layers },
  { id: 'Document', label: 'Docs & Specs', color: '#D97706', icon: FileText },
  { id: 'SourceFile', label: 'Source Files', color: '#0284C7', icon: FileCode },
  { id: 'Function', label: 'AST Functions', color: '#635BFF', icon: Cpu },
  { id: 'ChatInteraction', label: 'User Memory', color: '#059669', icon: MessageSquare },
  { id: 'PullRequest', label: 'PRs & Jira', color: '#E11D48', icon: GitPullRequest },
  { id: 'Entity', label: 'Entities', color: '#7C3AED', icon: Sparkles }
];

export default function GraphExplorer() {
  const { user } = useUser();
  const [rawGraphData, setRawGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isRotating, setIsRotating] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  const containerRef = useRef(null);
  const fgRef = useRef(null);
  const rotationAngleRef = useRef(0);
  const animationFrameRef = useRef(null);

  const tenantId = user?.id || 'ws_1';

  // ResizeObserver to fill 100% of parent dashboard container
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || window.innerWidth - 260,
          height: containerRef.current.clientHeight || window.innerHeight - 64
        });
      }
    };
    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Fetch graph data from backend
  const fetchGraph = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/graph/${tenantId}/export`);
      if (res.ok) {
        const data = await res.json();
        setRawGraphData(data);
      } else {
        setFetchError(true);
      }
    } catch (err) {
      console.warn('[Graph Explorer] Failed to fetch:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [tenantId]);

  // Smooth continuous orbit rotation
  useEffect(() => {
    if (!isRotating || !fgRef.current) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const animate = () => {
      if (fgRef.current && isRotating) {
        rotationAngleRef.current += 0.0015;
        const distance = 460;
        const x = distance * Math.sin(rotationAngleRef.current);
        const z = distance * Math.cos(rotationAngleRef.current);
        fgRef.current.cameraPosition({ x, y: 130, z }, { x: 0, y: 0, z: 0 });
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRotating]);

  // Filtered nodes and links based on category & search
  const filteredData = useMemo(() => {
    if (!rawGraphData.nodes || rawGraphData.nodes.length === 0) {
      return { nodes: [], links: [] };
    }

    let nodes = rawGraphData.nodes;

    if (activeCategory !== 'all') {
      if (activeCategory === 'PullRequest') {
        nodes = nodes.filter(n => n.group === 'PullRequest' || n.group === 'JiraIssue' || n.group === 'SlackChannel');
      } else {
        nodes = nodes.filter(n => n.group === activeCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      nodes = nodes.filter(n =>
        (n.label && n.label.toLowerCase().includes(q)) ||
        (n.details?.raw_name && n.details.raw_name.toLowerCase().includes(q)) ||
        (n.group && n.group.toLowerCase().includes(q))
      );
    }

    const visibleNodeIds = new Set(nodes.map(n => n.id));
    const links = (rawGraphData.links || []).filter(
      l => visibleNodeIds.has(typeof l.source === 'object' ? l.source.id : l.source) &&
           visibleNodeIds.has(typeof l.target === 'object' ? l.target.id : l.target)
    );

    return { nodes, links };
  }, [rawGraphData, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: rawGraphData.nodes?.length || 0 };
    (rawGraphData.nodes || []).forEach(n => {
      counts[n.group] = (counts[n.group] || 0) + 1;
      if (n.group === 'PullRequest' || n.group === 'JiraIssue' || n.group === 'SlackChannel') {
        counts['PullRequest'] = (counts['PullRequest'] || 0) + 1;
      }
    });
    return counts;
  }, [rawGraphData]);

  // Crisp Text Sprite generator formatted for Light Background
  const nodeThreeObject = useCallback((node) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = 340;
      canvas.height = 76;

      const rawText = node.label || 'Node';
      const displayText = rawText.length > 20 ? rawText.slice(0, 18) + '...' : rawText;

      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      const textWidth = ctx.measureText(displayText).width;
      const pillWidth = Math.min(320, textWidth + 36);
      const pillHeight = 40;
      const pillX = (340 - pillWidth) / 2;
      const pillY = 18;

      // Clean White Card pill background with dark border
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = node.color || '#4F46E5';
      ctx.lineWidth = 2;

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;

      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 20);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.rect(pillX, pillY, pillWidth, pillHeight);
        ctx.fill();
        ctx.stroke();
      }

      ctx.shadowColor = 'transparent';

      // Indicator dot
      ctx.fillStyle = node.color || '#4F46E5';
      ctx.beginPath();
      ctx.arc(pillX + 18, pillY + 20, 5, 0, Math.PI * 2);
      ctx.fill();

      // High-contrast Dark Charcoal text label
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayText, pillX + 30, pillY + 20);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      const radius = Math.max(4, (node.val || 12) * 0.38);
      sprite.scale.set(34, 7.6, 1);
      sprite.position.set(0, radius + 7.5, 0);

      return sprite;
    } catch (err) {
      console.warn('Canvas label render fallback:', err);
      return null;
    }
  }, []);

  // Center camera on clicked node
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setIsRotating(false);

    if (fgRef.current && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
      const distance = 160;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio + 25, z: node.z * distRatio },
        { x: node.x, y: node.y, z: node.z },
        1100
      );
    }
  }, []);

  // Reset camera view
  const handleResetCamera = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(800, 70);
      setIsRotating(true);
    }
  };

  // Connected links for selected node
  const nodeConnections = useMemo(() => {
    if (!selectedNode || !rawGraphData.links) return [];
    const id = selectedNode.id;
    return rawGraphData.links
      .filter(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return s === id || t === id;
      })
      .map(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        const isOutgoing = s === id;
        const otherId = isOutgoing ? t : s;
        const otherNode = rawGraphData.nodes.find(n => n.id === otherId);
        return {
          rel: l.label,
          direction: isOutgoing ? 'outgoing' : 'incoming',
          targetLabel: otherNode?.label || otherId,
          targetGroup: otherNode?.group || 'Entity',
          targetColor: otherNode?.color || '#4F46E5',
          rawNode: otherNode
        };
      });
  }, [selectedNode, rawGraphData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #F8FAFC 55%, #F1F5F9 100%)'
      }}
    >
      {/* ── Top Floating Command HUD (Light Mode Glassmorphism) ── */}
      <div className="graph-top-hud" style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: 14,
        padding: '12px 18px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Row 1: Title & Main Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(99, 91, 255, 0.15), rgba(79, 70, 229, 0.08))',
              border: '1px solid rgba(99, 91, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 91, 255, 0.15)'
            }}>
              <Network size={18} color="#4F46E5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0F172A', letterSpacing: '-0.01em' }}>
                  Knowledge & AST Call Graph Explorer
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 7px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 700
                }}>
                  Live Neo4j Active
                </span>
              </div>
              <div style={{ color: '#64748B', fontSize: '0.74rem' }}>
                Multi-dimensional neural map: Code AST call hierarchy, Architecture specs, and Conversational memory.
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Live Search */}
            <div style={{ position: 'relative', width: 230 }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol, spec, PR..."
                style={{
                  width: '100%',
                  padding: '6px 26px 6px 30px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 8,
                  color: '#0F172A',
                  fontSize: '0.76rem',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsRotating(!isRotating)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                background: isRotating ? 'rgba(99, 91, 255, 0.1)' : '#F8FAFC',
                border: `1px solid ${isRotating ? 'rgba(99, 91, 255, 0.4)' : '#CBD5E1'}`,
                borderRadius: 8,
                color: isRotating ? '#4F46E5' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              {isRotating ? <Pause size={13} /> : <Play size={13} />}
              {isRotating ? 'Orbiting' : 'Paused'}
            </button>

            <button
              onClick={handleResetCamera}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                color: '#64748B',
                fontSize: '0.75rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
              title="Reset Camera Zoom & Position"
            >
              <RotateCcw size={13} />
              Reset
            </button>

            <Link
              href="/dev-studio"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 14px',
                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: 8,
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 650,
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Cpu size={13} />
              Code Studio
            </Link>
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="graph-categories-scroll" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 11px',
                  background: isActive ? `${cat.color}15` : '#F8FAFC',
                  border: `1px solid ${isActive ? cat.color : '#E2E8F0'}`,
                  borderRadius: 18,
                  color: isActive ? cat.color : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
                <span>{cat.label}</span>
                <span style={{
                  fontSize: '0.66rem',
                  padding: '1px 6px',
                  borderRadius: 8,
                  background: isActive ? `${cat.color}25` : '#E2E8F0',
                  color: isActive ? cat.color : '#64748B',
                  fontWeight: 650
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3D Canvas (Clean Light Mode) ── */}
      {loading ? (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: '#64748B'
        }}>
          <Activity size={32} color="#4F46E5" className="animate-spin" />
          <div style={{ fontWeight: 650, color: '#0F172A', fontSize: '0.95rem' }}>
            Streaming Neo4j Intelligence Graph...
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            290+ AST Call nodes, Specifications, and Grounded Relations
          </div>
        </div>
      ) : filteredData.nodes.length === 0 ? (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          textAlign: 'center',
          padding: 24
        }}>
          <Network size={36} color="#4F46E5" />
          <h3 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>
            {fetchError ? 'Neo4j Connection Error' : 'No matching intelligence nodes'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: 360, margin: 0 }}>
            {fetchError
              ? 'Could not connect to Neo4j backend on port 8000. Please ensure the backend is running.'
              : 'No graph nodes match your current filters. Clear filters to see all intelligence.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            style={{
              padding: '6px 14px',
              background: 'rgba(99, 91, 255, 0.12)',
              border: '1px solid rgba(99, 91, 255, 0.35)',
              borderRadius: 8,
              color: '#4F46E5',
              fontSize: '0.78rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <ForceGraph3D
          ref={fgRef}
          graphData={filteredData}
          nodeThreeObject={nodeThreeObject}
          nodeThreeObjectExtend={true}
          nodeColor={(node) => node.color || '#4F46E5'}
          nodeVal={(node) => node.val || 14}
          nodeResolution={24}
          nodeOpacity={0.92}
          nodeLabel={(n) => `${n.group}: ${n.label}`}
          linkLabel={(l) => `Rel: ${l.label}`}
          linkWidth={1.8}
          linkColor={() => 'rgba(99, 91, 255, 0.35)'}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={2.2}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={() => '#635BFF'}
          linkDirectionalArrowLength={4.5}
          linkDirectionalArrowRelPos={1}
          backgroundColor="rgba(0, 0, 0, 0)"
          showNavInfo={false}
          width={dimensions.width}
          height={dimensions.height}
          onNodeClick={handleNodeClick}
        />
      )}

      {/* ── Bottom HUD Information Strip (Light Mode) ── */}
      <div className="graph-bottom-hud" style={{
        position: 'absolute',
        bottom: 14,
        left: 16,
        zIndex: 15,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '7px 14px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: 10,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        fontSize: '0.73rem',
        color: '#64748B'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', boxShadow: '0 0 6px rgba(5, 150, 105, 0.4)' }} />
          <span style={{ color: '#0F172A', fontWeight: 700 }}>{filteredData.nodes.length}</span> Active Nodes
        </div>
        <div style={{ width: 1, height: 12, background: '#E2E8F0' }} />
        <div>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>{filteredData.links.length}</span> Connected Edges
        </div>
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 1, height: 12, background: '#E2E8F0' }} />
          <div style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
            Left-click: Rotate • Scroll: Zoom • Right-click: Pan • Click Node: Inspect
          </div>
        </div>
      </div>

      {/* ── Slide-in Node Details Inspector (Light Mode Glassmorphism) ── */}
      {selectedNode && (
        <div className="graph-inspector-drawer" style={{
          position: 'absolute',
          top: 130,
          right: 16,
          width: 350,
          maxHeight: 'calc(100% - 150px)',
          zIndex: 25,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.95)',
          borderRadius: 14,
          padding: 16,
          color: '#0F172A',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: selectedNode.color || '#4F46E5' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 750, textTransform: 'uppercase', color: selectedNode.color || '#4F46E5', letterSpacing: '0.04em' }}>
                  {selectedNode.group}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 750, margin: '3px 0 0 0', color: '#0F172A', wordBreak: 'break-word' }}>
                {selectedNode.label}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: 6,
                padding: 4,
                color: '#64748B',
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Details Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.78rem' }}>
            {selectedNode.details?.path && (
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 650, textTransform: 'uppercase' }}>File Path</div>
                <div style={{ fontFamily: 'monospace', color: '#0284C7', background: 'rgba(2, 132, 199, 0.08)', padding: '4px 8px', borderRadius: 6, marginTop: 2, wordBreak: 'break-all' }}>
                  {selectedNode.details.path}
                </div>
              </div>
            )}

            {selectedNode.details?.line && (
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 650, textTransform: 'uppercase' }}>AST Line Range</div>
                <div style={{ color: '#0F172A', marginTop: 2, fontWeight: 650 }}>
                  {selectedNode.details.line}
                </div>
              </div>
            )}

            {selectedNode.details?.docstring && (
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 650, textTransform: 'uppercase' }}>Docstring & Documentation</div>
                <div style={{ color: '#334155', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '7px 9px', borderRadius: 6, marginTop: 3, fontSize: '0.75rem', lineHeight: '1.4', fontStyle: 'italic' }}>
                  "{selectedNode.details.docstring}"
                </div>
              </div>
            )}

            {selectedNode.details?.labels && (
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 650, textTransform: 'uppercase' }}>Neo4j Labels</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                  {selectedNode.details.labels.map((lbl, idx) => (
                    <span key={idx} style={{ fontSize: '0.65rem', background: 'rgba(99, 91, 255, 0.1)', color: '#4F46E5', border: '1px solid rgba(99, 91, 255, 0.25)', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                      :{lbl}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 650, textTransform: 'uppercase' }}>System Element ID</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#64748B', background: '#F1F5F9', padding: '3px 6px', borderRadius: 4, marginTop: 2, wordBreak: 'break-all' }}>
                {selectedNode.id}
              </div>
            </div>
          </div>

          {/* Connected Relationships Section */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={12} color="#4F46E5" />
              Connected Relationships ({nodeConnections.length})
            </div>
            {nodeConnections.length === 0 ? (
              <div style={{ fontSize: '0.73rem', color: '#94A3B8', fontStyle: 'italic' }}>
                No direct connected relationships found in current query slice.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 150, overflowY: 'auto' }}>
                {nodeConnections.map((conn, idx) => (
                  <div
                    key={idx}
                    onClick={() => conn.rawNode && handleNodeClick(conn.rawNode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 7px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      cursor: conn.rawNode ? 'pointer' : 'default',
                      transition: 'all 0.1s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 91, 255, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.62rem', background: 'rgba(99, 91, 255, 0.15)', color: '#4338CA', padding: '1px 5px', borderRadius: 4, fontWeight: 650 }}>
                        {conn.rel}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {conn.targetLabel}
                      </span>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: conn.targetColor, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dev Studio Hop Button */}
          {(selectedNode.group === 'Function' || selectedNode.group === 'SourceFile') && (
            <Link
              href={`/dev-studio?file=${encodeURIComponent(selectedNode.details?.path || '')}&symbol=${encodeURIComponent(selectedNode.label || '')}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '7px 10px',
                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                borderRadius: 8,
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 650,
                textDecoration: 'none',
                textAlign: 'center',
                marginTop: 2,
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <ExternalLink size={12} />
              Inspect in Developer Code Studio
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
