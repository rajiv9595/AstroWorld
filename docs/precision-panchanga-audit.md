# AstroWorld Precision & Panchanga Audit

## Purpose
A full independent audit was performed across astronomy, Panchanga, Vargas, Vimshottari Dasha, transits, yogas, and AI grounding.
AstroWorld distinguishes astronomical facts, Panchanga computation rules, Jyotisha school conventions, and interpretation.

## Independent reference set
1. Swiss Ephemeris official documentation — Lahiri/Chitrapaksha sidereal calculations. https://www.astro.com/swisseph/swisseph.htm
2. Astronomy Engine — Don Cross open-source astronomical library. https://github.com/cosinekitty/astronomy
3. Astronomy Engine JavaScript API documentation. https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md
4. Astronomy Engine AstroTime API. https://github.com/cosinekitty/astronomy/blob/master/source/js/astronomy.d.ts
5. Drik Panchang — 17 Aug 2005 historical Panchanga, Naihati, West Bengal.
6. Drik Panchang — 17 Aug 2005 historical Panchanga / regional calendar, Tirumala, Andhra Pradesh.
7. Drik Panchang — Rahu Kaal methodology.
8. Drik Panchang — Abhijit Muhurat methodology.
9. Drik Panchang — historical Panchanga day/tithi/nakshatra/karana methodology.
10. Vidhyamitra — 17 Aug 2005 Tirumala Panchanga using an explicitly declared Surya-Siddhanta-derived substrate.
11. Prasna Marga, B. V. Raman / related editions — Amrita-ghatika and Vishaghati tables.
12. StudyRes transcription of Prasna Marga — Muhurta and Amrita-ghatika methodology.
13. Brihat Parashara Hora Shastra — Shodashavarga chapter.
14. Uttara Kalamrita — Viparita Raja Yoga references.
15. Jagannatha Hora — D10 Dasamsa construction.
16. Jagannatha Hora — D16 Shodasamsa construction.
17. DesiUtils — D7 Saptamsa construction.
18. DesiUtils — D16 Shodasamsa construction.
19. DesiUtils — D40 Khavedamsa construction.
20. DesiUtils — D45 Akshavedamsa construction.
21. DesiUtils — D60 Shashtiamsa construction and convention notes.
22. Parasara Jyotish — D30 Trimsamsa construction.
23. Parasara Jyotish — D60 Shashtiamsa construction.
24. Hindu Calculator — D30 unequal-band construction.
25. SIA Vigyan — D30 construction notes.
26. Astro-Seek — Shodashavarga calculator and division inventory.
27. OpenFate — D24 Chaturvimshamsa construction.
28. Times of India — divisional-chart usage overview.
29. Jagannatha Hora — Shadbala calculator and six-component framework.
30. Saravali — Sthana Bala component tables.
31. AstroCentral — detailed Shadbala component formulas.
32. JyotiPy — Saptavargaja Bala compound-relationship implementation and convention notes.
33. Vedaksha Vedic — open-source Shadbala component implementations and coverage notes.
34. Ashtakavarga System of Prediction reference tables — fixed BAV totals and contributor matrix.
35. DesiUtils — Ashtakavarga calculator and standard Parashari tables.
36. AstroShruti — Ashtakavarga fixed totals and Chara Karaka methodology.
37. DesiUtils — Karakamsha calculation and 7-vs-8 Chara Karaka convention notes.
38. OpenFate — seven-vs-eight Chara Karaka comparison and Rahu reversal convention.

## Canonical astronomical benchmark
Input: 17 Aug 2005, 00:02 IST, Anaparthy, Andhra Pradesh, India.
Latitude 16.93407, longitude 81.95522.
Reference: Swiss Ephemeris 2.10.03, Lahiri/Chitrapaksha, mean lunar node.

Lahiri ayanamsha: 23.93565836563647°
Ascendant: 39.95620244441955°
Sun: 120.04284066208803°
Moon: 257.8637656115666°
Mars: 16.59405768925442°
Mercury: 104.84054007297352°
Jupiter: 171.84362377517226°
Venus: 155.6427499901487°
Saturn: 100.06349180994296°
Rahu: 352.32741227614775°
Ketu: 172.3274122761477°

## Panchanga benchmark
Using the exact Swiss-Lahiri longitudes at the birth instant:
- Shukla Dwadashi (Tithi 12)
- Wednesday / Budhavara
- Purva Ashadha
- Pada 2
- Priti Yoga
- Bava Karana

The external Panchanga comparison agrees on Wednesday, Shukla Dwadashi, Purva Ashadha and Priti, but some sources report a different Moon longitude/pada because they use a different astronomical substrate or calculation convention. AstroWorld keeps the Swiss-Lahiri astronomical basis explicit rather than forcing every Panchanga source to match.

## Ashtakavarga audit
The published Parashari contributor matrix was independently reconstructed outside the TypeScript implementation.
The AstroWorld matrix matches the reference cell-for-cell. Fixed BAV totals are Sun 48, Moon 49, Mars 39, Mercury 54,
Jupiter 56, Venus 52 and Saturn 39; the combined SAV total is 337. Rahu/Ketu are excluded from the classical 337-bindu system.
For the canonical benchmark, the independently reconstructed SAV vector is [26,39,26,32,23,24,30,23,24,25,36,29].

## Jaimini conventions
AstroWorld currently exposes the 7-karaka scheme as its primary result: Sun through Saturn, excluding Rahu and Ketu.
Karakas are ranked by degree within sign, descending, with a fixed canonical planet order used only to make exact ties deterministic.
The 8-karaka school that includes Rahu with reversed within-sign degree is documented as a separate convention rather than silently mixed.
Karakamsa is the D9 sign occupied by the Atmakaraka; AL/UL use the classical raw-pada exception when the result falls in the source sign or its 7th.

## Shadbala coverage
The audit found that the previous AstroWorld Shadbala was too approximate to be presented as a full BPHS six-fold score.
It now implements the classical Sthana sub-components Uchcha, Saptavargaja, Oja-Yugma, Kendradi and Drekkana,
plus improved Dig, Naisargika and discrete Drik calculations. Kala currently includes Nathonnatha and Paksha only,
and Cheshta gives full 60 for retrograde planets but does not guess the remaining direct-motion states.
Tribhaga, Varsha/Masa/Vara/Hora, Ayana, Graha Yuddha and full Bhava Bala still require richer temporal/astronomical inputs.
The API therefore labels Shadbala as `classical_partial`; it must not be narrated as exact BPHS Shadbala.

## Panchanga day-boundary rule
D30 uses Parashari unequal bands: odd 0-5 Mars, 5-10 Saturn, 10-18 Jupiter, 18-25 Mercury, 25-30 Venus; even 0-5 Venus, 5-12 Mercury, 12-20 Jupiter, 20-25 Saturn, 25-30 Mars.
D60 separates occupied-sign mapping from the named amsha sequence: occupied sign uses source-sign-plus-amsha index; named sequence is direct in odd signs and reversed in even signs.

## Defects found and corrected
- Transit Western aspect overlay used transit sign start instead of actual longitude.
- Demo and scientific benchmark identities were conflated.
- Raja Yoga detection was too broad.
- Viparita Yoga detection was too broad.
- Amala Yoga forming planets were hard-coded.
- Nakshatra boundaries used rounded constants.
- Vara could use UTC weekday instead of local civil weekday.
- Sunrise/sunset could fall back to fake fixed times.
- Sunrise/sunset/moonset searches could anchor set events at local midnight and return the previous civil day's event.
- Dur Muhurtam used an arbitrary formula instead of weekday slots.
- Amrit Kaal used a fixed daytime fraction instead of nakshatra-specific Amrita-ghatika.
- Retrograde status used fixed mean speeds.
- Mercury/Venus retrograde-sensitive combustion limits were ignored.
- D30 degree-within-band was incorrect.
- D60 even-sign named amsha reversal was missing.
- AI entity grounding used substring matching.
- AI claims did not fully verify cited rule/source IDs.
- AI reasoning contained chart-specific Gajakesari text.
- AI confluence treated the existence of Varga/transit data as automatically supportive.
- AI confidence relied too heavily on raw factor counts.
- Shadbala was previously a coarse placeholder rather than a classical component calculation.

## Verification suites
npm run test:precision

Includes multi-date astronomical oracles, all 16 Varga golden vectors and boundaries, Vimshottari reference and continuity tests, transit/Sade Sati tests, Panchanga benchmark tests, Ashtakavarga golden vectors, Jaimini golden vectors, and Shadbala component contracts.

## Runtime note
The available GitHub environment cannot execute the repository's complete Node/npm environment. No successful full npm test run is being claimed from the connector. Independent Swiss-Ephemeris vectors were checked locally, and the repository now contains executable verification suites for the repo environment.

## Source principle
Do not present a school-specific Jyotisha convention as universally canonical. Ephemeris, ayanamsha, node model, location, time basis, and tradition should be explicit in computation and provenance.