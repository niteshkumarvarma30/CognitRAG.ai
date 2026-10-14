'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ShieldCheck, MessageSquare, Globe, GitPullRequest, Lock, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Loader2, Clock } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function AuditPage() {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [citationsMap, setCitationsMap] = useState({});

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    try {
      const tid = localStorage.getItem('cognitrag_tenant_id') || '4aedf36c-6bcb-490a-98cc-6293366dd891';
      const apiBase = getApiUrl();
      const res = await fetch(`${apiBase}/api/v1/audit/logs?tenant_id=${tid}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch live audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (logId) => {
    if (expandedId === logId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(logId);

    if (!citationsMap[logId]) {
      try {
        const apiBase = getApiUrl();
        const res = await fetch(`${apiBase}/api/v1/audit/logs/${logId}/citations`);
        if (res.ok) {
          const data = await res.json();
          setCitationsMap((prev) => ({ ...prev, [logId]: data.citations || [] }));
        }
      } catch (e) {
        console.error('Failed to load citations for log', e);
      }
    }
  };

  const getSurfaceIcon = (surface) => {
    switch (surface) {
      case 'slack':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'github':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20 text-indigo-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <span>🛡️ Answer Audit & Compliance</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Complete transparent record of queries, generated claims, structured citations, and audience boundary enforcement across Web, Slack, and GitHub.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-40 text-indigo-400" />
          <div className="font-semibold text-zinc-300 mb-1">No Audit Logs Yet</div>
          <p className="text-xs max-w-sm mx-auto">
            Queries asked via the Web dashboard, Slack /cognitrag command, or GitHub mentions will automatically appear here with audited verification.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const citations = citationsMap[log.id] || [];

            return (
              <div
                key={log.id}
                className="rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-center justify-between p-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/60">
                      {getSurfaceIcon(log.surface)}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-zinc-200 truncate">{log.query_text}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{log.surface}</span>
                        <span>•</span>
                        <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {log.latency_ms && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {log.latency_ms}ms
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {log.hidden_citations > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        <Lock className="w-3 h-3" /> {log.hidden_citations} withheld
                      </span>
                    )}
                    {log.cache_hit && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium text-[11px]">
                        Cache Hit
                      </span>
                    )}
                    <button className="p-1 text-zinc-500 hover:text-zinc-300">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 bg-zinc-950/60 border-t border-zinc-800/80 text-xs space-y-4">
                    <div>
                      <div className="font-semibold text-zinc-400 mb-1">Generated Answer:</div>
                      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm leading-relaxed">
                        {log.answer_text}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-zinc-400 mb-2">Audited Citations & Supporting Evidence:</div>
                      {citations.length === 0 ? (
                        <div className="text-zinc-500 italic">No citations attached to this response.</div>
                      ) : (
                        <div className="space-y-2">
                          {citations.map((c, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-zinc-300">
                                    {c.position}. [{c.source_type?.toUpperCase()}]
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                                      c.derivation === 'structured'
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'bg-blue-500/20 text-blue-300'
                                    }`}
                                  >
                                    {c.derivation}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                                      c.confidence_label === 'high'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-zinc-800 text-zinc-400'
                                    }`}
                                  >
                                    {c.confidence_label} confidence
                                  </span>
                                </div>
                                <div className="text-zinc-400 italic">"{c.claim_text}"</div>
                              </div>
                              {c.raw_ref_url && (
                                <a
                                  href={c.raw_ref_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:text-indigo-300 font-medium underline shrink-0"
                                >
                                  View Source →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
