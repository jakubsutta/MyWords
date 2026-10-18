import React from 'react';
import type { HeaderFooterSettings, TextAlignment, PageNumberFormat } from '../../types/editor';
import { AlignLeft, AlignCenter, AlignRight, FileSpreadsheet, Hash } from 'lucide-react';

interface Props {
  settings: HeaderFooterSettings;
  onChange: (settings: HeaderFooterSettings) => void;
}

export const HeaderFooterTab: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            Záhlaví dokumentu (Header)
          </span>
          <input
            type="checkbox"
            checked={settings.showHeader}
            onChange={(e) => onChange({ ...settings, showHeader: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {settings.showHeader && (
          <div className="space-y-2 pt-1 animate-in fade-in">
            <input
              type="text"
              placeholder="Text záhlaví (např. Název dokumentu)..."
              value={settings.headerText}
              onChange={(e) => onChange({ ...settings, headerText: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 mr-2">Zarovnání:</span>
              {(['left', 'center', 'right'] as TextAlignment[]).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onChange({ ...settings, headerAlign: align })}
                  className={`p-1.5 rounded border transition-colors ${
                    settings.headerAlign === align
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer section */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            Zápatí dokumentu (Footer)
          </span>
          <input
            type="checkbox"
            checked={settings.showFooter}
            onChange={(e) => onChange({ ...settings, showFooter: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {settings.showFooter && (
          <div className="space-y-2 pt-1 animate-in fade-in">
            <input
              type="text"
              placeholder="Text zápatí (např. Důvěrné / Interní dokument)..."
              value={settings.footerText}
              onChange={(e) => onChange({ ...settings, footerText: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 mr-2">Zarovnání:</span>
              {(['left', 'center', 'right'] as TextAlignment[]).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onChange({ ...settings, footerAlign: align })}
                  className={`p-1.5 rounded border transition-colors ${
                    settings.footerAlign === align
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Page numbering */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-blue-600" />
          Číslování stránek
        </span>

        <div className="space-y-2">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Formát číslování:</label>
            <select
              value={settings.pageNumbering}
              onChange={(e) => onChange({ ...settings, pageNumbering: e.target.value as PageNumberFormat })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="none">Bez číslování</option>
              <option value="page">Strana 1</option>
              <option value="page_of_total">Strana 1 z 1</option>
              <option value="dash">— 1 —</option>
            </select>
          </div>

          {settings.pageNumbering !== 'none' && (
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Pozice čísla v zápatí:</label>
              <div className="flex items-center gap-1">
                {(['left', 'center', 'right'] as TextAlignment[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => onChange({ ...settings, pageNumberPosition: pos })}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      settings.pageNumberPosition === pos
                        ? 'bg-blue-600 border-blue-600 text-white font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pos === 'left' ? 'Vlevo' : pos === 'center' ? 'Na střed' : 'Vpravo'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="pt-1">
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.differentFirstPage}
            onChange={(e) => onChange({ ...settings, differentFirstPage: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Jiné záhlaví a zápatí na první stránce</span>
        </label>
      </div>
    </div>
  );
};
