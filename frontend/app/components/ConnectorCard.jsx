"use client";

import React, { useState } from "react";
import { CheckCircle2, RefreshCw, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";

export default function ConnectorCard({
  provider,
  title,
  description,
  icon: Icon,
  connected = false,
  syncPhase = "idle",
  itemsIndexed = 0,
  lastSyncedAt = null,
  onConnect = null,
  onSync = null,
}) {
  const [isSyncing, setIsSyncing] = useState(false);

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
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
          Not Connected
        </span>
      );
    }
    if (syncPhase === "fast_pass" || isSyncing) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Connected
      </span>
    );
  };

  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all backdrop-blur-xl group">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-white group-hover:scale-105 transition-transform">
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          {getStatusBadge()}
        </div>

        <h3 className="text-lg font-semibold text-zinc-100 mb-1">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">{description}</p>

        {connected && (
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-400 space-y-1 mb-5">
            <div className="flex justify-between">
              <span>Items Indexed:</span>
              <span className="font-medium text-zinc-200">{itemsIndexed.toLocaleString()}</span>
            </div>
            {lastSyncedAt && (
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium text-zinc-300">
                  {new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/60">
        {connected ? (
          <>
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              Sync Now
            </button>
            <button
              onClick={() => onConnect && onConnect(provider)}
              className="py-2 px-3 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
            >
              Manage
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect && onConnect(provider)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
          >
            Connect {title}
          </button>
        )}
      </div>
    </div>
  );
}
