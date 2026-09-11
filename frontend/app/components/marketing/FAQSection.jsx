'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { 
      q: 'What is a Company Brain?', 
      a: 'A Company Brain connects all the knowledge scattered across your workplace tools—such as Slack, Jira, GitHub, and documents—into a single, trusted intelligence center. It enables your team and AI tools to get instant, verified answers without digging through endless files or message threads.' 
    },
    { 
      q: 'How is CognitRAG different from standard enterprise search?', 
      a: 'Traditional search simply gives you a list of links and files to read through. CognitRAG understands how your projects, discussions, and decisions connect across different tools, delivering direct answers backed by clear citations you can verify.' 
    },
    { 
      q: 'How does CognitRAG ensure high accuracy compared to typical AI tools?', 
      a: 'Typical AI tools often give generic or outdated answers because they treat documents in isolation. CognitRAG tracks the relationships between your teams, tasks, and historical decisions over time, ensuring every response is grounded in current organizational truth.' 
    },
    { 
      q: 'Does CognitRAG make things up or hallucinate?', 
      a: 'We prioritize truthfulness over guessing. If the required information is missing or unclear in your connected sources, CognitRAG will explicitly tell you that it does not have enough verified information rather than making assumptions. Every claim is linked directly to its source.' 
    },
    { 
      q: 'How do you keep our company data secure and respect permissions?', 
      a: 'CognitRAG strictly mirrors the permissions already configured in your workplace tools. If a team member does not have access to a private channel, restricted project, or confidential document in the original source, CognitRAG will never reveal that information to them.' 
    },
    { 
      q: 'What workplace tools are supported?', 
      a: 'We currently support Slack, GitHub, Jira, Notion, Google Workspace, and direct file uploads (including PDFs and documents). Integrations for Salesforce, Confluence, and Microsoft Teams are coming soon.' 
    },
    { 
      q: 'Can our internal AI agents and tools connect to CognitRAG?', 
      a: 'Yes. CognitRAG serves as a secure knowledge engine for your AI agents and custom internal tools, providing them with authorized company context while strictly enforcing your organization’s access policies.' 
    },
    { 
      q: 'How do we get started?', 
      a: 'Request early access and our team will set up a personalized onboarding session. Most teams can connect their first data source and begin querying within an hour.' 
    }
  ];

  return (
    <section id="faq" style={{ maxWidth: '780px', margin: '0 auto', padding: 'var(--space-20, 80px) var(--space-4, 16px)', scrollMarginTop: '80px' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--space-12, 48px)' }}>
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
