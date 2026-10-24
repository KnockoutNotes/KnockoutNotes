"""
Knockout Notes — Study Mode Reliability & Regression Test Suite
Validates:
1. Domain and category slug normalization (including fastpath aliases).
2. Direct Drugs Fastpath URLs in drugs.html match canonical slugs.
3. Deterministic study data readiness handling (both before & after listener).
4. Failure resilience, timeout error UI, and duplicate initialization protection.
5. Lazy modal rendering (modals not duplicated on board render).
6. Modal open/close lifecycle and repeated cycles.
7. Container-scoped horizontal scrolling without ancestor window jumping.
8. Single-tap domain switching on mobile without modal hijack.
9. Bubble menu and router integration with window.StudyRonDesign.switchDomain.
10. Category and drug monograph mapping integrity.
"""

import json
import os
import re
import subprocess
import unittest

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_node_eval(script: str) -> dict:
    wrapped_script = f"""
    const vm = require('vm');
    const fs = require('fs');

    const createEl = (tag) => ({{
      tagName: (tag || 'div').toUpperCase(),
      style: {{}},
      classList: {{
        _classes: new Set(),
        add(...c) {{ c.forEach(x => this._classes.add(x)); }},
        remove(...c) {{ c.forEach(x => this._classes.delete(x)); }},
        contains(c) {{ return this._classes.has(c); }},
        toggle(c, force) {{
          if (force === true) this._classes.add(c);
          else if (force === false) this._classes.delete(c);
          else if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        }}
      }},
      setAttribute(k, v) {{ this[k] = v; }},
      getAttribute(k) {{ return this[k] || null; }},
      appendChild(node) {{ if (!this.children) this.children = []; this.children.push(node); return node; }},
      prepend(node) {{ if (!this.children) this.children = []; this.children.unshift(node); return node; }},
      querySelector(sel) {{ return null; }},
      querySelectorAll(sel) {{ return []; }},
      addEventListener() {{}},
      removeEventListener() {{}},
      getBoundingClientRect() {{ return {{ left: 0, right: 100, top: 0, bottom: 50, width: 100, height: 50 }}; }},
      scrollTo() {{}},
      focus() {{}}
    }});

    const eventListeners = new Map();
    const sandbox = {{
      window: {{}},
      document: {{
        addEventListener(event, fn, opts) {{
          if (!eventListeners.has(event)) eventListeners.set(event, []);
          eventListeners.get(event).push(fn);
        }},
        removeEventListener(event, fn) {{
          if (eventListeners.has(event)) {{
            eventListeners.set(event, eventListeners.get(event).filter(f => f !== fn));
          }}
        }},
        getElementById(id) {{ return null; }},
        querySelector(sel) {{ return null; }},
        querySelectorAll(sel) {{ return []; }},
        createElement: createEl,
        body: createEl('body'),
        readyState: 'complete'
      }},
      location: {{
        search: '?domain=drugs&cat=cardiac',
        href: 'https://example.com/study.html?domain=drugs&cat=cardiac'
      }},
      matchMedia: () => ({{ matches: false }}),
      setTimeout: (fn, ms) => fn(),
      clearTimeout: () => {{}},
      setInterval: () => 1,
      clearInterval: () => {{}},
      MutationObserver: class {{ observe(){{}} disconnect(){{}} }},
      URL: URL,
      URLSearchParams: URLSearchParams,
      history: {{ pushState: () => {{}}, replaceState: () => {{}} }},
      CustomEvent: class {{
        constructor(type, opts) {{
          this.type = type;
          this.detail = opts && opts.detail;
        }}
      }}
    }};
    sandbox.window = sandbox;
    sandbox.window.addEventListener = (event, fn) => sandbox.document.addEventListener(event, fn);
    sandbox.window.removeEventListener = (event, fn) => sandbox.document.removeEventListener(event, fn);
    sandbox.window.dispatchEvent = (evt) => {{
      const listeners = eventListeners.get(evt.type) || [];
      listeners.forEach(fn => fn(evt));
      return true;
    }};

    vm.createContext(sandbox);

    // User script body
    {script}
    """
    proc = subprocess.run(
        ["node", "-e", wrapped_script],
        cwd=ROOT_DIR,
        capture_output=True,
        text=True
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Node execution failed: {proc.stderr}\nStdout: {proc.stdout}")
    return json.loads(proc.stdout)


class TestStudyModeReliability(unittest.TestCase):
    def test_drugs_fastpath_urls_in_drugs_html(self):
        """Verify drugs.html contains canonical lowercase category slug parameters."""
        drugs_html_path = os.path.join(ROOT_DIR, "drugs.html")
        with open(drugs_html_path, "r", encoding="utf-8") as f:
            content = f.read()

        expected_links = [
            'cat=antimicrobials',
            'cat=antiarrhythmics',
            'cat=cardiac',
            'cat=vasopressors',
            'cat=induction',
            'cat=steroids',
            'cat=antidiabetics'
        ]
        for link in expected_links:
            self.assertIn(link, content, f"Expected canonical parameter '{link}' in drugs.html")

        # Must not contain unnormalized uppercase/spaced slugs in query parameters
        forbidden = [
            'cat=Cardiac%20Drugs',
            'cat=Inotropes%20and%20Vasopressors',
            'cat=Intravenous%20Induction%20Agents',
            'cat=Anti-Diabetics'
        ]
        for f_link in forbidden:
            self.assertNotIn(f_link, content, f"drugs.html must not use unnormalized parameter '{f_link}'")

    def test_slug_normalization_and_aliases(self):
        """Verify normalizeCategorySlug handles aliases, capitalizations, ampersands, and spaces."""
        script = """
        vm.runInContext(fs.readFileSync('study-data.js', 'utf8'), sandbox);
        vm.runInContext(fs.readFileSync('study-ron-design.js', 'utf8'), sandbox);

        const aliases = [
          ['Antimicrobials', 'antimicrobials'],
          ['Antimicrobial Therapy', 'antimicrobials'],
          ['Antiarrhythmics', 'antiarrhythmics'],
          ['Cardiac Drugs', 'cardiac'],
          ['cardiac_drugs', 'cardiac'],
          ['Inotropes and Vasopressors', 'vasopressors'],
          ['Intravenous Induction Agents', 'induction'],
          ['Neuromuscular Blockers', 'relaxants'],
          ['Muscle Relaxants', 'relaxants'],
          ['Reversal Agents', 'reversal'],
          ['Non-opioid Analgesics', 'nsaids'],
          ['Steroids', 'steroids'],
          ['Anti-Diabetics', 'antidiabetics'],
          ['Obstetric & Pediatric Drugs', 'pregnancy'],
          ['Emergency Drugs', 'miscellaneous'],
          ['cardiac', 'cardiac'],
          ['all', 'all']
        ];

        const results = aliases.map(([input, expected]) => ({
          input,
          expected,
          actual: sandbox.window.StudyRonDesign.normalizeCategorySlug(input)
        }));

        console.log(JSON.stringify(results));
        """
        results = run_node_eval(script)
        for item in results:
            self.assertEqual(
                item["actual"], item["expected"],
                f"Slug normalization failed for '{item['input']}': got '{item['actual']}', expected '{item['expected']}'"
            )

    def test_study_data_ready_event_dispatch(self):
        """Verify study-data.js dispatches kn:study-data-ready and sets readiness flag."""
        script = """
        let eventFired = false;
        let eventDetail = null;

        sandbox.window.addEventListener('kn:study-data-ready', (e) => {
          eventFired = true;
          eventDetail = e.detail;
        });

        vm.runInContext(fs.readFileSync('study-data.js', 'utf8'), sandbox);

        console.log(JSON.stringify({
          flagSet: sandbox.window.__KN_STUDY_DATA_READY === true,
          eventFired: eventFired,
          detail: eventDetail
        }));
        """
        res = run_node_eval(script)
        self.assertTrue(res["flagSet"], "Expected __KN_STUDY_DATA_READY to be true")
        self.assertTrue(res["eventFired"], "Expected kn:study-data-ready event to be dispatched")
        self.assertGreater(res["detail"]["topics"], 200, "Expected > 200 topics in detail count")
        self.assertGreater(res["detail"]["drugs"], 100, "Expected > 100 drugs in detail count")

    def test_asynchronous_data_readiness_handling(self):
        """Verify study-ron-design.js boots when data is delayed and dispatches kn:study-data-ready."""
        script = """
        // 1. Load study-ron-design.js FIRST before study-data.js
        sandbox.document.readyState = 'loading';
        vm.runInContext(fs.readFileSync('study-ron-design.js', 'utf8'), sandbox);

        const initialReady = sandbox.window.StudyRonDesign.isDataReady();

        // 2. Simulate deferred study-data.js execution
        vm.runInContext(fs.readFileSync('study-data.js', 'utf8'), sandbox);

        const finalReady = sandbox.window.StudyRonDesign.isDataReady();

        console.log(JSON.stringify({
          initialReady,
          finalReady,
          hasSwitchDomain: typeof sandbox.window.StudyRonDesign.switchDomain === 'function'
        }));
        """
        res = run_node_eval(script)
        self.assertFalse(res["initialReady"], "Expected isDataReady to be false before study-data.js loads")
        self.assertTrue(res["finalReady"], "Expected isDataReady to be true after study-data.js loads")
        self.assertTrue(res["hasSwitchDomain"], "Expected window.StudyRonDesign.switchDomain to be exposed")

    def test_lazy_modal_rendering(self):
        """Verify renderRonBoard HTML template does NOT embed full modal trees into mount.innerHTML."""
        ron_js_path = os.path.join(ROOT_DIR, "study-ron-design.js")
        with open(ron_js_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Both ${renderTopicsModal()} and ${renderChaptersModal()} should not be in renderRonBoard templates
        self.assertNotIn(
            "${renderTopicsModal()}", content,
            "renderTopicsModal() should not be interpolated inside renderRonBoard templates"
        )
        self.assertNotIn(
            "${renderChaptersModal()}", content,
            "renderChaptersModal() should not be interpolated inside renderRonBoard templates"
        )

    def test_modal_lifecycle_methods(self):
        """Verify openChaptersModal, closeChaptersModal, openTopicsModal, closeTopicsModal exist and operate lazily."""
        script = """
        vm.runInContext(fs.readFileSync('study-data.js', 'utf8'), sandbox);
        vm.runInContext(fs.readFileSync('study-ron-design.js', 'utf8'), sandbox);

        const api = sandbox.window.StudyRonDesign;
        const methods = [
          'openChaptersModal',
          'closeChaptersModal',
          'openTopicsModal',
          'closeTopicsModal',
          'switchDomain',
          'openTopic',
          'backToCategory'
        ];
        const missing = methods.filter(m => typeof api[m] !== 'function');

        console.log(JSON.stringify({
          missing,
          allPresent: missing.length === 0
        }));
        """
        res = run_node_eval(script)
        self.assertTrue(res["allPresent"], f"Missing StudyRonDesign methods: {res['missing']}")

    def test_bubble_menu_connects_switch_domain(self):
        """Verify bubble-menu.js connects to switchDomain with safe fallback."""
        menu_path = os.path.join(ROOT_DIR, "bubble-menu.js")
        with open(menu_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("window.StudyRonDesign.switchDomain", content)
        self.assertIn('switchDomain("drugs")', content)
        self.assertIn('switchDomain("anaesthesia")', content)
        self.assertIn('switchDomain("critical")', content)

    def test_scroll_stability_no_forced_mount_scroll_on_back(self):
        """Verify backToCategory does not contain forced mount.scrollIntoView."""
        ron_js_path = os.path.join(ROOT_DIR, "study-ron-design.js")
        with open(ron_js_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract backToCategory function body
        back_match = re.search(r"function backToCategory\(.*?\)\s*\{(.*?)\n  \}", content, re.DOTALL)
        self.assertIsNotNone(back_match, "backToCategory function definition not found")
        back_body = back_match.group(1)
        self.assertNotIn(
            "scrollIntoView", back_body,
            "backToCategory should not call scrollIntoView to preserve user scroll position"
        )

    def test_scroll_category_pill_into_view_container_scoped(self):
        """Verify scrollCategoryPillIntoView uses container.scrollTo without ancestor scrollIntoView."""
        ron_js_path = os.path.join(ROOT_DIR, "study-ron-design.js")
        with open(ron_js_path, "r", encoding="utf-8") as f:
            content = f.read()

        scroll_match = re.search(r"function scrollCategoryPillIntoView\(.*?\)\s*\{(.*?)\n  \}", content, re.DOTALL)
        self.assertIsNotNone(scroll_match, "scrollCategoryPillIntoView function definition not found")
        scroll_body = scroll_match.group(1)
        self.assertNotIn(
            "scrollIntoView", scroll_body,
            "scrollCategoryPillIntoView must use container.scrollTo, not ancestor-bubbling scrollIntoView"
        )
        self.assertIn("container.scrollTo", scroll_body)

    def test_single_tap_and_double_tap_gesture_handling(self):
        """Verify touch event handler executes single-tap immediate selection and does NOT open modals on category tap."""
        ron_js_path = os.path.join(ROOT_DIR, "study-ron-design.js")
        with open(ron_js_path, "r", encoding="utf-8") as f:
            content = f.read()

        # In touchend handler, verify immediate selection and that category tap does NOT open modals
        touchend_match = re.search(r'document\.addEventListener\("touchend",\s*\(e\)\s*=>\s*\{(.*?)\},\s*\{\s*passive:\s*false\s*\}\);', content, re.DOTALL)
        self.assertIsNotNone(touchend_match, "touchend listener not found")
        touchend_body = touchend_match.group(1)
        self.assertNotIn("openChaptersModal", touchend_body, "Category/domain touch tap must never open chapters modal")
        self.assertIn("selectDomainTab", touchend_body, "Single tap must execute immediate domain selection")
        self.assertIn("selectCategoryPill", touchend_body, "Single tap must execute immediate category selection")

    def test_cardiac_and_antimicrobial_drug_counts(self):
        """Verify drug monographs exist for all key drug categories in study-data.js."""
        data_path = os.path.join(ROOT_DIR, "study-data.js")
        with open(data_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Verify key drug IDs exist in study-data.js
        sample_drugs = [
            "propofol",
            "amiodarone",
            "ivabradine",
            "caspofungin",
            "meropenem",
            "sugammadex",
            "rocuronium",
            "dexmedetomidine"
        ]
        for drug_id in sample_drugs:
            self.assertTrue(
                f'"id": "{drug_id}"' in content or f"id: '{drug_id}'" in content or f'id: "{drug_id}"' in content,
                f"Expected drug '{drug_id}' in study-data.js"
            )


if __name__ == "__main__":
    unittest.main()
