import React, { useState, useEffect } from 'react';
import { 
  StoryFolder, 
  RuleItem, 
  CharacterItem, 
  ChapterHistory,
  RulebookTab
} from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  BookOpen, 
  Users, 
  History, 
  PlusCircle,
  ArrowLeft,
  Upload,
  Search,
  Sparkles,
  Tag,
  Clock,
  Copy,
  CheckCheck
} from 'lucide-react';
import { extractTextFromFile, scanTextForEntities } from '../utils/docxPdfParser';

interface StorySubLibraryProps {
  story: StoryFolder;
  onUpdateStory: (updated: StoryFolder) => void;
  onBackToMasterLibrary?: () => void;
  onLoadChapterIntoDashboard?: (chapter: ChapterHistory) => void;
  initialTab?: string;
}

interface RulebookTabItem {
  id: string;
  name: string;
  category: string;
  rules: RuleItem[];
}

export const StorySubLibrary: React.FC<StorySubLibraryProps> = ({ 
  story, 
  onUpdateStory,
  onBackToMasterLibrary,
  onLoadChapterIntoDashboard,
  initialTab = 'r1'
}) => {
  // Normalize initialTab from older tab names if needed
  const normalizedInitialTab = initialTab === 'rulebook1' ? 'r1' : initialTab === 'rulebook2' ? 'r2' : initialTab === 'characters' ? 'chars' : initialTab;
  const [activeSubTab, setActiveSubTab] = useState<string>(normalizedInitialTab);
  
  // 1. Folder Title Edit State
  const [isEditingFolderTitle, setIsEditingFolderTitle] = useState(false);
  const [folderTitle, setFolderTitle] = useState(story.title);

  // Categories list for Rulebooks
  const categoriesList = ['Terminology', 'Tone & Style', 'World Settings', 'Locations (Nested)', 'Power System'];

  // 2. Rulebook Tabs State with Editable Names and Categories
  const [rulebooks, setRulebooks] = useState<RulebookTabItem[]>(() => {
    const base: RulebookTabItem[] = [
      { id: 'r1', name: 'Rulebook 1', category: 'Terminology', rules: story.rulebook1 || [] },
      { id: 'r2', name: 'Rulebook 2', category: 'Tone & Style', rules: story.rulebook2 || [] }
    ];
    if (story.customRulebooks && story.customRulebooks.length > 0) {
      story.customRulebooks.forEach((crb, idx) => {
        base.push({
          id: crb.id || `r_custom_${idx}`,
          name: crb.label.replace(/\s*\([^)]*\)/, '') || `Rulebook ${idx + 3}`,
          category: 'World Settings',
          rules: crb.rules || []
        });
      });
    }
    return base;
  });

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tabNewName, setTabNewName] = useState('');
  const [tabNewCategory, setTabNewCategory] = useState('');

  // 3. Characters state
  const [characters, setCharacters] = useState<CharacterItem[]>(story.characters || []);

  // 4. Modal States for Inside-Tab Add New Entry / Edit Entry
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Rule form fields
  const [newKeyword, setNewKeyword] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newRuleNotes, setNewRuleNotes] = useState('');
  
  // Character form fields
  const [charType, setCharType] = useState('Main Character');
  const [newOrigName, setNewOrigName] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newPersona, setNewPersona] = useState('');

  // Add Custom Rulebook Tab Modal
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [customTabName, setCustomTabName] = useState('');
  const [customTabCategory, setCustomTabCategory] = useState('World Settings');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Document upload state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Chapter viewing state
  const [viewingChapter, setViewingChapter] = useState<ChapterHistory | null>(null);
  const [copiedChapter, setCopiedChapter] = useState(false);

  // Sync state when story prop changes
  useEffect(() => {
    setFolderTitle(story.title);
    setCharacters(story.characters || []);
    setRulebooks(prev => {
      const base: RulebookTabItem[] = [
        { 
          id: 'r1', 
          name: prev.find(b => b.id === 'r1')?.name || 'Rulebook 1', 
          category: prev.find(b => b.id === 'r1')?.category || 'Terminology', 
          rules: story.rulebook1 || [] 
        },
        { 
          id: 'r2', 
          name: prev.find(b => b.id === 'r2')?.name || 'Rulebook 2', 
          category: prev.find(b => b.id === 'r2')?.category || 'Tone & Style', 
          rules: story.rulebook2 || [] 
        }
      ];
      if (story.customRulebooks && story.customRulebooks.length > 0) {
        story.customRulebooks.forEach((crb, idx) => {
          const existing = prev.find(p => p.id === crb.id);
          base.push({
            id: crb.id || `r_custom_${idx}`,
            name: existing?.name || crb.label.replace(/\s*\([^)]*\)/, '') || `Rulebook ${idx + 3}`,
            category: existing?.category || 'World Settings',
            rules: crb.rules || []
          });
        });
      }
      return base;
    });
  }, [story]);

  // Save Folder Title
  const handleSaveFolderTitle = () => {
    if (!folderTitle.trim()) return;
    onUpdateStory({ ...story, title: folderTitle.trim(), updatedAt: new Date().toISOString() });
    setIsEditingFolderTitle(false);
  };

  // Save Edited Rulebook Tab Name & Category
  const handleSaveTabDetails = (id: string) => {
    if (!tabNewName.trim()) return;
    const updatedRulebooks = rulebooks.map(tb => 
      tb.id === id ? { ...tb, name: tabNewName.trim(), category: tabNewCategory || tb.category } : tb
    );
    setRulebooks(updatedRulebooks);

    // Sync to story customRulebooks if needed
    const customList: RulebookTab[] = updatedRulebooks.slice(2).map(b => ({
      id: b.id,
      label: `${b.name} (${b.category})`,
      rules: b.rules
    }));

    onUpdateStory({
      ...story,
      customRulebooks: customList,
      updatedAt: new Date().toISOString()
    });

    setEditingTabId(null);
  };

  // Add New Custom Rulebook Tab (+)
  const handleAddCustomRulebook = () => {
    if (!customTabName.trim()) return;
    const newTabId = `r_${Date.now()}`;
    const newTab: RulebookTabItem = {
      id: newTabId,
      name: customTabName.trim(),
      category: customTabCategory,
      rules: []
    };
    const updated = [...rulebooks, newTab];
    setRulebooks(updated);

    const customList: RulebookTab[] = updated.slice(2).map(b => ({
      id: b.id,
      label: `${b.name} (${b.category})`,
      rules: b.rules
    }));

    onUpdateStory({
      ...story,
      customRulebooks: customList,
      updatedAt: new Date().toISOString()
    });

    setCustomTabName('');
    setShowAddTabModal(false);
    setActiveSubTab(newTabId);
  };

  // Delete Rulebook Tab
  const handleDeleteRulebookTab = (id: string, name: string) => {
    if (id === 'r1' || id === 'r2') return;
    const updated = rulebooks.filter(b => b.id !== id);
    setRulebooks(updated);

    const customList: RulebookTab[] = updated.slice(2).map(b => ({
      id: b.id,
      label: `${b.name} (${b.category})`,
      rules: b.rules
    }));

    onUpdateStory({
      ...story,
      customRulebooks: customList,
      updatedAt: new Date().toISOString()
    });

    setActiveSubTab('r1');
  };

  // Add or Edit Rule Entry inside Active Rulebook Tab
  const handleSaveRuleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const updatedRulebooks = rulebooks.map(tb => {
      if (tb.id === activeSubTab) {
        let updatedRules = [...tb.rules];
        if (editingItemId) {
          updatedRules = updatedRules.map(r => r.id === editingItemId ? {
            ...r,
            keyword: newKeyword.trim(),
            translation: newTranslation.trim(),
            contextNotes: newRuleNotes.trim(),
            updatedAt: new Date().toISOString()
          } : r);
        } else {
          updatedRules.push({
            id: `r_${Date.now()}`,
            keyword: newKeyword.trim(),
            translation: newTranslation.trim(),
            contextNotes: newRuleNotes.trim(),
            isAuto: false,
            updatedAt: new Date().toISOString()
          });
        }
        return { ...tb, rules: updatedRules };
      }
      return tb;
    });

    setRulebooks(updatedRulebooks);

    // Persist to story
    const r1 = updatedRulebooks.find(b => b.id === 'r1')?.rules || [];
    const r2 = updatedRulebooks.find(b => b.id === 'r2')?.rules || [];
    const customList: RulebookTab[] = updatedRulebooks.slice(2).map(b => ({
      id: b.id,
      label: `${b.name} (${b.category})`,
      rules: b.rules
    }));

    onUpdateStory({
      ...story,
      rulebook1: r1,
      rulebook2: r2,
      customRulebooks: customList,
      updatedAt: new Date().toISOString()
    });

    setNewKeyword('');
    setNewTranslation('');
    setNewRuleNotes('');
    setEditingItemId(null);
    setShowAddModal(false);
  };

  // Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    const updatedRulebooks = rulebooks.map(tb => {
      if (tb.id === activeSubTab) {
        return { ...tb, rules: tb.rules.filter(r => r.id !== ruleId) };
      }
      return tb;
    });

    setRulebooks(updatedRulebooks);

    const r1 = updatedRulebooks.find(b => b.id === 'r1')?.rules || [];
    const r2 = updatedRulebooks.find(b => b.id === 'r2')?.rules || [];
    const customList: RulebookTab[] = updatedRulebooks.slice(2).map(b => ({
      id: b.id,
      label: `${b.name} (${b.category})`,
      rules: b.rules
    }));

    onUpdateStory({
      ...story,
      rulebook1: r1,
      rulebook2: r2,
      customRulebooks: customList,
      updatedAt: new Date().toISOString()
    });
  };

  // Add or Edit Character Entry with Type Selection (Main/Side/Supporting/Location)
  const handleSaveCharacterEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigName.trim()) return;

    let updatedChars = [...characters];
    const formattedOrigName = newOrigName.startsWith('[') ? newOrigName.trim() : `[${charType}] ${newOrigName.trim()}`;

    if (editingItemId) {
      updatedChars = updatedChars.map(c => c.id === editingItemId ? {
        ...c,
        originalName: formattedOrigName,
        newName: newTargetName.trim(),
        personality: newPersona.trim(),
        type: charType,
        updatedAt: new Date().toISOString()
      } : c);
    } else {
      const newChar: CharacterItem = {
        id: `c_${Date.now()}`,
        originalName: formattedOrigName,
        newName: newTargetName.trim(),
        personality: newPersona.trim(),
        type: charType,
        isAuto: false,
        updatedAt: new Date().toISOString()
      };
      updatedChars.push(newChar);
    }

    setCharacters(updatedChars);
    onUpdateStory({ ...story, characters: updatedChars, updatedAt: new Date().toISOString() });

    setNewOrigName('');
    setNewTargetName('');
    setNewPersona('');
    setEditingItemId(null);
    setShowAddModal(false);
  };

  // Delete Character
  const handleDeleteCharacter = (charId: string) => {
    const updated = characters.filter(c => c.id !== charId);
    setCharacters(updated);
    onUpdateStory({ ...story, characters: updated, updatedAt: new Date().toISOString() });
  };

  // Delete Chapter from history
  const handleDeleteChapter = (chId: string) => {
    const updated = (story.history || []).filter(ch => ch.id !== chId);
    onUpdateStory({ ...story, history: updated, updatedAt: new Date().toISOString() });
  };

  // Document Upload Handler (.txt, .docx, .pdf)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setUploadFeedback(`Scanning ${file.name} for entities & terminology...`);

    try {
      const text = await extractTextFromFile(file);
      const candidates = scanTextForEntities(text);

      let updatedChars = [...characters];
      let addedCharsCount = 0;
      for (const c of candidates.characters) {
        if (!updatedChars.some(existing => existing.originalName.toLowerCase().includes(c.originalName.toLowerCase()))) {
          updatedChars.push({
            id: `c_auto_${Date.now()}_${addedCharsCount}`,
            originalName: `[${c.role || 'Side Character'}] ${c.originalName}`,
            newName: c.suggestedName,
            personality: c.personality || 'Extracted entity',
            voiceNotes: c.voiceNotes,
            type: c.role || 'Side Character',
            isAuto: true,
            updatedAt: new Date().toISOString(),
          });
          addedCharsCount++;
        }
      }

      let updatedR1 = [...(story.rulebook1 || [])];
      let addedTermsCount = 0;
      for (const t of candidates.terminology) {
        const key = t.keyword || t.term || '';
        const trans = t.translation || t.replacement || '';
        if (key && !updatedR1.some(r => r.keyword.toLowerCase() === key.toLowerCase())) {
          updatedR1.push({
            id: `r1_auto_${Date.now()}_${addedTermsCount}`,
            keyword: key,
            translation: trans,
            contextNotes: t.contextNotes,
            isAuto: true,
            updatedAt: new Date().toISOString(),
          });
          addedTermsCount++;
        }
      }

      onUpdateStory({
        ...story,
        characters: updatedChars,
        rulebook1: updatedR1,
        updatedAt: new Date().toISOString(),
      });

      setCharacters(updatedChars);
      setUploadFeedback(`Extracted ${addedCharsCount} characters & ${addedTermsCount} terminology rules with [Auto] badges!`);
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      setUploadFeedback(`Upload error: ${err.message}`);
      setTimeout(() => setUploadFeedback(null), 4000);
    } finally {
      setIsUploadingDoc(false);
      e.target.value = '';
    }
  };

  const activeRulebook = rulebooks.find(b => b.id === activeSubTab);
  const isRulebook = activeSubTab !== 'chars' && activeSubTab !== 'history';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Top Bar: Back to Master Library & Document Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
        {onBackToMasterLibrary && (
          <button
            onClick={onBackToMasterLibrary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Master Library
          </button>
        )}

        <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all self-start sm:self-auto">
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Direct Document Upload (.txt, .docx, .pdf)</span>
          <input
            type="file"
            accept=".txt,.docx,.pdf,.md,.json"
            onChange={handleFileUpload}
            disabled={isUploadingDoc}
            className="hidden"
          />
        </label>
      </div>

      {/* HEADER: Story Folder Title with Edit Pencil Icon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {isEditingFolderTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={folderTitle}
                onChange={(e) => setFolderTitle(e.target.value)}
                className="bg-slate-950 border border-cyan-500 rounded-xl px-3 py-1.5 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                autoFocus
              />
              <button 
                onClick={handleSaveFolderTitle} 
                className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition-colors"
                title="Save Title"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setFolderTitle(story.title);
                  setIsEditingFolderTitle(false);
                }} 
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📁 {story.title}</span>
              </h2>
              <button
                onClick={() => setIsEditingFolderTitle(true)}
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Folder Name"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {story.genre && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                  {story.genre}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload feedback banner */}
      {uploadFeedback && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2 font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* SUB-TABS BAR: Rulebook 1, Rulebook 2, Custom Rulebooks, Character Sheet, Saved Chapters */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
        {rulebooks.map((tb) => (
          <div key={tb.id} className="flex items-center">
            {editingTabId === tb.id ? (
              <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-lg border border-cyan-500">
                <input
                  type="text"
                  value={tabNewName}
                  onChange={(e) => setTabNewName(e.target.value)}
                  className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs text-white w-28 focus:outline-none focus:border-cyan-400"
                  placeholder="Tab Name"
                  autoFocus
                />
                <select
                  value={tabNewCategory}
                  onChange={(e) => setTabNewCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs text-cyan-400 focus:outline-none"
                >
                  {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button onClick={() => handleSaveTabDetails(tb.id)} className="p-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white" title="Save Tab">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setEditingTabId(null)} className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-white" title="Cancel">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={() => setActiveSubTab(tb.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSubTab === tb.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{tb.name} <strong className="text-xs text-slate-500 font-normal">({tb.category})</strong></span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeSubTab === tb.id ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tb.rules.length}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTabId(tb.id);
                      setTabNewName(tb.name);
                      setTabNewCategory(tb.category);
                    }}
                    className="p-1 hover:text-cyan-300 ml-0.5 rounded"
                    title="Edit Tab Name & Category"
                  >
                    <Edit3 className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
                  </span>
                </button>
                {tb.id !== 'r1' && tb.id !== 'r2' && (
                  <button
                    onClick={() => handleDeleteRulebookTab(tb.id, tb.name)}
                    className="ml-0.5 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title={`Delete ${tb.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Character Sheet Tab */}
        <button
          onClick={() => setActiveSubTab('chars')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'chars' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" /> 
          <span>Character Sheet</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeSubTab === 'chars' ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
          }`}>
            {characters.length}
          </span>
        </button>

        {/* Saved Chapters Tab */}
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'history' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <History className="w-4 h-4" /> 
          <span>Saved Chapters</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeSubTab === 'history' ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
          }`}>
            {(story.history || []).length}
          </span>
        </button>

        {/* '+' Button to Add New Custom Rulebook Tab */}
        <button
          onClick={() => setShowAddTabModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-sm font-medium border border-slate-700 transition-colors ml-auto sm:ml-0"
          title="Add New Custom Rulebook (e.g., Rulebook 3 - World Settings)"
        >
          <PlusCircle className="w-4 h-4" /> 
          <span>Add Rulebook</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${isRulebook ? (activeRulebook?.name || 'rules') : activeSubTab === 'chars' ? 'characters' : 'saved chapters'}...`}
          className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* ACTIVE SECTION CONTENT & INSIDE '+' BUTTON */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            {activeSubTab === 'chars' ? (
              <>
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Character &amp; Location Mapping</span>
              </>
            ) : activeSubTab === 'history' ? (
              <>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Saved Chapters History</span>
              </>
            ) : (
              <>
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeRulebook?.name} ({activeRulebook?.category}) Entries</span>
              </>
            )}
          </h3>
          
          {/* Inside Tab '+' Add New Entry Button */}
          {activeSubTab !== 'history' && (
            <button
              onClick={() => {
                setEditingItemId(null);
                setNewKeyword('');
                setNewTranslation('');
                setNewRuleNotes('');
                setCharType('Main Character');
                setNewOrigName('');
                setNewTargetName('');
                setNewPersona('');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-cyan-600/20 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Entry (+)
            </button>
          )}
        </div>

        {/* Content Display: Character & Location Sheet */}
        {activeSubTab === 'chars' && (
          <div className="space-y-2.5">
            {characters
              .filter(char => 
                (char.originalName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                (char.newName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (char.personality || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((char) => (
                <div 
                  key={char.id} 
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white text-sm">{char.originalName}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-cyan-400 text-sm font-bold">{char.newName}</span>
                      {char.isAuto && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Auto
                        </span>
                      )}
                    </div>
                    {char.personality && (
                      <p className="text-xs text-slate-400 font-normal leading-relaxed">{char.personality}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setEditingItemId(char.id);
                        const matchType = char.originalName.match(/^\[(.*?)\]\s*(.*)$/);
                        if (matchType) {
                          setCharType(matchType[1]);
                          setNewOrigName(matchType[2]);
                        } else {
                          setCharType(char.type || 'Main Character');
                          setNewOrigName(char.originalName);
                        }
                        setNewTargetName(char.newName);
                        setNewPersona(char.personality);
                        setShowAddModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
                      title="Edit character"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCharacter(char.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-xs"
                      title="Delete character"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}

            {characters.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No character or location entries yet. Click "Add New Entry (+)" to create one.
              </div>
            )}
          </div>
        )}

        {/* Content Display: Rulebook Rules */}
        {isRulebook && (
          <div className="space-y-2.5">
            {(activeRulebook?.rules || [])
              .filter(rule => 
                (rule.keyword || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                (rule.translation || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((rule) => (
                <div 
                  key={rule.id} 
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-white text-sm font-mono">{rule.keyword}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-cyan-400 text-sm font-medium">{rule.translation}</span>
                      {rule.isAuto && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          Auto
                        </span>
                      )}
                    </div>
                    {rule.contextNotes && (
                      <p className="text-xs text-slate-400">{rule.contextNotes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setEditingItemId(rule.id);
                        setNewKeyword(rule.keyword);
                        setNewTranslation(rule.translation);
                        setNewRuleNotes(rule.contextNotes || '');
                        setShowAddModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
                      title="Edit rule"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-xs"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}

            {(activeRulebook?.rules || []).length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No rules in this rulebook yet. Click "Add New Entry (+)" to get started.
              </div>
            )}
          </div>
        )}

        {/* Content Display: Saved Chapters History */}
        {activeSubTab === 'history' && (
          <div className="space-y-3">
            {(story.history || [])
              .filter(ch => (ch.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
              .map((chapter) => (
                <div
                  key={chapter.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">
                        {chapter.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {new Date(chapter.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="text-emerald-300 font-bold">
                        Word Count: {chapter.wordCount} words
                      </span>
                      {chapter.language && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400 uppercase">{chapter.language}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setViewingChapter(chapter);
                        setCopiedChapter(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Read
                    </button>
                    {onLoadChapterIntoDashboard && (
                      <button
                        onClick={() => onLoadChapterIntoDashboard(chapter)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-xs font-semibold transition-colors"
                      >
                        Load to Studio
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs transition-colors"
                      title="Delete chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {(story.history || []).length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No chapters saved in history yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* POP-UP MODAL FOR INSIDE-TAB ADD / EDIT NEW ENTRY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {activeSubTab === 'chars' ? (
                <>
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>{editingItemId ? 'Edit Character / Location' : 'Add Character / Nested Location'}</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>{editingItemId ? 'Edit Rule' : `Add Rule to ${activeRulebook?.name}`}</span>
                </>
              )}
            </h3>

            {activeSubTab === 'chars' ? (
              <form onSubmit={handleSaveCharacterEntry} className="space-y-3.5 text-xs">
                {/* Character Type Selection Dropdown */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Character / Entity Type (Select or Type)</label>
                  <select
                    value={charType}
                    onChange={(e) => setCharType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-cyan-400 font-medium focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Main Character">Main Character</option>
                    <option value="Side Character">Side Character</option>
                    <option value="Supporting Character">Supporting Character</option>
                    <option value="One-Time Character">One-Time Character</option>
                    <option value="Location (Nested)">Location (Nested Hierarchy)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Original Name / Location Name</label>
                  <input
                    type="text"
                    required
                    value={newOrigName}
                    onChange={(e) => setNewOrigName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. Lin Feng OR India > Bihar > Muzaffarpur"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Localized Target Name</label>
                  <input
                    type="text"
                    required
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. रुद्र (Rudra) OR मुजफ्फरपुर (Muzaffarpur)"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Voice / Hierarchy Notes</label>
                  <input
                    type="text"
                    value={newPersona}
                    onChange={(e) => setNewPersona(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. Quiet, lethal, pragmatic OR Under State jurisdiction"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItemId(null);
                    }} 
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveRuleEntry} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-mono">Keyword (Original)</label>
                  <input
                    type="text"
                    required
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. Qi Gathering, Golden Core..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-mono">Translation (Localized)</label>
                  <input
                    type="text"
                    required
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. प्राण ऊर्जा (Qi), स्वर्ण चक्र..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-mono">Notes / Context (Optional)</label>
                  <input
                    type="text"
                    value={newRuleNotes}
                    onChange={(e) => setNewRuleNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Context notes or tone guidance..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItemId(null);
                    }} 
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM RULEBOOK TAB */}
      {showAddTabModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              <span>Create New Rulebook Tab</span>
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">
                  Rulebook Name
                </label>
                <input
                  type="text"
                  value={customTabName}
                  onChange={(e) => setCustomTabName(e.target.value)}
                  placeholder="e.g. Rulebook 3 - Cultivation Ranks"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">
                  Category
                </label>
                <select
                  value={customTabCategory}
                  onChange={(e) => setCustomTabCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-cyan-400 font-medium focus:outline-none focus:border-cyan-400"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button 
                onClick={() => setShowAddTabModal(false)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCustomRulebook} 
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold"
              >
                Create Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: READ CHAPTER */}
      {viewingChapter && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">{viewingChapter.title}</h3>
                <div className="text-xs text-slate-400 font-mono">
                  {viewingChapter.wordCount} words
                </div>
              </div>
              <button
                onClick={() => setViewingChapter(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 whitespace-pre-wrap text-sm text-slate-200 leading-relaxed font-normal">
              {viewingChapter.outputText}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingChapter.outputText);
                  setCopiedChapter(true);
                  setTimeout(() => setCopiedChapter(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900 transition-colors flex items-center gap-1.5 font-medium"
              >
                {copiedChapter ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedChapter ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
