import React from 'react';
import type {
  PageSettings,
  PageFormat,
  PageOrientation,
  MarginPreset,
  DocumentLayoutType,
} from '../../types/editor';
import { PAGE_FORMATS } from '../../utils/formatConfig';
import { Layout, FileText, Compass, Ruler, PaintBucket, Book, Eye, Columns, BookOpen } from 'lucide-react';

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
      onChange({
        ...pageSettings,
        layoutType: 'book',
        format: pageSettings.format === 'Legal' ? 'A5' : pageSettings.format,
        marginPreset: 'book',
        mirrorMargins: true,
        bookSpreadView: true,
        gutter: pageSettings.gutter || 10,
        margins: {
          top: 20,
          bottom: 25,
          left: 20,
          right: 15,
        },
        showMarginGuides: true,
      });
    } else {
      onChange({
        ...pageSettings,
        layoutType: 'standard',
        mirrorMargins: false,
        bookSpreadView: false,
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
    <div className="space-y-4 text-xs">
      {/* Document Type: Standard vs Book/Handbook */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Book className="w-3.5 h-3.5 text-blue-600" />
          Režim dokumentu
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleLayoutTypeChange('standard')}
            className={`p-2 rounded-lg border text-left transition-all ${
              pageSettings.layoutType === 'standard'
                ? 'border-blue-500 bg-blue-50/70 text-blue-700 shadow-2xs font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Standardní
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Běžný list (A4 / dopis)</div>
          </button>
          <button
            type="button"
            onClick={() => handleLayoutTypeChange('book')}
            className={`p-2 rounded-lg border text-left transition-all ${
              pageSettings.layoutType === 'book'
                ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700 shadow-2xs font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <Book className="w-3.5 h-3.5 text-indigo-600" />
              Kniha / Příručka
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dvojstránka, hřbet, zrcadlení</div>
          </button>
        </div>
      </div>

      {/* Book Spread View Toggle (Only shown when in book mode) */}
      {pageSettings.layoutType === 'book' && (
        <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1.5 animate-in fade-in">
          <label className="flex items-center justify-between text-xs font-semibold text-indigo-950 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Zobrazit celou dvojstránku
            </span>
            <label className="switch-toggle" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={pageSettings.bookSpreadView ?? true}
                onChange={(e) => onChange({ ...pageSettings, bookSpreadView: e.target.checked })}
              />
              <span className="switch-slider" />
            </label>
          </label>
          <p className="text-[10px] text-indigo-700/80 leading-relaxed">
            Zobrazí v náhledu obě stránky vedle sebe (Levá sudá + Pravá lichá se hřbetem uprostřed).
          </p>
        </div>
      )}

      {/* Visual margin guides toggle */}
      <div className={`p-2 rounded-lg flex items-center justify-between border transition-colors ${
        pageSettings.showMarginGuides
          ? 'bg-rose-50/70 border-rose-200'
          : 'bg-slate-50/90 border-slate-200'
      }`}>
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer w-full">
          <span className="flex items-center gap-2">
            <Eye className={`w-3.5 h-3.5 shrink-0 ${pageSettings.showMarginGuides ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Zobrazit vodící linky okrajů</span>
          </span>
          <label className="switch-toggle" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={pageSettings.showMarginGuides}
              onChange={(e) => onChange({ ...pageSettings, showMarginGuides: e.target.checked })}
            />
            <span className="switch-slider" />
          </label>
        </label>
      </div>

      {/* Paper Size & Orientation - Compact pills */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-500" />
            Formát
          </label>
          <select
            value={pageSettings.format}
            onChange={(e) => handleFormatChange(e.target.value as PageFormat)}
            className="select-custom w-full py-1.5 pl-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer transition-all"
          >
            {Object.values(PAGE_FORMATS).map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-500" />
            Orientace
          </label>
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => handleOrientationChange('portrait')}
              className={`flex-1 py-1 text-[11px] rounded transition-all ${
                pageSettings.orientation === 'portrait'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Portrét
            </button>
            <button
              type="button"
              onClick={() => handleOrientationChange('landscape')}
              className={`flex-1 py-1 text-[11px] rounded transition-all ${
                pageSettings.orientation === 'landscape'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Krajina
            </button>
          </div>
        </div>
      </div>

      {/* Margins */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Layout className="w-3 h-3 text-slate-500" />
          Okraje stránky
        </label>
        <div className="grid grid-cols-4 gap-1">
          {(['normal', 'narrow', 'wide', 'book'] as MarginPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleMarginPresetChange(preset)}
              className={`py-1 text-center rounded border text-[11px] transition-all ${
                pageSettings.marginPreset === preset
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {preset === 'normal'
                ? 'Normální'
                : preset === 'narrow'
                ? 'Úzké'
                : preset === 'wide'
                ? 'Široké'
                : 'Kniha'}
            </button>
          ))}
        </div>

        {/* Custom margin inputs & Gutter in compact grid */}
        <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Nastavení okrajů (cm):</span>
            <span className="text-slate-400 font-mono">1 cm = 10 mm</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Nahoře</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6.0"
                value={(pageSettings.margins.top / 10).toFixed(1)}
                onChange={(e) => handleCustomMarginChange('top', Math.round(parseFloat(e.target.value || '0') * 10))}
                className="w-full px-1 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{pageSettings.margins.top} mm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Dole</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6.0"
                value={(pageSettings.margins.bottom / 10).toFixed(1)}
                onChange={(e) => handleCustomMarginChange('bottom', Math.round(parseFloat(e.target.value || '0') * 10))}
                className="w-full px-1 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{pageSettings.margins.bottom} mm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 truncate" title={pageSettings.layoutType === 'book' ? 'Vnitřní' : 'Vlevo'}>
                {pageSettings.layoutType === 'book' ? 'Vnitřní' : 'Vlevo'}
              </span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6.0"
                value={(pageSettings.margins.left / 10).toFixed(1)}
                onChange={(e) => handleCustomMarginChange('left', Math.round(parseFloat(e.target.value || '0') * 10))}
                className="w-full px-1 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{pageSettings.margins.left} mm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 truncate" title={pageSettings.layoutType === 'book' ? 'Vnější' : 'Vpravo'}>
                {pageSettings.layoutType === 'book' ? 'Vnější' : 'Vpravo'}
              </span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="6.0"
                value={(pageSettings.margins.right / 10).toFixed(1)}
                onChange={(e) => handleCustomMarginChange('right', Math.round(parseFloat(e.target.value || '0') * 10))}
                className="w-full px-1 py-1 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{pageSettings.margins.right} mm</span>
            </div>
          </div>

          {/* Hřbet vazby (Gutter) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                <Columns className="w-3 h-3 text-rose-500" />
                Hřbet vazby (Gutter):
              </span>
              <span className="text-[11px] font-mono font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/80">
                {((pageSettings.gutter || 0) / 10).toFixed(1)} cm ({pageSettings.gutter || 0} mm)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={pageSettings.gutter || 0}
              onChange={(e) => onChange({ ...pageSettings, gutter: Number(e.target.value) })}
              className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-rose-600"
            />
          </div>

          {/* Zrcadlové okraje toggle */}
          <label className="flex items-center gap-1.5 pt-0.5 text-[11px] text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={pageSettings.mirrorMargins}
              onChange={(e) => onChange({ ...pageSettings, mirrorMargins: e.target.checked })}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
            />
            <span>Zrcadlové okraje (oboustranně)</span>
          </label>
        </div>
      </div>

      {/* Paper Color & Ruler - compact row */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
        <div className="flex items-center gap-1.5">
          <PaintBucket className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1">
            {PAPER_COLORS.slice(0, 4).map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => onChange({ ...pageSettings, paperColor: color.value })}
                style={{ backgroundColor: color.value, borderColor: color.border }}
                className={`w-4 h-4 rounded-full border transition-all ${
                  pageSettings.paperColor === color.value ? 'ring-2 ring-blue-500 scale-110 shadow-xs' : ''
                }`}
                title={color.name}
              />
            ))}
            <input
              type="color"
              value={pageSettings.paperColor}
              onChange={(e) => onChange({ ...pageSettings, paperColor: e.target.value })}
              className="w-4 h-4 rounded-full cursor-pointer ml-0.5 border border-slate-300"
              title="Vlastní barva"
            />
          </div>
        </div>

        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
          <Ruler className="w-3 h-3 text-slate-400" />
          <span>Pravítko</span>
          <input
            type="checkbox"
            checked={pageSettings.showRuler}
            onChange={(e) => onChange({ ...pageSettings, showRuler: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
          />
        </label>
      </div>
    </div>
  );
};
