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
    print("[PASS] 'antimicrobials' category is present in study-data.js")

    # Drugs check
    drugs = {d['id']: d for d in data['drugs']}
    expected = ['meropenem', 'piperacillin-tazobactam', 'gentamicin', 'teicoplanin', 'vancomycin', 'colistin']
    for eid in expected:
        assert eid in drugs, f"Drug {eid} missing from study-data.js"
        d = drugs[eid]
        assert d['cat'] == 'antimicrobials', f"Drug {eid} cat is {d['cat']}, expected 'antimicrobials'"
        for field in ['id', 'cat', 'name', 'brand', 'classification', 'tagline', 'structure', 'pd', 'pk', 'dosage', 'complications', 'references']:
            assert field in d and len(d[field]) > 0, f"Field {field} missing or empty in {eid}"
        print(f"[PASS] Drug {eid} ({d['name']}) verified with full monograph schema")

    # Clinical validation
    mero = drugs['meropenem']
    assert 'valpro' in mero['complications'].lower(), "Meropenem monograph must warn against valproic acid interaction"
    assert 'loading' in mero['dosage'].lower(), "Meropenem must have loading dose guidance"

    piptaz = drugs['piperacillin-tazobactam']
    assert 'vancomycin' in piptaz['complications'].lower(), "Piptaz monograph must document synergistic AKI with vancomycin"
    assert 'extended' in piptaz['dosage'].lower(), "Piptaz must include extended infusion protocol"

    genta = drugs['gentamicin']
    assert 'myasthenia' in genta['complications'].lower(), "Gentamicin must warn of myasthenia gravis contraindication"
    assert 'hartford' in genta['dosage'].lower(), "Gentamicin must include Hartford nomogram guidance"
    assert 'tdm' in genta['dosage'].lower() or 'trough' in genta['dosage'].lower(), "Gentamicin must include TDM targets"

    teico = drugs['teicoplanin']
    assert 'loading' in teico['dosage'].lower(), "Teicoplanin must have mandatory loading dose protocol"
    assert 'red man' in teico['complications'].lower(), "Teicoplanin must mention absence of Red Man syndrome"

    print("[PASS] All clinical safeguards & educational content verified")

def test_ron_design_integration():
    with open('study-ron-design.js', 'r', encoding='utf-8') as f:
        text = f.read()

    assert 'id: "antimicrobials"' in text, "antimicrobials category missing from DOMAIN_DEFS"
    assert '"antimicrobials"' in text, "antimicrobials missing from drugCats"
    assert 'renderChaptersModal' in text, "renderChaptersModal missing from study-ron-design.js"
    assert 'openChaptersModal' in text, "openChaptersModal missing from study-ron-design.js"
    assert 'ron-browse-chapters-trigger' in text, "ron-browse-chapters-trigger missing from study-ron-design.js"
    assert 'ron-chapter-link-card' in text, "ron-chapter-link-card missing from study-ron-design.js"
    print("[PASS] study-ron-design.js integration and chapters modal verified")

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

if __name__ == '__main__':
    test_antimicrobial_data()
    test_ron_design_integration()
    test_css()
    test_bubble_menu()
    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀")
