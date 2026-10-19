import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImageComponent } from './ResizableImageComponent';

export const ResizableImage = Image.extend({
  name: 'image',

  inline() {
    return false;
  },

  group() {
    return 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const widthAttr = element.getAttribute('width');
          if (widthAttr) return parseInt(widthAttr, 10);
          const styleWidth = element.style.width;
          if (styleWidth && styleWidth.includes('px')) {
            return parseInt(styleWidth, 10);
          }
          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px;`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const heightAttr = element.getAttribute('height');
          if (heightAttr) return parseInt(heightAttr, 10);
          const styleHeight = element.style.height;
          if (styleHeight && styleHeight.includes('px')) {
            return parseInt(styleHeight, 10);
          }
          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return {
            height: attributes.height,
            style: `height: ${attributes.height}px;`,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => {
          return element.getAttribute('data-align') || element.getAttribute('align') || 'center';
        },
        renderHTML: (attributes) => {
          return {
            'data-align': attributes.alignment || 'center',
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { width, height, alignment, ...rest } = HTMLAttributes;
    const styles: string[] = [];
    if (width) styles.push(`width: ${width}px`);
    if (height) styles.push(`height: ${height}px`);
    if (alignment === 'left') {
      styles.push('margin-right: auto');
      styles.push('margin-left: 0');
      styles.push('display: block');
    } else if (alignment === 'right') {
      styles.push('margin-left: auto');
      styles.push('margin-right: 0');
      styles.push('display: block');
    } else {
      styles.push('margin-left: auto');
      styles.push('margin-right: auto');
      styles.push('display: block');
    }

    return [
      'img',
      {
        ...rest,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        'data-align': alignment || 'center',
        style: styles.join('; '),
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
