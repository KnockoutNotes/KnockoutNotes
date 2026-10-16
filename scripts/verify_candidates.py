import re

with open('study-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all "id": "..." within study-data.js
matches = re.findall(r'"id":\s*"([^"]+)"', text)
print(f"Total topics in study-data.js: {len(matches)}")
print("\nFirst 40 topics:")
for m in matches[:40]:
    print(f"  {m}")

# Check which ones contain 'toxic', 'airway', 'infect', 'neuro', 'sepsis', 'cpr', 'trauma', 'burn', 'nutrit', 'obstetric', 'electrolyt', 'renal', 'ventilat'
keywords = ['toxic', 'airway', 'infect', 'neuro', 'sepsis', 'cpr', 'trauma', 'burn', 'nutrit', 'obstetric', 'electrolyt', 'renal', 'ventilat', 'hemo', 'procedur', 'pharm', 'cardio', 'acid']
print("\nMatching topics by keyword:")
for kw in keywords:
    hits = [m for m in matches if kw in m.lower()]
    print(f"  {kw:12}: {hits}")
