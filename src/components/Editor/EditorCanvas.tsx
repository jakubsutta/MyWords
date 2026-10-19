import React, { useState, useEffect } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { getFormatDimensions } from '../../utils/formatConfig';
import { EditorRuler } from './EditorRuler';
import { Edit3, BookOpen, Eye, Scissors } from 'lucide-react';

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

  // Exact page dimension calculations in mm and cm
  const { widthMm, heightMm, widthCm, heightCm } = getFormatDimensions(
    pageSettings.format,
    pageSettings.orientation
  );

  // Margin calculation considering Book Mode and Gutter
  const isBookMode = pageSettings.layoutType === 'book' || pageSettings.mirrorMargins;
  const gutter = pageSettings.gutter || 0;

  // Single page mode margins (default odd/right page has gutter on left)
  const defaultLeftMargin = isBookMode ? pageSettings.margins.left + gutter : pageSettings.margins.left;
  const defaultRightMargin = pageSettings.margins.right;

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
        return `Strana ${pageNo} z ${pageCount}`;
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
      target.closest('[contenteditable="false"]')
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

  return (
    <div
      ref={viewportRef}
      className="flex-1 bg-slate-200/80 overflow-auto p-3 sm:p-6 editor-viewport relative w-full"
    >
      <div className="min-w-fit min-h-full flex flex-col items-center justify-start mx-auto pb-16">
        {/* Book Mode Banner & Quick Action Pill */}
        {isBookMode && viewMode === 'pages' && (
          <div className="no-print mb-2.5 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full border border-indigo-200 shadow-xs text-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-700">Knižní rozvržení:</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {widthCm} × {heightCm} cm • Hřbet {(gutter / 10).toFixed(1)} cm
            </span>
            <span className="text-indigo-600 font-medium text-[11px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              Zrcadlené okraje (Levá sudá / Pravá lichá)
            </span>
            {onOpenPreview && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="ml-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-100/70 hover:bg-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                title="Otevřít náhled otevřené dvojstránky knihy"
              >
                <Eye className="w-3 h-3" />
                <span>Náhled dvojstránky</span>
              </button>
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
              style={{ width: `${widthMm}mm` }}
              className="mb-1.5 shadow-2xs rounded-t overflow-hidden"
            >
              <EditorRuler pageSettings={pageSettings} widthMm={widthMm} />
            </div>
          )}

          {/* ============================================================== */}
          {/* MULTI-PAGE DOCUMENT CANVAS (PLNÉ STRÁNKOVÁNÍ PRO 1 AŽ 100+ STRAN) */}
          {/* ============================================================== */}
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
              minHeight: viewMode === 'pages' ? `${Math.max(1, pageCount) * heightMm}mm` : '600px',
              paddingTop: `${pageSettings.margins.top}mm`,
              paddingBottom: `${pageSettings.margins.bottom}mm`,
              paddingLeft: `${defaultLeftMargin}mm`,
              paddingRight: `${defaultRightMargin}mm`,
            }}
          >
            {/* Visual Header / Footer / Gutters for EVERY Page in Pages View */}
            {viewMode === 'pages' &&
              Array.from({ length: Math.max(1, pageCount) }).map((_, pIdx) => {
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
                          top: `${pageTopMm}mm`,
                          height: `${pageSettings.margins.top * 0.8}mm`,
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
                            <span
                              className={`truncate ${
                                isEven ? 'text-left font-serif italic' : 'text-right w-full font-serif italic'
                              }`}
                            >
                              {getPageHeaderText(pNum) || 'Klepnutím přidáte záhlaví...'}
                            </span>
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
                          top: `${pageBottomMm - pageSettings.margins.bottom * 0.8}mm`,
                          height: `${pageSettings.margins.bottom * 0.8}mm`,
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
                            {/* In book mode: even pages have number on the left; odd on the right */}
                            {isBookMode && isEven && headerFooterSettings.pageNumbering !== 'none' ? (
                              <span className="font-mono text-[11px] font-semibold text-slate-600">
                                {renderPageNumber(pNum)}
                              </span>
                            ) : null}

                            <span className="truncate text-slate-400 text-[11px]">
                              {getPageFooterText(pNum) || 'Klepnutím přidáte zápatí...'}
                            </span>

                            {(!isBookMode || !isEven) && headerFooterSettings.pageNumbering !== 'none' ? (
                              <span className="font-mono text-[11px] font-semibold text-slate-600">
                                {renderPageNumber(pNum)}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Page Break Gap / Sheet Divider (Between pages) */}
                    {pNum < pageCount && (
                      <div
                        className="no-print absolute left-0 right-0 pointer-events-auto z-15 flex flex-col items-center group"
                        style={{ top: `${pageBottomMm}mm`, transform: 'translateY(-50%)' }}
                      >
                        <div className="w-[calc(100%+32px)] -mx-4 h-8 bg-slate-300/90 shadow-inner border-y border-slate-300 flex items-center justify-between px-4 transition-colors group-hover:bg-slate-300">
                          <span className="bg-white/95 text-slate-600 font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs font-semibold flex items-center gap-1.5 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Konec strany {pNum} {isBookMode ? (isEven ? '(Levá)' : '(Pravá)') : ''} ── Začátek strany {pNum + 1} ({widthCm} × {heightCm} cm)
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertPageBreak();
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white font-medium text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs cursor-pointer"
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
            {viewMode === 'pages' && pageCount > 1 && (
              <div className="no-print absolute right-3 bottom-3 flex items-center gap-1.5 pointer-events-none opacity-60 z-20">
                <span className="text-[10px] font-mono bg-slate-800 text-white px-2 py-0.5 rounded-md shadow-xs">
                  Celkem {pageCount} {pageCount === 1 ? 'strana' : pageCount < 5 ? 'strany' : 'stran'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
