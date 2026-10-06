      primaryFactors,
      supportingFactors,
      restrictingFactors,
      conflictingFactors,
      irrelevantFactors,
      appliedRules,
      confluence,
      temporalWindows,
      unresolvedQuestions: plan.ambiguities || [],
      evidenceLineage,
      ruleLineage,
      sourceLineage,
      coverageStatus,
      confidence,
      auditTrace,
      version: 'ai-v2-reasoning-1',
      createdAtIso: new Date().toISOString(),
      verified: true,
    };

    const validation = validateReasoningPacket(reasoningPacket);
    if (!validation.valid) {
      throw new Error(`AstrologyReasoner generated invalid ReasoningPacket: ${validation.errors.join('; ')}`);
    }

    return reasoningPacket;
  }

  /**
   * Classifies verified evidence factors into domain-aligned categories.
   */
  private classifyFactors(
    plan: QuestionPlan,
    evidence: EvidencePacket
  ): {
    primaryFactors: ClassifiedFactor[];
    supportingFactors: ClassifiedFactor[];
    restrictingFactors: ClassifiedFactor[];
    conflictingFactors: ClassifiedFactor[];
    irrelevantFactors: ClassifiedFactor[];
  } {
    const primaryFactors: ClassifiedFactor[] = [];
    const supportingFactors: ClassifiedFactor[] = [];
    const restrictingFactors: ClassifiedFactor[] = [];
    const conflictingFactors: ClassifiedFactor[] = [];
    const irrelevantFactors: ClassifiedFactor[] = [];

    const domain = plan.domain.toLowerCase();

    for (const fact of evidence.facts) {
      const isPlanetFocus = plan.planetFocus.some(p => p.toLowerCase() === fact.entity.toLowerCase());
      const isHouseFocus = plan.houseFocus.includes(fact.house || 0);

      // A. Career Domain Classification
      if (domain === 'career') {
        if (
          fact.house === 10 ||
          fact.house === 6 ||
          fact.category === 'varga' ||
          isPlanetFocus ||
          fact.entity === 'Sun' ||
          fact.entity === 'Saturn'
        ) {
          if (fact.dignity === 'DEBILITATED') {
            restrictingFactors.push(this.createFactor(fact, 'restricting', 'high', 'Debilitation indicates discipline/challenge'));
          } else {
            primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct career house or authority karaka'));
          }
        } else if (fact.category === 'dasha' || fact.category === 'transit') {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Active timing activation'));
        } else if (fact.house === 7 || fact.entity === 'Venus') {
          irrelevantFactors.push(this.createFactor(fact, 'irrelevant', 'irrelevant', 'Marriage/relational factor not primary for career inquiry'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'background', 'low', 'General chart background factor'));
        }
      }

      // B. Relationship / Marriage Domain Classification
      else if (domain === 'relationship') {
        if (
          fact.house === 7 ||
          fact.house === 2 ||
          fact.category === 'jaimini' ||
          fact.entity === 'Venus' ||
          fact.entity === 'Jupiter' ||
          isPlanetFocus
        ) {
          if (fact.dignity === 'DEBILITATED') {
            restrictingFactors.push(this.createFactor(fact, 'restricting', 'high', 'Relational factor in debilitation requires mindfulness'));
          } else {
            primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct 7th house / matrimonial significator'));
          }
        } else if (fact.category === 'dasha' || fact.category === 'varga') {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Navamsha or dasha alignment'));
        } else if (fact.house === 10 || fact.house === 6) {
          irrelevantFactors.push(this.createFactor(fact, 'irrelevant', 'irrelevant', 'Professional factor not relevant to relationship query'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'background', 'low', 'General chart background'));
        }
      }

      // C. Finance / Wealth Domain Classification
      else if (domain === 'finance') {
        if (fact.house === 2 || fact.house === 11 || fact.category === 'ashtakavarga' || isPlanetFocus) {
          primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct wealth / gains bhava or SAV matrix'));
        } else if (fact.category === 'dasha' || fact.category === 'natal') {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Supporting chart disposition'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'background', 'low', 'Background factor'));
        }
      }

      // D. General / Timing Classification
      else {
        const isLagnaFocus =
          (plan.rawQuestion.toLowerCase().includes('lagna') || plan.rawQuestion.toLowerCase().includes('ascendant')) &&
          (fact.entity.toLowerCase().includes('lagna') || fact.entity.toLowerCase().includes('ascendant'));

        if (isPlanetFocus || isLagnaFocus || fact.category === 'dasha' || fact.category === 'transit') {
          primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct focus of user inquiry'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Supporting placement'));
        }
      }
    }

    // Process Derived Facts (Yogas)
    for (const derived of evidence.derivedFacts) {
      if (derived.type === 'Yoga') {
        primaryFactors.push({
          id: derived.id,
          entity: derived.description,
          property: 'classical_yoga',
          value: derived.ruleCitation || 'Brihat Parashara Hora Shastra',
          role: 'primary',
          relevance: 'high',
          rationale: 'Classical combination verified in the deterministic rule engine',
          sourceTool: derived.sourceTool,
          evidenceId: derived.id,
          weight: 1.0,
        });
      }
    }

    return {
      primaryFactors,
      supportingFactors,
      restrictingFactors,
      conflictingFactors,
      irrelevantFactors,
    };
  }

  private createFactor(
    fact: FactItem,
    role: FactorRole,
    relevance: FactorRelevance,
    rationale: string
  ): ClassifiedFactor {
    const roleWeight: Record<FactorRole, number> = {
      primary: 1.0,
      supporting: 0.65,
      restricting: 1.0,
      conflicting: 1.0,
      background: 0.2,
      irrelevant: 0,
    };
    const relevanceWeight: Record<FactorRelevance, number> = {
      high: 1.0,
      medium: 0.7,
      low: 0.35,
      irrelevant: 0,
    };

    return {
      id: `factor_${fact.id}`,
      entity: fact.entity,
      property: fact.property,