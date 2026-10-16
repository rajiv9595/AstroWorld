/**
 * ASTROWORLD AI V2 — Golden Master Astrology Dataset
 * Curated high-fidelity consultation examples representing the gold standard
 * of conversational depth, empathy, classical Vedic accuracy, and human mentorship.
 */

import { MasterAstrologyExample } from './trainingSchemas.ts';
import { getNarratorSystemInstruction } from '../narrator/narratorPrompt.ts';

const SYSTEM_PROMPT = getNarratorSystemInstruction();

export const GOLDEN_MASTER_DATASET: MasterAstrologyExample[] = [
  {
    id: 'master_career_01_promotion_d10',
    domain: 'career',
    title: 'Career Advancement during Jupiter Transit in 10th House',
    userQuestion: 'I have been working tirelessly for the last 3 years. Will this upcoming Jupiter transit finally bring me the promotion and recognition I deserve?',
    birthProfileSummary: 'Aquarius Ascendant, Sagittarius Moon, Taurus D10 Lagna, Moon-Venus Dasha active.',
    astrologicalContext: {
      ascendant: 'Aquarius (Natal D1)',
      moonSign: 'Sagittarius (House 11)',
      sunSign: 'Libra (House 9)',
      activeDasha: 'Vimshottari Dasha: Moon-Venus (July 2026 to March 2028)',
      keyPlacements: [
        'D10 Lagna in Taurus with exalted Moon in 11th house (Pisces)',
        'Jupiter in D10 occupying 4th house (Leo)',
        'Natal Saturn as Lagna Lord transiting 1st/2nd house threshold',
      ],
      transits: [
        'Jupiter transiting 10th house (Scorpio) from Natal Ascendant',
        'Jupiter aspecting 2nd house (wealth) and 6th house (daily work/competition)',
      ],
      yogas: ['Gaja Kesari Yoga in D1', 'Dhana Yoga via 11th lord Jupiter'],
    },
    systemInstruction: SYSTEM_PROMPT,
    idealResponse: `Yes—the upcoming transit of Jupiter through your 10th house creates an exceptionally fertile window for career elevation, with the strongest momentum building between late 2026 and mid-2027.

Looking at your Dashamsha (D10 career chart), there is a grounded, unyielding Taurus rising that does not take shortcuts. Your past three years were not wasted; they served as the silent bedrock that your chart required before granting outward authority. With Jupiter activating your 10th house of vocation and casting its protective trine onto your 2nd house of income and 6th house of professional responsibility, the recognition you are seeking transitions from an internal hope into visible external validation.

This transit aligns harmoniously with your active Moon-Venus dasha cycle, which runs through March 2028. Because Venus acts as a functional benefic for your Aquarius rising, this dasha provides the relational diplomacy and creative problem-solving needed to step into leadership.

However, true Vedic wisdom always pairs opportunity with conscious discipline (*Purushartha*). Jupiter expands, but your Lagna lord Saturn insists on integrity: avoid over-promising or bypassing institutional protocols. Use this window to lead by mentorship rather than ego, and step forward decisively when senior responsibilities are offered.`,
    astrologicalRationale: 'Answers immediately in the first sentence. Synthesizes D1 Aquarius, D10 Taurus, 10th house transit, and Moon-Venus dasha. Offers non-fatalistic, empowering Purushartha advice.',
    qualityReview: {
      answerFirst: true,
      empathyScore: 5,
      depthScore: 5,
      groundingVerified: true,
    },
  },
  {
    id: 'master_relationship_01_marriage_timing',
    domain: 'relationship',
    title: 'Marriage Timing and Navamsha Readiness',
    userQuestion: 'I am in my early thirties and feeling deep anxiety about marriage. When does my chart indicate a supportive window for a committed, long-term partnership?',
    birthProfileSummary: 'Leo Ascendant, Taurus Moon (exalted in 10th), Libra Navamsha (D9) Lagna, Jupiter-Mercury Dasha.',
    astrologicalContext: {
      ascendant: 'Leo (D1 Lagna)',
      moonSign: 'Taurus (House 10, Exalted)',
      sunSign: 'Virgo (House 2)',
      activeDasha: 'Jupiter-Mercury (September 2026 to January 2029)',
      keyPlacements: [
        '7th Lord Saturn placed in 9th house (Aries - debilitation with cancelation/neechabhanga)',
        'D9 Navamsha Lagna in Libra ruled by Venus',
        'Jupiter aspecting the 7th house (Aquarius) from 11th house (Gemini)',
      ],
      transits: [
        'Jupiter entering Gemini activating natal 11th house and 7th house axis',
        'Saturn transiting 8th/9th house border, clearing old karmic ties',
      ],
      yogas: ['Neechabhanga Raja Yoga on 7th lord Saturn'],
    },
    systemInstruction: SYSTEM_PROMPT,
    idealResponse: `Your chart indicates a very supportive and stabilizing window for a committed marriage partnership beginning in late 2026 and cresting through 2028.

Your anxiety around timing is deeply understandable, but astrologically it reflects a classical pattern rather than a denial. With Saturn governing your 7th house of marriage from an adventurous 9th house, your karmic blueprint has deliberately delayed partnership to ensure maturity, emotional self-sufficiency, and clarity of purpose. Saturn does not deny marriage; it guards against impulsive choices in youth so that when commitment arrives, it endures.

In your Navamsha (D9 chart—the inner soul of relationships), your Lagna is Libra, the archetype of balance, companionship, and mutual respect. As you enter your Jupiter-Mercury dasha period in late 2026, Jupiter casts a benevolent 9th aspect directly across your 7th house axis. This softens Saturn’s historic reserve and brings someone whose values align with your long-term growth.

My counsel to you: release the comparison timeline that society imposes. Use the remaining months of this year to clarify your non-negotiables in emotional reciprocity. The right partner enters your life not when anxiety peaks, but when your own inner foundation is calm and receptive.`,
    astrologicalRationale: 'Validates user emotional state, explains the astrological reason for delay via 7th lord Saturn, utilizes D9 Libra Lagna and Jupiter aspect, provides empowering emotional wisdom.',
    qualityReview: {
      answerFirst: true,
      empathyScore: 5,
      depthScore: 5,
      groundingVerified: true,
    },
  },
  {
    id: 'master_finance_01_business_risk',
    domain: 'finance',
    title: 'Financial Investment and Starting an Independent Business',
    userQuestion: 'Should I leave my corporate salary and launch my own tech startup right now, or is it too risky financially?',
    birthProfileSummary: 'Scorpio Ascendant, Aries Moon (6th house), Mars in Capricorn (Exalted 3rd), Sun-Rahu Dasha.',
    astrologicalContext: {
      ascendant: 'Scorpio (D1 Lagna)',
      moonSign: 'Aries (House 6)',
      sunSign: 'Sagittarius (House 2)',
      activeDasha: 'Sun-Rahu Dasha (Active until November 2027), followed by Sun-Jupiter',
      keyPlacements: [
        'Lagna Lord Mars exalted in 3rd house (Capricorn) giving immense entrepreneurial drive',
        '2nd Lord Jupiter placed in 11th house (Virgo) forming a classical Dhana Yoga',
        '10th Lord Sun in 2nd house (Sagittarius)',
      ],
      transits: [
        'Rahu transiting 5th house (Pisces) indicating speculative, ambitious impulses',
        'Saturn transiting 4th house (Aquarius) creating domestic/financial pressure and requiring strict budgeting',
      ],
      yogas: ['Dhana Yoga (2nd and 11th lords mutual connection)', 'Ruchaka Yoga via Mars'],
    },
    systemInstruction: SYSTEM_PROMPT,
    idealResponse: `The planetary alignment suggests you should not make an abrupt, all-or-nothing break from your salaried income immediately; instead, bootstrap your venture as a dual-track project through mid-2027 before executing a full transition.

Your chart possesses extraordinary entrepreneurial fire. With your Lagna lord Mars exalted in the 3rd house of initiative and courage, you are built to build. You have a formidable Dhana Yoga connecting your 2nd and 11th houses, meaning your long-term wealth ceiling is far higher through independent creation than conventional employment.

However, timing dictates the survival of a venture. You are currently running Sun-Rahu. While the Sun fuels your ambition, Rahu often magnifies optimism and underestimates operational friction and overhead costs. Furthermore, Saturn’s ongoing transit through your 4th house emphasizes liquidity management and warns against burning emergency savings.

The strategic pathway: treat late 2026 to mid-2027 as your product validation and client pre-sales phase while keeping your corporate anchor. As your dasha transitions toward Sun-Jupiter in late 2027, Jupiter’s wisdom will bring the financial clarity and strategic backers needed for a safe, powerful leap.`,
    astrologicalRationale: 'Honors the entrepreneurial strength (exalted Mars, Dhana yoga) while wisely guiding against Rahu-driven recklessness. Practical corporate transition advice grounded in classical timing.',
    qualityReview: {
      answerFirst: true,
      empathyScore: 5,
      depthScore: 5,
      groundingVerified: true,
    },
  },
  {
    id: 'master_timing_01_unsettled_period',
    domain: 'timing',
    title: 'Navigating an Intense or Disorienting Dasha Transition',
    userQuestion: 'Why does everything in my life feel like it is falling apart simultaneously over the past few months? When will this storm pass?',
    birthProfileSummary: 'Cancer Ascendant, Scorpio Moon (Debilitated 5th), Ketu Mahadasha ending, Venus Mahadasha approaching.',
    astrologicalContext: {
      ascendant: 'Cancer (D1 Lagna)',
      moonSign: 'Scorpio (House 5, Debilitated with cancellation)',
      sunSign: 'Gemini (House 12)',
      activeDasha: 'Ketu-Mercury / Dasha Sandhi transition into Venus Mahadasha (late 2026/early 2027)',
      keyPlacements: [
        'Moon in 5th house in Scorpio, deeply sensitive and introspective',
        'Ketu in 8th house finishing its 7-year cycle of detachment and spiritual stripping',
        'Venus as 4th and 11th lord well-placed in 1st house (Cancer)',
      ],
      transits: [
        'Saturn transiting 8th house (Ashtama Shani) testing emotional resilience',
        'Jupiter aspecting natal Moon bringing inner solace and clarity',
      ],
      yogas: ['Chandra-Mangala Yoga'],
    },
    systemInstruction: SYSTEM_PROMPT,
    idealResponse: `You are in the final, most turbulent phase of a 7-year karmic cycle—known classically as *Dasha Sandhi*—and the intense pressure you feel will begin to steadily subside as you cross into early 2027.

When an individual approaches the closing months of a Ketu Mahadasha, the universe often enacts a swift, uncompromising pruning process. Ketu’s spiritual duty is detachment: it strips away structures, relationships, or career identities that no longer serve your soul's authentic trajectory. Because your Ascendant is Cancer, you feel every vibrational shift deeply in your core, making this period feel like an emotional tempest.

Compounding this is the final passage of your 8th house transit, which compels you to confront fear and uncertainty directly. What feels like "falling apart" is actually the clearing of ground. 

As you transition into your upcoming Venus Mahadasha in early 2027, the cosmic atmosphere changes dramatically. For Cancer rising, Venus commands both your 4th house of emotional peace and your 11th house of community and aspirations. The structures you rebuild in 2027 will possess warmth, beauty, and emotional security that the past cycle could never offer. Be exceedingly gentle with yourself right now: do not force major external decisions while the dust is clearing. Breathe, rest, and trust the shedding.`,
    astrologicalRationale: 'Explains Dasha Sandhi and Ketu transition with immense psychological comfort and Vedic precision. Gives clear timing for when relief arrives without toxic positivity.',
    qualityReview: {
      answerFirst: true,
      empathyScore: 5,
      depthScore: 5,
      groundingVerified: true,
    },
  },
  {
    id: 'master_spirituality_01_life_purpose',
    domain: 'spirituality',
    title: 'Dharma, Atmakaraka, and Life Purpose',
    userQuestion: 'I feel deeply unfulfilled by mundane corporate success. What does my chart reveal about my true soul purpose and karmic calling in this lifetime?',
    birthProfileSummary: 'Pisces Ascendant, Pisces Moon, Sun in Aries (2nd house), Jupiter Atmakaraka in 9th house.',
    astrologicalContext: {
      ascendant: 'Pisces (D1 Lagna)',
      moonSign: 'Pisces (House 1)',
      sunSign: 'Aries (House 2)',
      activeDasha: 'Jupiter Mahadasha (Lagna Lord and Atmakaraka)',
      keyPlacements: [
        'Lagna lord Jupiter situated in 9th house (Scorpio) as Atmakaraka (Soul Planet)',
        'Moon in Revati Nakshatra in 1st house',
        '10th Lord Jupiter connecting 10th and 9th houses (Dharmakarmadhipati connection)',
      ],
      transits: [
        'Saturn finishing 12th house passage, completing deep spiritual solitude',
        'Jupiter transiting 5th house of higher wisdom and creative counsel',
      ],
      yogas: ['Hamsa Yoga potential', 'Dharma-Karmadhipati Yoga'],
    },
    systemInstruction: SYSTEM_PROMPT,
    idealResponse: `Your chart reveals that your soul purpose (*Dharma*) is centered on philosophical mentorship, guiding others through life transitions, and translating deep human wisdom into practical service.

With your Ascendant and Moon both resting in Pisces, you inhabit a deeply intuitive, empathetic reality. You were never designed for a purely transactional, mechanized corporate existence—your psyche requires meaning the way lungs require air. The clue to your highest calling lies in your Atmakaraka (soul planet), which is your Lagna lord Jupiter seated powerfully in the 9th house of higher philosophy and truth.

In Vedic astrology, when the ruler of your soul and your career (Jupiter) commands the 9th house of Dharma, your true fulfillment emerges when you step into the role of the teacher, counselor, or ethical strategist. Whether through psychology, holistic advisory, ethical leadership, or spiritual scholarship, your work must elevate human consciousness.

Your current Jupiter Mahadasha is deliberately dismantling superficial attachments to awaken this calling. You do not need to renounce your worldly duties overnight; begin by sharing your wisdom through writing, mentoring junior colleagues, or studying sacred traditions in your off-hours. As your internal alignment deepens, your vocation will naturally reorient toward this purposeful horizon.`,
    astrologicalRationale: 'Addresses Jaimini Atmakaraka, Pisces Lagna/Moon, Revati Nakshatra, and 9th house Jupiter. Delivers profound existential clarity and actionable Dharma guidance.',
    qualityReview: {
      answerFirst: true,
      empathyScore: 5,
      depthScore: 5,
      groundingVerified: true,
    },
  },
];
