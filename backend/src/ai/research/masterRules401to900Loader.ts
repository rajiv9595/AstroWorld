/**
 * ASTROWORLD — Master Rules 401–900 Corpus Loader (6.md to 10.md)
 * 
 * Ingests, parses, and provides in-memory indexing and ultra-fast (<2ms) multi-index search
 * across all 500 classical and neuro-symbolic astrological rules (Rules 401–900):
 * - 6.md: Rules 401–500 (Avasthas, Shadbala equations, 108 Navamsas, Jaimini/Tajika)
 * - 7.md: Rules 501–600 (32 Nabhasa Yogas, Panchanga/Muhurta, Clinical Pathology)
 * - 8.md: Rules 601–700 (12-Ascendant Functional Matrices, Kota Chakra Fortress, Kalachakra Dasha)
 * - 9.md: Rules 701–800 (27 Nakshatras Shaktis/Medical, Bhinnashtakavarga Bindu Triggers)
 * - 10.md: Rules 801–900 (60 Shashtiamsha D-60, Lal Kitab Mechanics & Pitri Rina, Meena-2 Nadi)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface MasterRuleRecord {
  id: string; // e.g. "RULE_401", "RULE_626"
  ruleNumber: number; // 401 - 900
  title: string;
  sourceFile: string; // e.g. "6.md", "8.md"
  part: string;
  partNumber: number;
  category: string;
  text: string;
  keywords: string[];
}

export interface MasterSearchOptions {
  category?: string;
  partNumber?: number;
  sourceFile?: string;
  limit?: number;
}

export class MasterRules401to900Index {
  private rules: MasterRuleRecord[] = [];
  private byNumber = new Map<number, MasterRuleRecord>();
  private byPart = new Map<number, MasterRuleRecord[]>();
  private byCategory = new Map<string, MasterRuleRecord[]>();
  private byFile = new Map<string, MasterRuleRecord[]>();
  private isLoaded = false;

  constructor() {
    this.ensureLoaded();
  }

  private resolveFilePath(filename: string): string {
    const candidates = [
      path.resolve(__dirname, `../../../datasets/Research/${filename}`),
      path.resolve(process.cwd(), `backend/datasets/Research/${filename}`),
      path.resolve(process.cwd(), `datasets/Research/${filename}`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
    return candidates[0];
  }

  public ensureLoaded(): void {
    if (this.isLoaded) return;

    const files = ['6.md', '7.md', '8.md', '9.md', '10.md', '11.md', '12.md'];
    for (const file of files) {
      const filePath = this.resolveFilePath(file);
      if (!fs.existsSync(filePath)) {
        console.warn(`[MasterRules401to900Index] File not found: ${filePath}`);
        continue;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      this.parseFile(file, content);
    }

    this.isLoaded = true;
  }

  private inferCategory(ruleNum: number, title: string, text: string): string {
    const lowerTitle = title.toLowerCase();
    const lowerText = text.toLowerCase();

    if (ruleNum >= 401 && ruleNum <= 425) return 'avasthas_and_shadbala';
    if (ruleNum >= 426 && ruleNum <= 450) return 'jaimini_tajika_sahams';
    if (ruleNum >= 451 && ruleNum <= 475) return 'medical_pathology';
    if (ruleNum >= 476 && ruleNum <= 500) return 'financial_and_mundane';

    if (ruleNum >= 501 && ruleNum <= 525) return 'nabhasa_yogas';
    if (ruleNum >= 526 && ruleNum <= 550) return 'panchanga_and_muhurta';
    if (ruleNum >= 551 && ruleNum <= 575) return 'clinical_neuropsychiatry';
    if (ruleNum >= 576 && ruleNum <= 600) return 'wealth_and_horary';

    if (ruleNum >= 601 && ruleNum <= 625) return 'functional_lordship_matrices';
    if (ruleNum >= 626 && ruleNum <= 635) return 'kota_chakra_and_kalachakra';
    if (ruleNum >= 636 && ruleNum <= 650) return 'tithi_pravesha_and_timing';
    if (ruleNum >= 651 && ruleNum <= 675) return 'toxic_pathology_and_oncology';
    if (ruleNum >= 676 && ruleNum <= 700) return 'corporate_wealth_and_gnn';

    if (ruleNum >= 701 && ruleNum <= 727) return 'nakshatra_predictive_shaktis';
    if (ruleNum >= 728 && ruleNum <= 750) return 'ashtakavarga_matrices';
    if (ruleNum >= 751 && ruleNum <= 775) return 'surgical_karmic_pathology';
    if (ruleNum >= 776 && ruleNum <= 800) return 'financial_real_estate';

    if (ruleNum >= 801 && ruleNum <= 825) return 'shashtiamsha_d60_divisions';
    if (ruleNum >= 826 && ruleNum <= 850) return 'lal_kitab_mechanics';
    if (ruleNum >= 851 && ruleNum <= 875) return 'meena2_nadi_pathology';
    if (ruleNum >= 876 && ruleNum <= 900) return 'neurosymbolic_ai_diagnostics';

    if (ruleNum >= 901 && ruleNum <= 925) return 'tajika_yogas_and_sahams';
    if (ruleNum >= 926 && ruleNum <= 950) return 'mantra_shastra_remedies';
    if (ruleNum >= 951 && ruleNum <= 975) return 'biochemical_pathology';
    if (ruleNum >= 976 && ruleNum <= 1005) return 'swara_shastra_horary';

    if (ruleNum >= 1006 && ruleNum <= 1035) return 'academic_stream_d24';
    if (ruleNum >= 1036 && ruleNum <= 1055) return 'education_career_divergence';
    if (ruleNum >= 1056 && ruleNum <= 1075) return 'socioeconomic_tiering';
    if (ruleNum >= 1076 && ruleNum <= 1100) return 'modern_sector_ai_recommender';

    if (lowerTitle.includes('kota') || lowerText.includes('kota chakra')) return 'kota_chakra';
    if (lowerTitle.includes('lajjitadi') || lowerText.includes('lajjita')) return 'lajjitadi_avasthas';
    if (lowerTitle.includes('lal kitab') || lowerText.includes('lal kitab')) return 'lal_kitab';
    if (lowerTitle.includes('nabhasa') || lowerText.includes('nabhasa')) return 'nabhasa_yogas';

    return 'general_classical_research';
  }

  private extractKeywords(title: string, text: string): string[] {
    const raw = `${title} ${text}`.toLowerCase();
    const tokens = raw.match(/\b[a-z]{3,20}\b/g) || [];
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'which', 'rule', 'formula',
      'signs', 'sign', 'house', 'houses', 'planet', 'planets', 'lord', 'lords', 'when',
      'into', 'each', 'any', 'all', 'causes', 'will', 'are', 'delivers', 'where'
    ]);
    const freq = new Map<string, number>();
    for (const t of tokens) {
      if (!stopWords.has(t)) {
        freq.set(t, (freq.get(t) || 0) + 1);
      }
    }
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k]) => k);
  }

  private parseFile(sourceFile: string, content: string): void {
    const lines = content.split(/\r?\n/);
    let currentPart = 'General Master Rules';
    let currentPartNumber = 12;

    const pendingRules: { num: number; title: string; lines: string[]; part: string; partNum: number }[] = [];
    let curRule: { num: number; title: string; lines: string[]; part: string; partNum: number } | null = null;

    for (const line of lines) {
      // Check for Part headers: e.g. "## Part 12: Planetary Avasthas, Shadbala Equations & 108 Navamsa Archetypes (Rules 401–425)"
      const partMatch = line.match(/^##\s+Part\s+(\d+):\s*(.*)$/i);
      if (partMatch) {
        currentPartNumber = parseInt(partMatch[1], 10);
        currentPart = `Part ${partMatch[1]}: ${partMatch[2].trim()}`;
        continue;
      }

      // Check for rule line: "401. **Formula (Baladi Avasthas — Five Age States & Result Multipliers):**"
      const ruleMatch = line.match(/^(\d{3,4})\.\s+\*\*(.*?)\*\*(.*)$/);
      if (ruleMatch) {
        if (curRule) {
          pendingRules.push(curRule);
        }
        const num = parseInt(ruleMatch[1], 10);
        const title = ruleMatch[2].replace(/:$/, '').trim();
        const initialText = ruleMatch[3] ? [ruleMatch[3].trim()] : [];
        curRule = {
          num,
          title,
          lines: initialText,
          part: currentPart,
          partNum: currentPartNumber,
        };
      } else if (curRule) {
        if (line.startsWith('## ') || line.startsWith('---')) {
          // ignore or keep moving
        } else {
          curRule.lines.push(line);
        }
      }
    }
    if (curRule) {
      pendingRules.push(curRule);
    }

    for (const r of pendingRules) {
      const text = r.lines.join('\n').trim();
      const category = this.inferCategory(r.num, r.title, text);
      const keywords = this.extractKeywords(r.title, text);

      const record: MasterRuleRecord = {
        id: `RULE_${r.num}`,
        ruleNumber: r.num,
        title: r.title,
        sourceFile,
        part: r.part,
        partNumber: r.partNum,
        category,
        text,
        keywords,
      };

      this.rules.push(record);
      this.byNumber.set(record.ruleNumber, record);

      if (!this.byPart.has(record.partNumber)) {
        this.byPart.set(record.partNumber, []);
      }
      this.byPart.get(record.partNumber)!.push(record);

      if (!this.byCategory.has(record.category)) {
        this.byCategory.set(record.category, []);
      }
      this.byCategory.get(record.category)!.push(record);

      if (!this.byFile.has(record.sourceFile)) {
        this.byFile.set(record.sourceFile, []);
      }
      this.byFile.get(record.sourceFile)!.push(record);
    }
  }

  public getRuleByNumber(ruleNumber: number): MasterRuleRecord | undefined {
    this.ensureLoaded();
    return this.byNumber.get(ruleNumber);
  }

  public getRulesByPart(partNumber: number): MasterRuleRecord[] {
    this.ensureLoaded();
    return this.byPart.get(partNumber) || [];
  }

  public getRulesByCategory(category: string): MasterRuleRecord[] {
    this.ensureLoaded();
    return this.byCategory.get(category) || [];
  }

  public search(query: string, options: MasterSearchOptions = {}): MasterRuleRecord[] {
    return this.searchRules(query, options);
  }

  public searchRules(query: string, options: MasterSearchOptions = {}): MasterRuleRecord[] {
    this.ensureLoaded();
    const qLower = query.toLowerCase().trim();
    const tokens = qLower.split(/\s+/).filter(Boolean);
    const limit = options.limit || 15;

    let pool = this.rules;
    if (options.partNumber !== undefined) {
      pool = pool.filter((r) => r.partNumber === options.partNumber);
    }
    if (options.category) {
      pool = pool.filter((r) => r.category === options.category);
    }
    if (options.sourceFile) {
      pool = pool.filter((r) => r.sourceFile === options.sourceFile);
    }

    if (tokens.length === 0) {
      return pool.slice(0, limit);
    }

    const scored: { rule: MasterRuleRecord; score: number }[] = [];
    for (const rule of pool) {
      let score = 0;
      const titleLower = rule.title.toLowerCase();
      const textLower = rule.text.toLowerCase();

      // Check for exact rule number query e.g. "626"
      if (rule.ruleNumber.toString() === qLower || `rule ${rule.ruleNumber}` === qLower) {
        score += 100;
      }

      for (const tok of tokens) {
        if (titleLower.includes(tok)) score += 10;
        if (rule.keywords.includes(tok)) score += 6;
        if (textLower.includes(tok)) score += 2;
      }

      if (score > 0) {
        scored.push({ rule, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.rule);
  }

  public getAllRules(): MasterRuleRecord[] {
    this.ensureLoaded();
    return [...this.rules];
  }

  public getStats(): {
    totalRules: number;
    fileCounts: Record<string, number>;
    partCounts: Record<number, number>;
    categoryCounts: Record<string, number>;
  } {
    this.ensureLoaded();
    const fileCounts: Record<string, number> = {};
    for (const [f, rules] of this.byFile.entries()) {
      fileCounts[f] = rules.length;
    }
    const partCounts: Record<number, number> = {};
    for (const [p, rules] of this.byPart.entries()) {
      partCounts[p] = rules.length;
    }
    const categoryCounts: Record<string, number> = {};
    for (const [c, rules] of this.byCategory.entries()) {
      categoryCounts[c] = rules.length;
    }
    return {
      totalRules: this.rules.length,
      fileCounts,
      partCounts,
      categoryCounts,
    };
  }
}

export const globalMasterRules401to900Index = new MasterRules401to900Index();

export const globalMasterRulesIndex = globalMasterRules401to900Index;
