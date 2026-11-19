# StoryForge AI Studio (KathaStudio AI)

A mobile-first, dark-mode AI Story Localization and Editing Studio with TubeGen.ai-style visual pipeline, nested folder library architecture, master human novelist storytelling engine, and click-to-jump error audit.

---

## 🚀 Key Features

1. **Master Novelist Localization Engine**:
   - High-budget audio drama / cinematic web series style prose.
   - Enforces the strict word count expansion rule (+100 to +150 words over target minimum).
   - Powered by Google Gemini 2.5 Flash / Thinking models with seamless offline local fallback.
   - Supports Natural Mix (Hindi + English + Hinglish), Hindi, English, and Hinglish.

2. **TubeGen.ai-Style Visual Pipeline**:
   - Step 1: Story & Rules Loaded
   - Step 2: Character & Tone Mapping
   - Step 3: Novelist Rewrite (+100–150 words)
   - Step 4: Self-Audit & Entity Discovery

3. **Nested Library Architecture ("Library Inside Library")**:
   - Master Story Folders (Cultivation Saga, Neon Mumbai 2099, System Made Me Invincible, or custom folders).
   - Isolated Sub-Libraries per folder: Terminology Rulebooks, Tone & Style Directives, Character & Location Voice Sheets, and Chapter History.

4. **Background Batch Processing**:
   - Automated queue for multi-chapter localization (e.g., Ch 131–135) with live progress bars.
   - Discovers new character and term entities on the fly and auto-adds them to the story's Sub-Library.

5. **Deep Scan & Audit**:
   - Side-by-side diff highlighting replaced terms and character names.
   - Instant detection of missed or untranslated names in the rewritten output.

6. **Full Supabase Cloud Database & Offline Fallback**:
   - Live cloud persistence for stories, sub-libraries, history, and studio settings.
   - Zero-latency localStorage cache with automatic background cloud sync.
   - Integrated schema generator: [supabase/schema.sql](supabase/schema.sql).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Express, Node.js, TSX, Dotenv
- **AI Engine**: `@google/genai` (Gemini 2.5 Flash / Fallback Novelist Engine)
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`)

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already configured):
```bash
# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
SUPABASE_SECRET_KEY="your-supabase-secret-key"

# Gemini AI API (Optional - Novelist fallback engine activates automatically if omitted)
GEMINI_API_KEY=""
```

### 3. Setup Supabase Database
Run the SQL script found in [supabase/schema.sql](supabase/schema.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard/project/kkmqhjtyiizkeghkpide/sql).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Start
```bash
npm run build
npm start
```
