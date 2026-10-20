import React, { useState, useEffect, useMemo } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { getFormatDimensions } from '../../utils/formatConfig';
import { paginateHtml } from '../../utils/pagination';
import { EditorRuler } from './EditorRuler';
import {
  Edit3,
  BookOpen,
  Eye,
  Scissors,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
  pageSettings: PageSettings;
  onPageSettingsChange?: (settings: PageSettings) => void;
  headerFooterSettings: HeaderFooterSettings;
  onHeaderFooterChange: (settings: HeaderFooterSettings) => void;
  zoom: number;
  viewMode: 'pages' | 'continuous';
  pageRef: React.RefObject<HTMLDivElement | null>;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  onPageCountChange?: (count: number) => void;
  onOpenPreview?: () => void;
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

export const EditorCanvas: React.FC<Props> = ({
  editor,
  pageSettings,
  onPageSettingsChange,
  headerFooterSettings,
  onHeaderFooterChange,
  zoom,
  viewMode,
  pageRef,
  viewportRef,
  onPageCountChange,
  onOpenPreview,
}) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingFooter, setIsEditingFooter] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [activeSpreadIndex, setActiveSpreadIndex] = useState(0);

  // Exact page dimension calculations in mm and cm
  const { widthMm, heightMm, widthCm, heightCm } = getFormatDimensions(
    pageSettings.format,
    pageSettings.orientation
  );

  // Margin calculation considering Book Mode and Gutter
  const isBookMode = pageSettings.layoutType === 'book' || pageSettings.mirrorMargins;
  const isSpreadView = isBookMode && (pageSettings.bookSpreadView ?? true);
  const gutter = pageSettings.gutter || 0;

  // Single page mode margins (default odd/right page has gutter on left)
  const defaultLeftMargin = isBookMode ? pageSettings.margins.left + gutter : pageSettings.margins.left;
  const defaultRightMargin = pageSettings.margins.right;

  // Paginate current editor content for Spread View
  const paginatedPages = useMemo(() => {
    const html = editor ? editor.getHTML() : '';
    return paginateHtml(html, pageSettings);
  }, [editor, pageSettings, editor?.state.doc]);

  const totalPages = Math.max(1, Math.max(pageCount, paginatedPages.length));
  const totalSpreads = Math.ceil((totalPages + 1) / 2);

  useEffect(() => {
    if (onPageCountChange) {
      onPageCountChange(totalPages);
    }
  }, [totalPages, onPageCountChange]);

  // Calculate dynamic page count and listen to resize
  useEffect(() => {
    if (!pageRef.current || viewMode !== 'pages') return;

    const updatePageCount = () => {
      if (pageRef.current) {
        // 1mm ~ 3.7795px
        const pageHeightPx = heightMm * 3.7795;
        const scrollHeight = pageRef.current.scrollHeight;
        const explicitBreaks = pageRef.current.querySelectorAll('[data-page-break], .mywords-page-break').length;
        const heightBasedPages = Math.max(1, Math.ceil(scrollHeight / pageHeightPx));
        const calculated = Math.max(heightBasedPages, explicitBreaks + 1);
        setPageCount(calculated);
        if (onPageCountChange) onPageCountChange(calculated);
      }
    };

    updatePageCount();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && pageRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updatePageCount();
      });
      resizeObserver.observe(pageRef.current);
    }

    if (editor) {
      editor.on('update', updatePageCount);
      return () => {
        editor.off('update', updatePageCount);
        if (resizeObserver) resizeObserver.disconnect();
      };
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [editor, heightMm, viewMode, onPageCountChange, pageRef]);

  // Render page number string
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

  const getPageHeaderText = (pageNo: number) => {
    if (pageNo % 2 === 0 && headerFooterSettings.differentOddEven && headerFooterSettings.evenHeaderText) {
      return headerFooterSettings.evenHeaderText;
    }
    return headerFooterSettings.headerText;
  };

  const getPageFooterText = (pageNo: number) => {
    if (pageNo % 2 === 0 && headerFooterSettings.differentOddEven && headerFooterSettings.evenFooterText) {
      return headerFooterSettings.evenFooterText;
    }
    return headerFooterSettings.footerText;
  };

  const getEffectiveHeaderAlign = (isEven: boolean): 'left' | 'center' | 'right' => {
    const align = headerFooterSettings.headerAlign || 'right';
    if (align === 'center') return 'center';
    if (headerFooterSettings.differentOddEven) {
      if (align === 'right') return isEven ? 'left' : 'right';
      if (align === 'left') return isEven ? 'right' : 'left';
    }
    return align;
  };

  const getEffectiveFooterAlign = (isEven: boolean): 'left' | 'center' | 'right' => {
    const align = headerFooterSettings.footerAlign || 'left';
    if (align === 'center') return 'center';
    if (headerFooterSettings.differentOddEven) {
      if (align === 'left') return isEven ? 'right' : 'left';
      if (align === 'right') return isEven ? 'left' : 'right';
    }
    return align;
  };

  const getEffectivePageNumAlign = (isEven: boolean): 'left' | 'center' | 'right' => {
    const pos = headerFooterSettings.pageNumberPosition || 'right';
    if (pos === 'center') return 'center';
    if (isBookMode || headerFooterSettings.differentOddEven) {
      if (pos === 'right') return isEven ? 'left' : 'right';
      if (pos === 'left') return isEven ? 'right' : 'left';
    }
    return pos;
  };

  const renderHeaderContent = (pNum: number, isEven: boolean) => {
    const text = getPageHeaderText(pNum);
    const align = getEffectiveHeaderAlign(isEven);

    return (
      <div
        className={`w-full flex items-center min-w-0 ${
          align === 'left'
            ? 'justify-start text-left'
            : align === 'center'
            ? 'justify-center text-center'
            : 'justify-end text-right'
        }`}
      >
        <span className="truncate font-serif italic text-slate-500 text-xs">
          {text || 'Klepnutím přidáte záhlaví...'}
        </span>
      </div>
    );
  };

  const renderFooterContent = (pNum: number, isEven: boolean) => {
    const text = getPageFooterText(pNum);
    const showNumber = headerFooterSettings.pageNumbering !== 'none';
    const pageNumNode = showNumber ? (
      <span className="font-mono text-[11px] font-semibold text-slate-600 shrink-0">
        {renderPageNumber(pNum)}
      </span>
    ) : null;
    const textNode = text ? (
      <span className="truncate text-slate-400 text-[11px] font-serif">
        {text}
      </span>
    ) : null;

    const textCol = getEffectiveFooterAlign(isEven);
    const numCol = getEffectivePageNumAlign(isEven);

    return (
      <div className="w-full grid grid-cols-3 items-center text-xs">
        {/* Col 1: Left */}
        <div className="flex items-center justify-start gap-2 min-w-0 overflow-hidden">
          {numCol === 'left' && pageNumNode}
          {textCol === 'left' && textNode}
        </div>

        {/* Col 2: Center */}
        <div className="flex items-center justify-center gap-2 min-w-0 text-center overflow-hidden">
          {textCol === 'center' && textNode}
          {numCol === 'center' && pageNumNode}
        </div>

        {/* Col 3: Right */}
        <div className="flex items-center justify-end gap-2 min-w-0 text-right overflow-hidden">
          {textCol === 'right' && textNode}
          {numCol === 'right' && pageNumNode}
        </div>
      </div>
    );
  };

  const getPageMargins = (pageNo: number) => {
    if (isBookMode) {
      if (pageNo % 2 === 0) {
        // Even (Left page): inner gutter on right
        return {
          left: pageSettings.margins.right,
          right: pageSettings.margins.left + gutter,
        };
      } else {
        // Odd (Right page): inner gutter on left
        return {
          left: pageSettings.margins.left + gutter,
          right: pageSettings.margins.right,
        };
      }
    }
    return {
      left: pageSettings.margins.left,
      right: pageSettings.margins.right,
    };
  };

  // Click anywhere on the paper page to activate typing / focus editor
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editor) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[data-drag-handle]') ||
      target.closest('.no-print') ||
      target.closest('[contenteditable="false"]') ||
      target.closest('.ProseMirror')
    ) {
      return;
    }

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

    if (e.clientY > rect.bottom) {
      editor.chain().focus('end').run();
      return;
    }

    if (e.clientY < rect.top) {
      editor.chain().focus('start').run();
      return;
    }

    const clampedX = Math.max(rect.left + 8, Math.min(rect.right - 8, e.clientX));
    const posInfo = editor.view.posAtCoords({ left: clampedX, top: e.clientY });

    if (posInfo && typeof posInfo.pos === 'number') {
      editor.chain().focus().setTextSelection(posInfo.pos).run();
    } else {
      editor.chain().focus('end').run();
    }
  };

  const handleInsertPageBreak = () => {
    if (editor) {
      editor.chain().focus().setPageBreak().run();
    }
  };

  // Spread calculations
  const spreadLeftPageNum = activeSpreadIndex === 0 ? null : activeSpreadIndex * 2;
  const spreadRightPageNum = activeSpreadIndex === 0 ? 1 : activeSpreadIndex * 2 + 1;

  const spreadLeftContent =
    spreadLeftPageNum && spreadLeftPageNum <= paginatedPages.length
      ? paginatedPages[spreadLeftPageNum - 1]
      : '';
  const spreadRightContent =
    spreadRightPageNum && spreadRightPageNum <= paginatedPages.length
      ? paginatedPages[spreadRightPageNum - 1]
      : '';

  return (
    <div
      ref={viewportRef}
      className="flex-1 bg-slate-200/80 overflow-auto p-3 sm:p-6 editor-viewport relative w-full"
    >
      <div className="min-w-fit min-h-full flex flex-col items-center justify-start mx-auto pb-16">
        {/* Book Mode Control Bar (Banner) */}
        {isBookMode && viewMode === 'pages' && (
          <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-xl border border-indigo-200 shadow-xs text-xs max-w-4xl w-full">
            {/* Left Info */}
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">Knižní rozvržení: </span>
                <span className="text-slate-600 font-mono text-[11px]">
                  {widthCm} × {heightCm} cm • Hřbet {(gutter / 10).toFixed(1)} cm
                </span>
              </div>
            </div>

            {/* Middle: Spread Navigator (If in Spread View) */}
            {isSpreadView && (
              <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200 px-2 py-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveSpreadIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeSpreadIndex === 0}
                  className="p-1 text-slate-500 hover:text-indigo-700 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-indigo-100 transition-colors"
                  title="Předchozí dvojstránka"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-semibold text-indigo-900 px-1">
                  {activeSpreadIndex === 0
                    ? 'Titul (Strana 1)'
                    : `Strany ${spreadLeftPageNum} – ${Math.min(totalPages, spreadRightPageNum)}`}
                  <span className="text-indigo-400 font-normal ml-1">
                    ({activeSpreadIndex + 1}/{totalSpreads})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1))}
                  disabled={activeSpreadIndex >= totalSpreads - 1}
                  className="p-1 text-slate-500 hover:text-indigo-700 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-indigo-100 transition-colors"
                  title="Další dvojstránka"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Right: Toggle Dvojstránka vs 1 Stránka + Náhled */}
            <div className="flex items-center gap-2">
              {onPageSettingsChange && (
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      onPageSettingsChange({
                        ...pageSettings,
                        bookSpreadView: false,
                      })
                    }
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                      !isSpreadView
                        ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Zobrazit stránky za sebou pro plynulé psaní"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>1 stránka</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onPageSettingsChange({
                        ...pageSettings,
                        bookSpreadView: true,
                      })
                    }
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isSpreadView
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Zobrazit knižní dvojstránku vedle sebe (Levá sudá + Pravá lichá)"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Dvojstránka</span>
                  </button>
                </div>
              )}

              {onOpenPreview && (
                <button
                  type="button"
                  onClick={onOpenPreview}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Otevřít čistý tiskový náhled bez editačních prvků"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Náhled</span>
                </button>
              )}
            </div>
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
              style={{
                width: isSpreadView ? `${widthMm * 2 + 10}mm` : `${widthMm}mm`,
              }}
              className="mb-1.5 shadow-2xs rounded-t overflow-hidden"
            >
              <EditorRuler
                pageSettings={pageSettings}
                widthMm={isSpreadView ? widthMm * 2 + 10 : widthMm}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* CASE A: DVOJSTRÁNKA VEDLE SEBE (KNIŽNÍ SPREAD VIEW)             */}
          {/* ============================================================== */}
          {isSpreadView && viewMode === 'pages' ? (
            <div className="flex flex-col items-center">
              <div className="flex items-stretch shadow-2xl rounded-xs border border-slate-400 bg-white relative">
                {/* LEFT PAGE (SUDÁ STRÁNKA) */}
                {spreadLeftPageNum ? (
                  <div
                    className="paper-page relative flex flex-col transition-all border-r border-slate-300 overflow-hidden"
                    style={{
                      backgroundColor: pageSettings.paperColor || '#ffffff',
                      width: `${widthMm}mm`,
                      height: `${heightMm}mm`,
                      paddingTop: `${pageSettings.margins.top}mm`,
                      paddingBottom: `${pageSettings.margins.bottom}mm`,
                      paddingLeft: `${pageSettings.margins.right}mm`, // Outer margin
                      paddingRight: `${pageSettings.margins.left + gutter}mm`, // Inner gutter margin
                    }}
                  >
                    {/* Margin guides for Left Page */}
                    {pageSettings.showMarginGuides && (
                      <div
                        className="no-print absolute pointer-events-none z-10"
                        style={{
                          top: `${pageSettings.margins.top}mm`,
                          bottom: `${pageSettings.margins.bottom}mm`,
                          left: `${pageSettings.margins.right}mm`,
                          right: `${pageSettings.margins.left + gutter}mm`,
                          border: '1px dashed rgba(244, 63, 94, 0.35)',
                          backgroundColor: 'rgba(244, 63, 94, 0.015)',
                        }}
                      >
                        <div className="absolute top-1 left-1 bg-rose-50/90 text-rose-700 border border-rose-200 text-[9px] px-1.5 py-0.5 rounded font-mono shadow-2xs select-none">
                          Levá (sudá): Strana {spreadLeftPageNum} • Hřbet {(gutter / 10).toFixed(1)} cm
                        </div>
                      </div>
                    )}

                    {/* Gutter Guide on right side of Left page */}
                    {pageSettings.showMarginGuides && gutter > 0 && (
                      <div
                        className="no-print absolute top-0 bottom-0 right-0 pointer-events-none z-10 bg-rose-500/5 border-l border-dashed border-rose-400/40 select-none flex items-center justify-center"
                        style={{ width: `${gutter}mm` }}
                      >
                        <span
                          className="text-[9px] text-rose-600/80 bg-white/90 border border-rose-100 px-1 py-0.5 rounded shadow-2xs font-mono tracking-widest uppercase font-medium"
                          style={{ writingMode: 'vertical-rl' }}
                        >
                          Hřbet
                        </span>
                      </div>
                    )}

                    {/* Left Page Header */}
                    {headerFooterSettings.showHeader && (
                      <div
                        className="absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center"
                        style={{
                          height: `${pageSettings.margins.top * 0.8}mm`,
                          paddingLeft: `${pageSettings.margins.right}mm`,
                          paddingRight: `${pageSettings.margins.left + gutter}mm`,
                        }}
                      >
                        {renderHeaderContent(spreadLeftPageNum, true)}
                      </div>
                    )}

                    {/* Left Page Content */}
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        if (spreadLeftPageNum) {
                          const updated = [...paginatedPages];
                          updated[spreadLeftPageNum - 1] = e.currentTarget.innerHTML;
                          if (editor) editor.commands.setContent(updated.join(''));
                        }
                      }}
                      className="flex-1 w-full overflow-y-auto text-slate-800 prose prose-slate max-w-none text-xs leading-relaxed focus:outline-none scrollbar-thin select-text"
                      dangerouslySetInnerHTML={{ __html: spreadLeftContent }}
                    />

                    {/* Left Page Footer */}
                    {headerFooterSettings.showFooter && (
                      <div
                        className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center"
                        style={{
                          height: `${pageSettings.margins.bottom * 0.8}mm`,
                          paddingLeft: `${pageSettings.margins.right}mm`,
                          paddingRight: `${pageSettings.margins.left + gutter}mm`,
                        }}
                      >
                        {renderFooterContent(spreadLeftPageNum, true)}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Inside Cover for Title Spread */
                  <div
                    className="paper-page relative flex flex-col items-center justify-center bg-slate-50 border-r border-slate-300 text-slate-400 text-xs italic font-serif"
                    style={{
                      width: `${widthMm}mm`,
                      height: `${heightMm}mm`,
                    }}
                  >
                    <span>(Vnitřní strana přebalu)</span>
                  </div>
                )}

                {/* SPINE CREASE IN THE MIDDLE */}
                <div className="w-3 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 shrink-0 z-20 relative flex items-center justify-center shadow-inner">
                  <div className="w-px h-full bg-slate-700/60" />
                </div>

                {/* RIGHT PAGE (LICHÁ STRÁNKA) */}
                <div
                  ref={pageRef}
                  onClick={handlePageClick}
                  className="paper-page relative flex flex-col transition-all bg-white overflow-hidden cursor-text"
                  style={{
                    backgroundColor: pageSettings.paperColor || '#ffffff',
                    width: `${widthMm}mm`,
                    height: `${heightMm}mm`,
                    paddingTop: `${pageSettings.margins.top}mm`,
                    paddingBottom: `${pageSettings.margins.bottom}mm`,
                    paddingLeft: `${pageSettings.margins.left + gutter}mm`, // Inner gutter margin
                    paddingRight: `${pageSettings.margins.right}mm`, // Outer margin
                  }}
                >
                  {/* Margin guides for Right Page */}
                  {pageSettings.showMarginGuides && (
                    <div
                      className="no-print absolute pointer-events-none z-10"
                      style={{
                        top: `${pageSettings.margins.top}mm`,
                        bottom: `${pageSettings.margins.bottom}mm`,
                        left: `${pageSettings.margins.left + gutter}mm`,
                        right: `${pageSettings.margins.right}mm`,
                        border: '1px dashed rgba(244, 63, 94, 0.35)',
                        backgroundColor: 'rgba(244, 63, 94, 0.015)',
                      }}
                    >
                      <div className="absolute top-1 left-1 bg-rose-50/90 text-rose-700 border border-rose-200 text-[9px] px-1.5 py-0.5 rounded font-mono shadow-2xs select-none">
                        Pravá (lichá): Strana {spreadRightPageNum} • Hřbet {(gutter / 10).toFixed(1)} cm
                      </div>
                    </div>
                  )}

                  {/* Gutter Guide on left side of Right page */}
                  {pageSettings.showMarginGuides && gutter > 0 && (
                    <div
                      className="no-print absolute top-0 bottom-0 left-0 pointer-events-none z-10 bg-rose-500/5 border-r border-dashed border-rose-400/40 select-none flex items-center justify-center"
                      style={{ width: `${gutter}mm` }}
                    >
                      <span
                        className="text-[9px] text-rose-600/80 bg-white/90 border border-rose-100 px-1 py-0.5 rounded shadow-2xs font-mono tracking-widest uppercase font-medium"
                        style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                        }}
                      >
                        Hřbet
                      </span>
                    </div>
                  )}

                  {/* Right Page Header */}
                  {headerFooterSettings.showHeader && (
                    <div
                      className="absolute top-0 left-0 right-0 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center"
                      style={{
                        height: `${pageSettings.margins.top * 0.8}mm`,
                        paddingLeft: `${pageSettings.margins.left + gutter}mm`,
                        paddingRight: `${pageSettings.margins.right}mm`,
                      }}
                    >
                      {renderHeaderContent(spreadRightPageNum, false)}
                    </div>
                  )}

                  {/* Right Page Content */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (spreadRightPageNum) {
                        const updated = [...paginatedPages];
                        updated[spreadRightPageNum - 1] = e.currentTarget.innerHTML;
                        if (editor) editor.commands.setContent(updated.join(''));
                      }
                    }}
                    className="flex-1 w-full overflow-y-auto text-slate-800 prose prose-slate max-w-none text-xs leading-relaxed focus:outline-none scrollbar-thin select-text"
                    dangerouslySetInnerHTML={{ __html: spreadRightContent }}
                  />

                  {/* Right Page Footer */}
                  {headerFooterSettings.showFooter && (
                    <div
                      className="absolute bottom-0 left-0 right-0 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center"
                      style={{
                        height: `${pageSettings.margins.bottom * 0.8}mm`,
                        paddingLeft: `${pageSettings.margins.left + gutter}mm`,
                        paddingRight: `${pageSettings.margins.right}mm`,
                      }}
                    >
                      {renderFooterContent(spreadRightPageNum, false)}
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden EditorContent to preserve TipTap instance and shortcuts in Spread View */}
              <div className="hidden" aria-hidden="true">
                <EditorContent editor={editor} />
              </div>

              {/* Bottom Spread Switcher Pill */}
              <div className="no-print mt-3 flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs text-xs">
                <span className="text-slate-500 text-[11px]">Listování knihou:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSpreads }).map((_, sIdx) => {
                    const lNum = sIdx === 0 ? null : sIdx * 2;
                    const rNum = sIdx === 0 ? 1 : sIdx * 2 + 1;
                    return (
                      <button
                        key={`spread-pill-${sIdx}`}
                        type="button"
                        onClick={() => setActiveSpreadIndex(sIdx)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all ${
                          activeSpreadIndex === sIdx
                            ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        title={sIdx === 0 ? 'Titulní strana' : `Dvojstránka ${lNum}–${rNum}`}
                      >
                        {sIdx === 0 ? '1' : `${lNum}-${rNum}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* CASE B: CONTINUOUS SEQUENTIAL PAGES (1 STRÁNKA ZA SEBOU)       */
            /* ============================================================== */
            <div
              ref={pageRef}
              onClick={handlePageClick}
              className={`paper-page relative flex flex-col transition-all cursor-text ${
                viewMode === 'pages'
                  ? 'rounded-xs border border-slate-300 shadow-xl'
                  : 'w-full max-w-4xl rounded-lg shadow-sm border border-slate-200 my-4'
              }`}
              style={{
                backgroundColor: pageSettings.paperColor || '#ffffff',
                width: viewMode === 'pages' ? `${widthMm}mm` : '100%',
                minHeight: viewMode === 'pages' ? `${totalPages * heightMm}mm` : '600px',
                paddingTop: `${pageSettings.margins.top}mm`,
                paddingBottom: `${pageSettings.margins.bottom}mm`,
                paddingLeft: `${defaultLeftMargin}mm`,
                paddingRight: `${defaultRightMargin}mm`,
              }}
            >
              {/* Visual Header / Footer / Gutters for EVERY Page in Pages View */}
              {viewMode === 'pages' &&
                Array.from({ length: totalPages }).map((_, pIdx) => {
                  const pNum = pIdx + 1;
                  const isEven = pNum % 2 === 0;
                  const pageMargins = getPageMargins(pNum);
                  const pageTopMm = pIdx * heightMm;
                  const pageBottomMm = (pIdx + 1) * heightMm;

                  return (
                    <React.Fragment key={`page-layer-${pNum}`}>
                      {/* Page Margin Guides Box (if enabled) */}
                      {pageSettings.showMarginGuides && (
                        <div
                          className="no-print absolute pointer-events-none z-10"
                          style={{
                            top: `${pageTopMm + pageSettings.margins.top}mm`,
                            height: `${heightMm - pageSettings.margins.top - pageSettings.margins.bottom}mm`,
                            left: `${pageMargins.left}mm`,
                            right: `${pageMargins.right}mm`,
                            border: '1px dashed rgba(244, 63, 94, 0.35)',
                            backgroundColor: 'rgba(244, 63, 94, 0.012)',
                          }}
                        >
                          <div className="absolute top-1 left-1 bg-rose-50/90 text-rose-700 border border-rose-200 text-[9px] px-1.5 py-0.5 rounded font-mono shadow-2xs select-none flex items-center gap-1">
                            <span>Strana {pNum}</span>
                            {isBookMode && (
                              <span className="font-semibold text-indigo-700">
                                ({isEven ? 'Levá / Sudá' : 'Pravá / Lichá'})
                              </span>
                            )}
                            <span>•</span>
                            <span>{(pageMargins.left / 10).toFixed(1)} cm L / {(pageMargins.right / 10).toFixed(1)} cm P</span>
                          </div>
                        </div>
                      )}

                      {/* Gutter / Hřbet Stripe in Book Mode */}
                      {pageSettings.showMarginGuides && isBookMode && gutter > 0 && (
                        <div
                          className="no-print absolute pointer-events-none z-10 bg-rose-500/5 select-none flex items-center justify-center"
                          style={{
                            top: `${pageTopMm}mm`,
                            height: `${heightMm}mm`,
                            width: `${gutter}mm`,
                            left: isEven ? 'auto' : 0,
                            right: isEven ? 0 : 'auto',
                            borderRight: isEven ? 'none' : '1px dashed rgba(244, 63, 94, 0.4)',
                            borderLeft: isEven ? '1px dashed rgba(244, 63, 94, 0.4)' : 'none',
                          }}
                        >
                          <span
                            className="text-[9px] text-rose-600/80 bg-white/90 border border-rose-100 px-1 py-0.5 rounded shadow-2xs font-mono tracking-widest uppercase font-medium"
                            style={{
                              writingMode: 'vertical-rl',
                              transform: isEven ? undefined : 'rotate(180deg)',
                            }}
                          >
                            Hřbet {(gutter / 10).toFixed(1)} cm
                          </span>
                        </div>
                      )}

                      {/* Page Header */}
                      {headerFooterSettings.showHeader && (
                        <div
                          className={`absolute left-0 right-0 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 transition-colors`}
                          style={{
                            top: `${pageTopMm + (pNum > 1 ? 4 : 0)}mm`,
                            height: `${Math.max(8, pageSettings.margins.top * 0.75)}mm`,
                            paddingLeft: `${pageMargins.left}mm`,
                            paddingRight: `${pageMargins.right}mm`,
                          }}
                          title="Kliknutím upravíte záhlaví"
                          onClick={() => setIsEditingHeader(true)}
                        >
                          {isEditingHeader && pNum === 1 ? (
                            <input
                              type="text"
                              value={getPageHeaderText(pNum)}
                              autoFocus
                              onBlur={() => setIsEditingHeader(false)}
                              onKeyDown={(e) => e.key === 'Enter' && setIsEditingHeader(false)}
                              onChange={(e) => {
                                if (isEven && headerFooterSettings.differentOddEven) {
                                  onHeaderFooterChange({ ...headerFooterSettings, evenHeaderText: e.target.value });
                                } else {
                                  onHeaderFooterChange({ ...headerFooterSettings, headerText: e.target.value });
                                }
                              }}
                              className="w-full bg-white border border-blue-400 px-2 py-0.5 rounded text-xs text-slate-700 focus:outline-none"
                            />
                          ) : (
                            <div className="w-full flex items-center justify-between">
                              {renderHeaderContent(pNum, isEven)}
                              <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Page Footer */}
                      {headerFooterSettings.showFooter && (
                        <div
                          className="absolute left-0 right-0 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 transition-colors"
                          style={{
                            top: `${pageBottomMm - pageSettings.margins.bottom * 0.75 - 4}mm`,
                            height: `${Math.max(8, pageSettings.margins.bottom * 0.75)}mm`,
                            paddingLeft: `${pageMargins.left}mm`,
                            paddingRight: `${pageMargins.right}mm`,
                          }}
                          title="Kliknutím upravíte zápatí"
                          onClick={() => setIsEditingFooter(true)}
                        >
                          {isEditingFooter && pNum === 1 ? (
                            <input
                              type="text"
                              value={getPageFooterText(pNum)}
                              autoFocus
                              onBlur={() => setIsEditingFooter(false)}
                              onKeyDown={(e) => e.key === 'Enter' && setIsEditingFooter(false)}
                              onChange={(e) => {
                                if (isEven && headerFooterSettings.differentOddEven) {
                                  onHeaderFooterChange({ ...headerFooterSettings, evenFooterText: e.target.value });
                                } else {
                                  onHeaderFooterChange({ ...headerFooterSettings, footerText: e.target.value });
                                }
                              }}
                              className="w-full bg-white border border-blue-400 px-2 py-0.5 rounded text-xs text-slate-700 focus:outline-none"
                            />
                          ) : (
                            <div className="w-full flex items-center justify-between">
                              {renderFooterContent(pNum, isEven)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Page Break Gap / Sheet Divider (Between pages) */}
                      {pNum < totalPages && (
                        <div
                          className="no-print absolute left-0 right-0 pointer-events-auto z-15 flex items-center justify-center group"
                          style={{ top: `${pageBottomMm}mm`, transform: 'translateY(-50%)' }}
                        >
                          <div className="w-[calc(100%+32px)] -mx-4 h-0 border-b border-dashed border-slate-300 relative flex items-center justify-between px-4">
                            <span className="bg-white text-slate-500 font-mono text-[9px] px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs font-semibold flex items-center gap-1.5 select-none -my-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Konec strany {pNum} {isBookMode ? (isEven ? '(Levá)' : '(Pravá)') : ''} ── Začátek strany {pNum + 1} ({widthCm} × {heightCm} cm)
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInsertPageBreak();
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white font-medium text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs cursor-pointer -my-2"
                              title="Vložit zalomení stránky na pozici kurzoru (Ctrl+Enter)"
                            >
                              <Scissors className="w-3 h-3" />
                              <span>Vložit zalomení (Ctrl+Enter)</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

              {/* Continuous Editor Content Core */}
              <div className="flex-1 w-full text-slate-800 focus:outline-none min-h-0 flex flex-col cursor-text relative z-5">
                <EditorContent editor={editor} className="h-full flex-1 flex flex-col" />
              </div>

              {/* Total Page Count Badge at bottom right of canvas */}
              {viewMode === 'pages' && totalPages > 1 && (
                <div className="no-print absolute right-3 bottom-3 flex items-center gap-1.5 pointer-events-none opacity-60 z-20">
                  <span className="text-[10px] font-mono bg-slate-800 text-white px-2 py-0.5 rounded-md shadow-xs">
                    Celkem {totalPages} {totalPages === 1 ? 'strana' : totalPages < 5 ? 'strany' : 'stran'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
