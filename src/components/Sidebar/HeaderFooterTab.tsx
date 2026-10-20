import React from 'react';
import type { HeaderFooterSettings, TextAlignment, PageNumberFormat } from '../../types/editor';
import { AlignLeft, AlignCenter, AlignRight, FileSpreadsheet, Hash, BookOpen } from 'lucide-react';

interface Props {
  settings: HeaderFooterSettings;
  onChange: (settings: HeaderFooterSettings) => void;
}

export const HeaderFooterTab: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <div className="space-y-3.5 text-xs">
      {/* Book Mode Switch at the top */}
      <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-1.5 font-semibold text-indigo-900 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Různé záhlaví pro liché a sudé stránky
          </span>
          <label className="switch-toggle" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={settings.differentOddEven}
              onChange={(e) => onChange({ ...settings, differentOddEven: e.target.checked })}
            />
            <span className="switch-slider" />
          </label>
        </label>
      </div>

      {/* Header section */}
      <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            Záhlaví (Header)
          </span>
          <label className="switch-toggle">
            <input
              type="checkbox"
              checked={settings.showHeader}
              onChange={(e) => onChange({ ...settings, showHeader: e.target.checked })}
            />
            <span className="switch-slider" />
          </label>
        </div>

        {settings.showHeader && (
          <div className="space-y-1.5 pt-0.5 animate-in fade-in">
            <input
              type="text"
              placeholder={settings.differentOddEven ? "Záhlaví liché / pravé (např. Kapitola 1)" : "Text záhlaví..."}
              value={settings.headerText}
              onChange={(e) => onChange({ ...settings, headerText: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
            />

            {settings.differentOddEven && (
              <input
                type="text"
                placeholder="Záhlaví sudé / levé (např. Jméno autora nebo knihy)"
                value={settings.evenHeaderText ?? ''}
                onChange={(e) => onChange({ ...settings, evenHeaderText: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
              />
            )}

            <div className="flex items-center gap-1 pt-0.5">
              <span className="text-[10px] text-slate-400 mr-1 font-medium">Zarovnání:</span>
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                {(['left', 'center', 'right'] as TextAlignment[]).map((align) => {
                  const currentAlign = settings.headerAlign || 'right';
                  return (
                    <button
                      key={align}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onChange({ ...settings, headerAlign: align })}
                      className={`p-1 rounded transition-colors ${
                        currentAlign === align
                          ? 'bg-blue-600 text-white shadow-2xs font-medium'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title={align === 'left' ? 'Vlevo' : align === 'center' ? 'Na střed' : 'Vpravo'}
                    >
                      {align === 'left' && <AlignLeft className="w-3 h-3" />}
                      {align === 'center' && <AlignCenter className="w-3 h-3" />}
                      {align === 'right' && <AlignRight className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer section */}
      <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            Zápatí (Footer)
          </span>
          <label className="switch-toggle">
            <input
              type="checkbox"
              checked={settings.showFooter}
              onChange={(e) => onChange({ ...settings, showFooter: e.target.checked })}
            />
            <span className="switch-slider" />
          </label>
        </div>

        {settings.showFooter && (
          <div className="space-y-1.5 pt-0.5 animate-in fade-in">
            <input
              type="text"
              placeholder={settings.differentOddEven ? "Zápatí liché / pravé..." : "Text zápatí..."}
              value={settings.footerText}
              onChange={(e) => onChange({ ...settings, footerText: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
            />

            {settings.differentOddEven && (
              <input
                type="text"
                placeholder="Zápatí sudé / levé..."
                value={settings.evenFooterText ?? ''}
                onChange={(e) => onChange({ ...settings, evenFooterText: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
              />
            )}

            <div className="flex items-center gap-1 pt-0.5">
              <span className="text-[10px] text-slate-400 mr-1 font-medium">Zarovnání:</span>
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                {(['left', 'center', 'right'] as TextAlignment[]).map((align) => {
                  const currentAlign = settings.footerAlign || 'left';
                  return (
                    <button
                      key={align}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onChange({ ...settings, footerAlign: align })}
                      className={`p-1 rounded transition-colors ${
                        currentAlign === align
                          ? 'bg-blue-600 text-white shadow-2xs font-medium'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title={align === 'left' ? 'Vlevo' : align === 'center' ? 'Na střed' : 'Vpravo'}
                    >
                      {align === 'left' && <AlignLeft className="w-3 h-3" />}
                      {align === 'center' && <AlignCenter className="w-3 h-3" />}
                      {align === 'right' && <AlignRight className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page numbering */}
      <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-blue-600" />
          Číslování stránek
        </span>

        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <select
              value={settings.pageNumbering}
              onChange={(e) => onChange({ ...settings, pageNumbering: e.target.value as PageNumberFormat })}
              className="select-custom w-full py-1.5 pl-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer transition-all shadow-2xs"
            >
              <option value="none">Bez čísla</option>
              <option value="page">Strana 1</option>
              <option value="page_of_total">1 z X</option>
              <option value="dash">— 1 —</option>
              <option value="roman">Římské (I, II)</option>
            </select>
          </div>

          {settings.pageNumbering !== 'none' && (
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              {(['left', 'center', 'right'] as TextAlignment[]).map((pos) => {
                const currentPos = settings.pageNumberPosition || 'right';
                return (
                  <button
                    key={pos}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onChange({ ...settings, pageNumberPosition: pos })}
                    className={`flex-1 py-1 text-[10px] rounded transition-colors ${
                      currentPos === pos
                        ? 'bg-blue-600 text-white font-medium shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pos === 'left' ? 'Vlevo' : pos === 'center' ? 'Střed' : 'Vpravo'}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Title page option */}
      <div className="p-2 bg-slate-50/90 border border-slate-200 rounded-lg flex items-center justify-between">
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer w-full">
          <span>Jiné záhlaví a zápatí na 1. stránce (Titulka)</span>
          <label className="switch-toggle" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={settings.differentFirstPage}
              onChange={(e) => onChange({ ...settings, differentFirstPage: e.target.checked })}
            />
            <span className="switch-slider" />
          </label>
        </label>
      </div>
    </div>
  );
};
