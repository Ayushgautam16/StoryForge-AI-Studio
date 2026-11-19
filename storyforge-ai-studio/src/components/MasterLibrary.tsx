import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  FolderOpen, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  Tag, 
  Trash2, 
  Sparkles, 
  ChevronRight,
  Clock,
  Layers
} from 'lucide-react';
import { StoryFolder } from '../types';

interface MasterLibraryProps {
  stories: StoryFolder[];
  activeStoryId: string;
  onSelectStoryFolder: (story: StoryFolder) => void;
  onSetActiveStory: (storyId: string) => void;
  onCreateNewStory: (story: Omit<StoryFolder, 'id' | 'createdAt' | 'updatedAt' | 'rulebook1' | 'rulebook2' | 'characters' | 'history'>) => void;
  onDeleteStory: (storyId: string) => void;
}

export const MasterLibrary: React.FC<MasterLibraryProps> = ({
  stories,
  activeStoryId,
  onSelectStoryFolder,
  onSetActiveStory,
  onCreateNewStory,
  onDeleteStory,
}) => {
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Fantasy / Wuxia');
  const [colorTheme, setColorTheme] = useState('from-cyan-600 via-teal-700 to-emerald-900');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateNewStory({
      title,
      description,
      genre,
      colorTheme,
    });

    setTitle('');
    setDescription('');
    setIsCreatingModal(false);
  };

  const colorThemes = [
    { label: 'Cyan / Emerald', value: 'from-cyan-600 via-teal-700 to-emerald-900' },
    { label: 'Fuchsia / Purple', value: 'from-fuchsia-600 via-purple-800 to-indigo-950' },
    { label: 'Amber / Rose', value: 'from-amber-600 via-rose-700 to-red-950' },
    { label: 'Blue / Indigo', value: 'from-blue-600 via-indigo-700 to-slate-900' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-[#0d1322] border border-cyan-950/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Nested Library Architecture ("Library Inside Library")
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
            Master Story Folders
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Each Story Folder houses its own isolated Sub-Library: Terminology Rulebook, Tone &amp; Style Directives, Character &amp; Location voice sheets, and Saved Chapters History.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98]"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Create New Story Folder</span>
        </button>
      </div>

      {/* Grid of Story Folders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.map((story) => {
          const isActive = story.id === activeStoryId;
          const totalRules = story.rulebook1.length + story.rulebook2.length;
          const totalChars = (story.characters || (story as any).characterLocations || []).length;
          const totalChapters = (story.history || (story as any).savedChapters || []).length;

          return (
            <div
              key={story.id}
              className={`rounded-2xl border transition-all duration-300 relative flex flex-col justify-between overflow-hidden group ${
                isActive
                  ? 'bg-[#0f172a] border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/40'
                  : 'bg-[#0d1322] border-slate-800 hover:border-slate-700 hover:bg-[#10182b]'
              }`}
            >
              {/* Gradient Banner */}
              <div className={`h-24 bg-gradient-to-r ${story.colorTheme || 'from-cyan-600 to-teal-800'} p-4 relative flex items-start justify-between`}>
                <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
                  <Folder className="w-5 h-5 text-cyan-200" />
                </div>

                <div className="flex items-center gap-1.5">
                  {isActive && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-black/60 text-emerald-300 border border-emerald-400/40 flex items-center gap-1 backdrop-blur-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Studio Story
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                      {story.genre}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Updated {new Date(story.updatedAt || story.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {story.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {story.description || 'No description provided.'}
                  </p>
                </div>

                {/* Sub-Library Stats Pills */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center font-mono">
                  <div className="bg-[#0a0f1d] p-2 rounded-xl border border-slate-800/70">
                    <div className="text-[10px] text-slate-500">Rules</div>
                    <div className="text-xs font-bold text-cyan-300">{totalRules}</div>
                  </div>
                  <div className="bg-[#0a0f1d] p-2 rounded-xl border border-slate-800/70">
                    <div className="text-[10px] text-slate-500">Entities</div>
                    <div className="text-xs font-bold text-emerald-300">{totalChars}</div>
                  </div>
                  <div className="bg-[#0a0f1d] p-2 rounded-xl border border-slate-800/70">
                    <div className="text-[10px] text-slate-500">Chapters</div>
                    <div className="text-xs font-bold text-purple-300">{totalChapters}</div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSelectStoryFolder(story)}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open Sub-Library</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {!isActive ? (
                    <button
                      onClick={() => onSetActiveStory(story.id)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      title="Set as Active Story in Studio Dashboard"
                    >
                      Set Active
                    </button>
                  ) : null}

                  {stories.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete story folder "${story.title}" and its entire sub-library?`)) {
                          onDeleteStory(story.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                      title="Delete Story Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE STORY FOLDER MODAL */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1628] border border-cyan-900/80 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Create New Story Folder</h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Story Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Return of the Mount Hua Sect / मुंबई 2099"
                  className="w-full p-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Genre / Category</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Xianxia, Martial Fantasy, Cyberpunk Noir..."
                  className="w-full p-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Story Logline / Concept</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Atmosphere, setting, and world rules summary..."
                  className="w-full p-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Cover Color Accent</label>
                <div className="grid grid-cols-2 gap-2">
                  {colorThemes.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColorTheme(c.value)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        colorTheme === c.value
                          ? 'border-cyan-400 bg-cyan-950/60'
                          : 'border-slate-800 bg-[#0a0f1d]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${c.value}`} />
                      <span className="text-[11px] text-slate-300 font-mono">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
