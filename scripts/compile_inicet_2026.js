const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Load questions from INI_CET_SS_2026_Critical_Care_PYQs.json
const inicetFile = JSON.parse(fs.readFileSync(path.join(ROOT, 'INI_CET_SS_2026_Critical_Care_PYQs.json'), 'utf8'));
const allQuestions = inicetFile.questions;
console.log('Loaded', allQuestions.length, 'questions from INI_CET_SS_2026_Critical_Care_PYQs.json.');

// 1. Copy standalone file to dist-app
const distIniPath = path.join(ROOT, 'dist-app', 'INI_CET_SS_2026_Critical_Care_PYQs.json');
fs.writeFileSync(distIniPath, JSON.stringify(inicetFile, null, 2), 'utf8');
console.log('✓ Copied INI_CET_SS_2026_Critical_Care_PYQs.json to dist-app/');

// 2. Load existing master criticalCare/mcqs.json
const masterPath = path.join(ROOT, 'criticalCare', 'mcqs.json');
const masterMcqs = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
console.log('Original master mcqs count:', masterMcqs.length);

// Filter out any existing INICET-SS-2026 questions in case of re-run
const cleanMaster = masterMcqs.filter(m => !m.id || !m.id.startsWith('INICET-SS-2026'));
const updatedMaster = [...cleanMaster, ...allQuestions];

// Sort master MCQs: first by chapterId, then by id
updatedMaster.sort((a, b) => {
  if (a.chapterId !== b.chapterId) return (a.chapterId || 0) - (b.chapterId || 0);
  return String(a.id).localeCompare(String(b.id));
});
console.log('Updated master mcqs count:', updatedMaster.length);

// Write root master
fs.writeFileSync(masterPath, JSON.stringify(updatedMaster, null, 2), 'utf8');
console.log('✓ Saved criticalCare/mcqs.json successfully.');

// Write dist-app master
const distMasterPath = path.join(ROOT, 'dist-app', 'criticalCare', 'mcqs.json');
fs.writeFileSync(distMasterPath, JSON.stringify(updatedMaster, null, 2), 'utf8');
console.log('✓ Saved dist-app/criticalCare/mcqs.json successfully.');

// 3. Regenerate chunk files in both root and dist-app
const chunkDefs = [
  { file: 'mcqs_ch01_to_ch08.json', min: 1, max: 8 },
  { file: 'mcqs_ch09_to_ch16.json', min: 9, max: 16 },
  { file: 'mcqs_ch17_to_ch24.json', min: 17, max: 24 },
  { file: 'mcqs_ch25_to_ch31.json', min: 25, max: 31 }
];

for (const def of chunkDefs) {
  const chunkData = updatedMaster.filter(m => m.chapterId >= def.min && m.chapterId <= def.max);
  
  // Root chunk
  const rootChunkPath = path.join(ROOT, 'criticalCare', 'chunks', def.file);
  fs.mkdirSync(path.dirname(rootChunkPath), { recursive: true });
  fs.writeFileSync(rootChunkPath, JSON.stringify(chunkData, null, 2), 'utf8');
  
  // Dist-app chunk
  const distChunkPath = path.join(ROOT, 'dist-app', 'criticalCare', 'chunks', def.file);
  fs.mkdirSync(path.dirname(distChunkPath), { recursive: true });
  fs.writeFileSync(distChunkPath, JSON.stringify(chunkData, null, 2), 'utf8');
  
  console.log(`✓ Generated chunk ${def.file}: ${chunkData.length} MCQs (Ch ${def.min}-${def.max})`);
}

console.log('\n=========================================');
console.log('INI-CET SS 2026 QUESTION REPOSITORY FULLY SYNCHRONIZED');
console.log('=========================================');
