import re

with open('study-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Match topic or drug pushes
topic_matches = re.findall(r'topics\.push\(\{\s*id:\s*"([^"]+)",\s*cat:\s*"([^"]+)"', content)
drug_matches = re.findall(r'addDrug\(\{\s*id:\s*"([^"]+)",\s*cat:\s*"([^"]+)"', content)

print(f"Total topics: {len(topic_matches)}")
for tid, cat in topic_matches:
    print(f"  Topic [{cat}]: {tid}")

print(f"\nTotal drugs: {len(drug_matches)}")
for did, cat in drug_matches:
    print(f"  Drug [{cat}]: {did}")
