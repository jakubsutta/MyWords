import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Insert a page break
       */
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  parseHTML() {
    return [
      { tag: 'div[data-page-break]' },
      { tag: 'div[data-type="page-break"]' },
      { tag: 'div.mywords-page-break' },
      { tag: 'hr.page-break' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-page-break': 'true',
        'data-type': 'page-break',
        class: 'mywords-page-break',
      }),
      [
        'div',
        { class: 'page-break-badge no-print' },
        [
          'span',
          { class: 'page-break-icon' },
          '📄',
        ],
        [
          'span',
          { class: 'page-break-label' },
          'Zalomení stránky',
        ],
        [
          'span',
          { class: 'page-break-hint' },
          '(Ctrl+Enter / Cmd+Enter)',
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain, state }) => {
          const { $to } = state.selection;
          return chain()
            .insertContentAt($to.pos, [
              {
                type: this.name,
              },
              {
                type: 'paragraph',
              },
            ])
            .focus()
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.setPageBreak(),
    };
  },
});
