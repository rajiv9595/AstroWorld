/**
 * ASTROWORLD — Astrology Research Corpus Loader & High-Performance In-Memory Index
 * 
 * Ingests, parses, and provides instant indexing and fuzzy search across all 1,309 atomic
 * research rules (AST-00001 to AST-01309) spanning Groups 01–17 from astrology_research_corpus.md.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AstAtomicRule {
  id: string; // e.g. "AST-00001"
  ruleNumber: number; // e.g. 1
  title: string; // e.g. "Store raw birth input unchanged"
  group: string; // e.g. "01 — Calculation, astronomy, data quality and research controls"
  groupNumber: number; // e.g. 1
  type: string; // e.g. "FORMULA / QA", "LORD-IN-HOUSE", "DASHA-ACTIVATION"
  status: string; // e.g. "COMPUTATIONAL_INVARIANT", "TRADITIONAL_HYPOTHESIS"
  tags: string[]; // e.g. ["calculation", "provenance"]
  methodRule: string; // Text description
  researchPointers: string[]; // e.g. ["S008", "S010"]
}

export interface CorpusSearchOptions {
  groupNumber?: number;
  status?: string;
  tag?: string;
  type?: string;
  limit?: number;
}

export class AstrologyResearchCorpusIndex {
  private rules: AstAtomicRule[] = [];
  private byId = new Map<string, AstAtomicRule>();
  private byGroup = new Map<number, AstAtomicRule[]>();
  private byStatus = new Map<string, AstAtomicRule[]>();
  private byTag = new Map<string, AstAtomicRule[]>();
  private byType = new Map<string, AstAtomicRule[]>();
  private isLoaded = false;

  constructor() {
    this.ensureLoaded();
  }

  private resolveCorpusPath(): string {
    const candidates = [
      path.resolve(__dirname, '../../../datasets/Research/astrology_research_corpus.md'),
      path.resolve(process.cwd(), 'backend/datasets/Research/astrology_research_corpus.md'),
      path.resolve(process.cwd(), 'datasets/Research/astrology_research_corpus.md'),
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
      console.warn(`[AstrologyResearchCorpusIndex] Corpus file not found at: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    this.parseContent(content);
    this.isLoaded = true;
  }

  private parseContent(content: string): void {
    const lines = content.split(/\r?\n/);
    let currentRule: Partial<AstAtomicRule> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match record header: e.g. "### AST-00001 — Store raw birth input unchanged"
      const headerMatch = line.match(/^###\s+(AST-(\d{5}))\s+[—\-]\s+(.*)$/);
      if (headerMatch) {
        if (currentRule && currentRule.id) {
          this.commitRule(currentRule as AstAtomicRule);
        }
        currentRule = {
          id: headerMatch[1],
          ruleNumber: parseInt(headerMatch[2], 10),
          title: headerMatch[3].trim(),
          tags: [],
          researchPointers: [],
          methodRule: '',
        };
        continue;
      }

      if (!currentRule) continue;

      // Group: "- **Group:** 01 — Calculation, astronomy..."
      const groupMatch = line.match(/^- \*\*Group:\*\*\s*((\d{2})\s*[-—]\s*(.*))$/);
      if (groupMatch) {
        currentRule.group = groupMatch[1].trim();
        currentRule.groupNumber = parseInt(groupMatch[2], 10);
        continue;
      }

      // Type: "- **Type:** FORMULA / QA"
      const typeMatch = line.match(/^- \*\*Type:\*\*\s*(.*)$/);
      if (typeMatch) {
        currentRule.type = typeMatch[1].trim();
        continue;
      }

      // Status: "- **Status:** `COMPUTATIONAL_INVARIANT`"
      const statusMatch = line.match(/^- \*\*Status:\*\*\s*`?([A-Z_]+)`?/);
      if (statusMatch) {
        currentRule.status = statusMatch[1].trim();
        continue;
      }

      // Tags: "- **Tags:** calculation, provenance"
      const tagsMatch = line.match(/^- \*\*Tags:\*\*\s*(.*)$/);
      if (tagsMatch) {
        currentRule.tags = tagsMatch[1].split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
        continue;
      }

      // Method / rule: "- **Method / rule:** ..."
      const methodMatch = line.match(/^- \*\*Method \/ rule:\*\*\s*(.*)$/);
      if (methodMatch) {
        currentRule.methodRule = methodMatch[1].trim();
        continue;
      }

      // Research pointers: "- **Research pointers:** [S008], [S010]"
      const pointersMatch = line.match(/^- \*\*Research pointers:\*\*\s*(.*)$/);
      if (pointersMatch) {
        const matches = pointersMatch[1].match(/\[(S\d{3})\]/g);
        if (matches) {
          currentRule.researchPointers = matches.map((m) => m.replace(/[\[\]]/g, ''));
        }
        continue;
      }
    }

    if (currentRule && currentRule.id) {
      this.commitRule(currentRule as AstAtomicRule);
    }
  }

  private commitRule(rule: AstAtomicRule): void {
    if (!rule.id) return;
    this.rules.push(rule);
    this.byId.set(rule.id, rule);

    if (rule.groupNumber) {
      const gList = this.byGroup.get(rule.groupNumber) || [];
      gList.push(rule);
      this.byGroup.set(rule.groupNumber, gList);
    }

    if (rule.status) {
      const sList = this.byStatus.get(rule.status) || [];
      sList.push(rule);
      this.byStatus.set(rule.status, sList);
    }

    if (rule.type) {
      const tList = this.byType.get(rule.type) || [];
      tList.push(rule);
      this.byType.set(rule.type, tList);
    }

    if (rule.tags) {
      for (const t of rule.tags) {
        const tagList = this.byTag.get(t) || [];
        tagList.push(rule);
        this.byTag.set(t, tagList);
      }
    }
  }

  public getById(id: string): AstAtomicRule | undefined {
    this.ensureLoaded();
    return this.byId.get(id.toUpperCase().trim());
  }

  public getByGroup(groupNumber: number): AstAtomicRule[] {
    this.ensureLoaded();
    return this.byGroup.get(groupNumber) || [];
  }

  public getByStatus(status: string): AstAtomicRule[] {
    this.ensureLoaded();
    return this.byStatus.get(status.toUpperCase().trim()) || [];
  }

  public getByTag(tag: string): AstAtomicRule[] {
    this.ensureLoaded();
    return this.byTag.get(tag.toLowerCase().trim()) || [];
  }

  public getAllRules(): AstAtomicRule[] {
    this.ensureLoaded();
    return this.rules;
  }

  public search(query: string, options: CorpusSearchOptions = {}): AstAtomicRule[] {
    this.ensureLoaded();
    const q = query.toLowerCase().trim();
    const limit = options.limit ?? 20;

    let pool = this.rules;

    if (options.groupNumber !== undefined) {
      pool = this.byGroup.get(options.groupNumber) || [];
    } else if (options.status) {
      pool = this.byStatus.get(options.status.toUpperCase()) || [];
    } else if (options.tag) {
      pool = this.byTag.get(options.tag.toLowerCase()) || [];
    }

    if (!q) {
      return pool.slice(0, limit);
    }

    const matches: { rule: AstAtomicRule; score: number }[] = [];
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);

    for (const rule of pool) {
      let score = 0;
      if (rule.id.toLowerCase() === q) score += 100;
      if (rule.title.toLowerCase().includes(q)) score += 40;
      if (rule.methodRule.toLowerCase().includes(q)) score += 20;

      // Token-level matching
      for (const tok of tokens) {
        if (rule.title.toLowerCase().includes(tok)) score += 15;
        if (rule.tags.some((t) => t.includes(tok))) score += 12;
        if (rule.methodRule.toLowerCase().includes(tok)) score += 6;
        if (rule.group.toLowerCase().includes(tok)) score += 3;
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
    const groupCounts: Record<number, number> = {};
    for (const [g, list] of this.byGroup.entries()) {
      groupCounts[g] = list.length;
    }
    const statusCounts: Record<string, number> = {};
    for (const [s, list] of this.byStatus.entries()) {
      statusCounts[s] = list.length;
    }
    return {
      totalRules: this.rules.length,
      groupCounts,
      statusCounts,
    };
  }
}

export const globalAstrologyCorpusIndex = new AstrologyResearchCorpusIndex();
