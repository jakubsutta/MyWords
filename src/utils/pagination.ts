import type { PageSettings } from '../types/editor';
import { getFormatDimensions } from './formatConfig';

/**
 * Splits HTML content into discrete pages based on page dimensions,
 * margins, element heights, and explicit page breaks.
 */
export function paginateHtml(
  htmlContent: string,
  pageSettings: PageSettings
): string[] {
  if (!htmlContent || !htmlContent.trim()) {
    return ['<p></p>'];
  }

  const { heightMm } = getFormatDimensions(
    pageSettings.format,
    pageSettings.orientation
  );

  // Available height in millimeters and approximate CSS pixels (1mm ~ 3.7795px)
  const availableHeightMm = Math.max(
    60,
    heightMm - pageSettings.margins.top - pageSettings.margins.bottom - 20 // 20mm reserved for header/footer safety
  );
  const maxPageHeightPx = availableHeightMm * 3.7795;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${htmlContent}</body>`, 'text/html');
  const body = doc.body;

  // Flatten top-level children
  const nodes = Array.from(body.childNodes);
  if (nodes.length === 0) {
    return ['<p></p>'];
  }

  const pages: string[] = [];
  let currentPageBlocks: string[] = [];
  let currentPageHeight = 0;

  // Estimate height of a DOM node in pixels
  function estimateNodeHeight(node: Node): number {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').trim();
      if (!text) return 0;
      const lines = Math.ceil(text.length / 75);
      return Math.max(22, lines * 24);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return 0;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Explicit page breaks always trigger a new page
    if (
      el.getAttribute('data-page-break') === 'true' ||
      el.getAttribute('data-type') === 'page-break' ||
      el.classList.contains('mywords-page-break') ||
      el.classList.contains('page-break-indicator')
    ) {
      return -9999; // Sentinel value for immediate page break
    }

    if (tag === 'h1') {
      const textLen = (el.textContent || '').length;
      return 52 + Math.ceil(textLen / 35) * 36;
    }
    if (tag === 'h2') {
      const textLen = (el.textContent || '').length;
      return 42 + Math.ceil(textLen / 45) * 28;
    }
    if (tag === 'h3') {
      const textLen = (el.textContent || '').length;
      return 34 + Math.ceil(textLen / 55) * 24;
    }
    if (tag === 'p') {
      const text = (el.textContent || '').trim();
      if (!text) return 24; // empty paragraph
      const lines = Math.max(1, Math.ceil(text.length / 80));
      return lines * 25 + 12; // line-height + margin
    }
    if (tag === 'ul' || tag === 'ol') {
      const liCount = el.querySelectorAll('li').length || 1;
      return liCount * 28 + 16;
    }
    if (tag === 'blockquote') {
      const text = (el.textContent || '').trim();
      const lines = Math.max(1, Math.ceil(text.length / 70));
      return lines * 26 + 24;
    }
    if (tag === 'table') {
      const rowCount = el.querySelectorAll('tr').length || 1;
      return rowCount * 36 + 20;
    }
    if (tag === 'img') {
      const heightAttr = el.getAttribute('height');
      if (heightAttr && !isNaN(parseInt(heightAttr, 10))) {
        return Math.min(maxPageHeightPx * 0.8, parseInt(heightAttr, 10) + 16);
      }
      return 220;
    }
    if (tag === 'hr') {
      return 24;
    }

    // Default container or div
    const text = (el.textContent || '').trim();
    if (!text) return 20;
    const lines = Math.max(1, Math.ceil(text.length / 80));
    return lines * 25 + 14;
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const estimatedH = estimateNodeHeight(node);

    // Is it an explicit page break?
    if (estimatedH === -9999) {
      if (currentPageBlocks.length > 0) {
        pages.push(currentPageBlocks.join(''));
        currentPageBlocks = [];
        currentPageHeight = 0;
      }
      continue;
    }

    const nodeHtml =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement).outerHTML
        : node.textContent || '';

    if (!nodeHtml.trim()) continue;

    // Check if adding this node exceeds page height
    if (currentPageHeight + estimatedH > maxPageHeightPx && currentPageBlocks.length > 0) {
      pages.push(currentPageBlocks.join(''));
      currentPageBlocks = [nodeHtml];
      currentPageHeight = estimatedH;
    } else {
      currentPageBlocks.push(nodeHtml);
      currentPageHeight += estimatedH;
    }
  }

  if (currentPageBlocks.length > 0) {
    pages.push(currentPageBlocks.join(''));
  }

  return pages.length > 0 ? pages : ['<p></p>'];
}
