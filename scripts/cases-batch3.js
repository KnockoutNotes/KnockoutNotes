// ============================================================================
// BATCH 3: NEUROANAESTHESIA & SPINE CLINICAL CASES (5 Cases)
// Reference: Objective Anaesthesia Review (6th ed., Tata/Kulkarni/Divatia),
// Miller's Anesthesia (10th ed.), Cottrell & Patel's Neuroanesthesia.
// ============================================================================

module.exports = [
  // 13. SUPRATENTORIAL BRAIN TUMOUR & CRANIOTOMY
  {
    id: "case-supratentorial-tumour-craniotomy",
    cat: "case_neuro",
    name: "Supratentorial Brain Tumour & Craniotomy",
    short: "Supratentorial Tumour Craniotomy",
    tags: ["Neuro", "Brain Tumour", "ICP", "Cerebral Perfusion", "Brain Relaxation", "Craniotomy", "Case Discussion"],
    tagline: "Monro-Kellie doctrine, Cushing's triad, 4-step brain relaxation bundle, tight PaCO2 control & smooth extubation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 20; Miller's Anesthesia, 10th ed., Ch. 64 (Anesthesia for Neurosurgery); Cottrell and Patel's Neuroanesthesia, 6th ed.",
    sections: [
      {
        h: "1. Definition, Anatomical Compartments & The Monro-Kellie Doctrine",
        b: "• Definition: Space-occupying intracranial lesion situated above the tentorium cerebelli (e.g., glioblastoma multiforme, meningioma, metastasis, low-grade astrocytoma).\n• The Monro-Kellie Hypothesis:\n  - The cranium is a rigid, non-compliant container with fixed total volume (≈1400–1500 mL) housing 3 incompressible components:\n    1. Brain Parenchyma: 80% (≈1100–1200 mL)\n    2. Blood (Arterial + Venous): 10% (≈150 mL)\n    3. Cerebrospinal Fluid (CSF): 10% (≈150 mL)\n  - Principle: Any increase in volume of one compartment (e.g. tumor, peritumoral vasogenic edema) MUST be matched by an equal decrease in volume of another compartment, or Intracranial Pressure (ICP) will rise.\n• Intracranial Volume-Pressure Curve & Spatial Compensation:\n  - Phase 1 (Compensated): Initial tumor expansion displaces CSF into spinal subarachnoid space and compresses venous blood into dural sinuses; ICP remains normal (5–15 mmHg).\n  - Phase 2 (Decompensated): Spatial compensation is exhausted; compliance drops to near zero. Tiny increments in tumor volume, hypercapnia, or coughing produce exponential, lethal spikes in ICP (>40–60 mmHg), precipitating cerebral herniation."
      },
      {
        h: "2. Pathophysiology: Cerebral Blood Flow & Perfusion Pressure",
        b: "• Cerebral Perfusion Pressure (CPP) Equation:\n  - CPP = Mean Arterial Pressure (MAP) - Intracranial Pressure (ICP) [or CVP, whichever is higher].\n  - Normal CPP: 60 to 80 mmHg. Critical threshold: CPP < 50 mmHg triggers cerebral ischemia and infarction.\n• Cerebral Blood Flow (CBF) Autoregulation:\n  - Normal CBF is 50 mL/100g brain tissue/min.\n  - Autoregulated across MAP 50 to 150 mmHg in normotensive adults.\n  - Autoregulation is IMPAIRED OR ABOLISHED within and around brain tumors (vasoparalysis): blood flow in the tumor bed is strictly pressure-passive!\n• Carbon Dioxide Reactivity (PaCO₂ Response):\n  - CBF changes by 3%–4% per 1 mmHg change in PaCO₂ (≈1–2 mL/100g/min per mmHg PaCO₂) across the physiological range (20–80 mmHg).\n  - Mild Hyperventilation (PaCO₂ 32–35 mmHg) induces cerebral arteriolar vasoconstriction, decreases Cerebral Blood Volume (CBV), and shrinks the brain within seconds."
      },
      {
        h: "3. Preoperative Evaluation & Cushing's Triad",
        b: "• Signs of Raised Intracranial Pressure:\n  - Early: Morning headache (worse with coughing/straining), projectile vomiting without nausea, papilledema on fundoscopy.\n  - Late / Impending Herniation (Cushing's Triad - Life-Threatening):\n    1. Hypertension (Reflex sympathetic surge to preserve CPP).\n    2. Bradycardia (Baroreceptor reflex triggered by high SBP).\n    3. Irregular Respiration (Brainstem compression of medullary respiratory centers).\n• Neuroimaging Review (CT / MRI):\n  - Note midline shift (> 5 mm indicates severe ICP and impending herniation), effacement of basal cisterns, compression of the third/lateral ventricles, and subfalcine or uncal herniation (ipsilateral dilated fixed pupil from CN III compression, contralateral hemiparesis)."
      },
      {
        h: "4. The 4-Step Brain Relaxation Protocol (Slack Brain Bundle)",
        b: "• When the surgeon opens the dura, the brain must be slack and sunken, not bulging or tense:\n  1. POSITIONING: Head elevated 15–30 degrees to maximize internal jugular venous drainage. Ensure neck is in neutral position without flexion, extension, or tight taping of ETT (prevents jugular venous compression!).\n  2. VENTILATION: Controlled hyperventilation to target PaCO₂ 32 to 35 mmHg. Avoid extreme hyperventilation (PaCO₂ < 28 mmHg causes severe vasoconstriction and ischemic tissue damage!).\n  3. OSMOTIC DIURETICS:\n     - MANNITOL (20% solution): 0.5 to 1.0 g/kg IV infused over 15–20 minutes at start of craniotomy. Creates osmotic gradient drawing water from uninjured brain tissue into intravascular space (onset 15 min, duration 4–6h).\n     - HYPERTONIC SALINE (3% NaCl): 3 mL/kg IV bolus. Highly effective for tight brain; rapidly expands intravascular volume and shrinks glial cells without systemic hypotension.\n  4. PHARMACOLOGICAL SUPPRESSION: Deepen anaesthesia with Propofol infusion or increase volatile agent (keep MAC < 1.0); administer IV Dexamethasone (8–16 mg IV) to reduce peritumoral vasogenic edema."
      },
      {
        h: "5. Detailed Induction & Maintenance Pharmacology",
        b: "• Induction Goals: Smooth induction preventing any coughing, bucking, or hypertensive surge (which spikes ICP) while avoiding hypotension (which drops CPP).\n• Blunting Laryngoscopy Response:\n  - Fentanyl 3–5 mcg/kg or Remifentanil 1 mcg/kg given 2 minutes prior, plus IV Lignocaine 1.5 mg/kg 90s prior to intubation.\n• Induction Agent of Choice:\n  - PROPOFOL (1.5–2.5 mg/kg): Drug of choice in neuroanaesthesia. Decreases Cerebral Metabolic Rate of Oxygen (CMRO₂), decreases CBF, and lowers ICP.\n  - THIOPENTONE (3–5 mg/kg): Potent neuroprotective agent; decreases CMRO₂ and ICP.\n  - KETAMINE: CONTRAINDICATED (dilates cerebral vessels, increases CMRO₂, spikes CBF and ICP).\n• Muscle Relaxants: Rocuronium (0.6–0.9 mg/kg) or Vecuronium (0.1 mg/kg). Succinylcholine causes a transient 5–10 mmHg rise in ICP (due to muscle spindle afferent stimulation); if used for difficult airway, defasciculate with a non-depolarizing relaxant.\n• Maintenance: Propofol/Remifentanil TIVA or Sevoflurane (0.5–0.8 MAC) in O₂/Air. AVOID Nitrous Oxide (N₂O increases CMRO₂, increases CBF, expands pneumocephalus, and worsens brain swelling)."
      },
      {
        h: "6. Emergence & Postoperative Neurological Assessment",
        b: "• Extubation Protocol:\n  - Goal: Immediate awake extubation allowing rapid neurological examination in the OR, but WITHOUT coughing, straining, or hypertensive spikes (which cause catastrophic postoperative intracranial hematoma formation!).\n  - Lignocaine 1.0–1.5 mg/kg IV or Dexmedetomidine 0.5 mcg/kg IV given 10 minutes prior to pin removal.\n• Postoperative Surveillance:\n  - Serial Glasgow Coma Scale (GCS) and pupillary light reflex tracking.\n  - Acute deterioration (drop in GCS ≥ 2 points, new pupil dilation) indicates postoperative surgical site hematoma, acute hydrocephalus, or cerebral edema; mandates immediate non-contrast head CT and emergency re-exploration."
      },
      {
        h: "7. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why is intraoperative fluid management strictly restricted to isotonic solutions in neurosurgery?\n    A: Because hypotonic fluids (e.g. Ringer's Lactate [273 mOsm/L], 5% Dextrose) decrease serum osmolarity, creating an osmotic gradient that drives water into brain tissue, exacerbating cerebral edema. Plasmalyte or 0.9% Normal Saline (308 mOsm/L) must be used.\n  - Q: What is the target serum osmolarity when using Mannitol?\n    A: Maintain serum osmolarity < 320 mOsm/L. Values > 320 mOsm/L induce acute tubular necrosis and renal failure.\n  - Q: How does volatile anesthetic affect cerebral autoregulation?\n    A: Volatile agents produce dose-dependent cerebral vasodilation. Below 1 MAC, vasoconstriction from mild hyperventilation preserves normal ICP. Above 1.0–1.5 MAC, intrinsic vasodilation overrides autoregulation, uncoupling CBF from CMRO₂ and increasing ICP."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 20, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 64, Elsevier, 2025/2026.",
      "Cottrell JE, Patel P. Cottrell and Patel's Neuroanesthesia, 6th ed. Elsevier."
    ]
  },

  // 14. POSTERIOR CRANIAL FOSSA (PCF) LESION & SITTING CRANIOTOMY
  {
    id: "case-posterior-cranial-fossa-lesion",
    cat: "case_neuro",
    name: "Posterior Cranial Fossa (PCF) Lesion & Sitting Position",
    short: "PCF Lesion & Sitting Craniotomy",
    tags: ["Neuro", "Posterior Fossa", "Sitting Position", "Venous Air Embolism", "PFO", "Brainstem", "Case Discussion"],
    tagline: "Venous Air Embolism detection & aspiration, PFO bubble contrast echo, brainstem hemodynamic reflexes & sitting position",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 21; Miller's Anesthesia, 10th ed., Ch. 64; Cottrell & Patel's Neuroanesthesia.",
    sections: [
      {
        h: "1. Definition, Surgical Anatomy & The Sitting Position Rationale",
        b: "• Definition: Lesions situated in the posterior cranial fossa (infratentorial space below the tentorium), including vestibular schwannomas (acoustic neuroma), cerebellar astrocytomas, medulloblastomas, and ependymomas.\n• Confined Anatomy: The posterior fossa is a rigid, non-yielding space housing the cerebellum, brainstem (pons and medulla), 4th ventricle, and lower cranial nerves (CN IX–XII). Even minor swelling rapidly causes tonsillar herniation through the foramen magnum and respiratory arrest.\n• Rationale for the Sitting Position:\n  - Advantages: Superb surgical access to midline structures, excellent gravitational venous and CSF drainage, clean operative field, reduced blood loss, preservation of facial cranial nerve anatomy.\n  - Hazards: VENOUS AIR EMBOLISM (VAE), paradoxical air embolism, postural hypotension, pneumocephalus, quadriplegia/cervical cord ischemia."
      },
      {
        h: "2. Pathophysiology of Venous Air Embolism (VAE) & Detection Hierarchy",
        b: "• Mechanism of VAE in Sitting Position:\n  - The operative surgical field is elevated 20–40 cm ABOVE the right atrium.\n  - Negative hydrostatic pressure inside non-collapsing suboccipital venous sinuses and diploic skull veins sucks atmospheric air into the venous circulation.\n  - Air enters the right atrium, travels to the right ventricle, and lodges in the pulmonary arterial microvasculature, producing mechanical obstruction, dead-space ventilation, hypoxemia, acute RV strain, and cardiovascular collapse.\n• Hierarchy of VAE Detection Sensitivity:\n  1. TRANSESOPHAGEAL ECHOCARDIOGRAPHY (TEE - Most Sensitive): Detects microbubbles as small as 0.02 mL/kg air (can visualize air entering right atrium).\n  2. PRECORDIAL DOPPLER ULTRASOUND (Most Practical Non-Invasive): Detects 0.05 mL/kg air. Emits characteristic roaring / washing-machine murmur. Probe placed at right sternal border (3rd to 6th intercostal space).\n  3. END-TIDAL CO₂ (EtCO₂ Monitoring): Sudden, unexplained DROP in EtCO₂ (due to acute increase in alveolar dead space ventilation) is the primary clinical monitor.\n  4. PULMONARY ARTERY PRESSURE (PAP): Rises due to microvascular occlusion.\n  5. LATE CLINICAL SIGNS: Mill-wheel murmur on esophageal stethoscope, hypotension, arterial desaturation, and cardiac arrest."
      },
      {
        h: "3. Preoperative Screening for Patent Foramen Ovale (PFO)",
        b: "• PARADOXICAL AIR EMBOLISM HAZARD:\n  - Normal adult prevalence of Patent Foramen Ovale (PFO) is 25%–30%.\n  - If venous air enters the right atrium in the presence of a PFO, even transient elevations in right atrial pressure (coughing, PEEP, VAE-induced RV strain) will force air across the septum into the left atrium and systemic circulation, causing fatal massive cerebral stroke or coronary air embolism.\n• Mandatory Preoperative Screening:\n  - Transthoracic or Transesophageal Echocardiography with AGITATED SALINE BUBBLE CONTRAST under Valsalva maneuver.\n  - Finding of PFO is an ABSOLUTE CONTRAINDICATION TO SITTING POSITION! (Patient must be operated in prone, lateral, or park-bench position)."
      },
      {
        h: "4. Step-by-Step VAE Treatment Protocol (Immediate Action Bundle)",
        b: "• If Venous Air Embolism is Detected Intraoperatively:\n  1. ALERT SURGICAL TEAM IMMEDIATELY: Surgeon floods surgical field with warm saline and packs wound with wet sponges to block air entry.\n  2. DISCONTINUE NITROUS OXIDE (N₂O): Switch to 100% Oxygen immediately (N₂O rapidly diffuses into air bubbles, expanding their volume by 3-fold!).\n  3. ASPIRATE AIR VIA MULTI-ORIFICE RIGHT ATRIAL CATHETER (Bunegin-Albin Catheter): Aspirate air directly from the junction of the superior vena cava and right atrium.\n  4. BILATERAL JUGULAR VEIN COMPRESSION: Compress internal jugular veins gently for 5–10 seconds; this raises intracranial venous pressure, causing blood to vent out of the open skull veins, allowing the surgeon to identify and coagulate/wax the open bone sinus.\n  5. FLUIDS & VASOPRESSORS: Rapid fluid infusion and Phenylephrine/Norepinephrine to support RV perfusion and systemic blood pressure.\n  6. RESCUE POSITIONING: If massive air lock produces cardiovascular collapse, place patient in Trendelenburg and Left Lateral Decubitus position (Durant's maneuver) to trap air in the RV apex away from the pulmonary outflow tract; initiate CPR."
      },
      {
        h: "5. Brainstem Reflexes & Cranial Nerve Monitoring",
        b: "• Surgical Manipulation of the Brainstem & Floor of 4th Ventricle:\n  - Manipulation of the Pons / Medulla triggers sudden severe hemodynamic reflexes:\n    * Trigeminal-Cardiac Reflex: Severe bradycardia, asystole, or ventricular ectopic beats.\n    * Vagal / Medullary Retraction: Acute profound hypertension followed by bradycardia or apnea.\n  - Mandatory Action: Inform surgeon IMMEDIATELY upon any abrupt change in heart rate or rhythm. The surgeon must release retractor pressure instantly.\n• Lower Cranial Nerve Dysfunction (CN IX, X, XII):\n  - Postoperative damage to glossopharyngeal and vagus nerves causes loss of protective gag and swallow reflexes, vocal cord paralysis, and severe aspiration. Patients MUST be assessed for intact gag reflex before extubation."
      },
      {
        h: "6. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Where should the tip of a multi-orifice central venous catheter be positioned for air aspiration in the sitting position?\n    A: At the junction of the superior vena cava and the right atrium (approximately 2 cm below the cavoatrial junction), verified by transesophageal echo, chest X-ray, or intravascular ECG.\n  - Q: Why is hyperflexion of the neck dangerous in the sitting position?\n    A: Extreme cervical flexion compresses the vertebral and anterior spinal arteries, precipitating cervical spinal cord ischemia and postoperative quadriplegia. Maintain at least 2 fingers' breadth (3 cm) between the chin and sternum.\n  - Q: What is tension pneumocephalus in the sitting position?\n    A: Air enters the subarachnoid space as CSF drains out (\"inverted pop bottle effect\"). Upon dural closure, air is trapped. If N₂O is used during emergence, it expands the trapped air, causing mass effect, herniation, and delayed awakening."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 21, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 64, Elsevier, 2025/2026.",
      "Cottrell JE, Patel P. Cottrell and Patel's Neuroanesthesia, 6th ed. Elsevier."
    ]
  },

  // 15. TRAUMATIC BRAIN INJURY (TBI) & EMERGENCY CRANIOTOMY
  {
    id: "case-traumatic-brain-injury-tbi",
    cat: "case_neuro",
    name: "Traumatic Brain Injury (TBI) & Emergency Craniotomy",
    short: "TBI & Emergency Craniotomy",
    tags: ["Neuro", "Trauma", "TBI", "ICP", "Secondary Injury", "C-Spine", "Case Discussion"],
    tagline: "Prevent secondary brain insults (hypoxia & hypotension), ATLS cervical spine clearance & rapid evacuation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 22; Miller's Anesthesia, 10th ed., Ch. 77 (Trauma Anesthesia); Brain Trauma Foundation Guidelines (4th ed.).",
    sections: [
      {
        h: "1. Definition, Classification & The Glasgow Coma Scale (GCS)",
        b: "• Definition: Acute intracranial injury resulting from external physical force, causing focal brain lesions (epidural hematoma [EDH], subdural hematoma [SDH], contusions) or diffuse axonal injury (DAI).\n• Glasgow Coma Scale (GCS - Range 3 to 15):\n  - Eye Opening (1–4): 4 = Spontaneous, 3 = To speech, 2 = To pain, 1 = None.\n  - Verbal Response (1–5): 5 = Oriented, 4 = Confused, 3 = Inappropriate words, 2 = Incomprehensible sounds, 1 = None.\n  - Motor Response (1–6): 6 = Obeys commands, 5 = Localizes pain, 4 = Normal flexion (withdrawal), 3 = Abnormal flexion (decorticate), 2 = Extension (decerebrate), 1 = None.\n• Severity Classification:\n  - Mild TBI: GCS 13–15.\n  - Moderate TBI: GCS 9–12.\n  - Severe TBI: GCS 3–8 (Mandates immediate endotracheal intubation!)."
      },
      {
        h: "2. Pathophysiology: Primary vs Secondary Brain Injury",
        b: "• Primary Brain Injury: Occurs at the moment of mechanical impact (tissue tearing, vascular disruption, contusion, diffuse axonal shearing). Irreversible; cannot be modified by the anesthesiologist.\n• Secondary Brain Injury: Ongoing, progressive cellular death occurring minutes, hours, and days post-injury driven by systemic insults (hypotension, hypoxia, hyperthermia, hyperglycemia, seizures) and intracranial insults (elevated ICP, hematoma expansion, edema, ischemia).\n• THE DEADLY SYSTEMIC DUO (Brain Trauma Foundation Guidelines):\n  1. HYPOTENSION (SBP < 100 mmHg in patients aged 50–69, or < 110 mmHg in ages 15–49 or ≥70): A single episode of hypotension DOUBLES mortality in severe TBI.\n  2. HYPOXEMIA (PaO₂ < 60 mmHg or SpO₂ < 90%): A single episode of hypoxemia DOUBLES mortality. When combined (Hypotension + Hypoxemia), mortality spikes by >300%–400%!"
      },
      {
        h: "3. Airway Management with Suspected Cervical Spine Injury",
        b: "• Cervical Spine Clearance Rule: ALL patients with blunt head trauma MUST be assumed to have an unstable cervical spine fracture until proven otherwise radiologically.\n• Rapid Sequence Intubation with Manual In-Line Stabilization (MILS):\n  - Remove anterior collar while an assistant maintains rigid manual in-line axial stabilization (preventing neck flexion, extension, or rotation).\n  - Video Laryngoscopy (Glidescope / C-MAC with hyperangulated blade): Gold standard; achieves excellent glottic visualization without requiring cervical extension or alignment of optical axes.\n  - Pharmacological Protection: Pre-treat with Fentanyl (3 mcg/kg) or Lignocaine (1.5 mg/kg) to blunt intracranial pressure spikes during laryngoscopy.\n  - Induction: Ketamine (1.5–2 mg/kg) or Etomidate (0.2–0.3 mg/kg) if hemodynamically unstable. Succinylcholine (1.5 mg/kg) or Rocuronium (1.2 mg/kg)."
      },
      {
        h: "4. Target Resuscitation Parameters (BTF 4th Edition Guidelines)",
        b: "• Brain Trauma Foundation (BTF) Evidence-Based Targets:\n  1. SBP: Maintain ≥ 100 mmHg (ages 50–69) or ≥ 110 mmHg (ages 15–49 or ≥70).\n  2. Mean Arterial Pressure (MAP): Target > 80–90 mmHg.\n  3. Intracranial Pressure (ICP): Keep < 20 to 22 mmHg.\n  4. Cerebral Perfusion Pressure (CPP): Maintain 60 to 70 mmHg (avoid CPP < 50 or > 70 mmHg).\n  5. Arterial Blood Gas: PaO₂ > 100 mmHg; PaCO₂ 35 to 40 mmHg (eucapnia). Strictly avoid prophylactic hyperventilation (PaCO₂ < 30 mmHg causes intense cerebral vasoconstriction and worsens ischemic brain injury!).\n  6. Blood Glucose: Maintain 140–180 mg/dL (hyperglycemia accelerates lactic acidosis in ischemic neurons; hypoglycemia causes neuronal death).\n  7. Core Temperature: Normothermia (36.0°C–37.0°C). Prevent fever aggressively (each 1°C rise in temperature increases CMRO₂ by 7%–8%)."
      },
      {
        h: "5. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What is the difference between Epidural and Subdural Hematoma?\n    A: Epidural Hematoma (EDH) is arterial (middle meningeal artery), biconvex/lenticular on CT, does not cross sutures, and classic lucid interval. Subdural Hematoma (SDH) is venous (tearing of bridging cortical veins), crescent-shaped, crosses suture lines, and carries much higher mortality due to underlying parenchymal injury.\n  - Q: Why is Ketamine now considered safe in TBI?\n    A: Historically thought to increase ICP, recent clinical trials demonstrate that when combined with controlled mechanical ventilation and a benzodiazepine/propofol, Ketamine maintains MAP and cerebral perfusion pressure without adverse effects on ICP, making it ideal in hypotensive polytrauma TBI.\n  - Q: What are the first-line osmotic agents for acutely raised ICP in TBI?\n    A: Hypertonic Saline (3% NaCl, 250 mL bolus) or Mannitol (20%, 0.5–1.0 g/kg). Hypertonic saline is preferred if the patient is hypotensive, as it expands intravascular volume while lowering ICP."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 22, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 77, Elsevier, 2025/2026.",
      "Carney N, et al. Guidelines for the Management of Severe Traumatic Brain Injury, 4th ed. Neurosurgery 2017;80(1):6-15."
    ]
  },

  // 16. HYDROCEPHALUS & VP SHUNT
  {
    id: "case-hydrocephalus-vp-shunt",
    cat: "case_neuro",
    name: "Hydrocephalus & Ventriculoperitoneal (VP) Shunt",
    short: "Hydrocephalus & VP Shunt",
    tags: ["Neuro", "Pediatric", "Hydrocephalus", "VP Shunt", "ICP", "Pneumoperitoneum", "Case Discussion"],
    tagline: "Sun-setting sign, CSF dynamics, laparoscopic peritoneal tunneling & post-shunt subdural hematoma",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 23; Miller's Anesthesia, 10th ed., Ch. 72 (Anesthesia for Pediatric Neurosurgery).",
    sections: [
      {
        h: "1. Definition, CSF Dynamics & Classification",
        b: "• Definition: Excessive accumulation of Cerebrospinal Fluid (CSF) within the cerebral ventricular system, causing ventriculomegaly and elevated intracranial pressure.\n• Normal CSF Dynamics:\n  - Formed primarily by the choroid plexus (epiependymal lining of lateral, 3rd, and 4th ventricles) at a rate of 0.35 mL/min (≈20 mL/hr or 500 mL/day).\n  - Circulation Pathway: Lateral ventricles -> Foramen of Monro -> Third ventricle -> Aqueduct of Sylvius -> Fourth ventricle -> Foramina of Luschka and Magendie -> Subarachnoid space -> Reabsorbed via arachnoid granulations into superior sagittal sinus.\n• Classification:\n  1. Communicating (Non-Obstructive): Impaired CSF reabsorption at arachnoid villi (post-meningitis, subarachnoid hemorrhage).\n  2. Non-Communicating (Obstructive): Physical blockage within ventricular pathways (aqueductal stenosis, Chiari malformation, Dandy-Walker cyst, tumor)."
      },
      {
        h: "2. Clinical Manifestations in Infants & Children",
        b: "• Clinical Hallmarks in Infants (Open Fontanelles):\n  - Tense, bulging anterior fontanelle, split/splayed cranial sutures, progressive macrocephaly (>98th percentile head circumference), dilated scalp veins.\n  - \"Sun-Setting Sign\": Impaired upward gaze with sclera visible above the iris (secondary to tectal plate compression of midbrain CN III/IV pathways).\n  - High-pitched cephalic cry, irritability, vomiting, poor feeding, bradycardia, apnea.\n• Older Children (Closed Sutures): Severe morning headache, projectile vomiting, papilledema, ataxia, and lethargy."
      },
      {
        h: "3. Intraoperative Anesthetic Considerations during VP Shunting",
        b: "• Positioning & Airway Safety:\n  - Supine position with head rotated to opposite side; shoulder roll placed to expose tunneling route from occiput/frontal burr hole down neck and chest to abdomen.\n  - Endotracheal tube MUST be meticulously secured: Head rotation and neck tunneling can easily kink or accidentally extubate the child!\n• Tunneling Phase Hazards:\n  - Subcutaneous tunneling of the distal shunt catheter down the neck and anterior chest is intensely stimulating: deepen anesthesia to prevent sudden sympathetic spikes and intracranial pressure surges.\n• Peritoneal Insertion & Laparoscopic Insufflation:\n  - Laparoscopic-assisted peritoneal entry creates pneumoperitoneum: CO₂ insufflation raises intra-abdominal pressure (IAP). High IAP transmits retrogradely through the catheter, temporarily increasing ICP and reducing pulmonary compliance."
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What is the most dangerous complication of sudden, over-rapid CSF decompression during ventricular cannulation?\n    A: Acute subdural hematoma. Rapid collapse of the distended cerebral cortex causes tearing of fragile bridging cortical veins between the brain and dural sinuses.\n  - Q: What are the clinical signs of an acute VP shunt malfunction?\n    A: Inability to pump the shunt reservoir, irritability, recurrent projectile vomiting, headache, sun-setting sign, and lethargy. Urgent head CT demonstrates acute ventriculomegaly."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 23, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 72, Elsevier, 2025/2026."
    ]
  },

  // 17. MENINGOMYELOCELE & SPINAL DYSRAPHISM
  {
    id: "case-meningomyelocele-repair",
    cat: "case_neuro",
    name: "Meningomyelocele & Spinal Dysraphism",
    short: "Meningomyelocele Repair",
    tags: ["Neuro", "Pediatric", "Meningomyelocele", "Chiari II", "Latex Allergy", "Prone Position", "Case Discussion"],
    tagline: "Latex-free environment, doughnut prone induction, Chiari II stridor & neonatal thermoregulation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 24; Miller's Anesthesia, 10th ed., Ch. 72.",
    sections: [
      {
        h: "1. Definition, Neural Tube Defects & The Chiari II Association",
        b: "• Definition: Congenital spinal dysraphism resulting from failure of neural tube closure during the 4th week of embryonic development, leading to herniation of the meninges and spinal cord/nerve roots through a vertebral defect.\n• Chiari II Malformation (Associated in >90% of Cases):\n  - Downward herniation of cerebellar vermis, tonsils, and medulla oblongata through the foramen magnum into the upper cervical spinal canal.\n  - Clinical Consequences: Stridor, vocal cord paralysis, central apnea, neurogenic dysphagia, and progressive obstructive hydrocephalus."
      },
      {
        h: "2. The Mandatory Latex-Free Protocol",
        b: "• Severe Latex Allergy Predisposition:\n  - Children with meningomyelocele have a >50%–70% lifetime incidence of severe, life-threatening Type I IgE-mediated LATEX ANAPHYLAXIS (due to early and repeated mucosal exposure from frequent surgeries, Foley catheterization, and clean intermittent catheterization).\n• Strict Precautions:\n  - MANDATORY 100% LATEX-FREE OPERATING ROOM from birth: Latex-free gloves, tourniquets, breathing circuits, stopcocks, syringes, and wound drapes. First case on the morning surgical schedule."
      },
      {
        h: "3. Airway Management, Doughnut Induction & Prone Positioning",
        b: "• The Doughnut Intubation Technique:\n  - The child CANNOT be placed flat on their back: pressure on the raw, open neural placode ruptures the sac, leaks CSF, damages delicate neural tissue, and causes ascending bacterial meningitis.\n  - Technique: Place the neonate supine on a padded sterile ring / \"doughnut\" (sponge or cotton roll) that cradles the meningomyelocele sac in the center without touching it, allowing safe mask ventilation and endotracheal intubation. (Alternatively, perform induction in lateral decubitus position).\n• Prone Positioning for Surgery:\n  - Meticulously pad eyes, chin, and chest rolls; ensure abdomen hangs free without compression (abdominal compression engorges epidural venous plexus, causing massive surgical bleeding and impairing ventilation).\n• Neonatal Thermoregulation & Blood Loss Monitoring:\n  - High surface area to body weight ratio: Keep OR temperature 24°C–26°C, use forced-air warming blanket, warm all irrigation and IV fluids.\n  - Blood Volume: Total blood volume is only 80–85 mL/kg. Accurate measurement of suction canisters and weighing of sponges is mandatory."
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What preoperative screening is required prior to meningomyelocele repair?\n    A: Cranial ultrasound to assess for ventriculomegaly / hydrocephalus, and evaluation for Chiari II symptoms (stridor, vocal cord dysfunction, apnea).\n  - Q: Why is surgical repair performed within the first 24 to 48 hours of life?\n    A: To prevent ascending bacterial infection (meningitis/ventriculitis) and limit progressive neural tissue dessication and trauma."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 24, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 72, Elsevier, 2025/2026."
    ]
  }
];
