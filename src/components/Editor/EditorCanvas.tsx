import React, { useState, useEffect } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { EditorRuler } from './EditorRuler';
import { Edit3, BookOpen } from 'lucide-react';

interface Props {
  editor: Editor | null;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  onHeaderFooterChange: (settings: HeaderFooterSettings) => void;
  zoom: number;
  viewMode: 'pages' | 'continuous';
  pageRef: React.RefObject<HTMLDivElement | null>;
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
}) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingFooter, setIsEditingFooter] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(1); // 1 = liché/pravé, 2 = sudé/levé pro náhled knihy

  // Page dimension calculations in mm
  let baseWidthMm = 210;
  let baseHeightMm = 297;

  if (pageSettings.format === 'A5') {
    baseWidthMm = 148;
    baseHeightMm = 210;
  } else if (pageSettings.format === 'B5') {
    baseWidthMm = 176;
    baseHeightMm = 250;
  } else if (pageSettings.format === 'Letter') {
    baseWidthMm = 215.9;
    baseHeightMm = 279.4;
  } else if (pageSettings.format === 'Legal') {
    baseWidthMm = 215.9;
    baseHeightMm = 355.6;
  }

  const isLandscape = pageSettings.orientation === 'landscape';
  const widthMm = isLandscape ? baseHeightMm : baseWidthMm;
  const heightMm = isLandscape ? baseWidthMm : baseHeightMm;

  // Margin calculation considering Book Mode and Gutter
  const isBookMode = pageSettings.layoutType === 'book' || pageSettings.mirrorMargins;
  const isEvenPage = isBookMode && activePageIndex % 2 === 0;

  // In book mode: Odd pages have gutter on the left; Even pages have gutter on the right
  const gutter = pageSettings.gutter || 0;
  const effectiveLeftMargin = isBookMode
    ? (isEvenPage ? pageSettings.margins.right : pageSettings.margins.left + gutter)
    : pageSettings.margins.left;
  const effectiveRightMargin = isBookMode
    ? (isEvenPage ? pageSettings.margins.left + gutter : pageSettings.margins.right)
    : pageSettings.margins.right;

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
      }
    };

    updatePageCount();
    if (editor) {
      editor.on('update', updatePageCount);
      return () => {
        editor.off('update', updatePageCount);
      };
    }
  }, [editor, heightMm, viewMode]);

  // Headers & Footers text based on Odd/Even page
  const currentHeaderText = (isEvenPage && headerFooterSettings.differentOddEven && headerFooterSettings.evenHeaderText)
    ? headerFooterSettings.evenHeaderText
    : headerFooterSettings.headerText;

  const currentFooterText = (isEvenPage && headerFooterSettings.differentOddEven && headerFooterSettings.evenFooterText)
    ? headerFooterSettings.evenFooterText
    : headerFooterSettings.footerText;

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

  return (
    <div className="flex-1 bg-slate-200/70 overflow-auto flex flex-col items-center p-4 sm:p-8 editor-viewport">
      {/* Book Mode Page Switcher */}
      {isBookMode && viewMode === 'pages' && (
        <div className="no-print mb-3 flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-300 shadow-xs text-xs">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-slate-700">Náhled knižní dvoustrany:</span>
          <button
            type="button"
            onClick={() => setActivePageIndex(1)}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              activePageIndex % 2 === 1
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lichá (Pravá stránka • Hřbet vlevo)
          </button>
          <button
            type="button"
            onClick={() => setActivePageIndex(2)}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              activePageIndex % 2 === 0
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sudá (Levá stránka • Hřbet vpravo)
          </button>
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
          <div style={{ width: `${widthMm}mm` }} className="mb-2 shadow-2xs rounded-t overflow-hidden">
            <EditorRuler pageSettings={pageSettings} widthMm={widthMm} />
          </div>
        )}

        {/* Paper Sheet */}
        <div
          ref={pageRef}
          className={`paper-page relative flex flex-col transition-all ${
            viewMode === 'pages'
              ? 'rounded-xs border border-slate-300'
              : 'w-full max-w-4xl rounded-lg shadow-sm border border-slate-200 my-4'
          }`}
          style={{
            backgroundColor: pageSettings.paperColor || '#ffffff',
            width: viewMode === 'pages' ? `${widthMm}mm` : '100%',
            minHeight: viewMode === 'pages' ? `${heightMm}mm` : '850px',
            paddingTop: `${pageSettings.margins.top}mm`,
            paddingBottom: `${pageSettings.margins.bottom}mm`,
            paddingLeft: `${effectiveLeftMargin}mm`,
            paddingRight: `${effectiveRightMargin}mm`,
          }}
        >
          {/* VISUAL MARGIN GUIDES OVERLAY (Non-printing) */}
          {pageSettings.showMarginGuides && (
            <div
              className="no-print absolute inset-0 pointer-events-none z-10"
              style={{
                top: `${pageSettings.margins.top}mm`,
                bottom: `${pageSettings.margins.bottom}mm`,
                left: `${effectiveLeftMargin}mm`,
                right: `${effectiveRightMargin}mm`,
                border: '1px dashed rgba(59, 130, 246, 0.45)',
                backgroundColor: 'rgba(59, 130, 246, 0.015)',
              }}
            >
              {/* Corner badge indicating margin guide */}
              <div className="absolute top-1 left-1 bg-blue-500/80 text-white text-[9px] px-1 py-0.5 rounded font-mono select-none">
                Okraj: {effectiveLeftMargin}mm L / {effectiveRightMargin}mm P
              </div>
            </div>
          )}

          {/* Gutter / Hřbet vazby visual stripe in book mode */}
          {pageSettings.showMarginGuides && isBookMode && gutter > 0 && (
            <div
              className="no-print absolute top-0 bottom-0 pointer-events-none z-10 bg-indigo-500/10 border-indigo-400/40 select-none flex items-center justify-center"
              style={{
                width: `${gutter}mm`,
                left: isEvenPage ? 'auto' : 0,
                right: isEvenPage ? 0 : 'auto',
                borderRight: isEvenPage ? 'none' : '1px dotted rgba(99, 102, 241, 0.6)',
                borderLeft: isEvenPage ? '1px dotted rgba(99, 102, 241, 0.6)' : 'none',
              }}
            >
              <span
                className="text-[9px] text-indigo-500/80 font-mono tracking-widest uppercase font-semibold"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Hřbet {gutter}mm
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

          {/* Editor Core Content */}
          <div className="flex-1 w-full text-slate-800 focus:outline-none min-h-[500px]">
            <EditorContent editor={editor} />
          </div>

          {/* Visual page break indicators for multi-page documents */}
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
      </div>
    </div>
  );
};
