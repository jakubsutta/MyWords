import React from 'react';
import type { PageSettings, HeaderFooterSettings, DocumentStats } from '../../types/editor';
import { PAGE_FORMATS } from '../../utils/formatConfig';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Clock,
  BookOpen,
} from 'lucide-react';

interface Props {
  stats: DocumentStats;
  pageCount: number;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitToWidth: () => void;
  viewMode: 'pages' | 'continuous';
  onViewModeChange?: (mode: 'pages' | 'continuous') => void;
  onPageSettingsChange?: (settings: PageSettings) => void;
}

export const EditorStatusBar: React.FC<Props> = ({
  stats,
  pageCount,
  pageSettings,
  zoom,
  onZoomChange,
  onFitToWidth,
  viewMode,
}) => {
  return (
    <footer className="no-print h-9 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-3 flex items-center justify-between text-xs text-slate-600 shrink-0 select-none z-20 shadow-2xs">
      {/* Left: Document info & metrics */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
        {/* Page Count */}
        <div className="flex items-center gap-1.5 font-medium text-slate-700 whitespace-nowrap">
          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            {viewMode === 'pages' ? (
              pageSettings.layoutType === 'book' && (pageSettings.bookSpreadView ?? true) ? (
                <>Dvojstrana (1–2 z {Math.max(2, pageCount)})</>
              ) : (
                <>Strana 1 z {pageCount}</>
              )
            ) : (
              <>Plynulý text</>
            )}
          </span>
        </div>

        <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

        {/* Word and Character Count */}
        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px] whitespace-nowrap">
          <span className="font-semibold text-slate-700">{stats.words}</span> slov
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">{stats.characters}</span> znaků
        </div>

        <div className="h-3.5 w-px bg-slate-200 hidden md:block" />

        {/* Reading time */}
        <div className="hidden md:flex items-center gap-1 text-slate-500 text-[11px] whitespace-nowrap">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{stats.readingTimeMinutes} min čtení</span>
        </div>

        <div className="h-3.5 w-px bg-slate-200 hidden lg:block" />

        {/* Page Format & Layout Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-500 text-[11px] whitespace-nowrap">
          {pageSettings.layoutType === 'book' ? (
            <span className="inline-flex items-center gap-1 text-indigo-700 font-medium bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
              <BookOpen className="w-3 h-3 text-indigo-600" />
              {pageSettings.format} ({PAGE_FORMATS[pageSettings.format]?.widthCm} × {PAGE_FORMATS[pageSettings.format]?.heightCm} cm) • Kniha
            </span>
          ) : (
            <span className="text-slate-600">
              {pageSettings.format} ({PAGE_FORMATS[pageSettings.format]?.widthCm} × {PAGE_FORMATS[pageSettings.format]?.heightCm} cm) • {pageSettings.orientation === 'portrait' ? 'Portrét' : 'Krajina'}
            </span>
          )}
        </div>
      </div>

      {/* Right: Zoom controls and auto-fit */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(40, zoom - 10))}
            className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
            title="Oddálit (Ctrl+-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Interactive range slider on tablet/desktop */}
          <input
            type="range"
            min="40"
            max="160"
            step="5"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="hidden sm:block w-16 md:w-24 h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
            title={`Lupa: ${zoom}%`}
          />

          <button
            type="button"
            onClick={() => onZoomChange(100)}
            className="w-10 text-center font-mono font-medium text-[11px] hover:text-blue-600 hover:font-bold transition-all"
            title="Obnovit na 100%"
          >
            {zoom}%
          </button>

          <button
            type="button"
            onClick={() => onZoomChange(Math.min(160, zoom + 10))}
            className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
            title="Přiblížit (Ctrl++)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fit to window button */}
          <button
            type="button"
            onClick={onFitToWidth}
            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors ml-0.5"
            title="Přizpůsobit šířce okna"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
