import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import type {
  SidebarTab,
  PageSettings,
  HeaderFooterSettings,
  DocumentStats,
} from '../../types/editor';
import { TextFormatTab } from './TextFormatTab';
import { InsertTab } from './InsertTab';
import { PageLayoutTab } from './PageLayoutTab';
import { HeaderFooterTab } from './HeaderFooterTab';
import { OutlineTab } from './OutlineTab';
import { ExportPrintTab } from './ExportPrintTab';
import { StatsToolsTab } from './StatsToolsTab';
import {
  Type,
  PlusCircle,
  Layout,
  FileSpreadsheet,
  ListTree,
  Download,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  title: string;
  pageSettings: PageSettings;
  onPageSettingsChange: (settings: PageSettings) => void;
  headerFooterSettings: HeaderFooterSettings;
  onHeaderFooterChange: (settings: HeaderFooterSettings) => void;
  stats: DocumentStats;
  pageRef: React.RefObject<HTMLDivElement | null>;
  onOpenTableModal: () => void;
  onOpenImageModal: () => void;
  onOpenChartModal: () => void;
  onOpenSymbolsModal: () => void;
  onOpenFindReplace: () => void;
  onLoadTemplate: (content: string, title?: string, asNewProject?: boolean) => void;
  onLoadProject: (projectData: any) => void;
}

const TABS: { id: SidebarTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'text', label: 'Formát', icon: Type },
  { id: 'insert', label: 'Vložit', icon: PlusCircle },
  { id: 'page', label: 'Stránka', icon: Layout },
  { id: 'headerFooter', label: 'Záhlaví', icon: FileSpreadsheet },
  { id: 'outline', label: 'Osnova', icon: ListTree },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'stats', label: 'Statistika', icon: BarChart2 },
];

export const Sidebar: React.FC<Props> = ({
  editor,
  activeTab,
  onTabChange,
  isOpen,
  onToggleOpen,
  title,
  pageSettings,
  onPageSettingsChange,
  headerFooterSettings,
  onHeaderFooterChange,
  stats,
  pageRef,
  onOpenTableModal,
  onOpenImageModal,
  onOpenChartModal,
  onOpenSymbolsModal,
  onOpenFindReplace,
  onLoadTemplate,
  onLoadProject,
}) => {
  // Resizable sidebar width (persisted in localStorage)
  // Min: 280px, Max: 520px (or 45vw depending on window width)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('mywords_sidebar_width');
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num >= 260 && num <= 560) return num;
    }
    return 336; // Default ~ lg:w-84 (336px)
  });

  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const maxW = Math.min(540, Math.floor(window.innerWidth * 0.45));
      const minW = 260;
      const newWidth = Math.max(minW, Math.min(maxW, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('mywords_sidebar_width', sidebarWidth.toString());
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sidebarWidth]);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-30 lg:hidden transition-opacity"
          onClick={onToggleOpen}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      {!isOpen ? (
        // Desktop Collapsed Icon Rail (Hidden on mobile)
        <div className="no-print hidden lg:flex bg-white border-r border-slate-200 flex-col items-center py-2.5 px-1 w-11 z-20 shrink-0">
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Otevřít boční panel (Ctrl+\)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-200 my-2" />
          <div className="flex flex-col gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onTabChange(tab.id);
                    onToggleOpen();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Full Resizable Sidebar
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className={`no-print fixed inset-y-0 left-0 lg:relative z-40 lg:z-20 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none shadow-xl lg:shadow-xs ${
            isResizing ? 'transition-none select-none pointer-events-auto' : 'transition-[width] duration-75 ease-out'
          }`}
        >
          {/* Sidebar Header with tabs navigation */}
          <div className="border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200/60">
              <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                Nastavení dokumentu
              </span>
              <button
                type="button"
                onClick={onToggleOpen}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                title="Zavřít boční panel"
              >
                <ChevronLeft className="w-4 h-4 hidden lg:block" />
                <X className="w-4 h-4 lg:hidden" />
              </button>
            </div>

            {/* Tab navigation pills */}
            <div className="grid grid-cols-7 p-1 gap-0.5 bg-slate-100/80 border-b border-slate-200">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg text-[9px] font-medium transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                    }`}
                    title={tab.label}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
                    <span className="truncate w-full text-center leading-none">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3.5 scrollbar-thin">
            {activeTab === 'text' && <TextFormatTab editor={editor} />}
            {activeTab === 'insert' && (
              <InsertTab
                editor={editor}
                onOpenTableModal={onOpenTableModal}
                onOpenImageModal={onOpenImageModal}
                onOpenChartModal={onOpenChartModal}
                onOpenSymbolsModal={onOpenSymbolsModal}
              />
            )}
            {activeTab === 'page' && (
              <PageLayoutTab pageSettings={pageSettings} onChange={onPageSettingsChange} />
            )}
            {activeTab === 'headerFooter' && (
              <HeaderFooterTab settings={headerFooterSettings} onChange={onHeaderFooterChange} />
            )}
            {activeTab === 'outline' && <OutlineTab editor={editor} />}
            {activeTab === 'export' && (
              <ExportPrintTab
                editor={editor}
                title={title}
                pageSettings={pageSettings}
                headerFooterSettings={headerFooterSettings}
                pageRef={pageRef}
                onLoadTemplate={onLoadTemplate}
                onLoadProject={onLoadProject}
              />
            )}
            {activeTab === 'stats' && (
              <StatsToolsTab
                editor={editor}
                stats={stats}
                onOpenFindReplace={onOpenFindReplace}
              />
            )}
          </div>

          {/* Resizer handle along the right border (Desktop only) */}
          <div
            onMouseDown={startResizing}
            className={`hidden lg:flex absolute top-0 bottom-0 -right-1.5 w-3 cursor-col-resize z-30 group items-center justify-center transition-colors ${
              isResizing ? 'bg-blue-500/20' : 'hover:bg-blue-400/20'
            }`}
            title="Přetažením upravte šířku panelu (260 px - 540 px)"
          >
            <div className={`w-1 h-8 rounded-full transition-colors flex items-center justify-center ${
              isResizing ? 'bg-blue-600' : 'bg-slate-300 group-hover:bg-blue-500'
            }`} />
          </div>
        </aside>
      )}
    </>
  );
};
