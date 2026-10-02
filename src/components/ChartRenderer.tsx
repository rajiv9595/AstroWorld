/**
 * ASTROWORLD — Vedic Chart Renderers (North & South Indian formats)
 * Beautiful ivory & warm gold aesthetic matching the unified AstroWorld design.
 */

import React from 'react';
import { PlanetName, PlanetPosition, VargaPlanetPlacement } from '../engine/types.ts';
import { ZODIAC_SIGNS } from '../engine/constants.ts';

interface ChartRendererProps {
  ascendantSignIndex: number;
  planets: (PlanetPosition | VargaPlanetPlacement)[];
  chartTitle?: string;
  style?: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
  onPlanetClick?: (planet: PlanetName) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  ascendantSignIndex,
  planets,
  chartTitle = 'D1 Rashi Chart',
  style = 'NORTH_INDIAN',
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

  const getDignityBadgeClass = (dig?: string) => {
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
              const signPlanets = planetsByHouse[houseNum] || [];

              return (
                <div
                  key={`sign-${signIdx}`}
                  className={`p-1.5 flex flex-col justify-between rounded border transition-colors ${
                    isLagna
                      ? 'border-orange-500 bg-orange-50/50'
                      : 'border-amber-200/70 bg-white hover:bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                    <span className="font-bold text-slate-500">{ZODIAC_SIGNS[signIdx].slice(0, 3)}</span>
                    <span className="text-amber-800 font-bold">H{houseNum}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 my-0.5 justify-center">
                    {signPlanets.map((pl) => (
                      <span
                        key={pl.name}
                        onClick={() => onPlanetClick?.(pl.name)}
                        className={`text-[9px] px-1 py-0.2 rounded border font-semibold cursor-pointer ${getDignityBadgeClass(pl.dignity)}`}
                      >
                        {pl.text}
                      </span>
                    ))}
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
    1: { x: 200, y: 110, signPos: { x: 200, y: 155 } },
    2: { x: 100, y: 55, signPos: { x: 130, y: 95 } },
    3: { x: 55, y: 100, signPos: { x: 95, y: 130 } },
    4: { x: 110, y: 200, signPos: { x: 155, y: 200 } },
    5: { x: 55, y: 300, signPos: { x: 95, y: 270 } },
    6: { x: 100, y: 345, signPos: { x: 130, y: 305 } },
    7: { x: 200, y: 290, signPos: { x: 200, y: 245 } },
    8: { x: 300, y: 345, signPos: { x: 270, y: 305 } },
    9: { x: 345, y: 300, signPos: { x: 305, y: 270 } },
    10: { x: 290, y: 200, signPos: { x: 245, y: 200 } },
    11: { x: 345, y: 100, signPos: { x: 305, y: 130 } },
    12: { x: 300, y: 55, signPos: { x: 270, y: 95 } },
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
          <rect x="4" y="4" width="392" height="392" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <rect x="8" y="8" width="384" height="384" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />

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
            y="68"
            textAnchor="middle"
            fill="#EA580C"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="0.05em"
          >
            LAGNA (ASC)
          </text>

          {/* Zodiac Sign Numbers in each House */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const pos = houseCenters[h].signPos;
            const signNum = getHouseSignIndex(h) + 1;
            return (
              <text
                key={`sign-num-${h}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#94A3B8"
                fontSize="11"
                fontWeight="bold"
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

          return (
            <div
              key={`h-planets-${h}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-wrap gap-1 items-center justify-center max-w-[80px]"
              style={{
                left: `${(pos.x / 400) * 100}%`,
                top: `${(pos.y / 400) * 100}%`,
              }}
            >
              {hPlanets.map((pl) => (
                <button
                  key={pl.name}
                  onClick={() => onPlanetClick?.(pl.name)}
                  title={`${pl.name} in H${h} (${pl.dignity || 'Neutral'})`}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shadow-sm transition-all hover:scale-110 ${getDignityBadgeClass(pl.dignity)}`}
                >
                  {pl.text}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
