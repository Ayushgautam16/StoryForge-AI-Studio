import React, { useState, useEffect } from 'react';
import { StoryFolder, AppSettings, ChapterHistory } from './types';
import { 
  loadStories, 
  saveStories, 
  getActiveStoryId, 
  setActiveStoryId, 
  loadSettings, 
  saveSettings,
  INITIAL_STORIES
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardWorkspace } from './components/DashboardWorkspace';
import { MasterLibrary } from './components/MasterLibrary';
import { StorySubLibrary } from './components/StorySubLibrary';
import { BackgroundBatch } from './components/BackgroundBatch';
import { ScanAudit } from './components/ScanAudit';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [stories, setStories] = useState<StoryFolder[]>(() => loadStories());
  const [activeStoryId, setActiveStoryIdState] = useState<string>(() => getActiveStoryId());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'sublibrary' | 'batch' | 'audit'>('dashboard');
  const [selectedSubLibraryStory, setSelectedSubLibraryStory] = useState<StoryFolder | null>(null);
  const [subLibraryInitialTab, setSubLibraryInitialTab] = useState<'rulebook1' | 'rulebook2' | 'characters' | 'history'>('rulebook1');

  // Shared state for Scan & Audit jump
  const [scanAuditData, setScanAuditData] = useState<{ source: string; output: string }>({
    source: '',
    output: '',
  });

  // Modals & Sidebar
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStories(stories);
  }, [stories]);

  useEffect(() => {
    setActiveStoryId(activeStoryId);
  }, [activeStoryId]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Active story reference
  const activeStory = stories.find(s => s.id === activeStoryId) || stories[0] || INITIAL_STORIES[0];

  // Handler to update a story
  const handleUpdateStory = (updatedStory: StoryFolder) => {
    setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
    if (selectedSubLibraryStory?.id === updatedStory.id) {
      setSelectedSubLibraryStory(updatedStory);
    }
  };

  // Handler to set active story
  const handleSetActiveStory = (id: string) => {
    setActiveStoryIdState(id);
  };

  // Handler to open Sub-Library
  const handleOpenSubLibrary = (story: StoryFolder, tab: 'rulebook1' | 'rulebook2' | 'characters' | 'history' = 'rulebook1') => {
    setSelectedSubLibraryStory(story);
    setSubLibraryInitialTab(tab);
    setActiveTab('sublibrary');
  };

  // Create new Story Folder
  const handleCreateNewStory = (newStoryData: Omit<StoryFolder, 'id' | 'createdAt' | 'updatedAt' | 'rulebook1' | 'rulebook2' | 'characters' | 'history'>) => {
    const newFolder: StoryFolder = {
      ...newStoryData,
      id: `story-${Date.now()}`,
      rulebook1: [
        {
          id: `rb1-${Date.now()}-1`,
          keyword: 'Realm Break',
          translation: 'सीमा भंग / दिव्य उत्थान',
          contextNotes: 'Spiritual breakthrough sequence.',
          isAuto: false,
          updatedAt: new Date().toISOString(),
        }
      ],
      rulebook2: [
        {
          id: `rb2-${Date.now()}-1`,
          keyword: 'Pacing & Suspense',
          translation: 'Stretch dramatic action scenes with sensory beats.',
          contextNotes: 'Show the chill of death and shivering blade vibrations.',
          category: 'Pacing & Suspense',
          isAuto: false,
          updatedAt: new Date().toISOString(),
        }
      ],
      characters: [
        {
          id: `cl-${Date.now()}-1`,
          originalName: 'Protagonist',
          newName: 'वीर (Veer)',
          personality: 'Bold, strategic, unwavering.',
          role: 'Main Lead',
          voiceNotes: 'Determined, natural conversational Hindi.',
          type: 'character',
          isAuto: false,
          updatedAt: new Date().toISOString(),
        }
      ],
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStories(prev => [newFolder, ...prev]);
    setActiveStoryIdState(newFolder.id);
  };

  // Delete story folder
  const handleDeleteStory = (storyId: string) => {
    const remaining = stories.filter(s => s.id !== storyId);
    if (remaining.length > 0) {
      setStories(remaining);
      if (activeStoryId === storyId) {
        setActiveStoryIdState(remaining[0].id);
      }
    }
  };

  // Navigate to Scan & Audit from Dashboard
  const handleNavigateToScanAudit = (source: string, output: string) => {
    setScanAuditData({ source, output });
    setActiveTab('audit');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex font-sans">
      
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        activeStory={activeStory}
        onSelectHome={() => setActiveTab('dashboard')}
        onSelectAllProjects={() => {
          setSelectedSubLibraryStory(null);
          setActiveTab('library');
        }}
        onSelectOwnStory={() => handleOpenSubLibrary(activeStory, 'rulebook1')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-6">

        {/* Top Header with TubeGen branding & Active Story Selector */}
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'library') {
              setSelectedSubLibraryStory(null);
            }
            setActiveTab(tab);
          }}
          stories={stories}
          activeStoryId={activeStoryId}
          onSelectActiveStory={handleSetActiveStory}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNewFolderModal={() => {
            setActiveTab('library');
            setIsNewFolderModalOpen(true);
          }}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* TAB 1: DASHBOARD (WORKSPACE) */}
        {activeTab === 'dashboard' && (
          <DashboardWorkspace
            stories={stories}
            activeStory={activeStory}
            onSelectActiveStory={handleSetActiveStory}
            onUpdateStory={handleUpdateStory}
            onOpenSubLibrary={(tab) => handleOpenSubLibrary(activeStory, tab)}
            onNavigateToScanAudit={handleNavigateToScanAudit}
            customApiKey={settings.geminiApiKey}
          />
        )}

        {/* TAB 2: MASTER LIBRARY (FOLDERS GRID) */}
        {activeTab === 'library' && (
          <MasterLibrary
            stories={stories}
            activeStoryId={activeStoryId}
            onSelectStoryFolder={(story) => handleOpenSubLibrary(story)}
            onSetActiveStory={handleSetActiveStory}
            onCreateNewStory={handleCreateNewStory}
            onDeleteStory={handleDeleteStory}
          />
        )}

        {/* SUB-LIBRARY ("LIBRARY INSIDE LIBRARY") */}
        {activeTab === 'sublibrary' && selectedSubLibraryStory && (
          <StorySubLibrary
            story={selectedSubLibraryStory}
            onUpdateStory={handleUpdateStory}
            onBackToMasterLibrary={() => {
              setSelectedSubLibraryStory(null);
              setActiveTab('library');
            }}
            initialTab={subLibraryInitialTab}
            onLoadChapterIntoDashboard={(chapter: ChapterHistory) => {
              handleSetActiveStory(selectedSubLibraryStory.id);
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* TAB 3: BACKGROUND BATCH */}
        {activeTab === 'batch' && (
          <BackgroundBatch
            activeStory={activeStory}
            onUpdateStory={handleUpdateStory}
            customApiKey={settings.geminiApiKey}
          />
        )}

        {/* TAB 4: SCAN & AUDIT */}
        {activeTab === 'audit' && (
          <ScanAudit
            activeStory={activeStory}
            initialSource={scanAuditData.source}
            initialOutput={scanAuditData.output}
          />
        )}

        </main>

      </div>

      {/* Settings Modal (Gemini/Claude Key, Parameters & JSON Backup/Restore) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onReloadStories={() => setStories(loadStories())}
      />

    </div>
  );
}
