import React, { useState } from 'react';
import { 
  Folder, 
  Sparkles, 
  Sliders, 
  Layers, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  Clock, 
  Eye, 
  FolderPlus,
  BookMarked,
  Menu,
  Database
} from 'lucide-react';
import { StoryFolder } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'library' | 'sublibrary' | 'batch' | 'audit';
  onSelectTab: (tab: 'dashboard' | 'library' | 'batch' | 'audit') => void;
  stories: StoryFolder[];
  activeStoryId: string;
  onSelectActiveStory: (storyId: string) => void;
  onOpenSettings: () => void;
  onOpenNewFolderModal: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  stories,
  activeStoryId,
  onSelectActiveStory,
  onOpenSettings,
  onOpenNewFolderModal,
  onOpenMobileSidebar,
}) => {
  const [isStoryDropdownOpen, setIsStoryDropdownOpen] = useState(false);
  const activeStory = stories.find(s => s.id === activeStoryId) || stories[0];

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard (Workspace)', icon: Sparkles, badge: 'Studio' },
    { id: 'library' as const, label: 'Master Library (Folders)', icon: Layers, badge: `${stories.length}` },
    { id: 'batch' as const, label: 'Background Batch', icon: Clock, badge: 'Batch' },
    { id: 'audit' as const, label: 'Scan & Audit', icon: Eye, badge: 'Diff' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-cyan-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* Brand Logo with TubeGen Glow */}
          <div className="flex items-center gap-3">
            {onOpenMobileSidebar && (
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div 
              onClick={() => onSelectTab('dashboard')} 
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-100 font-mono">
                    KATHA<span className="text-cyan-400">STUDIO</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    TUBEGEN.AI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider hidden sm:block">
                  AI STORY LOCALIZATION &amp; EDITING
                </div>
              </div>
            </div>
          </div>

          {/* Active Story Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStoryDropdownOpen(!isStoryDropdownOpen)}
              className="px-3 py-1.5 rounded-xl bg-[#0e1628] hover:bg-[#121c32] border border-cyan-900/80 text-xs text-left flex items-center gap-2.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">Active Story Library:</div>
                <div className="font-bold text-slate-200 max-w-[140px] sm:max-w-[200px] truncate group-hover:text-cyan-300 transition-colors">
                  {activeStory?.title || 'Select Story'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 group-hover:text-cyan-300 transition-transform" />
            </button>

            {/* Dropdown Menu */}
            {isStoryDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsStoryDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e1628] border border-cyan-900/90 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>Attached Story Folders</span>
                    <span>{stories.length} Available</span>
                  </div>

                  <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                    {stories.map((story) => {
                      const isSelected = story.id === activeStoryId;
                      return (
                        <button
                          key={story.id}
                          onClick={() => {
                            onSelectActiveStory(story.id);
                            setIsStoryDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/60 font-bold'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{story.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {story.rulebook1.length + story.rulebook2.length} Rules • {(story.characters || (story as any).characterLocations || []).length} Characters
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsStoryDropdownOpen(false);
                        onOpenNewFolderModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ Create New Story Folder</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls: Supabase DB & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0e1628] hover:bg-[#121c32] text-slate-300 border border-cyan-950/80 text-[11px] font-mono transition-all group"
              title="Supabase Cloud DB Status & Settings"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-400 group-hover:text-cyan-300 transition-colors">Supabase</span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
              title="Settings & JSON Backup/Restore"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Desktop Top Navigation Tabs */}
        <div className="hidden md:flex items-center gap-2 border-t border-slate-800/60 py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'library' && activeTab === 'sublibrary');

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar (Mobile-First) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'library' && activeTab === 'sublibrary');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="truncate max-w-[70px]">
                {item.id === 'dashboard' ? 'Studio' : item.id === 'library' ? 'Library' : item.id === 'batch' ? 'Batch' : 'Audit'}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
