/**
 * ASTROWORLD — Document Ingestion Service
 * Ingests external research files (such as .docx text extractions, study notes, or markdown)
 * into the Dynamic RAG Engine with automated categorization, entity extraction, and tagging.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dynamicRAGEngine, IngestedDocumentChunk } from './dynamicRagEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DocumentSectionInput {
  title: string;
  content: string;
  category?: IngestedDocumentChunk['category'];
  keywords?: string[];
}

export class DocumentIngestionService {
  private static _hasAutoIngested = false;

  /**
   * Automatically ingests pre-extracted research notes from the workspace into RAG memory.
   */
  public static autoIngestPreloadedNotes(): void {
    if (this._hasAutoIngested) return;
    this._hasAutoIngested = true;

    try {
      // 1. AstroWorld Vedic Intelligence Master Pack Notes Ingestion
      const masterPackDirs = [
        path.resolve(process.cwd(), 'backend/datasets/AstroWorld_Vedic_Intelligence_Master_Pack/notes'),
        path.resolve(process.cwd(), 'datasets/AstroWorld_Vedic_Intelligence_Master_Pack/notes'),
        path.resolve(__dirname, '../../../../datasets/AstroWorld_Vedic_Intelligence_Master_Pack/notes'),
        path.resolve(__dirname, '../../../datasets/AstroWorld_Vedic_Intelligence_Master_Pack/notes'),
      ];

      for (const notesDir of masterPackDirs) {
        if (fs.existsSync(notesDir)) {
          const files = fs.readdirSync(notesDir).filter((f) => f.endsWith('.md') && !f.startsWith('00_'));
          for (const file of files) {
            const filePath = path.join(notesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const docName = file.replace(/\.md$/, '');
            this.ingestDocumentText(`MasterPack_${docName}`, content);
          }
          break;
        }
      }

      // 2. Pre-extracted classical studies notes
      const candidates = [
        path.resolve(process.cwd(), 'backend/scripts/extracted_study_notes.txt'),
        path.resolve(process.cwd(), 'scripts/extracted_study_notes.txt'),
        path.resolve(__dirname, '../../../scripts/extracted_study_notes.txt'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          this.ingestDocumentText('Kapoor_Astronomy_and_Math_Astrology', raw);
          break;
        }
      }

      // 3. Classical OCR extraction
      const ocrCandidates = [
        path.resolve(process.cwd(), 'backend/scripts/extracted_ocr.txt'),
        path.resolve(process.cwd(), 'scripts/extracted_ocr.txt'),
        path.resolve(__dirname, '../../../scripts/extracted_ocr.txt'),
      ];
      for (const p of ocrCandidates) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          this.ingestDocumentText('Deepak_Kapoor_OCR_Extraction', raw);
          break;
        }
      }

    } catch (err: any) {
      console.warn('[DocumentIngestionService] Notice: Could not read local research text files:', err?.message || err);
    }
  }

  /**
   * Parses raw extracted text from a study document and slices it into thematic chunks.
   */
  public static ingestDocumentText(docName: string, rawText: string): number {
    const lines = rawText.split(/\r?\n/);
    const sections: DocumentSectionInput[] = [];

    let currentTitle = 'Introduction & Overview';
    let currentBuffer: string[] = [];

    const isHeaderLine = (line: string) => {
      const trimmed = line.trim();
      return (
        /^#{1,4}\s+/.test(trimmed) ||
        /^(Chapter|Section|Part|Module)\s+\d+/i.test(trimmed) ||
        /^[0-9]+(\.[0-9]+)*\s+[A-Z]/.test(trimmed) ||
        (/^[A-Z\s]{4,40}:?$/.test(trimmed) && trimmed.length > 5)
      );
    };

    for (const line of lines) {
      if (isHeaderLine(line) && currentBuffer.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentBuffer.join('\n').trim(),
        });
        currentTitle = line.replace(/^#{1,4}\s+/, '').trim();
        currentBuffer = [];
      } else {
        currentBuffer.push(line);
      }
    }

    if (currentBuffer.length > 0) {
      sections.push({
        title: currentTitle,
        content: currentBuffer.join('\n').trim(),
      });
    }

    let ingestedCount = 0;
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (sec.content.length < 30) continue; // Skip trivial lines

      const combinedText = sec.title + ' ' + sec.content;
      const category = this.detectCategory(combinedText);
      const planets = this.detectPlanets(sec.content);
      const houses = this.detectHouses(sec.content);
      const vargas = this.detectVargas(combinedText);
      const exceptions = this.detectExceptions(sec.content);
      const keywords = this.extractKeywords(combinedText);

      dynamicRAGEngine.ingestChunk({
        id: `ingested_${docName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sec_${i + 1}`,
        sourceDocName: docName,
        sectionTitle: sec.title,
        category,
        content: sec.content,
        keywords,
        planetarySubjects: planets,
        houseSubjects: houses,
        vargaSubjects: vargas,
        exceptionClauses: exceptions,
      });

      ingestedCount++;
    }

    return ingestedCount;
  }

  private static detectCategory(text: string): IngestedDocumentChunk['category'] {
    const lower = text.toLowerCase();
    if (/\b(education|degree|siddhamsha|siddhamsa|d24|vidya|study|university|academic|intellect|learning)\b/.test(lower)) {
      return 'education';
    }
    if (/\b(wealth|money|billionaire|rich|finance|indu lagna|lakshmi yoga|dhana|poverty|daridra|assets)\b/.test(lower)) {
      return 'wealth';
    }
    if (/\b(career|profession|job|d10|dashamsha|dashamsa|promotion|executive|ceo|founder|politics|vocation|karma)\b/.test(lower)) {
      return 'career';
    }
    if (/\b(marriage|spouse|relationship|upapada|navamsha|navamsa|d9|7th house|divorce|union|love|vivaha)\b/.test(lower)) {
      return 'marriage';
    }
    if (/\b(progeny|children|child|saptamsha|saptamsa|d7|santan|putrakaraka|fertility|conception|pregnancy)\b/.test(lower)) {
      return 'progeny';
    }
    if (/\b(property|land|real estate|chaturthamsha|d4|shodashamsa|d16|vehicles|house|car)\b/.test(lower)) {
      return 'property';
    }
    if (/\b(litigation|legal|court|dispute|lawsuit|enemy|shatru|shatru hanta)\b/.test(lower)) {
      return 'litigation';
    }
    if (/\b(foreign|overseas|visa|travel|relocation|abroad|migration|9th house|12th house)\b/.test(lower)) {
      return 'foreign';
    }
    if (/\b(remedy|remedies|gemstone|ratna|mantra|daana|fasting|vrata|puja|donation|bphs)\b/.test(lower)) {
      return 'remedy';
    }
    if (/\b(transit|transits|gochara|sade sati|sadesati|shani|jupiter transit)\b/.test(lower)) {
      return 'transits';
    }
    if (/\b(dasha|mahadasha|antardasha|bhukti|vimshottari|timing)\b/.test(lower)) {
      return 'dasha';
    }
    if (/\b(health|disease|medical|illness|drekkhana|22nd|64th navamsha|maraka|badhaka|vitality|longevity)\b/.test(lower)) {
      return 'health';
    }
    if (/\b(atmakaraka|moksha|spirituality|ishta devata|soul|meditation|karakamsa|d20|vimshamsha)\b/.test(lower)) {
      return 'spirituality';
    }
    if (/\b(evidence|case study|chart example|verified|data|empirical|benchmark|metric)\b/.test(lower)) {
      return 'empirical_evidence';
    }
    return 'classical_rule';
  }

  private static detectPlanets(text: string): string[] {
    const allPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    return allPlanets.filter((p) => new RegExp(`\\b${p}\\b`, 'i').test(text));
  }

  private static detectHouses(text: string): number[] {
    const houses: number[] = [];
    for (let h = 1; h <= 12; h++) {
      const pattern = new RegExp(`\\b(${h}(st|nd|rd|th)?\\s+house|house\\s+${h})\\b`, 'i');
      if (pattern.test(text)) {
        houses.push(h);
      }
    }
    return houses;
  }

  private static detectVargas(text: string): string[] {
    const vargas: string[] = [];
    const vargaList = [
      { code: 'D1', match: /\b(d1|rashi|rasi)\b/i },
      { code: 'D2', match: /\b(d2|hora)\b/i },
      { code: 'D3', match: /\b(d3|drekkana|drekkhana)\b/i },
      { code: 'D4', match: /\b(d4|chaturthamsha|caturthamsa)\b/i },
      { code: 'D7', match: /\b(d7|saptamsha|saptamsa)\b/i },
      { code: 'D9', match: /\b(d9|navamsha|navamsa|navāṃśa)\b/i },
      { code: 'D10', match: /\b(d10|dashamsha|dashamsa|daśāṃśa)\b/i },
      { code: 'D12', match: /\b(d12|dwadashamsha|dvadasamsa)\b/i },
      { code: 'D16', match: /\b(d16|shodashamsha|sodasamsa)\b/i },
      { code: 'D20', match: /\b(d20|vimshamsha|vimsamsa)\b/i },
      { code: 'D24', match: /\b(d24|siddhamsha|siddhamsa|siddhāṃśa|chaturvimshamsha)\b/i },
      { code: 'D30', match: /\b(d30|trimsamsha|trimsamsa)\b/i },
      { code: 'D60', match: /\b(d60|shashtiamsa|sastiamsa)\b/i },
    ];

    for (const v of vargaList) {
      if (v.match.test(text)) {
        vargas.push(v.code);
      }
    }
    return vargas.length > 0 ? vargas : ['D1'];
  }

  private static detectExceptions(text: string): string[] | undefined {
    const clauses: string[] = [];
    const lines = text.split(/\r?\n/);
    for (const l of lines) {
      const lower = l.toLowerCase();
      if (
        lower.includes('exception') ||
        lower.includes('cancellation') ||
        lower.includes('bhanga') ||
        lower.includes('counter-indication') ||
        lower.includes('combustion weakens') ||
        lower.includes('debilitated')
      ) {
        clauses.push(l.trim());
      }
    }
    return clauses.length > 0 ? clauses : undefined;
  }

  private static extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const counts = new Map<string, number>();
    for (const w of words) {
      counts.set(w, (counts.get(w) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w]) => w);
  }
}
