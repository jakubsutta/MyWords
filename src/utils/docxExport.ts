import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import { saveAs } from 'file-saver';
import type { PageSettings, HeaderFooterSettings } from '../types/editor';

// Helper to convert mm to twips (1 mm = 56.7 twips, 1 inch = 1440 twips = 25.4 mm)
const mmToTwips = (mm: number) => Math.round(mm * 56.6929);

export async function exportToDocx(
  htmlContent: string,
  title: string,
  pageSettings: PageSettings,
  headerFooterSettings: HeaderFooterSettings
) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${htmlContent}</body>`, 'text/html');
  const body = doc.body;

  const children: (Paragraph | Table)[] = [];

  // Recursive parser for DOM elements to docx paragraphs/tables
  function parseNode(node: Node): (Paragraph | Table)[] {
    const results: (Paragraph | Table)[] = [];

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Headings
      if (tag === 'h1') {
        results.push(
          new Paragraph({
            text: el.textContent || '',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (tag === 'h2') {
        results.push(
          new Paragraph({
            text: el.textContent || '',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (tag === 'h3') {
        results.push(
          new Paragraph({
            text: el.textContent || '',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        );
      } else if (tag === 'p') {
        const textRuns: TextRun[] = [];
        parseInlineContent(el, textRuns);

        // Check alignment
        let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
        const style = el.getAttribute('style') || '';
        if (style.includes('text-align: center')) alignment = AlignmentType.CENTER;
        else if (style.includes('text-align: right')) alignment = AlignmentType.RIGHT;
        else if (style.includes('text-align: justify')) alignment = AlignmentType.JUSTIFIED;

        results.push(
          new Paragraph({
            children: textRuns.length > 0 ? textRuns : [new TextRun('')],
            alignment,
            spacing: { after: 140, line: 276 }, // 1.15 line spacing
          })
        );
      } else if (tag === 'blockquote') {
        results.push(
          new Paragraph({
            children: [new TextRun({ text: el.textContent || '', italics: true, color: '555555' })],
            indent: { left: mmToTwips(10) },
            spacing: { before: 120, after: 120 },
          })
        );
      } else if (tag === 'ul' || tag === 'ol') {
        const listItems = Array.from(el.children);
        listItems.forEach((li) => {
          const textRuns: TextRun[] = [];
          parseInlineContent(li as HTMLElement, textRuns);
          results.push(
            new Paragraph({
              children: textRuns,
              bullet: tag === 'ul' ? { level: 0 } : undefined,
              numbering: tag === 'ol' ? { reference: 'default-numbering', level: 0 } : undefined,
              spacing: { after: 60 },
            })
          );
        });
      } else if (tag === 'table') {
        const rows: TableRow[] = [];
        const trs = Array.from(el.querySelectorAll('tr'));
        trs.forEach((tr) => {
          const cells: TableCell[] = [];
          const thOrTds = Array.from(tr.children);
          thOrTds.forEach((cell) => {
            const isHeader = cell.tagName.toLowerCase() === 'th';
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cell.textContent || '',
                        bold: isHeader,
                      }),
                    ],
                  }),
                ],
                shading: isHeader ? { fill: 'F1F5F9' } : undefined,
                margins: {
                  top: 100,
                  bottom: 100,
                  left: 140,
                  right: 140,
                },
              })
            );
          });
          if (cells.length > 0) {
            rows.push(new TableRow({ children: cells }));
          }
        });

        if (rows.length > 0) {
          results.push(
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
      } else if (tag === 'hr') {
        results.push(
          new Paragraph({
            border: {
              bottom: {
                color: 'CCCCCC',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 160, after: 160 },
          })
        );
      } else {
        // Fallback for container divs or generic tags
        el.childNodes.forEach((child) => {
          results.push(...parseNode(child));
        });
      }
    }
    return results;
  }

  function parseInlineContent(
    parent: HTMLElement,
    textRuns: TextRun[],
    formatting: { bold?: boolean; italics?: boolean; underline?: boolean; strike?: boolean; color?: string } = {}
  ) {
    parent.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          textRuns.push(
            new TextRun({
              text,
              bold: formatting.bold,
              italics: formatting.italics,
              strike: formatting.strike,
              underline: formatting.underline ? {} : undefined,
              color: formatting.color,
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        const currentFormat = {
          bold: formatting.bold || tag === 'strong' || tag === 'b',
          italics: formatting.italics || tag === 'em' || tag === 'i',
          underline: formatting.underline || tag === 'u',
          strike: formatting.strike || tag === 's' || tag === 'strike',
          color: el.style.color ? el.style.color.replace('#', '') : formatting.color,
        };

        parseInlineContent(el, textRuns, currentFormat);
      }
    });
  }

  Array.from(body.childNodes).forEach((child) => {
    children.push(...parseNode(child));
  });

  if (children.length === 0) {
    children.push(new Paragraph({ text: '' }));
  }

  // Header & Footer
  let docHeader: Header | undefined;
  let docFooter: Footer | undefined;

  if (headerFooterSettings.showHeader && headerFooterSettings.headerText) {
    const align: (typeof AlignmentType)[keyof typeof AlignmentType] =
      headerFooterSettings.headerAlign === 'center'
        ? AlignmentType.CENTER
        : headerFooterSettings.headerAlign === 'right'
        ? AlignmentType.RIGHT
        : AlignmentType.LEFT;
    docHeader = new Header({
      children: [
        new Paragraph({
          text: headerFooterSettings.headerText,
          alignment: align,
          spacing: { after: 120 },
        }),
      ],
    });
  }

  if (headerFooterSettings.showFooter) {
    const align: (typeof AlignmentType)[keyof typeof AlignmentType] =
      headerFooterSettings.footerAlign === 'center'
        ? AlignmentType.CENTER
        : headerFooterSettings.footerAlign === 'right'
        ? AlignmentType.RIGHT
        : AlignmentType.LEFT;

    const footerChildren: (Paragraph | TextRun)[] = [];
    if (headerFooterSettings.footerText) {
      footerChildren.push(new TextRun({ text: headerFooterSettings.footerText + '  ' }));
    }

    if (headerFooterSettings.pageNumbering !== 'none') {
      footerChildren.push(new TextRun({ text: 'Strana ' }));
      footerChildren.push(new TextRun({ children: [PageNumber.CURRENT] }));
      if (headerFooterSettings.pageNumbering === 'page_of_total') {
        footerChildren.push(new TextRun({ text: ' z ' }));
        footerChildren.push(new TextRun({ children: [PageNumber.TOTAL_PAGES] }));
      }
    }

    docFooter = new Footer({
      children: [
        new Paragraph({
          children: footerChildren as any,
          alignment: align,
        }),
      ],
    });
  }

  const docFile = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: mmToTwips(pageSettings.margins.top),
              bottom: mmToTwips(pageSettings.margins.bottom),
              left: mmToTwips(pageSettings.margins.left),
              right: mmToTwips(pageSettings.margins.right),
            },
            size: {
              orientation:
                pageSettings.orientation === 'landscape'
                  ? (pageSettings.format === 'A4' ? { width: mmToTwips(297), height: mmToTwips(210) } : undefined) as any
                  : undefined,
            },
          },
        },
        headers: docHeader ? { default: docHeader } : undefined,
        footers: docFooter ? { default: docFooter } : undefined,
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(docFile);
  const fileName = `${title.trim() || 'Dokument'}.docx`;
  saveAs(blob, fileName);
}
