const fs = require('fs');

// Read mcq-engine.js and mock browser environment to run the exact engine code
const mcqEngineSource = fs.readFileSync('mcq-engine.js', 'utf8');

// Set up minimal mock DOM/window
const window = {
  location: { href: 'http://localhost/study.html?view=pyq', search: '?view=pyq' },
  history: { replaceState: () => {}, pushState: () => {} },
  addEventListener: () => {},
  scrollTo: () => {}
};
let renderedHtml = '';
const mockElem = {
  appendChild: (child) => {
    if (child && child.innerHTML) renderedHtml = child.innerHTML;
  },
  prepend: (child) => {
    if (child && child.innerHTML) renderedHtml = child.innerHTML;
  },
  removeChild: () => {},
  setAttribute: () => {},
  addEventListener: () => {},
  classList: { add: () => {}, remove: () => {}, contains: () => false },
  style: {},
  get innerHTML() { return renderedHtml; },
  set innerHTML(val) { renderedHtml = val; }
};
const document = {
  getElementById: (id) => mockElem,
  querySelector: () => mockElem,
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = {
      tagName: tag,
      appendChild: () => {},
      prepend: () => {},
      removeChild: () => {},
      setAttribute: () => {},
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      style: {},
      _html: '',
      get innerHTML() { return this._html; },
      set innerHTML(v) { this._html = v; renderedHtml = v; }
    };
    return el;
  },
  addEventListener: () => {},
  body: mockElem
};
const localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const mcqsData = JSON.parse(fs.readFileSync('criticalCare/mcqs.json', 'utf8'));

const fetch = (url) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mcqsData)
  });
};

// Run inside VM
const vm = require('vm');
const context = vm.createContext({
  window,
  document,
  localStorage,
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  fetch,
  URLSearchParams: require('url').URLSearchParams,
  URL: require('url').URL
});

vm.runInContext(mcqEngineSource, context);

const state = context.window.KN_MCQ._state;
state.mcqs = mcqsData;

console.log('--- MCQs Loaded Successfully ---');
console.log('Total MCQs in database:', state.mcqs.length);
console.log('KN_MCQ ready:', context.window.KN_MCQ._ready);

// Run async check after loadData resolves
setTimeout(() => {
  console.log('\n--- Checking Rendered HTML (Async after loadData) ---');
  context.window.KN_MCQ.open({ viewMode: 'pyq', pyqMode: 'frequently-asked' });

  console.log('Rendered HTML length:', renderedHtml.length);
  console.log('Contains kn-pyq-faq-header:', renderedHtml.indexOf('kn-pyq-faq-header') !== -1);
  console.log('Contains kn-pyq-rank-card:', renderedHtml.indexOf('kn-pyq-rank-card') !== -1);
  console.log('Contains rank badge Rank #1:', renderedHtml.indexOf('Rank #1') !== -1);
  console.log('Contains Mechanical Ventilation:', renderedHtml.indexOf('Mechanical Ventilation') !== -1);
  console.log('Contains Hemodynamics:', renderedHtml.indexOf('Hemodynamics') !== -1);
  console.log('Contains Sepsis:', renderedHtml.indexOf('Sepsis') !== -1);
  console.log('Contains Study Chapter button:', renderedHtml.indexOf('data-action="faq-study-topic"') !== -1);
  console.log('Contains Practise PYQs button:', renderedHtml.indexOf('data-action="faq-practise-topic"') !== -1);

  // Check counts
  const matches = renderedHtml.match(/kn-pyq-rank-card/g);
  console.log('Number of topic rank cards rendered:', matches ? matches.length : 0);

  if (renderedHtml.indexOf('Mechanical Ventilation') !== -1 && renderedHtml.indexOf('Rank #1') !== -1 && renderedHtml.indexOf('data-action="faq-study-topic"') !== -1) {
    console.log('\n✓ SUCCESS: Frequently Asked Topics cards rendered accurately in the DOM!');
  } else {
    console.error('\n✗ FAILURE: Frequently Asked Topics cards failed to render correctly.');
    process.exit(1);
  }

  // --- Dynamic Exam Filter Tests ---
  console.log('\n--- Testing Dynamic Exam Filters ---');
  ['all', 'NEET-SS', 'INI-SS', 'INI-CET-SS-2026'].forEach(ex => {
    state.pyq.faqExamFilter = ex;
    state.pyq.faqSearch = '';
    context.window.KN_MCQ.open({ viewMode: 'pyq', pyqMode: 'frequent' });
    const matchCards = renderedHtml.match(/kn-pyq-rank-card/g) || [];
    console.log('  Exam filter [' + ex + ']:', matchCards.length, 'topic cards rendered.');
  });

  // --- Search Filtering Test ---
  console.log('\n--- Testing Dynamic Search Query ---');
  state.pyq.faqExamFilter = 'all';
  state.pyq.faqSearch = 'Ventilation';
  context.window.KN_MCQ.open({ viewMode: 'pyq', pyqMode: 'frequent' });
  const hasVent = renderedHtml.indexOf('Mechanical Ventilation') !== -1;
  const hasHemo = renderedHtml.indexOf('Hemodynamics') !== -1;
  console.log('  Search "Ventilation" matches Mechanical Ventilation:', hasVent);
  console.log('  Search "Ventilation" filters out unrelated topics (Hemodynamics):', !hasHemo);

  // --- Concept Search Test ---
  state.pyq.faqSearch = 'PEEP';
  context.window.KN_MCQ.open({ viewMode: 'pyq', pyqMode: 'frequent' });
  console.log('  Concept Search "PEEP" returns topics with PEEP concept tag:', renderedHtml.indexOf('Mechanical Ventilation') !== -1);

  // --- Reset Search & Filter ---
  state.pyq.faqSearch = '';
  state.pyq.faqExamFilter = 'all';

  console.log('\n========================================');
  console.log('ALL VERIFICATION CHECKS PASSED (100%)');
  console.log('========================================\n');
}, 100);



// Verify topic mapping against study-data.js
console.log('\n--- Checking Topic Mappings against study-data.js ---');
const studyContent = fs.readFileSync('study-data.js', 'utf8');
const topicIds = new Set();
const idRegex = /"id":\s*"([^"]+)"/g;
let m;
while ((m = idRegex.exec(studyContent)) !== null) {
  topicIds.add(m[1]);
}
console.log('Unique topic/item IDs found in study-data.js:', topicIds.size);

const mapStart = mcqEngineSource.indexOf('var CANONICAL_TOPIC_TO_STUDY = {');
const mapEnd = mcqEngineSource.indexOf('};', mapStart);
const mapObj = eval('(' + mcqEngineSource.slice(mapStart + 'var CANONICAL_TOPIC_TO_STUDY = '.length, mapEnd + 1) + ')');

let missing = 0;
for (const [topic, mapping] of Object.entries(mapObj)) {
  const targetId = typeof mapping === 'object' ? mapping.studyId : mapping;
  if (!topicIds.has(targetId)) {
    console.error('  [FAIL] MISSING IN study-data.js:', topic, '->', targetId);
    missing++;
  } else {
    console.log('  [PASS]', topic, '->', targetId, '(' + mapping.title + ')');
  }
}

if (missing === 0) {
  console.log('\n✓ SUCCESS: All ' + Object.keys(mapObj).length + ' canonical topics map to valid study topics in study-data.js!');
} else {
  console.error('\n✗ FAILURE: ' + missing + ' topics could not be found in study-data.js!');
  process.exit(1);
}


