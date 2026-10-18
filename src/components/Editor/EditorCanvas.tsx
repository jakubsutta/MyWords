import React, { useState, useEffect } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { EditorRuler } from './EditorRuler';
import { Edit3 } from 'lucide-react';

interface Props {
  editor: Editor | null;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  onHeaderFooterChange: (settings: HeaderFooterSettings) => void;
  zoom: number;
  viewMode: 'pages' | 'continuous';
  pageRef: React.RefObject<HTMLDivElement | null>;
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

  // Page dimension calculations in mm
  let baseWidthMm = 210;
  let baseHeightMm = 297;

  if (pageSettings.format === 'A5') {
    baseWidthMm = 148;
    baseHeightMm = 210;
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

  return (
    <div className="flex-1 bg-slate-200/70 overflow-auto flex flex-col items-center p-4 sm:p-8 editor-viewport">
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
            paddingLeft: `${pageSettings.margins.left}mm`,
            paddingRight: `${pageSettings.margins.right}mm`,
          }}
        >
          {/* Header */}
          {headerFooterSettings.showHeader && (
            <div
              className={`absolute top-0 left-0 right-0 px-8 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors ${headerAlignClass}`}
              style={{
                height: `${pageSettings.margins.top * 0.8}mm`,
                paddingLeft: `${pageSettings.margins.left}mm`,
                paddingRight: `${pageSettings.margins.right}mm`,
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
                    {headerFooterSettings.headerText || 'Klepnutím přidáte záhlaví...'}
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
              className="absolute bottom-0 left-0 right-0 px-8 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors"
              style={{
                height: `${pageSettings.margins.bottom * 0.8}mm`,
                paddingLeft: `${pageSettings.margins.left}mm`,
                paddingRight: `${pageSettings.margins.right}mm`,
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
                    {headerFooterSettings.footerText || 'Klepnutím přidáte zápatí...'}
                  </span>

                  {headerFooterSettings.pageNumbering !== 'none' && (
                    <span className={`font-mono text-[11px] ${pageNumberAlignClass}`}>
                      {headerFooterSettings.pageNumbering === 'page' && 'Strana 1'}
                      {headerFooterSettings.pageNumbering === 'page_of_total' && `Strana 1 z ${pageCount}`}
                      {headerFooterSettings.pageNumbering === 'dash' && '— 1 —'}
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
