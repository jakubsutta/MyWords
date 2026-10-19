import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['heading', 'paragraph', 'blockquote', 'listItem'],
      defaultLineHeight: '1.6',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) => {
          return this.options.types
            .map((type: string) => commands.updateAttributes(type, { lineHeight }))
            .some((response: boolean) => response);
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type: string) => commands.resetAttributes(type, 'lineHeight'))
            .some((response: boolean) => response);
        },
    };
  },
});
