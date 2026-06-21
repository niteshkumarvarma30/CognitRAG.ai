'use client';
import React from 'react';
import { GitCommit, Database, Zap, FileText } from 'lucide-react';

const TimelineView = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Workspace Timeline</h1>
        <p className="page-subtitle">Chronological evolution of the workspace: decisions, migrations, and key milestones.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>June 2026</h2>
        
        <div className="timeline-list">
          
          <div className="timeline-item">
            <div className="timeline-marker"><Database size={20} /></div>
            <div className="timeline-content">
              <div className="timeline-date">June 18, 2026</div>
              <div className="timeline-title">Migrated Pinecone → Supabase pgvector</div>
              <div className="timeline-reason">
                <strong>Reason:</strong> Cost optimization and unified relational + vector data storage.
              </div>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"><Zap size={20} /></div>
            <div className="timeline-content">
              <div className="timeline-date">June 15, 2026</div>
              <div className="timeline-title">Implemented Corrective RAG (CRAG)</div>
              <div className="timeline-reason">
                <strong>Reason:</strong> Improved retrieval accuracy by adding a Jina cross-encoder reranking filter and web fallback.
              </div>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"><GitCommit size={20} /></div>
            <div className="timeline-content">
              <div className="timeline-date">June 12, 2026</div>
              <div className="timeline-title">Added Neo4j Graph Relationship Extraction</div>
              <div className="timeline-reason">
                <strong>Reason:</strong> Needed to answer complex multi-hop questions across disconnected documents.
              </div>
            </div>
          </div>

        </div>

        <h2 style={{ fontSize: '1.5rem', margin: '3rem 0 2rem 0' }}>May 2026</h2>

        <div className="timeline-list">
          <div className="timeline-item">
            <div className="timeline-marker"><FileText size={20} /></div>
            <div className="timeline-content">
              <div className="timeline-date">May 28, 2026</div>
              <div className="timeline-title">Initial Project Ingestion</div>
              <div className="timeline-reason">
                <strong>Reason:</strong> Foundation of the Workspace Memory Infrastructure established.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TimelineView;

