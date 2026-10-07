const fs = require('fs');
const path = require('path');

const b1 = require('./cases-batch1.js');
const b2 = require('./cases-batch2.js');
const b3 = require('./cases-batch3.js');
const b4 = require('./cases-batch4.js');
const b5 = require('./cases-batch5.js');
const b6 = require('./cases-batch6.js');

const allCases = [...b1, ...b2, ...b3, ...b4, ...b5, ...b6];
console.log(`[Compile] Loaded ${allCases.length} cases from batches 1 to 6.`);

if (allCases.length !== 39) {
  console.error(`[Compile] Expected 39 cases, got ${allCases.length}! Aborting.`);
  process.exit(1);
}

const studyDataPath = path.resolve(__dirname, '..', 'study-data.js');
const txt = fs.readFileSync(studyDataPath, 'utf8');

const startMarker = '{\n  "id": "case-mitral-stenosis-phtn",';
let startIndex = txt.indexOf(startMarker);
if (startIndex === -1) {
  const altMarker = '{\n    "id": "case-mitral-stenosis-phtn",';
  startIndex = txt.indexOf(altMarker);
}

if (startIndex === -1) {
  console.error('[Compile] Could not find startMarker in study-data.js!');
  process.exit(1);
}

const endMarker = 'const drugs = [';
const endIndex = txt.indexOf(endMarker);
if (endIndex === -1) {
  console.error('[Compile] Could not find endMarker in study-data.js!');
  process.exit(1);
}

// Format cases as JSON objects indented properly
const formattedCases = allCases.map(c => {
  const jsonStr = JSON.stringify(c, null, 2);
  // indent each line with 2 spaces
  return jsonStr.split('\n').map(line => '  ' + line).join('\n');
}).join(',\n');

const newContent = txt.substring(0, startIndex) + formattedCases + '\n];\n\n  ' + txt.substring(endIndex);

fs.writeFileSync(studyDataPath, newContent, 'utf8');
console.log(`[Compile] Successfully compiled ${allCases.length} cases into study-data.js!`);
