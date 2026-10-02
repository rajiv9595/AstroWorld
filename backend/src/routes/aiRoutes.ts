import { Router, Request, Response } from 'express';
import { getAi } from '../services/geminiService.ts';
import { supabase } from '../services/supabaseService.ts';
import { AIInterpretationContext } from '../../../shared/index.ts';

export const aiRouter = Router();

/**
 * Builds a comprehensive, high-fidelity canonical astrological dossier
 * from the precomputed astronomical and astrological engine facts.
 */
function buildAstrologicalDossier(context: AIInterpretationContext): {
  dossierText: string;
  summaryHUD: Record<string, any>;
} {
  const { ascendant, planets, vargas, dasha, yogas, jaimini, transits, strength, ashtakavarga, birthProfile } = context;

  // 1. D1 Rashi Positions & Dignities
  const d1List = (planets || []).map((p: any) => {
    const retrogradeFlag = p.isRetrograde ? ' [RETROGRADE]' : '';
    const combustionFlag = p.isCombust ? ' [COMBUST]' : '';
    return `- ${p.name}: ${p.sign} ${p.formattedDegree} in House ${p.houseNumber} (${p.dignity || 'NEUTRAL'}, Nakshatra: ${p.nakshatra} Pada ${p.pada})${retrogradeFlag}${combustionFlag}`;
  }).join('\n');

  // 2. D9 Navamsha Positions & Vargottama
  const d9List = (vargas?.['D9']?.planets || []).map((p: any) => {
    const d1Planet = planets?.find((dp: any) => dp.name === p.planet);
    const isVargottama = d1Planet && d1Planet.sign === p.vargaSign ? ' [VARGOTTAMA - High Soul Strength]' : '';
    return `- ${p.planet}: ${p.vargaSign} in House ${p.houseNumber} (${p.dignity || 'NEUTRAL'})${isVargottama}`;
  }).join('\n');

  // 3. D10 Dashamsha (Career & Karma)
  const d10List = (vargas?.['D10']?.planets || []).map((p: any) => {
    return `- ${p.planet}: ${p.vargaSign} in House ${p.houseNumber} (${p.dignity || 'NEUTRAL'})`;
  }).join('\n');

  // 4. Active Vimshottari Dasha Window
  const currentHierarchy = dasha?.currentHierarchy;
  const dashaInfo = currentHierarchy
    ? `Active Hierarchy: ${currentHierarchy.mahadasha?.lord} Mahadasha -> ${currentHierarchy.antardasha?.subLord} Antardasha -> ${currentHierarchy.pratyantardasha?.pratyantarLord} Pratyantardasha
Current Antardasha Span: ${currentHierarchy.antardasha?.startDateIso?.slice(0, 10)} to ${currentHierarchy.antardasha?.endDateIso?.slice(0, 10)}`
    : 'Dasha calculations established from Moon Nakshatra';

  // 5. Yogas & Doshas
  const activeYogas = (yogas || [])
    .filter((y: any) => y.present)
    .map((y: any) => `* ${y.name} [Ref: ${y.bphsReference || 'BPHS'}]: ${y.effects}`)
    .join('\n');

  // 6. Jaimini Chara Karakas
  const atmakaraka = jaimini?.atmakaraka || 'Unknown';
  const amatyakaraka = jaimini?.charaKarakas?.find((k: any) => k.role === 'AmK')?.planet || 'Unknown';
  const darakaraka = jaimini?.charaKarakas?.find((k: any) => k.role === 'DK')?.planet || 'Unknown';
  const karakamsa = jaimini?.karakamsaNavamshaSign || 'Unknown';
  const arudhaLagna = jaimini?.arudhaLagna?.sign || 'Unknown';

  // 7. Shadbala Strength Rank
  const shadbalaSummary = (strength?.shadbala || [])
    .map((s: any) => `${s.planet}: ${s.totalRupas?.toFixed(1) || (s.totalVirupas / 60).toFixed(1)} Rupas (Rank ${s.rank}, ${s.verdict})`)
    .join(', ');

  // 8. Ashtakavarga SAV Points
  const savSummary = ashtakavarga
    ? `Strong Signs (>28 bindus): ${ashtakavarga.strongSigns?.join(', ') || 'None'}; Weak Signs (<28 bindus): ${ashtakavarga.weakSigns?.join(', ') || 'None'}; Total SAV: ${ashtakavarga.sarvashtakavargaTotal || 337}`
    : 'Balanced';

  // 9. Gochara (Current Transits)
  const transitsSummary = (transits?.planets || [])
    .map((t: any) => `${t.planet}: currently in ${t.sign} (Natal Lagna House ${t.natalLagnaHouse}, Moon House ${t.chandraLagnaHouse})`)
    .join(', ');

  const sadeSatiStatus = transits?.sadeSati
    ? `Sade Sati Status: ${transits.sadeSati.active ? `ACTIVE (${transits.sadeSati.phase})` : 'INACTIVE'}. Details: ${transits.sadeSati.description || 'No direct natal Moon affliction'}`
    : 'Sade Sati: None';

  const dossierText = `=== CANONICAL ASTROLOGICAL DOSSIER ===
Native: ${birthProfile?.name || 'Native'}
Birth Details: ${birthProfile?.day}/${birthProfile?.month}/${birthProfile?.year} at ${birthProfile?.hour}:${String(birthProfile?.minute || 0).padStart(2, '0')} (${birthProfile?.cityName || 'India'})
Ascendant (Lagna): ${ascendant?.sign} (${ascendant?.formattedDegree}) in ${ascendant?.nakshatra} (Pada ${ascendant?.pada})

D1 RASHI (NATAL POSITIONS):
${d1List || 'Planetary data loaded'}

D9 NAVAMSHA (DHARMA & POTENTIAL):
${d9List || 'Navamsha calculated'}

D10 DASHAMSHA (PROFESSION & CAREER):
${d10List || 'Dashamsha calculated'}

VIMSHOTTARI DASHA:
${dashaInfo}

CLASSICAL YOGAS & DOSHAS IDENTIFIED:
${activeYogas || 'Standard planetary alignments'}

JAIMINI SYSTEM:
- Atmakaraka (Soul Planet): ${atmakaraka}
- Amatyakaraka (Career/Mind): ${amatyakaraka}
- Darakaraka (Spouse/Partnership): ${darakaraka}
- Karakamsa (Navamsha of Atmakaraka): ${karakamsa}
- Arudha Lagna (Public Image/Maya): ${arudhaLagna}

SHADBALA POTENCY:
${shadbalaSummary || 'Evaluated'}

ASHTAKAVARGA (SAV BINDUS):
${savSummary}

CURRENT GOCHARA (TRANSITS):
${transitsSummary || 'Ephemeris active'}
${sadeSatiStatus}
======================================`;

  const summaryHUD = {
    lagna: `${ascendant?.sign} (${ascendant?.formattedDegree})`,
    nakshatra: `${ascendant?.nakshatra} Pada ${ascendant?.pada}`,
    moonSign: planets?.find((p: any) => p.name === 'Moon')?.sign || 'Moon',
    sunSign: planets?.find((p: any) => p.name === 'Sun')?.sign || 'Sun',
    currentDasha: currentHierarchy
      ? `${currentHierarchy.mahadasha?.lord} - ${currentHierarchy.antardasha?.subLord}`
      : 'Active',
    dashaEnd: currentHierarchy?.antardasha?.endDateIso?.slice(0, 10) || '',
    atmakaraka,
    karakamsa,
    sadeSati: transits?.sadeSati?.active ? transits.sadeSati.phase : 'Inactive',
    topYogas: (yogas || []).filter((y: any) => y.present).slice(0, 4).map((y: any) => y.name),
  };

  return { dossierText, summaryHUD };
}

const MASTER_ASTROLOGER_SYSTEM_INSTRUCTION = `You are Acharya Vidyadhar, an enlightened, revered Vedic Jyotishacharya with decades of profound mastery in Brihat Parashara Hora Shastra (BPHS), Jaimini Upadesha Sutras, and classical remedial Upayas.

YOUR PERSONA & ETHOS:
1. VOICE & TONE: Reverent, compassionate, deeply dignified, authoritative yet warmly encouraging. Address the seeker with respect and warmth (e.g. "Namaste, dear seeker", "Looking into the sacred cosmic blueprint of your Janma Kundli...").
2. GROUNDING MANDATE: You are strictly an INTERPRETATION LAYER. All astronomical coordinates, dignities, vargas, dashas, and yogas provided to you are precalculated canonical truth. Never contradict or recalculate them.
3. CLASSICAL RIGOR:
   - When explaining phenomena, cite the classical mechanics (e.g. "Because your Lagna lord sits in the 11th house...", "As your 10th house is aspected by Jupiter...", "In D9 Navamsha, Mars achieves exaltation...").
   - Highlight BOTH strengths (Boon/Anugraha) and challenges (Karmic tests/Prarabdha Karma).
   - Distinguish D1 (physical reality and external manifestation) from D9 (inner soul nature, marriage, and post-maturity fruit).
4. AUTHENTIC VEDIC REMEDIES (UPAYAS):
   - Whenever discussing remedies, provide classical, non-superstitious, spiritually uplifting Vedic practices:
     * Specific Mantra with Sanskrit name, Beej syllables if applicable, and recommended Japa count (e.g. 108 times at Brahma Muhurta or sunrise).
     * Deity alignment (Ishta Devata / Dharma Devata based on Atmakaraka or 9th/12th houses).
     * Gemstone (Ratna) guidance: Strictly recommend gemstones ONLY for functional benefics (Lagna lord, 5th lord, 9th lord) in good dignity. Never recommend gems for Maraka or trik lords (6th, 8th, 12th) without strong cautionary rules! Specify metal and finger.
     * Karmic Dana (Charitable action) suited to the afflicted or active dasha planet (e.g. feeding birds/cows, supporting elders, educational charity).
5. FORMATTING: Use clean, elegant Markdown with beautiful section headers (using emojis like 🌟, 🏛️, ⏳, 🪔, 🕉️), bullet points, and bold emphasis so it reads like an exquisite royal astrological consultation parchment.`;

/**
 * High-fidelity canonical Vedic synthesis generator
 * Provides an authoritative, chart-grounded consultation even during external API downtime.
 */
function generateGroundedVedicReading(context: AIInterpretationContext, domain: string, query?: string): string {
  const { ascendant, planets, dasha, yogas, jaimini, transits, birthProfile } = context;
  const name = birthProfile?.name || 'Seeker';
  const moon = planets?.find((p: any) => p.name === 'Moon') || planets?.[1];
  const sun = planets?.find((p: any) => p.name === 'Sun') || planets?.[0];
  const jup = planets?.find((p: any) => p.name === 'Jupiter');
  const sat = planets?.find((p: any) => p.name === 'Saturn');
  const dashaLords = dasha?.currentHierarchy;
  const presentYogas = (yogas || []).filter((y: any) => y.present);

  return `### 🌟 Divine Invocation & Soul Blueprint (Janma Tattva)
Namaste, dear **${name}** 🙏. Looking into the sacred celestial geometry of your Janma Kundli, your soul incarnates under the dignified sign of **${ascendant?.sign} Lagna** (${ascendant?.formattedDegree}) in the nakshatra mansion of **${ascendant?.nakshatra}** (Pada ${ascendant?.pada}).

Your Janma Rashi (Moon sign) is positioned in **${moon?.sign}** (${moon?.formattedDegree}) in **${moon?.nakshatra}** Nakshatra, House ${moon?.houseNumber}. This bestows an emotional constitution marked by deep intuitive depth, tenacity, and an innate drive toward purposeful achievement. Your Surya Rashi (Sun sign) rests in **${sun?.sign}** in House ${sun?.houseNumber}, representing the vital life force and executive core of your persona.

According to Maharishi Jaimini's sacred Upadesha Sutras, your **Atmakaraka (King of the Soul)** is **${jaimini?.atmakaraka || 'Jupiter'}**, placed in the Navamsha sign of **${jaimini?.karakamsaNavamshaSign || 'Aries'}**. This indicates that your highest spiritual evolution and karmic maturation in this earthly incarnation stems from mastering wisdom, uncompromised integrity, and guiding others with spiritual discernment.

---

### 🏛️ Deep Astrological & Varga Synthesis
Examining your D1 Rashi Kundli alongside the D9 Navamsha and D10 Dashamsha reveals significant architectural strength:

- **Ascendant & Vital Centers**: With ${ascendant?.sign} rising, your personality projects stability and natural authority. The whole-sign distribution of planets places key benefics in prominent Kendra and Trikona positions, ensuring that persistent endeavor bears enduring fruit.
- **Divisional Confirmation (D9 Navamsha)**: The Navamsha acts as the inner fruition of the natal chart. In your D9 chart, key planetary dignities confirm that your inner character matures with age, providing enhanced relationship harmony and spiritual resilience after your early thirties.
- **Active Classical Yogas Verified**:
${presentYogas.length > 0 ? presentYogas.map((y: any) => `  * **${y.name}** [${y.bphsReference || 'BPHS'}]: ${y.effects}`).join('\n') : '  * Your chart features balanced Kendra and Trikona planetary alignments providing stable life foundations.'}

---

### ⏳ Current Cosmic Timing (Vimshottari Dasha & Gochara Transits)
Under the 120-year Vimshottari cycle, you are currently journeying through:
- **Major Period**: **${dashaLords?.mahadasha?.lord || 'Jupiter'} Mahadasha**
- **Sub Period**: **${dashaLords?.antardasha?.subLord || 'Saturn'} Antardasha**
- **Sub-Sub Period**: **${dashaLords?.pratyantardasha?.pratyantarLord || 'Mercury'} Pratyantardasha**
- **Current Window Boundary**: Effective through **${dashaLords?.antardasha?.endDateIso?.slice(0, 10) || '2026/2027'}**

**Astrological Significance**:
This cycle represents a pivotal epoch of crystallization and karmic harvest. The Mahadasha of ${dashaLords?.mahadasha?.lord} expands your horizons, while the Antardasha of ${dashaLords?.antardasha?.subLord} demands disciplined execution, structural organization, and patience. Avoid rash leaps; instead, systematically solidify foundational assets, professional alliances, and inner peace.

**Gochara (Transit) Alignment**:
Current Saturn transit in ${transits?.sadeSati?.saturnSign || 'Pisces'} and Jupiter's auspicious aspects directly illuminate your active houses. ${transits?.sadeSati?.active ? `You are currently experiencing the **${transits.sadeSati.phase} phase of Saturn's Sade Sati**, which teaches emotional maturity, detachment from superficial trivialities, and profound grounding.` : 'You are currently free from direct natal Moon Sade Sati affliction, allowing mental focus to remain clear and unencumbered.'}

---

### 🪔 Sacred Vedic Remedies (Upayas) & Astrological Guidance
To harmonize planetary energies, awaken functional benefics, and pacify karmic friction:

1. **Vedic Mantra Sadhana**:
   - Chant the sacred **Maha Mrityunjaya Mantra** or the **Gayatri Mantra** 108 times daily during Brahma Muhurta (dawn).
   - For your active ${dashaLords?.mahadasha?.lord} period, chant the classical Beej Mantra: *Om Gram Greem Graum Sah Guruve Namah* (or corresponding dasha deity mantra) on auspicious mornings.

2. **Karmic Charity (Dana)**:
   - On Thursdays and Saturdays, offer food to those in need, feed cows green fodder, or support young scholars in their education. Service to elders cleanses ancestral and Saturnian debts.

3. **Gemstone (Ratna) & Rudraksha Wisdom**:
   - Wear a **5-Mukhi Rudraksha** around the neck on a white silk thread to bestow peace of mind, balanced blood pressure, and spiritual illumination.
   - For gemstones, strictly consult the dignity of your functional benefic Lagna Lord before wearing natural unheated stones in silver or gold.

4. **Ishta Devata & Sanctuary**:
   - Offer prayers and a pure ghee lamp to **Lord Shiva** or **Sri Maha Vishnu** on Wednesdays and Thursdays for divine grace, clarity, and protection against unforeseen obstacles.

---

### 🕉️ Acharya's Parting Blessing
May the divine planetary deities (Navagrahas) shower wisdom, radiant vitality, prosperity, and peace upon your path. Walk forward in alignment with your Dharma, knowing that the stars impel rather than compel. *Shubham Bhavatu!* 🙏`;
}

function generateClassicalChatReply(context: AIInterpretationContext, message: string): string {
  const { ascendant, planets, dasha, yogas } = context;
  const moon = planets?.find((p: any) => p.name === 'Moon');
  const dashaLords = dasha?.currentHierarchy;
  const activeYoga = yogas?.find((y: any) => y.present)?.name || 'auspicious Kendra placements';

  return `Namaste, dear seeker 🙏. In examining your Janma Kundli regarding your inquiry: "${message}":

1. **Astrological Root Cause**: For your **${ascendant?.sign} Lagna** with Moon in **${moon?.sign}**, your current circumstances are primarily influenced by the active **${dashaLords?.mahadasha?.lord} Mahadasha** and **${dashaLords?.antardasha?.subLord} Antardasha** (running until ${dashaLords?.antardasha?.endDateIso?.slice(0, 10) || 'next period'}).
2. **Classical Parashari Dictum**: Under Maharishi Parashara's principles, when this period operates alongside ${activeYoga}, opportunities materialize through perseverance rather than hasty impulsiveness.
3. **Actionable Counsel**: Focus your energy on foundational growth. Maintain daily mantra japa and avoid initiating speculative ventures during planetary combustions or retrogressions.

May divine grace illuminate your decisions. Feel free to inquire further into your D9 Navamsha, career timing, or remedial measures.`;
}

// Deep Grounded Consultation Endpoint
aiRouter.post('/interpret', async (req: Request, res: Response) => {
  try {
    const { context, domain = 'COMPREHENSIVE', query = '', userId, chartId } = req.body;

    if (!context || !context.planets || !context.ascendant) {
      return res.status(400).json({ error: 'Valid canonical context required' });
    }

    const { dossierText, summaryHUD } = buildAstrologicalDossier(context);

    const domainPrompts: Record<string, string> = {
      COMPREHENSIVE: 'Provide a full, breathtaking life reading covering the soul purpose, core strengths, career zenith, relationships, current dasha timing, and practical remedies.',
      CAREER: 'Focus deeply on career destiny, authority potential, optimal vocations, wealth accumulation (Dhana Yogas), 10th house & D10 Dashamsha analysis, and dasha timing for professional breakthroughs.',
      RELATIONSHIPS: 'Focus deeply on marriage, spouse characteristics, timing of union, 7th house & D9 Navamsha harmony, Venus/Jupiter placement, Manglik dosha verdict, and relationship remedies.',
      HEALTH: 'Focus on vitality, Ayurvedic constitutional balance (Vata/Pitta/Kapha tendencies), sensitive organ areas indicated by 6th/8th houses and Moon/Sun vigor, and yogic/lifestyle remedies.',
      REMEDIES: 'Focus thoroughly on Dosha Nivaran (Manglik, Kaal Sarp, Sade Sati, Pitru Dosha analysis) and deliver an exhaustive Vedic remedial plan with exact Mantras, Gemstone rules, Rudraksha, and charitable fasts.',
      SPIRITUALITY: 'Focus on spiritual evolution, Moksha houses (4th, 8th, 12th), Atmakaraka lesson, Karakamsa, Ishta Devata identification, and meditation/sadhana pathways.',
      TRANSITS: 'Focus on the current 2026 Gochara transits: Saturn in Pisces, Jupiter, Rahu/Ketu axis, Sade Sati impact, and how these transits intersect with the active Vimshottari Dasha window.',
    };

    const targetPrompt = domainPrompts[domain] || domainPrompts.COMPREHENSIVE;

    const userPrompt = `${dossierText}

CONSULTATION FOCUS: ${domain}
SPECIFIC SEEKER INQUIRY: "${query || targetPrompt}"

Please deliver an authoritative, world-class Vedic Astrology consultation for ${context.birthProfile?.name || 'the seeker'} structured as follows:

1. 🌟 **DIVINE INVOCATION & SOUL BLUEPRINT (Janma Tattva)**
   - Welcome the seeker with cosmic warmth and divine invocation.
   - Synthesize the core nature: Lagna, Moon sign (Janma Rashi), Nakshatra Pada, and Atmakaraka (Soul signifier). What is the soul's overarching incarnation mission?

2. 🏛️ **DEEP D1 & VARGA ANALYSIS (Cosmic Architecture)**
   - Deep dive into the houses, house lords, and divisional charts (D9 Navamsha and D10 Dashamsha where relevant).
   - Analysis of active Raja Yogas, Dhana Yogas, and Mahapurusha combinations.

3. ⏳ **ACTIVE TEMPORAL TIMING (Vimshottari Dasha & Gochara Transits)**
   - Where is the native right now in the 120-year Vimshottari cycle?
   - How does the current Mahadasha/Antardasha interact with current planetary transits (especially Saturn, Jupiter, and Rahu/Ketu)?
   - Identify the clear upcoming Event Windows (months/years) when karma ripens for major breakthroughs or cautious pacing.

4. ⚖️ **KARMIC TENSIONS & PRARABDHA CHALLENGES**
   - Honestly and empathetically highlight unresolved chart tensions (e.g., debilitations, dusthana placements, combustion, or doshas).
   - Explain how these are not "curses" but specific evolutionary homework for the soul.

5. 🪔 **SACRED VEDIC REMEDIES & UPAYAS (Practical & Classical)**
   - **Vedic Mantra Sadhana**: Specific Sanskrit mantra with correct count and timing.
   - **Gemstone (Ratna) & Rudraksha**: Explicit recommendation with metals, finger, and day (only if safe!).
   - **Deity & Temples**: Ishta Devata worship according to classical BPHS rules.
   - **Karmic Charity (Dana)**: Specific actions, days of observance, and items to donate.

6. 🕉️ **ACHARYA'S BLESSING & SUMMARY HUD**
   - Uplifting parting counsel and spiritual reassurance.`;

    const client = getAi();
    let synthesisText = '';
    let usedSource = 'classical_vedic_engine';

    if (client) {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: MASTER_ASTROLOGER_SYSTEM_INSTRUCTION,
            temperature: 0.25,
          },
        });
        synthesisText = response.text || '';
        usedSource = 'gemini-3.8-flash';
      } catch (geminiError: any) {
        console.warn('[Gemini Primary Notice, trying fallback model]:', geminiError.message);
        try {
          const response = await client.models.generateContent({
            model: 'gemini-flash-latest',
            contents: userPrompt,
            config: {
              systemInstruction: MASTER_ASTROLOGER_SYSTEM_INSTRUCTION,
              temperature: 0.25,
            },
          });
          synthesisText = response.text || '';
          usedSource = 'gemini-flash-latest';
        } catch (e: any) {
          console.warn('[Gemini Fallback Notice, using canonical engine]:', e.message);
        }
      }
    }

    if (!synthesisText) {
      synthesisText = generateGroundedVedicReading(context, domain, query);
      usedSource = 'canonical_vedic_engine';
    }

    // Generate 4 dynamic, highly relevant follow-up questions for this chart
    const suggestedQuestions = [
      `What does my ${context.dasha?.currentHierarchy?.mahadasha?.lord || 'active'} Mahadasha signify for career growth?`,
      `How does my ${context.jaimini?.atmakaraka || 'Sun'} Atmakaraka shape my soul purpose?`,
      `Which gemstone is safest and most beneficial for my ${context.ascendant?.sign} Lagna?`,
      `How will the upcoming planetary transits affect my financial and relationship prospects?`,
    ];

    // Persist to Supabase if userId is provided
    if (userId && synthesisText) {
      try {
        await supabase.from('saved_consultations').insert({
          user_id: userId,
          chart_id: chartId || null,
          domain,
          query: query || targetPrompt,
          synthesis: synthesisText,
          source: usedSource,
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn('[Supabase Consultation Persist Notice]:', err.message);
      }
    }

    res.json({
      success: true,
      source: usedSource,
      synthesis: synthesisText,
      interpretation: synthesisText, // Support both keys for frontend resilience
      suggestedQuestions,
      summaryHUD,
    });
  } catch (error: any) {
    console.error('AI Interpret Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Consultation generation failed' });
  }
});

// Interactive Multi-Turn Astrologer Dialogue Endpoint
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { context, message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const client = getAi();
    const { dossierText } = buildAstrologicalDossier(context || {});

    const systemInstruction = `${MASTER_ASTROLOGER_SYSTEM_INSTRUCTION}

You are in a live, direct personal consultation with the seeker.
Here is the seeker's complete, verified canonical chart dossier:
${dossierText}

GUIDELINES FOR YOUR REPLY:
1. Speak directly, compassionately, and with classical authority.
2. Directly answer the seeker's specific question using exact placements, house lords, aspects, D9 Navamsha confirmations, or dasha dates from their dossier.
3. If they ask about timing, refer to their active Mahadasha and Antardasha dates.
4. Keep the response beautifully structured, actionable, and warm. Provide specific remedies (mantra, charity, deity) if relevant to their issue.`;

    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        if (h.role && h.parts && Array.isArray(h.parts)) {
          chatContents.push({ role: h.role, parts: h.parts });
        } else if (h.role && h.text) {
          chatContents.push({ role: h.role, parts: [{ text: h.text }] });
        }
      }
    }

    // Add current turn
    chatContents.push({ role: 'user', parts: [{ text: message }] });

    let replyText = '';

    if (client) {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: chatContents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        replyText = response.text || '';
      } catch (geminiError: any) {
        console.warn('[Gemini Chat Primary Notice, trying fallback]:', geminiError.message);
        try {
          const response = await client.models.generateContent({
            model: 'gemini-flash-latest',
            contents: chatContents,
            config: {
              systemInstruction,
              temperature: 0.3,
            },
          });
          replyText = response.text || '';
        } catch {
          replyText = generateClassicalChatReply(context, message);
        }
      }
    } else {
      replyText = generateClassicalChatReply(context, message);
    }

    // Generate 3 contextual follow-up questions
    const followUps = [
      'What specific mantra is most auspicious for me to chant daily?',
      'How does my D9 Navamsha alter or strengthen this placement?',
      'When is the most favorable time to initiate this new chapter?',
    ];

    res.json({
      success: true,
      reply: replyText,
      suggestedQuestions: followUps,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Chat error' });
  }
});

// Audio Speech Synthesis Endpoint (Gemini 3.8 Flash Lite TTS)
aiRouter.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Fenrir' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const client = getAi();
    if (!client) {
      return res.status(503).json({ error: 'Gemini client not initialized' });
    }

    // Clean text: remove markdown formatting and limit length for concise audio recap
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, ' ')
      .slice(0, 750); // High-impact executive audio summary

    const ttsResponse = await client.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Reverent, calm, wise Vedic astrologer with warm pacing',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Fenrir', 'Puck', 'Charon', 'Kore', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Failed to generate speech audio' });
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// User Consultation History Endpoint
aiRouter.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.json({ success: true, consultations: [] });

    const { data, error } = await supabase
      .from('saved_consultations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) {
      return res.json({ success: true, consultations: [] });
    }

    res.json({ success: true, consultations: data || [] });
  } catch (err: any) {
    res.json({ success: true, consultations: [] });
  }
});
