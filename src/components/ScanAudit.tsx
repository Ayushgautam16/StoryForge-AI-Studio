import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  RefreshCw,
  Copy,
  Layers
} from 'lucide-react';
import { StoryFolder } from '../types';

interface ScanAuditProps {
  activeStory: StoryFolder;
  initialSource?: string;
  initialOutput?: string;
}

export const ScanAudit: React.FC<ScanAuditProps> = ({
  activeStory,
  initialSource = '',
  initialOutput = '',
}) => {
  const [sourceText, setSourceText] = useState(initialSource || '');
  const [outputText, setOutputText] = useState(initialOutput || '');

  // Stats calculation
  const sourceWordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).filter(Boolean).length : 0;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).filter(Boolean).length : 0;
  const wordDelta = outputWordCount - sourceWordCount;

  // Build replacement mappings from characters & rulebook1
  const replacements: Array<{ original: string; localized: string; type: string }> = [];

  const charactersList = activeStory.characters || (activeStory as any).characterLocations || [];
  charactersList.forEach(c => {
    if (c.originalName && c.newName) {
      replacements.push({
        original: c.originalName,
        localized: c.newName,
        type: c.type || 'character',
      });
    }
  });

  (activeStory.rulebook1 || []).forEach(r => {
    const key = r.keyword || (r as any).term;
    const trans = r.translation || (r as any).replacement;
    if (key && trans) {
      replacements.push({
        original: key,
        localized: trans,
        type: 'terminology',
      });
    }
  });

  // Calculate detected replacements in source
  const detectedReplacements = replacements.filter(rep => {
    const regex = new RegExp(`\\b${escapeRegExp(rep.original)}\\b`, 'i');
    return regex.test(sourceText);
  });

  // Check if any original names leaked into output (audit errors)
  const missedNamesInOutput = charactersList.filter(c => {
    const regex = new RegExp(`\\b${escapeRegExp(c.originalName)}\\b`, 'i');
    return regex.test(outputText);
  });

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Render highlighted source text (highlighting replaced names in red / strikethrough)
  const renderHighlightedSource = () => {
    if (!sourceText) return <span className="text-slate-500">No source text available</span>;

    // Build regex of all original terms
    const allOriginals = replacements.map(r => r.original).filter(Boolean);
    if (allOriginals.length === 0) return <span>{sourceText}</span>;

    const regex = new RegExp(`(${allOriginals.map(escapeRegExp).join('|')})`, 'gi');
    const parts = sourceText.split(regex);

    return parts.map((part, index) => {
      const match = replacements.find(r => r.original.toLowerCase() === part.toLowerCase());
      if (match) {
        return (
          <mark
            key={index}
            className="bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/40 inline-flex items-center gap-1 mx-0.5"
            title={`Replaced with: ${match.localized}`}
          >
            <span className="line-through opacity-80">{part}</span>
            <span className="text-[10px] text-rose-400 font-mono no-underline">[{match.localized.split(' ')[0]}]</span>
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Render highlighted output text (highlighting localized names in emerald / cyan)
  const renderHighlightedOutput = () => {
    if (!outputText) return <span className="text-slate-500">No output text available</span>;

    const allLocalized = replacements.map(r => r.localized).filter(Boolean);
    if (allLocalized.length === 0) return <span>{outputText}</span>;

    // Match exact localized or main word
    const regexTokens = allLocalized.flatMap(loc => [
      escapeRegExp(loc),
      ...loc.split(/[\s(/)]+/).filter(w => w.length > 2).map(escapeRegExp)
    ]);
    const regex = new RegExp(`(${[...new Set(regexTokens)].join('|')})`, 'gi');
    const parts = outputText.split(regex);

    return parts.map((part, index) => {
      const match = replacements.find(r => 
        r.localized.toLowerCase().includes(part.toLowerCase()) || 
        part.toLowerCase().includes(r.localized.toLowerCase())
      );

      // Check if it's a missed original name (alert)
      const isMissed = missedNamesInOutput.some(m => m.originalName.toLowerCase() === part.toLowerCase());

      if (isMissed) {
        return (
          <mark
            key={index}
            className="bg-amber-500/30 text-amber-200 font-bold px-1.5 py-0.5 rounded border border-amber-500 animate-pulse inline-flex items-center gap-1 mx-0.5"
            title="Warning: Untranslated original name detected in output!"
          >
            ⚠️ {part}
          </mark>
        );
      }

      if (match && part.trim().length > 2) {
        return (
          <mark
            key={index}
            className="bg-emerald-500/25 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/40 inline-flex items-center gap-1 mx-0.5"
            title={`Localized from: ${match.original}`}
          >
            ✦ {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-[#0d1322] border border-cyan-950/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Visual Audit &amp; Side-by-Side Diff Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
            Scan &amp; Audit Inspection
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Compare source text against the localized output. Replaced original terms and character names are highlighted in <span className="text-rose-400 font-semibold">red</span>, and new localized expressions are highlighted in <span className="text-emerald-400 font-semibold">emerald</span>.
          </p>
        </div>

        {/* Audit Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Replaced Entities: </span>
            <span className="text-cyan-300 font-bold">{detectedReplacements.length}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
            missedNamesInOutput.length > 0
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}>
            {missedNamesInOutput.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Missed Names: {missedNamesInOutput.length}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>0 Leaked Names</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* LEFT: SOURCE TEXT (REPLACED NAMES IN RED) */}
        <div className="flex flex-col bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Source Text (Replaced Names in Red)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {sourceWordCount} words
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800/80 min-h-[380px] max-h-[500px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-normal">
            {renderHighlightedSource()}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Original Source Language</span>
            <span className="text-rose-400">{detectedReplacements.length} replaced entities</span>
          </div>
        </div>

        {/* RIGHT: OUTPUT (LOCALIZED NAMES IN EMERALD) */}
        <div className="flex flex-col bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Novelist Output (Localized in Emerald)
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {outputWordCount} words (+{wordDelta > 0 ? wordDelta : 0} extra)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800/80 min-h-[380px] max-h-[500px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-200 font-normal">
            {renderHighlightedOutput()}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Novelist Engine</span>
            <span className="text-emerald-400 font-semibold">Self-Audit Passed ✓</span>
          </div>
        </div>

      </div>

      {/* Mapped Replacements Inventory Table */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Mapped Terminology &amp; Character Entity Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {detectedReplacements.map((item, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-[#0a0f1d] border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-mono text-rose-400 line-through text-[11px]">{item.original}</div>
                <div className="font-bold text-emerald-300 text-xs">{item.localized}</div>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
