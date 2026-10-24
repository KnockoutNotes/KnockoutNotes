const fs = require('fs');
const path = require('path');
const vm = require('vm');

const studyDataPath = path.resolve(__dirname, '../study-data.js');
const workerTopicsPath = path.resolve(__dirname, '../worker/study-topics.js');

// 1. Load study-data.js
const code = fs.readFileSync(studyDataPath, 'utf8');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const rawTopics = fs.readFileSync(workerTopicsPath, 'utf8');
const currentWorkerTopics = JSON.parse(rawTopics.replace(/^export const STUDY_TOPICS =\s*/, '').replace(/;\s*$/, ''));
const topicIds = new Set(currentWorkerTopics.map(t => t.id));

const drugs = sandbox.window.KN_STUDY.drugs || [];
console.log(`Current worker topics: ${currentWorkerTopics.length}`);
console.log(`Drugs in study-data.js: ${drugs.length}`);

// 2. Format drugs into chapter structure
const formattedDrugs = drugs.map(d => {
  const sections = [
    {
      h: "1. Overview & Clinical Indications",
      b: (d.tagline ? d.tagline + "\n\n" : "") + (d.desc || (d.brand ? `Brand: ${d.brand}\nClass: ${d.classification || ''}` : ''))
    },
    { h: "2. Chemical Structure & Formulation", b: d.structure },
    { h: "3. Pharmacodynamics & Receptor Targets", b: d.pd },
    { h: "4. Pharmacokinetics & Elimination", b: d.pk },
    { h: "5. Dosage & Administration Guidelines", b: d.dosage },
    { h: "6. Off-Label & Perioperative Uses", b: d.offLabel },
    { h: "7. Complications & Boxed Warnings", b: d.complications }
  ].filter(s => s.b && typeof s.b === 'string' && s.b.trim().length > 0);

  return {
    id: d.id,
    cat: d.cat || "drugs",
    name: d.name,
    short: d.name,
    brand: d.brand || null,
    classification: d.classification || null,
    tagline: d.tagline || (d.classification ? d.classification : d.name),
    tags: d.tags || ["Pharmacology", "Drug Monograph"],
    source: d.source || "FDA Prescribing Information; Miller's Anesthesia, 10th ed.; Stoelting's Pharmacology & Physiology in Anesthetic Practice",
    sections,
    references: d.references || []
  };
});

// 3. Filter out any already present
const newDrugs = formattedDrugs.filter(d => !topicIds.has(d.id));
console.log(`New drugs to add: ${newDrugs.length}`);

const merged = [...currentWorkerTopics, ...newDrugs];
console.log(`Total merged chapters: ${merged.length}`);

// 4. Write back
const output = `export const STUDY_TOPICS = ${JSON.stringify(merged)};\n`;
fs.writeFileSync(workerTopicsPath, output, 'utf8');
console.log(`Successfully synced ${newDrugs.length} drugs into worker/study-topics.js!`);
