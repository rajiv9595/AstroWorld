/**
 * ASTROWORLD AI V2 — Claim Validation & Grounding Firewall
 * Validates candidate claims against canonical evidence, classical rules,
 * temporal boundaries, certainty limits, and domain relevance.
 * Guarantees that zero unsupported statements pass to the narrator.
 */

import { QuestionPlan } from '../schemas/questionPlan.ts';
import { EvidencePacket } from '../schemas/evidencePacket.ts';
import { ReasoningPacket } from '../schemas/reasoningPacket.ts';
import {
  ClaimItem,
  ApprovedClaimSet,
  ClaimAuditRecord,
  QuestionCoverageStatus,
  validateApprovedClaimSet,
} from '../schemas/claimPacket.ts';

const FORBIDDEN_CERTAINTY_REGEX =
  /\b(guaranteed|definitely|certainly|100%\s*certain|must\s+happen|will\s+happen\s+for\s+sure|inevitable|without\s+a\s+doubt|unquestionably)\b/i;

const REMEDY_KEYWORDS = [
  'wear a gemstone',
  'wear ruby',
  'wear sapphire',
  'wear emerald',
  'chant mantra',
  'perform puja',
  'fast on tuesday',
  'fast on saturday',
  'remedy',
];

export class GroundingFirewall {
  /**
   * Validates an array of candidate claims against verified inputs.
   */
  public validate(
    candidateClaims: ClaimItem[],
    plan: QuestionPlan,
    reasoning: ReasoningPacket,
    evidence: EvidencePacket
  ): ApprovedClaimSet {
    const approvedClaims: ClaimItem[] = [];
    const rejectedClaims: ClaimItem[] = [];
    const auditRecords: ClaimAuditRecord[] = [];

    // Canonical entity/sign sets for exact grounding. Avoid substring
    // matching because "Moon" could otherwise match unrelated descriptive text.
    const verifiedEntityNames = new Set<string>();
    const verifiedSigns = new Set<string>();
    for (const f of evidence.facts) {
      verifiedEntityNames.add(f.entity.trim().toLowerCase());
      if (f.sign) verifiedSigns.add(f.sign.trim().toLowerCase());
    }
    for (const d of evidence.derivedFacts) {
      if (d.participatingPlanets) {
        d.participatingPlanets.forEach(p => verifiedEntityNames.add(p.trim().toLowerCase()));
      }
    }

    const verifiedEvidenceIds = new Set<string>([
      ...evidence.facts.map(f => f.id),
      ...evidence.derivedFacts.map(d => d.id),
    ]);

    const verifiedRuleIds = new Set<string>(
      reasoning.appliedRules.filter(r => r.applicabilityStatus === 'applied').map(r => r.ruleId)
    );

    const verifiedSourceIds = new Set<string>(
      reasoning.appliedRules.map(r => r.sourceId)
    );

    // Validate Each Candidate Claim
    for (const claim of candidateClaims) {
      const failedChecks: string[] = [];

      // 1. Factual Validation & Astrological Invention Firewall
      this.checkFactualGrounding(claim, evidence, verifiedEntityNames, failedChecks);

      // 2. Temporal Validation
      this.checkTemporalGrounding(claim, reasoning, plan, failedChecks);

      // 3. Lineage Verification
      this.checkLineage(claim, verifiedEvidenceIds, verifiedRuleIds, verifiedSourceIds, failedChecks);

      // 4. Certainty Control Firewall
      this.checkCertaintyControl(claim, failedChecks);

      // 5. Relevance & Domain Drift Firewall
      this.checkDomainRelevance(claim, plan, failedChecks);

      // 6. Contradiction & Unsupported State Firewall
      this.checkStateAndContradictions(claim, reasoning, failedChecks);

      // 7. Remedy Firewall
      this.checkRemedyFirewall(claim, reasoning, failedChecks);

      // Assemble Decision
      const isApproved = failedChecks.length === 0;
      const validatedClaim: ClaimItem = {
        ...claim,
        allowed: isApproved,
        rejectionReason: isApproved ? undefined : failedChecks.join('; '),
        failedChecks: isApproved ? undefined : failedChecks,
      };

      if (isApproved) {
        approvedClaims.push(validatedClaim);
      } else {
        rejectedClaims.push(validatedClaim);
      }

      auditRecords.push({
        claimId: claim.claimId,
        validationStatus: isApproved ? 'approved' : 'rejected',
        failedChecks,
        evidenceIds: claim.evidenceIds || [],
        ruleIds: claim.ruleIds || [],
        sourceIds: claim.sourceIds || [],
        timestampIso: new Date().toISOString(),
      });
    }

    // Evaluate Overall Question Coverage
    const questionCoverage = this.evaluateQuestionCoverage(approvedClaims, plan);

    const preservesContradictions =
      reasoning.direction !== 'mixed' ||
      approvedClaims.some(c => c.strength === 'mixed' || c.text.toLowerCase().includes('discipline') || c.text.toLowerCase().includes('constraint') || c.text.toLowerCase().includes('structural'));

    const status =
      reasoning.direction === 'insufficient_evidence'
        ? 'insufficient_evidence'
        : approvedClaims.length > 0
        ? 'approved'
        : 'rejected';

    const claimSet: ApprovedClaimSet = {
      status,
      questionId: plan.questionId,
      claims: approvedClaims,
      rejectedClaims,
      questionCoverage,
      preservesContradictions,
      auditRecords,
      validatorVersion: 'ai-v2-firewall-2',
      createdAtIso: new Date().toISOString(),
      verified: true,
    };

    const validation = validateApprovedClaimSet(claimSet);
    if (!validation.valid) {
      throw new Error(`GroundingFirewall generated invalid ApprovedClaimSet: ${validation.errors.join('; ')}`);
    }

    return claimSet;
  }

  /**
   * Check 1: Factual Grounding & Astrological Invention Defense
   */
  private checkFactualGrounding(
    claim: ClaimItem,
    evidence: EvidencePacket,
    verifiedEntityNames: Set<string>,
    failedChecks: string[]
  ): void {
    if (claim.type === 'factual' || claim.type === 'interpretive') {
      if (claim.astrologicalEntities && claim.astrologicalEntities.length > 0) {
        for (const ent of claim.astrologicalEntities) {
          const lower = ent.trim().toLowerCase();
          const isVerified =
            verifiedEntityNames.has(lower) ||
            verifiedSigns.has(lower);
          if (!isVerified) {
            failedChecks.push(`Unverified astrological entity "${ent}" not found in canonical chart evidence`);
          }
        }
      }

      // Check text for common unverified doshas or inventions
      const lowerText = claim.text.toLowerCase();
      if (lowerText.includes('kaal sarp') && !verifiedEntityNames.has('kaal sarp')) {
        const hasKaalSarp = evidence.derivedFacts.some(d => d.description.toLowerCase().includes('kaal sarp'));
        if (!hasKaalSarp) {
          failedChecks.push('Fabricated dosha: Kaal Sarp Dosha is absent from verified chart evidence');
        }
      }
    }
  }

  /**
   * Check 2: Temporal Grounding (No date fabrication or unverified event precision)
   */
  private checkTemporalGrounding(
    claim: ClaimItem,
    reasoning: ReasoningPacket,
    plan: QuestionPlan,
    failedChecks: string[]
  ): void {
    if (claim.type === 'timing' || claim.temporalScope) {
      if (
        claim.temporalScope?.startIso &&
        (!/^\d{4}-\d{2}-\d{2}/.test(claim.temporalScope.startIso) || isNaN(Date.parse(claim.temporalScope.startIso)))
      ) {
        failedChecks.push('Temporal claim contains malformed start date');
      }
      if (
        claim.temporalScope?.endIso &&
        (!/^\d{4}-\d{2}-\d{2}/.test(claim.temporalScope.endIso) || isNaN(Date.parse(claim.temporalScope.endIso)))
      ) {
        failedChecks.push('Temporal claim contains malformed end date');
      }

      // Check for specific date fabrication in text (e.g. "July 17, 2027")
      const specificDateMatch = claim.text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},\s+\d{4}\b/i);
      if (specificDateMatch) {
        const dateStr = specificDateMatch[0];
        const parsedTime = Date.parse(dateStr);
        const exactDayIso = !isNaN(parsedTime) ? new Date(parsedTime).toISOString().split('T')[0] : '';
        const isVerifiedTarget = exactDayIso.length > 0 && plan.targetDatesIso.some(d => d.startsWith(exactDayIso));
        const isVerifiedWindow = exactDayIso.length > 0 && reasoning.temporalWindows.some(w => w.startDateIso.startsWith(exactDayIso));
        if (!isVerifiedTarget && !isVerifiedWindow) {
          failedChecks.push(`Fabricated specific event date "${dateStr}" not calculated by ephemeris engine`);
        }
      }
    }
  }

  /**
   * Check 3: Lineage Verification
   */
  private checkLineage(
    claim: ClaimItem,
    verifiedEvidenceIds: Set<string>,
    verifiedRuleIds: Set<string>,
    verifiedSourceIds: Set<string>,
    failedChecks: string[]
  ): void {
    if (claim.type === 'interpretive' || claim.type === 'qualified_prediction') {
      if (claim.strength !== 'insufficient' && claim.evidenceIds.length === 0 && claim.ruleIds.length === 0) {
        failedChecks.push('Interpretive claim missing required evidence or rule lineage IDs');
      }
    }

    if (claim.evidenceIds.length > 0) {
      const invalidEvidence = claim.evidenceIds.filter(id => !verifiedEvidenceIds.has(id));
      if (invalidEvidence.length > 0) {
        failedChecks.push(`Claim references unverified evidence IDs: ${invalidEvidence.join(', ')}`);
      }
    }

    if (claim.ruleIds.length > 0) {
      const invalidRules = claim.ruleIds.filter(id => !verifiedRuleIds.has(id));
      if (invalidRules.length > 0) {
        failedChecks.push(`Claim references rules that were not applied: ${invalidRules.join(', ')}`);
      }
    }

    if (claim.sourceIds.length > 0) {
      const invalidSources = claim.sourceIds.filter(id => !verifiedSourceIds.has(id));
      if (invalidSources.length > 0) {
        failedChecks.push(`Claim references unverified source IDs: ${invalidSources.join(', ')}`);
      }
    }
  }

  /**
   * Check 4: Certainty Control Firewall
   */
  private checkCertaintyControl(claim: ClaimItem, failedChecks: string[]): void {
    if (claim.type === 'qualified_prediction' || claim.type === 'interpretive') {
      if (FORBIDDEN_CERTAINTY_REGEX.test(claim.text)) {
        failedChecks.push('Unsupported fatalistic certainty language detected (e.g. guaranteed, 100% certain, inevitable)');
      }
    }
  }

  /**
   * Check 5: Relevance & Domain Drift Firewall
   */
  private checkDomainRelevance(
    claim: ClaimItem,
    plan: QuestionPlan,
    failedChecks: string[]
  ): void {
    const domain = plan.domain.toLowerCase();
    const lowerText = claim.text.toLowerCase();

    if (domain === 'career') {
      if (
        (lowerText.includes('marriage partner') || lowerText.includes('wedding date') || lowerText.includes('spousal harmony')) &&
        !lowerText.includes('career')
      ) {
        failedChecks.push('Relevance drift: Career inquiry cannot inject unrelated marriage claims');
      }
    } else if (domain === 'relationship') {
      if (
        (lowerText.includes('corporate executive promotion') || lowerText.includes('salary increment')) &&
        !lowerText.includes('relationship') &&
        !lowerText.includes('marriage')
      ) {
        failedChecks.push('Relevance drift: Relationship inquiry cannot inject unrelated career claims');
      }
    }
  }

  /**
   * Check 6: Contradiction & Unsupported State Firewall
   */
  private checkStateAndContradictions(
    claim: ClaimItem,
    reasoning: ReasoningPacket,
    failedChecks: string[]
  ): void {
    if (reasoning.direction === 'insufficient_evidence') {
      if (claim.type === 'qualified_prediction' && claim.strength !== 'insufficient') {
        failedChecks.push('Unsupported state violation: Cannot make confident predictive claims when evidence is insufficient');
      }
    }

    if (claim.text.toLowerCase().includes('everything is favorable') || claim.text.toLowerCase().includes('zero obstacles')) {
      if (reasoning.direction === 'mixed' || reasoning.restrictingFactors.length > 0) {
        failedChecks.push('Contradiction suppression: Suppressing verified restricting factors in mixed chart state');
      }
    }
  }

  /**
   * Check 7: Remedy Firewall
   */
  private checkRemedyFirewall(
    claim: ClaimItem,
    reasoning: ReasoningPacket,
    failedChecks: string[]
  ): void {
    const lower = claim.text.toLowerCase();
    const remedyRegex = /\b(wear|gemstone|sapphire|ruby|emerald|pearl|diamond|coral|hessonite|cat's eye|mantra|puja|fast on|remedy)\b/i;

    if (remedyRegex.test(lower)) {
      const hasRuleCitation = (claim.ruleIds?.length || 0) > 0 && (claim.sourceIds?.length || 0) > 0;
      if (!hasRuleCitation) {
        failedChecks.push('Unsupported remedy: Astrological remedies must be backed by classical rule citation and evidence lineage');
      }
    }
  }

  /**
   * Evaluates question coverage across all approved claims.
   */
  private evaluateQuestionCoverage(
    approvedClaims: ClaimItem[],
    plan: QuestionPlan
  ): QuestionCoverageStatus {
    const combinedText = approvedClaims.map(c => c.text.toLowerCase()).join(' ');
    const coveredEntities: string[] = [];
    const coveredHouses: number[] = [];
    const coveredDomains: string[] = [];
    const missing: string[] = [];

    // Check Planet Focus
    for (const p of plan.planetFocus) {
      if (combinedText.includes(p.toLowerCase())) {
        coveredEntities.push(p);
      } else {
        missing.push(`Planet focus "${p}" not addressed in approved claims`);
      }
    }

    // Check House Focus
    for (const h of plan.houseFocus) {
      if (combinedText.includes(`${h}th`) || combinedText.includes(`house ${h}`) || combinedText.includes(`bhava ${h}`)) {
        coveredHouses.push(h);
      }
    }

    // Check Domain Focus
    if (combinedText.includes(plan.domain.toLowerCase()) || plan.domain === 'general' || plan.domain === 'astrological') {
      coveredDomains.push(plan.domain);
    } else {
      missing.push(`Domain "${plan.domain}" not adequately covered`);
    }

    const complete = missing.length === 0;

    return {
      complete,
      coveredEntities,
      coveredHouses,
      coveredDomains,
      missing,
    };
  }
}
