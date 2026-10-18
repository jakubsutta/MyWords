import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Link as LinkIcon,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const EditorBubbleMenu: React.FC<Props> = ({ editor }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      const { selection } = editor.state;
      if (selection.empty) {
        setCoords(null);
        return;
      }

      const { ranges } = selection;
      const from = Math.min(...ranges.map((r) => r.$from.pos));
      const to = Math.max(...ranges.map((r) => r.$to.pos));

      if (from === to) {
        setCoords(null);
        return;
      }

      // Check DOM coordinates
      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) {
        setCoords(null);
        return;
      }

      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setCoords(null);
        return;
      }

      // Position centered above selection
      setCoords({
        top: Math.max(10, rect.top - 46),
        left: Math.max(10, rect.left + rect.width / 2),
      });
    };

    editor.on('selectionUpdate', updatePosition);
    editor.on('blur', () => {
      setTimeout(() => {
        if (!document.activeElement || !menuRef.current?.contains(document.activeElement)) {
          setCoords(null);
        }
      }, 200);
    });

    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor]);

  if (!editor || !coords) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL odkazu:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
      className="no-print bg-slate-900 text-white rounded-lg shadow-xl px-1.5 py-1 flex items-center gap-1 border border-slate-700 animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('bold') ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-300'
        }`}
        title="Tučné"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('italic') ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-300'
        }`}
        title="Kurzíva"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('underline') ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-300'
        }`}
        title="Podtržené"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('strike') ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-300'
        }`}
        title="Přeškrtnuté"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-slate-700 mx-0.5" />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run();
        }}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('highlight') ? 'text-yellow-400 bg-slate-800' : 'text-slate-300'
        }`}
        title="Zvýraznit žlutě"
      >
        <Highlighter className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setLink();
        }}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('link') ? 'text-blue-400 bg-slate-800' : 'text-slate-300'
        }`}
        title="Vložit odkaz"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
