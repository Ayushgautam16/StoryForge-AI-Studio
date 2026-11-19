export type LanguageBlend = 'natural_mix' | 'hindi' | 'english' | 'hinglish';

export interface RuleItem {
  id: string;
  keyword: string;
  translation: string;
  isAuto?: boolean;
  contextNotes?: string;
  category?: string;
  updatedAt?: string;
}

export interface CharacterItem {
  id: string;
  originalName: string;
  newName: string;
  personality: string;
  isAuto?: boolean;
  voiceNotes?: string;
  role?: string;
  type?: string;
  updatedAt?: string;
}

export interface ChapterHistory {
  id: string;
  title: string;
  sourceText: string;
  outputText: string;
  timestamp: string;
  wordCount: number;
  chapterNumber?: number;
  language?: LanguageBlend;
  changesSummary?: string;
  auditIssuesCount?: number;
  minWords?: number;
}

export interface RulebookTab {
  id: string;
  label: string;
  rules: RuleItem[];
}

export interface StoryFolder {
  id: string;
  title: string;
  description: string;
  rulebook1: RuleItem[];
  rulebook2: RuleItem[];
  customRulebooks?: RulebookTab[];
  characters: CharacterItem[];
  history: ChapterHistory[];
  createdAt: string;
  genre?: string;
  colorTheme?: string;
  updatedAt?: string;
}

// Backward-compatibility aliases
export type Rulebook1Item = RuleItem;
export type Rulebook2Item = RuleItem;
export type CharacterLocationItem = CharacterItem;
export type SavedChapter = ChapterHistory;

export interface AuditIssue {
  id: string;
  type: 'missed_name' | 'robotic_phrasing' | 'word_count' | 'rule_violation' | 'terminology';
  wordOrPhrase: string;
  suggested: string;
  explanation: string;
  severity: 'error' | 'warning' | 'info';
  occurrenceIndex?: number;
}

export interface PipelineStep {
  id: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  elapsedMs?: number;
  infoSnippet?: string;
}

export interface PipelineState {
  currentStep: 0 | 1 | 2 | 3 | 4;
  isProcessing: boolean;
  steps: Record<1 | 2 | 3 | 4, PipelineStep>;
  startTime?: number;
}

export interface BatchQueueItem {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  sourceText: string;
  minWords: number;
  language: LanguageBlend;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  outputWordCount?: number;
  localizedText?: string;
  discoveredEntitiesCount?: number;
  error?: string;
}

export interface AppSettings {
  geminiApiKey: string;
  claudeApiKey: string;
  activeProvider: 'gemini' | 'claude';
  targetWordExtraMin: number; // default 100
  targetWordExtraMax: number; // default 150
  autoLearnEntities: boolean;
  soundEffects: boolean;
}

export interface LocalizeResponsePayload {
  localizedText: string;
  outputWordCount: number;
  changesSummary: string;
  auditIssues: AuditIssue[];
  discoveredEntities: {
    characters: Array<{ originalName: string; suggestedName: string; role: string; voiceNotes: string }>;
    terms: Array<{ originalTerm: string; localizedTerm: string; notes: string }>;
  };
}
