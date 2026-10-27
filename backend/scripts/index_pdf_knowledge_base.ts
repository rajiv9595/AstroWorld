/**
 * ASTROWORLD — PDF Knowledge Base Indexing Engine
 * Indexes all 43 extracted rulebooks (2,498 pages, 830,000+ words) into
 * high-density semantic knowledge chunks with multi-dimensional metadata.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MARKDOWN_DIR = path.resolve(__dirname, '../datasets/extracted_pdf_markdown');
const OUTPUT_INDEX_PATH = path.resolve(__dirname, '../datasets/astroworld_pdf_knowledge_index.json');

export interface IndexedRuleChunk {
  id: string;
  sourceBook: string;
  pageNumber: number;
  sectionTitle: string;
  category: string;
  topics: string[];
  planets: string[];
  houses: number[];
  zodiacSigns: string[];
  content: string;
  wordCount: number;
}

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const ZODIAC = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function detectPlanets(text: string): string[] {
  return PLANETS.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(text));
}

function detectZodiac(text: string): string[] {
  return ZODIAC.filter(z => new RegExp(`\\b${z}\\b`, 'i').test(text));
}

function detectHouses(text: string): number[] {
  const houses: number[] = [];
  const regex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:house|bhava)\b/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const h = parseInt(match[1], 10);
    if (h >= 1 && h <= 12 && !houses.includes(h)) {
      houses.push(h);
    }
  }
  return houses.sort((a, b) => a - b);
}

function detectCategoryAndTopics(bookName: string, text: string): { category: string; topics: string[] } {
  const lowerBook = bookName.toLowerCase();
  const lowerText = text.toLowerCase();
  const topics: string[] = [];

  let category = 'career_and_psychology';

  if (lowerBook.includes('communicator') || lowerBook.includes('communication')) {
    category = 'communication_style';
    if (lowerBook.includes('visual')) topics.push('Visual Communicator');
    if (lowerBook.includes('auditory')) topics.push('Auditory Communicator');
    if (lowerBook.includes('kinesthetic')) topics.push('Kinesthetic Communicator');
    if (lowerBook.includes('digital')) topics.push('Auditory Digital Communicator');
  } else if (lowerBook.includes('temperament')) {
    category = 'temperament_and_constitution';
    if (lowerBook.includes('choleric')) topics.push('Choleric (Fire/Pitta)');
    if (lowerBook.includes('melancholy')) topics.push('Melancholic (Earth/Vata)');
    if (lowerBook.includes('sanguine')) topics.push('Sanguine (Air/Vata)');
    if (lowerBook.includes('phlegmatic')) topics.push('Phlegmatic (Water/Kapha)');
  } else if (lowerBook.includes('core_values') || lowerBook.includes('core values')) {
    category = 'core_values_hierarchy';
    if (lowerBook.includes('internal')) topics.push('Internal Locus of Evaluation');
    if (lowerBook.includes('external')) topics.push('External Locus of Evaluation');
    if (lowerBook.includes('status')) topics.push('Status & Recognition');
    if (lowerBook.includes('creation')) topics.push('Creation & Innovation');
    if (lowerBook.includes('responsibility')) topics.push('Duty & Responsibility');
  } else if (lowerBook.includes('thinking_styles') || lowerBook.includes('level_of_thinking')) {
    category = 'cognitive_and_thinking_styles';
    if (lowerBook.includes('local_global')) topics.push('Local vs Global Thinking');
    if (lowerBook.includes('form')) topics.push('Form & Aesthetics Thinking');
    if (lowerBook.includes('function')) topics.push('Function & Practicality Thinking');
    if (lowerBook.includes('scope')) topics.push('Scope of Vision');
  } else if (lowerBook.includes('emotional_intelligence') || lowerBook.includes('empathy') || lowerBook.includes('emotions') || lowerBook.includes('self_awareness') || lowerBook.includes('social_skills')) {
    category = 'emotional_intelligence';
    if (lowerBook.includes('empathy')) topics.push('Empathy (Venus-Ketu)');
    if (lowerBook.includes('self_awareness')) topics.push('Self-Awareness (Jupiter)');
    if (lowerBook.includes('managing_emotions')) topics.push('Emotional Regulation (Moon-Saturn)');
    if (lowerBook.includes('social_skills')) topics.push('Social Acumen (Mercury-Jupiter)');
  } else if (lowerBook.includes('career_dominance') || lowerBook.includes('work_preferences') || lowerBook.includes('motivation')) {
    category = 'career_dominance_and_motivation';
    if (lowerBook.includes('towards_away')) topics.push('Towards vs Away-From Motivation');
    if (lowerBook.includes('proactive_reactive')) topics.push('Proactive vs Reactive Initiation');
    if (lowerBook.includes('matching_mismatching')) topics.push('Matching vs Mismatching Mindset');
    if (lowerBook.includes('options_procedures')) topics.push('Options vs Procedures Execution');
  } else if (lowerBook.includes('planetary_characteristics') || lowerBook.includes('zodiac_sign')) {
    category = 'classical_foundations';
    topics.push('Graha & Rashi Directives');
  }

  return { category, topics };
}

export function indexAllMarkdownFiles(): void {
  const files = fs.readdirSync(MARKDOWN_DIR).filter(f => f.endsWith('.md'));
  console.log(`================================================================================`);
  console.log(`INDEXING ${files.length} EXTRACTED PDF MARKDOWN FILES`);
  console.log(`Input Directory: ${MARKDOWN_DIR}`);
  console.log(`Output Index:    ${OUTPUT_INDEX_PATH}`);
  console.log(`================================================================================`);

  const allChunks: IndexedRuleChunk[] = [];
  let totalWordsIndexed = 0;

  for (const file of files) {
    const filePath = path.join(MARKDOWN_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const bookTitle = file.replace('.md', '').replace(/_/g, ' ');

    // Split by page markers: "## Page X"
    const pageBlocks = content.split(/^## Page\s+(\d+)/m);
    // pageBlocks[0] is header, then pairs of [pageNum, pageText]
    
    let currentPageNum = 1;
    for (let i = 1; i < pageBlocks.length; i += 2) {
      currentPageNum = parseInt(pageBlocks[i], 10);
      const pageText = (pageBlocks[i + 1] || '').trim();
      if (!pageText || pageText.length < 50) continue;

      // Extract section title if present
      const firstLine = pageText.split('\n')[0].replace(/[#*_-]/g, '').trim();
      const sectionTitle = firstLine.length > 5 && firstLine.length < 100 ? firstLine : `Page ${currentPageNum} Insights`;

      const words = pageText.split(/\s+/).length;
      totalWordsIndexed += words;

      const { category, topics } = detectCategoryAndTopics(file, pageText);
      const planets = detectPlanets(pageText);
      const houses = detectHouses(pageText);
      const zodiacSigns = detectZodiac(pageText);

      allChunks.push({
        id: `chunk_${file.replace('.md', '').toLowerCase()}_p${currentPageNum}`,
        sourceBook: bookTitle,
        pageNumber: currentPageNum,
        sectionTitle,
        category,
        topics,
        planets,
        houses,
        zodiacSigns,
        content: pageText,
        wordCount: words,
      });
    }
  }

  // Write index
  fs.writeFileSync(OUTPUT_INDEX_PATH, JSON.stringify({
    indexedAt: new Date().toISOString(),
    totalBooks: files.length,
    totalChunks: allChunks.length,
    totalWords: totalWordsIndexed,
    chunks: allChunks,
  }, null, 2), 'utf-8');

  console.log(`================================================================================`);
  console.log(`INDEXING COMPLETED!`);
  console.log(`  • Books Processed:   ${files.length}`);
  console.log(`  • Chunks Generated:  ${allChunks.length.toLocaleString()}`);
  console.log(`  • Words Indexed:     ${totalWordsIndexed.toLocaleString()}`);
  console.log(`  • Index File Size:   ${(fs.statSync(OUTPUT_INDEX_PATH).size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`================================================================================`);
}

if (process.argv[1] && process.argv[1].endsWith('index_pdf_knowledge_base.ts')) {
  indexAllMarkdownFiles();
}
