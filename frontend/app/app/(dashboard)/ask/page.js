'use client';
import React from 'react';
import Chat from '@/components/Chat';

export default function AskPage() {
  // In a real implementation, we would extract the current active workspace ID from a global context.
  // For the frontend shell, we mock it.
  const activeWorkspaceId = "ws_1";

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
      <Chat tenantId={activeWorkspaceId} />
    </div>
  );
}
