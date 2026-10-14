"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";

export default function FeedbackButtons({ queryLogId, citationId = null, onSubmitted = null }) {
  const [rating, setRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (val) => {
    if (rating !== null || isSubmitting || !queryLogId) return;
    setIsSubmitting(true);
    setRating(val);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/v1/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_log_id: queryLogId,
          citation_id: citationId,
          rating: val,
        }),
      });
      if (onSubmitted) onSubmitted(val);
    } catch (e) {
      console.error("Failed to submit feedback", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 text-zinc-500">
      <button
        onClick={() => handleRate(1)}
        disabled={rating !== null}
        title="Accurate and verified"
        className={`p-1.5 rounded-lg transition-colors ${
          rating === 1
            ? "bg-emerald-500/20 text-emerald-400"
            : "hover:bg-zinc-800 hover:text-zinc-200"
        }`}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => handleRate(-1)}
        disabled={rating !== null}
        title="Inaccurate or unsupported"
        className={`p-1.5 rounded-lg transition-colors ${
          rating === -1
            ? "bg-rose-500/20 text-rose-400"
            : "hover:bg-zinc-800 hover:text-zinc-200"
        }`}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>

      {rating !== null && (
        <span className="text-[11px] text-zinc-400 ml-1 flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-400" /> Recorded
        </span>
      )}
    </div>
  );
}
