import React, { useState, useEffect, useMemo } from 'react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { getFormatDimensions } from '../../utils/formatConfig';
import { triggerPrint } from '../../utils/exportUtils';
import { exportToDocx } from '../../utils/docxExport';
import { paginateHtml } from '../../utils/pagination';
import {
  X,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Eye,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
}

// Convert integer to Roman numerals
function toRoman(num: number): string {
  const lookup: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90,
    L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1,
  };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || 'I';
}

export const DocumentPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  htmlContent,
  pageSettings,
  headerFooterSettings,
}) => {
  const [zoom, setZoom] = useState(85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isBook = pageSettings.layoutType === 'book' || pageSettings.mirrorMargins;
  const [viewStyle, setViewStyle] = useState<'pages' | 'spread'>(isBook ? 'spread' : 'pages');
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);

  const { widthMm, heightMm } = getFormatDimensions(
    pageSettings.format,
    pageSettings.orientation
  );

  const gutter = pageSettings.gutter || 0;

  // Split HTML content into discrete pages
  const pages = useMemo(() => {
    if (!isOpen) return [''];
    return paginateHtml(htmlContent, pageSettings);
  }, [isOpen, htmlContent, pageSettings]);

  const totalPages = Math.max(1, pages.length);

  // Spread calculations:
  // Spread 0: Titulní strana (Strana 1)
  // Spread 1: Strany 2–3
  // Spread 2: Strany 4–5...
  const totalSpreads = Math.ceil((totalPages + 1) / 2);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && viewStyle === 'spread') {
        setCurrentSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' && viewStyle === 'spread') {
        setCurrentSpreadIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewStyle, totalSpreads, onClose]);

  if (!isOpen) return null;

  const handleNextSpread = () => {
    setCurrentSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1));
  };

  const handlePrevSpread = () => {
    setCurrentSpreadIndex((prev) => Math.max(0, prev - 1));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const renderPageNumber = (pageNo: number) => {
    switch (headerFooterSettings.pageNumbering) {
      case 'page':
        return `Strana ${pageNo}`;
      case 'page_of_total':
        return `Strana ${pageNo} z ${totalPages}`;
      case 'dash':
        return `— ${pageNo} —`;
      case 'roman':
        return toRoman(pageNo);
      default:
        return '';
    }
  };

  const getHeaderText = (pageNo: number) => {
    if (pageNo % 2 === 0 && headerFooterSettings.differentOddEven && headerFooterSettings.evenHeaderText) {
      return headerFooterSettings.evenHeaderText;
    }
    return headerFooterSettings.headerText;
  };

  const getFooterText = (pageNo: number) => {
    if (pageNo % 2 === 0 && headerFooterSettings.differentOddEven && headerFooterSettings.evenFooterText) {
      return headerFooterSettings.evenFooterText;
    }
    return headerFooterSettings.footerText;
  };

  const getPageMargins = (pageNo: number) => {
    if (isBook) {
      if (pageNo % 2 === 0) {
        // Even (Left page): inner gutter on right
        return {
          top: pageSettings.margins.top,
          bottom: pageSettings.margins.bottom,
          left: pageSettings.margins.right,
          right: pageSettings.margins.left + gutter,
        };
      } else {
        // Odd (Right page): inner gutter on left
        return {
          top: pageSettings.margins.top,
          bottom: pageSettings.margins.bottom,
          left: pageSettings.margins.left + gutter,
          right: pageSettings.margins.right,
        };
      }
    }
    return pageSettings.margins;
  };

  // Current spread pages
  const spreadLeftPageNum = currentSpreadIndex === 0 ? null : currentSpreadIndex * 2;
  const spreadRightPageNum = currentSpreadIndex === 0 ? 1 : currentSpreadIndex * 2 + 1;

  const spreadLeftContent = spreadLeftPageNum && spreadLeftPageNum <= totalPages ? pages[spreadLeftPageNum - 1] : '';
  const spreadRightContent = spreadRightPageNum && spreadRightPageNum <= totalPages ? pages[spreadRightPageNum - 1] : '';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Floating Control Bar */}
      <div className="h-14 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0 text-white shadow-lg">
        {/* Left: Document Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Eye className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100 truncate max-w-xs sm:max-w-md">
                {title || 'Dokument bez názvu'}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                Náhled tisku
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{pageSettings.format} ({pageSettings.orientation === 'portrait' ? 'Na výšku' : 'Na šířku'})</span>
              <span>•</span>
              <span>{totalPages} {totalPages === 1 ? 'strana' : totalPages < 5 ? 'strany' : 'stran'}</span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher & Spread Navigation */}
        <div className="flex items-center gap-2">
          {/* View mode toggle: Pages vs Spread */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewStyle('pages')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewStyle === 'pages'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Stránky</span>
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('spread')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewStyle === 'spread'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dvojstránky</span>
            </button>
          </div>

          {/* Spread Navigator (Only when viewStyle === 'spread') */}
          {viewStyle === 'spread' && (
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={handlePrevSpread}
                disabled={currentSpreadIndex === 0}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded"
                title="Předchozí dvojstránka (Klávesa vlevo)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-200 px-1.5 text-[11px] font-medium">
                {currentSpreadIndex === 0
                  ? 'Titul (Strana 1)'
                  : `Strany ${spreadLeftPageNum} – ${Math.min(totalPages, spreadRightPageNum!)}`}
              </span>
              <button
                type="button"
                onClick={handleNextSpread}
                disabled={currentSpreadIndex >= totalSpreads - 1}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded"
                title="Další dvojstránka (Klávesa vpravo)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions, Zoom & Close */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg border border-slate-700 px-1 py-0.5 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(40, z - 10))}
              className="p-1 hover:text-white"
              title="Zmenšit"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-[11px]">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="p-1 hover:text-white"
              title="Zvětšit"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Print */}
          <button
            type="button"
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Tisk nebo Uložit jako PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Tisk / PDF</span>
          </button>

          {/* Quick DOCX */}
          <button
            type="button"
            onClick={() => exportToDocx(htmlContent, title, pageSettings, headerFooterSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-xs"
            title="Stáhnout Word (.docx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">DOCX</span>
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Ukončit celou obrazovku' : 'Celá obrazovka'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Close Preview */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-xs"
            title="Ukončit náhled (Klávesa Escape)"
          >
            <X className="w-4 h-4" />
            <span>Zavřít</span>
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/80">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="flex flex-col items-center pb-20"
        >
          {/* ========================================================= */}
          {/* SPREAD VIEW (DVOJSTRÁNKA VEDLE SEBE PRO KNIHU)            */}
          {/* ========================================================= */}
          {viewStyle === 'spread' ? (
            <div className="flex items-stretch shadow-2xl rounded-xs overflow-hidden border border-slate-700 bg-slate-900/60 relative">
              {/* LEFT PAGE (SUDÁ) */}
              {spreadLeftPageNum ? (
                <div
                  className="relative flex flex-col bg-white overflow-hidden text-slate-900 transition-all border-r border-slate-300"
                  style={{
                    width: `${widthMm}mm`,
                    height: `${heightMm}mm`,
                    paddingTop: `${getPageMargins(spreadLeftPageNum).top}mm`,
                    paddingBottom: `${getPageMargins(spreadLeftPageNum).bottom}mm`,
                    paddingLeft: `${getPageMargins(spreadLeftPageNum).left}mm`,
                    paddingRight: `${getPageMargins(spreadLeftPageNum).right}mm`,
                  }}
                >
                  {/* Left Header */}
                  {headerFooterSettings.showHeader && (
                    <div
                      className="absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-slate-100 flex items-center"
                      style={{
                        height: `${pageSettings.margins.top * 0.8}mm`,
                        paddingLeft: `${getPageMargins(spreadLeftPageNum).left}mm`,
                        paddingRight: `${getPageMargins(spreadLeftPageNum).right}mm`,
                      }}
                    >
                      <span className="text-left w-full truncate font-serif italic text-slate-500">
                        {getHeaderText(spreadLeftPageNum)}
                      </span>
                    </div>
                  )}

                  {/* Left Page Body Content */}
                  <div
                    className="flex-1 w-full overflow-hidden text-slate-800 prose prose-slate max-w-none text-xs leading-relaxed select-text"
                    dangerouslySetInnerHTML={{ __html: spreadLeftContent }}
                  />

                  {/* Left Footer */}
                  {headerFooterSettings.showFooter && (
                    <div
                      className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-slate-100 flex items-center justify-between"
                      style={{
                        height: `${pageSettings.margins.bottom * 0.8}mm`,
                        paddingLeft: `${getPageMargins(spreadLeftPageNum).left}mm`,
                        paddingRight: `${getPageMargins(spreadLeftPageNum).right}mm`,
                      }}
                    >
                      <span className="font-mono text-[11px] font-semibold text-slate-600">
                        {renderPageNumber(spreadLeftPageNum)}
                      </span>
                      <span className="truncate text-slate-400 text-[10px]">
                        {getFooterText(spreadLeftPageNum)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Blank / Inside Cover for Title Spread */
                <div
                  className="relative flex flex-col bg-slate-100/90 border-r border-slate-300 items-center justify-center text-slate-400 text-xs italic font-serif"
                  style={{
                    width: `${widthMm}mm`,
                    height: `${heightMm}mm`,
                  }}
                >
                  <span>(Vnitřní strana přebalu)</span>
                </div>
              )}

              {/* BOOK SPINE CREASE */}
              <div className="w-3 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 shrink-0 z-20 relative flex items-center justify-center shadow-inner">
                <div className="w-px h-full bg-slate-700/60" />
              </div>

              {/* RIGHT PAGE (LICHÁ) */}
              <div
                className="relative flex flex-col bg-white overflow-hidden text-slate-900 transition-all"
                style={{
                  width: `${widthMm}mm`,
                  height: `${heightMm}mm`,
                  paddingTop: `${getPageMargins(spreadRightPageNum!).top}mm`,
                  paddingBottom: `${getPageMargins(spreadRightPageNum!).bottom}mm`,
                  paddingLeft: `${getPageMargins(spreadRightPageNum!).left}mm`,
                  paddingRight: `${getPageMargins(spreadRightPageNum!).right}mm`,
                }}
              >
                {/* Right Header */}
                {headerFooterSettings.showHeader && (
                  <div
                    className="absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-slate-100 flex items-center"
                    style={{
                      height: `${pageSettings.margins.top * 0.8}mm`,
                      paddingLeft: `${getPageMargins(spreadRightPageNum!).left}mm`,
                      paddingRight: `${getPageMargins(spreadRightPageNum!).right}mm`,
                    }}
                  >
                    <span className="text-right w-full truncate font-serif italic text-slate-500">
                      {getHeaderText(spreadRightPageNum!)}
                    </span>
                  </div>
                )}

                {/* Right Page Body Content */}
                <div
                  className="flex-1 w-full overflow-hidden text-slate-800 prose prose-slate max-w-none text-xs leading-relaxed select-text"
                  dangerouslySetInnerHTML={{ __html: spreadRightContent }}
                />

                {/* Right Footer */}
                {headerFooterSettings.showFooter && (
                  <div
                    className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-slate-100 flex items-center justify-between"
                    style={{
                      height: `${pageSettings.margins.bottom * 0.8}mm`,
                      paddingLeft: `${getPageMargins(spreadRightPageNum!).left}mm`,
                      paddingRight: `${getPageMargins(spreadRightPageNum!).right}mm`,
                    }}
                  >
                    <span className="truncate text-slate-400 text-[10px]">
                      {getFooterText(spreadRightPageNum!)}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-600">
                      {renderPageNumber(spreadRightPageNum!)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* CONTINUOUS SEQUENTIAL PAGES (VŠECHNY STRÁNKY ZA SEBOU)   */
            /* ========================================================= */
            <div className="space-y-8 flex flex-col items-center">
              {pages.map((pageHtml, pIdx) => {
                const pNum = pIdx + 1;
                const pageMargins = getPageMargins(pNum);

                return (
                  <div
                    key={`preview-page-${pNum}`}
                    className="relative flex flex-col bg-white rounded-xs shadow-2xl border border-slate-300 text-slate-900 transition-all select-text overflow-hidden"
                    style={{
                      width: `${widthMm}mm`,
                      height: `${heightMm}mm`,
                      paddingTop: `${pageMargins.top}mm`,
                      paddingBottom: `${pageMargins.bottom}mm`,
                      paddingLeft: `${pageMargins.left}mm`,
                      paddingRight: `${pageMargins.right}mm`,
                    }}
                  >
                    {/* Page Header */}
                    {headerFooterSettings.showHeader && (
                      <div
                        className="absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-slate-100 flex items-center justify-between"
                        style={{
                          height: `${pageSettings.margins.top * 0.8}mm`,
                          paddingLeft: `${pageMargins.left}mm`,
                          paddingRight: `${pageMargins.right}mm`,
                        }}
                      >
                        <span className="font-serif italic text-slate-500 truncate w-full">
                          {getHeaderText(pNum)}
                        </span>
                      </div>
                    )}

                    {/* Page Body Content */}
                    <div
                      className="flex-1 w-full overflow-hidden text-slate-800 prose prose-slate max-w-none text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />

                    {/* Page Footer */}
                    {headerFooterSettings.showFooter && (
                      <div
                        className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-slate-100 flex items-center justify-between"
                        style={{
                          height: `${pageSettings.margins.bottom * 0.8}mm`,
                          paddingLeft: `${pageMargins.left}mm`,
                          paddingRight: `${pageMargins.right}mm`,
                        }}
                      >
                        <span className="truncate text-slate-400 text-[10px]">
                          {getFooterText(pNum)}
                        </span>
                        {headerFooterSettings.pageNumbering !== 'none' && (
                          <span className="font-mono text-[11px] font-semibold text-slate-600">
                            {renderPageNumber(pNum)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
