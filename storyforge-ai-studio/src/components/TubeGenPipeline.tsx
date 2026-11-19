import React from 'react';
import { CheckCircle2, Loader2, Sparkles, AlertCircle, Clock, BookOpen, UserCheck, Feather, ShieldCheck } from 'lucide-react';
import { PipelineState } from '../types';

interface TubeGenPipelineProps {
  pipeline: PipelineState;
  onStepClick?: (stepId: 1 | 2 | 3 | 4) => void;
}

export const TubeGenPipeline: React.FC<TubeGenPipelineProps> = ({ pipeline, onStepClick }) => {
  const stepsConfig = [
    {
      id: 1 as const,
      name: 'Step 1: Story & Rules Loaded',
      short: 'Rules Loaded',
      desc: 'Terminology & Sub-Library synced',
      icon: BookOpen,
    },
    {
      id: 2 as const,
      name: 'Step 2: Character & Tone Mapping',
      short: 'Tone Mapping',
      desc: 'Voice delivery & personality alignment',
      icon: UserCheck,
    },
    {
      id: 3 as const,
      name: 'Step 3: Novelist Rewrite (+100-150)',
      short: 'Novelist Rewrite',
      desc: 'Human prose expansion & emotional depth',
      icon: Feather,
    },
    {
      id: 4 as const,
      name: 'Step 4: Self-Audit Complete',
      short: 'Self-Audit',
      desc: 'Zero-slop verification & name check',
      icon: ShieldCheck,
    },
  ];

  const getStepStatus = (id: 1 | 2 | 3 | 4) => {
    return pipeline.steps[id]?.status || 'idle';
  };

  const getStatusBadge = (status: 'idle' | 'running' | 'completed' | 'error') => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" /> Active
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Alert
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
            <Clock className="w-2.5 h-2.5" /> Standby
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#0d1322] border border-cyan-950/70 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background neon ambient flare */}
      <div className="absolute top-0 right-0 w-96 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> TubeGen.ai Automated Pipeline
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          {pipeline.isProcessing ? (
            <span className="text-cyan-300 font-medium flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Pipeline Running...
            </span>
          ) : (
            <span className="text-slate-400">Pipeline Status: Idle</span>
          )}
        </div>
      </div>

      {/* Visual horizontal step-by-step progress pipeline */}
      <div className="relative">
        {/* Horizontal connector line behind steps (desktop) */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-5 h-0.5 bg-slate-800 z-0">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-700"
            style={{
              width:
                pipeline.currentStep === 4
                  ? '100%'
                  : pipeline.currentStep === 3
                  ? '75%'
                  : pipeline.currentStep === 2
                  ? '50%'
                  : pipeline.currentStep === 1
                  ? '25%'
                  : '0%',
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
          {stepsConfig.map((step) => {
            const status = getStepStatus(step.id);
            const isCurrent = pipeline.currentStep === step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                onClick={() => onStepClick?.(step.id)}
                className={`group cursor-pointer rounded-xl p-3.5 border transition-all duration-300 relative flex flex-col justify-between ${
                  status === 'running'
                    ? 'bg-cyan-950/30 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                    : status === 'completed'
                    ? 'bg-[#10192a] border-emerald-500/50 hover:border-emerald-400'
                    : status === 'error'
                    ? 'bg-rose-950/20 border-rose-500/60'
                    : 'bg-[#101726]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#121c2e]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : status === 'running'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>{getStatusBadge(status)}</div>
                </div>

                <div>
                  <h4
                    className={`text-xs font-bold tracking-tight mb-1 transition-colors ${
                      status === 'running'
                        ? 'text-cyan-300'
                        : status === 'completed'
                        ? 'text-emerald-300'
                        : 'text-slate-200 group-hover:text-cyan-300'
                    }`}
                  >
                    {step.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                    {step.desc}
                  </p>
                </div>

                {/* Micro progress line inside card */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Step 0{step.id}</span>
                  {pipeline.steps[step.id]?.elapsedMs ? (
                    <span className="text-cyan-400/80">
                      {(pipeline.steps[step.id].elapsedMs! / 1000).toFixed(1)}s
                    </span>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
