const fs = require('fs');

global.window = {};
require('../study-data.js');
const drugs = global.window.KN_STUDY.drugs;

let output = `# CLINICAL DRUG DOSAGE AUDIT REPORT\n`;
output += `Generated for: KnockoutNotes Study Mode (51 Monographed Drugs)\n`;
output += `Reference Sources: FDA Approved Prescribing Information, UpToDate (2025/2026), Miller's Anesthesia (10th ed.), Stoelting's Pharmacology & Physiology (5th ed.).\n\n`;

drugs.forEach((d, idx) => {
  output += `## ${idx + 1}. ${d.name} (${d.brand || 'Generic'}) — [Category: ${d.cat.toUpperCase()}]\n`;
  output += `- **Classification**: ${d.classification || 'None specified'}\n`;
  output += `- **Tagline**: ${d.tagline}\n`;
  output += `- **Source Citation**: ${d.source}\n`;
  output += `- **Stated Dosage**: ${d.dosage}\n`;
  if (d.offLabel) output += `- **Stated Off-Label**: ${d.offLabel}\n`;
  if (d.complications) output += `- **Key Warnings / Limits**: ${d.complications}\n`;
  output += `\n---\n\n`;
});

fs.writeFileSync('scripts/drug_doses_raw_audit.md', output, 'utf8');
console.log(`Audited ${drugs.length} drugs. Saved to scripts/drug_doses_raw_audit.md`);
