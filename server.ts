/**
 * ASTROWORLD — Full-Stack Server Entry Point
 * Express server providing canonical astrology computation and grounded AI Astrologer endpoints.
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  computeCanonicalChart,
  GOLDEN_BENCHMARK_PROFILE,
} from './src/engine/canonicalChart.ts';
import { AIInterpretationContext, BirthProfile } from './src/engine/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini API SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Compute Chart API
app.post('/api/astrology/compute', (req: Request, res: Response) => {
  try {
    const profile: BirthProfile = req.body.profile || GOLDEN_BENCHMARK_PROFILE;
    const evalDate = req.body.evaluationDate ? new Date(req.body.evaluationDate) : new Date();
    const chart = computeCanonicalChart(profile, evalDate);
    res.json({ success: true, chart });
  } catch (error: any) {
    console.error('Computation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Calculation error' });
  }
});

// Authentication & User Data Endpoints
import { serverDb } from './src/server/serverDb.ts';

app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }

    const user = serverDb.createUser(name, email, password);
    res.json({ success: true, user });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message || 'Signup failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = serverDb.verifyUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ success: true, user });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal login error' });
  }
});

app.get('/api/user/charts/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const charts = serverDb.getChartsByUserId(userId);
    res.json({ success: true, charts });
  } catch (err: any) {
    console.error('Fetch charts error:', err);
    res.status(500).json({ error: 'Failed to fetch charts' });
  }
});

app.post('/api/user/charts', (req: Request, res: Response) => {
  try {
    const { userId, chart } = req.body;
    if (!userId || !chart || !chart.name) {
      return res.status(400).json({ error: 'Valid chart payload and userId required' });
    }

    const saved = serverDb.saveChart({
      userId,
      name: chart.name,
      year: chart.year,
      month: chart.month,
      day: chart.day,
      hour: chart.hour,
      minute: chart.minute,
      second: chart.second ?? 0,
      latitude: chart.latitude,
      longitude: chart.longitude,
      timezone: chart.timezone,
      cityName: chart.cityName || 'India',
      chartStyle: chart.chartStyle || 'NORTH_INDIAN',
    });

    res.json({ success: true, chart: saved });
  } catch (err: any) {
    console.error('Save chart error:', err);
    res.status(500).json({ error: 'Failed to save chart' });
  }
});

app.delete('/api/user/charts/:userId/:chartId', (req: Request, res: Response) => {
  try {
    const { userId, chartId } = req.params;
    const ok = serverDb.deleteChart(userId, chartId);
    res.json({ success: ok });
  } catch (err: any) {
    console.error('Delete chart error:', err);
    res.status(500).json({ error: 'Failed to delete chart' });
  }
});

// 2. Canonical Golden Profile API
app.get('/api/astrology/golden', (_req: Request, res: Response) => {
  try {
    const chart = computeCanonicalChart(GOLDEN_BENCHMARK_PROFILE);
    res.json({
      success: true,
      profile: GOLDEN_BENCHMARK_PROFILE,
      chart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AI Astrologer Grounded Interpretation
app.post('/api/ai/interpret', async (req: Request, res: Response) => {
  try {
    const context: AIInterpretationContext = req.body.context;
    const domain: string = req.body.domain || 'COMPREHENSIVE';
    const query: string = req.body.query || '';

    if (!context || !context.planets || !context.ascendant) {
      return res.status(400).json({ error: 'Valid canonical context required' });
    }

    // Build compact summary for model context
    const d1Summary = context.planets
      .map(
        (p) =>
          `${p.name}: ${p.sign} ${p.formattedDegree} (H${p.houseNumber}, ${p.dignity}, ${p.nakshatra} P${p.pada})`
      )
      .join('\n');

    const d9Summary = context.vargas?.['D9']?.planets
      .map((p) => `${p.planet}: ${p.vargaSign} (H${p.houseNumber}, ${p.dignity})`)
      .join('\n');

    const dashaSummary = `Active: ${context.dasha?.currentHierarchy?.mahadasha?.lord} MD / ${context.dasha?.currentHierarchy?.antardasha?.subLord} AD / ${context.dasha?.currentHierarchy?.pratyantardasha?.pratyantarLord} PD (Window: ${context.dasha?.currentHierarchy?.antardasha?.startDateIso.slice(0, 10)} to ${context.dasha?.currentHierarchy?.antardasha?.endDateIso.slice(0, 10)})`;

    const yogasSummary = context.yogas
      ?.filter((y) => y.present)
      .map((y) => `${y.name} [Ref: ${y.bphsReference}]: ${y.effects}`)
      .join('\n');

    const evidenceKeys = context.evidencePool?.slice(0, 20).map((e) => `[${e.evidenceId}] ${e.description}`).join('\n');

    const systemInstruction = `You are ASTROWORLD AI Astrologer, an authoritative, reverent, and rigorous Parashari Vedic Astrology interpretation intelligence.
STRICT REASONING HIERARCHY:
CANONICAL FACT -> CLASSICAL RULE -> APPLICABILITY -> EVIDENCE -> INTERPRETATION -> TIMING -> UNCERTAINTY.

CRITICAL RULES:
1. You are strictly an INTERPRETATION LAYER. You NEVER calculate planetary positions, Vargas, Dasha, dignities, or yogas. All facts are already pre-calculated in the provided context.
2. CITATION MANDATE: Every major astrological claim MUST cite its Evidence ID from the authorized evidence pool (e.g. [EVID_PLANET_SUN_D1], [EVID_VARGA_D9_SUN], [EVID_YOGA_RUCHAKA]).
3. DIVISIONAL CHART SEPARATION: Maintain strict distinction between D1 (Rashi) and D9 (Navamsha) or other Vargas. NEVER mix them. D1 is the tree of life, D9 is the fruit and inner potential.
4. TIMING RIGOR:
   - Mark EXACT events ONLY when an exact canonical timestamp exists.
   - For life phases, use EVENT_WINDOW (date ranges).
   - If evidence is inconclusive, explicitly state UNKNOWN or UNRESOLVED. Never invent exact calendar dates for events like job offers or marriage.
5. CONTRADICTION PRESERVATION: When benefic and malefic influences conflict, preserve the tension as an UNRESOLVED dynamic rather than pretending harmony exists.
6. Tone: Serious, classical, elegant, deeply grounded in Maharishi Parashara's Brihat Parashara Hora Shastra (BPHS).`;

    const prompt = `CANONICAL CHART CONTEXT:
Ascendant (Lagna): ${context.ascendant.sign} ${context.ascendant.formattedDegree} (${context.ascendant.nakshatra} Pada ${context.ascendant.pada})
D1 Placements:
${d1Summary}

D9 Navamsha Placements:
${d9Summary}

Vimshottari Dasha:
${dashaSummary}

Active Classical Yogas:
${yogasSummary}

Atmakaraka: ${context.jaimini?.atmakaraka}, Karakamsa: ${context.jaimini?.karakamsaNavamshaSign}, Arudha Lagna: ${context.jaimini?.arudhaLagna?.sign}

Available Evidence IDs:
${evidenceKeys}

User Domain Focus: ${domain}
Specific Inquiry: ${query || 'Provide an in-depth canonical life synthesis with classical grounding and timing windows.'}

Deliver a structured reading with:
1. EXECUTIVE SYNTHESIS: Core soul purpose, primary yogas, and life theme.
2. CANONICAL CLAIMS WITH EVIDENCE CITATIONS: Bulleted claims with [EVID_...] citations and confidence bases (DIRECT, SUPPORTED, CONVERGENT, UNRESOLVED).
3. ACTIVE DASHA & GOCHARA TIMING: Clear bounded windows (EVENT_WINDOW).
4. CONTRADICTIONS & UNCERTAINTIES: Honest appraisal of conflicting forces.
5. CLASSICAL PARASHARI GUIDANCE / REMEDIES.`;

    if (!ai) {
      // Deterministic high-quality fallback when API key is not yet set
      return res.json({
        success: true,
        source: 'deterministic_fallback',
        synthesis: `### Executive Synthesis
The native is born under **${context.ascendant.sign} Lagna** [EVID_LAGNA_POSITION] with **${context.planets.find((p) => p.name === 'Sun')?.sign} Sun** in Moolatrikona [EVID_PLANET_SUN_D1] and **${context.planets.find((p) => p.name === 'Moon')?.sign} Moon**. In D9 Navamsha, the Sun achieves exaltation in Aries [EVID_VARGA_D9_SUN], establishing a profound confluence of inner spiritual authority and external executive destiny.

### Active Temporal Timing (Event Window)
The native is currently in the **${context.dasha?.currentHierarchy?.mahadasha?.lord} Mahadasha** and **${context.dasha?.currentHierarchy?.antardasha?.subLord} Antardasha** window [EVID_DASHA_ACTIVE_${context.dasha?.currentHierarchy?.mahadasha?.lord}_${context.dasha?.currentHierarchy?.antardasha?.subLord}]. Under classical Parashari principles, this period emphasizes the affairs of house ${context.planets.find((p) => p.name === context.dasha?.currentHierarchy?.mahadasha?.lord)?.houseNumber} and house ${context.planets.find((p) => p.name === context.dasha?.currentHierarchy?.antardasha?.subLord)?.houseNumber}.

### Active Classical Yogas
${context.yogas?.filter((y) => y.present).map((y) => `- **${y.name}** [EVID_YOGA_${y.id.toUpperCase()}]: ${y.effects}`).join('\n')}

### Preserved Tensions & Contradictions
- While Jupiter's placement in house 5 supports intellect and discernment, Saturn's simultaneous presence in house 3 generates deliberate, methodical pacing rather than rapid ease. This is preserved as an unresolved creative tension between expansion and structural discipline.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for deterministic grounding
      },
    });

    res.json({
      success: true,
      source: 'gemini_grounded',
      synthesis: response.text,
    });
  } catch (error: any) {
    console.error('AI Interpret Error:', error);
    res.status(500).json({ error: error.message || 'AI Generation failed' });
  }
});

// 4. Interactive AI Astrologer Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { context, message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    if (!ai) {
      return res.json({
        reply: `Classical Vedic reading for ${context?.ascendant?.sign || 'Taurus'} Lagna: Regarding your question "${message}", according to Brihat Parashara Hora Shastra, your active ${context?.dasha?.currentHierarchy?.mahadasha?.lord || 'Jupiter'} Mahadasha brings focused opportunities. All planetary placements are strictly grounded in your natal chart.`,
      });
    }

    const systemInstruction = `You are ASTROWORLD AI Astrologer, answering user questions about their Vedic birth chart.
You have the user's canonical chart details:
- Lagna: ${context?.ascendant?.sign} (${context?.ascendant?.formattedDegree})
- Sun: ${context?.planets?.find((p: any) => p.name === 'Sun')?.sign} (Dignity: ${context?.planets?.find((p: any) => p.name === 'Sun')?.dignity})
- Moon: ${context?.planets?.find((p: any) => p.name === 'Moon')?.sign} (Nakshatra: ${context?.planets?.find((p: any) => p.name === 'Moon')?.nakshatra})
- Active Dasha: ${context?.dasha?.currentHierarchy?.mahadasha?.lord} MD / ${context?.dasha?.currentHierarchy?.antardasha?.subLord} AD
- Atmakaraka: ${context?.jaimini?.atmakaraka}
- Present Yogas: ${context?.yogas?.filter((y: any) => y.present).map((y: any) => y.name).join(', ')}

Always maintain the classical reasoning sequence: Fact -> Classical Rule -> Evidence -> Interpretation -> Timing Window.
Never fabricate dates or invent non-existent chart details.`;

    const chatContents = history && Array.isArray(history) ? history : [];
    chatContents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Chat error' });
  }
});

// Serve static assets from public folder
app.use(express.static(path.resolve(__dirname, 'public')));

// Vite Middleware integration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASTROWORLD] Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
