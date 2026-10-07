const fs = require('fs');
const path = require('path');

const peds = require('./data-paediatrics.js');
const c1 = require('./data-cases.js');
const c2 = require('./data-cases-part2.js');

const allNewTopics = [...peds, ...c1, ...c2];

const newCategories = [
  {
    id: "case_cardiac",
    label: "Cardiovascular & Thoracic Cases",
    icon: "❤️",
    desc: "Valvular heart disease, ischemic disease, CABG, hypertension, congenital shunts, pacemakers & vascular cases"
  },
  {
    id: "case_resp",
    label: "Respiratory & Thoracic Cases",
    icon: "🫁",
    desc: "Pneumonectomy, one-lung ventilation, bronchiectasis, lung abscess, COPD & intercostal drain management"
  },
  {
    id: "case_neuro",
    label: "Neuroanaesthesia & Spine Cases",
    icon: "🧠",
    desc: "Supratentorial brain tumours, posterior cranial fossa sitting craniotomy, TBI, hydrocephalus & spinal dysraphism"
  },
  {
    id: "case_obstetric",
    label: "Obstetric Anaesthesia Cases",
    icon: "🤰",
    desc: "Severe preeclampsia, gestational anemia, emergency crash LSCS, non-obstetric surgery, AFE & massive PPH"
  },
  {
    id: "case_pediatric",
    label: "Pediatric Surgical Cases",
    icon: "👶",
    desc: "Cleft lip & palate repair, tonsillectomy emergencies & pediatric surgical scenarios"
  },
  {
    id: "case_general_subspecialty",
    label: "General, Endocrine & Renal Cases",
    icon: "🏥",
    desc: "Portal hypertension & cirrhosis, lap/robotic cholecystectomy, retrosternal goiter, diabetes & renal transplant"
  },
  {
    id: "case_trauma_ortho_special",
    label: "Trauma, Ortho, Geriatric & Airway Cases",
    icon: "🩹",
    desc: "Anticipated difficult airway, major burns resuscitation, geriatric frailty, BCIS hip fracture, cataract & kyphoscoliosis"
  }
];

const studyDataPath = path.resolve(__dirname, '../study-data.js');
let content = fs.readFileSync(studyDataPath, 'utf8');

// 1. Inject categories if missing
for (const cat of newCategories) {
  if (!content.includes(`"id": "${cat.id}"`)) {
    const catStr = `  {\n    "id": "${cat.id}",\n    "label": "${cat.label}",\n    "icon": "${cat.icon}",\n    "desc": "${cat.desc}"\n  },\n`;
    content = content.replace('const categories = [\n', `const categories = [\n${catStr}`);
    console.log(`Injected category: ${cat.id}`);
  }
}

// 2. Inject topics before closing of topics array
// Find existing topics IDs in file
const existingIds = new Set();
const idRegex = /"id":\s*"([^"]+)"/g;
let match;
while ((match = idRegex.exec(content)) !== null) {
  existingIds.add(match[1]);
}

const topicsToAdd = allNewTopics.filter(t => !existingIds.has(t.id));
console.log(`Found ${topicsToAdd.length} topics to add out of ${allNewTopics.length}`);

if (topicsToAdd.length > 0) {
  // Format topics nicely
  const topicsJson = topicsToAdd.map(t => JSON.stringify(t, null, 2)).join(',\n');
  
  // Find where `const drugs = [` starts, which immediately follows topics closing `];`
  const drugsMarker = '\n  const drugs = [';
  const lastBracketIndex = content.lastIndexOf('];', content.indexOf(drugsMarker));
  
  if (lastBracketIndex === -1) {
    throw new Error("Could not locate end of topics array before const drugs = [");
  }

  // Insert before lastBracketIndex
  const before = content.slice(0, lastBracketIndex);
  const after = content.slice(lastBracketIndex);
  
  content = before.trimEnd() + ',\n' + topicsJson + '\n' + after;
  console.log(`Successfully merged ${topicsToAdd.length} topics into study-data.js`);
}

// Write back
fs.writeFileSync(studyDataPath, content, 'utf8');
console.log("Updated study-data.js successfully.");
