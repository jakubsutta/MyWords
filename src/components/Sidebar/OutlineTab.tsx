import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import type { OutlineItem } from '../../types/editor';
import { ListTree, BookOpen, ChevronRight, Hash } from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const OutlineTab: React.FC<Props> = ({ editor }) => {
  const [headings, setHeadings] = useState<OutlineItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const extractHeadings = () => {
      const items: OutlineItem[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const text = node.textContent;
          if (text.trim()) {
            items.push({
              id: `heading-${pos}`,
              text,
              level: node.attrs.level || 1,
              pos,
            });
          }
        }
      });
      setHeadings(items);
    };

    extractHeadings();
    editor.on('update', extractHeadings);
    return () => {
      editor.off('update', extractHeadings);
    };
  }, [editor]);

  if (!editor) return null;

  const scrollToHeading = (pos: number) => {
    editor.chain().focus().setTextSelection(pos + 1).run();
  };

  const handleInsertTOC = () => {
    if (headings.length === 0) {
      alert('V dokumentu nejsou žádné nadpisy pro vytvoření obsahu.');
      return;
    }

    let tocHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0;">
        <h3 style="margin-top: 0; margin-bottom: 0.75rem; color: #1e293b; font-size: 1.1rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem;">Obsah dokumentu</h3>
        <ul style="list-style: none; padding-left: 0; margin: 0; line-height: 1.8;">
    `;

    headings.forEach((h) => {
      const indent = (h.level - 1) * 1.5;
      const weight = h.level === 1 ? '600' : '400';
      const color = h.level === 1 ? '#0f172a' : '#475569';
      tocHtml += `
        <li style="margin-left: ${indent}rem; display: flex; justify-content: space-between; align-items: baseline; font-weight: ${weight}; color: ${color};">
          <span>${h.text}</span>
          <span style="flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 0.5rem; height: 1px;"></span>
        </li>
      `;
    });

    tocHtml += `
        </ul>
      </div>
      <p></p>
    `;

    editor.chain().focus().insertContent(tocHtml).run();
  };

  return (
    <div className="space-y-6">
      {/* Table of contents actions */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          Automatický obsah
        </label>
        <button
          type="button"
          onClick={handleInsertTOC}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 text-xs font-medium transition-all shadow-2xs"
        >
          <ListTree className="w-4 h-4 text-blue-600" />
          Vložit generovaný obsah do textu
        </button>
      </div>

      {/* Headings navigation list */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-blue-600" />
            Navigátor kapitol ({headings.length})
          </span>
        </label>

        {headings.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            Dokument zatím neobsahuje žádné nadpisy (H1, H2, H3). Přidejte nadpis v záložce Formátování.
          </div>
        ) : (
          <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
            {headings.map((h, i) => (
              <button
                key={`${h.id}-${i}`}
                type="button"
                onClick={() => scrollToHeading(h.pos)}
                style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                className={`w-full text-left py-1.5 pr-2 rounded-lg text-xs hover:bg-blue-50/60 hover:text-blue-700 flex items-center gap-1.5 transition-colors group ${
                  h.level === 1
                    ? 'font-semibold text-slate-800'
                    : h.level === 2
                    ? 'font-medium text-slate-700'
                    : 'text-slate-500'
                }`}
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                <span className="truncate">{h.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
