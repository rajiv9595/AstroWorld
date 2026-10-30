/**
 * ASTROWORLD — Jyotisha & Prashna Research Corpus Loader (4.md)
 * 
 * Ingests, parses, and provides in-memory indexing and fast tokenized search across all 1,412
 * foundational research and method records (R0001 to R1412) spanning Sections 01–28 from 4.md.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface JyotishaRuleRecord {
  id: string; // e.g. "R0001"
  ruleNumber: number; // e.g. 1
  section: string; // e.g. "01 | Data, astronomy, and corpus integrity"
  sectionNumber: number; // e.g. 1
  status: string; // e.g. "COMPUTATIONAL", "Traditional hypothesis"
  traditionScope: string; // e.g. "AI architecture", "Data integrity"
  text: string; // The core rule and interpretation statement
  sources: string[]; // e.g. ["S01", "S02"]
}

export interface JyotishaSearchOptions {
  sectionNumber?: number;
  status?: string;
  traditionScope?: string;
  limit?: number;
}

export class JyotishaResearchCorpusIndex {
  private rules: JyotishaRuleRecord[] = [];
  private byId = new Map<string, JyotishaRuleRecord>();
  private bySection = new Map<number, JyotishaRuleRecord[]>();
  private byStatus = new Map<string, JyotishaRuleRecord[]>();
  private isLoaded = false;

  constructor() {
    this.ensureLoaded();
  }

  private resolveCorpusPath(): string {
    const candidates = [
      path.resolve(__dirname, '../../../datasets/Research/4.md'),
      path.resolve(process.cwd(), 'backend/datasets/Research/4.md'),
      path.resolve(process.cwd(), 'datasets/Research/4.md'),
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

    const filePath = this.resolveCorpusPath();
    if (!fs.existsSync(filePath)) {
      console.warn(`[JyotishaResearchCorpusIndex] Corpus file not found at: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    this.parseContent(content);
    this.isLoaded = true;
  }

  private parseContent(content: string): void {
    const lines = content.split(/\r?\n/);
    let currentSection = '01 | Data, astronomy, and corpus integrity';
    let currentSectionNumber = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track section headers: "### 01 | Data, astronomy, and corpus integrity"
      const secMatch = line.match(/^###\s+(\d{2})\s*\|\s*(.*)$/);
      if (secMatch) {
        currentSectionNumber = parseInt(secMatch[1], 10);
        currentSection = `${secMatch[1]} | ${secMatch[2].trim()}`;
        continue;
      }

      // Match rule records: e.g.
      // - **R0001** — **Status:** `COMPUTATIONAL`; **Tradition/scope:** AI architecture. Treat the chart as... **Sources:** [S01], [S02].
      const ruleMatch = line.match(/^- \*\*(R\d{4})\*\*\s*[—\-]\s*\*\*Status:\*\*\s*`?([^;`]+)`?;\s*\*\*Tradition\/scope:\*\*\s*([^.]+)\.\s*(.*?)(?:\s*\*\*Sources:\*\*\s*(.*))?$/);
      if (ruleMatch) {
        const id = ruleMatch[1].trim();
        const ruleNumber = parseInt(id.replace('R', ''), 10);
        const status = ruleMatch[2].trim();
        const traditionScope = ruleMatch[3].trim();
        const text = ruleMatch[4].trim();
        const rawSources = ruleMatch[5] || '';
        const sourceMatches = rawSources.match(/\[(S\d{2,3})\]/g);
        const sources = sourceMatches ? sourceMatches.map((s) => s.replace(/[\[\]]/g, '')) : [];

        const record: JyotishaRuleRecord = {
          id,
          ruleNumber,
          section: currentSection,
          sectionNumber: currentSectionNumber,
          status,
          traditionScope,
          text,
          sources,
        };

        this.rules.push(record);
        this.byId.set(id, record);

        const secList = this.bySection.get(currentSectionNumber) || [];
        secList.push(record);
        this.bySection.set(currentSectionNumber, secList);

        const statusKey = status.toUpperCase();
        const statList = this.byStatus.get(statusKey) || [];
        statList.push(record);
        this.byStatus.set(statusKey, statList);
      }
    }
  }

  public getById(id: string): JyotishaRuleRecord | undefined {
    this.ensureLoaded();
    return this.byId.get(id.toUpperCase().trim());
  }

  public getBySection(sectionNumber: number): JyotishaRuleRecord[] {
    this.ensureLoaded();
    return this.bySection.get(sectionNumber) || [];
  }

  public getByStatus(status: string): JyotishaRuleRecord[] {
    this.ensureLoaded();
    return this.byStatus.get(status.toUpperCase().trim()) || [];
  }

  public getAllRules(): JyotishaRuleRecord[] {
    this.ensureLoaded();
    return this.rules;
  }

  public search(query: string, options: JyotishaSearchOptions = {}): JyotishaRuleRecord[] {
    this.ensureLoaded();
    const q = query.toLowerCase().trim();
    const limit = options.limit ?? 20;

    let pool = this.rules;

    if (options.sectionNumber !== undefined) {
      pool = this.bySection.get(options.sectionNumber) || [];
    } else if (options.status) {
      pool = this.byStatus.get(options.status.toUpperCase()) || [];
    }

    if (!q) {
      return pool.slice(0, limit);
    }

    const tokens = q.split(/\s+/).filter((t) => t.length > 1);
    const matches: { rule: JyotishaRuleRecord; score: number }[] = [];

    for (const rule of pool) {
      let score = 0;
      const lowerText = rule.text.toLowerCase();
      const lowerScope = rule.traditionScope.toLowerCase();
      const lowerSection = rule.section.toLowerCase();

      if (rule.id.toLowerCase() === q) score += 100;
      if (lowerText.includes(q)) score += 40;
      if (lowerScope.includes(q)) score += 20;

      for (const tok of tokens) {
        if (lowerText.includes(tok)) score += 12;
        if (lowerScope.includes(tok)) score += 15;
        if (lowerSection.includes(tok)) score += 5;
      }

      if (score > 0) {
        matches.push({ rule, score });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, limit).map((m) => m.rule);
  }

  public getStats() {
    this.ensureLoaded();
    const sectionCounts: Record<number, number> = {};
    for (const [sec, list] of this.bySection.entries()) {
      sectionCounts[sec] = list.length;
    }
    const statusCounts: Record<string, number> = {};
    for (const [st, list] of this.byStatus.entries()) {
      statusCounts[st] = list.length;
    }
    return {
      totalRules: this.rules.length,
      sectionCounts,
      statusCounts,
    };
  }
}

export const globalJyotishaCorpusIndex = new JyotishaResearchCorpusIndex();

