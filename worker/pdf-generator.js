/**
 * KnockoutNotes Branded Chapter PDF Generator
 * Built with pdf-lib for native Cloudflare Workers isolate execution.
 * Creates publication-quality, A4 medical revision monographs from canonical Study Notes data.
 * Typography: Authentic Comic Sans MS for headings & hierarchy; Calibri for all body content.
 * Features comfortable leading (1.35x–1.45x), anti-orphan section guards, and embedded vector QR codes.
 */

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import qrcode from 'qrcode-generator';
import { getComicSansRegularBytes, getComicSansBoldBytes } from './fonts/comic-fonts.js';
import { getCalibriRegularBytes, getCalibriBoldBytes, getCalibriItalicBytes } from './fonts/calibri-fonts.js';

// Color Palette
const COLORS = {
  primary: rgb(0.06, 0.15, 0.28),       // Deep Navy (#0f2747)
  primaryLight: rgb(0.12, 0.23, 0.37),  // Medium Navy (#1e3a5f)
  accent: rgb(0.01, 0.52, 0.78),        // Medical Cyan (#0284c7)
  accentBg: rgb(0.94, 0.97, 1.0),       // Soft Cyan Tint (#f0f9ff)
  textMain: rgb(0.12, 0.16, 0.23),      // Charcoal Slate (#1e293b)
  textMuted: rgb(0.39, 0.45, 0.55),     // Slate Gray (#64748b)
  border: rgb(0.88, 0.91, 0.94),        // Border Gray (#e2e8f0)
  cardBg: rgb(0.97, 0.98, 0.99),        // Card Off-White (#f8fafc)
  tableHeaderBg: rgb(0.08, 0.20, 0.36), // Dark Navy Table Header
  tableRowAlt: rgb(0.96, 0.98, 1.0),    // Alternating Row Tint
  alertBorder: rgb(0.96, 0.62, 0.04),   // Amber 500 (#f59e0b)
  white: rgb(1, 1, 1)
};

// Page Dimensions (A4 in points: 595.28 x 841.89)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 42;
const MARGIN_RIGHT = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 511.28 pt
const MARGIN_TOP = 46;
const MARGIN_BOTTOM = 46;

// Default Brand URLs for End-of-PDF QR Codes
const DEFAULT_QR_URLS = {
  website: 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/',
  instagram: 'https://www.instagram.com/knock.out.notes/',
  support: 'https://bondin.io/@knockoutnotes/support'
};

/**
 * Sanitize text to ensure clean medical typography and prevent glyph encoding errors.
 * Preserves unicode symbols natively supported by the subsetted font tables (•, ≥, ≤, ±, °, ×, →, ←, μ, ², ³, ₁, ₂).
 */
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF\u2022\u2192\u2190\u2265\u2264\u00B1\u00B0\u03BC\u00B2\u00B3\u2081\u2082]/g, (char) => {
      switch (char) {
        case '•': return '•';
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
        default: return ' ';
      }
    });
}

/**
 * Word-wrap a string according to available width
 */
function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
              chunk += ch;
            } else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          currentLine = chunk;
        } else {
          currentLine = word;
        }
      } else {
        let chunk = '';
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        currentLine = chunk;
      }
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [''];
}

/**
 * Render a high-contrast vector QR code directly onto the PDF page
 */
function drawQrCode(page, text, x, y, size, options = {}) {
  const qrFn = qrcode.default || qrcode;
  const qr = qrFn(0, 'M');
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const marginModules = options.marginModules ?? 2;
  const totalModules = moduleCount + (marginModules * 2);
  const moduleSize = size / totalModules;

  // Background white box
  page.drawRectangle({
    x: x,
    y: y,
    width: size,
    height: size,
    color: rgb(1, 1, 1),
    borderColor: options.borderColor || rgb(0.85, 0.88, 0.92),
    borderWidth: 0.6
  });

  const darkColor = options.darkColor || rgb(0.06, 0.15, 0.28);
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const modX = x + (col + marginModules) * moduleSize;
        const modY = y + size - ((row + 1 + marginModules) * moduleSize);
        page.drawRectangle({
          x: modX,
          y: modY,
          width: moduleSize,
          height: moduleSize,
          color: darkColor
        });
      }
    }
  }
}

/**
 * Generate a complete, branded A4 PDF document for a study chapter.
 * Typography Hierarchy:
 * - Headings & Section Titles: Authentic Comic Sans MS Bold / Regular
 * - Body Prose, Bullets, Tables, Citations & Notes: Authentic Calibri Regular / Bold / Italic
 */
export async function generateChapterPdf(chapter, options = {}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // 1. Embed Headings Font: Authentic Comic Sans MS
  const fontComicRegular = await pdfDoc.embedFont(getComicSansRegularBytes());
  const fontComicBold = await pdfDoc.embedFont(getComicSansBoldBytes());

  // 2. Embed Body Font: Authentic Calibri
  const fontCalibriRegular = await pdfDoc.embedFont(getCalibriRegularBytes());
  const fontCalibriBold = await pdfDoc.embedFont(getCalibriBoldBytes());
  const fontCalibriItalic = await pdfDoc.embedFont(getCalibriItalicBytes());

  // Resolve QR code destination links
  const siteUrl = (options.siteUrl || DEFAULT_QR_URLS.website).replace(/\/$/, '') + '/';
  const instagramUrl = options.instagramUrl || DEFAULT_QR_URLS.instagram;
  const supportUrl = options.supportUrl || DEFAULT_QR_URLS.support;

  let currentPage = null;
  let cursorY = 0;
  const pagesList = [];

  function addNewPage() {
    currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pagesList.push(currentPage);
    cursorY = PAGE_HEIGHT - MARGIN_TOP;
    return currentPage;
  }

  function ensureSpace(requiredHeight) {
    if (!currentPage || cursorY - requiredHeight < MARGIN_BOTTOM + 28) {
      addNewPage();
      return true; // Indicates page break occurred
    }
    return false;
  }

  function drawRunningHeader(page, chapterName, isCoverPage) {
    if (isCoverPage) {
      // Top Brand Banner on Cover Page
      page.drawRectangle({
        x: MARGIN_LEFT,
        y: PAGE_HEIGHT - 36,
        width: CONTENT_WIDTH,
        height: 22,
        color: COLORS.primary
      });

      page.drawText('KNOCKOUT NOTES', {
        x: MARGIN_LEFT + 10,
        y: PAGE_HEIGHT - 29,
        size: 9.5,
        font: fontComicBold,
        color: COLORS.white
      });

      page.drawText('Medical Revision Monograph  |  Anaesthesia & Critical Care', {
        x: MARGIN_LEFT + 124,
        y: PAGE_HEIGHT - 29,
        size: 8,
        font: fontCalibriRegular,
        color: rgb(0.85, 0.92, 0.98)
      });

      const urlText = 'knockoutnotes-anaesthesia.workers.dev';
      const urlWidth = fontCalibriRegular.widthOfTextAtSize(urlText, 7.5);
      page.drawText(urlText, {
        x: MARGIN_LEFT + CONTENT_WIDTH - urlWidth - 10,
        y: PAGE_HEIGHT - 29,
        size: 7.5,
        font: fontCalibriRegular,
        color: COLORS.white
      });
      return;
    }

    // Standard Inner Page Header
    page.drawLine({
      start: { x: MARGIN_LEFT, y: PAGE_HEIGHT - 32 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: PAGE_HEIGHT - 32 },
      thickness: 0.8,
      color: COLORS.border
    });

    page.drawText('KNOCKOUT NOTES', {
      x: MARGIN_LEFT,
      y: PAGE_HEIGHT - 28,
      size: 8,
      font: fontComicBold,
      color: COLORS.accent
    });

    const handleText = ' |  @knock.out.notes';
    page.drawText(handleText, {
      x: MARGIN_LEFT + fontComicBold.widthOfTextAtSize('KNOCKOUT NOTES', 8),
      y: PAGE_HEIGHT - 28,
      size: 7.5,
      font: fontCalibriRegular,
      color: COLORS.textMuted
    });

    const sanitizedTitle = sanitizeText(chapterName);
    const titleSnippet = sanitizedTitle.length > 50 ? sanitizedTitle.slice(0, 48) + '...' : sanitizedTitle;
    const titleWidth = fontCalibriRegular.widthOfTextAtSize(titleSnippet, 8);

    page.drawText(titleSnippet, {
      x: MARGIN_LEFT + CONTENT_WIDTH - titleWidth,
      y: PAGE_HEIGHT - 28,
      size: 8,
      font: fontCalibriRegular,
      color: COLORS.textMuted
    });
  }

  // Start with First Page
  addNewPage();

  // --------------------------------------------------------------------------
  // 1. HERO TITLE BLOCK (PAGE 1)
  // --------------------------------------------------------------------------
  cursorY -= 16;

  // Domain kicker (Comic Sans Bold)
  const domainText = sanitizeText((chapter.cat || 'CLINICAL STUDY NOTES').toUpperCase().replace(/_/g, ' ') + '  •  REVISION HANDOUT');
  currentPage.drawText(domainText, {
    x: MARGIN_LEFT,
    y: cursorY,
    size: 8.5,
    font: fontComicBold,
    color: COLORS.accent
  });
  cursorY -= 18;

  // Chapter Name (Comic Sans Bold, size 17, leading 23)
  const cleanTitle = sanitizeText(chapter.name || 'Clinical Monograph');
  const titleLines = wrapText(cleanTitle, fontComicBold, 17, CONTENT_WIDTH);
  for (const line of titleLines) {
    currentPage.drawText(line, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 17,
      font: fontComicBold,
      color: COLORS.primary
    });
    cursorY -= 23;
  }

  // Tagline or Classification (Calibri Regular, size 9.5, leading 14)
  const tagline = sanitizeText(chapter.tagline || chapter.classification || '');
  if (tagline) {
    cursorY -= 4;
    const tagLines = wrapText(tagline, fontCalibriRegular, 9.5, CONTENT_WIDTH);
    for (const tl of tagLines) {
      currentPage.drawText(tl, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9.5,
        font: fontCalibriRegular,
        color: COLORS.textMuted
      });
      cursorY -= 14;
    }
  }

  cursorY -= 8;

  // Metadata & Clinical Sourcing Box
  const sourceText = sanitizeText(chapter.source || "Miller's Anesthesia / Washington Manual of Critical Care / ASA Guidelines.");
  const sourceLines = wrapText(`Clinical Evidence Source: ${sourceText}`, fontCalibriRegular, 8.5, CONTENT_WIDTH - 24);
  const sourceBoxHeight = 16 + (sourceLines.length * 12);

  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - sourceBoxHeight,
    width: CONTENT_WIDTH,
    height: sourceBoxHeight,
    color: COLORS.accentBg,
    borderColor: COLORS.border,
    borderWidth: 0.8
  });

  // Vertical cyan accent bar on left of source box
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - sourceBoxHeight,
    width: 3.5,
    height: sourceBoxHeight,
    color: COLORS.accent
  });

  let sourceTextY = cursorY - 12;
  for (let i = 0; i < sourceLines.length; i++) {
    currentPage.drawText(sourceLines[i], {
      x: MARGIN_LEFT + 14,
      y: sourceTextY,
      size: 8.5,
      font: fontCalibriRegular,
      color: COLORS.primary
    });
    sourceTextY -= 12;
  }

  cursorY -= (sourceBoxHeight + 16);

  // --------------------------------------------------------------------------
  // 2. TABLE OF CONTENTS SUMMARY (IF >= 2 SECTIONS)
  // --------------------------------------------------------------------------
  const sections = chapter.sections || [];
  if (sections.length >= 2) {
    const tocBoxHeight = 24 + (sections.length * 14);
    ensureSpace(tocBoxHeight + 16);

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - tocBoxHeight,
      width: CONTENT_WIDTH,
      height: tocBoxHeight,
      color: COLORS.cardBg,
      borderColor: COLORS.border,
      borderWidth: 0.6
    });

    currentPage.drawText('CHAPTER CONTENTS & HIGH-YIELD TOPIC OUTLINE', {
      x: MARGIN_LEFT + 12,
      y: cursorY - 15,
      size: 8.5,
      font: fontComicBold,
      color: COLORS.primary
    });

    let tocY = cursorY - 30;
    for (let i = 0; i < sections.length; i++) {
      const secTitle = sanitizeText(sections[i].h || `Section ${i + 1}`);
      const lineStr = `${i + 1}.  ${secTitle}`;
      const wrappedToc = wrapText(lineStr, fontCalibriRegular, 8.5, CONTENT_WIDTH - 26);
      currentPage.drawText(wrappedToc[0], {
        x: MARGIN_LEFT + 12,
        y: tocY,
        size: 8.5,
        font: fontCalibriRegular,
        color: COLORS.textMain
      });
      tocY -= 14;
    }

    cursorY -= (tocBoxHeight + 16);
  }

  // --------------------------------------------------------------------------
  // 3. CHAPTER SECTIONS RENDERING
  // --------------------------------------------------------------------------
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const sec = sections[sIdx];
    const secTitle = sanitizeText(sec.h || `Section ${sIdx + 1}`);

    // Anti-Orphan Heading Guard: Must have room for section heading + at least 50pt of body content
    const didBreak = ensureSpace(72);
    if (!didBreak && sIdx > 0) {
      cursorY -= 14; // Breathing room above new section on same page
    }

    // Section Header Pill (Comic Sans Bold)
    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 22,
      width: CONTENT_WIDTH,
      height: 22,
      color: COLORS.primaryLight
    });

    currentPage.drawText(`${sIdx + 1}.  ${secTitle}`, {
      x: MARGIN_LEFT + 10,
      y: cursorY - 15.5,
      size: 10,
      font: fontComicBold,
      color: COLORS.white
    });

    cursorY -= 32;

    // Section Body Prose / Bullets (Calibri)
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
            cursorY -= 5;
            continue;
          }

          const isBullet = cleanLine.startsWith('*') || cleanLine.startsWith('-') || cleanLine.startsWith('•');
          const bulletIndent = isBullet ? 14 : 0;
          const displayLine = isBullet ? cleanLine.replace(/^[*•-]\s*/, '') : cleanLine;

          // Comfortable leading: 13.5pt on 9.5pt font (1.42x body size)
          const bodyFontSize = 9.5;
          const lineHeight = 13.5;
          const wrappedLines = wrapText(displayLine, fontCalibriRegular, bodyFontSize, CONTENT_WIDTH - bulletIndent);
          ensureSpace(wrappedLines.length * lineHeight + 4);

          for (let lIdx = 0; lIdx < wrappedLines.length; lIdx++) {
            const lText = wrappedLines[lIdx];

            if (isBullet && lIdx === 0) {
              currentPage.drawText('•', {
                x: MARGIN_LEFT + 4,
                y: cursorY,
                size: 9.5,
                font: fontCalibriBold,
                color: COLORS.accent
              });
            }

            // Bold prefix detection e.g. "Preop Warning:"
            const colonIdx = lText.indexOf(':');
            if (colonIdx > 0 && colonIdx < 35 && lIdx === 0) {
              const labelPart = lText.slice(0, colonIdx + 1);
              const restPart = lText.slice(colonIdx + 1);
              const labelWidth = fontCalibriBold.widthOfTextAtSize(labelPart, bodyFontSize);

              currentPage.drawText(labelPart, {
                x: MARGIN_LEFT + bulletIndent,
                y: cursorY,
                size: bodyFontSize,
                font: fontCalibriBold,
                color: COLORS.primary
              });

              currentPage.drawText(restPart, {
                x: MARGIN_LEFT + bulletIndent + labelWidth,
                y: cursorY,
                size: bodyFontSize,
                font: fontCalibriRegular,
                color: COLORS.textMain
              });
            } else {
              currentPage.drawText(lText, {
                x: MARGIN_LEFT + bulletIndent,
                y: cursorY,
                size: bodyFontSize,
                font: fontCalibriRegular,
                color: COLORS.textMain
              });
            }

            cursorY -= lineHeight;
          }

          cursorY -= 3.5; // Gap between bullet points
        }

        cursorY -= 6; // Gap between paragraphs
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
        const tableHeaderHeight = 22;

        // Anti-orphan guard: Ensure room for header + first data row
        ensureSpace(tableHeaderHeight + 28);

        // Table Header Row (Comic Sans Bold)
        currentPage.drawRectangle({
          x: MARGIN_LEFT,
          y: cursorY - tableHeaderHeight,
          width: CONTENT_WIDTH,
          height: tableHeaderHeight,
          color: COLORS.tableHeaderBg
        });

        for (let c = 0; c < numCols; c++) {
          const hText = headers[c];
          currentPage.drawText(hText, {
            x: MARGIN_LEFT + (c * colWidth) + 7,
            y: cursorY - 15,
            size: 8,
            font: fontComicBold,
            color: COLORS.white
          });
        }

        cursorY -= tableHeaderHeight;

        // Table Data Rows (Calibri Regular)
        const cellFontSize = 8;
        const cellLineHeight = 11.5;

        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const rowData = rows[rIdx];
          let maxCellLines = 1;
          const wrappedCells = [];

          for (let c = 0; c < numCols; c++) {
            const cellText = rowData[c] || '';
            const cellLines = wrapText(cellText, fontCalibriRegular, cellFontSize, colWidth - 14);
            wrappedCells.push(cellLines);
            if (cellLines.length > maxCellLines) maxCellLines = cellLines.length;
          }

          const rowHeight = Math.max(18, maxCellLines * cellLineHeight + 8);
          ensureSpace(rowHeight);

          // Alternating row background tint
          if (rIdx % 2 === 1) {
            currentPage.drawRectangle({
              x: MARGIN_LEFT,
              y: cursorY - rowHeight,
              width: CONTENT_WIDTH,
              height: rowHeight,
              color: COLORS.tableRowAlt
            });
          }

          // Row bottom separator line
          currentPage.drawLine({
            start: { x: MARGIN_LEFT, y: cursorY - rowHeight },
            end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - rowHeight },
            thickness: 0.5,
            color: COLORS.border
          });

          // Cell text
          for (let c = 0; c < numCols; c++) {
            const cLines = wrappedCells[c];
            let cellY = cursorY - 11;
            for (const cl of cLines) {
              currentPage.drawText(cl, {
                x: MARGIN_LEFT + (c * colWidth) + 7,
                y: cellY,
                size: cellFontSize,
                font: fontCalibriRegular,
                color: COLORS.textMain
              });
              cellY -= cellLineHeight;
            }
          }

          cursorY -= rowHeight;
        }

        cursorY -= 12; // Gap after table
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. CLINICAL VIGNETTE / PRACTICAL SCENARIO BOX (IF PRESENT)
  // --------------------------------------------------------------------------
  if (chapter.example) {
    const exampleText = sanitizeText(chapter.example);
    const exampleParas = exampleText.split(/\n\s*\n/);

    ensureSpace(46);
    cursorY -= 12;

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 22,
      width: CONTENT_WIDTH,
      height: 22,
      color: COLORS.alertBorder
    });

    currentPage.drawText('CLINICAL VIGNETTE & HIGH-YIELD PRACTICAL SCENARIO', {
      x: MARGIN_LEFT + 10,
      y: cursorY - 15.5,
      size: 9.5,
      font: fontComicBold,
      color: COLORS.white
    });

    cursorY -= 32;

    for (const para of exampleParas) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      const lines = trimmed.split('\n');

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) {
          cursorY -= 5;
          continue;
        }

        const vignetteFontSize = 9;
        const vignetteLineHeight = 13;
        const wrappedLines = wrapText(cleanLine, fontCalibriRegular, vignetteFontSize, CONTENT_WIDTH - 14);
        ensureSpace(wrappedLines.length * vignetteLineHeight + 4);

        for (const wl of wrappedLines) {
          currentPage.drawText(wl, {
            x: MARGIN_LEFT + 8,
            y: cursorY,
            size: vignetteFontSize,
            font: fontCalibriRegular,
            color: COLORS.textMain
          });
          cursorY -= vignetteLineHeight;
        }
        cursorY -= 3;
      }
      cursorY -= 6;
    }
  }

  // --------------------------------------------------------------------------
  // 5. PRIMARY REFERENCES & CITATIONS (IF PRESENT)
  // --------------------------------------------------------------------------
  if (Array.isArray(chapter.references) && chapter.references.length > 0) {
    ensureSpace(40 + (chapter.references.length * 13));
    cursorY -= 12;

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 20,
      width: CONTENT_WIDTH,
      height: 20,
      color: COLORS.primaryLight
    });

    currentPage.drawText('PRIMARY MEDICAL REFERENCES & CITATIONS', {
      x: MARGIN_LEFT + 10,
      y: cursorY - 14,
      size: 8.5,
      font: fontComicBold,
      color: COLORS.white
    });

    cursorY -= 30;

    for (let rIdx = 0; rIdx < chapter.references.length; rIdx++) {
      const refText = sanitizeText(chapter.references[rIdx]);
      const refLines = wrapText(`${rIdx + 1}.  ${refText}`, fontCalibriRegular, 8, CONTENT_WIDTH - 12);
      ensureSpace(refLines.length * 11.5 + 4);

      for (const rl of refLines) {
        currentPage.drawText(rl, {
          x: MARGIN_LEFT + 6,
          y: cursorY,
          size: 8,
          font: fontCalibriRegular,
          color: COLORS.textMuted
        });
        cursorY -= 11.5;
      }
      cursorY -= 3;
    }

    cursorY -= 10;
  }

  // --------------------------------------------------------------------------
  // 6. END-OF-PDF QR SECTION: "CONNECT WITH KNOCKOUT NOTES"
  // --------------------------------------------------------------------------
  const REQUIRED_QR_HEIGHT = 165;
  if (!currentPage || cursorY - REQUIRED_QR_HEIGHT < MARGIN_BOTTOM + 24) {
    addNewPage();
  } else {
    cursorY -= 16;
  }

  // Section Container Box
  const qrSectionY = cursorY - REQUIRED_QR_HEIGHT;
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: qrSectionY,
    width: CONTENT_WIDTH,
    height: REQUIRED_QR_HEIGHT,
    color: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 0.8
  });

  // Header Banner of QR Box (Comic Sans Bold)
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - 26,
    width: CONTENT_WIDTH,
    height: 26,
    color: COLORS.primary
  });

  const headerTitle = 'CONNECT WITH KNOCKOUT NOTES';
  const headerTitleWidth = fontComicBold.widthOfTextAtSize(headerTitle, 10.5);
  currentPage.drawText(headerTitle, {
    x: MARGIN_LEFT + (CONTENT_WIDTH - headerTitleWidth) / 2,
    y: cursorY - 18,
    size: 10.5,
    font: fontComicBold,
    color: COLORS.white
  });

  // Subtitle under header (Calibri Regular)
  const subtitle = 'Scan to visit our revision portal, follow Instagram updates, or support our open clinical resources.';
  const subWidth = fontCalibriRegular.widthOfTextAtSize(subtitle, 8);
  currentPage.drawText(subtitle, {
    x: MARGIN_LEFT + (CONTENT_WIDTH - subWidth) / 2,
    y: cursorY - 40,
    size: 8,
    font: fontCalibriRegular,
    color: COLORS.textMuted
  });

  // Three QR Cards Configuration
  const qrItems = [
    {
      label: 'WEBSITE',
      caption: 'Knockout Notes',
      url: siteUrl
    },
    {
      label: 'INSTAGRAM',
      caption: '@knock.out.notes',
      url: instagramUrl
    },
    {
      label: 'SUPPORT US',
      caption: 'Buy Me a Coffee',
      url: supportUrl
    }
  ];

  const cardWidth = 146;
  const cardGap = (CONTENT_WIDTH - (cardWidth * 3)) / 2;
  const qrSize = 68; // 68x68 pt vector QR
  const qrTopY = cursorY - 50;

  for (let i = 0; i < qrItems.length; i++) {
    const item = qrItems[i];
    const cardX = MARGIN_LEFT + i * (cardWidth + cardGap);
    const cardY = qrSectionY + 10;
    const cardH = REQUIRED_QR_HEIGHT - 54;

    // Card white background
    currentPage.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardH,
      color: COLORS.white,
      borderColor: COLORS.border,
      borderWidth: 0.6
    });

    // Center QR code horizontally in card
    const qrX = cardX + (cardWidth - qrSize) / 2;
    const qrY = cardY + 36;
    drawQrCode(currentPage, item.url, qrX, qrY, qrSize, {
      marginModules: 2,
      borderColor: COLORS.border,
      darkColor: COLORS.primary
    });

    // Label: Comic Sans Bold (size 8.5)
    const labelWidth = fontComicBold.widthOfTextAtSize(item.label, 8.5);
    currentPage.drawText(item.label, {
      x: cardX + (cardWidth - labelWidth) / 2,
      y: cardY + 22,
      size: 8.5,
      font: fontComicBold,
      color: COLORS.accent
    });

    // Caption: Calibri Regular (size 8)
    const capWidth = fontCalibriRegular.widthOfTextAtSize(item.caption, 8);
    currentPage.drawText(item.caption, {
      x: cardX + (cardWidth - capWidth) / 2,
      y: cardY + 10,
      size: 8,
      font: fontCalibriRegular,
      color: COLORS.textMain
    });
  }

  // --------------------------------------------------------------------------
  // 7. FOOTERS & HEADERS PASS ACROSS ALL PAGES
  // --------------------------------------------------------------------------
  const totalPages = pagesList.length;

  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const page = pagesList[pIdx];
    const isFirstPage = pIdx === 0;

    // Running Header
    drawRunningHeader(page, chapter.name, isFirstPage);

    // Running Footer
    page.drawLine({
      start: { x: MARGIN_LEFT, y: MARGIN_BOTTOM + 16 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: MARGIN_BOTTOM + 16 },
      thickness: 0.6,
      color: COLORS.border
    });

    const footerBrand = 'Knockout Notes  |  @knock.out.notes';
    page.drawText(footerBrand, {
      x: MARGIN_LEFT,
      y: MARGIN_BOTTOM + 4,
      size: 8,
      font: fontComicBold,
      color: COLORS.primary
    });

    const footerNotice = 'Verified Revision Monograph  •  Educational Clinical Practice Only';
    const noticeWidth = fontCalibriRegular.widthOfTextAtSize(footerNotice, 7.5);
    page.drawText(footerNotice, {
      x: MARGIN_LEFT + (CONTENT_WIDTH - noticeWidth) / 2,
      y: MARGIN_BOTTOM + 4,
      size: 7.5,
      font: fontCalibriRegular,
      color: COLORS.textMuted
    });

    const pageStr = `Page ${pIdx + 1} of ${totalPages}`;
    const pageStrWidth = fontComicBold.widthOfTextAtSize(pageStr, 8);
    page.drawText(pageStr, {
      x: MARGIN_LEFT + CONTENT_WIDTH - pageStrWidth,
      y: MARGIN_BOTTOM + 4,
      size: 8,
      font: fontComicBold,
      color: COLORS.primary
    });
  }

  return await pdfDoc.save();
}
