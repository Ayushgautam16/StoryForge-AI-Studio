import React from 'react';
import { Home, Folder, BookOpen, Settings, X } from 'lucide-react';
import { StoryFolder } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'library' | 'sublibrary' | 'batch' | 'audit';
  activeStory: StoryFolder;
  onSelectHome: () => void;
  onSelectAllProjects: () => void;
  onSelectOwnStory: () => void;
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeStory,
  onSelectHome,
  onSelectAllProjects,
  onSelectOwnStory,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isHomeActive = activeTab === 'dashboard';
  const isAllProjectsActive = activeTab === 'library';
  const isOwnStoryActive = activeTab === 'sublibrary';

  const navContent = (
    <aside className="w-[240px] shrink-0 bg-[#0b1320] border-r border-[#1e293b] flex flex-col justify-between py-5 h-full">
      <div>
        {/* Brand Header */}
        <div className="px-5 pb-5 flex items-center justify-between border-b border-[#1e293b]">
          <button
            type="button"
            onClick={() => {
              onSelectHome();
              onCloseMobile?.();
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#06b6d4] to-[#10b981] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              KS
            </div>
            <div className="text-base font-bold text-[#f8fafc] tracking-wide">
              KATHASTUDIO
            </div>
          </button>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <ul className="list-none py-5 px-2.5 space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => {
                onSelectHome();
                onCloseMobile?.();
              }}
              className={`w-full px-3.5 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all text-left ${
                isHomeActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-[#94a3b8] hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 ${isHomeActive ? 'text-cyan-400' : 'text-[#94a3b8]'}`} />
              <span>Home</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => {
                onSelectAllProjects();
                onCloseMobile?.();
              }}
              className={`w-full px-3.5 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all text-left ${
                isAllProjectsActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-[#94a3b8] hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Folder className={`w-4 h-4 shrink-0 ${isAllProjectsActive ? 'text-cyan-400' : 'text-[#94a3b8]'}`} />
              <span>All Projects</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => {
                onSelectOwnStory();
                onCloseMobile?.();
              }}
              className={`w-full px-3.5 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all text-left ${
                isOwnStoryActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-[#94a3b8] hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${isOwnStoryActive ? 'text-cyan-400' : 'text-[#94a3b8]'}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate">Own Story</div>
                <div className="text-[11px] text-slate-500 truncate font-mono">
                  {activeStory.title}
                </div>
              </div>
            </button>
          </li>
        </ul>
      </div>

      {/* Bottom Settings Section */}
      <div className="pt-2.5 px-5 border-t border-[#1e293b]">
        <button
          type="button"
          onClick={() => {
            onOpenSettings();
            onCloseMobile?.();
          }}
          className="w-full px-4 py-3 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-semibold flex items-center gap-2.5 transition-colors shadow-lg shadow-sky-900/30"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen shrink-0">
        {navContent}
      </div>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
