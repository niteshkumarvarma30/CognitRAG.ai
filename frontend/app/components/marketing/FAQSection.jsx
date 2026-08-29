'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is a Company Brain?', a: 'A Company Brain is a permission-aware semantic intelligence layer that connects your fragmented enterprise knowledge across Slack, Jira, GitHub, and docs into a unified, searchable, and verifiable context store for both humans and AI agents.' },
    { q: 'How is CognitRAG different from enterprise search?', a: 'Enterprise search finds files. CognitRAG synthesizes cross-system context, verifies evidence, maps entity relationships, and delivers grounded answers with full source citations — not just links to documents.' },
    { q: 'How is this different from basic RAG?', a: 'Basic RAG is naive vector chunking. CognitRAG integrates hybrid search (BM25 + vector), multi-stage reranking, knowledge graph expansion, temporal reasoning, and governed business definitions to produce accurate, trustworthy answers.' },
    { q: 'Does CognitRAG hallucinate?', a: 'We optimize for truthfulness over helpfulness. When evidence is insufficient, CognitRAG explicitly says "I don\'t have enough context" rather than guessing. Our benchmarks show 100% faithfulness — every claim is grounded in source context.' },
    { q: 'How are permissions handled?', a: 'CognitRAG enforces the same access controls as your source systems. Row-Level Security in PostgreSQL, source-level ACLs, and JWT-based RBAC ensure users only see content they are authorized to access.' },
    { q: 'What data sources are supported?', a: 'We currently support Slack, GitHub, Jira, Notion, Google Workspace, and direct file uploads (PDF, Markdown). Salesforce, Confluence, and Microsoft Teams are on our roadmap.' },
    { q: 'Can AI agents use CognitRAG?', a: 'Yes. CognitRAG exposes company context through REST APIs and the Model Context Protocol (MCP), enabling AI agents to query knowledge, retrieve policies, and execute skills with proper authorization.' },
    { q: 'How do I get started?', a: 'Request early access and we\'ll schedule a 30-minute onboarding call. Most teams are up and running with their first connected source in under an hour.' }
  ];

  return (
    <section style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--space-16, 64px) var(--space-4, 16px)' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--space-12, 48px)' }}>
        Frequently Asked Questions
      </h2>
      
      <div>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}
            >
              {faq.q}
              <ChevronDown 
                size={20} 
                style={{ 
                  transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)', 
                  transition: 'transform var(--duration-normal, 250ms) var(--ease-out, ease)',
                  color: 'var(--text-muted)'
                }} 
              />
            </button>
            {openIndex === i && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, paddingTop: '8px' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
