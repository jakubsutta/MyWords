import React from 'react';
import type { PageSettings } from '../../types/editor';

interface Props {
  pageSettings: PageSettings;
  widthMm: number;
}

export const EditorRuler: React.FC<Props> = ({ pageSettings, widthMm }) => {
  if (!pageSettings.showRuler) return null;

  // Total cm markings
  const totalCm = Math.floor(widthMm / 10);

  return (
    <div className="no-print w-full bg-slate-100 border-b border-slate-200 h-6 flex items-end relative overflow-hidden select-none text-[9px] font-mono text-slate-500">
      {/* Left margin shaded area */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-slate-200/70 border-r border-slate-300"
        style={{ width: `${(pageSettings.margins.left / widthMm) * 100}%` }}
        title={`Levý okraj: ${pageSettings.margins.left} mm`}
      />

      {/* Right margin shaded area */}
      <div
        className="absolute top-0 bottom-0 right-0 bg-slate-200/70 border-l border-slate-300"
        style={{ width: `${(pageSettings.margins.right / widthMm) * 100}%` }}
        title={`Pravý okraj: ${pageSettings.margins.right} mm`}
      />

      {/* Cm & mm tick marks */}
      <div className="w-full flex justify-between px-1 relative z-10">
        {Array.from({ length: totalCm + 1 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="leading-none mb-0.5">{i % 2 === 0 ? i : ''}</span>
            <div className={`w-px bg-slate-400 ${i % 5 === 0 ? 'h-2.5 bg-slate-600' : 'h-1.5'}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
