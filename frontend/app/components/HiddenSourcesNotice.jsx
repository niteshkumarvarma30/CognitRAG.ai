"use client";

import React from "react";
import { Lock, EyeOff } from "lucide-react";

export default function HiddenSourcesNotice({ count, withheldSources = [] }) {
  if (!count || count <= 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 my-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs backdrop-blur-md">
      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
        <Lock className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <span className="font-semibold">{count} source{count > 1 ? "s" : ""} withheld</span>
        <span className="text-amber-300/80 ml-1">
          ({withheldSources.length > 0 ? withheldSources.join(", ") : "private containers"}). Visible only to members with direct workspace permissions.
        </span>
      </div>
    </div>
  );
}
