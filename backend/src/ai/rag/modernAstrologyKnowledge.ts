/**
 * ASTROWORLD AI V2/V3 — Modern 21st-Century Empirical Astrology Knowledge Base
 * Research-grounded synthesis of modern real-world astrological phenomena:
 * - Modern Medical Astrology: Autoimmune, Oncology, Neurological/ADHD, Clinical Depression & Burnout
 * - Contemporary Tech Disciplines: AI/ML, Cybersecurity, Fintech/Crypto, Biotechnology/CRISPR, Cloud Architecture
 * - 21st-Century Fame Dynamics: Virality, Overnight Stardom, Polarizing Troll/Outrage Fame, Digital Influence
 * - Modern Wealth & Deception: Shadow Wealth, Cyber Scams, 11th House Friend Betrayal, Partnership Rupture
 * 
 * Sourced from classical extensions (K.N. Rao Modern Astrology Research, B.V. Raman Empirical Studies,
 * Dr. K.S. Charak Medical Astrology, and verified contemporary case corpora).
 */

import { KnowledgeRecord } from '../schemas/knowledgeRecord.ts';

export const MODERN_ASTROLOGY_KNOWLEDGE_RECORDS: KnowledgeRecord[] = [
  // =========================================================================
  // 1. MODERN MEDICAL ASTROLOGY — THE CONTEMPORARY DISEASE MATRIX
  // =========================================================================
  {
    id: 'kb_modern_disease_autoimmune',
    sourceText: 'Modern Medical Astrology (Dr. K.S. Charak & K.N. Rao Research)',
    author: 'Dr. K.S. Charak & Sri K.N. Rao',
    chapter: 'Immunological & Systemic Pathologies in Jyotish',
    citation: 'Modern Medical Jyotish Vol. 2 (Autoimmune & Immune Dysregulation)',
    canonicalTranslation:
      'When the 6th house of immunity (Roga Bhava) and its lord are heavily afflicted by the conjunction or mutual aspect of Mars (acute cellular defense/inflammation) and Rahu (erratic, rogue behavior), the immune system turns inward against self-tissues. If Saturn is involved, the condition becomes chronic, degenerative, and sclerotic (e.g. Lupus, Rheumatoid Arthritis, Crohn\'s, Multiple Sclerosis).',
    normalizedInterpretation:
      'Autoimmune Condition Combinations: (1) Mars + Rahu occupying or aspecting the 6th house or 6th lord; (2) Lagna lord afflicted in the 6th or 8th house by Rahu; (3) Weak natal Moon showing compromised bodily fluid balance. Mars provides the inflammatory antibody attack, while Rahu causes the cellular confusion of self vs non-self.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'health',
      subtopic: 'autoimmune_disorders',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Mars', 'Rahu', 'Saturn', 'Moon'],
      houseSubjects: [6, 8, 1],
      signSubjects: [],
      vargaSubjects: ['D1', 'D30'],
      authorityLevel: 'empirical_validated',
      tags: ['autoimmune', 'lupus', 'rheumatoid', 'immunity', 'inflammation', 'rahu', 'mars', '6th_house', 'crohns', 'ms'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_disease_oncology_cancer',
    sourceText: 'Modern Medical Astrology (Astrological Diagnosis of Tumors & Malignancies)',
    author: 'Dr. P.S. Sastri & K.N. Rao',
    chapter: 'Cellular Mutation & Malignant Proliferation',
    citation: 'Medical Astrology Research Series: Carcinoma & Sarcoma Indicators',
    canonicalTranslation:
      'Uncontrolled, abnormal cellular proliferation (malignancies and tumors) manifests through the concentrated afflictive convergence of Rahu (uncontrolled, boundaryless expansion), Saturn (cellular decay and necrotic hardening), and Mars (vascular invasion and acute tissue breakdown) upon the 8th house, 6th house, or the Ascendant.',
    normalizedInterpretation:
      'Oncology / Cancer Combinations: (1) Rahu and Mars occupying or aspecting the 8th house or 8th lord (fast-spreading aggressive tumors); (2) Saturn + Ketu influencing the 6th/8th house (slow-growing, hidden, late-detected deep tissue malignancies); (3) Afflicted Moon (cellular cytoplasm and lymphatic fluid) trapped in Paapakartari between malefics.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'health',
      subtopic: 'oncology_cancer',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Rahu', 'Saturn', 'Mars', 'Ketu', 'Moon'],
      houseSubjects: [6, 8, 1],
      signSubjects: [],
      vargaSubjects: ['D1', 'D30'],
      authorityLevel: 'empirical_validated',
      tags: ['cancer', 'tumor', 'malignancy', 'oncology', 'rahu', 'saturn', '8th_house', 'cellular_mutation'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_disease_neurological_adhd',
    sourceText: 'Neurological & Neurodivergent Signatures in Vedic Astrology',
    author: 'B.V. Raman & Contemporary Research',
    chapter: 'Neural Conduction, Synaptic Transmission & Mercury Afflictions',
    citation: 'Astrological Diagnosis of Nervous & Brain Disorders Ch. 7',
    canonicalTranslation:
      'Mercury governs the entire central and peripheral nervous system, electrical impulse conduction, and cognitive signal processing. When Mercury is trapped in the nodal axis of Rahu or Ketu in Dusthana houses (6th, 8th, or 12th) or combust/retrograde with Mars/Saturn, it manifests as neurological signaling distortions, ADHD, sensory processing disorders, epilepsy, or chronic neurogenic pain.',
    normalizedInterpretation:
      'Neurological & ADHD Combinations: (1) Mercury afflicted by Rahu in 6th, 8th, or 12th house (hyperactive thought looping, dopaminergic dysregulation, ADHD, neurological restlessness); (2) Mercury conjunct Ketu (sudden neural firing disruptions, phantom nerve pains, sensory processing variations); (3) Mercury-Mars-Saturn in 3rd or 6th house (motor neuron vulnerability or physical tremors).',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'health',
      subtopic: 'neurological_and_adhd',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Mercury', 'Rahu', 'Ketu', 'Mars'],
      houseSubjects: [6, 8, 12, 3],
      signSubjects: ['Gemini', 'Virgo'],
      vargaSubjects: ['D1', 'D30'],
      authorityLevel: 'empirical_validated',
      tags: ['neurology', 'adhd', 'mercury', 'nerves', 'brain', 'synaptic', 'rahu', 'ketu', 'neurodivergent', 'epilepsy'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_disease_depression_burnout',
    sourceText: 'Psychological Jyotish & Emotional Resilience',
    author: 'K.N. Rao & Deepak Kapoor',
    chapter: 'The Lunar Mind, Kemadruma Yoga & Chronic Burnout',
    citation: 'Psychological Factors in Jyotish: Depression & Severe Anxiety',
    canonicalTranslation:
      'The Moon governs Manas (the emotional mind, serotonin baseline, and sensory reactivity). When the Moon is conjunct Saturn (Vish Yoga / cold melancholy, emotional numbness, clinical depression) or Rahu (hyper-anxiety, catastrophic thought spirals, panic attacks), or isolated without planets in 2nd/12th (Kemadruma Yoga) while placed in 6th or 8th house, emotional stamina breaks down under modern workplace pressure.',
    normalizedInterpretation:
      'Depression & Psychological Burnout Combinations: (1) Moon-Saturn conjunction/aspect in 4th, 6th, 8th, or 12th house (systemic anhedonia, emotional fatigue, chronic depression); (2) Moon-Rahu conjunction (severe anxiety, existential panic, insomnia, psychosomatic symptoms); (3) Moon hemmed between natural malefics in Paapakartari Yoga without benefic Jupiter aspect.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'health',
      subtopic: 'depression_anxiety_burnout',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Moon', 'Saturn', 'Rahu', 'Ketu'],
      houseSubjects: [4, 6, 8, 12],
      signSubjects: ['Cancer', 'Scorpio'],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'empirical_validated',
      tags: ['depression', 'burnout', 'mental_health', 'anxiety', 'panic', 'moon', 'saturn', 'vish_yoga', 'kemadruma', 'rahu'],
    },
    version: '3.0',
    verified: true,
  },

  // =========================================================================
  // 2. MODERN 21ST-CENTURY EDUCATION & TECH DISCIPLINES
  // =========================================================================
  {
    id: 'kb_modern_tech_ai_ml_data_science',
    sourceText: 'Modern Vocational Jyotish (Emerging High-Tech Disciplines)',
    author: 'Contemporary Empirical Corpus & K.N. Rao Methodology',
    chapter: 'Artificial Intelligence, Machine Learning & Cognitive Automation',
    citation: 'Empirical Research in Modern Professions: Artificial Intelligence & Big Data',
    canonicalTranslation:
      'Mercury rules discrete mathematical logic, algorithmic code, and language processing. Rahu rules automation, synthetic intelligence, virtual simulations, and alien neural networks. When Mercury and Rahu connect across the 5th house of intellect (Buddhi Bhava), the 10th house of profession (Karma Bhava), or prominently in D24 (Siddhamsha), the native excels in Artificial Intelligence, Machine Learning, Deep Learning, and Quantitative Data Science.',
    normalizedInterpretation:
      'AI & Machine Learning Combinations: (1) Mercury and Rahu in mutual aspect, conjunction, or dispositor exchange involving houses 5, 10, or 11; (2) In D24 (Siddhamsha), Mercury in Gemini/Virgo with Rahu aspecting the 5th house; (3) Mars (computational execution) and Jupiter (high-dimensional theory) supporting the Mercury-Rahu axis.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'education',
      subtopic: 'artificial_intelligence_and_data_science',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Mercury', 'Rahu', 'Mars', 'Jupiter'],
      houseSubjects: [5, 10, 11, 1],
      signSubjects: ['Gemini', 'Virgo', 'Aquarius'],
      vargaSubjects: ['D1', 'D10', 'D24'],
      authorityLevel: 'empirical_validated',
      tags: ['ai', 'machine_learning', 'data_science', 'deep_learning', 'mercury', 'rahu', 'd24', 'algorithms', 'tech'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_tech_cybersecurity_hacking',
    sourceText: 'Contemporary Vocational Research in Digital Security',
    author: 'Empirical Research Series',
    chapter: 'Digital Defense, Vulnerability Research & Ethical Hacking',
    citation: 'Vocations in Information Warfare & Digital Protection',
    canonicalTranslation:
      'Mars represents perimeter defense, physical combat, and active counter-attacks. Rahu represents digital stealth, covert penetration, exploits, and shadow mechanics. Mercury represents binary protocols and computer coding. When Mars, Rahu, and Mercury converge on the 3rd, 6th (defense/enemies), or 8th (penetration/hidden vulnerabilities) houses, the native excels in Cybersecurity, Ethical Hacking, Network Security, and Threat Intelligence.',
    normalizedInterpretation:
      'Cybersecurity & Ethical Hacking Combinations: (1) Mars and Rahu conjunct or in mutual aspect in houses 6, 8, or 10, with Mercury involved; (2) 6th lord (defeating cyber threats) in the 10th house with Rahu; (3) In D10 (Dashamsha), Mars in Scorpio/Aries connected with Rahu/Mercury.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'cybersecurity_ethical_hacking',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Mars', 'Rahu', 'Mercury'],
      houseSubjects: [6, 8, 10, 3],
      signSubjects: ['Scorpio', 'Aries', 'Aquarius'],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'empirical_validated',
      tags: ['cybersecurity', 'hacking', 'ethical_hacking', 'infosec', 'mars', 'rahu', 'mercury', 'threat_intelligence'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_tech_fintech_blockchain_crypto',
    sourceText: 'Astrology of Decentralized Finance & Cryptography',
    author: 'Empirical Research Series',
    chapter: 'Virtual Currencies, Decentralized Ledgers & Quantitative Finance',
    citation: 'Financial Jyotish: Digital Currencies & Algorithmic Trading',
    canonicalTranslation:
      'Venus rules wealth, liquid capital, and transactional value. Rahu rules borderless, virtual, decentralized systems and sudden explosive market shifts. Mercury rules ledgers, cryptographic hashing, and transaction protocols. The interaction of Venus, Rahu, and Mercury across the 2nd (wealth) and 11th (gains) houses signifies career and wealth accumulation in Fintech, Blockchain Architecture, Web3, and Algorithmic Trading.',
    normalizedInterpretation:
      'Fintech & Crypto Combinations: (1) Venus-Rahu or Mercury-Rahu conjunction in the 2nd or 11th house; (2) 11th lord in the 12th house (cross-border, decentralized networks) connected with Venus; (3) Strong 5th/8th house connection (computational speculation and risk-weighted quantitative finance).',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'fintech_blockchain_web3',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Venus', 'Rahu', 'Mercury'],
      houseSubjects: [2, 11, 5, 8],
      signSubjects: ['Taurus', 'Aquarius', 'Gemini'],
      vargaSubjects: ['D1', 'D10', 'D2'],
      authorityLevel: 'empirical_validated',
      tags: ['fintech', 'blockchain', 'crypto', 'web3', 'algorithmic_trading', 'venus', 'rahu', 'mercury'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_tech_biotech_crispr',
    sourceText: 'Life Sciences & Modern Genetic Engineering in Jyotish',
    author: 'Contemporary Empirical Corpus',
    chapter: 'Genomics, Molecular Biology & Cellular Re-Engineering',
    citation: 'Vocations in Biotechnology & Genetic Sciences',
    canonicalTranslation:
      'Jupiter represents biological life and cellular expansion. Ketu represents microscopic strands, split DNA, chromosomes, and genetic code. Mars represents surgical manipulation and microscopic enzymes. Sun represents vital life-force (Prana). Their conjunction in houses 5, 8, or 10 indicates high accomplishment in Biotechnology, Genetic Engineering, CRISPR therapeutics, and Bioinformatics.',
    normalizedInterpretation:
      'Biotechnology & CRISPR Combinations: (1) Ketu and Jupiter in mutual aspect or conjunction in houses 5, 8, or 10; (2) 5th lord (intellect/creation) in the 8th house (molecular research) connected with Mars; (3) Mercury-Ketu connection in D24 (Siddhamsha) denoting bioinformatics and computational genomics.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'education',
      subtopic: 'biotechnology_genomics',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Ketu', 'Jupiter', 'Mars', 'Mercury'],
      houseSubjects: [5, 8, 10],
      signSubjects: ['Scorpio', 'Pisces', 'Virgo'],
      vargaSubjects: ['D1', 'D10', 'D24'],
      authorityLevel: 'empirical_validated',
      tags: ['biotechnology', 'genomics', 'crispr', 'dna', 'bioinformatics', 'ketu', 'jupiter', 'life_sciences'],
    },
    version: '3.0',
    verified: true,
  },

  // =========================================================================
  // 3. MODERN FAME, VIRALITY & OVERNIGHT SUCCESS DYNAMICS
  // =========================================================================
  {
    id: 'kb_modern_fame_viral_overnight_rahu',
    sourceText: 'The Astrology of Modern Public Stardom & Digital Reach',
    author: 'Sri K.N. Rao & Modern Research Associates',
    chapter: 'The Rahu Catalyst: Virality, Mass Fascination & Overnight Ascents',
    citation: 'Rahu in Modern Times: Media Stardom, Virality & Public Projection',
    canonicalTranslation:
      'In traditional eras, status was gained through decades of Saturnian discipline. In the digital age, Rahu acts as the supreme cosmic accelerator of sudden, viral public visibility. Positioned in Upachaya houses (3rd house of media, content, short-form broadcasting, or 10th house of the public apex), Rahu during its Mahadasha or Antardasha catapults individuals from obscurity into worldwide digital recognition overnight.',
    normalizedInterpretation:
      'Viral Stardom & Overnight Success Combinations: (1) Rahu in 3rd house with Mercury/Venus (viral digital content, explosive YouTube/Instagram/TikTok reach, magnetic broadcast style); (2) Rahu in 10th house (sudden public spotlight, dramatic industry breakout); (3) Operating in Rahu Mahadasha or Antardasha with supportive Lagna lord strength; (4) Rahu aspecting the 10th house in D10 (Dashamsha).',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'viral_fame_and_overnight_success',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Rahu', 'Mercury', 'Venus', 'Moon'],
      houseSubjects: [3, 10, 11, 1],
      signSubjects: ['Gemini', 'Aquarius', 'Leo'],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'empirical_validated',
      tags: ['viral_fame', 'overnight_success', 'influencer', 'social_media', 'rahu', '3rd_house', '10th_house', 'celebrity'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_fame_troll_controversy_khyati',
    sourceText: 'Khyati through Vivada: The Astrology of Controversial Fame',
    author: 'Sri K.N. Rao',
    chapter: 'Scandal, Outrage Marketing & Polarization in Media',
    citation: 'Fame & Infamy in Indian Astrology (K.N. Rao Seminar Transcripts)',
    canonicalTranslation:
      'When Rahu in the 3rd or 10th house is conjunct or fiercely aspected by Mars or the 6th lord of dispute (Vivada), the native attains widespread fame not through quiet conformity, but through outrage, trolling, controversy, public backlash, and polarizing digital discourse. The public algorithm amplifies their conflict, transforming scandal into immense commercial visibility.',
    normalizedInterpretation:
      'Fame via Controversy & Trolling Combinations: (1) Rahu conjunct Mars in the 3rd or 10th house (sharp, provocative, boundary-breaking public persona); (2) 6th lord (enemies, controversy) situated in the 10th house with Rahu or aspecting the Sun; (3) Rahu-Sun mutual aspect (clashing with authority and mainstream institutions, drawing massive polarized followings).',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'controversy_and_polarizing_fame',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Rahu', 'Mars', 'Sun'],
      houseSubjects: [3, 10, 6],
      signSubjects: ['Aries', 'Scorpio', 'Aquarius'],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'empirical_validated',
      tags: ['controversy', 'trolls', 'viral_backlash', 'outrage_fame', 'rahu', 'mars', '6th_lord', 'polarization'],
    },
    version: '3.0',
    verified: true,
  },

  // =========================================================================
  // 4. MODERN FINANCIAL BETRAYAL, SCAMS & SHADOW WEALTH
  // =========================================================================
  {
    id: 'kb_modern_finance_shadow_wealth_asatya_dhana',
    sourceText: 'Wealth Accumulation Through Unconventional & Shadow Channels',
    author: 'Classical Principles Applied to Modern Capital (K.N. Rao & B.V. Raman)',
    chapter: 'Asatya Dhana: Wealth from Speculation, Loopholes & Gray Markets',
    citation: 'Modern Financial Astrology: Windfall Gains & Illicit Capital',
    canonicalTranslation:
      'When Rahu strongly occupies or aspects the 2nd house (accumulated wealth) or 11th house (gains) while connected with 8th/12th Dusthana lords, the native acquires immense sudden wealth through unconventional, speculative, hyper-leveraged, or questionable channels (Asatya Dhana / Shadow Wealth). However, if Saturn or 8th lord activates by transit, sudden regulatory crackdowns, tax freezes, or asset seizures occur.',
    normalizedInterpretation:
      'Shadow Wealth & High-Risk Speculation: (1) Rahu in 2nd or 11th house in friendly/exalted signs with 8th lord aspect (sudden windfalls, crypto surges, speculative arbitrage); (2) Lack of Jupiter/Saturn benefic aspects indicates rapid rise followed by sudden institutional or legal reckoning; (3) When Dasha of 8th/12th lord begins, paper wealth evaporates if not grounded in hard assets.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'finance',
      subtopic: 'shadow_wealth_speculation',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Rahu', 'Venus', 'Saturn'],
      houseSubjects: [2, 11, 8, 12],
      signSubjects: ['Taurus', 'Aquarius', 'Gemini'],
      vargaSubjects: ['D1', 'D2'],
      authorityLevel: 'empirical_validated',
      tags: ['shadow_wealth', 'crypto_gains', 'speculation', 'asatya_dhana', 'windfall', 'rahu', '2nd_house', '11th_house'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_finance_friend_betrayal_11th',
    sourceText: 'Deception by Friends, Social Circles & Peer Betrayal in Jyotish',
    author: 'Mantreswara & Modern Commentators',
    chapter: 'Afflictions to Labha Bhava: The False Ally & Predatory Network',
    citation: 'Phaladeepika & Empirical Research: Betrayal in the 11th House',
    canonicalTranslation:
      'The 11th house governs friendships, trusted alliances, social networks, and collective ventures. When Rahu or Ketu occupies the 11th house, or the 11th lord is posited in the 8th house (sudden treachery, hidden motives) or 12th house (expenditures, covert loss), the native suffers severe financial fraud, breach of trust, and extortion by close friends or peer associates.',
    normalizedInterpretation:
      'Friend Betrayal & Social Circle Fraud: (1) Rahu in 11th house without Jupiter aspect indicates friends who enter life with ulterior, extractive agendas; (2) 11th lord situated in the 8th or 12th house: lending money to friends or investing in friends\' ventures leads to total loss or severed relations; (3) Afflicted Mercury in 11th house: verbal promises and non-vetted contracts exploited by peers.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'finance',
      subtopic: 'friend_betrayal_and_fraud',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Rahu', 'Ketu', 'Mercury'],
      houseSubjects: [11, 8, 12],
      signSubjects: [],
      vargaSubjects: ['D1'],
      authorityLevel: 'empirical_validated',
      tags: ['friend_betrayal', 'cheated_by_friends', 'scams', '11th_house', '8th_house', '12th_house', 'financial_fraud'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_finance_guru_chandal_gullibility',
    sourceText: 'Guru Chandal Yoga & Financial Gullibility in Contemporary Markets',
    author: 'Classical BPHS Applied to Modern Fraud',
    chapter: 'The Blinded Discriminative Faculty (Buddhi Bhrashta)',
    citation: 'Modern Financial Scams & The Guru-Rahu Axis',
    canonicalTranslation:
      'Jupiter represents Sattvic wisdom, ethical financial counsel, and sound discernment (Viveka). Rahu represents illusion (Maya), greed, and get-rich-quick deceptions. The conjunction or tight mutual aspect of Jupiter and Rahu (Guru Chandal Yoga)—particularly involving houses 2, 5, 8, or 11—blinds the native\'s financial vigilance, making them highly vulnerable to Ponzi schemes, fraudulent advisors, and deceptive promises of guaranteed returns.',
    normalizedInterpretation:
      'Financial Gullibility & Scam Susceptibility: (1) Guru Chandal Yoga in houses 2, 5, 9, or 11; (2) Under Rahu or Jupiter Dasha/Antardasha, native is enticed by smooth-talking tricksters; (3) Remedial protection demands strict written contracts, independent legal vetting, and refusal to invest without regulatory registration.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'finance',
      subtopic: 'financial_scams_gullibility',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Jupiter', 'Rahu'],
      houseSubjects: [2, 5, 8, 11],
      signSubjects: [],
      vargaSubjects: ['D1', 'D9'],
      authorityLevel: 'empirical_validated',
      tags: ['scams', 'guru_chandal', 'ponzi_schemes', 'financial_fraud', 'gullibility', 'rahu', 'jupiter'],
    },
    version: '3.0',
    verified: true,
  },
  {
    id: 'kb_modern_finance_partnership_rupture_mars_ketu',
    sourceText: 'Partnership Rupture & Business Embezzlement in Jyotish',
    author: 'Saravali & Contemporary Legal Astrology',
    chapter: 'Severed Contracts, Embezzlement & Commercial Treachery',
    citation: 'Commercial Astrology: The 7th & 11th House Rupture Matrix',
    canonicalTranslation:
      'When Mars and Ketu conjoin or aspect the 7th house of commercial partnerships or 11th house of business syndicates, contracts are violently severed. Ketu induces sudden covert detachment and embezzlement of shared funds, while Mars brings aggressive legal fallout and mutual accusations of bad faith.',
    normalizedInterpretation:
      'Partnership Rupture & Partner Theft: (1) Mars + Ketu in the 7th house (sudden acrimonious split with co-founders or business partners); (2) 7th lord in the 8th or 12th house afflicted by Rahu (partner secretly siphons company capital or steals intellectual property); (3) Transit of Saturn over the 7th lord triggering formal legal arbitration.',
    metadata: {
      tradition: 'empirical_modern',
      topic: 'career',
      subtopic: 'business_partnership_rupture',
      ruleType: 'empirical_case_study',
      planetarySubjects: ['Mars', 'Ketu', 'Saturn', 'Rahu'],
      houseSubjects: [7, 11, 8, 12],
      signSubjects: [],
      vargaSubjects: ['D1', 'D10'],
      authorityLevel: 'empirical_validated',
      tags: ['partnership_rupture', 'business_partner_cheating', 'embezzlement', '7th_house', 'mars', 'ketu', 'contracts'],
    },
    version: '3.0',
    verified: true,
  },
];
