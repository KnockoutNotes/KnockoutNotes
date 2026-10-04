/**
 * KnockoutNotes Branded Chapter PDF Generator
 * Built with pdf-lib for native Cloudflare Workers isolate execution.
 * Creates publication-quality, A4 medical revision monographs from canonical Study Notes data.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Color Palette
const COLORS = {
  primary: rgb(0.06, 0.15, 0.28),       // Deep Navy (#0f2747)
  primaryLight: rgb(0.12, 0.25, 0.42),  // Medium Navy
  accent: rgb(0.01, 0.52, 0.78),        // Medical Cyan (#0284c7)
  accentBg: rgb(0.92, 0.96, 0.99),      // Very Light Cyan (#ebf5fb)
  textMain: rgb(0.12, 0.15, 0.18),      // Charcoal (#1f2937)
  textMuted: rgb(0.38, 0.44, 0.52),     // Slate Gray (#64748b)
  border: rgb(0.85, 0.88, 0.92),        // Light Gray (#e2e8f0)
  cardBg: rgb(0.96, 0.97, 0.99),        // Card Off-White (#f8fafc)
  tableHeaderBg: rgb(0.1, 0.25, 0.45),  // Navy Header
  tableRowAlt: rgb(0.97, 0.98, 1.0),    // Alternating Row
  white: rgb(1, 1, 1)
};

// Page Dimensions (A4 in points: 595.28 x 841.89)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 42;
const MARGIN_RIGHT = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 511.28 pt
const MARGIN_TOP = 52;
const MARGIN_BOTTOM = 48;

/**
 * Word-wrap a single line of text according to available width
 */
function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word exceeds line width -> force split
        lines.push(word);
        currentLine = '';
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [''];
}

/**
 * Sanitize text to avoid pdf-lib standard font encoding issues
 */
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/[^\x00-\x7F\xA0-\xFF]/g, (char) => {
      // Common medical and typographical replacements
      switch (char) {
        case '—':
        case '–': return '-';
        case '“':
        case '”': return '"';
        case '‘':
        case '’': return "'";
        case '•': return '*';
        case '≥': return '>=';
        case '≤': return '<=';
        case '±': return '+/-';
        case '°': return ' deg ';
        case '×': return 'x';
        case '→': return '->';
        case '←': return '<-';
        case 'μ': return 'u';
        case '²': return '2';
        case '³': return '3';
        case '₁': return '1';
        case '₂': return '2';
        case '₀': return '0';
        default: return ' ';
      }
    });
}

/**
 * Generate a complete, branded A4 PDF document for a study chapter
 */
export async function generateChapterPdf(chapter, options = {}) {
  const pdfDoc = await PDFDocument.create();

  // Embed standard core fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  let currentPage = null;
  let cursorY = 0;
  const pagesList = [];

  // Helper to spawn a new page
  function addNewPage() {
    currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pagesList.push(currentPage);
    cursorY = PAGE_HEIGHT - MARGIN_TOP;
    return currentPage;
  }

  // Ensure enough vertical space or break page
  function ensureSpace(requiredHeight) {
    if (!currentPage || cursorY - requiredHeight < MARGIN_BOTTOM) {
      addNewPage();
    }
  }

  // Draw Running Header on current page
  function drawRunningHeader(page, chapterName, isCoverPage) {
    if (isCoverPage) {
      // Top Brand Banner on First Page
      page.drawRectangle({
        x: MARGIN_LEFT,
        y: PAGE_HEIGHT - 38,
        width: CONTENT_WIDTH,
        height: 22,
        color: COLORS.primary
      });

      page.drawText('KNOCKOUT NOTES', {
        x: MARGIN_LEFT + 10,
        y: PAGE_HEIGHT - 31,
        size: 9.5,
        font: fontBold,
        color: COLORS.white
      });

      page.drawText('Medical Knowledge Engine  |  Official Revision Monograph', {
        x: MARGIN_LEFT + 115,
        y: PAGE_HEIGHT - 31,
        size: 8,
        font: fontRegular,
        color: rgb(0.85, 0.92, 0.98)
      });

      const urlText = 'knockoutnotes-anaesthesia.workers.dev';
      const urlWidth = fontRegular.widthOfTextAtSize(urlText, 7.5);
      page.drawText(urlText, {
        x: MARGIN_LEFT + CONTENT_WIDTH - urlWidth - 10,
        y: PAGE_HEIGHT - 31,
        size: 7.5,
        font: fontRegular,
        color: COLORS.white
      });
      return;
    }

    // Standard Inner Page Header
    page.drawLine({
      start: { x: MARGIN_LEFT, y: PAGE_HEIGHT - 34 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: PAGE_HEIGHT - 34 },
      thickness: 0.8,
      color: COLORS.border
    });

    page.drawText('KNOCKOUT NOTES', {
      x: MARGIN_LEFT,
      y: PAGE_HEIGHT - 30,
      size: 8,
      font: fontBold,
      color: COLORS.accent
    });

    const sanitizedTitle = sanitizeText(chapterName);
    const titleSnippet = sanitizedTitle.length > 55 ? sanitizedTitle.slice(0, 52) + '...' : sanitizedTitle;
    const titleWidth = fontItalic.widthOfTextAtSize(titleSnippet, 8);

    page.drawText(titleSnippet, {
      x: MARGIN_LEFT + CONTENT_WIDTH - titleWidth,
      y: PAGE_HEIGHT - 30,
      size: 8,
      font: fontItalic,
      color: COLORS.textMuted
    });
  }

  // Start with first page
  addNewPage();

  // --------------------------------------------------------------------------
  // 1. HERO TITLE BLOCK (PAGE 1)
  // --------------------------------------------------------------------------
  cursorY -= 20;

  // Domain kicker
  const domainText = sanitizeText((chapter.cat || 'CLINICAL STUDY NOTES').toUpperCase().replace(/_/g, ' '));
  currentPage.drawText(domainText, {
    x: MARGIN_LEFT,
    y: cursorY,
    size: 9,
    font: fontBold,
    color: COLORS.accent
  });
  cursorY -= 18;

  // Chapter Name (Multi-line wrap)
  const cleanTitle = sanitizeText(chapter.name || 'Clinical Monograph');
  const titleLines = wrapText(cleanTitle, fontBold, 18, CONTENT_WIDTH);
  for (const line of titleLines) {
    currentPage.drawText(line, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 18,
      font: fontBold,
      color: COLORS.primary
    });
    cursorY -= 23;
  }

  // Tagline or Classification
  const tagline = sanitizeText(chapter.tagline || chapter.classification || '');
  if (tagline) {
    cursorY -= 2;
    const tagLines = wrapText(tagline, fontItalic, 10, CONTENT_WIDTH);
    for (const tl of tagLines) {
      currentPage.drawText(tl, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 10,
        font: fontItalic,
        color: COLORS.textMuted
      });
      cursorY -= 14;
    }
  }

  cursorY -= 6;

  // Metadata & Sourcing Box
  const sourceText = sanitizeText(chapter.source || "Miller's Anesthesia / Washington Manual of Critical Care / ASA Guidelines.");
  const sourceLines = wrapText(`Source Citation: ${sourceText}`, fontRegular, 8.5, CONTENT_WIDTH - 24);
  const sourceBoxHeight = 16 + (sourceLines.length * 11);

  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - sourceBoxHeight,
    width: CONTENT_WIDTH,
    height: sourceBoxHeight,
    color: COLORS.accentBg,
    borderColor: COLORS.border,
    borderWidth: 0.8
  });

  // Vertical accent bar on left of source box
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - sourceBoxHeight,
    width: 4,
    height: sourceBoxHeight,
    color: COLORS.accent
  });

  let sourceTextY = cursorY - 14;
  for (let i = 0; i < sourceLines.length; i++) {
    currentPage.drawText(sourceLines[i], {
      x: MARGIN_LEFT + 14,
      y: sourceTextY,
      size: 8.5,
      font: i === 0 ? fontBold : fontRegular,
      color: COLORS.primary
    });
    sourceTextY -= 11;
  }

  cursorY -= (sourceBoxHeight + 14);

  // --------------------------------------------------------------------------
  // 2. TABLE OF CONTENTS SUMMARY (IF >= 2 SECTIONS)
  // --------------------------------------------------------------------------
  const sections = chapter.sections || [];
  if (sections.length >= 2) {
    ensureSpace(40 + (sections.length * 13));

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - (22 + sections.length * 13),
      width: CONTENT_WIDTH,
      height: 22 + sections.length * 13,
      color: COLORS.cardBg,
      borderColor: COLORS.border,
      borderWidth: 0.6
    });

    currentPage.drawText('CHAPTER CONTENTS & CLINICAL OUTLINE', {
      x: MARGIN_LEFT + 12,
      y: cursorY - 13,
      size: 8,
      font: fontBold,
      color: COLORS.primary
    });

    let tocY = cursorY - 26;
    for (let i = 0; i < sections.length; i++) {
      const secTitle = sanitizeText(sections[i].h || `Section ${i + 1}`);
      const lineStr = `${i + 1}.  ${secTitle}`;
      const wrappedToc = wrapText(lineStr, fontRegular, 8, CONTENT_WIDTH - 26);
      currentPage.drawText(wrappedToc[0], {
        x: MARGIN_LEFT + 12,
        y: tocY,
        size: 8,
        font: fontRegular,
        color: COLORS.textMain
      });
      tocY -= 13;
    }

    cursorY -= (36 + sections.length * 13);
  }

  // --------------------------------------------------------------------------
  // 3. CHAPTER SECTIONS RENDERING
  // --------------------------------------------------------------------------
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const sec = sections[sIdx];
    const secTitle = sanitizeText(sec.h || `Section ${sIdx + 1}`);

    // Section Header Pill
    ensureSpace(45);
    cursorY -= 8;

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 20,
      width: CONTENT_WIDTH,
      height: 20,
      color: COLORS.primaryLight
    });

    currentPage.drawText(`${sIdx + 1}.  ${secTitle}`, {
      x: MARGIN_LEFT + 10,
      y: cursorY - 14,
      size: 10,
      font: fontBold,
      color: COLORS.white
    });

    cursorY -= 30;

    // Section Body Prose / Points
    if (sec.b) {
      const cleanBody = sanitizeText(sec.b);
      const paragraphs = cleanBody.split(/\n\s*\n/);

      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        const lines = trimmed.split('\n');
        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) {
            cursorY -= 4;
            continue;
          }

          const isBullet = cleanLine.startsWith('*') || cleanLine.startsWith('-') || cleanLine.startsWith('•');
          const bulletIndent = isBullet ? 14 : 0;
          const displayLine = isBullet ? cleanLine.replace(/^[*•-]\s*/, '') : cleanLine;

          const wrappedLines = wrapText(displayLine, fontRegular, 9, CONTENT_WIDTH - bulletIndent);

          ensureSpace(wrappedLines.length * 12 + 4);

          for (let lIdx = 0; lIdx < wrappedLines.length; lIdx++) {
            const lText = wrappedLines[lIdx];

            if (isBullet && lIdx === 0) {
              currentPage.drawText('•', {
                x: MARGIN_LEFT + 4,
                y: cursorY,
                size: 9,
                font: fontBold,
                color: COLORS.accent
              });
            }

            // Check if line starts with bold label e.g. "Label:"
            const colonIdx = lText.indexOf(':');
            if (colonIdx > 0 && colonIdx < 35 && lIdx === 0) {
              const labelPart = lText.slice(0, colonIdx + 1);
              const restPart = lText.slice(colonIdx + 1);
              const labelWidth = fontBold.widthOfTextAtSize(labelPart, 9);

              currentPage.drawText(labelPart, {
                x: MARGIN_LEFT + bulletIndent,
                y: cursorY,
                size: 9,
                font: fontBold,
                color: COLORS.primary
              });

              currentPage.drawText(restPart, {
                x: MARGIN_LEFT + bulletIndent + labelWidth,
                y: cursorY,
                size: 9,
                font: fontRegular,
                color: COLORS.textMain
              });
            } else {
              currentPage.drawText(lText, {
                x: MARGIN_LEFT + bulletIndent,
                y: cursorY,
                size: 9,
                font: fontRegular,
                color: COLORS.textMain
              });
            }

            cursorY -= 12.5;
          }

          cursorY -= 2;
        }

        cursorY -= 4;
      }
    }

    // Section Table (if present)
    if (sec.table && Array.isArray(sec.table.headers) && Array.isArray(sec.table.rows)) {
      const headers = sec.table.headers.map(h => sanitizeText(h));
      const rows = sec.table.rows.map(r => r.map(c => sanitizeText(c)));
      const numCols = headers.length;

      if (numCols > 0) {
        cursorY -= 8;
        const colWidth = CONTENT_WIDTH / numCols;

        // Render Header Row
        ensureSpace(30);

        currentPage.drawRectangle({
          x: MARGIN_LEFT,
          y: cursorY - 18,
          width: CONTENT_WIDTH,
          height: 18,
          color: COLORS.tableHeaderBg
        });

        for (let c = 0; c < numCols; c++) {
          const hText = headers[c];
          currentPage.drawText(hText, {
            x: MARGIN_LEFT + (c * colWidth) + 6,
            y: cursorY - 13,
            size: 8,
            font: fontBold,
            color: COLORS.white
          });
        }

        cursorY -= 18;

        // Render Data Rows
        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const rowData = rows[rIdx];

          // Compute max wrapped height for this row
          let maxCellLines = 1;
          const wrappedCells = [];

          for (let c = 0; c < numCols; c++) {
            const cellText = rowData[c] || '';
            const cellLines = wrapText(cellText, fontRegular, 7.5, colWidth - 10);
            wrappedCells.push(cellLines);
            if (cellLines.length > maxCellLines) maxCellLines = cellLines.length;
          }

          const rowHeight = Math.max(16, maxCellLines * 9.5 + 6);
          ensureSpace(rowHeight);

          // Alternating row background
          if (rIdx % 2 === 1) {
            currentPage.drawRectangle({
              x: MARGIN_LEFT,
              y: cursorY - rowHeight,
              width: CONTENT_WIDTH,
              height: rowHeight,
              color: COLORS.tableRowAlt
            });
          }

          // Row bottom border
          currentPage.drawLine({
            start: { x: MARGIN_LEFT, y: cursorY - rowHeight },
            end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - rowHeight },
            thickness: 0.5,
            color: COLORS.border
          });

          // Draw cells
          for (let c = 0; c < numCols; c++) {
            const cLines = wrappedCells[c];
            let cellY = cursorY - 9;
            for (const cl of cLines) {
              currentPage.drawText(cl, {
                x: MARGIN_LEFT + (c * colWidth) + 6,
                y: cellY,
                size: 7.5,
                font: fontRegular,
                color: COLORS.textMain
              });
              cellY -= 9.5;
            }
          }

          cursorY -= rowHeight;
        }

        cursorY -= 10;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. FOOTERS & HEADERS PASS (ACCURATE "PAGE X OF Y")
  // --------------------------------------------------------------------------
  const totalPages = pagesList.length;

  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const page = pagesList[pIdx];
    const isFirstPage = pIdx === 0;

    // Draw header
    drawRunningHeader(page, chapter.name, isFirstPage);

    // Draw Running Footer
    page.drawLine({
      start: { x: MARGIN_LEFT, y: MARGIN_BOTTOM + 16 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: MARGIN_BOTTOM + 16 },
      thickness: 0.6,
      color: COLORS.border
    });

    const footerText = 'Knockout Notes  |  Verified Medical Revision Monograph  |  Educational Practice Use Only';
    page.drawText(footerText, {
      x: MARGIN_LEFT,
      y: MARGIN_BOTTOM + 4,
      size: 7.5,
      font: fontRegular,
      color: COLORS.textMuted
    });

    const pageNumberStr = `Page ${pIdx + 1} of ${totalPages}`;
    const pageNumWidth = fontRegular.widthOfTextAtSize(pageNumberStr, 7.5);
    page.drawText(pageNumberStr, {
      x: MARGIN_LEFT + CONTENT_WIDTH - pageNumWidth,
      y: MARGIN_BOTTOM + 4,
      size: 7.5,
      font: fontBold,
      color: COLORS.primary
    });
  }

  return await pdfDoc.save();
}
