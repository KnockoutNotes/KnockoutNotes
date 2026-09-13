/**
 * KnockoutNotes — Paediatric Drug Chart PDF Generator
 * Client-side PDF export utilizing local jsPDF and AutoTable.
 * Strictly zero server upload, zero persistence, 100% offline.
 */

(function () {
  "use strict";

  function generatePaedsPdf(chartData, patientMeta = {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("PDF library is still initializing. Please wait a moment and try again.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36; // 0.5 in

    // Timestamp
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    // 1. Header & Branding
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, pageWidth, 68, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(248, 250, 252);
    doc.text("KnockoutNotes", margin, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248); // #38bdf8
    doc.text("PAEDIATRIC EMERGENCY & RESUSCITATION DRUG CHART", margin, 48);

    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - margin, 48, { align: "right" });

    // 2. Patient & Airway Summary Box
    const boxY = 78;
    const boxHeight = 90;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, boxY, pageWidth - (margin * 2), boxHeight, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const wtText = `Weight: ${patientMeta.weight ? patientMeta.weight + " kg" : "Unspecified"}`;
    const ageText = `Age: ${patientMeta.age !== undefined && patientMeta.age !== "" ? patientMeta.age + " yrs" : "Unspecified"}`;
    const bracketText = `Class: ${patientMeta.categoryBracket || "Paediatric"}`;
    const caseText = `Ref ID: ${patientMeta.caseId || "N/A"}`;

    doc.text(wtText, margin + 12, boxY + 15);
    doc.text(ageText, margin + 130, boxY + 15);
    doc.text(bracketText, margin + 240, boxY + 15);
    doc.text(caseText, pageWidth - margin - 12, boxY + 15, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 116, 144);
    doc.text("AIRWAY & RESUSCITATION EQUIPMENT SIZING (CALCULATED):", margin + 12, boxY + 31);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);
    const airwayLine1 = `ETT Uncuffed: ${patientMeta.ettUncuffed || "—"}  |  ETT Cuffed: ${patientMeta.ettCuffed || "—"}  |  Depth at Lips: ${patientMeta.etDepth || "—"}  |  i-gel: ${patientMeta.igel || "—"}`;
    const airwayLine2 = `Laryngoscope Blade: ${patientMeta.bladeSize || "—"}  |  Suction: ${patientMeta.suctionFr || "—"}  |  Oral Airway: ${patientMeta.oralAirway || "—"}  |  Mask: ${patientMeta.maskSize || "—"}`;
    const growthLine = `WHO Growth Standards: Wt-for-Age: ${patientMeta.wfa || "—"}  |  Height-for-Age: ${patientMeta.wfh || "—"}  |  BMI: ${patientMeta.bmi || "—"}`;
    doc.text(airwayLine1, margin + 12, boxY + 45);
    doc.text(airwayLine2, margin + 12, boxY + 58);
    doc.setTextColor(100, 116, 139);
    doc.text(growthLine, margin + 12, boxY + 72);

    // 3. Table Rows
    const tableBody = [];
    let currentCategory = "";

    chartData.forEach(item => {
      if (item.category !== currentCategory) {
        currentCategory = item.category;
        tableBody.push([
          { content: currentCategory.toUpperCase(), colSpan: 7, styles: { fillColor: [241, 245, 249], fontStyle: "bold", textColor: [15, 23, 42] } }
        ]);
      }

      const doseFormatted = item.calculatedDoseText + (item.isCapped ? " *" : "");
      tableBody.push([
        item.name,
        item.doseBasis,
        doseFormatted,
        item.route,
        item.concentrationLabel || `${item.concentration} ${item.unit}/mL`,
        item.calculatedVolumeText || "—",
        item.notes
      ]);
    });

    // 4. Render Table with AutoTable
    doc.autoTable({
      startY: boxY + boxHeight + 12,
      margin: { left: margin, right: margin, bottom: 44 },
      head: [["Drug", "Dose Basis", "Dose", "Route", "Concentration", "Volume", "Notes / Instructions"]],
      body: tableBody,
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 4,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5
      },
      columnStyles: {
        0: { cellWidth: 95, fontStyle: "bold" },
        1: { cellWidth: 80 },
        2: { cellWidth: 65, fontStyle: "bold", textColor: [2, 132, 199] },
        3: { cellWidth: 50 },
        4: { cellWidth: 70 },
        5: { cellWidth: 55, fontStyle: "bold", textColor: [22, 101, 52] },
        6: { cellWidth: "auto" }
      },
      didDrawPage: function (data) {
        // Footer on each page
        const pageNumber = doc.internal.getNumberOfPages();
        const currentPage = data.pageNumber;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);

        const disclaimer = "* Caution: Values reaching maximum adult single-dose limits are flagged. Verify against current institutional paediatric protocols.";
        doc.text(disclaimer, margin, pageHeight - 24);

        const sourceNote = "Source: imported paediatric drug-chart spreadsheet (PedsDrugChart.xlsx) • Educational calculation aid only.";
        doc.text(sourceNote, margin, pageHeight - 14);

        // Right side watermark / emblem & page numbering
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(`KnockoutNotes ✦ Page ${currentPage}`, pageWidth - margin, pageHeight - 14, { align: "right" });
      }
    });

    // Save PDF
    const filename = `KnockoutNotes_Paeds_Drug_Chart_${patientMeta.weight || "Patient"}kg.pdf`;
    doc.save(filename);
  }

  window.KnockoutPaedsPdf = {
    generate: generatePaedsPdf
  };
})();
