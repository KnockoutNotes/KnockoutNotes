/* ==========================================================================
   KNOCKOUTNOTES — Anaesthesia Workstation data model (ventilator-data.js)

   Single generic, representative anaesthesia workstation (no manufacturer
   identified). Component list, terminology and front/rear grouping follow
   the reference the user supplied verbatim — nothing here is invented
   beyond standard, textbook-level anaesthesia equipment teaching content
   (function, generic safety notes, viva-style prompts).

   Each component has:
     id           - stable slug, used by ventilator-scene.js as the hotspot key
     name         - display name (matches the reference terminology)
     view         - "front" | "rear" (which camera preset it is easiest to see from)
     system       - grouping used for the sidebar
     summary      - one-line description
     function     - short paragraph on what it does / why it matters
     safety       - a generic safety/practice note (standard teaching, not machine-specific)
     viva         - { prompt, answer } — a classic viva-style Q&A for the Quiz mode
     position     - {x,y,z} approximate marker anchor in the scene's local model
                    space (metres, roughly a 0-1.8m tall workstation centred at
                    the origin). These are placeholder anchors for the stand-in
                    silhouette and are the ONE thing that will need re-tuning
                    once the real .glb is dropped in — everything else (data,
                    UI, quiz, camera logic) is independent of exact geometry.
                    Use the hidden calibration mode (?calibrate=1) to read off
                    new coordinates by clicking the model.
   ========================================================================== */

window.VentilatorData = {
  machineName: "Anaesthesia Workstation",
  machineKicker: "GENERIC / REPRESENTATIVE — 3D INTERACTIVE EXPLORER",
  disclaimer: "Generic, representative anaesthesia workstation for teaching purposes. Not modelled on, and not a substitute for, any specific manufacturer's device or manual. Verify against your own department's equipment and current departmental protocols before clinical use.",

  systems: {
    gasSupply: "Gas Supply",
    pressure: "Pressure Monitoring",
    flowControl: "Flow Control & Vaporizers",
    breathing: "Breathing Circuit",
    ventilator: "Ventilator & Displays",
    auxOutlet: "Auxiliary Outlet",
    power: "Power",
    mobility: "Mobility & Frame",
    storage: "Storage"
  },

  components: [
    {
      id: "cylinder-yoke", name: "Cylinder Yoke Area", view: "rear", system: "gasSupply",
      summary: "Mounting yokes that hold the back-up gas cylinders against the machine frame.",
      function: "Each yoke uses a pin-index safety system (PISS) so a cylinder can only be seated on the yoke matching its gas, preventing an O2 cylinder from being fitted where N2O/air belongs, and vice versa.",
      safety: "Always check the cylinder contents label and pressure gauge before use — pin-index prevents wrong-gas fitting, but does not confirm cylinder content is correct or verify remaining volume.",
      viva: { prompt: "What safety system prevents an incorrect cylinder being fitted to a yoke, and what does it NOT protect against?", answer: "The pin-index safety system (PISS) — two pins on the yoke correspond to specific holes on the cylinder valve block for each gas. It prevents physical mis-connection, but does not prevent a cylinder being mislabelled or a yoke washer being removed to force a wrong fit." },
      position: { x: -0.32, y: 0.62, z: -0.38 }
    },
    {
      id: "rear-cylinders", name: "Rear Cylinders", view: "rear", system: "gasSupply",
      summary: "The back-up gas cylinders (typically O2 ± N2O/Air) carried on the machine as a reserve supply.",
      function: "Provide gas supply if the piped hospital supply fails. Cylinder pressure falls roughly linearly with content for a gas stored purely as a compressed gas (e.g. O2), so pressure can estimate remaining volume; for a liquefied gas the pressure stays near-constant until the liquid phase is nearly exhausted.",
      safety: "Cylinders should be checked and left closed during normal pipeline-supplied operation, opened only to confirm reserve availability or when the pipeline fails — habitually running from cylinder can deplete the reserve unnoticed.",
      viva: { prompt: "Why can't cylinder pressure be used to estimate remaining volume for N2O the way it can for O2?", answer: "O2 is stored as a compressed gas, so Boyle's law applies and pressure falls proportionally with content. N2O is stored partly as liquid; while liquid remains, pressure stays roughly constant (reflecting vapour pressure), only falling once all the liquid has vaporised — so a normal-looking gauge can precede a sudden empty cylinder." },
      position: { x: 0.0, y: 0.55, z: -0.42 }
    },
    {
      id: "pipeline-conn", name: "Pipeline Connections", view: "rear", system: "gasSupply",
      summary: "Hose connections to the hospital's piped medical gas supply.",
      function: "Each gas (O2, N2O, Air) uses a non-interchangeable Schrader-type probe and colour-coded hose (per local/international standard) so the correct hose can only physically connect to its matching wall or pendant outlet.",
      safety: "Non-interchangeable connectors are a passive safety feature — they should never be adapted, forced, or bypassed to make a hose fit a mismatched outlet.",
      viva: { prompt: "What is the purpose of non-interchangeable (gas-specific) pipeline connectors?", answer: "They physically prevent a hose for one gas from being connected to the pipeline outlet for a different gas, protecting against delivery of the wrong gas at the pipeline-to-machine interface." },
      position: { x: -0.05, y: 0.75, z: -0.42 }
    },
    {
      id: "hose-hooks", name: "Hose Hooks", view: "rear", system: "storage",
      summary: "Hooks on the rear/side of the frame for coiling and storing spare hoses.",
      function: "Keep spare gas or suction hoses tidy and off the floor when not connected, reducing trip hazards and hose damage.",
      safety: "Inspect stored hoses periodically for kinks, cracking or perishing — a hose that looks fine coiled on a hook can still be degraded internally.",
      viva: null,
      position: { x: 0.34, y: 0.9, z: -0.34 }
    },
    {
      id: "scavenging", name: "Scavenging System", view: "rear", system: "breathing",
      summary: "Removes excess and expired anaesthetic gas from the breathing circuit (via the APL valve/ventilator exhaust) to a disposal or exhaust route.",
      function: "Reduces theatre staff exposure to trace anaesthetic gases by actively or passively conducting waste gas away from the breathing system, typically to a hospital extraction system.",
      safety: "A disconnected, blocked, or incorrectly assembled scavenging system can cause either environmental gas leakage (if disconnected) or dangerous circuit pressurisation (if the exhaust path is blocked) — check patency at machine check.",
      viva: { prompt: "What are the two main failure modes of a scavenging system, and why is a blocked exhaust the more dangerous of the two?", answer: "Disconnection (waste gas vents into theatre — occupational exposure risk but not usually a direct patient hazard) versus obstruction (waste gas cannot escape, raising circuit and airway pressure — a direct barotrauma risk to the patient)." },
      position: { x: 0.28, y: 0.68, z: -0.4 }
    },
    {
      id: "usb-rs232", name: "USB / Software-Update & RS-232 Area", view: "rear", system: "power",
      summary: "Connectivity area used for software/firmware updates and for interfacing monitored data (RS-232 serial or USB) to external systems.",
      function: "Allows biomedical/service engineers to update device software and allows the workstation to export monitored parameters to a hospital data or anaesthesia information management system (AIMS).",
      safety: "Software updates and data interfacing are a servicing function, not a routine anaesthetist task — this area should not be accessed intraoperatively.",
      viva: null,
      position: { x: -0.3, y: 0.95, z: -0.35 }
    },

    {
      id: "flowhead", name: "Flowhead Assembly", view: "front", system: "flowControl",
      summary: "The front control head housing the flow-control valves/flowmeters that set the fresh gas mixture.",
      function: "Operator adjusts flow-control knobs for each gas here; the resulting fresh gas mixture (O2 ± Air/N2O) passes onward to the vaporizer(s) and then to the common gas outlet or breathing circuit.",
      safety: "Modern workstations electronically or mechanically link O2 flow so the fresh-gas mixture cannot fall below roughly 21-25% O2 — know how your specific machine indicates and enforces this before relying on it.",
      viva: { prompt: "What minimum-FiO2 safety feature is expected on a modern flowmeter/flow-control system?", answer: "An O2:N2O (or O2:other gas) proportioning/anti-hypoxia linkage that mechanically or electronically prevents the total fresh gas mixture falling below a safe minimum FiO2 (commonly around 21–25%), regardless of how the individual flow controls are set." },
      position: { x: 0.0, y: 1.05, z: 0.28 }
    },
    {
      id: "gauge-pipeline", name: "Pipeline Pressure Gauges", view: "front", system: "pressure",
      summary: "Display the supply pressure being delivered from the hospital pipeline system for each gas.",
      function: "Normal hospital pipeline pressure is typically around 400–420 kPa (roughly 4 bar); a reading outside this range suggests a pipeline supply problem upstream of the machine.",
      safety: "Checking pipeline pressures is a standard part of the pre-use machine check — a low or absent reading should prompt switching to cylinder back-up and reporting the fault.",
      viva: { prompt: "What pipeline pressure is expected on the pipeline pressure gauges in a normally functioning system?", answer: "Approximately 400–420 kPa (about 4 bar/60 psi) for a standard hospital medical gas pipeline system; the exact expected value should be checked against local standards." },
      position: { x: -0.18, y: 1.12, z: 0.3 }
    },
    {
      id: "gauge-cylinder", name: "Cylinder Pressure Gauges", view: "front", system: "pressure",
      summary: "Display the pressure remaining in the back-up reserve cylinders.",
      function: "Used to confirm a reserve gas supply is present and adequate, and to monitor cylinder use if the machine is running from cylinder supply.",
      safety: "Check at the start of every list — a cylinder found empty only when the pipeline fails intraoperatively is a preventable critical incident.",
      viva: null,
      position: { x: 0.18, y: 1.12, z: 0.3 }
    },
    {
      id: "paw-gauge", name: "PAW Gauge", view: "front", system: "pressure",
      summary: "Displays proximal/peak airway pressure (PAW) measured in the breathing circuit near the patient connection.",
      function: "Continuous PAW monitoring helps detect circuit disconnection (sudden fall), obstruction, breath-stacking, or excessive pressure (sudden rise) during ventilation.",
      safety: "A high-pressure alarm threshold should always be set appropriately for the patient — both for detecting barotrauma risk and for detecting a stuck APL/scavenging pathway.",
      viva: { prompt: "Name two circuit problems that a sudden change in PAW can reveal, one for a sudden fall and one for a sudden rise.", answer: "A sudden fall in PAW suggests circuit disconnection or a major leak; a sudden rise suggests obstruction, breath-stacking, or a blocked/misconfigured exhaust (APL valve or scavenging) pathway." },
      position: { x: 0.05, y: 1.18, z: 0.29 }
    },
    {
      id: "system-switch", name: "System Switch", view: "front", system: "power",
      summary: "The master on/off control for the workstation's pneumatic and/or electronic systems.",
      function: "Powers up the workstation's electronic displays, ventilator, and monitoring; on some workstations also arms pneumatic subsystems.",
      safety: "Should be part of a documented start-up/pre-use checklist sequence (e.g. following AAGBI/WFSA-style checks), not simply flicked on assuming all subsystems self-verify silently.",
      viva: null,
      position: { x: -0.34, y: 0.95, z: 0.25 }
    },
    {
      id: "acgo", name: "ACGO Port & Switch", view: "front", system: "auxOutlet",
      summary: "Auxiliary Common Gas Outlet and its selector switch, used to deliver fresh gas to a system other than the machine's integrated breathing circuit (e.g. a separate circuit, Mapleson system, or resuscitation device).",
      function: "Selecting the ACGO diverts fresh gas away from the ventilator/breathing circuit path to the auxiliary outlet; some workstations mechanically disable the ventilator while ACGO is selected to prevent it cycling against a closed or absent circuit.",
      safety: "Always confirm which outlet (integrated circuit vs ACGO) is active before connecting a breathing system — using the wrong outlet can mean gas is delivered nowhere useful, or the ventilator cycles with no circuit attached.",
      viva: { prompt: "Why do many workstations automatically disable the ventilator when the ACGO is selected?", answer: "Because gas flow is diverted away from the integrated breathing circuit to the auxiliary outlet — if the ventilator continued cycling against the now-disconnected circuit path, it could cycle against a closed system or deliver no ventilation at all, so disabling it removes that hazard." },
      position: { x: 0.32, y: 0.95, z: 0.26 }
    },
    {
      id: "selectatec", name: "Selectatec Manifold & Vaporizers", view: "front", system: "flowControl",
      summary: "The mounting rail and interlock manifold holding the anaesthetic vaporizer(s) in the fresh gas pathway.",
      function: "The interlock mechanism ensures only one vaporizer can be switched 'on' at a time, and that a vaporizer cannot be removed while switched on, preventing simultaneous or accidental delivery of two volatile agents.",
      safety: "Check vaporizers are correctly seated and locked, filled with the correct agent, and that the interlock prevents more than one being active — this is a standard pre-use check item.",
      viva: { prompt: "What does the Selectatec-type interlock mechanism specifically prevent?", answer: "It prevents more than one vaporizer being switched on simultaneously, and prevents a vaporizer being removed from the manifold while it is switched on — protecting against delivery of two agents at once or an open, unmounted vaporizer leaking agent." },
      position: { x: 0.0, y: 0.78, z: 0.3 }
    },
    {
      id: "o2-flush", name: "Oxygen Flush", view: "front", system: "flowControl",
      summary: "A control that delivers high-flow (commonly 35–75 L/min) O2 directly to the common gas outlet, bypassing the flowmeters and vaporizer(s).",
      function: "Used to rapidly fill/flush the breathing circuit with pure O2, e.g. before induction or to quickly increase circuit volume/FiO2.",
      safety: "Because O2 flush bypasses the vaporizer, it delivers no anaesthetic agent — do not use it as a substitute for adequate anaesthetic depth, and be aware that flushing at high fresh gas flow can transiently increase circuit pressure if used with the circuit occluded.",
      viva: { prompt: "Why does using the oxygen flush not affect anaesthetic depth?", answer: "The O2 flush routes gas directly to the common gas outlet, bypassing both the flow-control/vaporizer pathway — so it delivers 100% O2 with no volatile agent, diluting rather than deepening anaesthesia if used carelessly." },
      position: { x: -0.28, y: 0.82, z: 0.3 }
    },
    {
      id: "breathing-circuit", name: "Breathing Circuit (with CO2 bypass)", view: "front", system: "breathing",
      summary: "The patient-side circuit that carries inspiratory and expiratory gas, including a CO2 absorber bypass pathway.",
      function: "In circle-system workstations, exhaled gas normally passes through a CO2 absorber (soda lime or similar) so it can be rebreathed; a bypass allows the absorber to be taken out of the gas path (e.g. for absorber changes) without breaking the circuit.",
      safety: "Monitor inspired/end-tidal CO2 continuously — a bypassed or exhausted absorber allows CO2 rebreathing, which will present as a rising inspired CO2 on capnography before it is otherwise obvious.",
      viva: { prompt: "What is the earliest reliable sign that CO2 absorption has failed or been bypassed?", answer: "A rise in inspired CO2 (the baseline of the capnography trace failing to return to zero) — this precedes clinical signs and is the reason continuous capnography is a mandatory monitoring standard." },
      position: { x: 0.0, y: 0.9, z: 0.35 }
    },
    {
      id: "vent-display", name: "Ventilator Display", view: "front", system: "ventilator",
      summary: "Shows the ventilator's set parameters and the patient's monitored respiratory values.",
      function: "Displays settings such as tidal volume, respiratory rate, PEEP and FiO2, and monitored values such as measured PAW, minute volume and, on integrated systems, capnography.",
      safety: "Confirm ventilator settings against the intended plan at the start of ventilation and after any mode change — an unnoticed unit or mode mismatch is a recognised source of ventilation incidents.",
      viva: null,
      position: { x: 0.0, y: 1.15, z: 0.05 }
    },
    {
      id: "handle", name: "Ergonomic Handle", view: "front", system: "mobility",
      summary: "A handle designed for manoeuvring the workstation between locations.",
      function: "Allows safe, controlled repositioning of the (often heavy, gas-cylinder-laden) machine without pulling on hoses, cables or the monitor arm.",
      safety: "Disconnect or account for trailing hoses/cables before moving the machine, and move slowly — cylinders and integrated monitors add significant mass and a raised centre of gravity.",
      viva: null,
      position: { x: 0.0, y: 0.55, z: 0.36 }
    },
    {
      id: "casters", name: "Wheel Caster & Brake", view: "front", system: "mobility",
      summary: "Mobility wheels with locking brakes at the base of the machine.",
      function: "Allow the machine to be moved and then locked securely in position during use.",
      safety: "Always engage brakes before use — an unlocked machine can roll during patient positioning or if leant on, risking line/circuit disconnection or the machine itself tipping.",
      viva: null,
      position: { x: 0.22, y: 0.08, z: 0.3 }
    },
    {
      id: "storage", name: "Storage Space", view: "front", system: "storage",
      summary: "Drawer or shelf space built into the machine frame for consumables and accessories.",
      function: "Keeps commonly needed airway/circuit consumables and accessories within immediate reach during a case.",
      safety: "Avoid overloading drawers, which can affect the machine's stability, and keep contents organised so emergency equipment (e.g. a spare circuit or airway device) can be found without delay.",
      viva: null,
      position: { x: 0.0, y: 0.35, z: 0.34 }
    },
    {
      id: "aux-power", name: "Auxiliary Power & Switch", view: "front", system: "power",
      summary: "A backup electrical power supply (internal battery) and its associated switch/indicator.",
      function: "Maintains power to the ventilator, monitor and displays for a limited time if mains electrical power is lost, so ventilation and monitoring are not immediately interrupted.",
      safety: "Battery back-up has a finite runtime — know your machine's rated back-up duration and treat a mains power failure as time-critical, not as a non-event.",
      viva: { prompt: "What should prompt concern immediately after a mains power failure on a workstation with battery back-up?", answer: "That battery back-up is time-limited — ventilation/monitoring continuing on battery is not a reason to delay restoring mains power or escalating, since the back-up will eventually be exhausted." },
      position: { x: -0.2, y: 0.55, z: 0.32 }
    },
    {
      id: "flip-shelf", name: "Flip-up Shelf", view: "front", system: "storage",
      summary: "A hinged worktop surface that can be flipped up out of the way or down for use as a working surface.",
      function: "Provides a temporary flat surface (e.g. for a laryngoscope, drugs tray, or notes) close to the machine without permanently occupying space.",
      safety: "Do not load beyond the manufacturer's rated weight, and ensure it is fully latched down before placing equipment on it.",
      viva: null,
      position: { x: 0.3, y: 0.5, z: 0.3 }
    },
    {
      id: "task-light", name: "Task Light", view: "front", system: "mobility",
      summary: "A light fitted to the machine to illuminate the working area.",
      function: "Improves visibility of the airway/working field, particularly useful in a darkened theatre or during out-of-hours work.",
      safety: "Check it is functional as part of the pre-use check if your practice relies on it for airway work.",
      viva: null,
      position: { x: 0.0, y: 1.3, z: 0.15 }
    }
  ],

  // Generic gas-pathway staging used by the "Systems Guide" panel — standard
  // anaesthesia-machine physiology (high/intermediate/low pressure systems),
  // expressed only in terms of the components already listed above.
  systemsGuide: [
    {
      id: "high", label: "High-Pressure System", range: "Cylinder pressure, up to ~13,700 kPa (O2)",
      explain: "From the gas cylinder to the pressure regulator. Gas here is at full cylinder pressure, stepped down by a regulator before entering the intermediate-pressure system.",
      componentIds: ["rear-cylinders", "cylinder-yoke"]
    },
    {
      id: "intermediate", label: "Intermediate-Pressure System", range: "~400 kPa (pipeline / post-regulator)",
      explain: "From the pipeline inlet (or the cylinder pressure regulator outlet) to the flow-control valves. This is the pressure delivered by the hospital pipeline, and the regulated pressure downstream of a cylinder regulator.",
      componentIds: ["pipeline-conn", "gauge-pipeline", "gauge-cylinder"]
    },
    {
      id: "low", label: "Low-Pressure System", range: "Just above atmospheric, downstream of the flow-control valves",
      explain: "From the flow-control valves through the flowmeters, vaporizer(s), and out through the common gas outlet to the breathing circuit — the pressure the patient's airway actually experiences.",
      componentIds: ["flowhead", "selectatec", "o2-flush", "breathing-circuit", "paw-gauge"]
    },
    {
      id: "exhaust", label: "Exhaust / Scavenging",
      range: "Waste gas leaving the breathing circuit",
      explain: "Excess and expired gas leaves the circuit via the APL valve or ventilator exhaust and is carried away by the scavenging system, rather than venting into theatre.",
      componentIds: ["scavenging"]
    }
  ]
};
