/**
 * ASTROWORLD — AI Astrologer Routes
 * Endpoints for Consultation-Grade Astrological Interpretation, Dialogue & TTS.
 */

import { Router, Request, Response } from 'express';
import { getAi } from '../services/geminiService.ts';
import { supabase } from '../services/supabaseService.ts';
import { AIInterpretationContext } from '../../../shared/index.ts';
import { conductAstrologerConsultation } from '../ai/index.ts';

export const aiRouter = Router();

/**
 * Convert structured consultation response into royal Markdown consultation parchment.
 */
function formatConsultationMarkdown(
  structured: any,
  context: AIInterpretationContext
): string {
  const parts: string[] = [];

  if (structured.direct_answer) {
    parts.push(`### 🌟 Direct Guidance\n${structured.direct_answer}`);
  }

  if (structured.transit_overview_table && Array.isArray(structured.transit_overview_table) && structured.transit_overview_table.length > 0) {
    parts.push(`### 🪐 Planetary Transit Overview\n| Planet | Sign | Approx. Degree | Nakshatra | Retrograde |\n| :--- | :--- | :--- | :--- | :--- |\n` +
      structured.transit_overview_table.map((t: any) => `| **${t.planet}** | ${t.sign} | ${t.approx_degree || '—'} | ${t.nakshatra || '—'} | ${t.retrograde ? 'Yes (Vakri)' : 'Direct'} |`).join('\n')
    );
  }

  if (structured.astrological_reasoning) {
    parts.push(`### 🏛️ Astrological Reasoning & Classical Mechanics\n${structured.astrological_reasoning}`);
  }

  if (structured.personal_interpretation) {
    parts.push(`### ⏳ Personal Interpretation & Life Context\n${structured.personal_interpretation}`);
  }

  if (structured.timing && Array.isArray(structured.timing) && structured.timing.length > 0) {
    const timingLines = structured.timing
      .map((t: any) => `* **${t.period}** [${t.type}]: ${t.indication}`)
      .join('\n');
    parts.push(`### ⏳ Auspicious Timing & Period Alignment\n${timingLines}`);
  }

  if (structured.practical_guidance) {
    parts.push(`### 🪔 Vedic Upayas & Mindful Action\n${structured.practical_guidance}`);
  }

  if (structured.uncertainty_or_caveats && structured.uncertainty_or_caveats.length > 0) {
    parts.push(`> [!NOTE]\n> ${structured.uncertainty_or_caveats.join(' ')}`);
  }

  return parts.join('\n\n');
}

/**
 * Builds high-fidelity HUD summary metrics from canonical context.
 */
function buildSummaryHUD(context: AIInterpretationContext): Record<string, any> {
  const { ascendant, planets, dasha, yogas, jaimini, transits } = context;
  const currentHierarchy = dasha?.currentHierarchy;
  return {
    lagna: `${ascendant?.sign} (${ascendant?.formattedDegree})`,
    nakshatra: `${ascendant?.nakshatra} Pada ${ascendant?.pada}`,
    moonSign: planets?.find((p: any) => p.name === 'Moon')?.sign || 'Moon',
    sunSign: planets?.find((p: any) => p.name === 'Sun')?.sign || 'Sun',
    currentDasha: currentHierarchy
      ? `${currentHierarchy.mahadasha?.lord} - ${currentHierarchy.antardasha?.subLord}`
      : 'Active',
    dashaEnd: currentHierarchy?.antardasha?.endDateIso?.slice(0, 10) || '',
    atmakaraka: jaimini?.atmakaraka || 'Calculated',
    karakamsa: jaimini?.karakamsaNavamshaSign || 'Calculated',
    sadeSati: transits?.sadeSati?.active ? transits.sadeSati.phase : 'Inactive',
    topYogas: (yogas || []).filter((y: any) => y.present).slice(0, 4).map((y: any) => y.name),
  };
}

// POST /interpret and /consult — Deep Domain Consultation
aiRouter.post(['/interpret', '/consult'], async (req: Request, res: Response) => {
  try {
    const { context, domain = 'COMPREHENSIVE', query, userId, chartId, sessionId } = req.body;

    if (!context || !context.ascendant) {
      return res.status(400).json({ success: false, error: 'Valid canonical chart context is required.' });
    }

    const question = query || `Provide a comprehensive Vedic astrology consultation for the ${domain} life domain.`;
    const sessionKey = sessionId || userId || 'default-session';

    // Conduct consultation using Master AI Astrologer Subsystem
    const result = await conductAstrologerConsultation(question, context, sessionKey);
    const synthesisText = formatConsultationMarkdown(result.response, context);
    const summaryHUD = buildSummaryHUD(context);

    const suggestedQuestions = result.response.follow_up_suggestions && result.response.follow_up_suggestions.length > 0
      ? result.response.follow_up_suggestions
      : [
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
          query: question,
          synthesis: synthesisText,
          source: result.validated ? 'gemini-3.8-flash' : 'canonical_astrologer_engine',
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn('[Supabase Consultation Persist Notice]:', err.message);
      }
    }

    res.json({
      success: true,
      source: result.validated ? 'gemini-3.8-flash' : 'canonical_astrologer_engine',
      synthesis: synthesisText,
      interpretation: synthesisText,
      structuredResponse: result.response,
      suggestedQuestions,
      summaryHUD,
      latencyMs: result.latencyMs,
      intentSummary: result.intentSummary,
      specialistsActivated: result.specialistsActivated,
    });
  } catch (error: any) {
    console.error('AI Interpret Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Consultation generation failed' });
  }
});

// POST /chat — Interactive Multi-Turn Dialogue
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { context, message, sessionId, userId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    if (!context || !context.ascendant) {
      return res.status(400).json({ error: 'Valid canonical chart context is required.' });
    }

    const sessionKey = sessionId || userId || 'chat-session';
    const result = await conductAstrologerConsultation(message, context, sessionKey);
    const replyMarkdown = formatConsultationMarkdown(result.response, context);

    const followUps = result.response.follow_up_suggestions && result.response.follow_up_suggestions.length > 0
      ? result.response.follow_up_suggestions
      : [
          'What specific mantra is most auspicious for me to chant daily?',
          'How does my D9 Navamsha alter or strengthen this placement?',
          'When is the most favorable time to initiate this new chapter?',
        ];

    res.json({
      success: true,
      reply: replyMarkdown,
      structuredResponse: result.response,
      suggestedQuestions: followUps,
      latencyMs: result.latencyMs,
      intentSummary: result.intentSummary,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Chat error' });
  }
});

// POST /tts — Audio Speech Synthesis
aiRouter.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Fenrir' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const client = getAi();
    if (!client) {
      return res.status(503).json({ error: 'Gemini client not initialized' });
    }

    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, ' ')
      .slice(0, 750);

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
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'TTS audio synthesis did not return media' });
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/mp3',
    });
  } catch (err: any) {
    console.warn('[Gemini TTS Notice]:', err.message);
    res.status(500).json({ error: 'TTS audio currently unavailable' });
  }
});

// GET /history/:userId — Consultation History
aiRouter.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const { data, error } = await supabase
      .from('saved_consultations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ consultations: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
