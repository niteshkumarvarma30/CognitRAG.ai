"use client";

import React, { useState } from "react";
import { Shield, Users, Lock, Unlock, Check, AlertCircle } from "lucide-react";

export default function AudienceEditor({
  sourceType,
  sourceNativeId,
  displayName,
  initialMode = "mirrored",
  initialPrivate = false,
  members = [],
  onSave = null,
}) {
  const [audienceMode, setAudienceMode] = useState(initialMode); // 'mirrored' | 'admin_set'
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [allowedMembers, setAllowedMembers] = useState(members);
  const [newMemberId, setNewMemberId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddMember = () => {
    if (!newMemberId.trim() || allowedMembers.includes(newMemberId.trim())) return;
    setAllowedMembers([...allowedMembers, newMemberId.trim()]);
    setNewMemberId("");
  };

  const handleRemoveMember = (idToRemove) => {
    setAllowedMembers(allowedMembers.filter((m) => m !== idToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      if (onSave) {
        await onSave({
          sourceType,
          sourceNativeId,
          audienceMode,
          isPrivate,
          allowedMembers,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save audience settings", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 backdrop-blur-xl space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
            {sourceType} Access Container
          </span>
          <h3 className="text-lg font-bold text-zinc-100">{displayName || sourceNativeId}</h3>
        </div>
        <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
      </div>

      {/* Mode selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400">Audience Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAudienceMode("mirrored")}
            className={`p-3 rounded-xl border text-left transition-all ${
              audienceMode === "mirrored"
                ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-200"
                : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="font-semibold text-xs mb-0.5">Mirrored</div>
            <div className="text-[11px] text-zinc-400">Syncs directly from source tool roles</div>
          </button>

          <button
            type="button"
            onClick={() => setAudienceMode("admin_set")}
            className={`p-3 rounded-xl border text-left transition-all ${
              audienceMode === "admin_set"
                ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-200"
                : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="font-semibold text-xs mb-0.5">Admin-Set</div>
            <div className="text-[11px] text-zinc-400">Manually specified in CognitRAG</div>
          </button>
        </div>
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
        <div className="flex items-center gap-2.5">
          {isPrivate ? (
            <Lock className="w-4 h-4 text-amber-400" />
          ) : (
            <Unlock className="w-4 h-4 text-emerald-400" />
          )}
          <div>
            <div className="text-xs font-semibold">
              {isPrivate ? "Restricted Container (Private)" : "Workspace Members (Public)"}
            </div>
            <div className="text-[11px] text-zinc-400">
              {isPrivate
                ? "Visible only to specifically granted users"
                : "Visible to all authenticated members of this tenant"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPrivate(!isPrivate)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isPrivate
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}
        >
          {isPrivate ? "Make Public" : "Make Private"}
        </button>
      </div>

      {/* Allowed members list (active if private or admin_set) */}
      {isPrivate && audienceMode === "admin_set" && (
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-zinc-400">Allowed Member IDs / Emails</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="user_... or email@company.com"
              value={newMemberId}
              onChange={(e) => setNewMemberId(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {allowedMembers.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300"
              >
                <span>{m}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m)}
                  className="text-zinc-500 hover:text-zinc-300 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Grants updated
          </span>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? "Saving..." : "Save Audience Rules"}
          </button>
        </div>
      </div>
    </div>
  );
}
