/**
 * Direct Document Upload (.txt, .docx, .pdf) text extractor & Rule/Character Auto-Learner
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md' || extension === 'json' || extension === 'srt') {
    return await file.text();
  }

  if (extension === 'docx') {
    try {
      // DOCX is a zip file containing word/document.xml
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawString = decoder.decode(uint8);

      // Extract text content from document.xml xml tags <w:t>...</w:t>
      const matches = rawString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (matches && matches.length > 0) {
        const extracted = matches
          .map(m => m.replace(/<[^>]+>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ');
        if (extracted.trim().length > 50) {
          return extracted;
        }
      }
      
      // Fallback clean printable characters
      const cleanText = rawString
        .replace(/[^\x20-\x7E\n\r\t\u0900-\u097F]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      return cleanText.slice(0, 100000);
    } catch (e) {
      console.warn('Fallback docx parsing error', e);
      return await file.text();
    }
  }

  if (extension === 'pdf') {
    try {
      // Basic client-side PDF stream text extractor
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('latin1');
      const text = decoder.decode(uint8);

      // Extract PDF text blocks between BT and ET, or plain text streams
      const streamMatches = text.match(/BT[\s\S]*?ET/g) || text.match(/\(([^)]+)\)\s*Tj/g);
      if (streamMatches && streamMatches.length > 0) {
        const parsed = streamMatches
          .map(block => {
            const inner = block.match(/\((.*?)\)/g);
            return inner ? inner.map(s => s.slice(1, -1)).join(' ') : '';
          })
          .filter(Boolean)
          .join(' ');
        if (parsed.trim().length > 30) {
          return parsed;
        }
      }

      // Fallback: extract printable strings
      const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
      return printable.slice(0, 80000);
    } catch (e) {
      console.warn('PDF stream extraction error', e);
      return `[PDF Text Extraction from ${file.name}]`;
    }
  }

  return await file.text();
}

export interface ExtractedEntityCandidates {
  characters: Array<{
    originalName: string;
    suggestedName: string;
    role: string;
    personality: string;
    voiceNotes: string;
  }>;
  terminology: Array<{
    keyword: string;
    translation: string;
    term?: string;
    replacement?: string;
    contextNotes: string;
  }>;
}

/**
 * Scan raw text document and suggest characters & terms for the Sub-Library
 */
export function scanTextForEntities(text: string): ExtractedEntityCandidates {
  const characters: ExtractedEntityCandidates['characters'] = [];
  const terminology: ExtractedEntityCandidates['terminology'] = [];

  // Find capitalized proper nouns / character patterns (e.g., Lin Feng, Elder Wu, Master Zhao, John Doe)
  const namePatterns = [
    /\b(Elder|Master|Lord|Lady|Young Master|General|Doctor|Captain|King|Queen|Emperor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g,
    /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g,
  ];

  const seenNames = new Set<string>();

  for (const pat of namePatterns) {
    let match;
    while ((match = pat.exec(text)) !== null) {
      const full = match[0].trim();
      if (
        full.length > 3 &&
        !seenNames.has(full.toLowerCase()) &&
        !['The Chapter', 'Once Upon', 'In The', 'He Was', 'She Was', 'It Was', 'They Were', 'All Of', 'At That', 'One Day'].includes(full)
      ) {
        seenNames.add(full.toLowerCase());
        
        // Auto Hindi-fication suggestion
        const suggested = suggestIndianLocalizedName(full);
        characters.push({
          originalName: full,
          suggestedName: suggested,
          role: full.toLowerCase().includes('elder') || full.toLowerCase().includes('master') 
            ? 'Senior Authority / Mentor' 
            : 'Key Character / Rival',
          personality: 'Auto-detected from document context. Dynamic, distinct voice.',
          voiceNotes: 'Use conversational dialogue delivery matching status.',
        });
      }
      if (characters.length >= 8) break;
    }
  }

  // Scan for fantasy/sci-fi terms
  const termKeywords = [
    'Qi Gathering', 'Golden Core', 'Cultivation', 'Dantian', 'Sect', 'Meridian',
    'Spatial Ring', 'Flying Sword', 'Divine Sense', 'Tribulation', 'Dao', 'Beast Core',
    'Cybernetic', 'Neural Link', 'Megacorp', 'Data Core', 'Black Market', 'Laser Blade'
  ];

  for (const tk of termKeywords) {
    if (new RegExp(`\\b${tk}\\b`, 'i').test(text)) {
      const rep = suggestTermReplacement(tk);
      terminology.push({
        keyword: tk,
        translation: rep,
        term: tk,
        replacement: rep,
        contextNotes: `Auto-scanned term from uploaded chapter text.`,
      });
    }
  }

  return {
    characters: characters.slice(0, 10),
    terminology: terminology.slice(0, 10),
  };
}

function suggestIndianLocalizedName(name: string): string {
  const map: Record<string, string> = {
    'lin feng': 'रुद्र (Rudra)',
    'elder wu': 'ऋषि वशिष्ठ (Rishi Vashisth)',
    'xiao yan': 'आर्यन (Aryan)',
    'meng hao': 'मानस (Manas)',
    'han li': 'हर्षवर्धन (Harshvardhan)',
    'bai xiaochun': 'भव्य (Bhavya)',
    'su ming': 'समर (Samar)',
    'wang lin': 'वीरेंद्र (Virendra)',
    'tang san': 'तरुण (Tarun)',
    'yang kai': 'युवराज (Yuvraj)',
  };

  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }

  // General Indianized sounding name
  const first = name.split(' ')[0] || 'Character';
  return `${first} / विक्रम (Vikram)`;
}

function suggestTermReplacement(term: string): string {
  const map: Record<string, string> = {
    'qi gathering': 'प्राण संचय (Prana Sanchay)',
    'golden core': 'स्वर्ण चक्र (Swarna Chakra)',
    'cultivation': 'तपस्या / साधना (Sadhana)',
    'dantian': 'नाभि केंद्र / प्राण कुण्ड',
    'sect': 'आश्रम / कुल / घराना',
    'meridian': 'नाड़ियां (Nadiyan)',
    'spatial ring': 'शून्य मुद्रिका (Shunya Mudrika)',
    'flying sword': 'वायुगामी खड्ग',
    'divine sense': 'दिव्य दृष्टि (Divya Drishti)',
    'tribulation': 'दैवीय परीक्षा (Daivik Pareeksha)',
    'neural link': 'मगज़-जैक (Neural Connect)',
    'megacorp': 'महा-कंपनी / कॉर्पोरेट सिंडिकेट',
  };
  return map[term.toLowerCase()] || `स्थानीय संज्ञा (${term})`;
}
