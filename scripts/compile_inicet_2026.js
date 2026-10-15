const fs = require('fs');
const { questions1To20 } = require('./inicet_part1.js');
const { questions21To40 } = require('./inicet_part2.js');
const { questions41To56 } = require('./inicet_part3.js');

const allQuestions = [...questions1To20, ...questions21To40, ...questions41To56];

const fullDataset = {
  metadata: {
    exam: "INI-CET SS",
    year: "2026",
    session: "April 2026",
    specialty: "Critical Care Medicine",
    total_questions: allQuestions.length,
    source_attribution: [
      "Marrow Super Speciality INI-SS April 2026 Critical Care Recall Session (YouTube eEJF3CC5Qx8)",
      "INI-CET SS Critical Care Faculty Verification Panel"
    ],
    schema_version: "Knockout_V03_Consolidated",
    verified_date: "2026-10-15"
  },
  questions: allQuestions
};

// 1. Write standalone file
fs.writeFileSync('INI_CET_SS_2026_Critical_Care_PYQs.json', JSON.stringify(fullDataset, null, 2), 'utf8');
console.log('Saved INI_CET_SS_2026_Critical_Care_PYQs.json with', allQuestions.length, 'questions.');

// 2. Load existing master criticalCare/mcqs.json
const masterMcqs = JSON.parse(fs.readFileSync('criticalCare/mcqs.json', 'utf8'));
console.log('Original master mcqs count:', masterMcqs.length);

// Filter out any existing INICET-SS-2026 questions in case of re-run
const cleanMaster = masterMcqs.filter(m => !m.id || !m.id.startsWith('INICET-SS-2026'));
const updatedMaster = [...cleanMaster, ...allQuestions];
console.log('Updated master mcqs count:', updatedMaster.length);

fs.writeFileSync('criticalCare/mcqs.json', JSON.stringify(updatedMaster, null, 2), 'utf8');
console.log('Saved criticalCare/mcqs.json successfully.');

// 3. Update dist-app/criticalCare/mcqs.json
fs.writeFileSync('dist-app/criticalCare/mcqs.json', JSON.stringify(updatedMaster, null, 2), 'utf8');
console.log('Saved dist-app/criticalCare/mcqs.json successfully.');
