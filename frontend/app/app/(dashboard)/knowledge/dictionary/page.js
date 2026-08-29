'use client';
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { BookA, Plus, Edit2, Trash2 } from 'lucide-react';

export default function SemanticDictionaryPage() {
  const [terms] = useState([
    {
      id: 1,
      term: "MAU",
      definition: "Monthly Active Users. The number of unique users who have logged in within the last 30 days.",
      owner: "Data Team",
      scope: "Global",
      version: 2
    },
    {
      id: 2,
      term: "Kong",
      definition: "Our API Gateway handling all external ingress traffic and rate limiting.",
      owner: "Platform Eng",
      scope: "Engineering",
      version: 1
    }
  ]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1000px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Semantic Dictionary</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Govern company jargon and acronyms. The AI automatically expands these in queries to guarantee perfect context retrieval.
          </p>
        </div>
        <Button variant="primary">
          <Plus size={16} /> Add Term
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {terms.map(item => (
          <Card key={item.id} style={{ padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {item.term}
                </h3>
                <Badge variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  v{item.version}
                </Badge>
                {item.scope && <Badge variant="secondary">{item.scope}</Badge>}
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {item.definition}
              </p>
              <div style={{ marginTop: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Governed by: <span style={{ fontWeight: 600 }}>{item.owner}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'var(--space-6)' }}>
              <Button variant="ghost" size="sm" style={{ padding: '8px' }}>
                <Edit2 size={16} />
              </Button>
              <Button variant="ghost" size="sm" style={{ padding: '8px', color: 'var(--error)' }}>
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
    </div>
  );
}
