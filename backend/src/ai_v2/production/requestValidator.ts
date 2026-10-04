/**
 * ASTROWORLD AI V2 — Production Request Validator
 * Strict input validation, size bounding, timezone verification, and prompt injection screening.
 */

import { ProductionConsultationRequest } from './productionTypes.ts';
import { ProductionError } from './productionErrors.ts';
import { validateBirthProfile } from '../schemas/birthProfile.ts';

export class RequestValidator {
  private static readonly MAX_MESSAGE_LENGTH = 2000;
  private static readonly MAX_CONTEXT_TURNS = 20;

  private static readonly PROMPT_INJECTION_PATTERNS = [
    /ignore all previous instructions/i,
    /system prompt override/i,
    /reveal system prompt/i,
    /bypass safety checks/i,
    /output full internal state/i,
    /developer mode enabled/i,
    /jailbreak/i,
  ];

  /**
   * Validates an incoming production consultation request.
   */
  public static validate(request: Partial<ProductionConsultationRequest>): ProductionConsultationRequest {
    // 1. Authenticated User Check
    if (!request.authenticatedUser || !request.authenticatedUser.userId) {
      throw new ProductionError({
        errorCode: 'AUTHENTICATION_ERROR',
        userMessage: 'Authentication required. A valid authenticated user context must be provided.',
      });
    }

    const userId = String(request.authenticatedUser.userId).trim();
    if (!userId || userId.length < 1 || userId.length > 128) {
      throw new ProductionError({
        errorCode: 'AUTHENTICATION_ERROR',
        userMessage: 'Invalid user identity provided in authentication context.',
      });
    }

    // 2. Conversation ID Check
    if (!request.conversationId || typeof request.conversationId !== 'string') {
      throw new ProductionError({
        errorCode: 'CLIENT_VALIDATION_ERROR',
        userMessage: 'conversationId is required and must be a valid identifier.',
      });
    }

    const conversationId = request.conversationId.trim();
    if (conversationId.length < 3 || conversationId.length > 128) {
      throw new ProductionError({
        errorCode: 'CLIENT_VALIDATION_ERROR',
        userMessage: 'conversationId must be between 3 and 128 characters.',
      });
    }

    // 3. User Message Check
    if (!request.userMessage || typeof request.userMessage !== 'string') {
      throw new ProductionError({
        errorCode: 'CLIENT_VALIDATION_ERROR',
        userMessage: 'userMessage is required and must be a non-empty string.',
      });
    }

    const userMessage = request.userMessage.trim();
    if (userMessage.length === 0) {
      throw new ProductionError({
        errorCode: 'CLIENT_VALIDATION_ERROR',
        userMessage: 'userMessage cannot be empty or whitespace only.',
      });
    }

    if (userMessage.length > this.MAX_MESSAGE_LENGTH) {
      throw new ProductionError({
        errorCode: 'REQUEST_TOO_LARGE',
        userMessage: `userMessage exceeds maximum allowed length (${this.MAX_MESSAGE_LENGTH} characters). Received ${userMessage.length} characters.`,
      });
    }

    // 4. Prompt Injection / Malicious Prompt Screening
    for (const pat of this.PROMPT_INJECTION_PATTERNS) {
      if (pat.test(userMessage)) {
        throw new ProductionError({
          errorCode: 'CLIENT_VALIDATION_ERROR',
          userMessage: 'Your message contains disallowed system override instructions.',
          internalDetails: `PromptInjectionDetected: "${pat.source}"`,
        });
      }
    }

    // 5. Birth Profile Validation
    if (!request.birthProfile) {
      throw new ProductionError({
        errorCode: 'ASTROLOGY_INPUT_ERROR',
        userMessage: 'birthProfile is required for astrological consultation.',
      });
    }

    const birthValidation = validateBirthProfile(request.birthProfile);
    if (!birthValidation.valid) {
      throw new ProductionError({
        errorCode: 'ASTROLOGY_INPUT_ERROR',
        userMessage: birthValidation.error || 'Invalid birth profile details provided.',
        internalDetails: birthValidation.error,
      });
    }

    // Explicit date ranges
    const bp = request.birthProfile;
    if (bp.year < 1800 || bp.year > 2100) {
      throw new ProductionError({
        errorCode: 'ASTROLOGY_INPUT_ERROR',
        userMessage: `Birth year ${bp.year} is outside the supported ephemeris range (1800-2100).`,
      });
    }

    if (bp.latitude < -90 || bp.latitude > 90) {
      throw new ProductionError({
        errorCode: 'ASTROLOGY_INPUT_ERROR',
        userMessage: `Birth latitude ${bp.latitude} is invalid. Latitude must be between -90 and 90.`,
      });
    }

    if (bp.longitude < -180 || bp.longitude > 180) {
      throw new ProductionError({
        errorCode: 'ASTROLOGY_INPUT_ERROR',
        userMessage: `Birth longitude ${bp.longitude} is invalid. Longitude must be between -180 and 180.`,
      });
    }

    // 6. Context Size Bounding
    if (request.consultationContext) {
      if (!Array.isArray(request.consultationContext)) {
        throw new ProductionError({
          errorCode: 'CLIENT_VALIDATION_ERROR',
          userMessage: 'consultationContext must be an array of conversation turns.',
        });
      }
      if (request.consultationContext.length > this.MAX_CONTEXT_TURNS) {
        throw new ProductionError({
          errorCode: 'REQUEST_TOO_LARGE',
          userMessage: `consultationContext exceeds maximum allowed turns (${this.MAX_CONTEXT_TURNS}).`,
        });
      }
    }

    return {
      authenticatedUser: {
        userId,
        email: request.authenticatedUser.email,
        role: request.authenticatedUser.role || 'user',
        sessionToken: request.authenticatedUser.sessionToken,
        ipAddress: request.authenticatedUser.ipAddress,
      },
      conversationId,
      userMessage,
      birthProfile: bp,
      idempotencyKey: request.idempotencyKey ? String(request.idempotencyKey).trim() : undefined,
      clientTurnId: request.clientTurnId ? String(request.clientTurnId).trim() : undefined,
      locale: request.locale || 'en-US',
      timezone: request.timezone || bp.timezone || 'UTC',
      executionMode: request.executionMode || 'production',
      consultationContext: request.consultationContext,
    };
  }
}
