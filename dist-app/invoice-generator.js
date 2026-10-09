/**
 * KnockoutNotes — Downloadable Payment Receipt & Invoice PDF Generator (invoice-generator.js)
 * Generates branded, verifiable, educational payment receipts and enrolment records
 * for user chapter purchases, sample previews, and subscriptions using client-side jsPDF.
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
   * Generate and trigger download of branded PDF receipt
   * @param {Object} inv - Receipt / Invoice record details
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

    const isSample = Boolean(inv.is_sample || inv.isSample || (inv.payment_status && inv.payment_status.includes("SAMPLE")));
    const invNum = inv.invoice_number || (isSample ? "KN-SAMPLE-2026-000123" : `INV-KN-${new Date().getFullYear()}-${String(inv.id || 1).padStart(5, '0')}`);
    
    const fmtDate = (dStr) => {
      if (!dStr) return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      try {
        return new Date(dStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (_) { return String(dStr); }
    };

    const fmtDateTime = (dStr) => {
      if (!dStr) return new Date().toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      try {
        return new Date(dStr).toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (_) { return String(dStr); }
    };

    const issueDate = fmtDate(inv.issue_date || inv.invoice_date || inv.created_at);
    const paymentDate = fmtDateTime(inv.payment_date || inv.verified_at || inv.invoice_date || inv.created_at);

    const studentName = inv.user_name || (inv.user_email ? inv.user_email.split('@')[0] : (isSample ? "Sample Learner" : "Verified Student"));
    const studentEmail = inv.user_email || (isSample ? "learner@sample.knockoutnotes.com" : "student@knockoutnotes.com");
    const amount = Number(inv.amount_inr || inv.amount || (isSample ? 499.00 : 0)).toFixed(2);
    const itemTitle = inv.item_title || inv.chapter_title || (isSample ? "Critical Care — Mechanical Ventilation" : "Anaesthesia & Critical Care Study Monograph");
    const orderId = inv.order_id || (isSample ? "KN_ORD_SMPL_VENT_2026" : "N/A");
    const paymentId = inv.cf_payment_id || inv.payment_id || (isSample ? "TEST_TXN_8F31A2" : "CF-DIRECT-LIVE");
    const paymentMethod = (inv.payment_method || (isSample ? "UPI / Net Banking / Card" : "UPI / Card")).toUpperCase();
    const siteUrl = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : "https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev";

    // 1. Top Header Banner (Deep Navy #0b1329)
    doc.setFillColor(11, 19, 41);
    doc.rect(0, 0, pageWidth, 92, "F");

    // Header Accent Strip (Cyan Neon #00e5ff)
    doc.setFillColor(0, 229, 255);
    doc.rect(0, 89, pageWidth, 3, "F");

    // Title / Brand
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("KnockoutNotes", margin, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("MEDICAL EDUCATION & ANAESTHESIA ACADEMY", margin, 60);
    doc.setTextColor(0, 229, 255);
    doc.text(siteUrl, margin, 74);

    // Right-aligned Title & Metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(isSample ? 13 : 15);
    doc.setTextColor(0, 229, 255);
    doc.text(isSample ? "SAMPLE PAYMENT RECEIPT" : "PAYMENT RECEIPT", pageWidth - margin, 38, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(241, 245, 249);
    doc.text(`Receipt No: ${invNum}`, pageWidth - margin, 53, { align: "right" });
    doc.setTextColor(148, 163, 184);
    doc.text(`Issued: ${issueDate}`, pageWidth - margin, 66, { align: "right" });
    doc.text(`Paid: ${paymentDate}`, pageWidth - margin, 79, { align: "right" });

    // Watermark if Sample
    if (isSample) {
      doc.saveGraphicsState && doc.saveGraphicsState();
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(38);
      doc.text("SAMPLE — NOT A VALID RECEIPT", pageWidth / 2, 420, {
        align: "center",
        angle: 35
      });
      doc.restoreGraphicsState && doc.restoreGraphicsState();
    }

    // 2. Summary Information Boxes (Billed To vs Transaction Info)
    const boxY = 110;
    const boxH = 96;
    const halfW = (contentWidth - 16) / 2;

    // Box 1: Billed To
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, boxY, halfW, boxH, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("BILLED TO / STUDENT DETAILS", margin + 12, boxY + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(studentName, margin + 12, boxY + 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Email: ${studentEmail}`, margin + 12, boxY + 52);
    doc.text("Course: Anaesthesia & Critical Care Residency", margin + 12, boxY + 67);
    doc.text("Country of Supply: India", margin + 12, boxY + 82);

    // Box 2: Payment & Order Information
    const box2X = margin + halfW + 16;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(box2X, boxY, halfW, boxH, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("TRANSACTION & GATEWAY DETAILS", box2X + 12, boxY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Order ID:`, box2X + 12, boxY + 35);
    doc.setFont("helvetica", "bold");
    doc.text(orderId, box2X + 70, boxY + 35);

    doc.setFont("helvetica", "normal");
    doc.text(`Txn Ref:`, box2X + 12, boxY + 50);
    doc.text(paymentId, box2X + 70, boxY + 50);

    doc.text(`Method:`, box2X + 12, boxY + 65);
    doc.text(paymentMethod, box2X + 70, boxY + 65);

    doc.text(`Status:`, box2X + 12, boxY + 81);
    doc.setFont("helvetica", "bold");
    if (isSample) {
      doc.setTextColor(180, 83, 9); // Amber
      doc.text("SAMPLE — NOT A REAL PAYMENT", box2X + 70, boxY + 81);
    } else {
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text("PAID // SYSTEM VERIFIED", box2X + 70, boxY + 81);
    }

    // 3. Line Items Table
    const tableY = boxY + boxH + 24;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, tableY, contentWidth, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text("#", margin + 10, tableY + 16);
    doc.text("DESCRIPTION & EDUCATIONAL MODULE", margin + 35, tableY + 16);
    doc.text("QTY", margin + contentWidth - 140, tableY + 16, { align: "center" });
    doc.text("TAX RATE", margin + contentWidth - 75, tableY + 16, { align: "right" });
    doc.text("AMOUNT (INR)", margin + contentWidth - 10, tableY + 16, { align: "right" });

    // Item Row 1 with text wrapping
    const rowY = tableY + 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("1", margin + 10, rowY);

    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(itemTitle, contentWidth - 210);
    doc.text(titleLines, margin + 35, rowY);

    const descY = rowY + (titleLines.length * 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Interactive Clinical Monograph, Pressure/Flow Waveforms & Lifetime Study Notes Access", margin + 35, descY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("1", margin + contentWidth - 140, rowY, { align: "center" });
    doc.text("0% (Exempt)", margin + contentWidth - 75, rowY, { align: "right" });
    doc.text(`Rs. ${amount}`, margin + contentWidth - 10, rowY, { align: "right" });

    // Divider Line
    const dividerY = Math.max(descY + 18, rowY + 32);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, dividerY, margin + contentWidth, dividerY);

    // 4. Totals Calculation Box
    const totalY = dividerY + 28;
    const totalsLeft = margin + contentWidth - 220;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Subtotal:", totalsLeft, totalY);
    doc.text(`Rs. ${amount}`, margin + contentWidth - 10, totalY, { align: "right" });

    doc.text("Tax (Educational Exemption):", totalsLeft, totalY + 16);
    doc.text("Rs. 0.00", margin + contentWidth - 10, totalY + 16, { align: "right" });

    doc.setFillColor(240, 253, 250); // Light emerald
    doc.setDrawColor(204, 251, 241);
    doc.roundedRect(totalsLeft - 10, totalY + 26, 230, 32, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Total Paid:", totalsLeft, totalY + 47);
    doc.setTextColor(13, 148, 136); // Teal 600
    doc.text(`Rs. ${amount}`, margin + contentWidth - 10, totalY + 47, { align: "right" });

    // 5. Notes & Terms Box
    const notesY = totalY + 84;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, notesY, contentWidth, 75, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text("TERMS OF SUPPLY & EDUCATIONAL ACCESS", margin + 12, notesY + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("• This receipt certifies the electronic enrolment and educational monograph unlock for medical residency study.", margin + 12, notesY + 29);
    doc.text("• Educational supplies under digital delivery. Access is perpetual and bound to your verified registered email address.", margin + 12, notesY + 41);
    doc.text("• For academic support, inquiries, or institutional access: knockoutnotes.anaesthesia@gmail.com", margin + 12, notesY + 53);
    if (isSample) {
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "bold");
      doc.text("• NOTICE: This is a fictional sample receipt for preview purposes only. No actual payment has been collected.", margin + 12, notesY + 66);
    }

    // 6. Footer & Digital Notice
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
    doc.text("Verified Learning System // Secure Electronic Delivery", margin, footerY + 28);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Computer-generated receipt. No physical signature required.", pageWidth - margin, footerY + 16, { align: "right" });

    // Trigger download
    const cleanFileName = `${isSample ? 'Sample_' : ''}Receipt_${invNum}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    doc.save(cleanFileName);
    return { success: true, fileName: cleanFileName };
  }

  window.KN_INVOICES = {
    generatePdf: generateInvoicePdf,
    downloadInvoice: generateInvoicePdf
  };
})();
