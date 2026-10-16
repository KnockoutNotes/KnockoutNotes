import json

with open('study-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Load topics array
start_idx = text.find('"topics": [')
if start_idx != -1:
    # Let's find each topic by regex
    import re
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
        pos = text.find(f'"id": "{tid}"')
        if pos != -1:
            # find end of object
            obj_end = text.find('\n    },', pos)
            chunk = text[pos:obj_end]
            words = len(chunk.split())
            sec_count = len(re.findall(r'"h":\s*"', chunk))
            print(f"Topic '{tid}': {sec_count} sections, ~{words} words in JSON")
