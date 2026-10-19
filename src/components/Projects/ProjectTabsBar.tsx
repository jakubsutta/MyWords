import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../../types/editor';
import {
  FileText,
  Plus,
  X,
  MoreVertical,
  Copy,
  Edit2,
  Trash2,
  FolderKanban,
  Check,
  Search,
  ArrowLeft,
  ArrowRight,
  GripVertical,
} from 'lucide-react';

interface Props {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onCloseProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newTitle: string) => void;
  onReorderProjects: (projects: Project[]) => void;
  onImportProject?: () => void;
}

interface MenuTarget {
  id: string;
  top: number;
  left: number;
}

export const ProjectTabsBar: React.FC<Props> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onCloseProject,
  onDuplicateProject,
  onRenameProject,
  onReorderProjects,
  onImportProject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);
  const [showAllProjectsMenu, setShowAllProjectsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Drag and Drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Focus inline edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      // Close context menu if click is outside menu
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setMenuTarget(null);
      }
      // Close projects overview dropdown if click is outside bar
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setShowAllProjectsMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuTarget(null);
        setShowAllProjectsMenu(false);
        setEditingId(null);
      }
    };

    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside the context menu itself
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target as Node)) return;
      if (menuTarget) setMenuTarget(null);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [menuTarget]);

  const handleStartRename = (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(project.id);
    setEditingTitle(project.title);
    setMenuTarget(null);
  };

  const handleSaveRename = () => {
    if (editingId && editingTitle.trim()) {
      onRenameProject(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  // Open floating context menu (toggle if already open for this project)
  const openContextMenu = (project: Project, e: React.MouseEvent, fromButton = false) => {
    e.stopPropagation();
    e.preventDefault();
    setShowAllProjectsMenu(false);

    if (menuTarget && menuTarget.id === project.id) {
      setMenuTarget(null);
      return;
    }

    const menuWidth = 196;
    const menuHeight = 210;

    if (fromButton) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const left = Math.min(window.innerWidth - menuWidth - 8, Math.max(8, rect.left - 100));
      const top = Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 4);
      setMenuTarget({
        id: project.id,
        top,
        left,
      });
    } else {
      const left = Math.min(window.innerWidth - menuWidth - 8, Math.max(8, e.clientX));
      const top = Math.min(window.innerHeight - menuHeight - 8, e.clientY + 4);
      setMenuTarget({
        id: project.id,
        top,
        left,
      });
    }
  };

  // Reordering: Move Left / Move Right
  const handleMoveProject = useCallback(
    (projectId: string, direction: 'left' | 'right') => {
      const index = projects.findIndex((p) => p.id === projectId);
      if (index === -1) return;
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= projects.length) return;

      const updated = [...projects];
      const [item] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, item);
      onReorderProjects(updated);
    },
    [projects, onReorderProjects]
  );

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      handleDragEnd();
      return;
    }

    const sourceIndex = projects.findIndex((p) => p.id === sourceId);
    const targetIndex = projects.findIndex((p) => p.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const updated = [...projects];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      onReorderProjects(updated);
    }

    handleDragEnd();
  };

  const activeMenuProject = menuTarget ? projects.find((p) => p.id === menuTarget.id) : null;
  const activeMenuProjectIndex = activeMenuProject
    ? projects.findIndex((p) => p.id === activeMenuProject.id)
    : -1;

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={barRef}
      className="no-print h-9.5 bg-slate-200/75 border-b border-slate-300/80 px-2 sm:px-3 flex items-center justify-between select-none z-30 shrink-0 gap-2 relative shadow-2xs"
    >
      {/* Scrollable Tabs Container */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 h-full"
      >
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          const isEditing = editingId === project.id;
          const isDragging = draggedId === project.id;
          const isOver = dragOverId === project.id && !isDragging;

          return (
            <div
              key={project.id}
              draggable={!isEditing}
              onDragStart={(e) => handleDragStart(e, project.id)}
              onDragOver={(e) => handleDragOver(e, project.id)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, project.id)}
              onClick={() => {
                if (!isActive) onSelectProject(project.id);
              }}
              onDoubleClick={(e) => handleStartRename(project, e)}
              onContextMenu={(e) => openContextMenu(project, e, false)}
              className={`group relative flex items-center gap-1 px-2 sm:px-2.5 h-8 text-xs rounded-t-md transition-all cursor-pointer shrink-0 max-w-[170px] sm:max-w-[230px] border-t-2 ${
                isDragging ? 'opacity-40 scale-95' : 'opacity-100'
              } ${
                isOver ? 'border-l-2 border-l-blue-600 bg-blue-100/50' : ''
              } ${
                isActive
                  ? 'bg-white text-slate-800 font-semibold border-t-blue-600 border-x border-slate-300/80 shadow-2xs -mb-px z-10'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/60 font-medium border-t-transparent'
              }`}
              title={`${project.title} (Přetažením změníte pořadí, pravým tlačítkem otevřete menu)`}
            >
              {/* Drag Handle Icon on hover */}
              <GripVertical
                className={`w-2.5 h-3 text-slate-400 opacity-0 group-hover:opacity-70 cursor-grab shrink-0 -mr-0.5 transition-opacity ${
                  isEditing ? 'hidden' : ''
                }`}
              />

              <FileText
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />

              {isEditing ? (
                <div
                  className="flex items-center gap-1 min-w-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                    onBlur={handleSaveRename}
                    className="w-24 sm:w-28 text-xs font-semibold px-1 py-0.5 bg-slate-100 border border-blue-500 rounded text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveRename}
                    className="p-0.5 text-emerald-600 hover:bg-emerald-100 rounded"
                    title="Uložit název"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="truncate select-none">{project.title}</span>
              )}

              {/* Tab Action Buttons (3 dots & Close) */}
              {!isEditing && (
                <div className="flex items-center gap-0.5 shrink-0 ml-0.5">
                  {/* Context menu toggle button (3 dots) */}
                  <button
                    type="button"
                    onClick={(e) => openContextMenu(project, e, true)}
                    className={`p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors ${
                      isActive || menuTarget?.id === project.id
                        ? 'opacity-80 group-hover:opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title="Možnosti projektu"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Close Tab button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseProject(project.id);
                    }}
                    className={`p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                      isActive ? 'opacity-80 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title={
                      projects.length > 1
                        ? 'Zavřít tento projekt'
                        : 'Zavřít a vytvořit nový prázdný projekt'
                    }
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Create New Project Tab Button */}
        <button
          type="button"
          onClick={onCreateProject}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-blue-700 hover:bg-slate-300/60 rounded-md transition-colors shrink-0 font-medium ml-1"
          title="Vytvořit nový projekt (Ctrl+Alt+N)"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Nový projekt</span>
        </button>
      </div>

      {/* Portal-rendered floating 3-dots Context Menu (Escapes all stacking contexts and overflows) */}
      {typeof document !== 'undefined' &&
        menuTarget &&
        activeMenuProject &&
        createPortal(
          <>
            {/* Invisible backdrop overlay to capture outside clicks and close menu instantly */}
            <div
              className="fixed inset-0 z-[9998] cursor-default bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setMenuTarget(null);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenuTarget(null);
              }}
            />

            <div
              ref={contextMenuRef}
              style={{ top: `${menuTarget.top}px`, left: `${menuTarget.left}px` }}
              className="fixed w-48 bg-white rounded-lg shadow-2xl border border-slate-200 py-1.5 z-[9999] text-xs text-slate-700 font-normal animate-in fade-in zoom-in-95 duration-75 select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100 truncate mb-1">
                <span className="truncate">{activeMenuProject.title}</span>
                <button
                  type="button"
                  onClick={() => setMenuTarget(null)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  title="Zavřít menu (Esc)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => handleStartRename(activeMenuProject, e)}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                Přejmenovat
              </button>

              <button
                type="button"
                onClick={() => {
                  onDuplicateProject(activeMenuProject.id);
                  setMenuTarget(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Duplikovat projekt
              </button>

              {/* Reordering actions */}
              <div className="h-px bg-slate-100 my-1" />
              <button
                type="button"
                disabled={activeMenuProjectIndex <= 0}
                onClick={() => {
                  handleMoveProject(activeMenuProject.id, 'left');
                  setMenuTarget(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                Posunout doleva
              </button>
              <button
                type="button"
                disabled={activeMenuProjectIndex >= projects.length - 1}
                onClick={() => {
                  handleMoveProject(activeMenuProject.id, 'right');
                  setMenuTarget(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                Posunout doprava
              </button>

              <div className="h-px bg-slate-100 my-1" />
              <button
                type="button"
                onClick={() => {
                  onCloseProject(activeMenuProject.id);
                  setMenuTarget(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Zavřít projekt
              </button>
            </div>
          </>,
          document.body
        )}

      {/* Right Controls: All Projects Manager & Counter */}
      <div className="flex items-center gap-1 shrink-0 relative">
        <button
          type="button"
          onClick={() => {
            setShowAllProjectsMenu(!showAllProjectsMenu);
            setMenuTarget(null);
          }}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors border ${
            showAllProjectsMenu
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
              : 'bg-white/70 border-slate-300/80 text-slate-600 hover:bg-white hover:text-slate-800'
          }`}
          title="Zobrazit přehled všech projektů"
        >
          <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline font-medium">Projekty</span>
          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full font-mono text-[10px] font-bold">
            {projects.length}
          </span>
        </button>

        {/* All Projects Overview Modal / Dropdown */}
        {showAllProjectsMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full right-0 mt-1 w-72 sm:w-84 bg-white rounded-xl shadow-2xl border border-slate-200 p-2.5 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 space-y-2"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                Všechny projekty ({projects.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  onCreateProject();
                  setShowAllProjectsMenu(false);
                }}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Nový
              </button>
            </div>

            {/* Project Search */}
            {projects.length > 3 && (
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  placeholder="Hledat projekt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-400"
                />
              </div>
            )}

            {/* List of projects with reorder arrows */}
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {filteredProjects.map((proj) => {
                const isActive = proj.id === activeProjectId;
                const idx = projects.findIndex((p) => p.id === proj.id);

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      setShowAllProjectsMenu(false);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs font-medium'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <div className="min-w-0 text-left">
                        <div className="truncate text-xs font-semibold">{proj.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(proj.updatedAt).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Move up */}
                      <button
                        type="button"
                        disabled={idx <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveProject(proj.id, 'left');
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                        title="Posunout nahoru"
                      >
                        <ArrowLeft className="w-3 h-3 rotate-90" />
                      </button>
                      {/* Move down */}
                      <button
                        type="button"
                        disabled={idx >= projects.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveProject(proj.id, 'right');
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                        title="Posunout dolů"
                      >
                        <ArrowRight className="w-3 h-3 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(proj.id);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        title="Duplikovat"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseProject(proj.id);
                        }}
                        className="p-1 hover:bg-rose-100 rounded text-rose-500"
                        title="Zavřít"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            {onImportProject && (
              <div className="pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onImportProject();
                    setShowAllProjectsMenu(false);
                  }}
                  className="w-full py-1 text-center text-xs text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Importovat projekt ze souboru (.mywords)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
