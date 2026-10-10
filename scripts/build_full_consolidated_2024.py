import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

from enrichment_q001_to_q030 import enrichment_q001_to_q030
from enrichment_q031_to_q060 import enrichment_q031_to_q060
from enrichment_q061_to_q090 import enrichment_q061_to_q090
from enrichment_q091_to_q109 import enrichment_q091_to_q109

# Combine enrichment dictionaries
all_enrichments = {}
all_enrichments.update(enrichment_q001_to_q030)
all_enrichments.update(enrichment_q031_to_q060)
all_enrichments.update(enrichment_q061_to_q090)
all_enrichments.update(enrichment_q091_to_q109)

print(f"Total enrichments loaded: {len(all_enrichments)} (Expected: 109)")
assert len(all_enrichments) == 109, "Must have exactly 109 enrichments"

# Load the 109 extracted PDF questions
with open('scripts/extracted_pdf_109.json', 'r', encoding='utf-8') as f:
    pdf_questions = json.load(f)

# Load the 5 validated questions from previous JSON
with open('NEET_SS_2025_Critical_Care_Recall_V03.json', 'r', encoding='utf-8') as f:
    v03_data = json.load(f)

initial_5 = v03_data['questions'][:5]

initial_mapping = {
    'NEETSS-CC-2024-Q001': {
        'subject': 'Mechanical Ventilation',
        'chapter': 'Mechanical Ventilation & Graphics',
        'chapterId': 8,
        'topicId': 'cc-ventilator-graphics-and-basic-modes-of-mechanical-ventilation',
        'subtopic': 'Airway Resistance vs Respiratory Compliance',
        'difficulty': 'moderate',
        'concept_tested': 'Differentiating increased airway resistance from decreased lung compliance using peak and plateau pressures',
        'sources': ['NEET-SS 2024 Critical Care Recall Faculty Verification Panel', 'NEET_SS_2025_Critical_Care_Recall_V03.json']
    },
    'NEETSS-CC-2024-Q002': {
        'subject': 'Hemodynamics',
        'chapter': 'Advanced Hemodynamic Monitoring & Echocardiography',
        'chapterId': 3,
        'topicId': 'cc-pa-catheter',
        'subtopic': 'Pulmonary Artery Catheter Profiles in Distributive Shock',
        'difficulty': 'moderate',
        'concept_tested': 'Hemodynamic profile interpretation of hyperdynamic distributive septic shock via pulmonary artery catheter',
        'sources': ['NEET-SS 2024 Critical Care Recall Faculty Verification Panel', 'NEET_SS_2025_Critical_Care_Recall_V03.json']
    },
    'NEETSS-CC-2024-Q003': {
        'subject': 'Sepsis',
        'chapter': 'Sepsis, Septic Shock & Host Response',
        'chapterId': 5,
        'topicId': 'cc-sepsis-2026-clinical-guidelines',
        'subtopic': 'Surviving Sepsis Campaign Hour-1 Bundle & Targets',
        'difficulty': 'moderate',
        'concept_tested': 'Initial fluid resuscitation volume and vasopressor targets in the Surviving Sepsis Campaign Hour-1 bundle',
        'sources': ['NEET-SS 2024 Critical Care Recall Faculty Verification Panel', 'NEET_SS_2025_Critical_Care_Recall_V03.json']
    },
    'NEETSS-CC-2024-Q004': {
        'subject': 'Neurocritical Care',
        'chapter': 'Neurocritical Care & ICP Management',
        'chapterId': 15,
        'topicId': 'cc-icu-management-of-traumatic-brain-injury',
        'subtopic': 'Lundberg ICP Waveforms & Compliance',
        'difficulty': 'hard',
        'concept_tested': 'Pathological significance and clinical interpretation of Lundberg A (plateau) intracranial pressure waves',
        'sources': ['NEET-SS 2024 Critical Care Recall Faculty Verification Panel', 'NEET_SS_2025_Critical_Care_Recall_V03.json']
    },
    'NEETSS-CC-2024-Q005': {
        'subject': 'Acid-Base Disorders',
        'chapter': 'Fluid, Electrolyte & Acid-Base Disorders',
        'chapterId': 14,
        'topicId': 'cc-interpreting-abg',
        'subtopic': 'Normal Anion Gap Metabolic Acidosis & Winter Formula',
        'difficulty': 'moderate',
        'concept_tested': 'Identification of Normal Anion Gap Metabolic Acidosis (NAGMA) and expected respiratory compensation via Winter formula',
        'sources': ['NEET-SS 2024 Critical Care Recall Faculty Verification Panel', 'NEET_SS_2025_Critical_Care_Recall_V03.json']
    }
}

assembled_2024_mcqs = []
next_q_num = 1

# Process 109 questions from PDF
for q_raw in pdf_questions:
    num = q_raw['num']
    enr = all_enrichments[num]
    
    qid = f"NEETSS-CC-2024-R{next_q_num:03d}"
    
    # Options text
    options = q_raw['options']
    ans_key = q_raw['answer']
    
    # Options text cleanup if question 6 or 44 or 45 have customized text in enr
    q_stem = enr.get('question_text', q_raw['question'])
    
    # Options rationale
    why_wrong = enr['why_other_options_wrong']
    
    # Stated answer text
    opt_idx = ord(ans_key) - ord('A')
    ans_text = options[opt_idx] if 0 <= opt_idx < len(options) else ""
    
    assembled_q = {
        "id": qid,
        "number": next_q_num,
        "chapterId": enr['chapterId'],
        "chapter": enr['chapter'],
        "topicId": enr['topicId'],
        "subject": enr['subject'],
        "subtopic": q_raw.get('subtopic', '') or q_raw.get('topic', ''),
        "question": q_stem,
        "options": options,
        "answer": ans_key,
        "explanation": enr['explanation'],
        "whyWrong": why_wrong,
        "difficulty": enr.get('difficulty', 'moderate'),
        "sourceType": "neet-ss-2024-recall",
        "exam": "NEET-SS",
        "year": 2024,
        "examPearl": f"HIGH-YIELD TAKEAWAYS:\n• " + "\n• ".join(enr['high_yield_takeaway']),
        "hyperlinkedReference": {
            "label": "DocTutorials NEET-SS 2024 Recall Session (Dr. Midhun Mohan)",
            "url": "https://www.youtube.com/live/Ga7xkectq3c"
        },
        "tags": [
            "NEET SS CC 2024",
            "Recall 2024",
            "NEET-SS",
            enr['subject'],
            q_raw.get('topic', '') or enr['chapter']
        ],
        "verificationStatus": "VERIFIED",
        "recall_confidence": "high",
        "question_status": "verified_recall",
        "speaker_answer": ans_key,
        "speaker_answer_text": ans_text,
        "verified_answer": ans_key,
        "verified_answer_text": ans_text,
        "concept_tested": enr['concept_tested'],
        "high_yield_takeaway": enr['high_yield_takeaway'],
        "sources": [
            "DocTutorials NEET-SS 2024 Critical Care Recall Session (Dr. Midhun Mohan)",
            "DocTutorials NEET SS Critical Care 2024 (Reworked) PDF",
            "NEET-SS Critical Care Faculty Verification Panel"
        ]
    }
    
    assembled_2024_mcqs.append(assembled_q)
    next_q_num += 1

# Process 5 initial validated questions
for q in initial_5:
    qid_old = q['question_id']
    m = initial_mapping[qid_old]
    qid_new = f"NEETSS-CC-2024-R{next_q_num:03d}"
    
    ans_key = q['verified_answer']
    options_text = [opt['text'] for opt in q['options']]
    opt_idx = ord(ans_key) - ord('A')
    ans_text = options_text[opt_idx] if 0 <= opt_idx < len(options_text) else ""
    
    why_wrong = {opt['key']: opt.get('rationale', '') for opt in q['options']}
    
    assembled_q = {
        "id": qid_new,
        "number": next_q_num,
        "chapterId": m['chapterId'],
        "chapter": m['chapter'],
        "topicId": m['topicId'],
        "subject": m['subject'],
        "subtopic": m['subtopic'],
        "question": q['question_text'],
        "options": options_text,
        "answer": ans_key,
        "explanation": q['explanation'],
        "whyWrong": why_wrong,
        "difficulty": m['difficulty'],
        "sourceType": "neet-ss-2024-recall",
        "exam": "NEET-SS",
        "year": 2024,
        "examPearl": f"HIGH-YIELD TAKEAWAYS:\n• " + q.get('high_yield_takeaway', ''),
        "hyperlinkedReference": {
            "label": "NEET-SS 2024 Critical Care Recall Faculty Verification Panel",
            "url": "https://www.youtube.com/live/Ga7xkectq3c"
        },
        "tags": [
            "NEET SS CC 2024",
            "Recall 2024",
            "NEET-SS",
            m['subject'],
            m['subtopic']
        ],
        "verificationStatus": "VERIFIED",
        "recall_confidence": "high",
        "question_status": "verified_recall",
        "speaker_answer": ans_key,
        "speaker_answer_text": ans_text,
        "verified_answer": ans_key,
        "verified_answer_text": ans_text,
        "concept_tested": m['concept_tested'],
        "high_yield_takeaway": [q.get('high_yield_takeaway', '')],
        "sources": m['sources']
    }
    
    assembled_2024_mcqs.append(assembled_q)
    next_q_num += 1

print(f"\nTotal assembled 2024 questions: {len(assembled_2024_mcqs)} (Expected: 114)")
assert len(assembled_2024_mcqs) == 114, "Must have exactly 114 questions"

# Verify all records
unique_ids = set()
unique_stems = set()
for q in assembled_2024_mcqs:
    assert q['id'] not in unique_ids, f"Duplicate ID: {q['id']}"
    unique_ids.add(q['id'])
    assert q['question'] not in unique_stems, f"Duplicate stem: {q['question'][:50]}"
    unique_stems.add(q['question'])
    assert len(q['options']) == 4, f"Options not 4 for {q['id']}"
    assert q['answer'] in ['A', 'B', 'C', 'D'], f"Invalid answer {q['answer']} for {q['id']}"
    assert q['explanation'], f"Empty explanation for {q['id']}"
    assert len(q['whyWrong']) == 4, f"whyWrong not 4 options for {q['id']}"
    assert 1 <= q['chapterId'] <= 31, f"Invalid chapterId {q['chapterId']} for {q['id']}"
    assert 'Critical care management in' not in q['question'], f"Placeholder found in {q['id']}"

print("✓ All 114 questions passed validation checks!")

# 1. Write the standalone consolidated deliverable: NEET_SS_2024_Critical_Care_Recall_Consolidated.json
consolidated_deliverable = {
    "metadata": {
        "exam": "NEET-SS",
        "year": "2024",
        "specialty": "Critical Care Medicine",
        "total_questions": len(assembled_2024_mcqs),
        "source_attribution": [
            "DocTutorials NEET-SS 2024 Recall Session by Dr. Midhun Mohan (YouTube live Ga7xkectq3c)",
            "Official DocTutorials NEET SS Critical Care 2024 (Reworked) PDF (56 pages)",
            "NEET-SS Critical Care Faculty Verification Panel"
        ],
        "schema_version": "Knockout_V03_Consolidated",
        "verified_date": "2026-10-11"
    },
    "questions": assembled_2024_mcqs
}

deliverable_path = 'NEET_SS_2024_Critical_Care_Recall_Consolidated.json'
with open(deliverable_path, 'w', encoding='utf-8') as f:
    json.dump(consolidated_deliverable, f, indent=2, ensure_ascii=False)

print(f"✓ Created standalone deliverable: {deliverable_path} ({os.path.getsize(deliverable_path)} bytes)")

# 2. Update criticalCare/mcqs.json
with open('criticalCare/mcqs.json', 'r', encoding='utf-8') as f:
    current_mcqs = json.load(f)

# Keep standard MCQs and 2025 recalls, remove old 2024 recalls
preserved_mcqs = [
    m for m in current_mcqs 
    if m.get('sourceType') != 'neet-ss-2024-recall' 
    and 'NEETSS-CC-2024' not in m.get('id', '')
    and not (m.get('tags') and 'NEET SS CC 2024' in m.get('tags'))
]

print(f"Preserved non-2024 MCQs: {len(preserved_mcqs)} (505 standard + 76 2025 = 581)")

new_master_mcqs = preserved_mcqs + assembled_2024_mcqs
print(f"New master MCQs total: {len(new_master_mcqs)} (Expected: 581 + 114 = 695)")

with open('criticalCare/mcqs.json', 'w', encoding='utf-8') as f:
    json.dump(new_master_mcqs, f, indent=2, ensure_ascii=False)
print(f"✓ Updated criticalCare/mcqs.json")

# Also update dist-app/criticalCare/mcqs.json
dist_mcqs_path = 'dist-app/criticalCare/mcqs.json'
if os.path.exists(dist_mcqs_path):
    with open(dist_mcqs_path, 'w', encoding='utf-8') as f:
        json.dump(new_master_mcqs, f, indent=2, ensure_ascii=False)
    print(f"✓ Updated {dist_mcqs_path}")

# 3. Update chunk files in criticalCare/
chunk_ranges = [
    ('mcqs_ch01_to_ch08.json', 1, 8),
    ('mcqs_ch09_to_ch16.json', 9, 16),
    ('mcqs_ch17_to_ch24.json', 17, 24),
    ('mcqs_ch25_to_ch31.json', 25, 31)
]

for filename, start_ch, end_ch in chunk_ranges:
    chunk_items = [m for m in new_master_mcqs if start_ch <= m.get('chapterId', 0) <= end_ch]
    cpath = os.path.join('criticalCare', filename)
    with open(cpath, 'w', encoding='utf-8') as f:
        json.dump(chunk_items, f, indent=2, ensure_ascii=False)
    print(f"  - Updated chunk {filename}: {len(chunk_items)} MCQs")
    
    dist_cpath = os.path.join('dist-app/criticalCare', filename)
    if os.path.exists('dist-app/criticalCare'):
        with open(dist_cpath, 'w', encoding='utf-8') as f:
            json.dump(chunk_items, f, indent=2, ensure_ascii=False)

print("\nAll database files successfully synchronized!")
