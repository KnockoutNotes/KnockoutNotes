# KnockoutNotes — Study Section Content Architecture

This directory documents the educational modules of the Study section (`study.html`, `study-data.js`, `study-ron-design.js`).

## Preservation Contract
The Study section is fully operational and protected:
- **Core Modules**:
  1. **Anaesthesia** (General Anaesthesia, Subspecialties, Regional Anaesthesia, Equipment & Safety, Paediatrics)
  2. **Critical Care** (Resuscitation, Mechanical Ventilation, Shock & Hemodynamics, Neuro-ICU, Nephrology, Sepsis)
  3. **Drugs** (Pharmacology, Induction, Opioids, Muscle Relaxants, Local Anaesthetics, Vasoactive Drugs, Antidotes)
  4. **Case Discussions** (All 39 high-yield clinical viva cases including IHD, COPD, Bronchiectasis, Pneumonectomy / OLV, CABG, Neurosurgery)
- **Asset References**:
  Referenced via `study-data.js` mapped to `assets/references/`, `assets/regional/`, `assets/cardiology/`, `assets/drugs/`, `assets/critical-care/`, and `assets/models/`.
  These paths are strictly preserved in their original locations to ensure 100% backward compatibility and zero regressions.
