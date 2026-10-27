import { VargaCode } from '../../../../shared/index.ts';


export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export const ASTROLOGY_TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  get_birth_chart: {
    name: 'get_birth_chart',
    description:
      'Calculates the full canonical Vedic natal birth chart (D1 Rashi), including precise Ascendant (Lagna), all 9 planetary positions, whole sign houses, sign lords, nakshatras, padas, dignities, and retrograde/combustion states.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth date, time, coordinates, and timezone.',
          properties: {
            year: { type: 'number', description: 'Birth year (e.g. 1995)' },
            month: { type: 'number', description: 'Birth month 1-12' },
            day: { type: 'number', description: 'Birth day 1-31' },
            hour: { type: 'number', description: 'Birth hour 0-23' },
            minute: { type: 'number', description: 'Birth minute 0-59' },
            second: { type: 'number', description: 'Birth second 0-59 (optional)' },
            latitude: { type: 'number', description: 'Birth latitude in decimal degrees' },
            longitude: { type: 'number', description: 'Birth longitude in decimal degrees' },
            timezone: { type: 'string', description: 'IANA Timezone (e.g. "Asia/Kolkata")' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_divisional_chart: {
    name: 'get_divisional_chart',
    description:
      'Calculates a specific Shodashavarga harmonic division chart (e.g. D9 Navamsha for marriage/dharma, D10 Dashamsha for career/status, D7 Saptamsha, D60 Shashtiamsha).',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
        vargaCode: {
          type: 'string',
          enum: ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'],
          description: 'The Varga code to generate (e.g. "D9", "D10", "D7").',
        },
      },
      required: ['birthProfile', 'vargaCode'],
    },
  },

  get_all_divisional_charts: {
    name: 'get_all_divisional_charts',
    description:
      'Calculates the complete classical Shodashavarga harmonic division matrix (all 16 divisional charts: D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60) in a single unified calculation.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_current_dasha: {
    name: 'get_current_dasha',
    description:
      'Calculates the active 120-year Parashari Vimshottari Dasha hierarchy (Mahadasha, Antardasha, and Pratyantardasha) as of today, plus balance of dasha at birth.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_dasha_at: {
    name: 'get_dasha_at',
    description:
      'Calculates the exact active Vimshottari Mahadasha, Antardasha, and Pratyantardasha ruling over a past or future target evaluation date (e.g. for event timing analysis).',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
        targetDateIso: {
          type: 'string',
          description: 'ISO-8601 target date string (e.g. "2027-03-15T00:00:00Z") to evaluate active Dasha lords.',
        },
      },
      required: ['birthProfile', 'targetDateIso'],
    },
  },

  get_transits: {
    name: 'get_transits',
    description:
      'Calculates Gochara (planetary transit) positions for a target date, including house from Lagna and Moon, planetary aspects to natal planets, Ashtakavarga bindus, and Sade Sati phase status.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
        targetDateIso: {
          type: 'string',
          description: 'Optional ISO date for transit calculation (defaults to current date).',
        },
      },
      required: ['birthProfile'],
    },
  },

  get_active_yogas: {
    name: 'get_active_yogas',
    description:
      'Deterministically detects classical Raja Yogas, Dhana Yogas, Mahapurusha Yogas, Nabhasa Yogas, and Doshas (Manglik, Kaal Sarp) present in the native chart.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_planetary_strength: {
    name: 'get_planetary_strength',
    description:
      'Calculates Shadbala (six-fold strength in virupas and rupas: Sthana, Dig, Kala, Chesta, Naisargika, Drik bala) and Bhava Bala metrics.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_ashtakavarga: {
    name: 'get_ashtakavarga',
    description:
      'Calculates Bhinnashtakavarga (BAV) for all 7 classical planets and the 337-point Samudayashtakavarga (SAV) distribution across all 12 signs and houses.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_jaimini_details: {
    name: 'get_jaimini_details',
    description:
      'Calculates Jaimini Chara Karakas (Atmakaraka AK, Amatyakaraka AmK, Bhratri BK, Matri MK, Putra PK, Gnati GK, Dara DK), Karakamsa sign in D9, and Arudha Lagna (AL).',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_panchanga: {
    name: 'get_panchanga',
    description:
      'Calculates the 5 limbs of Vedic time (Pancha-Anga: Tithi, Vara, Nakshatra, Yoga, Karana) for the native birth or live real-time moment.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            second: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  web_search: {
    name: 'web_search',
    description:
      'Searches the live web via Gemini Google Search grounding for worldly facts, current events, festival dates, muhurta references, or general knowledge. NEVER use for natal placements, dasha timing, or personal predictive chart dates — those must come from the astrology engine tools.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'A specific factual search query (e.g. "Vedic festival dates 2027", "Kumbh Mela 2025 dates", "eclipse dates 2026").',
        },
      },
      required: ['query'],
    },
  },

  scan_precision_timing: {
    name: 'scan_precision_timing',
    description:
      'Scans a date range day-by-day computing transits + dasha at each sample, scores each sample against classical Vedic rules, and merges consecutive high-scoring samples into EXACT dated windows (start date → end date) with scores. Use this when the user asks "when", "best window", "timing", "near dates", "this year", "next month", or any future timeframe. Returns precise date ranges, not vague "soon" answers.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
        domain: {
          type: 'string',
          enum: ['career', 'relationship', 'finance', 'health', 'education', 'children', 'general'],
          description: 'The life domain to scan for favorable timing windows.',
        },
        startIso: {
          type: 'string',
          description: 'Start of scan window (ISO-8601, e.g. "2026-10-20T00:00:00Z").',
        },
        endIso: {
          type: 'string',
          description: 'End of scan window (ISO-8601, e.g. "2026-12-31T23:59:59Z").',
        },
        stepDays: {
          type: 'number',
          description: 'Days between samples. Default 3 for balance of precision vs speed.',
        },
      },
      required: ['birthProfile', 'domain', 'startIso', 'endIso'],
    },
  },

  get_chalit_chart: {
    name: 'get_chalit_chart',
    description:
      'Calculates Sripathi Bhava Chalit chart (12 Bhava Madhyas/cusps, 12 Bhava Sandhis/junctions, actual operational house for each planet, house shifts relative to D1 Rashi, and Awasiya/Residential strength in shashtiamsha). Use to see if planets shift houses in Chalit.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },

  get_upgrahas: {
    name: 'get_upgrahas',
    description:
      'Calculates classical Upgrahas / sensitive tertiary points: Sun-derived (Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu) and Time-derived (Gulika, Mandi, Kala, Mrityu, Ardhaprahara, Yamaghantaka). Essential for detecting hidden arishta, sudden shocks, and karmic burdens.',
    parameters: {
      type: 'object',
      properties: {
        birthProfile: {
          type: 'object',
          description: 'The native birth details.',
          properties: {
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' },
          },
          required: ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'],
        },
      },
      required: ['birthProfile'],
    },
  },
};
