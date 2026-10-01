# Critical Care — Master Syllabus Coverage Matrix

This document provides a systematic mapping between the master 16-topic Critical Care curriculum and the existing KnockoutNotes study library (`study-data.js`), identifying current coverage, existing topic IDs, gaps, and evidence-based clinical references.

---

## Coverage Summary Table

| # | Major Critical Care Category | Existing Topics (IDs) | Coverage Status | Authoritative Reference Standard |
|---|-----------------------------|-----------------------|-----------------|----------------------------------|
| 1 | **General Principles of Critical Care** | `abg-analysis`, `scoring-systems` (partial) | **Partial (40%)** | *The ICU Book (Marino 5th ed)*; SCCM Guidelines; SOFA/APACHE IV validation studies |
| 2 | **Airway Management** | `airway-assessment`, `difficult-airway-algorithm`, `rsi-protocol`, `extubation-criteria` | **High (80%)** | *ASA Difficult Airway Algorithm (2022)*; DAS Extubation Guidelines |
| 3 | **Respiratory Critical Care** | `ards-berlin`, `ventilator-modes`, `niv-hfno-principles`, `copd-asthma-crisis` | **Substantial (75%)** | *ESICM/SCCM ARDS Guidelines (2023)*; Berlin Definition; ARDSNet Protocol |
| 4 | **Hemodynamic Support** | `shock-classification`, `vasopressors-inotropes`, `fluid-responsiveness`, `invasive-arterial-line` | **Substantial (75%)** | *Surviving Sepsis Campaign (2021/2026)*; ESICM Consensus on Shock & Hemodynamics |
| 5 | **Sepsis & Infectious Diseases** | `sepsis-3-definition`, `antimicrobial-stewardship`, `source-control` | **Substantial (70%)** | *Sepsis-3 Consensus*; Surviving Sepsis Campaign Hour-1 Bundle |
| 6 | **Neurological Critical Care** | `gcs-evaluation`, `raised-icp-management`, `status-epilepticus` | **Moderate (60%)** | *Brain Trauma Foundation Guidelines (4th ed)*; Neurocritical Care Society |
| 7 | **Cardiovascular Critical Care** | `ecg-arrhythmias`, `acute-coronary-syndrome`, `cardiogenic-shock`, `tamponade-pocus` | **Substantial (70%)** | *AHA/ESC ACS Guidelines (2023)*; SCAI Shock Staging |
| 8 | **Renal & Metabolic Support** | `aki-kdigo`, `crrt-principles`, `electrolyte-disturbances`, `acid-base-disorders` | **Moderate (60%)** | *KDIGO Clinical Practice Guideline for AKI*; ADQI Consensus |
| 9 | **Gastrointestinal & Hepatic Critical Care** | `acute-pancreatitis-icu`, `upper-gi-bleed`, `acute-liver-failure` | **Partial (50%)** | *ACG Acute Pancreatitis Guidelines*; AASLD Acute Liver Failure Guidelines |
| 10 | **Trauma & Burns** | `atls-principles`, `tbi-polytrauma`, `burn-parkland-formula` | **Moderate (60%)** | *ATLS 10th/11th Edition*; ISBI Practice Guidelines for Burn Care |
| 11 | **Poisoning & Environmental Emergencies** | `organophosphate-poisoning`, `paracetamol-toxicity`, `heat-stroke`, `hypothermia` | **Moderate (65%)** | *Goldfrank's Toxicologic Emergencies (11th ed)*; ERC Hypothermia Guidelines |
| 12 | **Hematology & Transfusion** | `massive-transfusion-protocol`, `dic-management`, `transfusion-triggers` | **Substantial (70%)** | *AABB Transfusion Guidelines*; European Guideline on Management of Major Bleeding |
| 13 | **Obstetric Critical Care** | `eclampsia-magnesium`, `postpartum-hemorrhage-critical`, `amniotic-fluid-embolism` | **Partial (55%)** | *ACOG Obstetric Critical Care*; FIGO PPH Guidelines |
| 14 | **Pediatric Critical Care Essentials** | `pals-resuscitation`, `pediatric-sepsis`, `pediatric-airway-emergencies` | **Partial (50%)** | *PALS 2020/2025 Consensus*; SSC International Guidelines for Pediatric Sepsis |
| 15 | **ICU Pharmacology** | `icu-sedation-padis`, `vasopressor-infusions`, `neuromuscular-blockade-icu` | **Substantial (75%)** | *SCCM PADIS Guidelines (Pain, Agitation, Delirium, Immobility, Sleep)* |
| 16 | **Research & Recent Advances** | `ecmo-vv-va`, `pocus-protocols`, `biomarkers-icu` | **Partial (40%)** | *ELSO Guidelines for ECMO*; ESICM Recent Advances Updates |

---

## Detailed Sub-Topic Gap Analysis

### 1. General Principles of Critical Care
- **Covered**:
  - `scoring-systems`: APACHE II/IV, SOFA, SAPS, qSOFA, NEWS2 overview.
  - `abg-analysis`: Systematic interpretation, Stewart approach.
- **Identified Gaps (To expand in Phase 2)**:
  - ICU Level 1-3 infrastructure & nurse-to-patient staffing ratios.
  - Brain death certification protocol & American Academy of Neurology (AAN) criteria.
  - End-of-life care, DNR vs AND, withdrawal vs withholding life support.

### 2. Airway Management in Critical Care
- **Covered**:
  - Predictors of difficult intubation (LEMON, Mallampati, Cormack-Lehane).
  - Video-laryngoscopy vs direct laryngoscopy in critically ill patients.
  - Rapid sequence intubation (RSI) physiological optimization (hemodynamic prep).
- **Identified Gaps**:
  - Post-extubation stridor prevention & cuff leak test protocols.
  - Percutaneous dilational tracheostomy (PDT) indications and contraindications.

### 3. Respiratory Critical Care
- **Covered**:
  - Berlin definition of ARDS, P/F ratio severity grading.
  - ARDSNet lung-protective ventilation: 4-8 mL/kg PBW, driving pressure <15 cmH2O, plateau pressure <30 cmH2O.
  - Prone positioning indications (P/F < 150) and duration (>=16 hrs).
  - High-flow nasal oxygen (HFNO) vs Non-invasive ventilation (NIV) in hypoxemic vs hypercapnic respiratory failure.
- **Identified Gaps**:
  - APRV (Airway Pressure Release Ventilation) setting nuances: T-high, T-low, P-high, P-low release terminate at 75% peak expiratory flow.
  - Ventilator-Associated Events (VAE) surveillance criteria.

### 4. Hemodynamic Support
- **Covered**:
  - Shock taxonomy: Hypovolemic, Cardiogenic, Distributive, Obstructive.
  - First-line vasopressors: Norepinephrine titration, early Vasopressin (0.03 U/min), Epinephrine in refractory states.
  - Fluid responsiveness: Dynamic indices (Pulse Pressure Variation, Stroke Volume Variation, Passive Leg Raise) over static CVP.
- **Identified Gaps**:
  - PiCCO and LiDCO pulse contour analysis algorithms.
  - Critical care echocardiography (VExUS scoring for venous congestion).

### 5. Sepsis & Infectious Diseases
- **Covered**:
  - Sepsis-3 consensus: Organ dysfunction driven by dysregulated host response (delta SOFA >= 2).
  - Septic shock criteria: Persistent hypotension requiring vasopressors for MAP >= 65 mmHg AND lactate > 2 mmol/L despite fluid resuscitation.
  - Empiric antibiotic timing (<1 hr in shock, <3 hrs in sepsis without shock).
- **Identified Gaps**:
  - Procalcitonin-guided de-escalation protocols.
  - Source control timelines (drainage, debridement within 6-12 hours).

---

## Action Plan for Phase 2 Content Enrichment
1. All existing topics retain their identifiers to prevent broken bookmarks or external backlinks.
2. In Phase 2, new stub/full topics for missing curriculum items will be added seamlessly using the verified `KN_STUDY` data schema.
3. Every new sub-topic will have direct citations from the standard consensus bodies (SCCM, ESICM, DAS, KDIGO, AAN).
