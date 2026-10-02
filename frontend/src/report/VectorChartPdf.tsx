/**
 * ASTROWORLD — High-Resolution Vector Chart Component for Print & PDF
 * Crisp vector SVG renderer supporting both North Indian Diamond and South Indian Square formats.
 */

import React from 'react';
import { ZodiacSign } from '../engine/types.ts';
import { ZODIAC_SIGNS } from '../engine/constants.ts';
import { ChartStylePreference, VectorChartHouseEntry } from './reportTypes.ts';

interface VectorChartPdfProps {
  title?: string;
  ascendantSign: ZodiacSign;
  houses: VectorChartHouseEntry[];
  style?: ChartStylePreference;
  size?: number;
  className?: string;
}

export const VectorChartPdf: React.FC<VectorChartPdfProps> = ({
  title,
  ascendantSign,
  houses,
  style = 'north-diamond',
  size = 230,
  className = '',
}) => {
  const ascIndex = ZODIAC_SIGNS.indexOf(ascendantSign);

  // Map house numbers to house entries
  const houseMap: Record<number, VectorChartHouseEntry> = {};
  houses.forEach((h) => {
    houseMap[h.houseNumber] = h;
  });

  if (style === 'south-square') {
    // South Indian Chart: Fixed signs clockwise starting from Pisces at (0,0)
    const signPositions = [
      { r: 0, c: 1, sign: 'Aries' as ZodiacSign },
      { r: 0, c: 2, sign: 'Taurus' as ZodiacSign },
      { r: 0, c: 3, sign: 'Gemini' as ZodiacSign },
      { r: 1, c: 3, sign: 'Cancer' as ZodiacSign },
      { r: 2, c: 3, sign: 'Leo' as ZodiacSign },
      { r: 3, c: 3, sign: 'Virgo' as ZodiacSign },
      { r: 3, c: 2, sign: 'Libra' as ZodiacSign },
      { r: 3, c: 1, sign: 'Scorpio' as ZodiacSign },
      { r: 3, c: 0, sign: 'Sagittarius' as ZodiacSign },
      { r: 2, c: 0, sign: 'Capricorn' as ZodiacSign },
      { r: 1, c: 0, sign: 'Aquarius' as ZodiacSign },
      { r: 0, c: 0, sign: 'Pisces' as ZodiacSign },
    ];

    const cellW = 100;
    const cellH = 100;

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        className={`select-none ${className}`}
      >
        <rect
          x="2"
          y="2"
          width="396"
          height="396"
          fill="#FFFDF9"
          stroke="#C2A378"
          strokeWidth="2.5"
          rx="6"
        />

        {/* 4x4 Grid lines */}
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <line
              x1={i * cellW}
              y1={0}
              x2={i * cellW}
              y2={i === 1 || i === 2 ? cellH : 400}
              stroke="#D4B996"
              strokeWidth="1.5"
            />
            <line
              x1={i * cellW}
              y1={i === 1 || i === 2 ? cellH * 3 : 0}
              x2={i * cellW}
              y2={400}
              stroke="#D4B996"
              strokeWidth="1.5"
            />
            <line
              x1={0}
              y1={i * cellH}
              x2={i === 1 || i === 2 ? cellW : 400}
              y2={i * cellH}
              stroke="#D4B996"
              strokeWidth="1.5"
            />
            <line
              x1={i === 1 || i === 2 ? cellW * 3 : 0}
              y1={i * cellH}
              x2={400}
              y2={i * cellH}
              stroke="#D4B996"
              strokeWidth="1.5"
            />
          </React.Fragment>
        ))}

        {/* Center Plaque */}
        <rect
          x={cellW + 6}
          y={cellH + 6}
          width={cellW * 2 - 12}
          height={cellH * 2 - 12}
          fill="#FAF6EE"
          stroke="#C2A378"
          strokeWidth="1.5"
          rx="6"
        />
        <text
          x="200"
          y="185"
          textAnchor="middle"
          fill="#0F172A"
          fontSize="14"
          fontWeight="bold"
          fontFamily="Cinzel, serif"
        >
          {title || 'SOUTH CHART'}
        </text>
        <text
          x="200"
          y="215"
          textAnchor="middle"
          fill="#B45309"
          fontSize="12"
          fontFamily="Inter, sans-serif"
          fontWeight="bold"
        >
          Asc: {ascendantSign}
        </text>

        {/* Signs & Planets */}
        {signPositions.map((pos) => {
          const signIdx = ZODIAC_SIGNS.indexOf(pos.sign);
          const houseNum = ((signIdx - ascIndex + 12) % 12) + 1;
          const hData = houseMap[houseNum];
          const isLagna = pos.sign === ascendantSign;

          const cx = pos.c * cellW + cellW / 2;
          const cy = pos.r * cellH + cellH / 2;

          return (
            <g key={pos.sign}>
              {isLagna && (
                <text
                  x={pos.c * cellW + 8}
                  y={pos.r * cellH + 18}
                  fill="#B45309"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="Inter, sans-serif"
                >
                  ASC
                </text>
              )}
              <text
                x={pos.c * cellW + cellW - 6}
                y={pos.r * cellH + 16}
                textAnchor="end"
                fill="#94A3B8"
                fontSize="9.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {pos.sign.slice(0, 3)}
              </text>

              {/* Planets with clean line breaking */}
              {hData && hData.planets && hData.planets.length > 0 && (
                <g>
                  {hData.planets.map((pl, pIdx) => {
                    const total = hData.planets.length;
                    const yOffset = cy + (pIdx - (total - 1) / 2) * 14 + 4;
                    return (
                      <text
                        key={pIdx}
                        x={cx}
                        y={total > 2 ? yOffset : cy + 4}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize={total > 2 ? '10' : '11.5'}
                        fontWeight="bold"
                        fontFamily="Inter, sans-serif"
                      >
                        {total > 2 ? pl : hData.planets.join(' ')}
                      </text>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  // North Indian Diamond Layout with exact canonical centroids
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={`select-none ${className}`}
    >
      {/* Outer Background Canvas */}
      <rect
        x="2"
        y="2"
        width="396"
        height="396"
        fill="#FFFDF9"
        stroke="#C2A378"
        strokeWidth="2.5"
        rx="6"
      />

      {/* Decorative inner hairline */}
      <rect
        x="6"
        y="6"
        width="388"
        height="388"
        fill="none"
        stroke="#D4B996"
        strokeWidth="1"
        strokeDasharray="4 4"
        rx="4"
      />

      {/* Diagonal corner-to-corner lines */}
      <line x1="0" y1="0" x2="400" y2="400" stroke="#C2A378" strokeWidth="1.8" />
      <line x1="0" y1="400" x2="400" y2="0" stroke="#C2A378" strokeWidth="1.8" />

      {/* Inner Diamond (Kendra Boundary) */}
      <polygon
        points="200,0 400,200 200,400 0,200"
        fill="none"
        stroke="#C2A378"
        strokeWidth="2"
      />

      {/* House 1 Lagna Tag */}
      <text
        x="200"
        y="50"
        textAnchor="middle"
        fill="#B45309"
        fontSize="10"
        fontWeight="bold"
        fontFamily="Cinzel, serif"
        letterSpacing="0.1em"
      >
        LAGNA (ASC)
      </text>

      {/* Render Sign Numbers and Planets for Houses 1 to 12 */}
      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((hNum) => {
        const center = houseCenters[hNum];
        const hData = houseMap[hNum];
        const signNum = ((ascIndex + hNum - 1) % 12) + 1;
        const pList = hData?.planets || [];

        return (
          <g key={hNum}>
            {/* Sign Number */}
            <text
              x={center.signPos.x}
              y={center.signPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#94A3B8"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
            >
              {signNum}
            </text>

            {/* Planets formatted and vertically stacked if multiple */}
            {pList.length > 0 && (
              <g>
                {pList.length <= 2 ? (
                  <text
                    x={center.x}
                    y={center.y + 4}
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="12.5"
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                  >
                    {pList.join(' ')}
                  </text>
                ) : (
                  // For 3 or more planets in a house, stack them cleanly
                  pList.map((pl, pIdx) => {
                    const rowHeight = 13;
                    const yPos = center.y + (pIdx - (pList.length - 1) / 2) * rowHeight + 3;
                    return (
                      <text
                        key={pIdx}
                        x={center.x}
                        y={yPos}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize="10.5"
                        fontWeight="bold"
                        fontFamily="Inter, sans-serif"
                      >
                        {pl}
                      </text>
                    );
                  })
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
