/**
 * ASTROWORLD — Classical Shastric Knowledge Graph Types
 */

export type ClassicalShastraSource =
  | 'BPHS'
  | 'Phaladeepika'
  | 'Saravali'
  | 'Jataka Parijata'
  | 'Bhavartha Ratnakara'
  | 'Uttara Kalamrita'
  | 'Prasna Marga'
  | 'Brihat Jataka'
  | 'Bhrigu Nadi'
  | 'Jaimini Sutras'
  | 'Tajika Neelakanthi'
  | 'Charaka Samhita';

export interface ShastricRuleNode {
  id: string;
  sourceText: ClassicalShastraSource;
  edition: string;
  chapter: number;
  verse: string;
  sanskritVerse?: string;
  domain:
    | 'career'
    | 'wealth'
    | 'marriage'
    | 'health'
    | 'education'
    | 'litigation'
    | 'children'
    | 'spirituality'
    | 'foreign_travel'
    | 'general';
  targetGraha?: string;
  targetHouse?: number;
  targetLagna?: string;
  conditionDescription: string;
  classicalDictum: string;
  modernManifestation: string;
  evaluator: (chart: any) => boolean;
}

export interface ShastricEvidenceItem {
  ruleId: string;
  sourceCitation: string;
  sanskritVerse?: string;
  classicalDictum: string;
  modernManifestation: string;
  astronomicalTrigger: string;
  domain: string;
}

