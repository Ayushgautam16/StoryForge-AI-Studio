-- ====================================================================
-- StoryForge AI Studio / KathaStudio Database Schema for Supabase
-- Run this in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Create stories table
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

-- 2. Create settings table
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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies to allow read, insert, update, and delete with Supabase API keys
DROP POLICY IF EXISTS "Public access to stories" ON public.stories;
CREATE POLICY "Public access to stories"
  ON public.stories
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to settings" ON public.settings;
CREATE POLICY "Public access to settings"
  ON public.settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Seed initial preset stories if table is empty
INSERT INTO public.stories (id, title, description, genre, color_theme, rulebook1, rulebook2, characters, history, created_at, updated_at)
VALUES 
(
  'story-cultivation-saga',
  'Cultivation Saga (अमर पथ)',
  'Eastern fantasy epic localized with ancient Himalayan mysticism, raw combat intensity, and philosophical depth.',
  'Xianxia / Martial Fantasy',
  'from-cyan-600 via-teal-700 to-emerald-900',
  '[
    {"id": "r1-1", "keyword": "Qi Gathering", "translation": "प्राण संचय (Prana Sanchay)", "contextNotes": "Avoid scientific words; treat Prana as a living breath flowing through meridians.", "isAuto": false},
    {"id": "r1-2", "keyword": "Golden Core", "translation": "स्वर्ण चक्र (Swarna Chakra)", "contextNotes": "Do not use literal English Golden Core in breakthroughs.", "isAuto": false},
    {"id": "r1-3", "keyword": "Sect Master", "translation": "कुलाधिपति / गुरुदेव", "contextNotes": "Kuladhipati when formal reverence, Gurudev when intimate.", "isAuto": false},
    {"id": "r1-4", "keyword": "Spatial Ring", "translation": "शून्य मुद्रिका (Shunya Mudrika)", "contextNotes": "Auto-detected artifact.", "isAuto": true},
    {"id": "r1-5", "keyword": "Courting Death", "translation": "मौत को न्योता देना / अपनी चिता खुद सजाना", "contextNotes": "Punchy street-smart or regal threats.", "isAuto": false}
  ]'::jsonb,
  '[
    {"id": "r2-1", "keyword": "Pacing & Suspense", "translation": "Show internal tension before any sword clash. Stretch seconds into minutes with sensory heartbeats.", "contextNotes": "Stretch seconds into minutes.", "category": "Pacing & Suspense", "isAuto": false},
    {"id": "r2-2", "keyword": "Dialogue & Slang", "translation": "Natural mix of conversational Hindi and sharp English terms for modern pacing. No pedantic textbook Hindi.", "contextNotes": "Cinematic webseries style.", "category": "Dialogue & Slang", "isAuto": false},
    {"id": "r2-3", "keyword": "Sensory Detail", "translation": "Meaningful expansion: Always describe the smell of ozone, iron in the blood, and the shivering cold of the void.", "contextNotes": "Never write filler words.", "category": "Sensory Detail", "isAuto": false}
  ]'::jsonb,
  '[
    {"id": "cl-1", "originalName": "Lin Feng", "newName": "रुद्र (Rudra)", "role": "Protagonist / Reborn Swordsman", "personality": "Quiet, lethal, pragmatic; speaks with chilling calmness even facing gods.", "voiceNotes": "Never screams or rants.", "type": "character", "isAuto": false},
    {"id": "cl-2", "originalName": "Elder Wu", "newName": "ऋषि वशिष्ठ (Rishi Vashisth)", "role": "Antagonist Elder of Nine Clouds", "personality": "Hypocritical tyrant, masking arrogance with moral righteousness.", "voiceNotes": "Heavy dramatic gravitas.", "type": "character", "isAuto": false},
    {"id": "cl-3", "originalName": "Xiao Yan", "newName": "आर्यन (Aryan)", "role": "Sworn Brother / Alchemist", "personality": "Witty, loyal, sarcastic under fire.", "voiceNotes": "Playful Hinglish banter.", "type": "character", "isAuto": false},
    {"id": "cl-4", "originalName": "Black Wind Gorge", "newName": "काल वायु घाटी (Kaal Vaayu Ghaati)", "role": "Forbidden Cursed Ravine", "personality": "Desolate, howling winds.", "voiceNotes": "Heavy gothic dread.", "type": "location", "isAuto": true}
  ]'::jsonb,
  '[
    {
      "id": "ch-1",
      "chapterNumber": 128,
      "title": "Chapter 128: The Awakening of the Frost Meridian",
      "sourceText": "Lin Feng stood at the peak of Black Wind Gorge. The wind was cold. Elder Wu stared at him with murderous intent. \"Hand over the Golden Core and die!\" Lin Feng remained calm.",
      "outputText": "काल वायु घाटी की बर्फीली चट्टान पर खड़ा रुद्र हवा के थपेड़ों को महसूस कर रहा था। हवा सिर्फ ठंडी नहीं थी—वह हड्डियों के भीतर तक चुभती हुई किसी भूखे खंजर जैसी महसूस हो रही थी।\\n\\nसामने खड़ा ऋषि वशिष्ठ उसकी ओर इस तरह घूर रहा था मानो कोई भेड़िया अपने कमजोर शिकार को नाप रहा हो।",
      "timestamp": "2026-11-17T09:00:00.000Z",
      "wordCount": 162,
      "language": "natural_mix",
      "changesSummary": "Lin Feng -> रुद्र (Rudra), Elder Wu -> ऋषि वशिष्ठ, Black Wind Gorge -> काल वायु घाटी.",
      "auditIssuesCount": 0,
      "minWords": 30
    }
  ]'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed initial settings
INSERT INTO public.settings (id, active_provider, target_word_extra_min, target_word_extra_max, auto_learn_entities, sound_effects, updated_at)
VALUES ('default_settings', 'gemini', 100, 150, true, true, now())
ON CONFLICT (id) DO NOTHING;
