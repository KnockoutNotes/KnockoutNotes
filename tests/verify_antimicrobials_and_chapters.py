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
    assert len(drugs) == 126, f"Expected 126 drugs, found {len(drugs)}"
    print(f"[PASS] Total drug library count verified: {len(drugs)} monographs")

    # Ensure NO drug has any empty essential fields
    for d in data['drugs']:
        for k in ['id', 'cat', 'name', 'brand', 'classification', 'tagline', 'structure', 'pd', 'pk', 'dosage', 'complications', 'source', 'references']:
            assert k in d and len(d[k]) > 0, f"Empty or missing field '{k}' in drug '{d.get('id')}'"
    print("[PASS] Zero empty fields verified across ALL 126 drug monographs")

    # Complete 26 ICU Antimicrobials check
    expected_antimicrobials = [
        'meropenem', 'piperacillin-tazobactam', 'gentamicin', 'teicoplanin', 'vancomycin', 'colistin',
        'ceftriaxone', 'ceftazidime', 'cefepime', 'cefazolin', 'ceftazidime-avibactam', 'ceftolozane-tazobactam',
        'linezolid', 'daptomycin', 'tigecycline', 'amikacin', 'metronidazole', 'ciprofloxacin', 'levofloxacin',
        'aztreonam', 'polymyxin-b', 'ampicillin-sulbactam', 'imipenem-cilastatin', 'fidaxomicin', 'fluconazole', 'caspofungin'
    ]
    assert len(expected_antimicrobials) == 26
    for eid in expected_antimicrobials:
        assert eid in drugs, f"Antimicrobial {eid} missing from study-data.js"
        d = drugs[eid]
        assert d['cat'] == 'antimicrobials', f"Drug {eid} cat is {d['cat']}, expected 'antimicrobials'"
        print(f"[PASS] ICU Antimicrobial {eid} ({d['name']}) verified")

    # Clinical & FDA Label Validation
    cro = drugs['ceftriaxone']
    assert 'kernicterus' in cro['complications'].lower() and 'calcium' in cro['complications'].lower(), "Ceftriaxone must flag kernicterus & calcium precipitation"
    assert 'meningitis' in cro['dosage'].lower() and '2 g' in cro['dosage'].lower(), "Ceftriaxone must have 2g q12h meningitis dose"

    caz = drugs['ceftazidime']
    assert 'pseudomonas' in caz['pd'].lower() and 'pbp3' in caz['pd'].lower(), "Ceftazidime must target Pseudomonas PBP3"

    cfp = drugs['cefepime']
    assert 'neurotox' in cfp['complications'].lower() and 'ncse' in cfp['complications'].lower(), "Cefepime must document neurotoxicity & NCSE"

    cfz = drugs['cefazolin']
    assert 'mssa' in cfz['pd'].lower() and 'surgical' in cfz['dosage'].lower(), "Cefazolin must detail MSSA bacteremia & surgical prophylaxis"

    cza = drugs['ceftazidime-avibactam']
    assert 'kpc' in cza['pd'].lower() and 'aztreonam' in cza['dosage'].lower(), "Avycaz must specify KPC activity and Aztreonam partnership for NDM"

    cta = drugs['ceftolozane-tazobactam']
    assert 'aspect-np' in cta['source'].lower() and '3 g' in cta['dosage'].lower(), "Zerbaxa must cite ASPECT-NP trial and 3g q8h VAP dose"

    lzd = drugs['linezolid']
    assert 'serotonin' in lzd['complications'].lower() and 'thrombocytopenia' in lzd['complications'].lower(), "Linezolid must warn of serotonin syndrome and myelosuppression"

    dap = drugs['daptomycin']
    assert 'surfactant' in dap['pd'].lower() and 'cpk' in dap['complications'].lower(), "Daptomycin must warn of surfactant inactivation and rhabdomyolysis"

    tgc = drugs['tigecycline']
    assert 'mortality' in tgc['complications'].lower() and 'black box' in tgc['complications'].lower(), "Tigecycline must document black box mortality warning"

    amk = drugs['amikacin']
    assert '60' in amk['dosage'] and 'nephrotox' in amk['complications'].lower(), "Amikacin must detail TDM peak targets and nephrotoxicity"

    mtz = drugs['metronidazole']
    assert 'disulfiram' in mtz['complications'].lower() and 'anaerob' in mtz['pd'].lower(), "Metronidazole must detail disulfiram reaction and anaerobe action"

    cip = drugs['ciprofloxacin']
    assert 'tendon' in cip['complications'].lower() and 'aortic' in cip['complications'].lower(), "Ciprofloxacin must list black-box tendon & aortic dissection warnings"

    lvx = drugs['levofloxacin']
    assert 'legionella' in lvx['pd'].lower() and '750' in lvx['dosage'], "Levofloxacin must detail Legionella activity and 750mg dosing"

    azt = drugs['aztreonam']
    assert 'penicillin' in azt['pd'].lower() and 'allergy' in azt['pd'].lower(), "Aztreonam must describe safety in IgE penicillin allergy"

    pmb = drugs['polymyxin-b']
    assert 'active' in pmb['structure'].lower() and 'non-renal' in pmb['pk'].lower(), "Polymyxin B must specify active non-prodrug and non-renal clearance"

    sam = drugs['ampicillin-sulbactam']
    assert 'attack' in sam['source'].lower() and 'acinetobacter' in sam['pd'].lower(), "Ampicillin-sulbactam must cite ATTACK trial and CRAB backbone"

    imp = drugs['imipenem-cilastatin']
    assert 'cilastatin' in imp['structure'].lower() and 'seizure' in imp['complications'].lower(), "Imipenem must document DHP-1 cilastatin and seizure risk"

    fdx = drugs['fidaxomicin']
    assert 'difficile' in fdx['pd'].lower() and 'rna polymerase' in fdx['pd'].lower(), "Fidaxomicin must cite C. diff RNA polymerase inhibition"

    flu = drugs['fluconazole']
    assert '800' in flu['dosage'] and 'ergosterol' in flu['pd'].lower(), "Fluconazole must include 800mg load and ergosterol synthesis mechanism"

    cas = drugs['caspofungin']
    assert 'glucan' in cas['pd'].lower() and '70' in cas['dosage'], "Caspofungin must detail glucan synthase inhibition and 70mg loading dose"

    print("[PASS] All 26 ICU antimicrobial clinical pharmacology points & FDA label safeguards validated")

def test_ron_design_integration():
    with open('study-ron-design.js', 'r', encoding='utf-8') as f:
        text = f.read()

    assert 'id: "antimicrobials"' in text, "antimicrobials category missing from DOMAIN_DEFS"
    assert 'id: "antiarrhythmics"' in text, "antiarrhythmics category missing from DOMAIN_DEFS"
    assert 'id: "cardiac"' in text, "cardiac category missing from DOMAIN_DEFS"
    assert 'label: "Steroids"' in text, "Steroids label missing from DOMAIN_DEFS"
    assert 'label: "Anti-Diabetics"' in text, "Anti-Diabetics label missing from DOMAIN_DEFS"
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
    files = ['study-data.js', 'study-ron-design.js', 'study.html', 'kn-site-search.js', 'index.html', 'study-ui.js', 'sw.js']
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
    print("\nALL SYSTEM, CLINICAL & FDA LABEL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀")
