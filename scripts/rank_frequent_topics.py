import json

with open('criticalCare/mcqs.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

def is_pyq(m):
    if not m:
        return False
    st = m.get('sourceType', '')
    if st in ['neet-ss-2025-recall', 'neet-ss-2024-recall', 'ini-ss-nov2025-recall', 'ini-cet-ss-2026-recall']:
        return True
    tags = m.get('tags', [])
    for t in ['NEET SS CC 2025', 'NEET SS CC 2024', 'INI SS CC Nov 2025', 'INI SS CC April 2026', 'INI-CET SS 2026', 'Recall Nov 2025', 'Recall 2026', 'Recall 2025', 'Recall 2024']:
        if t in tags:
            return True
    return False

def get_pyq_exam(m):
    if not m:
        return 'NEET-SS'
    if m.get('exam') == 'INI-CET SS' or m.get('sourceType') == 'ini-cet-ss-2026-recall':
        return 'INI-CET-SS-2026'
    tags = m.get('tags', [])
    if 'INI-CET SS 2026' in tags or 'INI SS CC April 2026' in tags:
        return 'INI-CET-SS-2026'
    if m.get('exam') == 'INI-SS' or m.get('sourceType') == 'ini-ss-nov2025-recall':
        return 'INI-SS'
    if 'INI-SS' in tags or 'INI SS CC Nov 2025' in tags:
        return 'INI-SS'
    return 'NEET-SS'

def get_pyq_year(m):
    if not m:
        return 2025
    if m.get('year'):
        return int(m['year'])
    st = m.get('sourceType', '')
    tags = m.get('tags', [])
    if st == 'ini-cet-ss-2026-recall' or 'INI-CET SS 2026' in tags or 'Recall 2026' in tags:
        return 2026
    if st == 'neet-ss-2024-recall' or 'NEET SS CC 2024' in tags:
        return 2024
    return 2025

def get_pyq_topic(m):
    raw = ''
    tags = m.get('tags', [])
    if len(tags) > 3 and tags[3]:
        raw = tags[3]
    elif m.get('topic'):
        raw = m['topic']
    elif m.get('subject'):
        raw = m['subject']
    s = str(raw).strip().lower()
    if 'ventilat' in s or 'respirat' in s: return 'Mechanical Ventilation'
    if 'hemodynam' in s or 'cardio' in s: return 'Hemodynamics'
    if 'sepsis' in s or 'septic' in s: return 'Sepsis'
    if 'neuro' in s or 'tbi' in s or 'icp' in s: return 'Neurocritical Care'
    if 'acid' in s or 'abg' in s: return 'Acid-Base Disorders'
    if 'renal' in s or 'kidney' in s: return 'Renal Critical Care'
    if 'cpr' in s or 'acls' in s or 'resuscit' in s: return 'ACLS / CPR'
    if 'infect' in s or 'antibi' in s or 'pneumon' in s: return 'Infectious Diseases'
    if 'toxico' in s or 'poison' in s: return 'Toxicology'
    if 'trauma' in s or 'burn' in s: return 'Trauma & Burns'
    if 'nutrit' in s or 'gastro' in s or 'gi' in s: return 'Nutrition & GI'
    if 'obstetric' in s or 'pregnan' in s or 'maternal' in s: return 'Obstetric Critical Care'
    if 'electrolyt' in s or 'sodium' in s or 'potassium' in s or 'calcium' in s: return 'Electrolytes & Metabolic'
    if 'hematol' in s or 'thromb' in s or 'platelet' in s: return 'Hematology & Transfusion'
    if 'procedur' in s or 'monitor' in s or 'catheter' in s: return 'ICU Procedures & Monitoring'
    if 'pharm' in s or 'drug' in s or 'chemo' in s: return 'Pharmacology & Oncology'
    return raw or 'Miscellaneous'

pyqs = [m for m in master if is_pyq(m)]
print(f"Total PYQs: {len(pyqs)}")

stats = {}
for q in pyqs:
    t = get_pyq_topic(q)
    ex = get_pyq_exam(q)
    yr = get_pyq_year(q)
    if t not in stats:
        stats[t] = {
            'name': t,
            'total': 0,
            'exams': {},
            'years': {},
            'questions': []
        }
    stats[t]['total'] += 1
    stats[t]['exams'][ex] = stats[t]['exams'].get(ex, 0) + 1
    stats[t]['years'][yr] = stats[t]['years'].get(yr, 0) + 1
    stats[t]['questions'].append(q['id'])

sorted_topics = sorted(stats.values(), key=lambda x: x['total'], reverse=True)
print("\n--- RANKED FREQUENTLY ASKED TOPICS (ALL 312 PYQs) ---")
for idx, item in enumerate(sorted_topics):
    name = item['name']
    tot = item['total']
    pct = (tot / len(pyqs)) * 100
    ex_str = ", ".join([f"{k}: {v}" for k, v in item['exams'].items()])
    print(f"{idx+1:2d}. {name:<28} | Total: {tot:2d} ({pct:4.1f}%) | {ex_str}")
