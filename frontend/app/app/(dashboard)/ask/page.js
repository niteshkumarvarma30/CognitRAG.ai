'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Loader2, Brain, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@/lib/api';
import CitationAuditPanel from '@/components/CitationAuditPanel';
import ContradictionAlert from '@/components/ContradictionAlert';
import LanguageTagBadge from '@/components/LanguageTagBadge';
import HiddenSourcesNotice from '@/components/HiddenSourcesNotice';
import FeedbackButtons from '@/components/FeedbackButtons';
import FreshnessBadge from '@/components/FreshnessBadge';

export default function AskPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTenantId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cognitrag_tenant_id') || user?.id || 'default';
    }
    return 'default';
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: getTenantId(),
          user_id: user?.id || 'default_user',
          message: text,
          chat_history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || data.generation || 'No answer found.',
        citations: data.citations || [],
        contradictions: data.contradictions || [],
        language_detected: data.language_detected || 'en'
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Something went wrong. Is the backend running on localhost:8000?',
        citations: [], contradictions: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording (Sarvam ASR)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await transcribeAudio(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (e) { alert('Microphone access required for voice input.'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'voice_query.webm');
      const res = await fetch(`${getApiUrl()}/api/v1/voice/transcribe`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const transcribed = data.transcription || data.text || '';
        if (transcribed) await sendMessage(transcribed);
      }
    } catch (e) { console.error('Transcription failed', e); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 0 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Brain size={22} style={{ color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Ask Brain</h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
            Type in English or Hinglish
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 0' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Brain size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ask anything</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Try: "yaar, last sprint mein auth ke baare mein kya decide kiya?" 🇮🇳
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '1.5rem' }}>
            {msg.role === 'user' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '75%', padding: '0.7rem 1rem',
                  borderRadius: '16px 16px 4px 16px',
                  background: 'var(--accent)', color: '#000',
                  fontSize: '0.9rem', fontWeight: 500
                }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary, #8b5cf6))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Brain size={16} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  {/* Language detected badge */}
                  {msg.language_detected && msg.language_detected !== 'en' && (
                    <div style={{ marginBottom: '0.4rem' }}>
                      <LanguageTagBadge tag={msg.language_detected} size="xs" />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>query detected</span>
                    </div>
                  )}

                  {/* Answer */}
                  <div style={{
                    padding: '0.9rem 1.1rem',
                    borderRadius: '4px 16px 16px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontSize: '0.9rem', lineHeight: 1.65,
                    color: 'var(--text-primary)'
                  }}>
                    {msg.content}
                  </div>

                  {/* Contradiction alert */}
                  {msg.contradictions?.length > 0 && (
                    <ContradictionAlert
                      contradictions={msg.contradictions}
                      tenantId={getTenantId()}
                    />
                  )}

                  {/* Hidden sources notice if confidential citations were withheld */}
                  {msg.hidden_citations > 0 && (
                    <HiddenSourcesNotice
                      count={msg.hidden_citations}
                      withheldSources={msg.withheld_sources}
                    />
                  )}

                  {/* Claim-level citations */}
                  {msg.citations?.length > 0 && (
                    <CitationAuditPanel citations={msg.citations} compact />
                  )}

                  {/* Feedback rating & freshness */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                    <FeedbackButtons queryLogId={msg.query_log_id} />
                    {msg.timestamp && <FreshnessBadge timestamp={msg.timestamp} />}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Loader2 size={16} color="#fff" className="animate-spin" />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Searching company brain...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem 0 1.5rem', flexShrink: 0,
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '0.6rem 0.75rem'
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Type in English or Hinglish... (Enter to send)"
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'none',
              lineHeight: 1.5, padding: '0.2rem 0', fontFamily: 'inherit'
            }}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            title="Voice input (Sarvam ASR — supports Hinglish)"
            style={{
              padding: '0.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: isRecording ? 'rgba(239,68,68,0.15)' : 'transparent',
              color: isRecording ? '#ef4444' : 'var(--text-muted)'
            }}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '0.4rem 0.75rem', borderRadius: '10px', border: 'none',
              cursor: 'pointer', background: 'var(--accent)', color: '#000',
              fontWeight: 700, fontSize: '0.85rem',
              opacity: (!input.trim() || isLoading) ? 0.5 : 1
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
          Hinglish supported · Voice via Sarvam ASR · Citations linked to exact sources
        </div>
      </div>
    </div>
  );
}
