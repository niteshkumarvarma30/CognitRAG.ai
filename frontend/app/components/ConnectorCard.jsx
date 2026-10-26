"use client";

import React, { useState } from "react";
import { CheckCircle2, RefreshCw, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";

export default function ConnectorCard({
  provider,
  title,
  description,
  icon: Icon,
  connected = false,
  workspaceName = null,
  syncPhase = "idle",
  itemsIndexed = 0,
  lastSyncedAt = null,
  onConnect = null,
  onSync = null,
  onManage = null,
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSyncClick = async () => {
    if (isSyncing || !onSync) return;
    setIsSyncing(true);
    try {
      await onSync(provider);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = () => {
    if (!connected) {
      return (
        <span style={{
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#94A3B8',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748B' }} />
          Not Connected
        </span>
      );
    }
    if (syncPhase === "fast_pass" || isSyncing) {
      return (
        <span style={{
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: 'rgba(56, 189, 248, 0.12)',
          color: '#38BDF8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <RefreshCw size={12} className="animate-spin" />
          Syncing...
        </span>
      );
    }
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: 'rgba(16, 185, 129, 0.12)',
        color: '#34D399',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <CheckCircle2 size={12} />
        Connected
      </span>
    );
  };

  const providerThemes = {
    slack: {
      accent: '#E01E5A',
      bg: 'rgba(224, 30, 90, 0.12)',
      border: 'rgba(224, 30, 90, 0.25)',
      buttonBg: 'linear-gradient(135deg, #4A154B, #611f69)'
    },
    github: {
      accent: '#F8FAFC',
      bg: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.18)',
      buttonBg: 'linear-gradient(135deg, #24292F, #1F2428)'
    },
    jira: {
      accent: '#0052CC',
      bg: 'rgba(0, 82, 204, 0.15)',
      border: 'rgba(0, 82, 204, 0.3)',
      buttonBg: 'linear-gradient(135deg, #0052CC, #0747A6)'
    },
    notion: {
      accent: '#F8FAFC',
      bg: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.18)',
      buttonBg: 'linear-gradient(135deg, #18181B, #27272A)'
    }
  };

  const theme = providerThemes[provider] || {
    accent: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.3)',
    buttonBg: 'linear-gradient(135deg, #6366F1, #4F46E5)'
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        borderRadius: '16px',
        background: 'rgba(16, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isHovered ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
        boxShadow: isHovered ? '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.25s ease',
        minHeight: '220px'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 16px ${theme.bg}`
          }}>
            {Icon && <Icon size={24} />}
          </div>
          {getStatusBadge()}
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: '0 0 18px 0', lineHeight: 1.55 }}>
          {description}
        </p>

        {connected && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.8125rem',
            color: '#94A3B8',
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {workspaceName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Account / Space:</span>
                <strong style={{ color: '#38BDF8', fontWeight: 650 }}>
                  {provider === 'github' ? `@${workspaceName.replace('@', '')}` : workspaceName}
                </strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Indexed:</span>
              <strong style={{ color: '#F8FAFC' }}>{itemsIndexed.toLocaleString()}</strong>
            </div>
            {lastSyncedAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Updated:</span>
                <span style={{ color: '#CBD5E1' }}>
                  {new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {connected ? (
          <>
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.8125rem',
                fontWeight: 650,
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={() => onManage ? onManage(provider) : (onConnect && onConnect(provider))}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: 'transparent',
                color: '#CBD5E1',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer'
              }}
            >
              Manage
            </button>
            <button
              onClick={() => onConnect && onConnect(provider)}
              title={`Re-authenticate ${title} OAuth session`}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#94A3B8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#38BDF8';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <RefreshCw size={12} />
              Reconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect && onConnect(provider)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: theme.buttonBg,
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.filter = 'brightness(1.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Connect {title}
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
