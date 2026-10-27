/**
 * ASTROWORLD — Consultation Feedback Router
 * Allows authenticated users to rate AI consultation answers and submit feedback.
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseService.ts';
import { authenticateRequest, getAuthenticatedUser } from '../middleware/authMiddleware.ts';

export const feedbackRouter = Router();

feedbackRouter.use(authenticateRequest);

// Submit consultation feedback
feedbackRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const { conversationId, turnIndex, rating, category, feedbackText, metadata } = req.body || {};

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5.' });
    }

    const { data, error } = await supabase
      .from('consultation_feedback')
      .insert({
        user_id: userId,
        conversation_id: conversationId || null,
        turn_index: turnIndex !== undefined ? Number(turnIndex) : null,
        rating: numericRating,
        category: category || 'ACCURACY',
        feedback_text: feedbackText ? String(feedbackText).trim() : null,
        metadata: metadata && typeof metadata === 'object' ? metadata : {},
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase Feedback Error]:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to submit feedback.' });
    }

    return res.status(201).json({ success: true, feedback: data });
  } catch (err) {
    console.error('[Feedback POST] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit feedback.' });
  }
});

// List authenticated user's feedback
feedbackRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);

    const { data, error } = await supabase
      .from('consultation_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Fetch Feedback Error]:', error.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
    }

    return res.json({ success: true, feedback: data || [] });
  } catch (err) {
    console.error('[Feedback GET] unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch feedback.' });
  }
});
