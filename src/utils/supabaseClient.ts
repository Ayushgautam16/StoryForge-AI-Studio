import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StoryFolder, AppSettings } from '../types';

// Safely access env vars in Vite or Node environments
const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://kkmqhjtyiizkeghkpide.supabase.co';

const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== 'undefined' && (process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_SECRET_KEY)) ||
  'sb_publishable_UrqIwtcFoGGafQIdfJj3EQ_roBucUaY';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    }
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
  return null;
}

export interface SupabaseStatus {
  isConnected: boolean;
  tablesReady: boolean;
  message: string;
}

/**
 * Checks connection to Supabase and verifies if the `stories` table is accessible
 */
export async function checkSupabaseConnection(): Promise<SupabaseStatus> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      isConnected: false,
      tablesReady: false,
      message: 'Supabase URL or Publishable Key missing.',
    };
  }

  try {
    const { data, error } = await client.from('stories').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet (404/PGRST116/etc.)
      return {
        isConnected: true,
        tablesReady: false,
        message: `Connected to Supabase, but "stories" table not yet created: ${error.message}`,
      };
    }
    return {
      isConnected: true,
      tablesReady: true,
      message: 'Connected to Supabase and database tables are ready!',
    };
  } catch (err: any) {
    return {
      isConnected: false,
      tablesReady: false,
      message: err?.message || 'Failed to connect to Supabase.',
    };
  }
}

/**
 * Fetch all stories from Supabase
 */
export async function fetchStoriesFromSupabase(): Promise<StoryFolder[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('stories')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetch stories notice:', error?.message);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      genre: row.genre || 'General Fiction',
      colorTheme: row.color_theme || 'from-cyan-600 via-teal-700 to-emerald-900',
      rulebook1: Array.isArray(row.rulebook1) ? row.rulebook1 : [],
      rulebook2: Array.isArray(row.rulebook2) ? row.rulebook2 : [],
      customRulebooks: Array.isArray(row.custom_rulebooks) ? row.custom_rulebooks : undefined,
      characters: Array.isArray(row.characters) ? row.characters : [],
      history: Array.isArray(row.history) ? row.history : [],
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Supabase fetchStories exception:', err);
    return null;
  }
}

/**
 * Upsert story to Supabase
 */
export async function saveStoryToSupabase(story: StoryFolder): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = {
      id: story.id,
      title: story.title,
      description: story.description || '',
      genre: story.genre || 'General Fiction',
      color_theme: story.colorTheme || 'from-cyan-600 via-teal-700 to-emerald-900',
      rulebook1: story.rulebook1 || [],
      rulebook2: story.rulebook2 || [],
      custom_rulebooks: story.customRulebooks || [],
      characters: story.characters || [],
      history: story.history || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('stories')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase saveStory error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveStory exception:', err);
    return false;
  }
}

/**
 * Delete story from Supabase
 */
export async function deleteStoryFromSupabase(storyId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('stories').delete().eq('id', storyId);
    if (error) {
      console.warn('Supabase deleteStory error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteStory exception:', err);
    return false;
  }
}

/**
 * Fetch settings from Supabase
 */
export async function fetchSettingsFromSupabase(): Promise<AppSettings | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('settings')
      .select('*')
      .eq('id', 'default_settings')
      .single();

    if (error || !data) return null;

    return {
      geminiApiKey: data.gemini_api_key || '',
      claudeApiKey: data.claude_api_key || '',
      activeProvider: data.active_provider || 'gemini',
      targetWordExtraMin: data.target_word_extra_min || 100,
      targetWordExtraMax: data.target_word_extra_max || 150,
      autoLearnEntities: data.auto_learn_entities ?? true,
      soundEffects: data.sound_effects ?? true,
    };
  } catch {
    return null;
  }
}

/**
 * Save settings to Supabase
 */
export async function saveSettingsToSupabase(settings: AppSettings): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = {
      id: 'default_settings',
      gemini_api_key: settings.geminiApiKey || '',
      claude_api_key: settings.claudeApiKey || '',
      active_provider: settings.activeProvider || 'gemini',
      target_word_extra_min: settings.targetWordExtraMin || 100,
      target_word_extra_max: settings.targetWordExtraMax || 150,
      auto_learn_entities: settings.autoLearnEntities ?? true,
      sound_effects: settings.soundEffects ?? true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('settings')
      .upsert(payload, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}
