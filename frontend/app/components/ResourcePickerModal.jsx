"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Search, GitFork, Star, Lock, Globe, RefreshCw, 
  CheckCircle2, AlertCircle, ArrowUpRight, FolderGit2,
  Hash, BookOpen, Layers, ShieldCheck
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function ResourcePickerModal({
  isOpen,
  onClose,
  provider,
  title,
  tenantId,
  workspaceName,
  onSyncSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [ingestingMap, setIngestingMap] = useState({});
  const [notification, setNotification] = useState(null);

  const resolveTid = () => {
    return tenantId || (typeof window !== "undefined" ? localStorage.getItem("cognitrag_tenant_id") : "") || "";
  };

  const getAuthUrl = (prov) => {
    const apiBase = getApiUrl();
    const tid = resolveTid();
    if (prov === "slack") {
      return `${apiBase}/api/v1/slack/install?tenant_id=${tid}`;
    } else if (prov === "github") {
      return `${apiBase}/api/v1/integrations/github/auth?tenant_id=${tid}`;
    } else if (prov === "notion") {
      return `${apiBase}/api/v1/integrations/notion/auth?tenant_id=${tid}`;
    } else if (prov === "jira") {
      return `${apiBase}/api/v1/integrations/jira/auth?tenant_id=${tid}`;
    }
    return "#";
  };

  useEffect(() => {
    if (!isOpen || !provider) return;
    fetchResources();
  }, [isOpen, provider]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    setSearch("");
    try {
      const apiBase = getApiUrl();
      const tid = resolveTid();

      let endpoint = "";
      if (provider === "github") {
        endpoint = `${apiBase}/api/v1/integrations/github/repos?tenant_id=${tid}`;
      } else if (provider === "slack") {
        endpoint = `${apiBase}/api/v1/integrations/slack/channels?tenant_id=${tid}`;
      } else if (provider === "notion") {
        endpoint = `${apiBase}/api/v1/integrations/notion/pages?tenant_id=${tid}`;
      } else if (provider === "jira") {
        endpoint = `${apiBase}/api/v1/integrations/jira/projects?tenant_id=${tid}`;
      }

      if (!endpoint) return;

      let lastErr = null;
      let data = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            data = await res.json();
            break;
          } else {
            const errData = await res.json().catch(() => ({}));
            lastErr = new Error(errData.detail || `Failed to fetch ${provider} resources`);
          }
        } catch (e) {
          lastErr = e;
        }
        await new Promise(r => setTimeout(r, 400));
      }

      if (!data) {
        throw lastErr || new Error(`Failed to load ${provider} resources`);
      }

      if (provider === "github") {
        setItems(data.repos || []);
      } else if (provider === "slack") {
        setItems(data.channels || []);
      } else if (provider === "notion") {
        setItems(data.pages || []);
      } else if (provider === "jira") {
        setItems(data.projects || []);
      }
    } catch (err) {
      console.error(`Error loading resources for ${provider}:`, err);
      setError(err.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleIngestGithubRepo = async (repoFullName) => {
    setIngestingMap(prev => ({ ...prev, [repoFullName]: true }));
    setNotification(null);
    try {
      const apiBase = getApiUrl();
      const tid = resolveTid();

      const res = await fetch(`${apiBase}/api/v1/ingest/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tid,
          repo_full_name: repoFullName
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to start repository ingestion");
      }

      const result = await res.json();
      setNotification({
        type: "success",
        message: result.message || `Successfully queued ${repoFullName} for ingestion.`
      });

      if (onSyncSuccess) {
        onSyncSuccess();
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
      setNotification({
        type: "error",
        message: err.message || "Ingestion trigger failed"
      });
    } finally {
      setIngestingMap(prev => ({ ...prev, [repoFullName]: false }));
    }
  };

  const handleIngestSlackChannel = async (channelId, channelName) => {
    setIngestingMap(prev => ({ ...prev, [channelId]: true }));
    setNotification(null);
    try {
      const apiBase = getApiUrl();
      const tid = resolveTid();

      const res = await fetch(`${apiBase}/api/v1/ingest/slack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tid,
          channel_id: channelId,
          channel_name: channelName
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to start Slack channel ingestion");
      }

      const result = await res.json();
      setNotification({
        type: "success",
        message: result.message || `Successfully queued ${channelName} for ingestion.`
      });

      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error("Slack ingestion failed:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to ingest Slack channel"
      });
    } finally {
      setIngestingMap(prev => ({ ...prev, [channelId]: false }));
    }
  };

  const handleIngestNotionPage = async (pageId, pageTitle) => {
    setIngestingMap(prev => ({ ...prev, [pageId]: true }));
    setNotification(null);
    try {
      const apiBase = getApiUrl();
      const tid = resolveTid();

      const res = await fetch(`${apiBase}/api/v1/ingest/notion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tid,
          page_id: pageId,
          page_title: pageTitle
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to start Notion page ingestion");
      }

      const result = await res.json();
      setNotification({
        type: "success",
        message: result.message || `Successfully queued "${pageTitle}" for ingestion.`
      });

      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error("Notion ingestion failed:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to ingest Notion page"
      });
    } finally {
      setIngestingMap(prev => ({ ...prev, [pageId]: false }));
    }
  };

  const handleIngestJiraProject = async (projectKey) => {
    setIngestingMap(prev => ({ ...prev, [projectKey]: true }));
    setNotification(null);
    try {
      const apiBase = getApiUrl();
      const tid = resolveTid();

      const res = await fetch(`${apiBase}/api/v1/ingest/jira`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tid,
          project_key: projectKey
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to start Jira project ingestion");
      }

      const result = await res.json();
      setNotification({
        type: "success",
        message: result.message || `Successfully queued ${projectKey} issues for ingestion.`
      });

      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error("Jira ingestion failed:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to ingest Jira project"
      });
    } finally {
      setIngestingMap(prev => ({ ...prev, [projectKey]: false }));
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (provider === "github") {
      return (item.full_name || "").toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q);
    } else if (provider === "slack") {
      return (item.name || "").toLowerCase().includes(q) || (item.topic || "").toLowerCase().includes(q);
    } else if (provider === "notion") {
      return (item.name || "").toLowerCase().includes(q);
    } else if (provider === "jira") {
      return (item.name || "").toLowerCase().includes(q) || (item.key || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(3, 7, 18, 0.75)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          background: "#0B0F19",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15)",
          color: "#F8FAFC",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.02)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818CF8",
                border: "1px solid rgba(99, 102, 241, 0.3)"
              }}>
                {provider} Scope Manager
              </span>
              {workspaceName && (
                <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                  Connected to <strong style={{ color: "#38BDF8" }}>{workspaceName}</strong>
                </span>
              )}
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 750, margin: "6px 0 0 0", color: "#F8FAFC" }}>
              Select & Manage {title} Resources
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a
              href={getAuthUrl(provider)}
              title={`Re-authenticate ${title} OAuth session or switch account`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: 650,
                background: "rgba(56, 189, 248, 0.1)",
                color: "#38BDF8",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <RefreshCw size={12} />
              Re-OAuth {title}
            </a>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "8px",
                color: "#94A3B8",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div style={{
            margin: "16px 24px 0 24px",
            padding: "12px 16px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem",
            background: notification.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${notification.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: notification.type === "success" ? "#34D399" : "#F87171"
          }}>
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Info Banner for Slack / Notion */}
        {provider === "slack" && (
          <div style={{
            margin: "16px 24px 0 24px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            fontSize: "0.8125rem",
            color: "#BAE6FD",
            lineHeight: 1.5
          }}>
            💡 <strong>Privacy-First Bot Invite:</strong> To index a channel, invite the bot inside Slack by typing{" "}
            <code style={{ background: "rgba(0,0,0,0.4)", padding: "2px 6px", borderRadius: "4px" }}>/invite @CognitRAG</code>.
            Channels listed below are accessible by your current bot credentials.
          </div>
        )}

        {provider === "notion" && (
          <div style={{
            margin: "16px 24px 0 24px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(168, 85, 247, 0.08)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            fontSize: "0.8125rem",
            color: "#E9D5FF",
            lineHeight: 1.5
          }}>
            🔒 <strong>Granular Page Isolation:</strong> Notion enforces page permissions at the OAuth stage.
            Only the pages and databases granted during authorization are visible and indexed.
          </div>
        )}

        {/* Search Bar */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            <Search size={16} style={{ position: "absolute", left: "14px", color: "#64748B" }} />
            <input
              type="text"
              placeholder={`Search ${items.length} ${provider} items...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#F8FAFC",
                fontSize: "0.875rem",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Resource List */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 24px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", color: "#94A3B8", gap: "12px" }}>
              <RefreshCw size={24} className="animate-spin text-indigo-400" />
              <span>Scanning {title} workspace for accessible containers...</span>
            </div>
          ) : error ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#F87171" }}>
              <AlertCircle size={32} style={{ margin: "0 auto 10px auto" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
              <button 
                onClick={fetchResources}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#F8FAFC",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  cursor: "pointer"
                }}
              >
                Retry Scan
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
              {search ? (
                `No items found matching "${search}".`
              ) : (
                <div>
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>
                    No {title} resources loaded. Your OAuth session may have expired or permissions were updated.
                  </p>
                  <div style={{ marginTop: "16px" }}>
                    <a
                      href={getAuthUrl(provider)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 18px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #4F46E5, #2563EB)",
                        color: "#FFFFFF",
                        textDecoration: "none",
                        fontSize: "0.8125rem",
                        fontWeight: 650,
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)"
                      }}
                    >
                      <RefreshCw size={13} /> Re-authorize {title}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            filteredItems.map(item => {
              if (provider === "github") {
                const isIngesting = ingestingMap[item.full_name];
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.07)",
                      gap: "16px"
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FolderGit2 size={16} color="#818CF8" />
                        <a 
                          href={item.html_url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            fontWeight: 650,
                            color: "#F8FAFC",
                            fontSize: "0.9375rem",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          {item.full_name}
                          <ArrowUpRight size={13} color="#64748B" />
                        </a>
                        {item.private ? (
                          <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", gap: "3px" }}>
                            <Lock size={10} /> Private
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "3px" }}>
                            <Globe size={10} /> Public
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.description}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px", fontSize: "0.75rem", color: "#64748B" }}>
                        {item.language && <span>🟡 {item.language}</span>}
                        <span><Star size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {item.stargazers_count}</span>
                        <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleIngestGithubRepo(item.full_name)}
                      disabled={isIngesting}
                      style={{
                        flexShrink: 0,
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        background: isIngesting ? "rgba(99, 102, 241, 0.2)" : "linear-gradient(135deg, #4F46E5, #6366F1)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        cursor: isIngesting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
                      }}
                    >
                      <RefreshCw size={12} className={isIngesting ? "animate-spin" : ""} />
                      {isIngesting ? "Queuing..." : "Ingest Docs"}
                    </button>
                  </div>
                );
              }

              if (provider === "slack") {
                const isIngesting = ingestingMap[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.07)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 650, color: "#F8FAFC" }}>
                        <Hash size={15} color="#E01E5A" />
                        <span>{item.name}</span>
                      </div>
                      {item.topic && (
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "#94A3B8" }}>
                          {item.topic}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: "rgba(16, 185, 129, 0.12)",
                        color: "#34D399",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <ShieldCheck size={12} /> Monitored
                      </span>
                      <button
                        onClick={() => handleIngestSlackChannel(item.id, item.name)}
                        disabled={isIngesting}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: isIngesting ? "rgba(224, 30, 90, 0.2)" : "rgba(224, 30, 90, 0.18)",
                          color: "#FDA4AF",
                          border: "1px solid rgba(224, 30, 90, 0.35)",
                          cursor: isIngesting ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        <RefreshCw size={11} className={isIngesting ? "animate-spin" : ""} />
                        {isIngesting ? "Syncing..." : "Sync History"}
                      </button>
                    </div>
                  </div>
                );
              }

              if (provider === "notion") {
                const isIngesting = ingestingMap[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.07)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BookOpen size={16} color="#A855F7" />
                      <span style={{ fontWeight: 600, color: "#F8FAFC" }}>{item.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.8125rem",
                            color: "#94A3B8",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 10px"
                          }}
                        >
                          Open <ArrowUpRight size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => handleIngestNotionPage(item.id, item.name)}
                        disabled={isIngesting}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: isIngesting ? "rgba(168, 85, 247, 0.2)" : "linear-gradient(135deg, #7C3AED, #A855F7)",
                          color: "#FFFFFF",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          cursor: isIngesting ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        <RefreshCw size={11} className={isIngesting ? "animate-spin" : ""} />
                        {isIngesting ? "Ingesting..." : "Ingest Page"}
                      </button>
                    </div>
                  </div>
                );
              }

              if (provider === "jira") {
                const isIngesting = ingestingMap[item.key];
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.07)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Layers size={16} color="#0052CC" />
                      <div>
                        <span style={{ fontWeight: 650, color: "#F8FAFC" }}>{item.name}</span>
                        <span style={{ marginLeft: "8px", fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(0, 82, 204, 0.2)", color: "#60A5FA" }}>
                          {item.key}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleIngestJiraProject(item.key)}
                      disabled={isIngesting}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: isIngesting ? "rgba(0, 82, 204, 0.2)" : "linear-gradient(135deg, #0052CC, #2563EB)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        cursor: isIngesting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <RefreshCw size={11} className={isIngesting ? "animate-spin" : ""} />
                      {isIngesting ? "Queuing..." : "Ingest Issues"}
                    </button>
                  </div>
                );
              }

              return null;
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "0.8125rem", color: "#64748B" }}>
              {filteredItems.length} {provider} resources available
            </span>
            <a
              href={getAuthUrl(provider)}
              style={{
                fontSize: "0.75rem",
                color: "#38BDF8",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <RefreshCw size={11} /> Re-OAuth / Reconnect
            </a>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "0.8125rem",
              fontWeight: 650,
              background: "rgba(255, 255, 255, 0.08)",
              color: "#F8FAFC",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              cursor: "pointer"
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
