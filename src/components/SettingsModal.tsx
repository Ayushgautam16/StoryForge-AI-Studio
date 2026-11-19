import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Key, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sliders, 
  ShieldCheck, 
  Sparkles,
  FileJson,
  Cpu,
  Database,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppSettings } from '../types';
import { exportFullBackupJSON, importFullBackupJSON, INITIAL_STORIES, saveStories, loadStories } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onReloadStories: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReloadStories,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dbStatus, setDbStatus] = useState<{
    checking: boolean;
    connected?: boolean;
    tablesReady?: boolean;
    message?: string;
  }>({ checking: false });
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkDb();
    }
  }, [isOpen]);

  const checkDb = async () => {
    setDbStatus({ checking: true });
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setDbStatus({
        checking: false,
        connected: data.isConnected,
        tablesReady: data.tablesReady,
        message: data.message,
      });
    } catch (e: any) {
      setDbStatus({
        checking: false,
        connected: false,
        tablesReady: false,
        message: e.message || 'Cannot reach server API',
      });
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingDb(true);
    try {
      const currentStories = loadStories();
      const res = await fetch('/api/stories/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories: currentStories }),
      });
      if (res.ok) {
        setBackupMessage('Stories successfully synced to Supabase database!');
      } else {
        const err = await res.json();
        setBackupMessage(`Supabase notice: ${err.error || 'Ensure SQL tables are created'}`);
      }
    } catch (e: any) {
      setBackupMessage(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncingDb(false);
      setTimeout(() => setBackupMessage(null), 5000);
    }
  };

  const handleCopySqlSchema = () => {
    const sql = `-- Supabase Schema for StoryForge / KathaStudio
CREATE TABLE IF NOT EXISTS public.stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  genre TEXT DEFAULT 'General Fiction',
  color_theme TEXT DEFAULT 'from-cyan-600 via-teal-700 to-emerald-900',
  rulebook1 JSONB DEFAULT '[]'::jsonb,
  rulebook2 JSONB DEFAULT '[]'::jsonb,
  custom_rulebooks JSONB DEFAULT '[]'::jsonb,
  characters JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  gemini_api_key TEXT DEFAULT '',
  claude_api_key TEXT DEFAULT '',
  active_provider TEXT DEFAULT 'gemini',
  target_word_extra_min INTEGER DEFAULT 100,
  target_word_extra_max INTEGER DEFAULT 150,
  auto_learn_entities BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to stories" ON public.stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setIsCopiedSql(true);
    setTimeout(() => setIsCopiedSql(false), 3000);
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KathaStudio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('JSON Backup downloaded successfully!');
    setTimeout(() => setBackupMessage(null), 3500);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFullBackupJSON(content);
      if (res.success) {
        onReloadStories();
        setBackupMessage(res.message);
      } else {
        setBackupMessage(`Error: ${res.message}`);
      }
      setTimeout(() => setBackupMessage(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToPresets = () => {
    if (confirm('Reset all stories back to the official default presets (Cultivation Saga & Neon Mumbai)? Any unsaved custom stories will be replaced.')) {
      saveStories(INITIAL_STORIES);
      onReloadStories();
      setBackupMessage('Stories successfully reset to official presets!');
      setTimeout(() => setBackupMessage(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1628] border border-cyan-900/80 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Studio Settings &amp; Backup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {backupMessage && (
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-xs text-cyan-200 font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{backupMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* AI Model & API Key Configuration */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <Key className="w-4 h-4 text-cyan-400" />
                AI API Key &amp; Provider
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Server-side protected
              </span>
            </div>

            {/* Provider Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, activeProvider: 'gemini' })}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  formData.activeProvider === 'gemini'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Gemini 3.8 Flash</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, activeProvider: 'claude' })}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  formData.activeProvider === 'claude'
                    ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Anthropic Claude</span>
              </button>
            </div>

            {/* Gemini API Key */}
            {formData.activeProvider === 'gemini' ? (
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  Custom Gemini API Key (Optional Override)
                </label>
                <input
                  type="password"
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  placeholder="Leave empty to use server GEMINI_API_KEY"
                  className="w-full p-2.5 rounded-lg bg-[#0e1628] border border-slate-700 text-slate-200 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Default: The studio automatically uses the server-side GEMINI_API_KEY. You can enter an override key here if desired.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  Claude API Key
                </label>
                <input
                  type="password"
                  value={formData.claudeApiKey}
                  onChange={(e) => setFormData({ ...formData, claudeApiKey: e.target.value })}
                  placeholder="sk-ant-..."
                  className="w-full p-2.5 rounded-lg bg-[#0e1628] border border-slate-700 text-slate-200 font-mono text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Strict Word Count & Auto-learning settings */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Engine Parameters
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Extra Word Min</label>
                <input
                  type="number"
                  value={formData.targetWordExtraMin}
                  onChange={(e) => setFormData({ ...formData, targetWordExtraMin: parseInt(e.target.value) || 100 })}
                  className="w-full p-2 rounded-lg bg-[#0e1628] border border-slate-700 text-cyan-300 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Extra Word Max</label>
                <input
                  type="number"
                  value={formData.targetWordExtraMax}
                  onChange={(e) => setFormData({ ...formData, targetWordExtraMax: parseInt(e.target.value) || 150 })}
                  className="w-full p-2 rounded-lg bg-[#0e1628] border border-slate-700 text-cyan-300 font-mono text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={formData.autoLearnEntities}
                onChange={(e) => setFormData({ ...formData, autoLearnEntities: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-[#0e1628] border-slate-700"
              />
              <span className="text-slate-300 font-medium">
                Auto-learn discovered characters &amp; terms into active Sub-Library with [Auto] badge
              </span>
            </label>
          </div>

          {/* Supabase Cloud Database Panel */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-cyan-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Supabase Cloud Database
              </span>
              <div className="flex items-center gap-1.5">
                {dbStatus.checking ? (
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : dbStatus.tablesReady ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Connected & Ready
                  </span>
                ) : dbStatus.connected ? (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <AlertCircle className="w-3 h-3" /> Connected (Init Tables)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">
                    Local Storage Fallback
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Target: <code className="text-cyan-300 font-mono">https://kkmqhjtyiizkeghkpide.supabase.co</code>
              {dbStatus.message && (
                <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                  Status: {dbStatus.message}
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={checkDb}
                disabled={dbStatus.checking}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${dbStatus.checking ? 'animate-spin' : ''}`} />
                <span>Test DB Status</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncingDb}
                className="py-2 px-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSyncingDb ? 'Syncing...' : 'Sync to Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySqlSchema}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Copy schema SQL to run in Supabase SQL editor"
              >
                {isCopiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied SQL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy Schema SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* JSON Backup & Restore Feature */}
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-amber-400" />
                JSON Backup / Restore
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Full State</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backup (.json)</span>
              </button>

              <label className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restore (.json)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleResetToPresets}
                className="py-2 px-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset Presets</span>
              </button>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
