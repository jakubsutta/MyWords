import React from 'react';
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
import { ExportPrintTab } from './ExportPrintTab';
import { StatsToolsTab } from './StatsToolsTab';
import {
  Type,
  PlusCircle,
  Layout,
  FileSpreadsheet,
  Download,
  BarChart2,
  ChevronLeft,
  ChevronRight,
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
  onOpenSymbolsModal: () => void;
  onOpenFindReplace: () => void;
  onLoadTemplate: (content: string, title?: string) => void;
  onLoadProject: (projectData: any) => void;
}

const TABS: { id: SidebarTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'text', label: 'Formátování', icon: Type },
  { id: 'insert', label: 'Vložit', icon: PlusCircle },
  { id: 'page', label: 'Stránka', icon: Layout },
  { id: 'headerFooter', label: 'Záhlaví', icon: FileSpreadsheet },
  { id: 'export', label: 'Export & Tisk', icon: Download },
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
  onOpenSymbolsModal,
  onOpenFindReplace,
  onLoadTemplate,
  onLoadProject,
}) => {
  if (!isOpen) {
    return (
      <div className="no-print bg-white border-r border-slate-200 flex flex-col items-center py-3 px-1 w-12 z-20 shrink-0">
        <button
          type="button"
          onClick={onToggleOpen}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Otevřít boční panel"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="w-full h-px bg-slate-200 my-2" />
        <div className="flex flex-col gap-2">
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
    );
  }

  return (
    <aside className="no-print w-80 md:w-88 bg-white border-r border-slate-200 flex flex-col h-full z-20 shrink-0 select-none shadow-xs">
      {/* Sidebar Header with tabs navigation */}
      <div className="border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/60">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 uppercase tracking-wider">
            <span>Nastavení dokumentu</span>
          </div>
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Sbalit boční panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="grid grid-cols-6 p-1 gap-0.5 bg-slate-100/70 border-b border-slate-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="truncate w-full text-center leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'text' && <TextFormatTab editor={editor} />}
        {activeTab === 'insert' && (
          <InsertTab
            editor={editor}
            onOpenTableModal={onOpenTableModal}
            onOpenImageModal={onOpenImageModal}
            onOpenSymbolsModal={onOpenSymbolsModal}
          />
        )}
        {activeTab === 'page' && (
          <PageLayoutTab pageSettings={pageSettings} onChange={onPageSettingsChange} />
        )}
        {activeTab === 'headerFooter' && (
          <HeaderFooterTab settings={headerFooterSettings} onChange={onHeaderFooterChange} />
        )}
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
    </aside>
  );
};
