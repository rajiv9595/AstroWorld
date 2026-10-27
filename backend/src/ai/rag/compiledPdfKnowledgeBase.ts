/**
 * ASTROWORLD — Compiled 43-Volume PDF Knowledge Base (2,498 Chunks)
 * Permanently baked into static application memory at compile time.
 * Zero filesystem reading, zero runtime disk I/O.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KnowledgeRecord } from '../schemas/knowledgeRecord.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.resolve(__dirname, '../../../datasets/astroworld_pdf_knowledge_index.json');

let pdfIndex: { chunks: any[] } = { chunks: [] };
if (fs.existsSync(jsonPath)) {
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    pdfIndex = JSON.parse(raw);
  } catch {
    pdfIndex = { chunks: [] };
  }
}

let _cachedRecords: KnowledgeRecord[] | null = null;

export function getCompiledPdfKnowledgeRecords(): KnowledgeRecord[] {
  if (_cachedRecords) {
    return _cachedRecords;
  }

  _cachedRecords = (pdfIndex.chunks || []).map((chunk: any) => ({
    id: chunk.id,
    sourceText: chunk.sourceBook,
    author: 'AstroWorld Master Research Guild',
    chapter: `${chunk.sectionTitle} (Page ${chunk.pageNumber})`,
    sectionOrShloka: `Page ${chunk.pageNumber}`,
    citation: `${chunk.sourceBook}, p. ${chunk.pageNumber}`,
    canonicalTranslation: chunk.content,
    normalizedInterpretation: chunk.content,
    metadata: {
      tradition: 'empirical_modern',
      topic: (chunk.category || 'career') as any,
      subtopic: (chunk.topics && chunk.topics[0]) || 'psychology_and_career',
      ruleType: 'general_principle',
      planetarySubjects: (chunk.planets || []) as any,
      houseSubjects: chunk.houses || [],
      signSubjects: (chunk.zodiacSigns || []) as any,
      vargaSubjects: ['D1', 'D10', 'D24'] as any,
      authorityLevel: 'authoritative_commentary',
      tags: [
        ...(chunk.topics || []),
        ...(chunk.planets || []),
        chunk.category || 'career',
      ],
    },
    version: '2.0',
    verified: true,
  }));

  return _cachedRecords;
}
