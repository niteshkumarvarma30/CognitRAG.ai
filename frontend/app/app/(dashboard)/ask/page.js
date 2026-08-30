'use client';
import React from 'react';
import Chat from '@/components/Chat';

export default function AskPage() {
  const activeWorkspaceId = "ws_1";

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 110px)', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Chat tenantId={activeWorkspaceId} />
    </div>
  );
}
