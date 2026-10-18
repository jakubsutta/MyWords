import React from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { EditorRuler } from './EditorRuler';

interface Props {
  editor: Editor | null;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  zoom: number;
  viewMode: 'pages' | 'continuous';
  pageRef: React.RefObject<HTMLDivElement | null>;
}

export const EditorCanvas: React.FC<Props> = ({
  editor,
  pageSettings,
  headerFooterSettings,
  zoom,
  viewMode,
  pageRef,
}) => {
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
              className={`absolute top-0 left-0 right-0 px-8 text-xs text-slate-400 select-none border-b border-dashed border-slate-200/80 flex items-center justify-between ${headerAlignClass}`}
              style={{
                height: `${pageSettings.margins.top * 0.8}mm`,
                paddingLeft: `${pageSettings.margins.left}mm`,
                paddingRight: `${pageSettings.margins.right}mm`,
              }}
            >
              <span className={`w-full ${headerAlignClass}`}>
                {headerFooterSettings.headerText || 'Záhlaví'}
              </span>
            </div>
          )}

          {/* Editor Core Content */}
          <div className="flex-1 w-full text-slate-800 focus:outline-none">
            <EditorContent editor={editor} />
          </div>

          {/* Footer */}
          {headerFooterSettings.showFooter && (
            <div
              className="absolute bottom-0 left-0 right-0 px-8 text-xs text-slate-400 select-none border-t border-dashed border-slate-200/80 flex items-center justify-between"
              style={{
                height: `${pageSettings.margins.bottom * 0.8}mm`,
                paddingLeft: `${pageSettings.margins.left}mm`,
                paddingRight: `${pageSettings.margins.right}mm`,
              }}
            >
              <div className="w-full flex items-center justify-between">
                <span className={footerAlignClass}>
                  {headerFooterSettings.footerText}
                </span>

                {headerFooterSettings.pageNumbering !== 'none' && (
                  <span className={`font-mono text-[11px] ${pageNumberAlignClass}`}>
                    {headerFooterSettings.pageNumbering === 'page' && 'Strana 1'}
                    {headerFooterSettings.pageNumbering === 'page_of_total' && 'Strana 1 z 1'}
                    {headerFooterSettings.pageNumbering === 'dash' && '— 1 —'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
