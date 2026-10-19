import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import type { PageSettings } from '../types/editor';
import { getFormatDimensions } from './formatConfig';

export function triggerPrint() {
  window.print();
}

export async function exportToPdf(
  element: HTMLElement,
  title: string,
  pageSettings: PageSettings
) {
  // Use html2canvas to capture page elements
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution
    useCORS: true,
    logging: false,
    backgroundColor: pageSettings.paperColor || '#ffffff',
  });

  const isLandscape = pageSettings.orientation === 'landscape';
  const { widthMm, heightMm } = getFormatDimensions(pageSettings.format, pageSettings.orientation);

  // Create jsPDF document with exact dimensions
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgProps = pdf.getImageProperties(imgData);
  const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // If content spans multiple pages
  let heightLeft = calculatedHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - calculatedHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight);
    heightLeft -= pdfHeight;
  }

  const fileName = `${title.trim() || 'Dokument'}.pdf`;
  pdf.save(fileName);
}

export function exportToTxt(content: string, title: string) {
  // Extract text by creating temporary div
  const div = document.createElement('div');
  div.innerHTML = content;
  const plainText = div.innerText || div.textContent || '';
  const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${title.trim() || 'Dokument'}.txt`);
}

export function exportToHtml(
  content: string,
  title: string,
  pageSettings: PageSettings
) {
  const { widthMm } = getFormatDimensions(pageSettings.format, pageSettings.orientation);
  const fullHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      max-width: ${widthMm}mm;
      margin: 0 auto;
      padding: ${pageSettings.margins.top}mm ${pageSettings.margins.right}mm ${pageSettings.margins.bottom}mm ${pageSettings.margins.left}mm;
      background-color: ${pageSettings.paperColor};
      color: #1a202c;
    }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f1f5f9; }
    blockquote { border-left: 3px solid #3b82f6; padding-left: 1rem; color: #4b5563; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${title.trim() || 'Dokument'}.html`);
}

export function exportToMarkdown(content: string, title: string) {
  const div = document.createElement('div');
  div.innerHTML = content;

  function toMd(el: Node): string {
    if (el.nodeType === Node.TEXT_NODE) {
      return el.textContent || '';
    }
    if (el.nodeType === Node.ELEMENT_NODE) {
      const element = el as HTMLElement;
      const tag = element.tagName.toLowerCase();
      const inner = Array.from(element.childNodes).map(toMd).join('');

      switch (tag) {
        case 'h1': return `# ${inner}\n\n`;
        case 'h2': return `## ${inner}\n\n`;
        case 'h3': return `### ${inner}\n\n`;
        case 'p': return `${inner}\n\n`;
        case 'strong':
        case 'b': return `**${inner}**`;
        case 'em':
        case 'i': return `*${inner}*`;
        case 'u': return `_${inner}_`;
        case 'blockquote': return `> ${inner}\n\n`;
        case 'li': return `- ${inner}\n`;
        case 'ul':
        case 'ol': return `\n${inner}\n`;
        case 'hr': return `---\n\n`;
        case 'br': return `\n`;
        default: return inner;
      }
    }
    return '';
  }

  const markdown = toMd(div);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${title.trim() || 'Dokument'}.md`);
}

export function exportToProjectJson(data: any, title: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${title.trim() || 'Dokument'}.mywords`);
}
