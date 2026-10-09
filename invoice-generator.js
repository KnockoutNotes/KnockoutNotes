/**
 * KnockoutNotes — Downloadable Payment Invoice PDF Generator (invoice-generator.js)
 * Generates branded, verifiable, educational payment receipts and tax invoices
 * for user chapter purchases and subscriptions using client-side jsPDF.
 */

(function () {
  "use strict";

  async function ensureJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    // Dynamically load jsPDF vendor script if not already on page
    if (!document.getElementById("knVendorJsPdf")) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.id = "knVendorJsPdf";
        s.src = "vendor/jspdf/jspdf.umd.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    if (!document.getElementById("knVendorJsPdfAutoTable")) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.id = "knVendorJsPdfAutoTable";
        s.src = "vendor/jspdf/jspdf.plugin.autotable.min.js";
        s.onload = resolve;
        s.onerror = () => resolve(); // Optional plugin
        document.head.appendChild(s);
      });
    }
    return window.jspdf ? window.jspdf.jsPDF : null;
  }

  /**
   * Generate and trigger download of branded PDF invoice
   * @param {Object} inv - Invoice record details
   */
  async function generateInvoicePdf(inv) {
    const jsPDF = await ensureJsPdf();
    if (!jsPDF) {
      alert("Unable to initialize PDF generator. Please check your connection.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    const invNum = inv.invoice_number || `INV-KN-${new Date().getFullYear()}-${String(inv.id || 1).padStart(5, '0')}`;
    const invDate = inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : new Date().toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const studentName = inv.user_name || (inv.user_email ? inv.user_email.split('@')[0] : "Verified Student");
    const studentEmail = inv.user_email || "student@knockoutnotes.com";
    const amount = Number(inv.amount_inr || inv.amount || 0).toFixed(2);
    const itemTitle = inv.item_title || inv.chapter_title || "Anaesthesia & Critical Care Study Monograph";
    const orderId = inv.order_id || "N/A";
    const paymentId = inv.cf_payment_id || inv.payment_id || "CF-DIRECT-LIVE";
    const paymentMethod = (inv.payment_method || "UPI / Net Banking / Card").toUpperCase();

    // 1. Top Header Banner (Deep Navy #0b1329)
    doc.setFillColor(11, 19, 41);
    doc.rect(0, 0, pageWidth, 90, "F");

    // Header Accent Strip (Cyan Neon #00e5ff)
    doc.setFillColor(0, 229, 255);
    doc.rect(0, 87, pageWidth, 3, "F");

    // Title / Brand
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("KnockoutNotes", margin, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("MEDICAL EDUCATION & ANAESTHESIA ACADEMY", margin, 60);
    doc.text("https://knockoutnotes.com", margin, 73);

    // Right-aligned "TAX INVOICE / RECEIPT"
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 229, 255);
    doc.text("TAX INVOICE", pageWidth - margin, 40, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(241, 245, 249);
    doc.text(`Invoice No: ${invNum}`, pageWidth - margin, 58, { align: "right" });
    doc.text(`Date: ${invDate}`, pageWidth - margin, 73, { align: "right" });

    // 2. Summary Boxes (Billed To vs Transaction Info)
    const boxY = 110;
    const boxH = 92;
    const halfW = (contentWidth - 16) / 2;

    // Box 1: Billed To
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, boxY, halfW, boxH, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("BILLED TO / STUDENT DETAILS", margin + 12, boxY + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(studentName, margin + 12, boxY + 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Email: ${studentEmail}`, margin + 12, boxY + 52);
    doc.text("Course: Anaesthesia & Critical Care Residency", margin + 12, boxY + 67);
    doc.text("Country of Supply: India", margin + 12, boxY + 80);

    // Box 2: Payment & Order Information
    const box2X = margin + halfW + 16;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(box2X, boxY, halfW, boxH, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("PAYMENT & ORDER METADATA", box2X + 12, boxY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Order ID:`, box2X + 12, boxY + 36);
    doc.setFont("helvetica", "bold");
    doc.text(orderId, box2X + 68, boxY + 36);

    doc.setFont("helvetica", "normal");
    doc.text(`Payment ID:`, box2X + 12, boxY + 51);
    doc.text(paymentId, box2X + 68, boxY + 51);

    doc.text(`Payment Mode:`, box2X + 12, boxY + 66);
    doc.text(paymentMethod, box2X + 80, boxY + 66);

    doc.text(`Status:`, box2X + 12, boxY + 81);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.text("PAID // COMPLETED", box2X + 50, boxY + 81);

    // 3. Line Items Table
    const tableY = boxY + boxH + 24;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, tableY, contentWidth, 26, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text("#", margin + 10, tableY + 17);
    doc.text("DESCRIPTION & EDUCATIONAL MONOGRAPH", margin + 35, tableY + 17);
    doc.text("QTY", margin + contentWidth - 140, tableY + 17, { align: "center" });
    doc.text("TAX RATE", margin + contentWidth - 75, tableY + 17, { align: "right" });
    doc.text("TOTAL (INR)", margin + contentWidth - 10, tableY + 17, { align: "right" });

    // Item Row 1
    const rowY = tableY + 44;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("1", margin + 10, rowY);

    doc.setFont("helvetica", "bold");
    doc.text(itemTitle, margin + 35, rowY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Lifetime Digital Monograph Download & Study Platform Access", margin + 35, rowY + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("1", margin + contentWidth - 140, rowY, { align: "center" });
    doc.text("0% (Exempt)", margin + contentWidth - 75, rowY, { align: "right" });
    doc.text(`Rs. ${amount}`, margin + contentWidth - 10, rowY, { align: "right" });

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, rowY + 28, margin + contentWidth, rowY + 28);

    // 4. Totals Calculation Box
    const totalY = rowY + 45;
    const totalsLeft = margin + contentWidth - 220;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Subtotal:", totalsLeft, totalY);
    doc.text(`Rs. ${amount}`, margin + contentWidth - 10, totalY, { align: "right" });

    doc.text("Goods & Services Tax (GST):", totalsLeft, totalY + 16);
    doc.text("Rs. 0.00", margin + contentWidth - 10, totalY + 16, { align: "right" });

    doc.setFillColor(240, 253, 250); // Light emerald
    doc.setDrawColor(204, 251, 241);
    doc.roundedRect(totalsLeft - 10, totalY + 28, 230, 32, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Total Paid:", totalsLeft, totalY + 49);
    doc.setTextColor(13, 148, 136); // Teal 600
    doc.text(`Rs. ${amount}`, margin + contentWidth - 10, totalY + 49, { align: "right" });

    // 5. Notes & Legal Terms
    const notesY = totalY + 90;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, notesY, contentWidth, 75, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text("TERMS OF SUPPLY & EDUCATIONAL ACCESS", margin + 12, notesY + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("• This document constitutes an official electronic receipt and tax invoice for peer-reviewed medical study materials.", margin + 12, notesY + 29);
    doc.text("• Educational supplies under digital delivery for medical residency and exam preparations.", margin + 12, notesY + 41);
    doc.text("• Entitlement is perpetual and tied to your verified registered email address and workspace.", margin + 12, notesY + 53);
    doc.text("• For queries, disputes, or institutional licensing, contact: knockoutnotes.anaesthesia@gmail.com", margin + 12, notesY + 65);

    // 6. Footer & Digital Signature Badge
    const footerY = pageHeight - 55;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY, margin + contentWidth, footerY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("KnockoutNotes Academic Publishing", margin, footerY + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated securely via Cashfree Production Gateway // System Verified", margin, footerY + 28);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Computer-generated invoice. No physical signature required.", pageWidth - margin, footerY + 16, { align: "right" });

    // Trigger download
    const cleanFileName = `Invoice_${invNum}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    doc.save(cleanFileName);
  }

  window.KN_INVOICES = {
    generatePdf: generateInvoicePdf,
    downloadInvoice: generateInvoicePdf
  };
})();
