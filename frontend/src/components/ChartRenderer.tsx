/**
 * ASTROWORLD — Vedic Chart Renderers (North & South Indian formats)
 * Beautiful ivory & warm gold aesthetic with Dynamic Chart Entity Highlighting.
 */

import React from 'react';
import { PlanetName, PlanetPosition, VargaPlanetPlacement } from '../engine/types.ts';
import { ZODIAC_SIGNS } from '../engine/constants.ts';

interface ChartRendererProps {
  ascendantSignIndex: number;
  planets: (PlanetPosition | VargaPlanetPlacement)[];
  chartTitle?: string;
  style?: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
  highlightedHouses?: number[];
  highlightedPlanets?: string[];
  onPlanetClick?: (planet: PlanetName) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  ascendantSignIndex,
  planets,
  chartTitle = 'D1 Rashi Chart',
  style = 'NORTH_INDIAN',
  highlightedHouses = [],
  highlightedPlanets = [],
  onPlanetClick,
}) => {
  // Map planets to their whole sign house (1-12)
  const planetsByHouse: Record<number, { name: PlanetName; text: string; dignity?: string; retro?: boolean }[]> = {};
  for (let h = 1; h <= 12; h++) {
    planetsByHouse[h] = [];
  }

  planets.forEach((p) => {
    const pName = 'planet' in p ? p.planet : p.name;
    const h = p.houseNumber;
    const isRetro = 'retrograde' in p ? p.retrograde : false;
    const dig = p.dignity;
    let label = pName.slice(0, 2);
    if (pName === 'Mercury') label = 'Me';
    if (pName === 'Mars') label = 'Ma';
    if (pName === 'Sun') label = 'Su';
    if (pName === 'Moon') label = 'Mo';
    if (pName === 'Jupiter') label = 'Ju';
    if (pName === 'Venus') label = 'Ve';
    if (pName === 'Saturn') label = 'Sa';
    if (pName === 'Rahu') label = 'Ra';
    if (pName === 'Ketu') label = 'Ke';

    if (planetsByHouse[h]) {
      planetsByHouse[h].push({
        name: pName,
        text: `${label}${isRetro ? '®' : ''}`,
        dignity: dig,
        retro: isRetro,
      });
    }
  });

  const getDignityBadgeClass = (dig?: string, isHighlighted: boolean = false) => {
    if (isHighlighted) {
      return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-amber-600 ring-2 ring-amber-400 font-black shadow-md scale-110';
    }

    switch (dig) {
      case 'EXALTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MOOLATRIKONA':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'OWN_SIGN':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FRIEND':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ENEMY':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'DEBILITATED':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  if (style === 'SOUTH_INDIAN') {
    const gridSignIndices = [
      [11, 0, 1, 2],
      [10, -1, -1, 3],
      [9, -1, -1, 4],
      [8, 7, 6, 5],
    ];

    return (
      <div className="w-full flex flex-col items-center">
        {chartTitle && (
          <div className="text-xs uppercase tracking-wider font-bold text-[#162058] mb-2 font-serif">
            {chartTitle} (South Indian Style)
          </div>
        )}
        <div className="grid grid-cols-4 grid-rows-4 w-72 h-72 sm:w-84 sm:h-84 border-2 border-amber-500 bg-[#FFFDF9] rounded-xl p-1 gap-1 shadow-md">
          {gridSignIndices.flatMap((row, rIdx) =>
            row.map((signIdx, cIdx) => {
              if (signIdx === -1) {
                if (rIdx === 1 && cIdx === 1) {
                  return (
                    <div
                      key={`center-${rIdx}-${cIdx}`}
                      className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-[#FAF6EE] rounded-lg border border-amber-200/80 p-2 text-center"
                    >
                      <span className="text-[11px] font-bold text-amber-700 font-serif uppercase tracking-wider">
                        AstroWorld
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Lagna: {ZODIAC_SIGNS[ascendantSignIndex]}
                      </span>
                    </div>
                  );
                }
                return null;
              }

              const houseNum = ((signIdx - ascendantSignIndex + 12) % 12) + 1;
              const isLagna = signIdx === ascendantSignIndex;
              const isHouseHighlighted = highlightedHouses.includes(houseNum);
              const signPlanets = planetsByHouse[houseNum] || [];

              return (
                <div
                  key={`sign-${signIdx}`}
                  className={`p-1.5 flex flex-col justify-between rounded border transition-all duration-300 ${
                    isHouseHighlighted
                      ? 'border-amber-500 bg-amber-100/90 ring-2 ring-amber-400/80 shadow-xs'
                      : isLagna
                      ? 'border-orange-500 bg-orange-50/50'
                      : 'border-amber-200/70 bg-white hover:bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                    <span className="font-bold text-slate-500">{ZODIAC_SIGNS[signIdx].slice(0, 3)}</span>
                    <span className={`font-bold ${isHouseHighlighted ? 'text-amber-900 font-black' : 'text-amber-800'}`}>
                      H{houseNum}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 my-0.5 justify-center">
                    {signPlanets.map((pl) => {
                      const isPlanetHighlighted = highlightedPlanets.some(
                        (hp) => hp.toLowerCase() === pl.name.toLowerCase()
                      );
                      return (
                        <span
                          key={pl.name}
                          onClick={() => onPlanetClick?.(pl.name)}
                          className={`text-[9px] px-1 py-0.2 rounded border font-semibold cursor-pointer transition-transform ${getDignityBadgeClass(pl.dignity, isPlanetHighlighted)}`}
                        >
                          {pl.text}
                        </span>
                      );
                    })}
                    {isLagna && (
                      <span className="text-[8px] font-black px-1 rounded bg-orange-500 text-white">
                        ASC
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // North Indian Diamond Layout
  const getHouseSignIndex = (houseNumber: number) => {
    return (ascendantSignIndex + houseNumber - 1) % 12;
  };

  const houseCenters: Record<number, { x: number; y: number; signPos: { x: number; y: number } }> = {
    1: { x: 200, y: 105, signPos: { x: 200, y: 155 } },
    2: { x: 100, y: 44, signPos: { x: 135, y: 80 } },
    3: { x: 44, y: 100, signPos: { x: 80, y: 135 } },
    4: { x: 105, y: 200, signPos: { x: 155, y: 200 } },
    5: { x: 44, y: 300, signPos: { x: 80, y: 265 } },
    6: { x: 100, y: 356, signPos: { x: 135, y: 320 } },
    7: { x: 200, y: 295, signPos: { x: 200, y: 245 } },
    8: { x: 300, y: 356, signPos: { x: 265, y: 320 } },
    9: { x: 356, y: 300, signPos: { x: 320, y: 265 } },
    10: { x: 295, y: 200, signPos: { x: 245, y: 200 } },
    11: { x: 356, y: 100, signPos: { x: 320, y: 135 } },
    12: { x: 300, y: 44, signPos: { x: 265, y: 80 } },
  };

  // SVG Polygons for each House in North Indian Diamond Chart
  const housePolygons: Record<number, string> = {
    1: '200,0 300,100 200,200 100,100',
    2: '100,100 200,0 0,0',
    3: '0,0 100,100 0,200',
    4: '100,100 200,200 100,300 0,200',
    5: '0,200 100,300 0,400',
    6: '100,300 200,400 0,400',
    7: '100,300 200,200 300,300 200,400',
    8: '200,400 300,300 400,400',
    9: '300,300 400,200 400,400',
    10: '300,100 400,200 300,300 200,200',
    11: '300,100 400,0 400,200',
    12: '200,0 300,100 400,0',
  };

  return (
    <div className="w-full flex flex-col items-center">
      {chartTitle && (
        <div className="text-xs uppercase tracking-wider font-bold text-[#162058] mb-2 font-serif">
          {chartTitle} (North Indian Diamond Style)
        </div>
      )}

      <div className="relative w-72 h-72 sm:w-84 sm:h-84 select-none">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-md rounded-2xl bg-[#FFFDF9] border-2 border-amber-400"
        >
          {/* Subtle Outer Frame */}
          <rect x="4" y="4" width="392" height="392" fill="none" stroke="#F59E0B" strokeWidth="2" rx="12" />
          <rect x="8" y="8" width="384" height="384" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" rx="8" />

          {/* Highlighted House Shading */}
          {highlightedHouses.map((h) => {
            const poly = housePolygons[h];
            if (!poly) return null;
            return (
              <polygon
                key={`highlight-h-${h}`}
                points={poly}
                fill="rgba(245, 158, 11, 0.22)"
                stroke="#F59E0B"
                strokeWidth="2.5"
                className="animate-pulse"
              />
            );
          })}

          {/* Diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" stroke="#D97706" strokeWidth="1.8" />
          <line x1="0" y1="400" x2="400" y2="0" stroke="#D97706" strokeWidth="1.8" />

          {/* Inner Diamond */}
          <polygon
            points="200,0 400,200 200,400 0,200"
            fill="none"
            stroke="#D97706"
            strokeWidth="1.8"
          />

          {/* House 1 Lagna Tag */}
          <text
            x="200"
            y="52"
            textAnchor="middle"
            fill="#EA580C"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="0.08em"
          >
            LAGNA (ASC)
          </text>

          {/* Zodiac Sign Numbers in each House */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const pos = houseCenters[h].signPos;
            const signNum = getHouseSignIndex(h) + 1;
            const isHighlighted = highlightedHouses.includes(h);

            return (
              <text
                key={`sign-num-${h}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isHighlighted ? '#B45309' : '#94A3B8'}
                fontSize={isHighlighted ? '11' : '10'}
                fontWeight={isHighlighted ? '900' : 'bold'}
                fontFamily="monospace"
              >
                {signNum}
              </text>
            );
          })}
        </svg>

        {/* Planet Badges Overlaid onto each House Center */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
          const pos = houseCenters[h];
          const hPlanets = planetsByHouse[h] || [];
          if (hPlanets.length === 0) return null;

          const isKendra = [1, 4, 7, 10].includes(h);

          return (
            <div
              key={`h-planets-${h}`}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-wrap gap-1 items-center justify-center pointer-events-auto ${
                isKendra ? 'max-w-[90px]' : 'max-w-[68px]'
              }`}
              style={{
                left: `${(pos.x / 400) * 100}%`,
                top: `${(pos.y / 400) * 100}%`,
              }}
            >
              {hPlanets.map((pl) => {
                const isPlanetHighlighted = highlightedPlanets.some(
                  (hp) => hp.toLowerCase() === pl.name.toLowerCase()
                );

                return (
                  <button
                    key={pl.name}
                    onClick={() => onPlanetClick?.(pl.name)}
                    title={`${pl.name} in H${h} (${pl.dignity || 'Neutral'})`}
                    className={`px-1 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-bold border shadow-xs transition-all hover:scale-110 leading-none ${getDignityBadgeClass(pl.dignity, isPlanetHighlighted)}`}
                  >
                    {pl.text}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
