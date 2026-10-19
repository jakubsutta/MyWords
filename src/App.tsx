import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { ResizableImage } from './extensions/ResizableImage';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';

import { FontSize } from './extensions/FontSize';
import { LineHeight } from './extensions/LineHeight';
import { PageBreak } from './extensions/PageBreak';

import type {
  PageSettings,
  HeaderFooterSettings,
  DocumentStats,
  SidebarTab,
  Project,
} from './types/editor';
import { SAMPLE_TEMPLATES } from './utils/sampleDocuments';
import { getFormatDimensions } from './utils/formatConfig';
import { Header } from './components/Header';
import { ProjectTabsBar } from './components/Projects/ProjectTabsBar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { EditorStatusBar } from './components/Editor/EditorStatusBar';
import { EditorBubbleMenu } from './components/Editor/EditorBubbleMenu';
import { InsertTableModal } from './components/Modals/InsertTableModal';
import { InsertImageModal } from './components/Modals/InsertImageModal';
import { InsertChartModal } from './components/Modals/InsertChartModal';
import { SymbolsModal } from './components/Modals/SymbolsModal';
import { FindReplaceModal } from './components/Modals/FindReplaceModal';
import { DocumentPreviewModal } from './components/Modals/DocumentPreviewModal';

const STORAGE_KEY_PROJECTS = 'mywords_projects';
const STORAGE_KEY_ACTIVE_PROJECT_ID = 'mywords_active_project_id';
const STORAGE_KEY_CONTENT = 'mywords_doc_content';
const STORAGE_KEY_TITLE = 'mywords_doc_title';
const STORAGE_KEY_PAGESETTINGS = 'mywords_page_settings';
const STORAGE_KEY_HFSETTINGS = 'mywords_hf_settings';

const DEFAULT_PAGE_SETTINGS: PageSettings = {
  format: 'A4',
  orientation: 'portrait',
  marginPreset: 'normal',
  margins: { top: 25, bottom: 25, left: 25, right: 25 },
  paperColor: '#ffffff',
  showRuler: true,
  showMarginGuides: true,
  layoutType: 'standard',
  gutter: 0,
  mirrorMargins: false,
  bookSpreadView: true,
};

const DEFAULT_HF_SETTINGS: HeaderFooterSettings = {
  showHeader: true,
  headerText: 'MyWords — Pracovní dokument',
  headerAlign: 'right',
  showFooter: true,
  footerText: 'Důvěrné — Určeno pro interní potřeby',
  footerAlign: 'left',
  pageNumbering: 'page_of_total',
  pageNumberPosition: 'right',
  differentFirstPage: false,
  differentOddEven: false,
  evenHeaderText: 'MyWords — Autor & Kniha',
  evenFooterText: 'Všechna práva vyhrazena',
};

const loadInitialProjects = (): { projects: Project[]; activeId: string } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT_ID);
        const activeId = parsed.some((p: Project) => p.id === savedActiveId)
          ? (savedActiveId as string)
          : parsed[0].id;
        return { projects: parsed, activeId };
      }
    }
  } catch (e) {
    console.error('Failed to load saved projects:', e);
  }

  // Fallback migration from single document storage
  let initialPageSettings = DEFAULT_PAGE_SETTINGS;
  let initialHfSettings = DEFAULT_HF_SETTINGS;
  try {
    const s = localStorage.getItem(STORAGE_KEY_PAGESETTINGS);
    if (s) initialPageSettings = JSON.parse(s);
  } catch {}
  try {
    const h = localStorage.getItem(STORAGE_KEY_HFSETTINGS);
    if (h) initialHfSettings = JSON.parse(h);
  } catch {}

  const initialProj: Project = {
    id: 'proj_' + Date.now(),
    title: localStorage.getItem(STORAGE_KEY_TITLE) || 'Zpráva o stavu projektu',
    content: localStorage.getItem(STORAGE_KEY_CONTENT) || SAMPLE_TEMPLATES[1].content,
    pageSettings: initialPageSettings,
    headerFooterSettings: initialHfSettings,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return {
    projects: [initialProj],
    activeId: initialProj.id,
  };
};

export const App: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Projects State
  const initialProjectsData = useMemo(() => loadInitialProjects(), []);
  const [projects, setProjects] = useState<Project[]>(initialProjectsData.projects);
  const [activeProjectId, setActiveProjectId] = useState<string>(initialProjectsData.activeId);

  const activeProjectIdRef = useRef(activeProjectId);
  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Document states synced with active project
  const [title, setTitle] = useState(activeProject.title);
  const [pageSettings, setPageSettings] = useState<PageSettings>(activeProject.pageSettings);
  const [headerFooterSettings, setHeaderFooterSettings] = useState<HeaderFooterSettings>(
    activeProject.headerFooterSettings
  );

  const [activeTab, setActiveTab] = useState<SidebarTab>('text');
  
  // Responsive initial sidebar state (closed on small screens, open on desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'pages' | 'continuous'>('pages');
  const [pageCount, setPageCount] = useState(1);

  // Modals
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isSymbolsModalOpen, setIsSymbolsModalOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Document Stats
  const [stats, setStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
  });

  // TipTap Extensions (memoized to avoid duplicate registration in StrictMode)
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontSize,
      LineHeight,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily,
      Subscript,
      Superscript,
      ResizableImage.configure({
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      PageBreak,
      Placeholder.configure({
        placeholder: 'Začněte psát svůj profesionální dokument v MyWords...',
      }),
    ],
    []
  );

  // TipTap Editor instance
  const editor = useEditor({
    extensions,
    content: activeProject.content,
    onCreate: ({ editor: ed }) => {
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
    },
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

      // Update content of the active project
      const html = ed.getHTML();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectIdRef.current
            ? { ...p, content: html, updatedAt: Date.now() }
            : p
        )
      );
      // Legacy fallback
      localStorage.setItem(STORAGE_KEY_CONTENT, html);
    },
  });

  // Persist Projects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to persist projects:', e);
    }
  }, [projects]);

  // Persist Active Project ID
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, activeProjectId);
  }, [activeProjectId]);

  // Legacy fallback persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAGESETTINGS, JSON.stringify(pageSettings));
  }, [pageSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HFSETTINGS, JSON.stringify(headerFooterSettings));
  }, [headerFooterSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TITLE, title);
  }, [title]);

  // Auto-fit Zoom to Viewport Width
  const handleFitToWidth = useCallback(() => {
    if (!viewportRef.current) return;
    const viewportWidth = viewportRef.current.clientWidth - 48; // padding
    const { widthMm } = getFormatDimensions(pageSettings.format, pageSettings.orientation);

    const isBookMode = pageSettings.layoutType === 'book' || pageSettings.mirrorMargins;
    const isSpreadView = isBookMode && (pageSettings.bookSpreadView ?? true);
    const targetWidthMm = isSpreadView && viewMode === 'pages' ? widthMm * 2 : widthMm;
    const targetWidthPx = targetWidthMm * 3.7795; // 1mm ~ 3.78px

    const calculatedZoom = Math.floor((viewportWidth / targetWidthPx) * 100);
    const clampedZoom = Math.max(40, Math.min(150, calculatedZoom));
    setZoom(clampedZoom);
  }, [pageSettings, viewMode]);

  // Project Management Handlers
  const handleTitleChange = useCallback((newTitle: string) => {
    const clean = newTitle.trim();
    if (!clean) return;
    setTitle(clean);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectIdRef.current ? { ...p, title: clean, updatedAt: Date.now() } : p
      )
    );
  }, []);

  const handlePageSettingsChange = useCallback((newSettings: PageSettings) => {
    setPageSettings(newSettings);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectIdRef.current
          ? { ...p, pageSettings: newSettings, updatedAt: Date.now() }
          : p
      )
    );
  }, []);

  const handleHeaderFooterChange = useCallback((newSettings: HeaderFooterSettings) => {
    setHeaderFooterSettings(newSettings);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectIdRef.current
          ? { ...p, headerFooterSettings: newSettings, updatedAt: Date.now() }
          : p
      )
    );
  }, []);

  const handleSelectProject = useCallback(
    (projectId: string) => {
      if (projectId === activeProjectIdRef.current) return;
      const targetProject = projects.find((p) => p.id === projectId);
      if (!targetProject) return;

      // Capture current HTML from editor before switching
      const currentHtml = editor ? editor.getHTML() : activeProject.content;
      const updatedProjects = projects.map((p) => {
        if (p.id === activeProjectIdRef.current) {
          return {
            ...p,
            content: currentHtml,
            title,
            pageSettings,
            headerFooterSettings,
            updatedAt: Date.now(),
          };
        }
        return p;
      });

      setActiveProjectId(projectId);
      activeProjectIdRef.current = projectId;
      setTitle(targetProject.title);
      setPageSettings(targetProject.pageSettings);
      setHeaderFooterSettings(targetProject.headerFooterSettings);

      if (editor) {
        editor.commands.setContent(targetProject.content);
        if (viewportRef.current) {
          viewportRef.current.scrollTop = 0;
        }
      }

      setProjects(updatedProjects);
    },
    [editor, projects, activeProject, title, pageSettings, headerFooterSettings]
  );

  const handleCreateProject = useCallback(() => {
    const currentHtml = editor ? editor.getHTML() : activeProject.content;
    const currentUpdated = projects.map((p) =>
      p.id === activeProjectIdRef.current
        ? {
            ...p,
            content: currentHtml,
            title,
            pageSettings,
            headerFooterSettings,
            updatedAt: Date.now(),
          }
        : p
    );

    const newId = 'proj_' + Date.now();
    const newNumber = currentUpdated.length + 1;
    const newProj: Project = {
      id: newId,
      title: `Nový dokument ${newNumber}`,
      content: '<p></p>',
      pageSettings: { ...DEFAULT_PAGE_SETTINGS },
      headerFooterSettings: { ...DEFAULT_HF_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextList = [...currentUpdated, newProj];
    setProjects(nextList);
    setActiveProjectId(newId);
    activeProjectIdRef.current = newId;

    setTitle(newProj.title);
    setPageSettings(newProj.pageSettings);
    setHeaderFooterSettings(newProj.headerFooterSettings);

    if (editor) {
      editor.commands.setContent(newProj.content);
      setTimeout(() => {
        editor.commands.focus('start');
      }, 50);
    }
  }, [editor, projects, activeProject, title, pageSettings, headerFooterSettings]);

  const handleCloseProject = useCallback(
    (projectId: string) => {
      if (projects.length <= 1) {
        const confirmed = window.confirm(
          'Toto je jediný otevřený projekt. Chcete jej vyčistit a začít nový prázdný dokument?'
        );
        if (!confirmed) return;

        const newId = 'proj_' + Date.now();
        const fresh: Project = {
          id: newId,
          title: 'Nový dokument',
          content: '<p></p>',
          pageSettings: { ...DEFAULT_PAGE_SETTINGS },
          headerFooterSettings: { ...DEFAULT_HF_SETTINGS },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setProjects([fresh]);
        setActiveProjectId(newId);
        activeProjectIdRef.current = newId;
        setTitle(fresh.title);
        setPageSettings(fresh.pageSettings);
        setHeaderFooterSettings(fresh.headerFooterSettings);
        editor?.commands.setContent(fresh.content);
        return;
      }

      const closeIdx = projects.findIndex((p) => p.id === projectId);
      const remaining = projects.filter((p) => p.id !== projectId);

      if (projectId === activeProjectIdRef.current) {
        const nextIdx = Math.max(0, closeIdx - 1);
        const nextProj = remaining[nextIdx] || remaining[0];

        setActiveProjectId(nextProj.id);
        activeProjectIdRef.current = nextProj.id;
        setTitle(nextProj.title);
        setPageSettings(nextProj.pageSettings);
        setHeaderFooterSettings(nextProj.headerFooterSettings);
        editor?.commands.setContent(nextProj.content);
      }

      setProjects(remaining);
    },
    [editor, projects]
  );

  const handleDuplicateProject = useCallback(
    (projectId: string) => {
      const orig = projects.find((p) => p.id === projectId);
      if (!orig) return;

      const currentHtml =
        orig.id === activeProjectIdRef.current && editor ? editor.getHTML() : orig.content;
      const newId = 'proj_' + Date.now();
      const duplicated: Project = {
        ...orig,
        id: newId,
        title: `${orig.title} (kopie)`,
        content: currentHtml,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const origIdx = projects.findIndex((p) => p.id === projectId);
      const nextList = [...projects];
      nextList.splice(origIdx + 1, 0, duplicated);

      setProjects(nextList);
      setActiveProjectId(newId);
      activeProjectIdRef.current = newId;

      setTitle(duplicated.title);
      setPageSettings(duplicated.pageSettings);
      setHeaderFooterSettings(duplicated.headerFooterSettings);

      if (editor) {
        editor.commands.setContent(duplicated.content);
      }
    },
    [editor, projects]
  );

  const handleRenameProject = useCallback((projectId: string, newTitle: string) => {
    const clean = newTitle.trim();
    if (!clean) return;

    if (projectId === activeProjectIdRef.current) {
      setTitle(clean);
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, title: clean, updatedAt: Date.now() } : p))
    );
  }, []);

  // Handle responsive resize
  useEffect(() => {
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth < 768 && isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [isSidebarOpen]);

  // Global Keyboard shortcuts:
  // Ctrl+F / Cmd+F -> Find/Replace
  // Ctrl+\ / Cmd+\ -> Toggle Sidebar
  // Ctrl+Alt+N / Cmd+Alt+N -> New Project Tab
  // Ctrl+Alt+Right / Left -> Switch Project Tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsFindReplaceOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPreviewModalOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '\\' || e.key === '|')) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateProject();
      } else if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIdx = projects.findIndex((p) => p.id === activeProjectIdRef.current);
        if (currentIdx !== -1 && projects.length > 1) {
          const nextIdx = (currentIdx + 1) % projects.length;
          handleSelectProject(projects[nextIdx].id);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIdx = projects.findIndex((p) => p.id === activeProjectIdRef.current);
        if (currentIdx !== -1 && projects.length > 1) {
          const prevIdx = (currentIdx - 1 + projects.length) % projects.length;
          handleSelectProject(projects[prevIdx].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateProject, handleSelectProject, projects]);

  // Load Template (into current project or as a new project tab)
  const handleLoadTemplate = (content: string, newTitle?: string, asNewProject: boolean = false) => {
    if (asNewProject) {
      const newId = 'proj_' + Date.now();
      const newProj: Project = {
        id: newId,
        title: newTitle || 'Nový dokument',
        content,
        pageSettings: { ...DEFAULT_PAGE_SETTINGS },
        headerFooterSettings: { ...DEFAULT_HF_SETTINGS },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setProjects((prev) => [...prev, newProj]);
      setActiveProjectId(newId);
      activeProjectIdRef.current = newId;

      setTitle(newProj.title);
      setPageSettings(newProj.pageSettings);
      setHeaderFooterSettings(newProj.headerFooterSettings);
      editor?.commands.setContent(newProj.content);
      return;
    }

    if (editor) {
      editor.commands.setContent(content);
      if (newTitle) {
        handleTitleChange(newTitle);
      }
    }
  };

  // Load Project JSON as a new Project Tab
  const handleLoadProject = (projectData: any) => {
    if (editor && projectData.html) {
      const newId = 'proj_' + Date.now();
      const newProj: Project = {
        id: newId,
        title: projectData.title || 'Načtený projekt',
        content: projectData.html,
        pageSettings: projectData.pageSettings || DEFAULT_PAGE_SETTINGS,
        headerFooterSettings: projectData.headerFooterSettings || DEFAULT_HF_SETTINGS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setProjects((prev) => [...prev, newProj]);
      setActiveProjectId(newId);
      activeProjectIdRef.current = newId;

      setTitle(newProj.title);
      setPageSettings(newProj.pageSettings);
      setHeaderFooterSettings(newProj.headerFooterSettings);
      editor.commands.setContent(newProj.content);
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

  // Insert Chart (as embedded vector SVG / Data URL)
  const handleInsertChart = (svgDataUrl: string, chartTitle: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: svgDataUrl, alt: chartTitle }).run();
    }
  };

  // Insert Symbol
  const handleInsertSymbol = (symbol: string) => {
    if (editor) {
      editor.chain().focus().insertContent(symbol).run();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 main-layout font-sans">
      {/* Top Navigation */}
      <Header
        title={title}
        onTitleChange={handleTitleChange}
        editor={editor}
        zoom={zoom}
        onZoomChange={setZoom}
        pageSettings={pageSettings}
        onPageSettingsChange={handlePageSettingsChange}
        headerFooterSettings={headerFooterSettings}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onFitToWidth={handleFitToWidth}
        onOpenPreview={() => setIsPreviewModalOpen(true)}
      />

      {/* Project Tabs Bar (Záložky projektů) */}
      <ProjectTabsBar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onCloseProject={handleCloseProject}
        onDuplicateProject={handleDuplicateProject}
        onRenameProject={handleRenameProject}
        onReorderProjects={setProjects}
        onImportProject={() => {
          setActiveTab('export');
          if (!isSidebarOpen) setIsSidebarOpen(true);
        }}
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
          onPageSettingsChange={handlePageSettingsChange}
          headerFooterSettings={headerFooterSettings}
          onHeaderFooterChange={handleHeaderFooterChange}
          stats={stats}
          pageRef={pageRef}
          onOpenTableModal={() => setIsTableModalOpen(true)}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenChartModal={() => setIsChartModalOpen(true)}
          onOpenSymbolsModal={() => setIsSymbolsModalOpen(true)}
          onOpenFindReplace={() => setIsFindReplaceOpen(true)}
          onLoadTemplate={handleLoadTemplate}
          onLoadProject={handleLoadProject}
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <EditorBubbleMenu editor={editor} />
          <EditorCanvas
            editor={editor}
            pageSettings={pageSettings}
            onPageSettingsChange={handlePageSettingsChange}
            headerFooterSettings={headerFooterSettings}
            onHeaderFooterChange={handleHeaderFooterChange}
            zoom={zoom}
            viewMode={viewMode}
            pageRef={pageRef}
            viewportRef={viewportRef}
            onPageCountChange={setPageCount}
            onOpenPreview={() => setIsPreviewModalOpen(true)}
          />
          {/* Status Bar at the bottom */}
          <EditorStatusBar
            stats={stats}
            pageCount={pageCount}
            pageSettings={pageSettings}
            headerFooterSettings={headerFooterSettings}
            zoom={zoom}
            onZoomChange={setZoom}
            onFitToWidth={handleFitToWidth}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPageSettingsChange={handlePageSettingsChange}
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
      <InsertChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        onInsertChart={handleInsertChart}
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
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={title}
        htmlContent={editor ? editor.getHTML() : activeProject.content}
        pageSettings={pageSettings}
        headerFooterSettings={headerFooterSettings}
      />
    </div>
  );
};

export default App;

