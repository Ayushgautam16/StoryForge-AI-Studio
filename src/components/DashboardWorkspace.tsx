import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  BookMarked, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Wand2,
  BookmarkPlus,
  Eye,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { StoryFolder, LanguageBlend, AuditIssue, PipelineState, ChapterHistory } from '../types';
import { TubeGenPipeline } from './TubeGenPipeline';

interface DashboardWorkspaceProps {
  stories: StoryFolder[];
  activeStory: StoryFolder;
  onSelectActiveStory: (storyId: string) => void;
  onUpdateStory: (updated: StoryFolder) => void;
  onOpenSubLibrary: (tab?: 'rulebook1' | 'rulebook2' | 'characters' | 'history') => void;
  onNavigateToScanAudit: (source: string, output: string) => void;
  customApiKey?: string;
}

export const DashboardWorkspace: React.FC<DashboardWorkspaceProps> = ({
  stories,
  activeStory,
  onSelectActiveStory,
  onUpdateStory,
  onOpenSubLibrary,
  onNavigateToScanAudit,
  customApiKey,
}) => {
  // Input State
  const [inputText, setInputText] = useState<string>(
    `Lin Feng stood alone at the peak of Black Wind Gorge. The wind was howling, razor sharp and freezing.
Elder Wu stepped out from the shadows, his eyes burning with intense greed and malice.
"Lin Feng, you useless trash! Hand over the Golden Core and I might leave your corpse intact," Elder Wu sneered coldly, raising his flying sword.
Lin Feng remained utterly silent. His breath formed mist in the air. Inside his dantian, the Qi Gathering vortex began to spin violently.
"If you want the Golden Core," Lin Feng said softly, his fingers tightening on his rusted blade, "come take it yourself. But remember, once this sword leaves its sheath, death is the only answer."
Elder Wu laughed arrogantly. "Courting death! A mere junior dares lecture me?"
The two figures clashed as lightning torn through the dark sky.`
  );
  
  // Settings & Parameters
  const [language, setLanguage] = useState<LanguageBlend>('natural_mix');
  const [minWords, setMinWords] = useState<number>(350); // Accessible default for quick testing, adjustable
  
  // Output State
  const [outputText, setOutputText] = useState<string>('');
  const [changesSummary, setChangesSummary] = useState<string>('');
  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedChapter, setIsSavedChapter] = useState(false);
  
  // Error Badge & Navigation State
  const [isErrorDrawerOpen, setIsErrorDrawerOpen] = useState(false);
  const [isChangesDrawerOpen, setIsChangesDrawerOpen] = useState(false);
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);

  // Ref to Output textarea / container for scroll-to-jump
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Pipeline State
  const [pipeline, setPipeline] = useState<PipelineState>({
    currentStep: 0,
    isProcessing: false,
    steps: {
      1: { id: 1, title: 'Step 1: Story & Rules Loaded', subtitle: 'Syncing terminology & sheets', status: 'idle' },
      2: { id: 2, title: 'Step 2: Character & Tone Mapping', subtitle: 'Voice delivery & personality alignment', status: 'idle' },
      3: { id: 3, title: 'Step 3: Novelist Rewrite (+100-150)', subtitle: 'Prose expansion & emotional depth', status: 'idle' },
      4: { id: 4, title: 'Step 4: Self-Audit Complete', subtitle: 'Zero-slop verification & name check', status: 'idle' },
    },
  });

  // Calculate live word counts
  const currentInputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentOutputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).filter(Boolean).length : 0;
  
  // Strict rule: Target is Min + 100 to Min + 150
  const targetMinWords = minWords + 100;
  const targetMaxWords = minWords + 150;
  const wordCountDelta = currentOutputWordCount - minWords;
  const isWordCountCompliant = currentOutputWordCount >= targetMinWords && currentOutputWordCount <= targetMaxWords;

  // Handle Run Novelist Localization Rewrite
  const handleRunLocalization = async () => {
    if (!inputText.trim()) return;

    // Reset pipeline & output state
    setPipeline({
      currentStep: 1,
      isProcessing: true,
      steps: {
        1: { id: 1, title: 'Step 1: Story & Rules Loaded', subtitle: 'Loading terms & character sheet', status: 'running' },
        2: { id: 2, title: 'Step 2: Character & Tone Mapping', subtitle: 'Waiting...', status: 'idle' },
        3: { id: 3, title: 'Step 3: Novelist Rewrite (+100-150)', subtitle: 'Waiting...', status: 'idle' },
        4: { id: 4, title: 'Step 4: Self-Audit Complete', subtitle: 'Waiting...', status: 'idle' },
      },
    });

    const startTime = Date.now();

    try {
      // Step 1: Simulated brief sync phase for cinematic visual feedback
      await new Promise(r => setTimeout(r, 600));
      setPipeline(prev => ({
        ...prev,
        currentStep: 2,
        steps: {
          ...prev.steps,
          1: { ...prev.steps[1], status: 'completed', elapsedMs: Date.now() - startTime },
          2: { ...prev.steps[2], status: 'running' },
        },
      }));

      // Step 2: Tone & character mapping
      await new Promise(r => setTimeout(r, 600));
      const step2Time = Date.now();
      setPipeline(prev => ({
        ...prev,
        currentStep: 3,
        steps: {
          ...prev.steps,
          2: { ...prev.steps[2], status: 'completed', elapsedMs: step2Time - startTime },
          3: { ...prev.steps[3], status: 'running' },
        },
      }));

      // Call API
      const res = await fetch('/api/localize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          language,
          minWords,
          storyTitle: activeStory.title,
          rulebook1: activeStory.rulebook1,
          rulebook2: activeStory.rulebook2,
          customRulebooks: activeStory.customRulebooks || [],
          characters: activeStory.characters || (activeStory as any).characterLocations || [],
          characterLocations: activeStory.characters || (activeStory as any).characterLocations || [],
          customApiKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`Localization failed with status: ${res.status}`);
      }

      const data = await res.json();
      const step3Time = Date.now();

      // Step 3 completed -> Moving to Step 4: Self Audit
      setPipeline(prev => ({
        ...prev,
        currentStep: 4,
        steps: {
          ...prev.steps,
          3: { ...prev.steps[3], status: 'completed', elapsedMs: step3Time - step2Time },
          4: { ...prev.steps[4], status: 'running' },
        },
      }));

      await new Promise(r => setTimeout(r, 500));

      // Finalize pipeline
      setPipeline(prev => ({
        ...prev,
        currentStep: 4,
        isProcessing: false,
        steps: {
          ...prev.steps,
          4: { ...prev.steps[4], status: 'completed', elapsedMs: Date.now() - step3Time },
        },
      }));

      setOutputText(data.localizedText || '');
      setChangesSummary(data.changesSummary || 'Novelist prose rewrite executed with character mapping.');
      
      // Check and populate audit issues
      const issues: AuditIssue[] = data.auditIssues || [];
      
      // Check if any rulebook 1 terms or characters were missed
      const charsList = activeStory.characters || (activeStory as any).characterLocations || [];
      charsList.forEach((cl, idx) => {
        if (data.localizedText && data.localizedText.includes(cl.originalName)) {
          issues.push({
            id: `missed-char-${idx}`,
            type: 'missed_name',
            wordOrPhrase: cl.originalName,
            suggested: cl.newName,
            explanation: `Original name "${cl.originalName}" still present in output. Replace with localized name "${cl.newName}".`,
            severity: 'error',
          });
        }
      });

      setAuditIssues(issues);

      // Auto-learn newly discovered entities into active story folder if returned!
      if (data.discoveredEntities) {
        let updatedStory = { ...activeStory };
        let hasChanges = false;

        if (Array.isArray(data.discoveredEntities.characters)) {
          updatedStory.characters = updatedStory.characters || [...(activeStory.characters || (activeStory as any).characterLocations || [])];
          for (const newChar of data.discoveredEntities.characters) {
            const alreadyExists = updatedStory.characters.some(
              c => c.originalName.toLowerCase() === newChar.originalName.toLowerCase()
            );
            if (!alreadyExists && newChar.originalName) {
              updatedStory.characters.push({
                id: `cl-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                originalName: newChar.originalName,
                newName: newChar.suggestedName || newChar.originalName,
                personality: 'Auto-detected from chapter narrative',
                role: newChar.role || 'Supporting Character',
                voiceNotes: newChar.voiceNotes || 'Natural dialogue delivery',
                isAuto: true,
                updatedAt: new Date().toISOString(),
              });
              hasChanges = true;
            }
          }
        }

        if (Array.isArray(data.discoveredEntities.terms)) {
          updatedStory.rulebook1 = updatedStory.rulebook1 || [...activeStory.rulebook1];
          for (const newTerm of data.discoveredEntities.terms) {
            const alreadyExists = updatedStory.rulebook1.some(
              r => (r.keyword || (r as any).term || '').toLowerCase() === newTerm.originalTerm.toLowerCase()
            );
            if (!alreadyExists && newTerm.originalTerm) {
              updatedStory.rulebook1.push({
                id: `rb1-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                keyword: newTerm.originalTerm,
                translation: newTerm.localizedTerm || newTerm.originalTerm,
                contextNotes: newTerm.notes || 'Auto-extracted from chapter rewrite',
                isAuto: true,
                updatedAt: new Date().toISOString(),
              });
              hasChanges = true;
            }
          }
        }

        if (hasChanges) {
          onUpdateStory(updatedStory);
        }
      }

    } catch (err: any) {
      console.error(err);
      setPipeline(prev => ({
        ...prev,
        isProcessing: false,
        steps: {
          ...prev.steps,
          [prev.currentStep || 3]: {
            ...prev.steps[prev.currentStep || 3],
            status: 'error',
            subtitle: err.message || 'Operation error',
          },
        },
      }));
    }
  };

  // Jump-to-highlight exact word in output box
  const handleJumpToError = (issue: AuditIssue) => {
    setHighlightedIssueId(issue.id);
    if (!outputTextareaRef.current || !issue.wordOrPhrase) return;

    const textarea = outputTextareaRef.current;
    const text = textarea.value;
    const index = text.toLowerCase().indexOf(issue.wordOrPhrase.toLowerCase());

    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + issue.wordOrPhrase.length);
      
      // Calculate scroll line
      const linesBefore = text.substring(0, index).split('\n').length;
      const lineHeight = 24; // approximate px per line
      textarea.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);
    }
  };

  // Replace error inline
  const handleApplyFix = (issue: AuditIssue) => {
    if (!issue.wordOrPhrase || !issue.suggested) return;
    const regex = new RegExp(issue.wordOrPhrase, 'i');
    setOutputText(prev => prev.replace(regex, issue.suggested));
    setAuditIssues(prev => prev.filter(i => i.id !== issue.id));
    setHighlightedIssueId(null);
  };

  // Save current chapter to Sub-Library
  const handleSaveChapter = () => {
    if (!outputText.trim()) return;

    const historyList = activeStory.history || (activeStory as any).savedChapters || [];
    const newChapter: ChapterHistory = {
      id: `ch-${Date.now()}`,
      chapterNumber: historyList.length + 128,
      title: `Chapter ${historyList.length + 128}: ${activeStory.title}`,
      sourceText: inputText,
      outputText: outputText,
      timestamp: new Date().toISOString(),
      wordCount: currentOutputWordCount,
      minWords: minWords,
      language: language,
      changesSummary: changesSummary || 'Localized with Master Novelist persona',
      auditIssuesCount: auditIssues.length,
    };

    const updated = {
      ...activeStory,
      history: [newChapter, ...historyList],
      updatedAt: new Date().toISOString(),
    };

    onUpdateStory(updated);
    setIsSavedChapter(true);
    setTimeout(() => setIsSavedChapter(false), 2500);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadOutput = () => {
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeStory.title.replace(/\s+/g, '_')}_Localized_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setInputText(
      `Chapter 130: The Dragon Meridian Trial\n\n` +
      `Lin Feng stood upon the precipice of the Nine Dragon Altar. The ancient stone pillars hummed with pure Dao energy, shaking the foundation of Black Wind Gorge.\n` +
      `Elder Wu smirked from his golden war carriage. "Foolish boy! Even if you swallowed a hundred Golden Cores, your broken dantian can never endure the Prana tribulation!"\n` +
      `Beside him, Xiao Yan whispered anxiously, "Brother Lin, do not take the bait. His spiritual pressure is equivalent to the fifth tier of Golden Core realm."\n` +
      `Lin Feng did not even blink. He touched his Spatial Ring, feeling the icy cold pulse of his hidden blade. "Those who seek death usually arrive early. Elder Wu, your funeral starts today."\n` +
      `With a deafening thunderclap, the clouds split open and the battle began.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Active Story Library Quick Selector & Open Folder Bar */}
      <div
        id="activeLibrarySection"
        className="bg-[#0b1320] border border-[#1e293b] rounded-[10px] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
      >
        <div className="flex-1 max-w-[400px]">
          <label
            htmlFor="storyLibraryDropdown"
            className="block text-xs text-[#94a3b8] mb-1.5 font-medium"
          >
            Active Story Library
          </label>
          <select
            id="storyLibraryDropdown"
            value={activeStory.id}
            onChange={(e) => onSelectActiveStory(e.target.value)}
            className="w-full bg-[#0f172a] border border-[#334155] text-[#f8fafc] px-3 py-2 rounded-md text-sm font-semibold cursor-pointer outline-none focus:border-cyan-500 transition-colors"
          >
            {stories.map((story) => (
              <option key={story.id} value={story.id}>
                {story.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onOpenSubLibrary('rulebook1')}
          className="bg-[#0e7490] hover:bg-cyan-600 text-white px-4.5 py-2.5 rounded-md font-semibold text-[13px] cursor-pointer sm:mt-[18px] transition-colors shrink-0 shadow-md shadow-cyan-950/40"
        >
          Open Folder
        </button>
      </div>

      {/* Top TubeGen Visual Pipeline */}
      <TubeGenPipeline pipeline={pipeline} />

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* LEFT COLUMN: Input Box & Engine Controls */}
        <div className="flex flex-col bg-[#0d1322] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Source Story Input
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSample}
                className="px-2.5 py-1 text-xs rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 transition-colors flex items-center gap-1.5"
                title="Load sample chapter from Cultivation Saga"
              >
                <Wand2 className="w-3 h-3" /> Load Sample
              </button>
              <button
                onClick={() => setInputText('')}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Story Rules Quick Summary Badge */}
          <div className="my-3 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Attached Library: <strong className="text-slate-200">{activeStory.title}</strong>
              </span>
            </div>
            <button
              onClick={() => onOpenSubLibrary()}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline underline-offset-2 flex items-center gap-1"
            >
              <BookMarked className="w-3 h-3" /> View {activeStory.rulebook1.length + (activeStory.characters || (activeStory as any).characterLocations || []).length} Rules & Sheet
            </button>
          </div>

          {/* Input Textarea with live word count */}
          <div className="relative flex-1 min-h-[280px]">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your original novel chapter, web novel episode, or script here..."
              className="w-full h-full min-h-[280px] p-4 bg-[#0a0f1d] border border-slate-800/80 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 resize-y font-normal text-sm leading-relaxed"
            />
          </div>

          {/* Live Word Count Indicator Bar */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Current Word Count:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 font-bold text-cyan-300 border border-slate-700/80">
                {currentInputWordCount} words
              </span>
            </div>

            <span className="text-slate-500 text-[11px]">
              {inputText.length} characters
            </span>
          </div>

          {/* Engine Parameters: Language Blend & Strict Minimum Words */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3.5">
            
            {/* Output Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Output Language Selector</span>
                <span className="text-[11px] font-normal text-cyan-400 font-mono">Master Novelist Persona</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'natural_mix' as const, label: 'Natural Mix', badge: 'Default flow' },
                  { id: 'hindi' as const, label: 'Hindi', badge: 'Pure & emotive' },
                  { id: 'english' as const, label: 'English', badge: 'Fiction novel' },
                  { id: 'hinglish' as const, label: 'Hinglish', badge: 'Modern youth' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLanguage(item.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                      language === item.id
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-[#101728] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Words Input Box with Strict +100 to +150 Rule Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-900/60">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Strict Word Count Engine (+100 to +150 Words)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  Enforced Rule
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Minimum Words:</span>
                    <input
                      type="number"
                      min={50}
                      max={5000}
                      step={50}
                      value={minWords}
                      onChange={(e) => setMinWords(Math.max(10, parseInt(e.target.value) || 0))}
                      className="w-28 px-3 py-1.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-cyan-300 font-mono font-bold text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-slate-400">Target Output Range:</div>
                  <div className="text-emerald-400 font-bold">
                    {targetMinWords} – {targetMaxWords} words
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400 leading-snug">
                Rule: The rewritten output <strong className="text-slate-200">MUST</strong> be 100 to 150 words MORE than Minimum Words entered. Extra words add rich sensory details, tension, and internal thoughts—never repetition.
              </p>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunLocalization}
              disabled={pipeline.isProcessing || !inputText.trim()}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-lg ${
                pipeline.isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-[0.99]'
              }`}
            >
              {pipeline.isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span>Pipeline Active (Executing Step 0{pipeline.currentStep})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Master Novelist Rewrite ({minWords} ➔ {targetMinWords}–{targetMaxWords} Words)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Box, Audit Badges & Interactive Click-to-Jump */}
        <div className="flex flex-col bg-[#0d1322] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Novelist Rewritten Output
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyOutput}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors flex items-center gap-1 disabled:opacity-40"
                title="Copy to clipboard"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadOutput}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors flex items-center gap-1 disabled:opacity-40"
                title="Download .txt"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>

              <button
                onClick={handleSaveChapter}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 transition-colors flex items-center gap-1 disabled:opacity-40"
                title="Save into Story Sub-Library history"
              >
                <BookmarkPlus className="w-3 h-3 text-emerald-400" />
                <span>{isSavedChapter ? 'Saved!' : 'Save Chapter'}</span>
              </button>

              <button
                onClick={() => onNavigateToScanAudit(inputText, outputText)}
                disabled={!outputText}
                className="px-2.5 py-1 text-xs rounded-lg bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-800/50 transition-colors flex items-center gap-1 disabled:opacity-40"
                title="Open side-by-side Scan & Audit view"
              >
                <Eye className="w-3 h-3" />
                <span>Audit Diff</span>
              </button>
            </div>
          </div>

          {/* Interactive Output Textarea */}
          <div className="relative flex-1 min-h-[300px] mt-3">
            <textarea
              ref={outputTextareaRef}
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              placeholder="Novelist localized chapter output will render here in real time.
Click 'Run Master Novelist Rewrite' to trigger the 4-step pipeline..."
              className="w-full h-full min-h-[300px] p-4 bg-[#0a0f1d] border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 resize-y font-normal text-sm leading-relaxed"
            />
          </div>

          {/* Word Count Compliance Bar at Bottom */}
          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400">Final Output Word Count:</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#0c1222] font-mono font-bold text-sm text-emerald-300 border border-emerald-500/30">
                {currentOutputWordCount} words
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              {currentOutputWordCount > 0 ? (
                isWordCountCompliant ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> +{wordCountDelta} words over min (Target Achieved ✓)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> 
                    {wordCountDelta > 0 ? `+${wordCountDelta} words over min` : `${Math.abs(wordCountDelta)} words below min`}
                    {` (Target: ${targetMinWords}–${targetMaxWords})`}
                  </span>
                )
              ) : (
                <span className="text-slate-500 text-[11px]">Awaiting rewrite</span>
              )}
            </div>
          </div>

          {/* Interactive Click-to-Jump Error Badge & Changes Summary System */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
            
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Clickable Error Badge */}
              <button
                type="button"
                onClick={() => setIsErrorDrawerOpen(!isErrorDrawerOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  auditIssues.length > 0
                    ? 'bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {auditIssues.length > 0 ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span>Errors: {auditIssues.length} {auditIssues.length === 1 ? 'Alert' : 'Alerts'}</span>
                    {isErrorDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>0 Errors Detected</span>
                  </>
                )}
              </button>

              {/* Changes Made Summary Badge */}
              <button
                type="button"
                onClick={() => setIsChangesDrawerOpen(!isChangesDrawerOpen)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Changes Made Summary</span>
                {isChangesDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <span className="text-[11px] text-slate-500 ml-auto hidden sm:inline">
                Click any error item to jump &amp; highlight
              </span>
            </div>

            {/* Changes Drawer */}
            {isChangesDrawerOpen && (
              <div className="p-3.5 rounded-xl bg-slate-900/95 border border-cyan-900/60 text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Story Transformations Applied:
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {changesSummary || 'No rewrite executed yet. Run the pipeline to view narrative adaptation details.'}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-400">✓ Terminology aligned with Rulebook 1</span>
                  <span>•</span>
                  <span className="text-cyan-400">✓ Character voices mapped with Rulebook 2</span>
                </div>
              </div>
            )}

            {/* Expanded Error List with Click-to-Jump and Quick Inline Fix */}
            {isErrorDrawerOpen && auditIssues.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/60 text-xs space-y-2.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="font-bold text-rose-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Exact Audit Issues &amp; Rule Violations ({auditIssues.length}):
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Click item to jump in text
                  </span>
                </div>

                <div className="space-y-2">
                  {auditIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => handleJumpToError(issue)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        highlightedIssueId === issue.id
                          ? 'bg-rose-950/60 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                          : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/60 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            issue.type === 'missed_name'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : issue.type === 'word_count'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {issue.type.replace('_', ' ').toUpperCase()}
                          </span>

                          <span className="font-bold text-slate-200 font-mono">
                            "{issue.wordOrPhrase}"
                          </span>

                          {issue.suggested && (
                            <span className="text-emerald-400 font-mono text-[11px]">
                              ➔ {issue.suggested}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{issue.explanation}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {issue.suggested && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyFix(issue);
                            }}
                            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold"
                          >
                            Accept Fix
                          </button>
                        )}
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Click to Jump ➔
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
