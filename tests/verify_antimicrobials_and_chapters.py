import json, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_antimicrobial_data():
    with open('study-data.js', 'r', encoding='utf-8') as f:
        text = f.read().strip()
    prefix = "window.KN_STUDY = "
    assert text.startswith(prefix), "study-data.js must start with window.KN_STUDY ="
    raw = text[len(prefix):].rstrip(';')
    data = json.loads(raw)

    # Category check
    cats = {c['id']: c for c in data['categories']}
    assert 'antimicrobials' in cats, "'antimicrobials' category missing from categories"
    assert 'antiarrhythmics' in cats, "'antiarrhythmics' category missing from categories"
    assert 'cardiac' in cats, "'cardiac' category missing from categories"
    assert cats['steroids']['label'] == 'Steroids', f"steroids label is '{cats['steroids'].get('label')}', expected 'Steroids'"
    assert cats['antidiabetics']['label'] == 'Anti-Diabetics', f"antidiabetics label is '{cats['antidiabetics'].get('label')}', expected 'Anti-Diabetics'"
    print("[PASS] 'antimicrobials', 'antiarrhythmics', 'cardiac', 'Steroids', and 'Anti-Diabetics' categories are present and verified in study-data.js")

    # Total count check
    drugs = {d['id']: d for d in data['drugs']}
    assert len(drugs) == 106, f"Expected 106 drugs, found {len(drugs)}"
    print(f"[PASS] Total drug library count verified: {len(drugs)} monographs")

    # Antimicrobials check
    expected_antimicrobials = ['meropenem', 'piperacillin-tazobactam', 'gentamicin', 'teicoplanin', 'vancomycin', 'colistin']
    for eid in expected_antimicrobials:
        assert eid in drugs, f"Drug {eid} missing from study-data.js"
        d = drugs[eid]
        assert d['cat'] == 'antimicrobials', f"Drug {eid} cat is {d['cat']}, expected 'antimicrobials'"
        for field in ['id', 'cat', 'name', 'brand', 'classification', 'tagline', 'structure', 'pd', 'pk', 'dosage', 'complications', 'references']:
            assert field in d and len(d[field]) > 0, f"Field {field} missing or empty in {eid}"
        print(f"[PASS] Antimicrobial {eid} ({d['name']}) verified")

    # Antiarrhythmics check
    expected_antiarrhythmics = [
        'amiodarone', 'lignocaine-antiarrhythmic', 'procainamide', 'ibutilide', 'adenosine',
        'antiarrhythmics-class-1a', 'antiarrhythmics-class-1c', 'antiarrhythmics-class-2', 'antiarrhythmics-class-4'
    ]
    for eid in expected_antiarrhythmics:
        assert eid in drugs, f"Antiarrhythmic {eid} missing from study-data.js"
        d = drugs[eid]
        assert d['cat'] == 'antiarrhythmics', f"Drug {eid} cat is {d['cat']}, expected 'antiarrhythmics'"
        for field in ['id', 'cat', 'name', 'brand', 'classification', 'tagline', 'structure', 'pd', 'pk', 'dosage', 'complications', 'references']:
            assert field in d and len(d[field]) > 0, f"Field {field} missing or empty in {eid}"
        print(f"[PASS] Antiarrhythmic {eid} ({d['name']}) verified")

    # Cardiac drugs check
    expected_cardiac = [
        'ivabradine', 'furosemide', 'nicorandil', 'isosorbide-dinitrate',
        'gtn', 'digoxin', 'antiplatelet-drugs', 'sacubitril-valsartan'
    ]
    for eid in expected_cardiac:
        assert eid in drugs, f"Cardiac drug {eid} missing from study-data.js"
        d = drugs[eid]
        assert d['cat'] == 'cardiac', f"Drug {eid} cat is {d['cat']}, expected 'cardiac'"
        for field in ['id', 'cat', 'name', 'brand', 'classification', 'tagline', 'structure', 'pd', 'pk', 'dosage', 'complications', 'references']:
            assert field in d and len(d[field]) > 0, f"Field {field} missing or empty in {eid}"
        print(f"[PASS] Cardiac drug {eid} ({d['name']}) verified")

    # Clinical validation for new drugs
    amio = drugs['amiodarone']
    assert 'pulmonary' in amio['complications'].lower() or 'thyroid' in amio['complications'].lower(), "Amiodarone must mention pulmonary/thyroid toxicity"
    assert 'loading' in amio['dosage'].lower(), "Amiodarone must have IV loading protocol"

    lig = drugs['lignocaine-antiarrhythmic']
    assert 'ventricular' in lig['pd'].lower() or 'vt' in lig['pd'].lower(), "Lignocaine must target ventricular arrhythmias"

    proc = drugs['procainamide']
    assert 'napa' in proc['pk'].lower(), "Procainamide must describe active metabolite NAPA"
    assert 'lupus' in proc['complications'].lower(), "Procainamide must warn of drug-induced lupus"

    ibu = drugs['ibutilide']
    assert 'torsade' in ibu['complications'].lower() or 'torsades' in ibu['complications'].lower(), "Ibutilide must warn of TdP risk"

    ade = drugs['adenosine']
    assert 'bronchospasm' in ade['complications'].lower() or 'asthma' in ade['complications'].lower(), "Adenosine must warn of severe bronchospasm in asthma"

    iva = drugs['ivabradine']
    assert 'funny' in iva['pd'].lower() or 'i_f' in iva['pd'].lower() or 'hcn' in iva['pd'].lower(), "Ivabradine must specify If / HCN channel inhibition"

    furo = drugs['furosemide']
    assert 'nkcc2' in furo['pd'].lower() or 'loop of henle' in furo['pd'].lower(), "Furosemide must cite NKCC2 symporter"

    nico = drugs['nicorandil']
    assert 'ulcer' in nico['complications'].lower(), "Nicorandil must warn of GI/mucocutaneous ulceration"

    isdn = drugs['isosorbide-dinitrate']
    assert 'tolerance' in isdn['pk'].lower() or 'nitrate tolerance' in isdn['dosage'].lower(), "ISDN must address nitrate tolerance"

    gtn = drugs['gtn']
    assert 'pde5' in gtn['complications'].lower() or 'sildenafil' in gtn['complications'].lower(), "GTN must flag lethal PDE5 inhibitor interaction"

    dig = drugs['digoxin']
    assert 'na+/k+' in dig['pd'].lower(), "Digoxin must identify Na+/K+-ATPase pump inhibition"
    assert 'hypokalemia' in dig['complications'].lower(), "Digoxin must cite hypokalemia potentiating toxicity"

    ap = drugs['antiplatelet-drugs']
    assert 'p2y12' in ap['pd'].lower() and 'cox-1' in ap['pd'].lower(), "Antiplatelets must cover COX-1 and P2Y12 agents"

    print("[PASS] All clinical pharmacology points & safeguards rigorously validated")

def test_ron_design_integration():
    with open('study-ron-design.js', 'r', encoding='utf-8') as f:
        text = f.read()

    assert 'id: "antimicrobials"' in text, "antimicrobials category missing from DOMAIN_DEFS"
    assert 'id: "antiarrhythmics"' in text, "antiarrhythmics category missing from DOMAIN_DEFS"
    assert 'id: "cardiac"' in text, "cardiac category missing from DOMAIN_DEFS"
    assert 'label: "Steroids"' in text, "Steroids label missing from DOMAIN_DEFS"
    assert 'label: "Anti-Diabetics"' in text, "Anti-Diabetics label missing from DOMAIN_DEFS"
    assert 'ICU Drugs (Steroids)' not in text, "Old ICU Drugs (Steroids) still present"
    assert 'ICU Drugs (Antidiabetics)' not in text, "Old ICU Drugs (Antidiabetics) still present"
    assert '"antiarrhythmics"' in text, "antiarrhythmics missing from drugCats"
    assert '"cardiac"' in text, "cardiac missing from drugCats"
    assert 'renderChaptersModal' in text, "renderChaptersModal missing from study-ron-design.js"
    assert 'openChaptersModal' in text, "openChaptersModal missing from study-ron-design.js"
    assert 'ron-browse-chapters-trigger' in text, "ron-browse-chapters-trigger missing from study-ron-design.js"
    assert 'ron-chapter-link-card' in text, "ron-chapter-link-card missing from study-ron-design.js"
    assert '"antiarrhythmics": 11' in text, "antiarrhythmics missing from CAT_TO_CHAPTER"
    assert '"cardiac": 11' in text, "cardiac missing from CAT_TO_CHAPTER"
    assert '"antimicrobials": 18' in text, "antimicrobials missing from CAT_TO_CHAPTER"
    print("[PASS] study-ron-design.js integration, CAT_TO_CHAPTER mappings, and chapters modal verified")

def test_study_ui():
    with open('study-ui.js', 'r', encoding='utf-8') as f:
        js = f.read()

    assert 'ANTIARRHYTHMIC_CLASSES' in js, "ANTIARRHYTHMIC_CLASSES missing from study-ui.js"
    assert 'CARDIAC_CLASSES' in js, "CARDIAC_CLASSES missing from study-ui.js"
    assert 'ANTIMICROBIAL_CLASSES' in js, "ANTIMICROBIAL_CLASSES missing from study-ui.js"
    # Ensure amiodarone is not in MISCELLANEOUS_CLASSES
    misc_idx = js.find('MISCELLANEOUS_CLASSES = [')
    assert misc_idx != -1
    misc_block = js[misc_idx:misc_idx+800]
    assert '"amiodarone"' not in misc_block, "amiodarone should not be in MISCELLANEOUS_CLASSES"
    print("[PASS] study-ui.js classification classes and amiodarone migration verified")

def test_css():
    with open('study-ron-design.css', 'r', encoding='utf-8') as f:
        css = f.read()

    assert '.ron-chapters-modal' in css, ".ron-chapters-modal missing from CSS"
    assert '.ron-chapter-link-card' in css, ".ron-chapter-link-card missing from CSS"
    assert '.ron-browse-chapters-trigger' in css, ".ron-browse-chapters-trigger missing from CSS"
    print("[PASS] CSS classes for chapters modal and triggers verified")

def test_bubble_menu():
    with open('bubble-menu.js', 'r', encoding='utf-8') as f:
        js = f.read()

    assert 'openChaptersModal' in js, "openChaptersModal hook missing from bubble-menu.js"
    print("[PASS] bubble-menu.js mobile menu hooks verified")

def test_dist_sync():
    files = ['study-data.js', 'study-ron-design.js', 'study.html', 'kn-site-search.js', 'index.html', 'study-ui.js']
    for f in files:
        with open(f, 'rb') as root_f:
            root_bytes = root_f.read()
        with open(f'dist-app/{f}', 'rb') as dist_f:
            dist_bytes = dist_f.read()
        assert root_bytes == dist_bytes, f"Sync error: {f} != dist-app/{f}"
        print(f"[PASS] Binary parity verified between root and dist-app/{f}")

if __name__ == '__main__':
    test_antimicrobial_data()
    test_ron_design_integration()
    test_study_ui()
    test_css()
    test_bubble_menu()
    test_dist_sync()
    print("\nALL SYSTEM & CLINICAL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀")
