import React from 'react';
import type {
  PageSettings,
  PageFormat,
  PageOrientation,
  MarginPreset,
  DocumentLayoutType,
} from '../../types/editor';
import { Layout, FileText, Compass, Ruler, PaintBucket, Book, Eye, Columns } from 'lucide-react';

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

  const handleLayoutTypeChange = (layoutType: DocumentLayoutType) => {
    if (layoutType === 'book') {
      // Automatic book margins & setup
      onChange({
        ...pageSettings,
        layoutType: 'book',
        format: pageSettings.format === 'Legal' ? 'A5' : pageSettings.format,
        marginPreset: 'book',
        mirrorMargins: true,
        gutter: pageSettings.gutter || 10,
        margins: {
          top: 20,
          bottom: 25,
          left: 20, // Vnitřní okraj
          right: 15, // Vnější okraj
        },
        showMarginGuides: true,
      });
    } else {
      onChange({
        ...pageSettings,
        layoutType: 'standard',
        mirrorMargins: false,
        marginPreset: 'normal',
        margins: { top: 25, bottom: 25, left: 25, right: 25 },
        gutter: 0,
      });
    }
  };

  const handleMarginPresetChange = (preset: MarginPreset) => {
    let margins = { ...pageSettings.margins };
    let gutter = pageSettings.gutter || 0;
    let mirrorMargins = pageSettings.mirrorMargins;

    if (preset === 'normal') {
      margins = { top: 25, bottom: 25, left: 25, right: 25 };
      gutter = 0;
      mirrorMargins = false;
    } else if (preset === 'narrow') {
      margins = { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 };
      gutter = 0;
      mirrorMargins = false;
    } else if (preset === 'wide') {
      margins = { top: 30, bottom: 30, left: 35, right: 35 };
      gutter = 0;
      mirrorMargins = false;
    } else if (preset === 'book') {
      margins = { top: 20, bottom: 25, left: 20, right: 15 };
      gutter = 10;
      mirrorMargins = true;
    }

    onChange({
      ...pageSettings,
      marginPreset: preset,
      margins,
      gutter,
      mirrorMargins,
    });
  };

  const handleCustomMarginChange = (side: keyof typeof pageSettings.margins, val: number) => {
    const margins = { ...pageSettings.margins, [side]: Math.max(5, Math.min(60, val)) };
    onChange({ ...pageSettings, marginPreset: 'custom', margins });
  };

  return (
    <div className="space-y-6">
      {/* Document Type: Standard vs Book/Handbook */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Book className="w-3.5 h-3.5 text-blue-600" />
          Typ dokumentu a rozvržení
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleLayoutTypeChange('standard')}
            className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              pageSettings.layoutType === 'standard'
                ? 'border-blue-500 bg-blue-50/60 text-blue-700 shadow-2xs font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Standardní dokument
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Běžný dokument (dopis, zpráva)</div>
          </button>
          <button
            type="button"
            onClick={() => handleLayoutTypeChange('book')}
            className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              pageSettings.layoutType === 'book'
                ? 'border-blue-500 bg-blue-50/60 text-blue-700 shadow-2xs font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <Book className="w-3.5 h-3.5 text-indigo-600" />
              Kniha / Příručka
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dvoustránka, hřbet, zrcadlení</div>
          </button>
        </div>
      </div>

      {/* Visual margin guides toggle */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
        <label className="flex items-center justify-between text-xs font-semibold text-blue-900 cursor-pointer">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            Zobrazit vodící linky okrajů
          </span>
          <input
            type="checkbox"
            checked={pageSettings.showMarginGuides}
            onChange={(e) => onChange({ ...pageSettings, showMarginGuides: e.target.checked })}
            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
        </label>
        <p className="text-[11px] text-blue-700/80 leading-snug">
          Vykreslí na stránce modré obrysy okrajů a oblast pro vazbu (při tisku se nezobrazí).
        </p>
      </div>

      {/* Paper Size */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          Formát stránky
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['A4', 'A5', 'B5', 'Letter', 'Legal'] as PageFormat[]).map((fmt) => (
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
                  ? '148 × 210 mm (Ideální pro knihy)'
                  : fmt === 'B5'
                  ? '176 × 250 mm'
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
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
          <button
            type="button"
            onClick={() => handleMarginPresetChange('book')}
            className={`p-2 rounded-lg border text-xs text-center transition-all ${
              pageSettings.marginPreset === 'book'
                ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700 font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-medium">Knižní</div>
            <div className="text-[10px] text-slate-400">Hřbet +10</div>
          </button>
        </div>

        {/* Custom margin inputs & Gutter */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Rozměry okrajů (mm):</span>
            {pageSettings.layoutType === 'book' && (
              <span className="text-[10px] text-indigo-600 font-medium">Režim kniha (vnitřní/vnější)</span>
            )}
          </div>
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
              <span className="text-[10px] text-slate-400">
                {pageSettings.layoutType === 'book' ? 'Vnitřní (k vazbě):' : 'Vlevo:'}
              </span>
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
              <span className="text-[10px] text-slate-400">
                {pageSettings.layoutType === 'book' ? 'Vnější (okraj):' : 'Vpravo:'}
              </span>
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

          {/* Hřbet vazby (Gutter) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                <Columns className="w-3 h-3 text-slate-500" />
                Hřbet vazby (Gutter):
              </span>
              <span className="text-xs font-mono font-semibold text-slate-800">
                {pageSettings.gutter || 0} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={pageSettings.gutter || 0}
              onChange={(e) => onChange({ ...pageSettings, gutter: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>0 mm (bez vazby)</span>
              <span>10 mm (sešit)</span>
              <span>20 mm (pevná vazba)</span>
            </div>
          </div>

          {/* Zrcadlové okraje toggle */}
          <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={pageSettings.mirrorMargins}
              onChange={(e) => onChange({ ...pageSettings, mirrorMargins: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Zrcadlové okraje pro oboustranný tisk</span>
          </label>
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
