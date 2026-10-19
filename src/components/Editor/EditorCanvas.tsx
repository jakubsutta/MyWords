import React, { useState, useEffect } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { getFormatDimensions } from '../../utils/formatConfig';
import { EditorRuler } from './EditorRuler';
import { Edit3, BookOpen, Layers } from 'lucide-react';

interface Props {
  editor: Editor | null;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  onHeaderFooterChange: (settings: HeaderFooterSettings) => void;
  zoom: number;
  viewMode: 'pages' | 'continuous';
  pageRef: React.RefObject<HTMLDivElement | null>;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  onPageCountChange?: (count: number) => void;
}

// Convert integer to Roman numerals
function toRoman(num: number): string {
  const lookup: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90,
    L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
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

export const EditorCanvas: React.FC<Props> = ({
  editor,
  pageSettings,
  headerFooterSettings,
  onHeaderFooterChange,
  zoom,
  viewMode,
  pageRef,
  viewportRef,
  onPageCountChange,
}) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingFooter, setIsEditingFooter] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(1); // 1 = lichá/pravá, 2 = sudá/levá pro náhled knihy

  // Exact page dimension calculations in mm and cm
  const { widthMm, heightMm, widthCm, heightCm } = getFormatDimensions(
    pageSettings.format,
    pageSettings.orientation
  );

  // Margin calculation considering Book Mode and Gutter
  const isBookMode = pageSettings.layoutType === 'book' || pageSettings.mirrorMargins;
  const isSpreadView = isBookMode && (pageSettings.bookSpreadView ?? true);
  const isEvenPage = isBookMode && activePageIndex % 2 === 0;

  // In book mode: Odd pages have gutter on the left; Even pages have gutter on the right
  const gutter = pageSettings.gutter || 0;
  
  // Single page mode margins
  const effectiveLeftMargin = isBookMode
    ? (isEvenPage ? pageSettings.margins.right : pageSettings.margins.left + gutter)
    : pageSettings.margins.left;
  const effectiveRightMargin = isBookMode
    ? (isEvenPage ? pageSettings.margins.left + gutter : pageSettings.margins.right)
    : pageSettings.margins.right;

  // Spread view margins:
  // Left page (Sudá): Left = outer (right margin), Right = inner (left margin + gutter)
  const leftPageLeftMargin = pageSettings.margins.right;
  const leftPageRightMargin = pageSettings.margins.left + gutter;
  // Right page (Lichá): Left = inner (left margin + gutter), Right = outer (right margin)
  const rightPageLeftMargin = pageSettings.margins.left + gutter;
  const rightPageRightMargin = pageSettings.margins.right;

  // Calculate dynamic page count
  useEffect(() => {
    if (!pageRef.current || viewMode !== 'pages') return;

    const updatePageCount = () => {
      if (pageRef.current) {
        // 1mm ~ 3.7795px
        const pageHeightPx = heightMm * 3.7795;
        const scrollHeight = pageRef.current.scrollHeight;
        const calculated = Math.max(1, Math.ceil(scrollHeight / pageHeightPx));
        setPageCount(calculated);
        if (onPageCountChange) onPageCountChange(calculated);
      }
    };

    updatePageCount();
    if (editor) {
      editor.on('update', updatePageCount);
      return () => {
        editor.off('update', updatePageCount);
      };
    }
  }, [editor, heightMm, viewMode, onPageCountChange, pageRef]);

  // Headers & Footers text based on Odd/Even page
  const currentHeaderText = (isEvenPage && headerFooterSettings.differentOddEven && headerFooterSettings.evenHeaderText)
    ? headerFooterSettings.evenHeaderText
    : headerFooterSettings.headerText;

  const currentFooterText = (isEvenPage && headerFooterSettings.differentOddEven && headerFooterSettings.evenFooterText)
    ? headerFooterSettings.evenFooterText
    : headerFooterSettings.footerText;

  // Header / Footer for Spread view
  const leftPageHeaderText = (headerFooterSettings.differentOddEven && headerFooterSettings.evenHeaderText)
    ? headerFooterSettings.evenHeaderText
    : headerFooterSettings.headerText;
  const rightPageHeaderText = headerFooterSettings.headerText;

  const leftPageFooterText = (headerFooterSettings.differentOddEven && headerFooterSettings.evenFooterText)
    ? headerFooterSettings.evenFooterText
    : headerFooterSettings.footerText;
  const rightPageFooterText = headerFooterSettings.footerText;

  const headerAlignClass =
    headerFooterSettings.headerAlign === 'center'
      ? 'text-center'
      : headerFooterSettings.headerAlign === 'right'
      ? 'text-right'
      : 'text-left';

  const footerAlignClass =
    headerFooterSettings.footerAlign === 'center'
      ? 'text-center'
      : headerFooterSettings.footerAlign === 'right'
      ? 'text-right'
      : 'text-left';

  const pageNumberAlignClass =
    headerFooterSettings.pageNumberPosition === 'center'
      ? 'text-center'
      : headerFooterSettings.pageNumberPosition === 'right'
      ? 'text-right'
      : 'text-left';

  // Render page number string
  const renderPageNumber = (pageNo: number) => {
    switch (headerFooterSettings.pageNumbering) {
      case 'page':
        return `Strana ${pageNo}`;
      case 'page_of_total':
        return `Strana ${pageNo} z ${pageCount}`;
      case 'dash':
        return `— ${pageNo} —`;
      case 'roman':
        return toRoman(pageNo);
      default:
        return '';
    }
  };

  // Click anywhere on the paper page to activate typing / focus editor
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editor) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Do not interfere if user is clicking on interactive controls
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[data-drag-handle]') ||
      target.closest('.no-print') ||
      target.closest('[contenteditable="false"]')
    ) {
      return;
    }

    // If editor is already focused and click is directly within editable text,
    // ProseMirror handles cursor positioning natively.
    const isProseMirrorContent = !!target.closest(
      '.ProseMirror p, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror li, .ProseMirror blockquote, .ProseMirror td, .ProseMirror th'
    );

    if (editor.isFocused && isProseMirrorContent) {
      return;
    }

    const pmEl = editor.view.dom as HTMLElement | undefined;
    if (!pmEl) {
      editor.chain().focus().run();
      return;
    }

    const rect = pmEl.getBoundingClientRect();

    // If clicked below the content
    if (e.clientY > rect.bottom) {
      editor.chain().focus('end').run();
      return;
    }

    // If clicked above the content
    if (e.clientY < rect.top) {
      editor.chain().focus('start').run();
      return;
    }

    // Clamped coordinates inside the ProseMirror bounding box to resolve nearest line
    const clampedX = Math.max(rect.left + 8, Math.min(rect.right - 8, e.clientX));
    const posInfo = editor.view.posAtCoords({ left: clampedX, top: e.clientY });

    if (posInfo && typeof posInfo.pos === 'number') {
      editor.chain().focus().setTextSelection(posInfo.pos).run();
    } else {
      editor.chain().focus('end').run();
    }
  };

  return (
    <div
      ref={viewportRef}
      className="flex-1 bg-slate-200/80 overflow-auto p-3 sm:p-6 editor-viewport relative w-full"
    >
      <div className="min-w-fit min-h-full flex flex-col items-center justify-start mx-auto pb-10">
        {/* Book Mode Spread Bar */}
        {isBookMode && viewMode === 'pages' && (
          <div className="no-print mb-2.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-300 shadow-xs text-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-700">Režim kniha:</span>
            {isSpreadView ? (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-200 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-500" />
                Otevřená dvojstránka (Levá sudá + Pravá lichá se hřbetem)
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActivePageIndex(1)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                    activePageIndex % 2 === 1
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pravá (Lichá)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePageIndex(2)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                    activePageIndex % 2 === 0
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Levá (Sudá)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Zoom wrapper */}
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="flex flex-col items-center"
        >
          {/* Optional Page Ruler */}
          {viewMode === 'pages' && pageSettings.showRuler && (
            <div
              style={{ width: isSpreadView ? `${widthMm * 2}mm` : `${widthMm}mm` }}
              className="mb-1.5 shadow-2xs rounded-t overflow-hidden"
            >
              <EditorRuler pageSettings={pageSettings} widthMm={isSpreadView ? widthMm * 2 : widthMm} />
            </div>
          )}

          {/* ============================================================== */}
          {/* CASE A: FULL TWO-PAGE SPREAD VIEW (DVOJSTRÁNKA VEDLE SEBE)      */}
          {/* ============================================================== */}
          {isSpreadView && viewMode === 'pages' ? (
            <div className="flex items-stretch shadow-xl rounded-xs overflow-hidden border border-slate-300 relative bg-slate-300/40">
              {/* LEFT PAGE (SUDÁ STRÁNKA) */}
              <div
                className="paper-page relative flex flex-col transition-all border-r border-slate-300 overflow-hidden"
                style={{
                  backgroundColor: pageSettings.paperColor || '#ffffff',
                  width: `${widthMm}mm`,
                  height: `${heightMm}mm`,
                  maxHeight: `${heightMm}mm`,
                  paddingTop: `${pageSettings.margins.top}mm`,
                  paddingBottom: `${pageSettings.margins.bottom}mm`,
                  paddingLeft: `${leftPageLeftMargin}mm`,
                  paddingRight: `${leftPageRightMargin}mm`,
                }}
              >
                {/* Margin guides overlay for Left Page */}
                {pageSettings.showMarginGuides && (
                  <div
                    className="no-print absolute pointer-events-none z-10"
                    style={{
                      top: `${pageSettings.margins.top}mm`,
                      bottom: `${pageSettings.margins.bottom}mm`,
                      left: `${leftPageLeftMargin}mm`,
                      right: `${leftPageRightMargin}mm`,
                      border: '1px dashed rgba(244, 63, 94, 0.35)',
                      backgroundColor: 'rgba(244, 63, 94, 0.015)',
                    }}
                  >
                    <div className="absolute top-1 left-1 bg-rose-50/90 text-rose-700/80 border border-rose-200/80 text-[9px] px-1.5 py-0.5 rounded font-mono shadow-2xs select-none">
                      Levá (sudá): Vnější {(leftPageLeftMargin / 10).toFixed(1)} cm | Hřbet {(gutter / 10).toFixed(1)} cm
                    </div>
                  </div>
                )}

                {/* Gutter on the right side of the left page */}
                {pageSettings.showMarginGuides && gutter > 0 && (
                  <div
                    className="no-print absolute top-0 bottom-0 right-0 pointer-events-none z-10 bg-rose-500/5 border-l border-rose-400/35 border-dashed select-none flex items-center justify-center"
                    style={{ width: `${gutter}mm` }}
                  >
                    <span
                      className="text-[9px] text-rose-600/80 bg-white/90 border border-rose-100 px-1 py-0.5 rounded shadow-2xs font-mono tracking-widest uppercase font-medium"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      Hřbet {(gutter / 10).toFixed(1)} cm
                    </span>
                  </div>
                )}

                {/* Left Page Header */}
                {headerFooterSettings.showHeader && (
                  <div
                    className="absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center"
                    style={{
                      height: `${pageSettings.margins.top * 0.8}mm`,
                      paddingLeft: `${leftPageLeftMargin}mm`,
                      paddingRight: `${leftPageRightMargin}mm`,
                    }}
                  >
                    <span className="text-left w-full truncate">
                      {leftPageHeaderText || 'Záhlaví sudé stránky (autor / kniha)...'}
                    </span>
                  </div>
                )}

                {/* Left Page Content Showcase */}
                <div className="flex-1 w-full text-slate-600/80 text-xs leading-relaxed select-none pointer-events-none opacity-60">
                  <div className="space-y-3 font-serif">
                    <p className="font-semibold text-slate-700 text-sm">Kapitola I. Úvodní slovo</p>
                    <p>
                      Knižní rozvržení umožňuje precizní kompozici sazby s rozlišením vnitřních a vnějších okrajů.
                      Na levé (sudé) stránce přiléhá vnitřní okraj se hřbetem vazby k pravé hraně listu.
                    </p>
                    <p>
                      Díky tomu má čtenář v rukou otevřenou knihu a text v ohybu vazby nezapadá ani se nedeformuje.
                    </p>
                    <div className="w-16 h-0.5 bg-slate-300 mx-auto my-4" />
                    <p className="italic text-slate-500 text-[11px]">
                      (Levá strana dvojstránky s knižním zrcadlením okrajů)
                    </p>
                  </div>
                </div>

                {/* Left Page Footer */}
                {headerFooterSettings.showFooter && (
                  <div
                    className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center justify-between"
                    style={{
                      height: `${pageSettings.margins.bottom * 0.8}mm`,
                      paddingLeft: `${leftPageLeftMargin}mm`,
                      paddingRight: `${leftPageRightMargin}mm`,
                    }}
                  >
                    <span className="truncate">{leftPageFooterText}</span>
                    {headerFooterSettings.pageNumbering !== 'none' && (
                      <span className="font-mono text-[11px]">{renderPageNumber(2)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* SPINE / BOOK BINDING CENTER CREASE (HŘBET KNIHY) */}
              <div className="w-2.5 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 shrink-0 z-20 relative flex items-center justify-center shadow-inner">
                <div className="w-px h-full bg-slate-700/50" />
              </div>

              {/* RIGHT PAGE (LICHÁ STRÁNKA - LIVE ACTIVE EDITOR) */}
              <div
                ref={pageRef}
                onClick={handlePageClick}
                className="paper-page relative flex flex-col transition-all bg-white overflow-hidden cursor-text"
                style={{
                  backgroundColor: pageSettings.paperColor || '#ffffff',
                  width: `${widthMm}mm`,
                  height: `${heightMm}mm`,
                  maxHeight: `${heightMm}mm`,
                  paddingTop: `${pageSettings.margins.top}mm`,
                  paddingBottom: `${pageSettings.margins.bottom}mm`,
                  paddingLeft: `${rightPageLeftMargin}mm`,
                  paddingRight: `${rightPageRightMargin}mm`,
                }}
              >
                {/* Margin guides overlay for Right Page */}
                {pageSettings.showMarginGuides && (
                  <div
                    className="no-print absolute pointer-events-none z-10"
                    style={{
                      top: `${pageSettings.margins.top}mm`,
                      bottom: `${pageSettings.margins.bottom}mm`,
                      left: `${rightPageLeftMargin}mm`,
                      right: `${rightPageRightMargin}mm`,
                      border: '1px dashed rgba(244, 63, 94, 0.35)',
                      backgroundColor: 'rgba(244, 63, 94, 0.015)',
                    }}
                  >
                    <div className="absolute top-1 left-1 bg-rose-50/90 text-rose-700/80 border border-rose-200/80 text-[9px] px-1.5 py-0.5 rounded font-mono shadow-2xs select-none">
                      Pravá (lichá): Hřbet {(gutter / 10).toFixed(1)} cm | Vnější {(rightPageRightMargin / 10).toFixed(1)} cm
                    </div>
                  </div>
                )}

                {/* Gutter on the left side of the right page */}
                {pageSettings.showMarginGuides && gutter > 0 && (
                  <div
                    className="no-print absolute top-0 bottom-0 left-0 pointer-events-none z-10 bg-rose-500/5 border-r border-rose-400/35 border-dashed select-none flex items-center justify-center"
                    style={{ width: `${gutter}mm` }}
                  >
                    <span
                      className="text-[9px] text-rose-600/80 bg-white/90 border border-rose-100 px-1 py-0.5 rounded shadow-2xs font-mono tracking-widest uppercase font-medium"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Hřbet {(gutter / 10).toFixed(1)} cm
                    </span>
                  </div>
                )}

                {/* Right Page Header (Editable) */}
                {headerFooterSettings.showHeader && (
                  <div
                    className={`absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors ${headerAlignClass}`}
                    style={{
                      height: `${pageSettings.margins.top * 0.8}mm`,
                      paddingLeft: `${rightPageLeftMargin}mm`,
                      paddingRight: `${rightPageRightMargin}mm`,
                    }}
                    title="Dvojklikem nebo kliknutím upravíte záhlaví"
                    onClick={() => setIsEditingHeader(true)}
                  >
                    {isEditingHeader ? (
                      <input
                        type="text"
                        value={headerFooterSettings.headerText}
                        autoFocus
                        onBlur={() => setIsEditingHeader(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingHeader(false)}
                        onChange={(e) =>
                          onHeaderFooterChange({ ...headerFooterSettings, headerText: e.target.value })
                        }
                        className="w-full bg-white border border-blue-400 px-2 py-0.5 rounded text-xs text-slate-700 focus:outline-none"
                      />
                    ) : (
                      <div className={`w-full flex items-center justify-between ${headerAlignClass}`}>
                        <span className={headerAlignClass}>
                          {rightPageHeaderText || 'Klepnutím přidáte záhlaví...'}
                        </span>
                        <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                      </div>
                    )}
                  </div>
                )}

                {/* Editor Core Content (Active Live Editor) */}
                <div className="flex-1 w-full text-slate-800 focus:outline-none min-h-0 overflow-y-auto scrollbar-thin flex flex-col cursor-text">
                  <EditorContent editor={editor} className="h-full flex-1 flex flex-col" />
                </div>

                {/* Right Page Footer (Editable) */}
                {headerFooterSettings.showFooter && (
                  <div
                    className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors"
                    style={{
                      height: `${pageSettings.margins.bottom * 0.8}mm`,
                      paddingLeft: `${rightPageLeftMargin}mm`,
                      paddingRight: `${rightPageRightMargin}mm`,
                    }}
                    title="Dvojklikem nebo kliknutím upravíte zápatí"
                    onClick={() => setIsEditingFooter(true)}
                  >
                    {isEditingFooter ? (
                      <input
                        type="text"
                        value={headerFooterSettings.footerText}
                        autoFocus
                        onBlur={() => setIsEditingFooter(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingFooter(false)}
                        onChange={(e) =>
                          onHeaderFooterChange({ ...headerFooterSettings, footerText: e.target.value })
                        }
                        className="w-full bg-white border border-blue-400 px-2 py-0.5 rounded text-xs text-slate-700 focus:outline-none"
                      />
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <span className={footerAlignClass}>
                          {rightPageFooterText || 'Klepnutím přidáte zápatí...'}
                        </span>

                        {headerFooterSettings.pageNumbering !== 'none' && (
                          <span className={`font-mono text-[11px] ${pageNumberAlignClass}`}>
                            {renderPageNumber(1)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* CASE B: STANDARD SINGLE-PAGE VIEW (BĚŽNÝ JEDEN LIST)          */
            /* ============================================================== */
            <div
              ref={pageRef}
              onClick={handlePageClick}
              className={`paper-page relative flex flex-col transition-all cursor-text ${
                viewMode === 'pages'
                  ? 'rounded-xs border border-slate-300 shadow-md'
                  : 'w-full max-w-4xl rounded-lg shadow-sm border border-slate-200 my-4'
              }`}
              style={{
                backgroundColor: pageSettings.paperColor || '#ffffff',
                width: viewMode === 'pages' ? `${widthMm}mm` : '100%',
                minHeight: viewMode === 'pages' ? `${heightMm}mm` : '600px',
                height: viewMode === 'pages' && pageCount === 1 ? `${heightMm}mm` : undefined,
                paddingTop: `${pageSettings.margins.top}mm`,
                paddingBottom: `${pageSettings.margins.bottom}mm`,
                paddingLeft: `${effectiveLeftMargin}mm`,
                paddingRight: `${effectiveRightMargin}mm`,
              }}
            >
              {/* Visual margin guides overlay */}
              {pageSettings.showMarginGuides && (
                <div
                  className="no-print absolute inset-0 pointer-events-none z-10"
                  style={{
                    top: `${pageSettings.margins.top}mm`,
                    bottom: `${pageSettings.margins.bottom}mm`,
                    left: `${effectiveLeftMargin}mm`,
                    right: `${effectiveRightMargin}mm`,
                    border: '1px dashed rgba(244, 63, 94, 0.35)',
                    backgroundColor: 'rgba(244, 63, 94, 0.015)',
                  }}
                >
                  <div className="absolute top-1 left-1 bg-rose-50/90 text-rose-700/80 border border-rose-200/80 text-[9px] px-1.5 py-0.5 rounded font-mono shadow-2xs select-none">
                    Okraje: {(effectiveLeftMargin / 10).toFixed(1)} cm L / {(effectiveRightMargin / 10).toFixed(1)} cm P
                  </div>
                </div>
              )}

              {/* Gutter / Hřbet vazby visual stripe in book mode */}
              {pageSettings.showMarginGuides && isBookMode && gutter > 0 && (
                <div
                  className="no-print absolute top-0 bottom-0 pointer-events-none z-10 bg-rose-500/5 select-none flex items-center justify-center"
                  style={{
                    width: `${gutter}mm`,
                    left: isEvenPage ? 'auto' : 0,
                    right: isEvenPage ? 0 : 'auto',
                    borderRight: isEvenPage ? 'none' : '1px dashed rgba(244, 63, 94, 0.4)',
                    borderLeft: isEvenPage ? '1px dashed rgba(244, 63, 94, 0.4)' : 'none',
                  }}
                >
                  <span
                    className="text-[9px] text-rose-600/80 bg-white/90 border border-rose-100 px-1 py-0.5 rounded shadow-2xs font-mono tracking-widest uppercase font-medium"
                    style={{ writingMode: 'vertical-rl', transform: isEvenPage ? undefined : 'rotate(180deg)' }}
                  >
                    Hřbet {(gutter / 10).toFixed(1)} cm
                  </span>
                </div>
              )}

              {/* Header */}
              {headerFooterSettings.showHeader && (
                <div
                  className={`absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors ${headerAlignClass}`}
                  style={{
                    height: `${pageSettings.margins.top * 0.8}mm`,
                    paddingLeft: `${effectiveLeftMargin}mm`,
                    paddingRight: `${effectiveRightMargin}mm`,
                  }}
                  title="Dvojklikem nebo kliknutím upravíte záhlaví"
                  onClick={() => setIsEditingHeader(true)}
                >
                  {isEditingHeader ? (
                    <input
                      type="text"
                      value={currentHeaderText}
                      autoFocus
                      onBlur={() => setIsEditingHeader(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingHeader(false)}
                      onChange={(e) => {
                        if (isEvenPage && headerFooterSettings.differentOddEven) {
                          onHeaderFooterChange({ ...headerFooterSettings, evenHeaderText: e.target.value });
                        } else {
                          onHeaderFooterChange({ ...headerFooterSettings, headerText: e.target.value });
                        }
                      }}
                      className="w-full bg-white border border-blue-400 px-2 py-0.5 rounded text-xs text-slate-700 focus:outline-none"
                    />
                  ) : (
                    <div className={`w-full flex items-center justify-between ${headerAlignClass}`}>
                      <span className={headerAlignClass}>
                        {currentHeaderText || 'Klepnutím přidáte záhlaví...'}
                      </span>
                      <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic visual page break dividers for multi-page document */}
              {viewMode === 'pages' && pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, idx) => {
                const pNum = idx + 1;
                return (
                  <div
                    key={pNum}
                    className="no-print absolute left-0 right-0 pointer-events-none z-15 flex flex-col items-center"
                    style={{ top: `${pNum * heightMm}mm`, transform: 'translateY(-50%)' }}
                  >
                    <div className="w-[calc(100%+24px)] -mx-3 h-7 bg-slate-200/95 shadow-inner border-y border-slate-300/80 flex items-center justify-center">
                      <span className="bg-white/95 text-slate-600 font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Konec strany {pNum} • Začátek strany {pNum + 1} ({widthCm} × {heightCm} cm)
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Editor Core Content */}
              <div className="flex-1 w-full text-slate-800 focus:outline-none min-h-0 flex flex-col cursor-text">
                <EditorContent editor={editor} className="h-full flex-1 flex flex-col" />
              </div>

              {/* Page Count */}
              {viewMode === 'pages' && pageCount > 1 && (
                <div className="no-print absolute right-2 bottom-12 flex flex-col items-end gap-1 pointer-events-none opacity-40">
                  <span className="text-[10px] font-mono bg-slate-800 text-white px-1.5 py-0.5 rounded">
                    Celkem cca {pageCount} {pageCount === 1 ? 'strana' : pageCount < 5 ? 'strany' : 'stran'}
                  </span>
                </div>
              )}

              {/* Footer */}
              {headerFooterSettings.showFooter && (
                <div
                  className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors"
                  style={{
                    height: `${pageSettings.margins.bottom * 0.8}mm`,
                    paddingLeft: `${effectiveLeftMargin}mm`,
                    paddingRight: `${effectiveRightMargin}mm`,
                  }}
                  title="Dvojklikem nebo kliknutím upravíte zápatí"
                  onClick={() => setIsEditingFooter(true)}
                >
                  {isEditingFooter ? (
                    <input
                      type="text"
                      value={currentFooterText}
                      autoFocus
                      onBlur={() => setIsEditingFooter(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingFooter(false)}
                      onChange={(e) => {
                        if (isEvenPage && headerFooterSettings.differentOddEven) {
                          onHeaderFooterChange({ ...headerFooterSettings, evenFooterText: e.target.value });
                        } else {
                          onHeaderFooterChange({ ...headerFooterSettings, footerText: e.target.value });
                        }
                      }}
                      className="w-full bg-white border border-blue-400 px-2 py-0.5 rounded text-xs text-slate-700 focus:outline-none"
                    />
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className={footerAlignClass}>
                        {currentFooterText || 'Klepnutím přidáte zápatí...'}
                      </span>

                      {headerFooterSettings.pageNumbering !== 'none' && (
                        <span className={`font-mono text-[11px] ${pageNumberAlignClass}`}>
                          {renderPageNumber(activePageIndex)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
