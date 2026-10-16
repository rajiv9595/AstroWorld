/**
 * ASTROWORLD AI V2 — Fine-Tuning Dataset Collector & Exporter
 * Harvests verified consultation exchanges, transforms them into standardized
 * AI training formats (OpenAI, Gemini, Llama-3), and audits training sample quality.
 */

import {
  OpenAITrainingSample,
  GeminiTrainingSample,
  Llama3InstructSample,
  MasterAstrologyExample,
} from './trainingSchemas.ts';
import { GOLDEN_MASTER_DATASET } from './goldenSeedDataset.ts';

export class FineTuningDatasetCollector {
  private examples: MasterAstrologyExample[];

  constructor(initialExamples?: MasterAstrologyExample[]) {
    this.examples = initialExamples ? [...initialExamples] : [...GOLDEN_MASTER_DATASET];
  }

  public addExample(example: MasterAstrologyExample): void {
    const existingIndex = this.examples.findIndex(e => e.id === example.id);
    if (existingIndex >= 0) {
      this.examples[existingIndex] = example;
    } else {
      this.examples.push(example);
    }
  }

  public getExamples(): MasterAstrologyExample[] {
    return [...this.examples];
  }

  public getCount(): number {
    return this.examples.length;
  }

  /**
   * Format examples for OpenAI Chat Completion fine-tuning JSONL format.
   * Specification: {"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}
   */
  public toOpenAIFormat(): OpenAITrainingSample[] {
    return this.examples.map(ex => {
      const userContextBlock = this.formatUserPromptWithContext(ex);
      return {
        messages: [
          { role: 'system', content: ex.systemInstruction },
          { role: 'user', content: userContextBlock },
          { role: 'assistant', content: ex.idealResponse },
        ],
      };
    });
  }

  /**
   * Format examples for Google Gemini Tuning JSONL format.
   * Specification: {"systemInstruction": {"parts": [{"text": ...}]}, "contents": [{"role": "user", "parts": [...]}, {"role": "model", "parts": [...]}]}
   */
  public toGeminiFormat(): GeminiTrainingSample[] {
    return this.examples.map(ex => {
      const userContextBlock = this.formatUserPromptWithContext(ex);
      return {
        systemInstruction: {
          parts: [{ text: ex.systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userContextBlock }],
          },
          {
            role: 'model',
            parts: [{ text: ex.idealResponse }],
          },
        ],
      };
    });
  }

  /**
   * Format examples for Llama-3 / Alpaca Instruct fine-tuning format.
   * Specification: {"instruction": ..., "input": ..., "output": ..., "systemPrompt": ...}
   */
  public toLlama3Format(): Llama3InstructSample[] {
    return this.examples.map(ex => {
      const contextSummary = [
        `Ascendant: ${ex.astrologicalContext.ascendant}`,
        `Moon Sign: ${ex.astrologicalContext.moonSign}`,
        `Sun Sign: ${ex.astrologicalContext.sunSign}`,
        `Running Dasha: ${ex.astrologicalContext.activeDasha}`,
        `Key Placements: ${ex.astrologicalContext.keyPlacements.join('; ')}`,
        `Transits: ${ex.astrologicalContext.transits.join('; ')}`,
        ex.astrologicalContext.yogas?.length ? `Yogas: ${ex.astrologicalContext.yogas.join('; ')}` : '',
      ].filter(Boolean).join('\n');

      return {
        systemPrompt: ex.systemInstruction,
        instruction: 'You are AstroWorld Master Astrologer. Analyze the user question and astrological evidence to provide an empathetic, deep, and verified Vedic astrology consultation.',
        input: `USER QUESTION:\n"${ex.userQuestion}"\n\nVERIFIED CHART CONTEXT:\n${contextSummary}`,
        output: ex.idealResponse,
      };
    });
  }

  /**
   * Audit all samples to verify they meet high quality and safety standards.
   */
  public auditDataset(): {
    totalSamples: number;
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const forbiddenFatalism = ['guaranteed', '100% certain', 'definitely happen on', 'must happen'];

    for (const ex of this.examples) {
      const words = ex.idealResponse.trim().split(/\s+/).length;
      if (words < 60) {
        issues.push(`Sample ${ex.id} is too short (${words} words). Minimum is 60 words for deep consultation.`);
      }

      for (const forbidden of forbiddenFatalism) {
        if (ex.idealResponse.toLowerCase().includes(forbidden)) {
          issues.push(`Sample ${ex.id} contains fatalistic phrase: "${forbidden}"`);
        }
      }

      if (!ex.userQuestion || ex.userQuestion.trim().length === 0) {
        issues.push(`Sample ${ex.id} has empty user question.`);
      }
    }

    return {
      totalSamples: this.examples.length,
      passed: issues.length === 0,
      issues,
    };
  }

  private formatUserPromptWithContext(ex: MasterAstrologyExample): string {
    const contextLines = [
      `USER QUESTION: "${ex.userQuestion}"`,
      '',
      'VERIFIED ASTROLOGICAL CONTEXT:',
      `- Ascendant: ${ex.astrologicalContext.ascendant}`,
      `- Moon Sign: ${ex.astrologicalContext.moonSign}`,
      `- Sun Sign: ${ex.astrologicalContext.sunSign}`,
      `- Active Vimshottari Period: ${ex.astrologicalContext.activeDasha}`,
      ...ex.astrologicalContext.keyPlacements.map(p => `- Key Placement: ${p}`),
      ...ex.astrologicalContext.transits.map(t => `- Active Transit: ${t}`),
    ];

    if (ex.astrologicalContext.yogas?.length) {
      contextLines.push(...ex.astrologicalContext.yogas.map(y => `- Classical Yoga: ${y}`));
    }

    contextLines.push('');
    contextLines.push('MASTER NARRATION INSTRUCTIONS:');
    contextLines.push('Deliver a master-level, articulate, empathetic consultation. Answer directly in the first sentence, explain the karmic why and psychological nuances, preserve timing, and empower conscious action (Purushartha).');

    return contextLines.join('\n');
  }
}
