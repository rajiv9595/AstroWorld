---
description: Canonical standards for Vedic Astrology dignity calculation, Shodashavarga division rules, and interactive date/time UX.
---

# Vedic Astrology Dignity & Shodashavarga Calculation Invariants

## 1. Divisional Chart Dignity Independence (Shodashavargas)
- In all divisional charts (**D2 through D60**), evaluate planetary dignity based on the planet's placement in the **Varga Rashi (Sign)**.
- Do not apply physical D1 degree-zone restrictions (e.g. Moon > 3° Taurus = Moolatrikona) to harmonic divisional signs.
- **Moon in Taurus** in any divisional chart (D10, D9, D60, etc.) evaluates as **`EXALTED` (Uchcha)**.

## 2. Canonical Dignity Hierarchy
- Always evaluate **Debilitation** and **Exaltation** before Moolatrikona.
- For **Mercury in D1 Virgo**, evaluate the classical 3-zone split:
  - `0.0° - 15.0°`: **`EXALTED`** (Paramochcha at 15°)
  - `15.0° - 20.0°`: **`MOOLATRIKONA`**
  - `20.0° - 30.0°`: **`OWN_SIGN`** (Swakshetra)
- For **Sun**, **Mars**, **Jupiter**, **Venus**, **Saturn**:
  - Evaluate Moolatrikona zone boundaries in D1 (Leo 0–20°, Aries 0–12°, Sagittarius 0–10°, Libra 0–15°, Aquarius 0–20°), beyond which they transition to **`OWN_SIGN`**.

## 3. Unified Single Source of Truth
- The same canonical dignity fact object must feed the Web UI, PDF Reports, and AI interpretations without diverging or reinterpreting labels.

## 4. Interactive Date & Time Picker UX Standards
- Avoid fragmented, separate numeric text boxes that cause cognitive clutter.
- Use unified single-bar interactive cards with instant popover calendars (covering years 1900–2030+ and months Jan–Dec) and clean 12h AM/PM time selectors.
