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
     schematics   - optional array of schematic ids (see ventilator-schematics.js)
                    that this component has contextual educational diagrams for.
     gasZone      - optional "high" | "intermediate" | "low", used to highlight the
                    matching zone in the gas-system schematic when opened from here.
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
  disclaimer: "Generic educational anaesthesia workstation representation. Appearance and component arrangement may vary between manufacturers and models. Not a substitute for any specific manufacturer's device or manual — verify against your own department's equipment and current departmental protocols before clinical use.",

  systems: {
    gasSupply: "Gas Supply & Cylinders",
    pressure: "Pressure Monitoring",
    flowControl: "Flowmeters & Vaporizers",
    breathing: "Breathing System & Scavenging",
    ventilator: "Ventilator & Monitors",
    auxOutlet: "Auxiliary Outlets & Emergency",
    power: "Power & Electronics",
    mobility: "Frame & Mobility",
    storage: "Storage & Accessories"
  },

  components: [
    {
      id: "patient-monitor", name: "Patient Monitor (Physiological Monitor)", view: "front", system: "ventilator",
      summary: "Multi-parameter physiological monitor mounted on an articulated swing arm, displaying vital signs and continuous gas analysis.",
      function: "Displays real-time patient parameters including ECG, SpO2, NIBP, invasive arterial/CVP pressures, core temperature, and continuous gas analysis (EtCO2, inspired O2, and end-tidal volatile anaesthetic agent concentrations).",
      safety: "Must be positioned within clear line of sight throughout the case. Disconnection or silenced alarms must be investigated immediately.",
      viva: { prompt: "What are the mandatory clinical monitoring standards recommended by the AAGBI / ASA during anaesthesia?", answer: "Continuous presence of an anaesthetist, pulse oximetry (SpO2), non-invasive blood pressure, ECG, continuous capnography (EtCO2), inspired oxygen concentration, and airway pressure monitoring. Temperature and volatile agent concentration monitoring are required for all general anaesthetics." },
      position: { x: -0.32, y: 1.46, z: 0.18 }
    },
    {
      id: "flowhead", name: "Flowmeters (O2, N2O & Air Rotameter Bank)", view: "front", system: "flowControl",
      summary: "Dual-tapered flowmeter tubes (rotameters) and needle control valves for setting fresh gas mixture flow rates.",
      function: "Individually meters Oxygen, Nitrous Oxide, and Medical Air flows. The bobbin or float indicates flow rate in L/min. Oxygen is always placed downstream (furthest right in UK/ISO convention) to reduce the risk of hypoxic gas delivery if an upstream tube leaks.",
      safety: "Modern machines feature a mechanical (e.g. Link-25) or pneumatic anti-hypoxia proportioning device preventing delivery of less than 21–25% O2 when N2O is used.",
      viva: { prompt: "Why is the oxygen flowmeter always positioned downstream of all other gas flowmeters in the rotameter bank?", answer: "To minimise the risk of a hypoxic mixture: if a crack or leak develops in an upstream tube (e.g. N2O), gas leaks out before reaching the patient; if O2 were upstream, O2 would escape while N2O continued to the patient." },
      schematics: ["gas-system"], gasZone: "low",
      position: { x: -0.15, y: 1.30, z: 0.22 }
    },
    {
      id: "gauge-pipeline", name: "Pipeline Pressure Gauges (400–420 kPa)", view: "front", system: "pressure",
      summary: "Bourdon tube pressure gauges monitoring supply pressure from the central hospital piped medical gas pipeline system.",
      function: "Indicates pipeline supply pressure for Oxygen, Nitrous Oxide, and Air. Normal hospital pipeline operating pressure is 400–420 kPa (~4 bar or 50–60 psi). A pressure drop indicates upstream pipeline failure.",
      safety: "Checking pipeline supply pressure is the first step of the pre-use machine check. If pipeline pressure drops below 280 kPa, an audible low-pressure whistle/alarm sounds and fail-safe valves cut off N2O flow.",
      viva: { prompt: "What happens to the anaesthesia machine when pipeline oxygen supply pressure drops below ~280 kPa?", answer: "An audible low-oxygen-pressure warning whistle or alarm is triggered, the oxygen failure protection device (fail-safe valve) shuts off Nitrous Oxide and other gases to prevent hypoxic delivery, and the operator must switch to cylinder back-up supply." },
      schematics: ["gas-system"], gasZone: "intermediate",
      position: { x: -0.14, y: 1.05, z: 0.24 }
    },
    {
      id: "gauge-cylinder", name: "Cylinder Pressure Gauges (High Pressure)", view: "front", system: "pressure",
      summary: "High-pressure dial gauges displaying the pressure of the back-up gas cylinders mounted on the machine yokes.",
      function: "Displays reserve cylinder contents before and during clinical use. For Oxygen (compressed gas), pressure falls linearly from ~13,700 kPa (137 bar) to 0 kPa as volume is consumed (Boyle's Law). For N2O (liquefied gas), pressure remains at ~5100 kPa until all liquid has vaporised.",
      safety: "Check cylinder pressures at the start of every operating list, then leave cylinder valves TURNED OFF during normal pipeline use so that a depleted reserve cylinder does not go unnoticed.",
      viva: { prompt: "Why does an O2 cylinder pressure gauge reflect remaining volume linearly, whereas an N2O gauge does not?", answer: "Oxygen remains entirely in gaseous phase below its critical temperature (-118°C), so pressure is directly proportional to volume. Nitrous oxide has a critical temperature of 36.4°C and exists as a liquid-vapour equilibrium at room temperature; its gauge reads vapour pressure (~5100 kPa) until all liquid is exhausted." },
      schematics: ["gas-system"], gasZone: "high",
      position: { x: -0.14, y: 0.95, z: 0.24 }
    },
    {
      id: "selectatec", name: "Vaporizers (Sevoflurane & Isoflurane / Selectatec)", view: "front", system: "flowControl",
      summary: "Temperature-compensated, concentration-calibrated volatile agent vaporizers mounted on an interlocking Selectatec manifold.",
      function: "Delivers a precise, calibrated percentage of volatile anaesthetic (Sevoflurane [yellow] or Isoflurane [purple]) into the fresh gas stream. Uses variable bypass geometry where fresh gas splits between a bypass channel and a temperature-compensated vaporizing chamber. The Selectatec interlock system physically prevents turning on more than one vaporizer simultaneously.",
      safety: "Only use keyed, agent-specific filler adapters to eliminate wrong-agent filling errors. Always check liquid level in the sight glass before inducing anaesthesia.",
      viva: { prompt: "How does a modern variable-bypass vaporizer maintain a constant output concentration across varying theatre temperatures?", answer: "It incorporates a temperature-compensating valve (bimetallic strip or expanding bellows) that automatically expands or contracts: as temperature drops (and vapour pressure falls), it routes a higher proportion of gas through the vaporizing chamber; as temperature rises, more gas is diverted through the bypass." },
      schematics: ["gas-system"], gasZone: "low",
      position: { x: 0.20, y: 0.98, z: 0.24 }
    },
    {
      id: "vent-display", name: "Ventilator Display & Waveform Screen", view: "front", system: "ventilator",
      summary: "Integrated ventilator control screen showing ventilation modes, parameter settings, and respiratory waveforms.",
      function: "Displays ventilator operating mode (VCV, PCV, SIMV, PSVPro, Manual/Spontaneous) alongside continuous scalar waveforms (Airway Pressure vs Time, Flow vs Time) and spirometry loops (Pressure-Volume, Flow-Volume). Allows precision adjustment of VT, RR, PEEP, I:E ratio, and pressure limits.",
      safety: "Ensure high and low airway pressure alarm limits (Pmax and Pmin) are set correctly for every patient to guard against barotrauma and circuit disconnection.",
      viva: { prompt: "In Volume-Controlled Ventilation (VCV), what does a gradual upward climb in peak inspiratory pressure (PIP) with stable plateau pressure indicate?", answer: "An increase in airway resistance (e.g. bronchospasm, secretions, kinked ETT), because airway resistance affects dynamic peak pressure without altering static compliance (plateau pressure)." },
      position: { x: 0.20, y: 1.35, z: 0.20 }
    },
    {
      id: "paw-gauge", name: "Airway Pressure Gauge (PAW Gauge)", view: "front", system: "breathing",
      summary: "Mechanical analog dial gauge indicating real-time airway pressure in the patient breathing circuit (-10 to +100 cmH2O).",
      function: "Provides an immediate mechanical measurement of circuit pressure, remaining functional even during total electrical power failure. Essential for monitoring peak inspiratory pressure, positive end-expiratory pressure (PEEP), and confirming circuit depressurisation during expiration.",
      safety: "A sudden drop to zero cmH2O indicates circuit disconnection or large leak; a sustained high pressure indicates APL valve obstruction, ventilator malfunction, or patient coughing/bucking.",
      viva: { prompt: "Why is having a mechanical analog airway pressure gauge essential even when digital electronic pressure waveforms are present?", answer: "Because it operates purely pneumatically without mains or battery power, ensuring that circuit overpressure or complete loss of pressure can be immediately detected during an electrical blackout or electronic monitor failure." },
      position: { x: -0.06, y: 0.83, z: 0.26 }
    },
    {
      id: "system-switch", name: "System Power Switch", view: "front", system: "power",
      summary: "Master control switch powering electrical monitoring, electronic ventilator, and pneumatic safety subsystems.",
      function: "Engages machine electronics, powers displays, arms the low-oxygen supply alarm, and opens the master pneumatic shutoff valve. Turning off initiates a controlled shutdown sequence.",
      safety: "Must be part of the standardized pre-use checklist sequence, confirming that battery backup test and self-diagnostic routines complete without error.",
      viva: null,
      position: { x: -0.18, y: 0.83, z: 0.26 }
    },
    {
      id: "acgo", name: "ACGO (Auxiliary Common Gas Outlet) & Selector", view: "front", system: "auxOutlet",
      summary: "Dedicated 22mm male / 15mm female outlet and selector switch for directing fresh gas to external non-circle circuits.",
      function: "Diverts the metered fresh gas flow away from the integrated circle system to an external circuit such as a Mapleson F (Jackson-Rees) for paediatric anaesthesia, a Bain circuit, or a manual resuscitation bag.",
      safety: "When ACGO is selected, the mechanical ventilator is automatically disabled or isolated to prevent cycling against an unattached circuit. Always confirm switch position before inducing anaesthesia.",
      viva: { prompt: "Why do modern anaesthesia machines interlock the ventilator when ACGO is selected?", answer: "To prevent the mechanical ventilator from cycling against a disconnected circuit or closed system, since fresh gas is entirely diverted to the auxiliary outlet instead of the internal absorber circuit." },
      position: { x: -0.08, y: 0.76, z: 0.33 }
    },
    {
      id: "o2-flush", name: "Oxygen Flush Button (O2 Flush, 35–75 L/min)", view: "front", system: "auxOutlet",
      summary: "Emergency high-flow push button delivering unmetered 100% pure oxygen directly to the common gas outlet at 35–75 L/min.",
      function: "Provides rapid flushing and refilling of the breathing circuit with pure Oxygen. Taps the intermediate-pressure O2 line (~400 kPa) upstream of the flowmeters and vaporizers, delivering 35–75 L/min directly to the circuit.",
      safety: "NEVER press the O2 flush button during the inspiratory phase of mechanical ventilation: the combination of high flow (up to 1250 mL/sec) and a closed ventilator exhalation valve can generate extreme circuit pressures, causing severe pulmonary barotrauma. Also note that flushing dilutes volatile anaesthetic agent, potentially lightening anaesthetic depth.",
      viva: { prompt: "Why is activating the oxygen flush during the inspiratory phase of mechanical ventilation hazardous?", answer: "During inspiration, the ventilator exhalation valve is closed. Delivering 35–75 L/min (approx. 600–1200 mL/s) of gas into a closed system exceeds the venting capacity, transmitting extreme pressure directly to the patient's lungs and causing pneumothorax or alveolar rupture." },
      schematics: ["gas-system"], gasZone: "intermediate",
      position: { x: 0.04, y: 0.76, z: 0.33 }
    },
    {
      id: "breathing-circuit", name: "CO2 Absorber Canister (Soda Lime)", view: "front", system: "breathing",
      summary: "Rebreathing carbon dioxide absorption canister containing soda lime, with transparent housing and CO2 bypass.",
      function: "Removes expired CO2 by chemical reaction: CO2 + H2O -> H2CO3; H2CO3 + 2NaOH -> Na2CO3 + 2H2O + heat; Na2CO3 + Ca(OH)2 -> CaCO3 + 2NaOH. Contains ethyl violet pH indicator which turns purple when soda lime is exhausted. The CO2 bypass feature allows canister replacement during surgery without opening the circuit to air.",
      safety: "Monitor inspired CO2 (FiCO2) continuously on capnography. An elevation of baseline capnography above 2–3 mmHg indicates absorber exhaustion or valve channeling.",
      viva: { prompt: "What chemical reaction occurs in soda lime, and what causes the ethyl violet indicator to turn purple?", answer: "CO2 reacts with water to form carbonic acid, which is neutralized by sodium/calcium hydroxides into calcium carbonate, releasing water and heat. As hydroxide is consumed, pH falls below 10.3, causing the colorless ethyl violet dye to convert to its purple quinoid form." },
      position: { x: -0.38, y: 0.82, z: 0.16 }
    },
    {
      id: "apl-valve", name: "APL Valve (Adjustable Pressure Limiting) & Bag Mount", view: "front", system: "breathing",
      summary: "Spring-loaded pressure relief valve calibrated from 0 to 70 cmH2O and mount for the 2-litre reservoir bag.",
      function: "Used during manual and spontaneous breathing to release excess gas from the circuit into the scavenging system. Clockwise rotation increases opening pressure (for manual bag-assisted ventilation); fully anticlockwise leaves it open (<1 cmH2O) for spontaneous breathing.",
      safety: "Must be turned FULLY OPEN before switching a patient to spontaneous breathing, otherwise high pressure accumulates in the circuit, impairing venous return and risking barotrauma.",
      viva: { prompt: "What is the consequence of forgetting to open the APL valve when transitioning a patient from manual ventilation to spontaneous breathing?", answer: "Excess fresh gas cannot escape and rapidly pressurizes the circuit, causing continuous positive airway pressure that impedes venous return to the right atrium (causing severe hypotension) and risks pulmonary barotrauma." },
      position: { x: -0.38, y: 1.00, z: 0.16 }
    },
    {
      id: "circuit-ports", name: "Patient Breathing Circuit (Inspiratory & Expiratory Limbs)", view: "front", system: "breathing",
      summary: "Dual 22mm conical ports for inspiratory and expiratory corrugated limbs with unidirectional flutter valves.",
      function: "Connects the patient's Y-piece and endotracheal tube to the circle system. Unidirectional disk/dome valves ensure gas travels in one direction: through the absorber on expiration and from the fresh gas inlet on inspiration.",
      safety: "Incompetence or sticking of unidirectional valves leads to massive rebreathing of expired gas, visible as a rising baseline on the capnograph.",
      viva: null,
      position: { x: -0.42, y: 0.70, z: 0.22 }
    },
    {
      id: "storage", name: "Storage Drawers (Airway & Emergency Equipment)", view: "front", system: "storage",
      summary: "Integrated sliding storage drawers for airway consumables, laryngoscopes, tracheal tubes, and circuit adapters.",
      function: "Houses essential consumables organized by tier: top drawer for immediate intubation gear (laryngoscopes, blades, video laryngoscopes, endotracheal tubes, stylets), lower drawers for supraglottic airways, suction catheters, and backup circuits.",
      safety: "Drawers must be kept closed during machine movement to prevent tipping or catching on doors and pendants.",
      viva: null,
      position: { x: 0.00, y: 0.45, z: 0.26 }
    },
    {
      id: "casters", name: "Wheel Casters & Individual Brake Levers", view: "front", system: "mobility",
      summary: "Antistatic, large-diameter wheels with foot-operated locking levers on the front casters.",
      function: "Enables smooth mobility across theatre floors. Brakes firmly lock both rotation and rolling swivel.",
      safety: "Always lock the caster brakes once the workstation is positioned before induction to prevent accidental machine movement and circuit disconnect.",
      viva: null,
      position: { x: 0.25, y: 0.06, z: 0.28 }
    },
    {
      id: "flip-shelf", name: "Flip-up Auxiliary Worktop Shelf", view: "front", system: "storage",
      summary: "Hinged side work surface providing additional space for drug trays, documentation, or airway devices.",
      function: "Folds out horizontally when required and locks securely into position; folds flat against the right machine column when stowed.",
      safety: "Observe maximum rated weight limit (typically 12 kg); never use the shelf as a handle to move the workstation.",
      viva: null,
      position: { x: 0.36, y: 0.76, z: 0.12 }
    },
    {
      id: "handle", name: "Ergonomic Manoeuvring Handle", view: "front", system: "mobility",
      summary: "Heavy-duty tubular grab handle running along the right pillar for controlled repositioning.",
      function: "Allows two-handed steering and transport of the workstation without pushing on delicate monitors, vaporizers, or flowmeters.",
      safety: "Always verify all pipeline hoses, suction tubing, and power cables are detached or cleared before moving the workstation.",
      viva: null,
      position: { x: 0.32, y: 1.15, z: 0.16 }
    },
    {
      id: "usb-rs232", name: "USB & RS-232 Data Interface Ports", view: "front", system: "power",
      summary: "Biomedical service ports and data export interfaces for electronic anaesthesia record-keeping (AIMS/EMR).",
      function: "Provides high-speed telemetry export of measured ventilation parameters, airway pressures, and gas concentrations to hospital information systems.",
      safety: "Only hospital-approved medical-grade IT equipment may be connected to prevent ground-fault electrical leakage.",
      viva: null,
      position: { x: 0.25, y: 1.18, z: 0.21 }
    },
    {
      id: "task-light", name: "Task Light / Canopy Illuminator", view: "front", system: "mobility",
      summary: "Under-canopy LED illumination bar providing shadow-free lighting of the rotameter bank and vaporizers.",
      function: "Illuminates the workstation controls and drug preparation surface during darkened theatre conditions (e.g. laparoscopic, robotic, or ophthalmic surgery).",
      safety: "Verify operational state prior to cases requiring darkened theatre lighting.",
      viva: null,
      position: { x: 0.00, y: 1.54, z: 0.20 }
    },
    {
      id: "rear-cylinders", name: "Reserve Gas Cylinders (O2, N2O, Air - High Pressure)", view: "rear", system: "gasSupply",
      summary: "Back-up high-pressure medical gas cylinders mounted vertically on the rear carriage of the workstation.",
      function: "Supplies emergency back-up gas if hospital piped gas fails. In standard configurations carries Size E cylinders: Oxygen (black with white shoulders [UK] or solid green [US], 13,700 kPa), Nitrous Oxide (French blue, 5100 kPa), and Medical Air (white with black/white quarters [UK] or yellow [US], 13,700 kPa).",
      safety: "Always ensure cylinder valves are opened to verify pressure at the start of every operating session, then CLOSED during pipeline use to prevent accidental depletion of reserves.",
      viva: { prompt: "Why must backup cylinder valves be left closed during routine pipeline gas operation?", answer: "Because if the pipeline pressure fluctuates below cylinder regulator pressure (approx. 400 kPa), the cylinder will silently supply gas until empty, leaving no backup supply when an actual pipeline failure occurs." },
      schematics: ["cylinder-connection"], gasZone: "high",
      position: { x: 0.00, y: 0.60, z: -0.25 }
    },
    {
      id: "cylinder-yoke", name: "Cylinder Yokes & Pin-Index Safety System (PISS)", view: "rear", system: "gasSupply",
      summary: "Clamping yokes with Bodok seals, check valves, and gas-specific indexing pins (PISS).",
      function: "Secures each cylinder flush against the machine manifold. Uses the Pin-Index Safety System (PISS) with two stainless steel pins matching holes on the cylinder valve: O2 is pin position 2-5, N2O is 3-5, Air is 1-5. Internal floating check valves prevent gas escaping if one cylinder of a pair is removed.",
      safety: "Always use a fresh Bodok seal (neoprene washer with metal rim) to prevent high-pressure gas leaks. Never use more than one washer, which could bypass the pin-index mechanism.",
      viva: { prompt: "What are the Pin-Index Safety System (PISS) pin positions for Oxygen, Nitrous Oxide, and Medical Air?", answer: "Oxygen: 2 and 5; Nitrous Oxide: 3 and 5; Medical Air: 1 and 5 (numbered 1 through 6 on a 9/16-inch radius arc below the gas port)." },
      schematics: ["cylinder-connection", "yoke-check-valve"], gasZone: "high",
      position: { x: 0.00, y: 0.98, z: -0.24 }
    },
    {
      id: "pipeline-conn", name: "Pipeline Gas Inlets (Schrader / NIST Connections)", view: "rear", system: "gasSupply",
      summary: "Gas-specific pipeline inlet assemblies with non-interchangeable probe connections, filters, and check valves.",
      function: "Connects the workstation to hospital piped wall or pendant supply hoses. Uses diameter-indexed (DISS) or non-interchangeable screw-threaded (NIST) connectors, or British Standard Schrader quick-connect probes. Contains 100-micron filters and one-way check valves to prevent gas backflow into the pipeline.",
      safety: "Non-interchangeable gas connectors must never be modified or forced. Check hoses for colour-coding, gas designation, and expiry/test date.",
      viva: { prompt: "What two safety mechanisms are built into every pipeline gas inlet on the back of an anaesthesia machine?", answer: "1. A gas-specific mechanical indexing geometry (NIST/DISS/Schrader) preventing connection of the wrong gas hose. 2. An internal one-way check valve preventing backflow of gas from a cylinder or other pipeline into the hospital pipe network." },
      schematics: ["gas-system"], gasZone: "intermediate",
      position: { x: -0.22, y: 1.25, z: -0.24 }
    },
    {
      id: "aux-power", name: "Auxiliary Electrical Outlets & Circuit Breakers", view: "rear", system: "power",
      summary: "Rear electrical panel with multiple isolated power sockets, individual circuit breakers, and battery backup.",
      function: "Powers auxiliary monitors, syringe drivers, and warming blankets from the machine's mains line. Includes an internal uninterruptible power supply (UPS battery) that provides a minimum of 30–90 minutes of emergency electrical power to the ventilator and displays if mains power fails.",
      safety: "Never plug high-current inductive heating devices (e.g. forced-air warming units) into auxiliary outlets unless explicitly rated, as this can trip the master machine breaker.",
      viva: { prompt: "What components of the anaesthesia workstation are powered by the internal backup battery during a mains electrical failure?", answer: "The essential life-support components: the electronic ventilator, the ventilator display, airway pressure monitoring, and electronic fresh gas flow sensors. High-draw auxiliary sockets and external devices are generally not battery-backed." },
      position: { x: 0.00, y: 1.48, z: -0.24 }
    },
    {
      id: "scavenging", name: "Scavenging System (AGSS - Active Gas Scavenging)", view: "rear", system: "breathing",
      summary: "Anaesthetic Gas Scavenging System receiver collecting waste gas from the APL valve and ventilator exhaust.",
      function: "Safely removes expired and vented volatile anaesthetic agents from the operating theatre. Connects via dedicated 30mm conical fittings (distinguishing it from the 22mm patient circuit). Active systems incorporate an air break receiver with a bobbin or float flow indicator (25–50 L/min extraction rate) and positive/negative pressure relief valves.",
      safety: "A blocked scavenging pathway causes circuit overpressurization and fatal barotrauma; a disconnected system leaks potent halogenated agents into the theatre environment.",
      viva: { prompt: "Why is the connection between the breathing circuit/APL valve and the scavenging receiver 30 mm, unlike standard 22 mm circuit connections?", answer: "To prevent accidental cross-connection between the patient breathing circuit (22 mm male/15 mm female) and the scavenging exhaust (30 mm male), ensuring that breathing hoses cannot be mistakenly connected to the waste suction system." },
      position: { x: -0.38, y: 0.60, z: -0.05 }
    },
    {
      id: "hose-hooks", name: "Hose & Power Cable Storage Brackets", view: "rear", system: "storage",
      summary: "Rear brackets for securing and coiling medical gas pipeline hoses and electrical mains cords during transport.",
      function: "Keeps bulky gas hoses (O2, N2O, Air) and mains cable neatly stowed off the floor, eliminating tripping hazards and protecting hose fittings from damage.",
      safety: "Inspect coiled hoses periodically for kinks, abrasion, or stress fractures near the connector crimps.",
      viva: null,
      position: { x: 0.16, y: 1.28, z: -0.22 }
    }
  ],

  // Generic gas-pathway staging used by the "Systems Guide" panel — standard
  // anaesthesia-machine physiology (high/intermediate/low pressure systems),
  // expressed only in terms of the components already listed above, plus a
  // small set of standard concepts that this particular model does not expose
  // as its own selectable hotspot (marked "conceptual" — see ventilator-ui.js,
  // which renders these without a 3D jump-to-component action and instead
  // offers the schematic diagram as the "where this fits" reference).
  systemsGuide: [
    {
      id: "high", label: "High-Pressure System", range: "Cylinder pressure, up to ~13,700 kPa (O2)",
      explain: "From the gas cylinder, through the cylinder valve and pin-index safety system, to the pressure regulator. Gas here is at full cylinder pressure, stepped down by the regulator before entering the intermediate-pressure system.",
      componentIds: ["rear-cylinders", "cylinder-yoke", "gauge-cylinder"],
      concepts: [
        { label: "Cylinder valve", note: "The on/off valve fitted to each cylinder, opened to allow gas into the yoke." },
        { label: "Pin-index safety system (PISS)", note: "Pins on the yoke and matching holes on the cylinder valve block prevent a cylinder being fitted to the wrong gas yoke." },
        { label: "Cylinder-yoke check valve", note: "A one-way (floating) valve inside the yoke that prevents backflow/gas loss when a cylinder is removed or absent.", schematic: "yoke-check-valve" }
      ],
      schematic: "cylinder-connection"
    },
    {
      id: "intermediate", label: "Intermediate-Pressure System", range: "~400 kPa (pipeline / post-regulator)",
      explain: "From the pipeline inlet (or the cylinder pressure regulator outlet) to the flow-control valves. This is the pressure delivered by the hospital pipeline, and the regulated pressure downstream of a cylinder regulator. The O2 flush valve taps this system directly, bypassing the flow-control valves entirely.",
      componentIds: ["pipeline-conn", "gauge-pipeline", "o2-flush"],
      concepts: [
        { label: "Primary & secondary pressure regulators", note: "Reduce cylinder or pipeline pressure to a steady ~400 kPa working pressure before it reaches the flow-control valves." },
        { label: "O2 supply-pressure monitoring / low-pressure alarm", note: "Monitors the intermediate-pressure O2 supply and alarms if it falls, since this pressure also typically drives the anti-hypoxia linkage and ventilator." }
      ],
      schematic: "gas-system"
    },
    {
      id: "low", label: "Low-Pressure System", range: "Just above atmospheric, downstream of the flow-control valves",
      explain: "From the flow-control (needle) valves, through the flowmeters and vaporizer(s), to the common gas outlet. This is where the low-pressure system ends — the breathing circuit itself is a separate system (see Breathing System & Scavenging below), even though gas flows from one into the other.",
      componentIds: ["flowhead", "selectatec"],
      concepts: [
        { label: "Flow-control / needle valves", note: "Operator-set valves that meter each gas from intermediate pressure down into the low-pressure fresh-gas flow." },
        { label: "Flowmeter / rotameter tubes", note: "Show the flow rate of each gas as a bobbin position in a tapered tube." },
        { label: "Vaporizer interlock concept", note: "An interlock (e.g. Selectatec-type) prevents more than one vaporizer being active at once." },
        { label: "Common gas outlet & outlet check valve", note: "Where the fresh-gas mixture leaves the machine; some workstations add an outlet check/retaining device to resist backflow and accidental disconnection." },
        { label: "Connection toward the breathing system", note: "The low-pressure system's endpoint — not itself part of the breathing circuit." }
      ],
      schematic: "gas-system"
    },
    {
      id: "breathing", label: "Breathing System & Scavenging", range: "Patient-side circuit and waste-gas removal",
      explain: "Carries fresh gas to and from the patient and removes excess/expired gas. This is a distinct system from the low-pressure fresh-gas supply above — it is not itself classified as \"low pressure\" in the pneumatic sense, even though it receives gas from the common gas outlet.",
      componentIds: ["breathing-circuit", "apl-valve", "circuit-ports", "paw-gauge", "scavenging"],
      concepts: [],
      schematic: null
    }
  ]
};
