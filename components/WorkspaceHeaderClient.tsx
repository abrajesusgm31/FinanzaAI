'use client';

import { useState } from 'react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

export function WorkspaceHeaderClient({
  userEmail,
  initialWorkspaces,
}: {
  userEmail: string;
  initialWorkspaces: any[];
}) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(
    initialWorkspaces.length > 0 ? initialWorkspaces[0].id : ''
  );

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-slate-800 text-sm hidden sm:block">Workspace:</h2>
        {workspaces.length > 0 ? (
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspaceId={currentWorkspaceId}
            onSelectWorkspace={(id) => setCurrentWorkspaceId(id)}
          />
        ) : (
          <span className="text-xs text-slate-400">Sin workspace</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-600 font-medium bg-slate-100 px-3 py-1.5 rounded-full">
          {userEmail}
        </span>
      </div>
    </header>
  );
}
