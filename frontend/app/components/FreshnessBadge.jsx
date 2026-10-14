"use client";

import React from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function FreshnessBadge({ timestamp }) {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  const diffMinutes = Math.floor((new Date() - date) / (1000 * 60));

  let label = "Live";
  let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  let Icon = CheckCircle2;

  if (diffMinutes > 60 * 24) {
    const days = Math.floor(diffMinutes / (60 * 24));
    label = `${days}d ago`;
    statusColor = "text-zinc-400 bg-zinc-800 border-zinc-700";
    Icon = Clock;
  } else if (diffMinutes > 60) {
    const hours = Math.floor(diffMinutes / 60);
    label = `${hours}h ago`;
    statusColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    Icon = Clock;
  } else if (diffMinutes > 2) {
    label = `${diffMinutes}m ago`;
    statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    Icon = CheckCircle2;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusColor}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
}
