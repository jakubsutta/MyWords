import React from 'react';
import type { PageSettings, PageFormat, PageOrientation, MarginPreset } from '../../types/editor';
import { Layout, FileText, Compass, Ruler, PaintBucket } from 'lucide-react';

interface Props {
  pageSettings: PageSettings;
  onChange: (settings: PageSettings) => void;
}

const PAPER_COLORS = [
  { name: 'Bílá', value: '#ffffff', border: '#e2e8f0' },
  { name: 'Slonová kost', value: '#fdfbf7', border: '#e5e0d8' },
  { name: 'Jemně šedá', value: '#f8fafc', border: '#cbd5e1' },
  { name: 'Pergamen', value: '#fefae0', border: '#e9edc9' },
  { name: 'Modravá', value: '#f0f9ff', border: '#bae6fd' },
];

export const PageLayoutTab: React.FC<Props> = ({ pageSettings, onChange }) => {
  const handleFormatChange = (format: PageFormat) => {
    onChange({ ...pageSettings, format });
  };

  const handleOrientationChange = (orientation: PageOrientation) => {
    onChange({ ...pageSettings, orientation });
  };

  const handleMarginPresetChange = (preset: MarginPreset) => {
    let margins = { ...pageSettings.margins };
    if (preset === 'normal') {
      margins = { top: 25, bottom: 25, left: 25, right: 25 };
    } else if (preset === 'narrow') {
      margins = { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 };
    } else if (preset === 'wide') {
      margins = { top: 30, bottom: 30, left: 35, right: 35 };
    }
    onChange({ ...pageSettings, marginPreset: preset, margins });
  };

  const handleCustomMarginChange = (side: keyof typeof pageSettings.margins, val: number) => {
    const margins = { ...pageSettings.margins, [side]: Math.max(5, Math.min(60, val)) };
    onChange({ ...pageSettings, marginPreset: 'custom', margins });
  };

  return (
    <div className="space-y-6">
      {/* Paper Size */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          Formát stránky
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['A4', 'A5', 'Letter', 'Legal'] as PageFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => handleFormatChange(fmt)}
              className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                pageSettings.format === fmt
                  ? 'border-blue-500 bg-blue-50/60 text-blue-700 shadow-2xs font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold">{fmt}</div>
              <div className="text-[10px] text-slate-400">
                {fmt === 'A4'
                  ? '210 × 297 mm'
                  : fmt === 'A5'
                  ? '148 × 210 mm'
                  : fmt === 'Letter'
                  ? '8.5 × 11 in'
                  : '8.5 × 14 in'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          Orientace listu
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleOrientationChange('portrait')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
              pageSettings.orientation === 'portrait'
                ? 'border-blue-500 bg-blue-50/60 text-blue-700 shadow-2xs font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="w-3.5 h-5 border-2 border-current rounded-xs" />
            Na výšku (Portrét)
          </button>
          <button
            type="button"
            onClick={() => handleOrientationChange('landscape')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
              pageSettings.orientation === 'landscape'
                ? 'border-blue-500 bg-blue-50/60 text-blue-700 shadow-2xs font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="w-5 h-3.5 border-2 border-current rounded-xs" />
            Na šířku (Krajina)
          </button>
        </div>
      </div>

      {/* Margins */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-blue-600" />
          Okraje stránky
        </label>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => handleMarginPresetChange('normal')}
            className={`p-2 rounded-lg border text-xs text-center transition-all ${
              pageSettings.marginPreset === 'normal'
                ? 'border-blue-500 bg-blue-50/60 text-blue-700 font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-medium">Normální</div>
            <div className="text-[10px] text-slate-400">25 mm</div>
          </button>
          <button
            type="button"
            onClick={() => handleMarginPresetChange('narrow')}
            className={`p-2 rounded-lg border text-xs text-center transition-all ${
              pageSettings.marginPreset === 'narrow'
                ? 'border-blue-500 bg-blue-50/60 text-blue-700 font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-medium">Úzké</div>
            <div className="text-[10px] text-slate-400">12.7 mm</div>
          </button>
          <button
            type="button"
            onClick={() => handleMarginPresetChange('wide')}
            className={`p-2 rounded-lg border text-xs text-center transition-all ${
              pageSettings.marginPreset === 'wide'
                ? 'border-blue-500 bg-blue-50/60 text-blue-700 font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-medium">Široké</div>
            <div className="text-[10px] text-slate-400">35 mm</div>
          </button>
        </div>

        {/* Custom margin inputs */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="text-[11px] font-medium text-slate-600">Vlastní rozměry (mm):</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400">Nahoře:</span>
              <input
                type="number"
                min="5"
                max="60"
                value={pageSettings.margins.top}
                onChange={(e) => handleCustomMarginChange('top', Number(e.target.value))}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Dole:</span>
              <input
                type="number"
                min="5"
                max="60"
                value={pageSettings.margins.bottom}
                onChange={(e) => handleCustomMarginChange('bottom', Number(e.target.value))}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Vlevo:</span>
              <input
                type="number"
                min="5"
                max="60"
                value={pageSettings.margins.left}
                onChange={(e) => handleCustomMarginChange('left', Number(e.target.value))}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Vpravo:</span>
              <input
                type="number"
                min="5"
                max="60"
                value={pageSettings.margins.right}
                onChange={(e) => handleCustomMarginChange('right', Number(e.target.value))}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Paper Color */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <PaintBucket className="w-3.5 h-3.5 text-blue-600" />
          Barva listu papíru
        </label>
        <div className="flex items-center gap-2">
          {PAPER_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => onChange({ ...pageSettings, paperColor: color.value })}
              style={{ backgroundColor: color.value, borderColor: color.border }}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                pageSettings.paperColor === color.value ? 'ring-2 ring-blue-500 scale-110 shadow-xs' : ''
              }`}
              title={color.name}
            />
          ))}
          <input
            type="color"
            value={pageSettings.paperColor}
            onChange={(e) => onChange({ ...pageSettings, paperColor: e.target.value })}
            className="w-7 h-7 rounded-full cursor-pointer ml-auto border border-slate-300"
            title="Vlastní odstín papíru"
          />
        </div>
      </div>

      {/* Ruler toggle */}
      <div className="pt-2 border-t border-slate-200">
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
          <span className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-slate-500" />
            Zobrazit vodorovné pravítko
          </span>
          <input
            type="checkbox"
            checked={pageSettings.showRuler}
            onChange={(e) => onChange({ ...pageSettings, showRuler: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
};
