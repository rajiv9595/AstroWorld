/**
 * ASTROWORLD — View 8: Jaimini Astrological System
 * 7 Chara Karakas (AK to DK), Karakamsa (D9 Navamsha sign of AK), and Arudha Padas.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { Users, Sparkles, Compass, Shield } from 'lucide-react';

interface JaiminiViewProps {
  context: AIInterpretationContext;
}

export const JaiminiView: React.FC<JaiminiViewProps> = ({ context }) => {
  const { jaimini, vargas } = context;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Users className="text-orange-500 w-6 h-6" />
            Jaimini Sutras — Chara Karakas &amp; Arudha Padas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Soul-level significators ranked strictly by descending degrees within sign, plus Karakamsa &amp; Arudha Lagna.
          </p>
        </div>
      </div>

      {/* Top Banner: Core Jaimini Anchors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Atmakaraka (AK) */}
        <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-sm">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
            ATMAKARAKA (AK - आत्मकारक)
          </span>
          <div className="text-2xl font-bold font-serif text-[#162058]">{jaimini.atmakaraka}</div>
          <div className="text-xs text-slate-500 mt-2 leading-relaxed">
            Highest degree planet signifying deepest soul trajectory, core karma, and life mission.
          </div>
        </div>

        {/* Karakamsa (D9 sign of AK) */}
        <div className="bg-white border border-cyan-300 rounded-2xl p-6 shadow-sm">
          <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block mb-1">
            KARAKAMSA (कारकांश)
          </span>
          <div className="text-2xl font-bold font-serif text-[#162058]">{jaimini.karakamsaNavamshaSign}</div>
          <div className="text-xs text-slate-500 mt-2 leading-relaxed">
            Navamsha (D9) sign occupied by Atmakaraka ({jaimini.atmakaraka}), revealing spiritual liberation (Moksha) path.
          </div>
        </div>

        {/* Arudha Lagna (AL) & Upapada (UL) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              ARUDHA PADAS (माया पद)
            </span>
            <div className="text-xs text-slate-700 space-y-1.5 mt-2">
              <div>
                Arudha Lagna (AL): <strong className="text-[#162058] font-bold">{jaimini.arudhaLagna.sign}</strong> (House {jaimini.arudhaLagna.houseNumber})
              </div>
              <div>
                Upapada Lagna (UL): <strong className="text-[#162058] font-bold">{jaimini.upapadaLagna.sign}</strong> (House {jaimini.upapadaLagna.houseNumber})
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 italic">
            Calculated with 1st/7th classical exception rules.
          </div>
        </div>
      </div>

      {/* 7 Chara Karakas Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif font-bold text-base text-[#162058] mb-4">
          The 7 Chara Karakas (Degree-Ranked Significators)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAF7F2] text-[#162058] font-bold">
                <th className="py-2.5 px-3">Karaka Code</th>
                <th className="py-2.5 px-3">Sanskrit Title</th>
                <th className="py-2.5 px-3">Planet Assigned</th>
                <th className="py-2.5 px-3">Degree in Sign</th>
                <th className="py-2.5 px-3">Core Signification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jaimini.charaKarakas.map((ck) => (
                <tr key={ck.role} className="hover:bg-amber-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-orange-600">{ck.role}</td>
                  <td className="py-2.5 px-3 font-serif font-bold text-[#162058]">{ck.roleName}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-800">{ck.planet}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{ck.degreeInSign.toFixed(4)}°</td>
                  <td className="py-2.5 px-3 text-slate-600">{ck.signification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
