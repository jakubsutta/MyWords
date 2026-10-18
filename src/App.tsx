import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';

import type {
  PageSettings,
  HeaderFooterSettings,
  DocumentStats,
  SidebarTab,
} from './types/editor';
import { SAMPLE_TEMPLATES } from './utils/sampleDocuments';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { EditorBubbleMenu } from './components/Editor/EditorBubbleMenu';
import { InsertTableModal } from './components/Modals/InsertTableModal';
import { InsertImageModal } from './components/Modals/InsertImageModal';
import { SymbolsModal } from './components/Modals/SymbolsModal';
import { FindReplaceModal } from './components/Modals/FindReplaceModal';

const STORAGE_KEY_CONTENT = 'mywords_doc_content';
const STORAGE_KEY_TITLE = 'mywords_doc_title';
const STORAGE_KEY_PAGESETTINGS = 'mywords_page_settings';
const STORAGE_KEY_HFSETTINGS = 'mywords_hf_settings';

export const App: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  // States
  const [title, setTitle] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_TITLE) || 'Zpráva o stavu projektu';
  });

  const [activeTab, setActiveTab] = useState<SidebarTab>('text');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'pages' | 'continuous'>('pages');

  // Modals
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSymbolsModalOpen, setIsSymbolsModalOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);

  // Page Settings
  const [pageSettings, setPageSettings] = useState<PageSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PAGESETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      format: 'A4',
      orientation: 'portrait',
      marginPreset: 'normal',
      margins: { top: 25, bottom: 25, left: 25, right: 25 },
      paperColor: '#ffffff',
      showRuler: true,
    };
  });

  // Header and Footer Settings
  const [headerFooterSettings, setHeaderFooterSettings] = useState<HeaderFooterSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HFSETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      showHeader: true,
      headerText: 'MyWords — Pracovní dokument',
      headerAlign: 'right',
      showFooter: true,
      footerText: 'Důvěrné — Určeno pro interní potřeby',
      footerAlign: 'left',
      pageNumbering: 'page_of_total',
      pageNumberPosition: 'right',
      differentFirstPage: false,
    };
  });

  // Document Stats
  const [stats, setStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
  });

  // TipTap Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily,
      Subscript,
      Superscript,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Začněte psát svůj profesionální dokument v MyWords...',
      }),
    ],
    content: localStorage.getItem(STORAGE_KEY_CONTENT) || SAMPLE_TEMPLATES[1].content,
    onUpdate: ({ editor: ed }) => {
      // Calculate Stats
      const text = ed.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const paragraphs = ed.state.doc.childCount;
      const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

      setStats({
        words,
        characters,
        charactersNoSpaces,
        paragraphs,
        readingTimeMinutes,
      });

      // Autosave
      localStorage.setItem(STORAGE_KEY_CONTENT, ed.getHTML());
    },
  });

  // Update stats on initial load
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const paragraphs = editor.state.doc.childCount;
      const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

      setStats({
        words,
        characters,
        charactersNoSpaces,
        paragraphs,
        readingTimeMinutes,
      });
    }
  }, [editor]);

  // Persist Page Settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAGESETTINGS, JSON.stringify(pageSettings));
  }, [pageSettings]);

  // Persist HF Settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HFSETTINGS, JSON.stringify(headerFooterSettings));
  }, [headerFooterSettings]);

  // Persist Title
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TITLE, title);
  }, [title]);

  // Load Template
  const handleLoadTemplate = (content: string, newTitle?: string) => {
    if (editor) {
      editor.commands.setContent(content);
      if (newTitle) setTitle(newTitle);
    }
  };

  // Load Project JSON
  const handleLoadProject = (projectData: any) => {
    if (editor && projectData.html) {
      editor.commands.setContent(projectData.html);
      if (projectData.title) setTitle(projectData.title);
      if (projectData.pageSettings) setPageSettings(projectData.pageSettings);
      if (projectData.headerFooterSettings) setHeaderFooterSettings(projectData.headerFooterSettings);
    }
  };

  // Insert Table
  const handleInsertTable = (rows: number, cols: number, withHeaderRow: boolean) => {
    if (editor) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    }
  };

  // Insert Image
  const handleInsertImage = (url: string, alt?: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  // Insert Symbol
  const handleInsertSymbol = (symbol: string) => {
    if (editor) {
      editor.chain().focus().insertContent(symbol).run();
    }
  };

  // Global Keyboard shortcuts (Ctrl+F for Find/Replace, Ctrl+P handled natively)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsFindReplaceOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 main-layout font-sans">
      {/* Top Navigation */}
      <Header
        title={title}
        onTitleChange={setTitle}
        editor={editor}
        zoom={zoom}
        onZoomChange={setZoom}
        pageSettings={pageSettings}
        headerFooterSettings={headerFooterSettings}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Workspace: Left Sidebar + Editor Viewport */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          editor={editor}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          title={title}
          pageSettings={pageSettings}
          onPageSettingsChange={setPageSettings}
          headerFooterSettings={headerFooterSettings}
          onHeaderFooterChange={setHeaderFooterSettings}
          stats={stats}
          pageRef={pageRef}
          onOpenTableModal={() => setIsTableModalOpen(true)}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenSymbolsModal={() => setIsSymbolsModalOpen(true)}
          onOpenFindReplace={() => setIsFindReplaceOpen(true)}
          onLoadTemplate={handleLoadTemplate}
          onLoadProject={handleLoadProject}
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <EditorBubbleMenu editor={editor} />
          <EditorCanvas
            editor={editor}
            pageSettings={pageSettings}
            headerFooterSettings={headerFooterSettings}
            zoom={zoom}
            viewMode={viewMode}
            pageRef={pageRef}
          />
        </div>
      </div>

      {/* Modals */}
      <InsertTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsert={handleInsertTable}
      />
      <InsertImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImage}
      />
      <SymbolsModal
        isOpen={isSymbolsModalOpen}
        onClose={() => setIsSymbolsModalOpen(false)}
        onInsertSymbol={handleInsertSymbol}
      />
      <FindReplaceModal
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        editor={editor}
      />
    </div>
  );
};

export default App;
