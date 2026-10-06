          entity: `${data.vargaCode} Lagna`,
          property: 'sign',
          value: data.ascendantSign,
          sign: data.ascendantSign,
          house: 1,
          degree: 0,
          sourceTool: toolName,
          verified: true,
        });
      }

      const vargaPlanets = data.planets || [];
      for (const p of vargaPlanets) {
        facts.push({
          id: `fact_${data.vargaCode}_${(p.planet || '').toLowerCase()}_${Date.now()}`,
          category: 'varga',
          entity: `${p.planet} in ${data.vargaCode}`,
          property: 'varga_sign',
          value: `${p.vargaSign} (House ${p.houseNumber})`,
          sign: p.vargaSign,
          house: p.houseNumber,
          dignity: p.dignity,
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_current_dasha' || toolName === 'get_dasha_at') {
      const lords = data.activeLords;
      if (lords) {
        facts.push({
          id: `fact_dasha_${Date.now()}`,
          category: 'dasha',
          entity: 'Vimshottari Dasha',
          property: 'active_periods',
          value: `${lords.mahadasha} - ${lords.antardasha} - ${lords.pratyantardasha || ''}`.trim(),
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    const yogasList = Array.isArray(data.yogas) ? data.yogas : Array.isArray(data.activeYogas) ? data.activeYogas : [];
    if (toolName === 'get_active_yogas' && Array.isArray(yogasList)) {
      for (const y of yogasList) {
        derivedFacts.push({
          id: `yoga_${(y.name || '').toLowerCase().replace(/\s+/g, '_')}`,
          type: 'Yoga',
          ruleCitation: y.citation || 'Brihat Parashara Hora Shastra',
          participatingPlanets: y.planetsInvolved,
          participatingHouses: y.housesInvolved,
          description: y.description || y.name,
          sourceTool: toolName,
          verified: true,
        });
      }

      const gajaPresent = yogasList.some(
        (y: any) => String(y?.id || y?.name || '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '')
          .replace(/^yoga/, '')
          .replace(/yoga$/, '') === 'gajakesari',
      );

      // Preserve an explicit, auditable negative result rather than asking the
      // reasoning layer to infer absence from missing positive derived facts.
      if (!gajaPresent) {
        derivedFacts.push({
          id: 'yoga_gajakesari_absence',
          type: 'Yoga',
          ruleCitation: 'BPHS, Gajakesari Yoga Kendra-from-Moon prerequisite',
          description: 'Gajakesari Yoga absent: verified yoga engine returned no qualifying Gajakesari formation.',
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_jaimini_details') {
      if (data.atmakaraka) {
        facts.push({
          id: `fact_ak_${Date.now()}`,
          category: 'jaimini',
          entity: 'Atmakaraka (AK)',
          property: 'graha',
          value: data.atmakaraka.graha,
          sign: data.atmakaraka.sign,
          sourceTool: toolName,
          verified: true,
        });
      }
      if (data.karakamsa) {
        facts.push({
          id: `fact_karakamsa_${Date.now()}`,
          category: 'jaimini',
          entity: 'Karakamsa',
          property: 'sign',
          value: data.karakamsa.sign,
          sign: data.karakamsa.sign,
          sourceTool: toolName,
          verified: true,
        });
      }
    }

    if (toolName === 'get_ashtakavarga' && data.sarvashtakavarga) {
      facts.push({
        id: `fact_sav_total_${Date.now()}`,
        category: 'ashtakavarga',
        entity: 'Sarvashtakavarga',