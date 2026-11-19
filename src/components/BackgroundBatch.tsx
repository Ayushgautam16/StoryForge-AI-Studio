import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Plus, 
  Layers, 
  Sparkles, 
  FileText, 
  Check, 
  Download, 
  Trash2,
  FolderSync,
  AlertCircle
} from 'lucide-react';
import { BatchQueueItem, StoryFolder } from '../types';

interface BackgroundBatchProps {
  activeStory: StoryFolder;
  onUpdateStory: (updatedStory: StoryFolder) => void;
  customApiKey?: string;
}

export const BackgroundBatch: React.FC<BackgroundBatchProps> = ({
  activeStory,
  onUpdateStory,
  customApiKey,
}) => {
  // Pre-seeded batch queue for Ch 131-135 as requested
  const [queue, setQueue] = useState<BatchQueueItem[]>([
    {
      id: 'batch-131',
      chapterNumber: 131,
      chapterTitle: 'Chapter 131: The Shattered Meridian Hall',
      sourceText: `Elder Wu led thirty disciples of the Nine Clouds sect into the Meridian Hall. Lin Feng was meditating near the ancient spirit furnace.
"Lin Feng, hand over the Spatial Ring and the Golden Core formula!" Elder Wu shouted.
Xiao Yan stepped forward, sword in hand. "You dare intrude into our sanctuary?"`,
      minWords: 300,
      language: 'natural_mix',
      status: 'queued',
      progress: 0,
    },
    {
      id: 'batch-132',
      chapterNumber: 132,
      chapterTitle: 'Chapter 132: Crimson Flame Alchemy',
      sourceText: `The spirit furnace erupted with blue flames. Lin Feng channeled his Qi Gathering technique, suppressing the chaotic fire.
Elder Wu hesitated. The spiritual pressure radiating from Lin Feng felt like a sleeping dragon waking up.`,
      minWords: 300,
      language: 'natural_mix',
      status: 'queued',
      progress: 0,
    },
    {
      id: 'batch-133',
      chapterNumber: 133,
      chapterTitle: 'Chapter 133: The Sword of Nine Thunders',
      sourceText: `Lightning struck the peak of Black Wind Gorge. Lin Feng unsheathed the thunder blade.
"Elder Wu, thirty years ago you betrayed my father," Lin Feng said softly. "Today, that karma is repaid in blood."`,
      minWords: 300,
      language: 'natural_mix',
      status: 'queued',
      progress: 0,
    },
    {
      id: 'batch-134',
      chapterNumber: 134,
      chapterTitle: 'Chapter 134: Tribulation Clouds Over the Sect',
      sourceText: `Dark clouds assembled above the Nine Clouds mountain range. The tribulation was coming.
Lin Feng stood against the roaring winds, his eyes cold and calm. Even Elder Wu had retreated five steps in terror.`,
      minWords: 300,
      language: 'natural_mix',
      status: 'queued',
      progress: 0,
    },
    {
      id: 'batch-135',
      chapterNumber: 135,
      chapterTitle: 'Chapter 135: The Dawn of the Sovereign',
      sourceText: `As the morning sun pierced the storm clouds, the battlefield fell silent.
Lin Feng gathered his aura. The Golden Core in his dantian glowed with immortal radiance. A new legend had begun.`,
      minWords: 300,
      language: 'natural_mix',
      status: 'queued',
      progress: 0,
    },
  ]);

  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [newDiscoveredCount, setNewDiscoveredCount] = useState(0);

  // New chapter input modal state
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterNum, setNewChapterNum] = useState<number>(136);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterText, setNewChapterText] = useState('');
  const [newMinWords, setNewMinWords] = useState(300);

  const handleAddChapterToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterText.trim()) return;

    const item: BatchQueueItem = {
      id: `batch-${Date.now()}`,
      chapterNumber: newChapterNum,
      chapterTitle: newChapterTitle || `Chapter ${newChapterNum}`,
      sourceText: newChapterText,
      minWords: newMinWords,
      language: 'natural_mix',
      status: 'queued',
      progress: 0,
    };

    setQueue(prev => [...prev, item]);
    setNewChapterNum(n => n + 1);
    setNewChapterTitle('');
    setNewChapterText('');
    setIsAddingChapter(false);
  };

  const handleRunBatch = async () => {
    if (isProcessingBatch) return;
    setIsProcessingBatch(true);
    let totalAutoDiscovered = 0;

    let updatedStory = { ...activeStory };

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') continue;

      // Mark processing
      setQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'processing', progress: 15 } : q));

      try {
        // Animate progress smoothly
        const interval = setInterval(() => {
          setQueue(prev => prev.map((q, idx) => {
            if (idx === i && q.progress < 85) {
              return { ...q, progress: q.progress + 15 };
            }
            return q;
          }));
        }, 300);

        const res = await fetch('/api/localize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: item.sourceText,
            language: item.language,
            minWords: item.minWords,
            storyTitle: activeStory.title,
            rulebook1: updatedStory.rulebook1,
            rulebook2: updatedStory.rulebook2,
            customRulebooks: updatedStory.customRulebooks || [],
            characters: updatedStory.characters || (updatedStory as any).characterLocations || [],
            characterLocations: updatedStory.characters || (updatedStory as any).characterLocations || [],
            customApiKey,
          }),
        });

        clearInterval(interval);

        if (!res.ok) throw new Error('Batch localization error');
        const data = await res.json();

        // Auto-save newly discovered entities directly into the active Story Folder's Sub-Library!
        let discoveredInThisChapter = 0;
        if (data.discoveredEntities) {
          if (Array.isArray(data.discoveredEntities.characters)) {
            updatedStory.characters = updatedStory.characters || [...(activeStory.characters || (activeStory as any).characterLocations || [])];
            for (const newChar of data.discoveredEntities.characters) {
              const exists = updatedStory.characters.some(
                c => c.originalName.toLowerCase() === newChar.originalName.toLowerCase()
              );
              if (!exists && newChar.originalName) {
                updatedStory.characters.push({
                  id: `cl-auto-batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  originalName: newChar.originalName,
                  newName: newChar.suggestedName || newChar.originalName,
                  personality: 'Auto-discovered in background batch processing',
                  role: newChar.role || 'Background Clan Figure',
                  voiceNotes: newChar.voiceNotes || 'Consistent speech delivery',
                  isAuto: true,
                  updatedAt: new Date().toISOString(),
                });
                discoveredInThisChapter++;
                totalAutoDiscovered++;
              }
            }
          }
        }

        // Also save chapter into story's history
        updatedStory.history = updatedStory.history || [...(activeStory.history || (activeStory as any).savedChapters || [])];
        updatedStory.history.unshift({
          id: `batch-ch-${Date.now()}-${item.chapterNumber}`,
          chapterNumber: item.chapterNumber,
          title: item.chapterTitle,
          sourceText: item.sourceText,
          outputText: data.localizedText,
          wordCount: data.outputWordCount || 420,
          timestamp: new Date().toISOString(),
          minWords: item.minWords,
          language: item.language,
          changesSummary: data.changesSummary || `Batch localized with Master Novelist engine.`,
          auditIssuesCount: data.auditIssues?.length || 0,
        });

        // Set completed
        setQueue(prev => prev.map((q, idx) => idx === i ? {
          ...q,
          status: 'completed',
          progress: 100,
          localizedText: data.localizedText,
          outputWordCount: data.outputWordCount || 420,
          discoveredEntitiesCount: discoveredInThisChapter,
        } : q));

      } catch (err: any) {
        setQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'error', progress: 100, error: err.message } : q));
      }
    }

    updatedStory.updatedAt = new Date().toISOString();
    onUpdateStory(updatedStory);
    setNewDiscoveredCount(totalAutoDiscovered);
    setIsProcessingBatch(false);
  };

  const completedCount = queue.filter(q => q.status === 'completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-[#0d1322] border border-cyan-950/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Automated Background Pipeline
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
            Background Batch Localizer (Ch 131–135)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Queue multiple novel chapters in parallel sequence. Each chapter is enriched by the human fiction novelist engine, and all newly detected characters/rules are auto-saved directly into <strong className="text-cyan-300">{activeStory.title}</strong>'s Sub-Library with [Auto] badges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddingChapter(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Chapter
          </button>

          <button
            onClick={handleRunBatch}
            disabled={isProcessingBatch || completedCount === queue.length}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              isProcessingBatch
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isProcessingBatch ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Batch Queue...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Batch Localization ({queue.length} Chapters)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Sync Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Queue Progress</div>
            <div className="text-lg font-bold text-slate-100 font-mono">
              {completedCount} / {queue.length} Completed
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            {Math.round((completedCount / queue.length) * 100)}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Active Target Folder</div>
            <div className="text-sm font-bold text-cyan-300 truncate max-w-[180px]">
              {activeStory.title}
            </div>
          </div>
          <FolderSync className="w-6 h-6 text-cyan-400 shrink-0" />
        </div>

        <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Auto-Learned to Sub-Library</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              +{newDiscoveredCount} Entities
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
        </div>
      </div>

      {/* Chapters Queue List with Green Progress Bars */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Batch Queue Items (Visual Green Progress Engine)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Auto-attaches active Story Sub-Library
          </span>
        </div>

        <div className="space-y-3.5">
          {queue.map((item, index) => {
            const isProcessing = item.status === 'processing';
            const isDone = item.status === 'completed';
            const isErr = item.status === 'error';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isProcessing
                    ? 'bg-emerald-950/20 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                    : isDone
                    ? 'bg-[#0a0f1d] border-emerald-500/40'
                    : 'bg-[#0a0f1d] border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">
                        {item.chapterTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {item.sourceText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed ({item.outputWordCount}w)
                      </span>
                    ) : isProcessing ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Rewriting...
                      </span>
                    ) : isErr ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        <AlertCircle className="w-3 h-3" /> Error
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                        Queued
                      </span>
                    )}

                    <button
                      onClick={() => setQueue(prev => prev.filter(q => q.id !== item.id))}
                      disabled={isProcessing}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* TubeGen-style Green Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                        : isProcessing
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                        : isErr
                        ? 'bg-rose-500'
                        : 'bg-slate-700'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                {/* Bottom stats row */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2">
                  <span>Target Min: {item.minWords}w (Output +100-150w)</span>
                  {item.discoveredEntitiesCount !== undefined && item.discoveredEntitiesCount > 0 && (
                    <span className="text-emerald-400 font-bold">
                      +{item.discoveredEntitiesCount} new entities auto-learned
                    </span>
                  )}
                  <span>{item.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD CHAPTER TO QUEUE */}
      {isAddingChapter && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1628] border border-cyan-900/80 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Add Chapter to Batch Queue
            </h3>

            <form onSubmit={handleAddChapterToQueue} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Chapter Number</label>
                  <input
                    type="number"
                    value={newChapterNum}
                    onChange={(e) => setNewChapterNum(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Min Words</label>
                  <input
                    type="number"
                    value={newMinWords}
                    onChange={(e) => setNewMinWords(parseInt(e.target.value) || 100)}
                    className="w-full p-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Chapter Title</label>
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder={`Chapter ${newChapterNum}: The Nine Heavens...`}
                  className="w-full p-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Source Chapter Text</label>
                <textarea
                  rows={4}
                  required
                  value={newChapterText}
                  onChange={(e) => setNewChapterText(e.target.value)}
                  placeholder="Paste raw chapter text..."
                  className="w-full p-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingChapter(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                >
                  Queue Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
