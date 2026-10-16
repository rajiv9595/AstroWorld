/**
 * ASTROWORLD AI V2 — Consultation Markdown Renderer
 * Parses and renders rich astrological consultation markdown:
 * - Structured section headers (### 🎯 Direct Verdict, etc.)
 * - Formatted responsive HTML tables (| Period | Window | Activation |)
 * - Styled bullet lists with inline bold/italic
 * - Interactive suggested follow-up chips
 */

import React from 'react';
import { Compass, Sparkles, ChevronRight } from 'lucide-react';

interface ConsultationMarkdownRendererProps {
  content: string;
  onSelectFollowUp?: (question: string) => void;
}

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string };

/**
 * Parses inline formatting like **bold**, *italic*, and `code`.
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex to match **bold**, *italic*, `code`, and quoted strings
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-amber-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900 font-mono text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Extracts suggested questions from text.
 * Matches:
 * - *Suggested follow-up:* "..."
 * - Suggested follow-up: "..."
 * - Follow-up questions in quotes under the guidance section
 */
export function extractSuggestedQuestions(content: string): string[] {
  const questions: string[] = [];
  const lines = content.split('\n');

  let inSuggestedSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.toLowerCase().includes('suggested follow-up') ||
      trimmed.toLowerCase().includes('suggested inquiries') ||
      trimmed.toLowerCase().includes('suggested questions')
    ) {
      inSuggestedSection = true;
    }

    // Direct match for: - *Suggested follow-up:* "..." or - "..."
    const quotedMatch = trimmed.match(/["“]([^"”]+)["”]/);
    if (quotedMatch && (inSuggestedSection || trimmed.toLowerCase().includes('follow-up'))) {
      const q = quotedMatch[1].trim();
      if (q.endsWith('?') && q.length > 10 && !questions.includes(q)) {
        questions.push(q);
      }
    } else if (inSuggestedSection && (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed))) {
      const cleaned = trimmed.replace(/^[-*]|\d+\./, '').replace(/[*_]/g, '').replace(/suggested follow-up:?/i, '').trim();
      if (cleaned.endsWith('?') && cleaned.length > 10 && !questions.includes(cleaned)) {
        questions.push(cleaned);
      }
    }
  }

  return questions.slice(0, 4);
}

/**
 * Parses markdown text into structured blocks (headings, tables, lists, paragraphs).
 */
function parseMarkdownBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Heading check: ### Heading
    if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'heading',
        level: 3,
        text: trimmed.slice(4).trim(),
      });
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'heading',
        level: 2,
        text: trimmed.slice(3).trim(),
      });
      i++;
      continue;
    }

    // 2. Table check: line starts with '|' and contains '|'
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // First line is header
        const rawHeaders = tableLines[0].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        // Second line is separator (e.g. |---|---|)
        const rowLines = tableLines.slice(2);
        const rows = rowLines.map(r =>
          r.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        );

        blocks.push({
          type: 'table',
          headers: rawHeaders,
          rows,
        });
        continue;
      }
    }

    // 3. Bullet list check
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        const itemText = lines[i].trim().slice(2).trim();
        const isFollowUpItem = /suggested follow[- ]up/i.test(itemText);
        if (!isFollowUpItem) {
          items.push(itemText);
        }
        i++;
      }
      if (items.length > 0) {
        blocks.push({
          type: 'list',
          items,
        });
      }
      continue;
    }

    // 4. Regular paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('### ') &&
      !lines[i].trim().startsWith('## ') &&
      !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ')
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: paraLines.join(' '),
      });
    }
  }

  return blocks;
}

export const ConsultationMarkdownRenderer: React.FC<ConsultationMarkdownRendererProps> = ({
  content,
  onSelectFollowUp,
}) => {
  const blocks = parseMarkdownBlocks(content);
  const suggestedQuestions = extractSuggestedQuestions(content);

  return (
    <div className="space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return (
              <h3
                key={idx}
                className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2 mt-5 mb-2 pb-1.5 border-b border-amber-900/15"
              >
                <span>{block.text}</span>
              </h3>
            );

          case 'table':
            return (
              <div
                key={idx}
                className="overflow-x-auto my-3 rounded-xl border border-amber-900/15 bg-white/70 shadow-xs"
              >
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-amber-100/70 text-amber-950 font-semibold border-b border-amber-900/15">
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10 text-slate-800">
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-amber-50/40'}
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2.5 leading-normal">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'list':
            return (
              <ul key={idx} className="space-y-2 my-2 pl-1">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2 text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-2 shrink-0" />
                    <span className="leading-relaxed flex-1">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case 'paragraph':
            return (
              <p key={idx} className="leading-relaxed">
                {renderInline(block.text)}
              </p>
            );

          default:
            return null;
        }
      })}

      {/* Interactive Suggested Follow-Up Chips */}
      {suggestedQuestions.length > 0 && onSelectFollowUp && (
        <div className="mt-5 pt-3 border-t border-amber-900/15">
          <div className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-700" />
            <span>Suggested Inquiries (Tap to ask):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, qIdx) => (
              <button
                key={qIdx}
                type="button"
                onClick={() => onSelectFollowUp(q)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-amber-100/80 border border-amber-900/20 hover:border-amber-700/40 text-amber-950 text-xs font-medium transition-all shadow-xs hover:shadow-sm cursor-pointer group text-left"
              >
                <span>{q}</span>
                <ChevronRight
                  size={12}
                  className="text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
