import { StoryFolder, AppSettings, RuleItem, CharacterItem, ChapterHistory } from '../types';

const STORAGE_KEY_STORIES = 'kathastudio_stories_v1';
const STORAGE_KEY_ACTIVE_ID = 'kathastudio_active_story_id_v1';
const STORAGE_KEY_SETTINGS = 'kathastudio_settings_v1';

export const INITIAL_STORIES: StoryFolder[] = [
  {
    id: 'story-cultivation-saga',
    title: 'Cultivation Saga (अमर पथ)',
    description: 'Eastern fantasy epic localized with ancient Himalayan mysticism, raw combat intensity, and philosophical depth.',
    genre: 'Xianxia / Martial Fantasy',
    colorTheme: 'from-cyan-600 via-teal-700 to-emerald-900',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rulebook1: [
      {
        id: 'r1-1',
        keyword: 'Qi Gathering',
        translation: 'प्राण संचय (Prana Sanchay)',
        contextNotes: 'Avoid scientific words; treat Prana as a living breath flowing through meridians.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r1-2',
        keyword: 'Golden Core',
        translation: 'स्वर्ण चक्र (Swarna Chakra)',
        contextNotes: 'Do not use literal English "Golden Core" in high-tension meditative breakthroughs.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r1-3',
        keyword: 'Sect Master',
        translation: 'कुलाधिपति / गुरुदेव',
        contextNotes: 'Use Kuladhipati when spoken with formal reverence, Gurudev when intimate disciple speech.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r1-4',
        keyword: 'Spatial Ring',
        translation: 'शून्य मुद्रिका (Shunya Mudrika)',
        contextNotes: 'Auto-detected from chapter 129 artifact chamber.',
        isAuto: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r1-5',
        keyword: 'Courting Death',
        translation: 'मौत को न्योता देना / अपनी चिता खुद सजाना',
        contextNotes: 'Never translate as literal "court death". Use punchy street-smart or regal threats.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    rulebook2: [
      {
        id: 'r2-1',
        keyword: 'Pacing & Suspense',
        translation: 'Show internal tension before any sword clash. Stretch seconds into minutes with sensory heartbeats.',
        contextNotes: 'Original: "He stabbed fast." -> Rewrite: "उसकी उंगलियों ने मूठ को कस लिया। हवा थम गई, मानो वक्त खुद अपनी सांस रोककर तमाशा देखने लगा हो..."',
        category: 'Pacing & Suspense',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r2-2',
        keyword: 'Dialogue & Slang',
        translation: 'Natural mix of conversational Hindi and sharp English terms for modern pacing. No pedantic textbook Hindi.',
        contextNotes: 'Dialogue should sound like a gripping audio webseries or cinematic movie script.',
        category: 'Dialogue & Slang',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r2-3',
        keyword: 'Sensory Detail',
        translation: 'Meaningful expansion: Always describe the smell of ozone, iron in the blood, and the shivering cold of the void.',
        contextNotes: 'Never write filler words. Expand by exploring character hesitation, dread, and atmospheric temperature.',
        category: 'Sensory Detail',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    characters: [
      {
        id: 'cl-1',
        originalName: 'Lin Feng',
        newName: 'रुद्र (Rudra)',
        role: 'Protagonist / Reborn Swordsman',
        personality: 'Quiet, lethal, pragmatic; speaks with chilling calmness even facing gods.',
        voiceNotes: 'Never screams or rants. Uses short, weighted sentences in natural Hindi with occasional icy English pauses.',
        type: 'character',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cl-2',
        originalName: 'Elder Wu',
        newName: 'ऋषि वशिष्ठ (Rishi Vashisth)',
        role: 'Antagonist Elder of Nine Clouds',
        personality: 'Hypocritical tyrant, masking arrogance with moral righteousness.',
        voiceNotes: 'Speaks with heavy dramatic gravitas, invoking clan honor while plotting betrayal.',
        type: 'character',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cl-3',
        originalName: 'Xiao Yan',
        newName: 'आर्यन (Aryan)',
        role: 'Sworn Brother / Alchemist',
        personality: 'Witty, loyal, sarcastic under fire.',
        voiceNotes: 'Uses playful Hinglish banter to break tense battlefield moments.',
        type: 'character',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cl-4',
        originalName: 'Black Wind Gorge',
        newName: 'काल वायु घाटी (Kaal Vaayu Ghaati)',
        role: 'Forbidden Cursed Ravine',
        personality: 'Desolate, howling winds that tear into physical meridians.',
        voiceNotes: 'Described with heavy gothic Dread.',
        type: 'location',
        isAuto: true,
        updatedAt: new Date().toISOString(),
      }
    ],
    history: [
      {
        id: 'ch-1',
        chapterNumber: 128,
        title: 'Chapter 128: The Awakening of the Frost Meridian',
        sourceText: 'Lin Feng stood at the peak of Black Wind Gorge. The wind was cold. Elder Wu stared at him with murderous intent. "Hand over the Golden Core and die!" Lin Feng remained calm.',
        outputText: 'काल वायु घाटी की बर्फीली चट्टान पर खड़ा रुद्र हवा के थपेड़ों को महसूस कर रहा था। हवा सिर्फ ठंडी नहीं थी—वह हड्डियों के भीतर तक चुभती हुई किसी भूखे खंजर जैसी महसूस हो रही थी।\n\nसामने खड़ा ऋषि वशिष्ठ उसकी ओर इस तरह घूर रहा था मानो कोई भेड़िया अपने कमजोर शिकार को नाप रहा हो। उसकी आंखों में लालच और नफरत का ऐसा जहरीला संगम था जो छुपाए नहीं छुप रहा था।\n\n"रुद्र! स्वर्ण चक्र मेरे हवाले कर दे, शायद तेरी चिता को सम्मानजनक विदाई मिल जाए!" वशिष्ठ की आवाज में कड़कती हुई गुर्राहट थी।\n\nलेकिन रुद्र के चेहरे पर शिकन तक न आई। उसने अपनी शून्यता में डूबी उंगलियों को तलवार की मूठ पर कस लिया। जब आप मौत को कई बार अपनी आंखों से देख चुके हों, तो धमकियां सिर्फ शोर बनकर रह जाती हैं...',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        wordCount: 162,
        language: 'natural_mix',
        changesSummary: 'Lin Feng -> रुद्र (Rudra), Elder Wu -> ऋषि वशिष्ठ, Black Wind Gorge -> काल वायु घाटी, Golden Core -> स्वर्ण चक्र. Expanded cold atmosphere and internal calmness (+126 words).',
        auditIssuesCount: 0,
        minWords: 30,
      }
    ]
  },
  {
    id: 'story-mumbai-neon-noir',
    title: 'Neon Mumbai 2099 (सायबर नगरी)',
    description: 'Cyberpunk dystopian thriller blending Marathi street slang, high-tech corporate espionage, and Hinglish banter.',
    genre: 'Cyberpunk / Dystopian Sci-Fi',
    colorTheme: 'from-fuchsia-600 via-purple-800 to-indigo-950',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    rulebook1: [
      {
        id: 'r1-201',
        keyword: 'Neural Deck',
        translation: 'मगज़-जैक (Magaz-Jack)',
        contextNotes: 'Street slang for illegal cranial neural interface.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r1-202',
        keyword: 'Corporate Enforcer',
        translation: 'कॉर्पोरेट शिकारी / वर्दीधारी कसाई',
        contextNotes: 'Use gritty street lingo.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    rulebook2: [
      {
        id: 'r2-201',
        keyword: 'Dialogue & Slang',
        translation: 'Fast-paced street banter combining Bambaiya Hindi, tech English, and neon grit.',
        contextNotes: '"Scene tight hai boss", "Glitch mat daal", "Neural drive toast ho gaya".',
        category: 'Dialogue & Slang',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    characters: [
      {
        id: 'cl-201',
        originalName: 'Jax Vance',
        newName: 'कबीर "ग्लीच" सावंत (Kabir "Glitch" Sawant)',
        role: 'Rogue Data-Courier',
        personality: 'Cynical, hyper-alert, addicted to adrenaline and cheap chai.',
        voiceNotes: 'Speaks rapidly in Hinglish with sardonic Bombay humor.',
        type: 'character',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    history: []
  },
  {
    id: 'story-system-invincible',
    title: 'System Made Me Invincible',
    description: 'High-stakes LitRPG progression saga localized with punchy Indian humor, system alerts, and fierce action pacing.',
    genre: 'LitRPG / System Action',
    colorTheme: 'from-amber-600 via-rose-700 to-red-950',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    rulebook1: [
      {
        id: 'r1-301',
        keyword: 'System Prompt',
        translation: 'दिव्य प्रणाली संदेश (System Alert)',
        contextNotes: 'Keep system prompts crisp and impactful.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r1-302',
        keyword: 'Mana Core',
        translation: 'ऊर्जा केंद्र (Urja Kendra)',
        contextNotes: 'Treat power upgrades with visceral physical intensity.',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    rulebook2: [
      {
        id: 'r2-301',
        keyword: 'Action & Swagger',
        translation: 'Keep battle momentum fast with sharp Hinglish punchlines and vivid physical impact.',
        contextNotes: 'Make the protagonist sound effortlessly confident when outmatched.',
        category: 'Pacing & Suspense',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    characters: [
      {
        id: 'cl-301',
        originalName: 'Chen Mo',
        newName: 'आरव (Aarav)',
        role: 'System Host / Underdog',
        personality: 'Sharp-tongued, fearless, thrives under impossible odds.',
        voiceNotes: 'Casual modern Hindi mixed with confident English one-liners.',
        type: 'Main Character',
        isAuto: false,
        updatedAt: new Date().toISOString(),
      }
    ],
    history: []
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  claudeApiKey: '',
  activeProvider: 'gemini',
  targetWordExtraMin: 100,
  targetWordExtraMax: 150,
  autoLearnEntities: true,
  soundEffects: true,
};

// Migrate stored stories to the new interfaces
function migrateStory(rawStory: any): StoryFolder {
  const rulebook1: RuleItem[] = (rawStory.rulebook1 || []).map((r: any, idx: number) => ({
    id: r.id || `rb1-${idx}`,
    keyword: r.keyword || r.term || '',
    translation: r.translation || r.replacement || '',
    isAuto: r.isAuto !== undefined ? r.isAuto : r.isAutoLearned,
    contextNotes: r.contextNotes || '',
    updatedAt: r.updatedAt || new Date().toISOString(),
  }));

  const rulebook2: RuleItem[] = (rawStory.rulebook2 || []).map((r: any, idx: number) => ({
    id: r.id || `rb2-${idx}`,
    keyword: r.keyword || r.category || 'Pacing & Suspense',
    translation: r.translation || r.ruleDescription || '',
    isAuto: r.isAuto !== undefined ? r.isAuto : r.isAutoLearned,
    contextNotes: r.contextNotes || r.examples || '',
    category: r.category || 'Pacing & Suspense',
    updatedAt: r.updatedAt || new Date().toISOString(),
  }));

  const characters: CharacterItem[] = (rawStory.characters || rawStory.characterLocations || []).map((c: any, idx: number) => ({
    id: c.id || `cl-${idx}`,
    originalName: c.originalName || '',
    newName: c.newName || '',
    personality: c.personality || 'Dynamic personality',
    isAuto: c.isAuto !== undefined ? c.isAuto : c.isAutoLearned,
    voiceNotes: c.voiceNotes || '',
    role: c.role || '',
    type: c.type || 'character',
    updatedAt: c.updatedAt || new Date().toISOString(),
  }));

  const history: ChapterHistory[] = (rawStory.history || rawStory.savedChapters || []).map((h: any, idx: number) => ({
    id: h.id || `ch-${idx}`,
    title: h.title || `Chapter ${idx + 1}`,
    sourceText: h.sourceText || '',
    outputText: h.outputText || h.localizedText || '',
    timestamp: h.timestamp || h.createdAt || new Date().toISOString(),
    wordCount: h.wordCount || h.outputWordCount || 0,
    chapterNumber: h.chapterNumber,
    language: h.language,
    changesSummary: h.changesSummary,
    auditIssuesCount: h.auditIssuesCount,
    minWords: h.minWords,
  }));

  return {
    id: rawStory.id,
    title: rawStory.title,
    description: rawStory.description || '',
    rulebook1,
    rulebook2,
    customRulebooks: Array.isArray(rawStory.customRulebooks) ? rawStory.customRulebooks : undefined,
    characters,
    history,
    createdAt: rawStory.createdAt || new Date().toISOString(),
    genre: rawStory.genre || 'General Fiction',
    colorTheme: rawStory.colorTheme || 'from-cyan-600 via-teal-700 to-emerald-900',
    updatedAt: rawStory.updatedAt || new Date().toISOString(),
  };
}

export function loadStories(): StoryFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(INITIAL_STORIES));
      localStorage.setItem('kathastudio_seed_invincible_v1', '1');
      return INITIAL_STORIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_STORIES;
    }
    const migrated = parsed.map(migrateStory);
    if (!localStorage.getItem('kathastudio_seed_invincible_v1')) {
      const invincibleTemplate = INITIAL_STORIES.find(s => s.id === 'story-system-invincible');
      if (invincibleTemplate && !migrated.some(s => s.id === invincibleTemplate.id)) {
        migrated.push(invincibleTemplate);
      }
      localStorage.setItem('kathastudio_seed_invincible_v1', '1');
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(migrated));
    }
    return migrated;
  } catch (e) {
    console.error('Failed to load stories from localStorage', e);
    return INITIAL_STORIES;
  }
}

export function saveStories(stories: StoryFolder[]) {
  try {
    localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(stories));
  } catch (e) {
    console.error('Failed to save stories to localStorage', e);
  }

  // Asynchronous background cloud sync (non-blocking)
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    fetch('/api/stories/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stories }),
    }).catch(() => {
      // Direct client-side Supabase sync fallback
      import('./supabaseClient').then(({ saveStoryToSupabase }) => {
        stories.forEach(s => saveStoryToSupabase(s));
      }).catch(() => {});
    });
  }
}

export async function syncWithCloudStories(): Promise<{ stories: StoryFolder[]; source: 'cloud' | 'local' }> {
  try {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      const res = await fetch('/api/stories');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.stories) && json.stories.length > 0) {
          const migrated = json.stories.map(migrateStory);
          localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(migrated));
          return { stories: migrated, source: 'cloud' };
        }
      }
    }
  } catch (e) {
    console.info('Cloud sync deferred to localStorage:', e);
  }
  return { stories: loadStories(), source: 'local' };
}

export function getActiveStoryId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (active) return active;
    return INITIAL_STORIES[0].id;
  } catch {
    return INITIAL_STORIES[0].id;
  }
}

export function setActiveStoryId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (e) {
    console.error(e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }

  // Cloud sync
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => {});
  }
}

export function exportFullBackupJSON(): string {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    stories: loadStories(),
    activeStoryId: getActiveStoryId(),
    settings: loadSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importFullBackupJSON(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.stories || !Array.isArray(parsed.stories)) {
      return { success: false, message: 'Invalid backup file: stories array missing.' };
    }
    const migrated = parsed.stories.map(migrateStory);
    saveStories(migrated);
    if (parsed.activeStoryId) {
      setActiveStoryId(parsed.activeStoryId);
    }
    if (parsed.settings) {
      saveSettings(parsed.settings);
    }
    return { success: true, message: `Successfully imported ${migrated.length} story folder(s)!` };
  } catch (err: any) {
    return { success: false, message: `Failed to parse backup JSON: ${err.message || 'Unknown error'}` };
  }
}
