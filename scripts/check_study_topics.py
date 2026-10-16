import re

with open('study-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Look for topics of interest
topic_ids = [
    'ventilator-modes-waveforms-asynchrony',
    'ards-advanced-rescue-therapies',
    'fluid-responsiveness-dynamic-indices',
    'vasopressors-inotropes-titration-protocols',
    'sepsis3-hour1-bundle-resuscitation',
    'tbi-neuromonitoring-raised-icp',
    'aki-kdigo-crrt-modalities'
]

for tid in topic_ids:
    idx = text.find(f'"id": "{tid}"')
    if idx != -1:
        snippet = text[idx:idx+1500]
        # find name and length of sections
        m_name = re.search(r'"name":\s*"([^"]+)"', snippet)
        print(f"Topic '{tid}': Found! Name: {m_name.group(1) if m_name else '?'}")
    else:
        print(f"Topic '{tid}': NOT FOUND in study-data.js")
