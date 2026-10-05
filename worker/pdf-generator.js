/**
 * KnockoutNotes Branded Chapter PDF Generator
 * Built with pdf-lib for native Cloudflare Workers isolate execution.
 * Creates publication-quality, A4 medical revision monographs from canonical Study Notes data.
 * Uses authentic Comic Sans MS typography and embedded vector QR connectivity codes.
 */

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import qrcode from 'qrcode-generator';
import { getComicSansRegularBytes, getComicSansBoldBytes } from './fonts/comic-fonts.js';

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
const MARGIN_LEFT = 40;
const MARGIN_RIGHT = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 515.28 pt
const MARGIN_TOP = 46;
const MARGIN_BOTTOM = 44;

// Default Brand URLs for End-of-PDF QR Codes
const DEFAULT_QR_URLS = {
  website: 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/',
  instagram: 'https://www.instagram.com/knock.out.notes/',
  support: 'https://bondin.io/@knockoutnotes/support'
};

/**
 * Sanitize text to ensure clean medical typography and prevent glyph encoding errors
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
 * Generate a complete, branded A4 PDF document for a study chapter using Comic Sans MS
 */
export async function generateChapterPdf(chapter, options = {}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Embed Authentic Comic Sans MS Fonts
  const fontRegular = await pdfDoc.embedFont(getComicSansRegularBytes());
  const fontBold = await pdfDoc.embedFont(getComicSansBoldBytes());

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
    }
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
        font: fontBold,
        color: COLORS.white
      });

      page.drawText('Medical Revision Monograph  |  Anaesthesia & Critical Care', {
        x: MARGIN_LEFT + 120,
        y: PAGE_HEIGHT - 29,
        size: 8,
        font: fontRegular,
        color: rgb(0.85, 0.92, 0.98)
      });

      const urlText = 'knockoutnotes-anaesthesia.workers.dev';
      const urlWidth = fontRegular.widthOfTextAtSize(urlText, 7.5);
      page.drawText(urlText, {
        x: MARGIN_LEFT + CONTENT_WIDTH - urlWidth - 10,
        y: PAGE_HEIGHT - 29,
        size: 7.5,
        font: fontRegular,
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
      font: fontBold,
      color: COLORS.accent
    });

    const handleText = ' |  @knock.out.notes';
    page.drawText(handleText, {
      x: MARGIN_LEFT + fontBold.widthOfTextAtSize('KNOCKOUT NOTES', 8),
      y: PAGE_HEIGHT - 28,
      size: 7.5,
      font: fontRegular,
      color: COLORS.textMuted
    });

    const sanitizedTitle = sanitizeText(chapterName);
    const titleSnippet = sanitizedTitle.length > 50 ? sanitizedTitle.slice(0, 48) + '...' : sanitizedTitle;
    const titleWidth = fontRegular.widthOfTextAtSize(titleSnippet, 8);

    page.drawText(titleSnippet, {
      x: MARGIN_LEFT + CONTENT_WIDTH - titleWidth,
      y: PAGE_HEIGHT - 28,
      size: 8,
      font: fontRegular,
      color: COLORS.textMuted
    });
  }

  // Start with First Page
  addNewPage();

  // --------------------------------------------------------------------------
  // 1. HERO TITLE BLOCK (PAGE 1)
  // --------------------------------------------------------------------------
  cursorY -= 16;

  // Domain kicker
  const domainText = sanitizeText((chapter.cat || 'CLINICAL STUDY NOTES').toUpperCase().replace(/_/g, ' ') + '  •  REVISION HANDOUT');
  currentPage.drawText(domainText, {
    x: MARGIN_LEFT,
    y: cursorY,
    size: 8.5,
    font: fontBold,
    color: COLORS.accent
  });
  cursorY -= 18;

  // Chapter Name
  const cleanTitle = sanitizeText(chapter.name || 'Clinical Monograph');
  const titleLines = wrapText(cleanTitle, fontBold, 17, CONTENT_WIDTH);
  for (const line of titleLines) {
    currentPage.drawText(line, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 17,
      font: fontBold,
      color: COLORS.primary
    });
    cursorY -= 22;
  }

  // Tagline or Classification
  const tagline = sanitizeText(chapter.tagline || chapter.classification || '');
  if (tagline) {
    cursorY -= 2;
    const tagLines = wrapText(tagline, fontRegular, 9.5, CONTENT_WIDTH);
    for (const tl of tagLines) {
      currentPage.drawText(tl, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9.5,
        font: fontRegular,
        color: COLORS.textMuted
      });
      cursorY -= 14;
    }
  }

  cursorY -= 6;

  // Metadata & Sourcing Card
  const sourceText = sanitizeText(chapter.source || "Miller's Anesthesia / Washington Manual of Critical Care / ASA Guidelines.");
  const sourceLines = wrapText(`Clinical Evidence Source: ${sourceText}`, fontRegular, 8, CONTENT_WIDTH - 24);
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
    width: 3.5,
    height: sourceBoxHeight,
    color: COLORS.accent
  });

  let sourceTextY = cursorY - 12;
  for (let i = 0; i < sourceLines.length; i++) {
    currentPage.drawText(sourceLines[i], {
      x: MARGIN_LEFT + 14,
      y: sourceTextY,
      size: 8,
      font: fontRegular,
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
    ensureSpace(38 + (sections.length * 13));

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - (22 + sections.length * 13),
      width: CONTENT_WIDTH,
      height: 22 + sections.length * 13,
      color: COLORS.cardBg,
      borderColor: COLORS.border,
      borderWidth: 0.6
    });

    currentPage.drawText('CHAPTER CONTENTS & HIGH-YIELD TOPIC OUTLINE', {
      x: MARGIN_LEFT + 12,
      y: cursorY - 14,
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

    cursorY -= (34 + sections.length * 13);
  }

  // --------------------------------------------------------------------------
  // 3. CHAPTER SECTIONS RENDERING
  // --------------------------------------------------------------------------
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const sec = sections[sIdx];
    const secTitle = sanitizeText(sec.h || `Section ${sIdx + 1}`);

    // Section Header Pill
    ensureSpace(42);
    cursorY -= 6;

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
      size: 9.5,
      font: fontBold,
      color: COLORS.white
    });

    cursorY -= 28;

    // Section Body Prose / Bullets
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
          ensureSpace(wrappedLines.length * 12.5 + 4);

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

            // Bold prefix detection e.g. "Label:"
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
        cursorY -= 6;
        const colWidth = CONTENT_WIDTH / numCols;

        ensureSpace(32);

        // Header Row
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

        // Data Rows
        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const rowData = rows[rIdx];
          let maxCellLines = 1;
          const wrappedCells = [];

          for (let c = 0; c < numCols; c++) {
            const cellText = rowData[c] || '';
            const cellLines = wrapText(cellText, fontRegular, 7.5, colWidth - 10);
            wrappedCells.push(cellLines);
            if (cellLines.length > maxCellLines) maxCellLines = cellLines.length;
          }

          const rowHeight = Math.max(16, maxCellLines * 10 + 6);
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

          // Cell text
          for (let c = 0; c < numCols; c++) {
            const cLines = wrappedCells[c];
            let cellY = cursorY - 10;
            for (const cl of cLines) {
              currentPage.drawText(cl, {
                x: MARGIN_LEFT + (c * colWidth) + 6,
                y: cellY,
                size: 7.5,
                font: fontRegular,
                color: COLORS.textMain
              });
              cellY -= 10;
            }
          }

          cursorY -= rowHeight;
        }

        cursorY -= 10;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. CLINICAL VIGNETTE / PRACTICAL SCENARIO BOX (IF PRESENT)
  // --------------------------------------------------------------------------
  if (chapter.example) {
    const exampleText = sanitizeText(chapter.example);
    const exampleParas = exampleText.split(/\n\s*\n/);

    ensureSpace(40);
    cursorY -= 8;

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 20,
      width: CONTENT_WIDTH,
      height: 20,
      color: COLORS.alertBorder
    });

    currentPage.drawText('CLINICAL VIGNETTE & HIGH-YIELD PRACTICAL SCENARIO', {
      x: MARGIN_LEFT + 10,
      y: cursorY - 14,
      size: 9.5,
      font: fontBold,
      color: COLORS.white
    });

    cursorY -= 28;

    for (const para of exampleParas) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      const lines = trimmed.split('\n');

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) {
          cursorY -= 4;
          continue;
        }

        const wrappedLines = wrapText(cleanLine, fontRegular, 8.5, CONTENT_WIDTH - 12);
        ensureSpace(wrappedLines.length * 11.5 + 4);

        for (const wl of wrappedLines) {
          currentPage.drawText(wl, {
            x: MARGIN_LEFT + 6,
            y: cursorY,
            size: 8.5,
            font: fontRegular,
            color: COLORS.textMain
          });
          cursorY -= 11.5;
        }
        cursorY -= 2;
      }
      cursorY -= 4;
    }
  }

  // --------------------------------------------------------------------------
  // 5. PRIMARY REFERENCES & CITATIONS (IF PRESENT)
  // --------------------------------------------------------------------------
  if (Array.isArray(chapter.references) && chapter.references.length > 0) {
    ensureSpace(35 + (chapter.references.length * 12));
    cursorY -= 8;

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 18,
      width: CONTENT_WIDTH,
      height: 18,
      color: COLORS.primaryLight
    });

    currentPage.drawText('PRIMARY MEDICAL REFERENCES & CITATIONS', {
      x: MARGIN_LEFT + 10,
      y: cursorY - 13,
      size: 8.5,
      font: fontBold,
      color: COLORS.white
    });

    cursorY -= 26;

    for (let rIdx = 0; rIdx < chapter.references.length; rIdx++) {
      const refText = sanitizeText(chapter.references[rIdx]);
      const refLines = wrapText(`${rIdx + 1}.  ${refText}`, fontRegular, 8, CONTENT_WIDTH - 10);
      ensureSpace(refLines.length * 11 + 2);

      for (const rl of refLines) {
        currentPage.drawText(rl, {
          x: MARGIN_LEFT + 6,
          y: cursorY,
          size: 8,
          font: fontRegular,
          color: COLORS.textMuted
        });
        cursorY -= 11;
      }
      cursorY -= 2;
    }

    cursorY -= 6;
  }

  // --------------------------------------------------------------------------
  // 6. END-OF-PDF QR SECTION: "CONNECT WITH KNOCKOUT NOTES"
  // --------------------------------------------------------------------------
  const REQUIRED_QR_HEIGHT = 160;
  if (!currentPage || cursorY - REQUIRED_QR_HEIGHT < MARGIN_BOTTOM + 24) {
    addNewPage();
  } else {
    cursorY -= 12;
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

  // Header Banner of QR Box
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - 26,
    width: CONTENT_WIDTH,
    height: 26,
    color: COLORS.primary
  });

  const headerTitle = 'CONNECT WITH KNOCKOUT NOTES';
  const headerTitleWidth = fontBold.widthOfTextAtSize(headerTitle, 10.5);
  currentPage.drawText(headerTitle, {
    x: MARGIN_LEFT + (CONTENT_WIDTH - headerTitleWidth) / 2,
    y: cursorY - 18,
    size: 10.5,
    font: fontBold,
    color: COLORS.white
  });

  // Subtitle under header
  const subtitle = 'Scan to visit our revision portal, follow Instagram updates, or support our open clinical resources.';
  const subWidth = fontRegular.widthOfTextAtSize(subtitle, 7.8);
  currentPage.drawText(subtitle, {
    x: MARGIN_LEFT + (CONTENT_WIDTH - subWidth) / 2,
    y: cursorY - 40,
    size: 7.8,
    font: fontRegular,
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

  const cardWidth = 148;
  const cardGap = (CONTENT_WIDTH - (cardWidth * 3)) / 2; // ~35.64 pt
  const qrSize = 68; // 68x68 pt crisp vector QR
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

    // Label (WEBSITE / INSTAGRAM / SUPPORT US)
    const labelWidth = fontBold.widthOfTextAtSize(item.label, 8.5);
    currentPage.drawText(item.label, {
      x: cardX + (cardWidth - labelWidth) / 2,
      y: cardY + 22,
      size: 8.5,
      font: fontBold,
      color: COLORS.accent
    });

    // Caption (Knockout Notes / @knock.out.notes / Buy Me a Coffee)
    const capWidth = fontRegular.widthOfTextAtSize(item.caption, 8);
    currentPage.drawText(item.caption, {
      x: cardX + (cardWidth - capWidth) / 2,
      y: cardY + 10,
      size: 8,
      font: fontRegular,
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
      font: fontBold,
      color: COLORS.primary
    });

    const footerNotice = 'Verified Revision Monograph  •  Educational Clinical Practice Only';
    const noticeWidth = fontRegular.widthOfTextAtSize(footerNotice, 7);
    page.drawText(footerNotice, {
      x: MARGIN_LEFT + (CONTENT_WIDTH - noticeWidth) / 2,
      y: MARGIN_BOTTOM + 4,
      size: 7,
      font: fontRegular,
      color: COLORS.textMuted
    });

    const pageStr = `Page ${pIdx + 1} of ${totalPages}`;
    const pageStrWidth = fontBold.widthOfTextAtSize(pageStr, 8);
    page.drawText(pageStr, {
      x: MARGIN_LEFT + CONTENT_WIDTH - pageStrWidth,
      y: MARGIN_BOTTOM + 4,
      size: 8,
      font: fontBold,
      color: COLORS.primary
    });
  }

  return await pdfDoc.save();
}
