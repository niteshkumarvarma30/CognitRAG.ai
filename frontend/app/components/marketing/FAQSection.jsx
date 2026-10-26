'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const faqs = [
    {
      q: 'How does CognitRAG protect permissions from our existing tools?',
      a: 'CognitRAG strictly enforces user-level permissions at retrieval time. For Slack and GitHub, access mirrors your account’s channel and repository memberships. For Jira and Notion, workspace admins set audience visibility rules. If an answer draws from a restricted source, the source is withheld and only counted.'
    },
    {
      q: 'Does CognitRAG train on our company data?',
      a: 'No. Your code, issue tickets, pull requests, and chat logs are processed exclusively within your tenant namespace for indexing and retrieval. We never train public foundation models on your workspace data.'
    },
    {
      q: 'Can our team ask questions in Hinglish?',
      a: 'Yes. Indian engineering teams frequently communicate in mixed Hindi and English (e.g. “staging pe 401 error kyu aa raha hai?”). CognitRAG is evaluated on code-switching technical phrasing to find the right PRs and tickets.'
    },
    {
      q: 'How is a conflict detected between two documents?',
      a: 'When two sources contradict each other—such as an outdated Notion PRD specifying local .env files versus a merged GitHub PR using AWS Secrets Manager—CognitRAG flags the older document with an amber conflict chip rather than blending outdated notes as truth.'
    }
  ];

  return (
    <section id="faq" style={{
      padding: '64px 0',
      backgroundColor: 'var(--bg2)',
      borderTop: '1px solid var(--line)'
    }}>
      <div className="landing-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ind)',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            Questions
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            fontWeight: 400
          }}>
            Frequently asked questions
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '0.96rem',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            Straightforward answers about our permissions, language models, and data security.
          </p>
        </div>

        <div style={{
          maxWidth: '740px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {faqs.map((faq, i) => (
            <details
              key={i}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '16px 20px',
                cursor: 'pointer'
              }}
            >
              <summary style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                userSelect: 'none'
              }}>
                <span>{faq.q}</span>
                <ChevronDown size={18} style={{ color: 'var(--mute)', flexShrink: 0 }} />
              </summary>
              <p style={{
                marginTop: '12px',
                marginBottom: 0,
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: 'var(--mute)'
              }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px', fontSize: '0.92rem', color: 'var(--mute)' }}>
          Have more questions, custom security requirements, or need help? Reach out directly at{' '}
          <a 
            href="mailto:niteshkumarvarma@cognitrag.com" 
            style={{ color: 'var(--ind)', fontWeight: 600, textDecoration: 'none' }}
          >
            niteshkumarvarma@cognitrag.com
          </a>
        </div>
      </div>
    </section>
  );
}
