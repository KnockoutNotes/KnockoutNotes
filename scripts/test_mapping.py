with open('study-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

mapping = {
    "Mechanical Ventilation": "ventilator-modes-waveforms-asynchrony",
    "Hemodynamics": "fluid-responsiveness-dynamic-indices",
    "ICU Procedures & Monitoring": "pocus-critical-care-vexus-blue-rush",
    "Infectious Diseases": "multidrug-resistant-pathogens-icu",
    "Pharmacology & Oncology": "vasopressors-inotropes-titration-protocols",
    "Toxicology": "toxicology-antidotes-extracorporeal-elimination",
    "Sepsis": "sepsis3-hour1-bundle-resuscitation",
    "Neurocritical Care": "tbi-neuromonitoring-raised-icp",
    "Nutrition & GI": "nutrition-in-the-icu",
    "ACLS / CPR": "hypoxic-ischemic-encephalopathy-ttm-postarrest",
    "Trauma & Burns": "trauma-resuscitation-damage-control",
    "Electrolytes & Metabolic": "severe-electrolyte-disturbances-icu",
    "Obstetric Critical Care": "preeclampsia-eclampsia-hellp-syndrome",
    "Renal Critical Care": "aki-kdigo-crrt-modalities",
    "Cardiovascular Critical Care": "cardiogenic-shock-scai",
    "Acid-Base Disorders": "abg-metabolic-acidosis",
    "Hematology & Transfusion": "massive-transfusion-rotem-teg-coagulopathy",
    "Physiology": "hemodynamics-shock-approach",
    "Radiology": "pocus-critical-care-vexus-blue-rush",
    "Miscellaneous": "icu-organization-scoring-ethics"
}

for pyq_topic, s_id in mapping.items():
    exists = f'"id": "{s_id}"' in text
    print(f"{pyq_topic:30} -> {s_id:45} : {exists}")
