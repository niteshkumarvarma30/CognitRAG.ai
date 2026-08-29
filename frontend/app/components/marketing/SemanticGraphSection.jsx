'use client';

export default function SemanticGraphSection() {
  const nodes = [
    { id: 'billing', label: 'Billing Service', x: 50, y: 40, size: 'lg', color: 'var(--primary)' },
    { id: 'pr', label: 'PR #1287', x: 20, y: 30, size: 'md', color: 'var(--success)' },
    { id: 'inc', label: 'INC-902', x: 80, y: 25, size: 'md', color: 'var(--error)' },
    { id: 'sop', label: 'Billing SOP v3.2', x: 50, y: 75, size: 'md', color: 'var(--violet)' },
    { id: 'payment', label: 'Payment API', x: 15, y: 65, size: 'sm', color: 'var(--info)' },
    { id: 'sarah', label: '@sarah.chen', x: 85, y: 70, size: 'sm', color: 'var(--warning)' },
  ];

  const edges = [
    { from: 'pr', to: 'billing', label: 'CHANGED' },
    { from: 'inc', to: 'billing', label: 'AFFECTED' },
    { from: 'sop', to: 'billing', label: 'DOCUMENTS' },
    { from: 'payment', to: 'billing', label: 'DEPENDS_ON' },
    { from: 'sarah', to: 'sop', label: 'APPROVED' },
    { from: 'inc', to: 'sop', label: 'TRIGGERED' },
  ];

  const sizeMap = { lg: 56, md: 44, sm: 36 };
  const fontMap = { lg: '0.6875rem', md: '0.625rem', sm: '0.5625rem' };

  return (
    <section style={{ padding: 'var(--space-24) var(--space-6)', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{
            display: 'inline-block', fontSize: '0.6875rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 'var(--space-3)',
          }}>
            KNOWLEDGE GRAPH
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
            Search finds information.<br />Relationships reveal context.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
            CognitRAG builds a semantic knowledge graph connecting services, incidents, decisions, 
            people, and documents across your entire organization.
          </p>
        </div>

        {/* Graph visualization */}
        <div style={{
          background: 'var(--surface-soft)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)',
          position: 'relative', height: '380px', overflow: 'hidden',
        }}>
          {/* SVG edges */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {edges.map((edge, i) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              return (
                <line key={i}
                  x1={`${fromNode.x}%`} y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`} y2={`${toNode.y}%`}
                  stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div key={node.id} style={{
              position: 'absolute',
              left: `${node.x}%`, top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              cursor: 'pointer',
              transition: 'transform 300ms var(--ease-out)',
            }}>
              <div style={{
                width: sizeMap[node.size], height: sizeMap[node.size],
                borderRadius: '50%',
                background: `${node.color}18`,
                border: `2px solid ${node.color}50`,
                boxShadow: `0 0 16px ${node.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: sizeMap[node.size] * 0.4, height: sizeMap[node.size] * 0.4,
                  borderRadius: '50%', background: node.color,
                }} />
              </div>
              <span style={{
                fontSize: fontMap[node.size], fontWeight: 600,
                color: 'var(--text-primary)',
                background: 'var(--surface)',
                padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                boxShadow: 'var(--shadow-xs)',
              }}>
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
