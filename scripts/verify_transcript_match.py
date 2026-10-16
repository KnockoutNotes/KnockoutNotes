import json

with open('INI_CET_SS_2026_Critical_Care_PYQs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('scripts/full_youtube_transcript.txt', 'r', encoding='utf-8') as f:
    transcript = f.read().lower()

print(f"Transcript character count: {len(transcript)}")

# Check key terms for each question in the transcript
found = 0
not_found = []
for idx, q in enumerate(data['questions']):
    # Pick distinctive keywords from subtopic or concept_tested
    concept = q.get('subtopic', '') + ' ' + q.get('concept_tested', '')
    # Check words of length > 5
    words = [w.lower() for w in concept.replace('/', ' ').replace('(', ' ').replace(')', ' ').split() if len(w) > 4]
    matches = [w for w in words if w in transcript]
    if len(matches) >= 2 or any(w in transcript for w in ['citrate', 'eit', 'impedance', 'last', 'cip', 'vocal', 'niv', 'pes', 'transpulmonary', 'aerosol', 'difficile', 'fast', 'auto-peep', 'star-aki', 'starrt', 'crab', 'durlobactam', 'stenotrophomonas', 'sugammadex', 'nice-sugar', 'cteph', 'ecmo', 'myasthenia', 'brain death', 'pdph', 'vasopressor', 'guillain', 'acs', 'diastolic shock', 'organophosphate', 'fallot', 'vasoplegia', 'aortic stenosis', 'methylene blue', 'mcconnell']):
        found += 1
    else:
        not_found.append((idx + 1, q['id'], q['subtopic']))

print(f"Matched questions: {found} / {len(data['questions'])}")
if not_found:
    print("Questions needing manual keyword check:", not_found)
