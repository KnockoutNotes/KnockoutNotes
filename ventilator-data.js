/* ==========================================================================
   KNOCKOUTNOTES — Ventilator & Anaesthesia Workstations (ventilator-data.js)
   Structured, data-driven content for the 3D workstation explorer.

   IMPORTANT — MEDICAL ACCURACY SCOPE (see also ventilator.html footer note):
   All component descriptions below use GENERIC, textbook-standard anaesthesia
   machine concepts (Pin Index Safety System, three-tier pressure systems,
   circle breathing system, soda-lime absorption, APL valve, hypoxic guard,
   etc). Nothing here claims to represent a specific manufacturer/model's
   exact specification, internal tolerances, or certified safety behaviour.
   Anywhere a detail would require a specific machine's manual, it is marked
   "(model-dependent)". This content is an educational prototype and must be
   reviewed by a qualified anaesthesiologist before any clinical teaching use.
   ========================================================================== */

(function () {
  "use strict";

  const UNIVERSAL = "universal";
  const MACHINE_SPECIFIC = "machine-specific";

  // ---- Shared safety-principle text reused by both machines where the
  // underlying principle is genuinely universal (only the physical component
  // it attaches to differs). ----
  const PISS_PRINCIPLE =
    "The Pin Index Safety System uses a unique pair of pin positions on the " +
    "cylinder valve block matched to corresponding holes on the yoke, keyed " +
    "per gas. A cylinder cannot be mounted on the wrong yoke because the pins " +
    "will not align, which prevents an incorrect gas being connected at the " +
    "cylinder stage.";

  const DISS_PRINCIPLE =
    "The Diameter Index Safety System gives each pipeline gas connector a " +
    "unique thread diameter, so a hose for one gas physically cannot be " +
    "screwed into another gas's pipeline inlet.";

  const HYPOXIC_GUARD_PRINCIPLE =
    "A hypoxic guard (proportioning) system mechanically or electronically " +
    "links the nitrous oxide and oxygen flow controls so that the fresh gas " +
    "mixture cannot fall below a safe minimum oxygen percentage (commonly " +
    "around 21-25%, exact value model-dependent), even if the operator tries " +
    "to set a very high N2O flow relative to O2.";

  const OXYGEN_FAILURE_PROTECTION_PRINCIPLE =
    "If oxygen supply pressure falls, an oxygen-failure protection device " +
    "shuts off or proportionally reduces nitrous oxide (and other non-O2 " +
    "gases) and triggers an audible alarm, preventing a hypoxic mixture from " +
    "continuing to flow to the patient.";

  const VAPORIZER_INTERLOCK_PRINCIPLE =
    "A vaporizer interlock mechanically prevents more than one vaporizer " +
    "from being switched on at the same time, avoiding an inadvertent mixture " +
    "of two volatile agents in the fresh gas stream.";

  const AGENT_KEYED_FILLING_PRINCIPLE =
    "Agent-specific (keyed) filling ports are shaped so that a filling " +
    "device for one volatile agent cannot be inserted into a vaporizer " +
    "designed for a different agent, reducing the risk of the wrong agent " +
    "being used.";

  const OXYGEN_FLUSH_PRINCIPLE =
    "The oxygen flush valve delivers a high flow of pure oxygen (commonly " +
    "around 35-75 L/min, model-dependent) directly to the common gas outlet, " +
    "bypassing the flowmeters and vaporizer, for rapid circuit filling or " +
    "emergency oxygenation. Because it bypasses the vaporizer, it never " +
    "delivers volatile agent.";

  const APL_PRINCIPLE =
    "The adjustable pressure-limiting (APL) valve lets excess gas vent from " +
    "the breathing system once circuit pressure exceeds the set threshold, " +
    "protecting the patient's airway from excessive pressure during manual " +
    "or spontaneous ventilation.";

  const SCAVENGING_PRINCIPLE =
    "The scavenging system collects gas vented from the APL valve and " +
    "ventilator relief, carrying it away from the breathing zone to reduce " +
    "staff exposure to waste anaesthetic gas.";

  const CYLINDER_COLOR_CAVEAT =
    "Cylinder body/shoulder colour coding differs between countries and " +
    "standards (e.g. ISO 32 vs long-standing national schemes) — always " +
    "confirm gas identity from the cylinder label and valve markings, never " +
    "from colour alone. Colours shown here are illustrative only.";

  // ==========================================================================
  // BOYLE'S ANAESTHESIA MACHINE
  // ==========================================================================
  const boylesComponents = [
    {
      id: "frame_boyles", name: "Machine Frame", category: "Structure",
      system: "frame", internal: false,
      description: "The trolley/frame carrying every system: gas supply, flowmeters, vaporizer and breathing system attachment point.",
      function: "Provides a stable mobile base and mounting points for all machine systems.",
      vivaPoints: ["Classic Boyle's design mounts the cylinders at the rear and the flowmeter/vaporizer block at the front, roughly following the direction of gas flow."],
      animationId: null, relatedComponents: []
    },
    {
      id: "cylinder_O2_boyles", name: "Oxygen Cylinder", category: "Gas Supply",
      system: "gasSupply", internal: false, gas: "O2",
      description: "Backup/primary oxygen supply cylinder mounted on the rear yoke.",
      function: "Supplies oxygen at high pressure (full cylinder pressure, commonly ~137 bar for a size-E cylinder, model-dependent) when pipeline supply is unavailable or as the primary source on a stand-alone machine.",
      vivaPoints: ["This is part of the HIGH-PRESSURE system, upstream of the pressure regulator.", CYLINDER_COLOR_CAVEAT],
      animationId: "highlight-pulse", relatedComponents: ["yoke_O2_boyles", "gauge_cylinder_O2_boyles", "pressure_regulator_O2_boyles"]
    },
    {
      id: "cylinder_N2O_boyles", name: "Nitrous Oxide Cylinder", category: "Gas Supply",
      system: "gasSupply", internal: false, gas: "N2O",
      description: "Backup/primary nitrous oxide supply cylinder mounted on the rear yoke, where fitted.",
      function: "Supplies N2O; because N2O is stored partly as liquid, cylinder pressure does not fall linearly with content and is not a reliable content gauge (model-dependent, see cylinder physics).",
      vivaPoints: ["N2O cylinder contents are better estimated by weighing the cylinder than by reading pressure alone, unlike a purely gaseous cylinder such as O2.", CYLINDER_COLOR_CAVEAT],
      animationId: "highlight-pulse", relatedComponents: ["yoke_N2O_boyles", "gauge_cylinder_N2O_boyles", "pressure_regulator_N2O_boyles"]
    },
    {
      id: "yoke_O2_boyles", name: "Oxygen Cylinder Yoke (PISS)", category: "Safety / Gas Supply",
      system: "gasSupply", internal: false,
      description: "The yoke that clamps the O2 cylinder to the frame, incorporating the Pin Index Safety System.",
      function: "Mechanically ensures only an oxygen cylinder can be seated correctly on this yoke.",
      vivaPoints: ["Pin Index Safety System — see Safety Features mode."], animationId: "pin-index-demo",
      relatedComponents: ["cylinder_O2_boyles"]
    },
    {
      id: "yoke_N2O_boyles", name: "Nitrous Oxide Cylinder Yoke (PISS)", category: "Safety / Gas Supply",
      system: "gasSupply", internal: false,
      description: "The yoke that clamps the N2O cylinder to the frame, incorporating the Pin Index Safety System.",
      function: "Mechanically ensures only an N2O cylinder can be seated correctly on this yoke.",
      vivaPoints: ["Pin Index Safety System — see Safety Features mode."], animationId: "pin-index-demo",
      relatedComponents: ["cylinder_N2O_boyles"]
    },
    {
      id: "gauge_cylinder_O2_boyles", name: "O2 Cylinder Pressure Gauge", category: "Monitoring",
      system: "gasSupply", internal: false,
      description: "Bourdon-type gauge reading the pressure inside the mounted O2 cylinder.",
      function: "Lets the operator estimate remaining O2 cylinder content before switching to it or when pipeline supply fails.",
      vivaPoints: ["Because O2 is a true gas at room temperature, its cylinder pressure falls roughly linearly with content — unlike N2O."],
      animationId: null, relatedComponents: ["cylinder_O2_boyles"]
    },
    {
      id: "gauge_cylinder_N2O_boyles", name: "N2O Cylinder Pressure Gauge", category: "Monitoring",
      system: "gasSupply", internal: false,
      description: "Gauge reading the pressure inside the mounted N2O cylinder.",
      function: "Reads high while liquid N2O remains and only starts to fall once all liquid has vaporised, so a steady high reading does not guarantee a full cylinder.",
      vivaPoints: ["Classic viva point: N2O cylinder pressure is a poor guide to content until the cylinder is nearly empty."],
      animationId: null, relatedComponents: ["cylinder_N2O_boyles"]
    },
    {
      id: "pipeline_inlet_O2_boyles", name: "O2 Pipeline Inlet", category: "Gas Supply",
      system: "gasSupply", internal: false,
      description: "Colour/index-coded pipeline connection (Diameter Index Safety System) for hospital central oxygen supply.",
      function: "Accepts a gas-specific hose from the wall/central manifold at pipeline pressure (commonly ~4 bar / 400 kPa, model-dependent).",
      vivaPoints: ["DISS prevents a pipeline hose being connected to the wrong gas inlet."], animationId: "diss-demo",
      relatedComponents: ["gauge_pipeline_O2_boyles"]
    },
    {
      id: "pipeline_inlet_N2O_boyles", name: "N2O Pipeline Inlet", category: "Gas Supply",
      system: "gasSupply", internal: false,
      description: "Diameter Index Safety System pipeline connection for hospital central N2O supply, where fitted.",
      function: "Accepts a gas-specific hose from the central N2O manifold at pipeline pressure.",
      vivaPoints: ["Central pipeline supply is generally preferred over cylinder supply for routine use; cylinders remain as backup."],
      animationId: "diss-demo", relatedComponents: ["gauge_pipeline_N2O_boyles"]
    },
    {
      id: "gauge_pipeline_O2_boyles", name: "O2 Pipeline Pressure Gauge", category: "Monitoring",
      system: "gasSupply", internal: false,
      description: "Gauge reading incoming pipeline oxygen pressure.",
      function: "Confirms pipeline supply is present and at an adequate pressure before relying on it.",
      vivaPoints: ["A falling pipeline pressure gauge is one of the first clues to a pipeline supply problem."],
      animationId: null, relatedComponents: ["pipeline_inlet_O2_boyles"]
    },
    {
      id: "gauge_pipeline_N2O_boyles", name: "N2O Pipeline Pressure Gauge", category: "Monitoring",
      system: "gasSupply", internal: false,
      description: "Gauge reading incoming pipeline nitrous oxide pressure.",
      function: "Confirms pipeline N2O supply is present at an adequate pressure.",
      vivaPoints: [], animationId: null, relatedComponents: ["pipeline_inlet_N2O_boyles"]
    },
    {
      id: "pressure_regulator_O2_boyles", name: "O2 Pressure Regulator", category: "Pressure Regulation",
      system: "pressure", internal: false,
      description: "Reduces variable, high cylinder pressure down to a steady intermediate pressure.",
      function: "Delivers a constant intermediate pressure (commonly ~4 bar, model-dependent) to the flow control stage regardless of how full the cylinder is.",
      vivaPoints: ["This is the boundary between the HIGH-PRESSURE system (cylinder side) and the INTERMEDIATE-PRESSURE system."],
      animationId: "pressure-drop-demo", relatedComponents: ["cylinder_O2_boyles", "flowmeter_O2_boyles"]
    },
    {
      id: "pressure_regulator_N2O_boyles", name: "N2O Pressure Regulator", category: "Pressure Regulation",
      system: "pressure", internal: false,
      description: "Reduces variable N2O cylinder pressure down to a steady intermediate pressure.",
      function: "Delivers a constant intermediate pressure to the N2O flow control stage.",
      vivaPoints: [], animationId: "pressure-drop-demo",
      relatedComponents: ["cylinder_N2O_boyles", "flowmeter_N2O_boyles"]
    },
    {
      id: "flowmeter_block_boyles", name: "Flowmeter Block", category: "Flow Control",
      system: "flow", internal: false,
      description: "Bank of tapered glass flow tubes (rotameters), one per gas, each with a bobbin/float indicating flow rate.",
      function: "Lets the operator set and read individual gas flows before they mix into the fresh gas stream.",
      vivaPoints: ["Classic rotameters are gas-specific and not interchangeable — each tube is calibrated for one gas's viscosity/density."],
      animationId: "flow-bobbin", relatedComponents: ["flowmeter_O2_boyles", "flowmeter_N2O_boyles"]
    },
    {
      id: "flowmeter_O2_boyles", name: "O2 Flow Control & Tube", category: "Flow Control",
      system: "flow", internal: false,
      description: "Needle valve and rotameter tube controlling/displaying O2 flow.",
      function: "Sets the oxygen component of fresh gas flow.",
      vivaPoints: ["The O2 control knob is typically distinctively shaped/fluted so it can be identified by touch."],
      animationId: "flow-bobbin", relatedComponents: ["flowmeter_block_boyles"]
    },
    {
      id: "flowmeter_N2O_boyles", name: "N2O Flow Control & Tube", category: "Flow Control",
      system: "flow", internal: false,
      description: "Needle valve and rotameter tube controlling/displaying N2O flow.",
      function: "Sets the nitrous oxide component of fresh gas flow.",
      vivaPoints: ["Linked to the O2 control via the hypoxic guard on machines fitted with one — see Safety Features mode."],
      animationId: "flow-bobbin", relatedComponents: ["flowmeter_block_boyles"]
    },
    {
      id: "vaporizer_boyles", name: "Vaporizer", category: "Vaporizer",
      system: "vaporizer", internal: false,
      description: "Agent-specific vaporizer sitting downstream of the flowmeters, adding a controlled concentration of volatile anaesthetic agent to the fresh gas.",
      function: "Vaporizes liquid volatile agent into the fresh gas stream at the concentration set on its dial.",
      vivaPoints: ["Agent-specific — the filling port is keyed so the wrong agent cannot easily be poured in.", "On a Boyle's-style back-bar, only one vaporizer is normally switched on at a time (interlock, model-dependent)."],
      animationId: "vaporizer-dial", relatedComponents: ["flowmeter_block_boyles", "common_gas_outlet_boyles"]
    },
    {
      id: "common_gas_outlet_boyles", name: "Common Gas Outlet", category: "Gas Delivery",
      system: "vaporizer", internal: false,
      description: "The single outlet where all mixed, vaporized fresh gas leaves the machine toward the breathing system.",
      function: "Delivers final fresh gas mixture to the breathing system hose.",
      vivaPoints: ["This is the boundary between the LOW-PRESSURE system and the breathing system."],
      animationId: null, relatedComponents: ["breathing_hose_boyles"]
    },
    {
      id: "breathing_hose_boyles", name: "Breathing System Hose", category: "Breathing System",
      system: "breathing", internal: false,
      description: "Fresh gas delivery hose/manifold connecting the common gas outlet to the circle breathing system.",
      function: "Carries fresh gas into the circle system for the patient.",
      vivaPoints: [], animationId: "gas-flow-pulse",
      relatedComponents: ["co2_absorber_boyles", "reservoir_bag_boyles"]
    },
    {
      id: "co2_absorber_boyles", name: "CO2 Absorber Canister", category: "Breathing System",
      system: "absorber", internal: false,
      description: "Canister containing a CO2-absorbing medium (traditionally soda lime) as part of a circle breathing system.",
      function: "Removes exhaled CO2 so gas can be safely rebreathed, allowing low fresh-gas-flow anaesthesia.",
      vivaPoints: ["Absorbent colour-change indicators show exhaustion (model/product-dependent — not universal across all absorbents)."],
      animationId: "absorber-glow", relatedComponents: ["breathing_hose_boyles", "apl_valve_boyles"]
    },
    {
      id: "apl_valve_boyles", name: "APL Valve", category: "Safety / Breathing System",
      system: "breathing", internal: false,
      description: "Adjustable pressure-limiting valve on the breathing system.",
      function: APL_PRINCIPLE,
      vivaPoints: ["Left fully open during spontaneous ventilation to minimise resistance; adjusted for manual ventilation."],
      animationId: "apl-vent", relatedComponents: ["reservoir_bag_boyles", "scavenging_hose_boyles"]
    },
    {
      id: "reservoir_bag_boyles", name: "Reservoir Bag", category: "Breathing System",
      system: "breathing", internal: false,
      description: "Compliant bag on the breathing system used for manual ventilation and as a visual/tactile monitor of the patient's own breathing.",
      function: "Acts as a gas reservoir and lets the operator manually ventilate or feel spontaneous breathing effort.",
      vivaPoints: ["Bag movement is a simple, immediate way to notice apnoea or a circuit disconnection at the bedside."],
      animationId: "bag-breathe", relatedComponents: ["apl_valve_boyles"]
    },
    {
      id: "scavenging_hose_boyles", name: "Scavenging Connection", category: "Scavenging",
      system: "scavenging", internal: false,
      description: "Tubing carrying gas vented from the APL valve to the scavenging/disposal system.",
      function: SCAVENGING_PRINCIPLE,
      vivaPoints: [], animationId: "gas-flow-pulse", relatedComponents: ["apl_valve_boyles"]
    }
  ];

  const boylesSafety = [
    { id: "piss_boyles", name: "Pin Index Safety System", scope: UNIVERSAL, componentIds: ["yoke_O2_boyles", "yoke_N2O_boyles", "cylinder_O2_boyles", "cylinder_N2O_boyles"], principle: PISS_PRINCIPLE, demo: "Attempting to mount an N2O cylinder on the O2 yoke: the pins do not align, so the cylinder cannot be seated and gas cannot flow.", failure: "incorrect_cylinder_yoke" },
    { id: "diss_boyles", name: "Diameter Index Safety System", scope: UNIVERSAL, componentIds: ["pipeline_inlet_O2_boyles", "pipeline_inlet_N2O_boyles"], principle: DISS_PRINCIPLE, demo: "An O2 pipeline hose's connector diameter will not thread onto the N2O inlet.", failure: null },
    { id: "hypoxic_guard_boyles", name: "Hypoxic Guard (Proportioning System)", scope: MACHINE_SPECIFIC, componentIds: ["flowmeter_O2_boyles", "flowmeter_N2O_boyles"], principle: HYPOXIC_GUARD_PRINCIPLE, demo: "Turning N2O flow up while O2 flow is turned down: past a set ratio, the linkage stops N2O rising further (or raises O2 with it) so mixture cannot become hypoxic.", failure: "hypoxic_mixture" },
    { id: "o2_failure_protection_boyles", name: "Oxygen Failure Protection Device", scope: UNIVERSAL, componentIds: ["pressure_regulator_O2_boyles", "flowmeter_N2O_boyles"], principle: OXYGEN_FAILURE_PROTECTION_PRINCIPLE, demo: "Simulated O2 pipeline failure: N2O flow is cut and an alarm sounds before a hypoxic mixture can be delivered.", failure: "o2_pipeline_failure" },
    { id: "vaporizer_interlock_boyles", name: "Vaporizer Interlock", scope: MACHINE_SPECIFIC, componentIds: ["vaporizer_boyles"], principle: VAPORIZER_INTERLOCK_PRINCIPLE, demo: null, failure: null },
    { id: "agent_keyed_filling_boyles", name: "Agent-Specific Keyed Filling", scope: MACHINE_SPECIFIC, componentIds: ["vaporizer_boyles"], principle: AGENT_KEYED_FILLING_PRINCIPLE, demo: null, failure: "vaporizer_filling_error" },
    { id: "o2_flush_boyles", name: "Oxygen Flush Valve", scope: UNIVERSAL, componentIds: ["common_gas_outlet_boyles"], principle: OXYGEN_FLUSH_PRINCIPLE, demo: null, failure: null },
    { id: "apl_relief_boyles", name: "APL Valve — Pressure Relief", scope: UNIVERSAL, componentIds: ["apl_valve_boyles"], principle: APL_PRINCIPLE, demo: "Circuit pressure rising above the APL threshold: excess gas vents through the valve instead of building up in the patient's airway.", failure: "high_airway_pressure" },
    { id: "scavenging_boyles", name: "Scavenging System", scope: UNIVERSAL, componentIds: ["scavenging_hose_boyles"], principle: SCAVENGING_PRINCIPLE, demo: null, failure: null }
  ];

  const boylesFailures = {
    incorrect_cylinder_yoke: { title: "Attempted Incorrect Cylinder Connection", steps: [
      { state: "NORMAL", text: "Correct cylinder is matched to its yoke by the Pin Index Safety System." },
      { state: "FAILURE", text: "An attempt is made to mount the wrong gas cylinder on this yoke." },
      { state: "SAFETY MECHANISM", text: "Pin Index Safety System — mismatched pins prevent the cylinder from seating." },
      { state: "ALARM / CONSEQUENCE", text: "No gas flow occurs; the error is mechanically obvious rather than silent." },
      { state: "CORRECTIVE ACTION", text: "Select the cylinder labelled and pin-indexed for this yoke." }
    ]},
    hypoxic_mixture: { title: "Attempted Hypoxic Gas Mixture", steps: [
      { state: "NORMAL", text: "O2 and N2O flows are proportioned to keep FiO2 safely above the hypoxic guard threshold." },
      { state: "FAILURE", text: "Operator attempts to raise N2O flow disproportionately relative to O2." },
      { state: "SAFETY MECHANISM", text: "Hypoxic guard/proportioning linkage limits the achievable N2O:O2 ratio (model-dependent)." },
      { state: "ALARM / CONSEQUENCE", text: "Fresh gas O2 percentage is prevented from falling below the guarded minimum." },
      { state: "CORRECTIVE ACTION", text: "Set flows within the machine's proportioning limits; use an O2 analyser to confirm delivered FiO2." }
    ]},
    o2_pipeline_failure: { title: "Oxygen Pipeline Supply Failure", steps: [
      { state: "NORMAL", text: "O2 pipeline pressure gauge reads normal supply pressure." },
      { state: "FAILURE", text: "Central O2 pipeline pressure drops." },
      { state: "SAFETY MECHANISM", text: "Oxygen failure protection device shuts off/reduces N2O and other non-O2 gases." },
      { state: "ALARM / CONSEQUENCE", text: "An audible O2-failure alarm sounds; N2O flow stops." },
      { state: "CORRECTIVE ACTION", text: "Switch to the backup O2 cylinder, confirm cylinder valve is open, notify pipeline services." }
    ]},
    vaporizer_filling_error: { title: "Vaporizer Filling Error", steps: [
      { state: "NORMAL", text: "Agent-specific filling device matches the vaporizer's keyed port." },
      { state: "FAILURE", text: "An attempt is made to fill with the wrong agent's filling device." },
      { state: "SAFETY MECHANISM", text: "Agent-specific keyed filling port physically rejects the mismatched device." },
      { state: "ALARM / CONSEQUENCE", text: "Filling cannot proceed; no wrong-agent contamination occurs." },
      { state: "CORRECTIVE ACTION", text: "Use the filling device keyed for the vaporizer's labelled agent." }
    ]},
    high_airway_pressure: { title: "High Airway Pressure (Circuit Side)", steps: [
      { state: "NORMAL", text: "Circuit pressure stays within the range set by the APL valve." },
      { state: "FAILURE", text: "Something (e.g. kinked hose, closed APL, breath-stacking) raises circuit pressure." },
      { state: "SAFETY MECHANISM", text: "APL valve vents gas once pressure exceeds its threshold." },
      { state: "ALARM / CONSEQUENCE", text: "Pressure is limited rather than transmitted unchecked to the patient's airway." },
      { state: "CORRECTIVE ACTION", text: "Investigate the breathing system for obstruction/kinking; check APL setting." }
    ]}
  };

  const boylesGasPathway = {
    high: ["cylinder_O2_boyles", "yoke_O2_boyles", "gauge_cylinder_O2_boyles", "cylinder_N2O_boyles", "yoke_N2O_boyles", "gauge_cylinder_N2O_boyles"],
    intermediate: ["pipeline_inlet_O2_boyles", "gauge_pipeline_O2_boyles", "pressure_regulator_O2_boyles", "pipeline_inlet_N2O_boyles", "gauge_pipeline_N2O_boyles", "pressure_regulator_N2O_boyles"],
    low: ["flowmeter_O2_boyles", "flowmeter_N2O_boyles", "flowmeter_block_boyles", "vaporizer_boyles", "common_gas_outlet_boyles"]
  };

  const boylesFlowPaths = {
    O2: ["cylinder_O2_boyles", "pressure_regulator_O2_boyles", "flowmeter_O2_boyles", "flowmeter_block_boyles", "common_gas_outlet_boyles"],
    N2O: ["cylinder_N2O_boyles", "pressure_regulator_N2O_boyles", "flowmeter_N2O_boyles", "flowmeter_block_boyles", "common_gas_outlet_boyles"],
    FRESH_GAS: ["flowmeter_block_boyles", "vaporizer_boyles", "common_gas_outlet_boyles", "breathing_hose_boyles"],
    VOLATILE: ["vaporizer_boyles", "common_gas_outlet_boyles", "breathing_hose_boyles", "co2_absorber_boyles"],
    INSPIRATORY: ["breathing_hose_boyles", "co2_absorber_boyles", "reservoir_bag_boyles"],
    EXPIRATORY: ["reservoir_bag_boyles", "co2_absorber_boyles", "apl_valve_boyles"],
    CO2: ["co2_absorber_boyles", "apl_valve_boyles", "scavenging_hose_boyles"]
  };

  const boylesStartSequence = [
    { stage: "Gas Supply", componentIds: ["cylinder_O2_boyles", "pipeline_inlet_O2_boyles"], caption: "Confirm gas supply: pipeline connected and/or backup cylinders present and turned on." },
    { stage: "Pressure Regulation", componentIds: ["pressure_regulator_O2_boyles", "pressure_regulator_N2O_boyles"], caption: "High cylinder pressure is stepped down to a steady intermediate pressure." },
    { stage: "Flow Control", componentIds: ["flowmeter_O2_boyles", "flowmeter_N2O_boyles"], caption: "Operator sets individual gas flows on the rotameter bank." },
    { stage: "Vaporizer", componentIds: ["vaporizer_boyles"], caption: "Volatile agent is added to the fresh gas at the dialled concentration." },
    { stage: "Breathing System", componentIds: ["common_gas_outlet_boyles", "breathing_hose_boyles", "co2_absorber_boyles"], caption: "Fresh gas enters the circle system; CO2 is absorbed from rebreathed gas." },
    { stage: "Manual/Spontaneous Ventilation", componentIds: ["reservoir_bag_boyles", "apl_valve_boyles"], caption: "Reservoir bag allows manual ventilation or observation of spontaneous breathing." },
    { stage: "Scavenging", componentIds: ["scavenging_hose_boyles"], caption: "Excess/vented gas is carried away from the breathing zone." }
  ];

  const boylesTour = [
    { componentId: "cylinder_O2_boyles", caption: "The gas journey starts here: backup O2 cylinder, high-pressure system." },
    { componentId: "pipeline_inlet_O2_boyles", caption: "In routine use, central pipeline supply (intermediate pressure) is preferred over cylinders." },
    { componentId: "pressure_regulator_O2_boyles", caption: "Regulators step pressure down to a steady intermediate value before flow control." },
    { componentId: "flowmeter_block_boyles", caption: "Rotameters let the operator set and read each gas's flow." },
    { componentId: "vaporizer_boyles", caption: "The vaporizer adds a controlled concentration of volatile agent." },
    { componentId: "common_gas_outlet_boyles", caption: "All fresh gas leaves the machine here, toward the breathing system." },
    { componentId: "co2_absorber_boyles", caption: "The absorber removes CO2 so gas can be safely rebreathed." },
    { componentId: "apl_valve_boyles", caption: "The APL valve protects the circuit from excessive pressure." },
    { componentId: "reservoir_bag_boyles", caption: "The reservoir bag allows manual ventilation and visual/tactile monitoring of breathing." },
    { componentId: "scavenging_hose_boyles", caption: "Finally, excess gas is scavenged away from the breathing zone." }
  ];

  const boylesTroubleshooting = [
    {
      id: "tb_boyles_disconnect", title: "Sudden loss of reservoir bag movement",
      prompt: "The reservoir bag stops moving and airway pressure alarms (if fitted) go quiet rather than sounding high-pressure. What should you inspect first?",
      candidateComponentIds: ["breathing_hose_boyles", "co2_absorber_boyles", "apl_valve_boyles", "cylinder_O2_boyles"],
      correctComponentId: "breathing_hose_boyles",
      explanation: "A silent, still bag with no rising pressure is the classic pattern of a circuit disconnection — check breathing-system connections along the hose from the common gas outlet to the patient first."
    },
    {
      id: "tb_boyles_o2_low", title: "Falling O2 pipeline pressure gauge",
      prompt: "The O2 pipeline pressure gauge reading is falling. Which component would you check/switch to next?",
      candidateComponentIds: ["cylinder_O2_boyles", "vaporizer_boyles", "apl_valve_boyles", "co2_absorber_boyles"],
      correctComponentId: "cylinder_O2_boyles",
      explanation: "A falling pipeline gauge suggests a supply problem — open/confirm the backup O2 cylinder while investigating the pipeline fault."
    },
    {
      id: "tb_boyles_high_pressure", title: "Rising airway/circuit pressure",
      prompt: "Circuit pressure is climbing during manual ventilation. Which component's setting would you check first?",
      candidateComponentIds: ["apl_valve_boyles", "flowmeter_O2_boyles", "gauge_cylinder_N2O_boyles", "pipeline_inlet_N2O_boyles"],
      correctComponentId: "apl_valve_boyles",
      explanation: "Check the APL valve is not closed/obstructed — it is the primary pressure-relief point on the breathing system."
    }
  ];

  const boylesViva = [
    { id: "v1_boyles", type: "identify", componentId: "cylinder_O2_boyles", prompt: "Identify this component.", correctAnswer: "Oxygen Cylinder", explanation: "Backup/primary O2 supply, high-pressure system, mounted via a Pin Index yoke." },
    { id: "v2_boyles", type: "function", componentId: "vaporizer_boyles", prompt: "What is the function of this component?", correctAnswer: "Adds a controlled concentration of volatile anaesthetic agent to the fresh gas.", explanation: "Agent-specific, calibrated for one volatile agent only." },
    { id: "v3_boyles", type: "trace", prompt: "Trace oxygen from source to patient (select the pathway).", correctPath: "O2", explanation: "Cylinder/pipeline → pressure regulation → flowmeter → common gas outlet → breathing system → patient." },
    { id: "v4_boyles", type: "system", componentId: "pressure_regulator_O2_boyles", prompt: "Which pressure system does this component belong to?", correctAnswer: "Boundary of HIGH-PRESSURE and INTERMEDIATE-PRESSURE systems", explanation: "The regulator is exactly the transition point between the two." },
    { id: "v5_boyles", type: "failure", componentId: "apl_valve_boyles", prompt: "What happens if this component fails closed?", correctAnswer: "Circuit pressure can rise dangerously — barotrauma risk.", explanation: "The APL valve is the main pressure-relief point on the breathing system." },
    { id: "v6_boyles", type: "identify", componentId: "co2_absorber_boyles", prompt: "Identify this component.", correctAnswer: "CO2 Absorber Canister", explanation: "Contains CO2-absorbing medium (traditionally soda lime) for a circle system." }
  ];

  // ==========================================================================
  // MODERN ANAESTHESIA WORKSTATION
  // ==========================================================================
  const modernComponents = [
    { id: "frame_modern", name: "Workstation Cart", category: "Structure", system: "frame", internal: false,
      description: "The mobile cart body integrating gas supply, electronic flow control, vaporizers, ventilator, monitor and drawers into a single workstation.",
      function: "Provides a stable mobile platform and mounting for all systems.", vivaPoints: [], animationId: null, relatedComponents: [] },
    { id: "cylinder_O2_modern", name: "Backup O2 Cylinder", category: "Gas Supply", system: "gasSupply", internal: false, gas: "O2",
      description: "Emergency backup oxygen cylinder mounted on the cart, used if pipeline supply fails.",
      function: "Provides O2 at high pressure as a backup to pipeline supply.", vivaPoints: ["Part of the HIGH-PRESSURE system.", CYLINDER_COLOR_CAVEAT],
      animationId: "highlight-pulse", relatedComponents: ["yoke_O2_modern", "gauge_cylinder_O2_modern"] },
    { id: "cylinder_air_modern", name: "Backup Air Cylinder", category: "Gas Supply", system: "gasSupply", internal: false, gas: "AIR",
      description: "Emergency backup medical air cylinder, where fitted.",
      function: "Provides medical air as backup to pipeline air supply.", vivaPoints: [CYLINDER_COLOR_CAVEAT],
      animationId: "highlight-pulse", relatedComponents: ["yoke_air_modern"] },
    { id: "yoke_O2_modern", name: "O2 Cylinder Yoke (PISS)", category: "Safety / Gas Supply", system: "gasSupply", internal: false,
      description: "Pin-indexed yoke for the backup O2 cylinder.", function: "Mechanically ensures only an O2 cylinder seats here.",
      vivaPoints: ["Pin Index Safety System."], animationId: "pin-index-demo", relatedComponents: ["cylinder_O2_modern"] },
    { id: "yoke_air_modern", name: "Air Cylinder Yoke (PISS)", category: "Safety / Gas Supply", system: "gasSupply", internal: false,
      description: "Pin-indexed yoke for the backup air cylinder, where fitted.", function: "Mechanically ensures only an air cylinder seats here.",
      vivaPoints: ["Pin Index Safety System."], animationId: "pin-index-demo", relatedComponents: ["cylinder_air_modern"] },
    { id: "gauge_cylinder_O2_modern", name: "O2 Cylinder Pressure Gauge", category: "Monitoring", system: "gasSupply", internal: false,
      description: "Displays backup O2 cylinder pressure (often on an electronic gas-supply status panel, model-dependent).",
      function: "Lets the operator check backup O2 content.", vivaPoints: [], animationId: null, relatedComponents: ["cylinder_O2_modern"] },
    { id: "pipeline_inlet_O2_modern", name: "O2 Pipeline Inlet", category: "Gas Supply", system: "gasSupply", internal: false,
      description: "DISS pipeline connection for central O2 supply.", function: "Accepts hospital pipeline O2 at pipeline pressure.",
      vivaPoints: ["Diameter Index Safety System."], animationId: "diss-demo", relatedComponents: ["gauge_pipeline_O2_modern"] },
    { id: "pipeline_inlet_air_modern", name: "Air Pipeline Inlet", category: "Gas Supply", system: "gasSupply", internal: false,
      description: "DISS pipeline connection for central medical air supply.", function: "Accepts hospital pipeline medical air.",
      vivaPoints: [], animationId: "diss-demo", relatedComponents: ["gauge_pipeline_air_modern"] },
    { id: "pipeline_inlet_N2O_modern", name: "N2O Pipeline Inlet", category: "Gas Supply", system: "gasSupply", internal: false,
      description: "DISS pipeline connection for central N2O supply, where fitted.", function: "Accepts hospital pipeline N2O.",
      vivaPoints: ["Many modern workstations omit routine N2O in favour of air/O2 — presence is model/institution-dependent."],
      animationId: "diss-demo", relatedComponents: ["gauge_pipeline_N2O_modern"] },
    { id: "gauge_pipeline_O2_modern", name: "O2 Pipeline Pressure", category: "Monitoring", system: "gasSupply", internal: false,
      description: "Electronic/mechanical display of pipeline O2 pressure.", function: "Confirms pipeline O2 supply status.",
      vivaPoints: [], animationId: null, relatedComponents: ["pipeline_inlet_O2_modern"] },
    { id: "gauge_pipeline_air_modern", name: "Air Pipeline Pressure", category: "Monitoring", system: "gasSupply", internal: false,
      description: "Display of pipeline medical air pressure.", function: "Confirms pipeline air supply status.",
      vivaPoints: [], animationId: null, relatedComponents: ["pipeline_inlet_air_modern"] },
    { id: "gauge_pipeline_N2O_modern", name: "N2O Pipeline Pressure", category: "Monitoring", system: "gasSupply", internal: false,
      description: "Display of pipeline N2O pressure, where fitted.", function: "Confirms pipeline N2O supply status.",
      vivaPoints: [], animationId: null, relatedComponents: ["pipeline_inlet_N2O_modern"] },
    { id: "pressure_regulator_block_modern", name: "Pressure Regulator Block", category: "Pressure Regulation", system: "pressure", internal: true,
      description: "Houses the regulators that step down cylinder/pipeline pressure to a steady intermediate pressure for each gas.",
      function: "Delivers steady intermediate pressure to electronic flow control.", vivaPoints: ["Boundary between HIGH-PRESSURE and INTERMEDIATE-PRESSURE systems."],
      animationId: "pressure-drop-demo", relatedComponents: ["flow_control_module_modern"] },
    { id: "flow_control_module_modern", name: "Electronic Flow Control", category: "Flow Control", system: "flow", internal: false,
      description: "Electronically metered flow control replacing traditional needle valves on many modern workstations (model-dependent implementation).",
      function: "Sets fresh gas composition and total flow, read out on the flowmeter display.", vivaPoints: ["Still conceptually the LOW-PRESSURE system stage, just electronically implemented."],
      animationId: "flow-bobbin", relatedComponents: ["flowmeter_display_modern"] },
    { id: "flowmeter_display_modern", name: "Flow / Gas Display", category: "Monitoring", system: "flow", internal: false,
      description: "Digital display of set/measured flows and fresh gas composition.", function: "Shows the operator the current flow settings and O2 percentage.",
      vivaPoints: [], animationId: null, relatedComponents: ["flow_control_module_modern"] },
    { id: "vaporizer_1_modern", name: "Vaporizer 1", category: "Vaporizer", system: "vaporizer", internal: false,
      description: "Agent-specific vaporizer, one of typically two mounted side-by-side on the manifold.",
      function: "Adds a controlled concentration of its designated volatile agent to fresh gas.", vivaPoints: ["Interlocked with the second vaporizer so only one can be active at a time (model-dependent)."],
      animationId: "vaporizer-dial", relatedComponents: ["vaporizer_2_modern", "common_gas_outlet_modern"] },
    { id: "vaporizer_2_modern", name: "Vaporizer 2", category: "Vaporizer", system: "vaporizer", internal: false,
      description: "Second agent-specific vaporizer position, where fitted.", function: "Adds a controlled concentration of a different volatile agent to fresh gas.",
      vivaPoints: ["Interlocked with Vaporizer 1."], animationId: "vaporizer-dial", relatedComponents: ["vaporizer_1_modern", "common_gas_outlet_modern"] },
    { id: "common_gas_outlet_modern", name: "Common Gas Outlet", category: "Gas Delivery", system: "vaporizer", internal: false,
      description: "Point where mixed fresh gas leaves the gas-delivery system toward the breathing circuit.",
      function: "Delivers final fresh gas mixture to the breathing circuit.", vivaPoints: [], animationId: null, relatedComponents: ["breathing_circuit_modern"] },
    { id: "breathing_circuit_modern", name: "Breathing Circuit", category: "Breathing System", system: "breathing", internal: false,
      description: "Circle breathing system with separate inspiratory and expiratory limbs.", function: "Carries fresh/inspired gas to the patient and exhaled gas back through the absorber.",
      vivaPoints: [], animationId: "gas-flow-pulse", relatedComponents: ["inspiratory_valve_modern", "expiratory_valve_modern", "co2_absorber_modern"] },
    { id: "inspiratory_valve_modern", name: "Inspiratory One-Way Valve", category: "Breathing System", system: "breathing", internal: true,
      description: "Unidirectional valve ensuring inspired gas flows only toward the patient.", function: "Prevents rebreathing of gas straight from the inspiratory limb without absorber passage.",
      vivaPoints: ["A stuck/incompetent unidirectional valve is a classic circle-system fault to know for viva."],
      animationId: "valve-flap", relatedComponents: ["expiratory_valve_modern"] },
    { id: "expiratory_valve_modern", name: "Expiratory One-Way Valve", category: "Breathing System", system: "breathing", internal: true,
      description: "Unidirectional valve ensuring expired gas flows only away from the patient toward the absorber.", function: "Directs exhaled gas through the absorber, not back to the patient directly.",
      vivaPoints: [], animationId: "valve-flap", relatedComponents: ["inspiratory_valve_modern"] },
    { id: "co2_absorber_modern", name: "CO2 Absorber Canister", category: "Breathing System", system: "absorber", internal: false,
      description: "Canister of CO2-absorbing medium in the circle system.", function: "Removes CO2 from rebreathed gas.",
      vivaPoints: ["Exhaustion indicators are absorbent/model-dependent."], animationId: "absorber-glow", relatedComponents: ["breathing_circuit_modern"] },
    { id: "apl_valve_modern", name: "APL Valve", category: "Safety / Breathing System", system: "breathing", internal: false,
      description: "Adjustable pressure-limiting valve for manual/spontaneous ventilation modes.", function: APL_PRINCIPLE,
      vivaPoints: ["Usually bypassed automatically when the ventilator is switched to mechanical modes (model-dependent bag/vent switch)."],
      animationId: "apl-vent", relatedComponents: ["reservoir_bag_modern", "ventilator_unit_modern"] },
    { id: "reservoir_bag_modern", name: "Reservoir Bag", category: "Breathing System", system: "breathing", internal: false,
      description: "Manual ventilation bag, used when the bag/ventilator selector is set to manual/spontaneous.", function: "Allows manual ventilation and tactile/visual monitoring of breathing.",
      vivaPoints: [], animationId: "bag-breathe", relatedComponents: ["apl_valve_modern"] },
    { id: "ventilator_unit_modern", name: "Ventilator Unit", category: "Ventilator", system: "ventilator", internal: false,
      description: "Integrated mechanical ventilator module.", function: "Automates inspiration/expiration once switched from manual/spontaneous mode.",
      vivaPoints: ["Bellows or piston-driven, model-dependent — see Ventilator Mode for the educational visualisation."],
      animationId: "ventilator-cycle", relatedComponents: ["ventilator_bellows_modern", "ventilator_controls_modern"] },
    { id: "ventilator_bellows_modern", name: "Bellows / Piston Mechanism", category: "Ventilator", system: "ventilator", internal: true,
      description: "The moving element (bellows or piston, model-dependent) that drives gas into the breathing circuit during mechanical inspiration.",
      function: "Physically displaces gas into the circuit each mechanical breath.", vivaPoints: ["An ascending bellows that fails to rise during expiration can indicate a leak or disconnection (bellows-type ventilators)."],
      animationId: "ventilator-cycle", relatedComponents: ["ventilator_unit_modern"] },
    { id: "ventilator_controls_modern", name: "Ventilator Control Panel", category: "Ventilator", system: "ventilator", internal: false,
      description: "Panel of controls/soft-keys for setting ventilator mode and parameters.", function: "Lets the operator select ventilation mode and set VT/RR/PEEP/FiO2/I:E.",
      vivaPoints: [], animationId: null, relatedComponents: ["ventilator_unit_modern"] },
    { id: "scavenging_interface_modern", name: "Scavenging Interface", category: "Scavenging", system: "scavenging", internal: false,
      description: "Connection carrying vented/excess gas away from the breathing system and ventilator relief.", function: SCAVENGING_PRINCIPLE,
      vivaPoints: [], animationId: "gas-flow-pulse", relatedComponents: ["apl_valve_modern", "ventilator_unit_modern"] },
    { id: "monitor_screen_modern", name: "Patient Monitor", category: "Monitoring", system: "monitor", internal: false,
      description: "Integrated or attached physiological monitor displaying ASA-standard basic anaesthetic monitoring parameters.",
      function: "Displays ECG, SpO2, NIBP, EtCO2/capnography, respiratory rate, temperature and (where applicable) inspired/expired gas and airway pressure data.",
      vivaPoints: ["See Monitor mode for full interactive detail."], animationId: null, relatedComponents: [] },
    { id: "battery_indicator_modern", name: "Battery / Power Indicator", category: "Power", system: "power", internal: false,
      description: "Indicates mains power status and internal battery backup charge.", function: "Warns the operator before battery backup is exhausted during a power failure.",
      vivaPoints: ["Internal battery backup duration is model-dependent — always know your specific machine's rated backup time."],
      animationId: "battery-blink", relatedComponents: [] },
    { id: "drawer_1_modern", name: "Drawer 1", category: "Storage", system: "drawer", internal: false,
      description: "Storage drawer — example contents only (see Phase 10 note below).", function: "Bedside storage for commonly used airway/IV items.",
      vivaPoints: [], animationId: "drawer-slide", relatedComponents: [] },
    { id: "drawer_2_modern", name: "Drawer 2", category: "Storage", system: "drawer", internal: false,
      description: "Storage drawer — example contents only.", function: "Bedside storage for commonly used items.",
      vivaPoints: [], animationId: "drawer-slide", relatedComponents: [] },
    { id: "drawer_3_modern", name: "Drawer 3", category: "Storage", system: "drawer", internal: false,
      description: "Storage drawer — example contents only.", function: "Bedside storage for commonly used items.",
      vivaPoints: [], animationId: "drawer-slide", relatedComponents: [] }
  ];

  const modernSafety = [
    { id: "piss_modern", name: "Pin Index Safety System", scope: UNIVERSAL, componentIds: ["yoke_O2_modern", "yoke_air_modern"], principle: PISS_PRINCIPLE, demo: "A cylinder cannot be seated on the wrong yoke.", failure: "incorrect_cylinder_yoke" },
    { id: "diss_modern", name: "Diameter Index Safety System", scope: UNIVERSAL, componentIds: ["pipeline_inlet_O2_modern", "pipeline_inlet_air_modern", "pipeline_inlet_N2O_modern"], principle: DISS_PRINCIPLE, demo: "Pipeline hoses cannot be cross-connected between gases.", failure: null },
    { id: "hypoxic_guard_modern", name: "Hypoxic Guard (Proportioning System)", scope: MACHINE_SPECIFIC, componentIds: ["flow_control_module_modern"], principle: HYPOXIC_GUARD_PRINCIPLE, demo: "Electronic flow control refuses to deliver a fresh-gas O2 percentage below the guarded minimum.", failure: "hypoxic_mixture" },
    { id: "o2_failure_protection_modern", name: "Oxygen Failure Protection Device", scope: UNIVERSAL, componentIds: ["pressure_regulator_block_modern", "flow_control_module_modern"], principle: OXYGEN_FAILURE_PROTECTION_PRINCIPLE, demo: "Simulated O2 supply loss cuts N2O/other gases and triggers an alarm.", failure: "o2_pipeline_failure" },
    { id: "vaporizer_interlock_modern", name: "Vaporizer Interlock", scope: MACHINE_SPECIFIC, componentIds: ["vaporizer_1_modern", "vaporizer_2_modern"], principle: VAPORIZER_INTERLOCK_PRINCIPLE, demo: "Switching on Vaporizer 2 while Vaporizer 1 is on is mechanically/electronically prevented (model-dependent).", failure: null },
    { id: "agent_keyed_filling_modern", name: "Agent-Specific Keyed Filling", scope: MACHINE_SPECIFIC, componentIds: ["vaporizer_1_modern", "vaporizer_2_modern"], principle: AGENT_KEYED_FILLING_PRINCIPLE, demo: null, failure: "vaporizer_filling_error" },
    { id: "o2_flush_modern", name: "Oxygen Flush Valve", scope: UNIVERSAL, componentIds: ["common_gas_outlet_modern"], principle: OXYGEN_FLUSH_PRINCIPLE, demo: null, failure: null },
    { id: "apl_relief_modern", name: "APL Valve — Pressure Relief", scope: UNIVERSAL, componentIds: ["apl_valve_modern"], principle: APL_PRINCIPLE, demo: "Excess circuit pressure vents through the APL valve during manual/spontaneous modes.", failure: "high_airway_pressure" },
    { id: "vent_disconnect_alarm_modern", name: "Circuit Disconnection / Low-Pressure Alarm", scope: MACHINE_SPECIFIC, componentIds: ["ventilator_unit_modern", "breathing_circuit_modern"], principle: "Modern ventilators monitor airway pressure each breath and alarm if a expected pressure rise fails to occur, suggesting disconnection or major leak.", demo: null, failure: "circuit_disconnection" },
    { id: "vent_high_pressure_alarm_modern", name: "High Airway Pressure Alarm", scope: MACHINE_SPECIFIC, componentIds: ["ventilator_unit_modern"], principle: "The ventilator alarms if airway pressure exceeds a set high-pressure limit and typically cycles to expiration early to protect the patient.", demo: null, failure: "high_airway_pressure" },
    { id: "battery_backup_modern", name: "Battery Backup", scope: MACHINE_SPECIFIC, componentIds: ["battery_indicator_modern"], principle: "Internal battery automatically supports critical machine functions during a mains power failure for a limited, model-dependent duration.", demo: null, failure: "power_failure" },
    { id: "scavenging_modern", name: "Scavenging System", scope: UNIVERSAL, componentIds: ["scavenging_interface_modern"], principle: SCAVENGING_PRINCIPLE, demo: null, failure: null }
  ];

  const modernFailures = {
    incorrect_cylinder_yoke: boylesFailures.incorrect_cylinder_yoke,
    hypoxic_mixture: boylesFailures.hypoxic_mixture,
    o2_pipeline_failure: boylesFailures.o2_pipeline_failure,
    vaporizer_filling_error: boylesFailures.vaporizer_filling_error,
    high_airway_pressure: boylesFailures.high_airway_pressure,
    circuit_disconnection: { title: "Breathing Circuit Disconnection", steps: [
      { state: "NORMAL", text: "Ventilator delivers set tidal volume each breath; airway pressure rises and falls normally." },
      { state: "FAILURE", text: "A circuit connection comes apart." },
      { state: "SAFETY MECHANISM", text: "Ventilator detects failure of expected airway pressure rise / low-pressure condition." },
      { state: "ALARM / CONSEQUENCE", text: "Low-pressure / disconnection alarm sounds; delivered volume falls." },
      { state: "CORRECTIVE ACTION", text: "Follow the circuit from machine to patient to find and reconnect the disconnected joint." }
    ]},
    power_failure: { title: "Mains Power Failure", steps: [
      { state: "NORMAL", text: "Workstation runs on mains power; battery trickle-charges." },
      { state: "FAILURE", text: "Mains power is lost." },
      { state: "SAFETY MECHANISM", text: "Internal battery backup automatically supports critical functions." },
      { state: "ALARM / CONSEQUENCE", text: "Power-failure/battery alarm sounds; battery indicator shows remaining runtime." },
      { state: "CORRECTIVE ACTION", text: "Restore mains power promptly; be ready to ventilate manually if battery runs out (model-dependent backup time)." }
    ]}
  };

  const modernGasPathway = {
    high: ["cylinder_O2_modern", "yoke_O2_modern", "gauge_cylinder_O2_modern", "cylinder_air_modern", "yoke_air_modern"],
    intermediate: ["pipeline_inlet_O2_modern", "gauge_pipeline_O2_modern", "pipeline_inlet_air_modern", "gauge_pipeline_air_modern", "pipeline_inlet_N2O_modern", "gauge_pipeline_N2O_modern", "pressure_regulator_block_modern"],
    low: ["flow_control_module_modern", "flowmeter_display_modern", "vaporizer_1_modern", "vaporizer_2_modern", "common_gas_outlet_modern"]
  };

  const modernFlowPaths = {
    O2: ["cylinder_O2_modern", "pressure_regulator_block_modern", "flow_control_module_modern", "common_gas_outlet_modern"],
    AIR: ["cylinder_air_modern", "pressure_regulator_block_modern", "flow_control_module_modern", "common_gas_outlet_modern"],
    N2O: ["pipeline_inlet_N2O_modern", "pressure_regulator_block_modern", "flow_control_module_modern", "common_gas_outlet_modern"],
    FRESH_GAS: ["flow_control_module_modern", "vaporizer_1_modern", "common_gas_outlet_modern", "breathing_circuit_modern"],
    VOLATILE: ["vaporizer_1_modern", "common_gas_outlet_modern", "breathing_circuit_modern", "co2_absorber_modern"],
    INSPIRATORY: ["ventilator_unit_modern", "inspiratory_valve_modern", "breathing_circuit_modern"],
    EXPIRATORY: ["breathing_circuit_modern", "expiratory_valve_modern", "co2_absorber_modern"],
    CO2: ["co2_absorber_modern", "apl_valve_modern", "scavenging_interface_modern"]
  };

  const modernStartSequence = [
    { stage: "Gas Supply", componentIds: ["cylinder_O2_modern", "pipeline_inlet_O2_modern"], caption: "Confirm pipeline connections and backup cylinder status." },
    { stage: "Pressure Regulation", componentIds: ["pressure_regulator_block_modern"], caption: "Cylinder/pipeline pressure is regulated to a steady intermediate pressure." },
    { stage: "Flow Control", componentIds: ["flow_control_module_modern"], caption: "Electronic flow control sets fresh gas composition and total flow." },
    { stage: "Vaporizer", componentIds: ["vaporizer_1_modern"], caption: "Volatile agent is added at the dialled concentration." },
    { stage: "Breathing System", componentIds: ["common_gas_outlet_modern", "breathing_circuit_modern", "co2_absorber_modern"], caption: "Fresh gas enters the circuit; CO2 is absorbed from rebreathed gas." },
    { stage: "Ventilator", componentIds: ["ventilator_unit_modern", "ventilator_controls_modern"], caption: "Ventilator takes over cyclical inspiration/expiration once selected." },
    { stage: "Inspiratory Flow", componentIds: ["inspiratory_valve_modern"], caption: "Inspiratory valve directs gas toward the patient during inspiration." },
    { stage: "Expiratory Flow", componentIds: ["expiratory_valve_modern", "scavenging_interface_modern"], caption: "Expiratory valve directs exhaled gas to the absorber; excess is scavenged." }
  ];

  const modernTour = [
    { componentId: "cylinder_O2_modern", caption: "Backup high-pressure O2 supply." },
    { componentId: "pipeline_inlet_O2_modern", caption: "Preferred routine supply: central pipeline at intermediate pressure." },
    { componentId: "pressure_regulator_block_modern", caption: "Regulators create a steady intermediate pressure for flow control." },
    { componentId: "flow_control_module_modern", caption: "Electronic flow control replaces traditional rotameters on many modern workstations." },
    { componentId: "vaporizer_1_modern", caption: "Vaporizer adds volatile agent to the fresh gas." },
    { componentId: "common_gas_outlet_modern", caption: "All fresh gas leaves the machine here." },
    { componentId: "co2_absorber_modern", caption: "CO2 absorber allows safe rebreathing in the circle system." },
    { componentId: "apl_valve_modern", caption: "APL valve protects the circuit during manual/spontaneous ventilation." },
    { componentId: "ventilator_unit_modern", caption: "The integrated ventilator automates mechanical ventilation." },
    { componentId: "monitor_screen_modern", caption: "The patient monitor provides ASA-standard physiological monitoring." },
    { componentId: "scavenging_interface_modern", caption: "Excess/vented gas is scavenged away from the breathing zone." }
  ];

  const modernTroubleshooting = [
    {
      id: "tb_modern_low_vt", title: "Ventilator alarms 'Low Tidal Volume'",
      prompt: "The ventilator alarms low delivered tidal volume. Which component would you check first?",
      candidateComponentIds: ["breathing_circuit_modern", "vaporizer_1_modern", "monitor_screen_modern", "drawer_1_modern"],
      correctComponentId: "breathing_circuit_modern",
      explanation: "A leak or partial disconnection in the breathing circuit is a common cause of a low delivered/measured tidal volume."
    },
    {
      id: "tb_modern_high_pressure", title: "High airway pressure alarm",
      prompt: "High airway pressure alarms during mechanical ventilation. Which component would you inspect for obstruction?",
      candidateComponentIds: ["breathing_circuit_modern", "cylinder_air_modern", "gauge_pipeline_O2_modern", "battery_indicator_modern"],
      correctComponentId: "breathing_circuit_modern",
      explanation: "Kinking/obstruction anywhere along the breathing circuit (or the patient's airway) is the leading cause to rule out first."
    },
    {
      id: "tb_modern_o2_supply", title: "Oxygen supply failure alarm",
      prompt: "An oxygen supply failure alarm sounds. What should you check/switch to immediately?",
      candidateComponentIds: ["cylinder_O2_modern", "vaporizer_2_modern", "drawer_2_modern", "co2_absorber_modern"],
      correctComponentId: "cylinder_O2_modern",
      explanation: "Confirm/open the backup O2 cylinder immediately while investigating the pipeline supply fault."
    }
  ];

  const modernViva = [
    { id: "v1_modern", type: "identify", componentId: "ventilator_unit_modern", prompt: "Identify this component.", correctAnswer: "Ventilator Unit", explanation: "Automates mechanical ventilation once selected from manual/spontaneous mode." },
    { id: "v2_modern", type: "function", componentId: "co2_absorber_modern", prompt: "What is the function of this component?", correctAnswer: "Removes CO2 from rebreathed gas in the circle system.", explanation: "Allows safe low-flow rebreathing anaesthesia." },
    { id: "v3_modern", type: "trace", prompt: "Trace oxygen from source to patient (select the pathway).", correctPath: "O2", explanation: "Cylinder/pipeline → pressure regulation → electronic flow control → common gas outlet → breathing circuit → patient." },
    { id: "v4_modern", type: "system", componentId: "flow_control_module_modern", prompt: "Which pressure system does this component belong to?", correctAnswer: "LOW-PRESSURE system", explanation: "Flow control and everything downstream of it (vaporizer, common gas outlet) is the low-pressure system." },
    { id: "v5_modern", type: "failure", componentId: "battery_indicator_modern", prompt: "What happens if mains power fails?", correctAnswer: "Internal battery backup supports critical functions for a limited time.", explanation: "Always know your specific workstation's rated battery backup duration." }
  ];

  const modernDrawers = [
    {
      id: "drawer_1_modern",
      name: "Drawer 1 — Example Airway Set-Up",
      note: "Example contents for teaching purposes only — not a universal or institutional standard configuration.",
      items: [
        { id: "item_lma", name: "Supraglottic Airway Device", category: "Airway", function: "Provides a hands-free airway without tracheal intubation.", description: "Example item; sizes/types stocked vary by institution.", vivaPoints: ["Know the sizing convention (typically by patient weight) for the device your institution stocks."] },
        { id: "item_laryngoscope", name: "Laryngoscope", category: "Airway", function: "Provides a view of the larynx to guide tracheal tube placement.", description: "Example item; blade type/size varies by institution and patient.", vivaPoints: ["Always check light source function before use."] },
        { id: "item_ett", name: "Tracheal Tube", category: "Airway", function: "Secures a definitive airway once placed through the vocal cords.", description: "Example item; size chosen per patient.", vivaPoints: ["Cuff pressure should be checked/monitored once placed."] }
      ]
    },
    {
      id: "drawer_2_modern",
      name: "Drawer 2 — Example IV/Emergency Set-Up",
      note: "Example contents for teaching purposes only — not a universal or institutional standard configuration.",
      items: [
        { id: "item_cannula", name: "IV Cannula", category: "Vascular Access", function: "Provides intravenous access for fluids and drugs.", description: "Example item; gauge chosen per clinical need.", vivaPoints: [] },
        { id: "item_syringe", name: "Syringes", category: "Drug Administration", function: "Used to draw up and administer drugs.", description: "Example item.", vivaPoints: ["Always label drawn-up syringes."] },
        { id: "item_emergency_drug_card", name: "Emergency Drug Reference Card", category: "Reference", function: "Quick reference for emergency drug doses.", description: "Example item; exact contents are institution-specific.", vivaPoints: [] }
      ]
    },
    {
      id: "drawer_3_modern",
      name: "Drawer 3 — Example Circuit/Consumables",
      note: "Example contents for teaching purposes only — not a universal or institutional standard configuration.",
      items: [
        { id: "item_facemask", name: "Face Mask", category: "Airway", function: "Provides a seal for pre-oxygenation and bag-mask ventilation.", description: "Example item; sizes stocked vary by institution.", vivaPoints: [] },
        { id: "item_filter", name: "Breathing System Filter", category: "Breathing System", function: "Reduces cross-contamination and moisture transfer in the breathing circuit.", description: "Example item.", vivaPoints: [] },
        { id: "item_gauze", name: "Gauze / Tape", category: "General", function: "General-purpose securing and dressing supplies.", description: "Example item.", vivaPoints: [] }
      ]
    }
  ];

  const modernVentilatorModes = [
    { id: "VCV", name: "Volume-Controlled Ventilation", summary: "A set tidal volume is delivered each breath; resulting airway pressure varies with compliance/resistance." },
    { id: "PCV", name: "Pressure-Controlled Ventilation", summary: "A set inspiratory pressure is delivered each breath; resulting tidal volume varies with compliance/resistance." },
    { id: "SIMV", name: "Synchronized Intermittent Mandatory Ventilation", summary: "Mandatory breaths are synchronised with patient effort where possible, with spontaneous breaths allowed between them." },
    { id: "PSV", name: "Pressure-Support Ventilation", summary: "Patient-triggered breaths are supported with a set inspiratory pressure; rate is largely patient-determined." },
    { id: "CPAP", name: "Continuous Positive Airway Pressure", summary: "A constant positive pressure is maintained while the patient breathes spontaneously." },
    { id: "MANUAL", name: "Manual / Spontaneous", summary: "Ventilator is bypassed; the reservoir bag is used for manual ventilation or to observe spontaneous breathing." }
  ];

  const monitorParams = [
    { id: "ecg", name: "ECG", why: "Continuously screens heart rate and rhythm throughout anaesthesia.", vivaPoint: "ASA basic monitoring standard requires continuous ECG display." },
    { id: "hr", name: "Heart Rate", why: "A key early indicator of light anaesthesia, hypoxia, or haemodynamic instability.", vivaPoint: "Usually derived from both ECG and pleth waveform." },
    { id: "spo2", name: "SpO2", why: "Continuous, non-invasive estimate of arterial oxygen saturation.", vivaPoint: "Pulse oximetry is part of ASA basic anaesthetic monitoring." },
    { id: "nibp", name: "NIBP", why: "Intermittent blood pressure measurement to detect hypo-/hypertension.", vivaPoint: "Cycle interval is set by the operator; invasive arterial monitoring is used for beat-to-beat data when needed." },
    { id: "etco2", name: "EtCO2 / Capnography", why: "Continuous assessment of ventilation and confirmation of exhaled CO2 (e.g. confirms tracheal tube placement, detects disconnection/apnoea/hypo- or hyperventilation).", vivaPoint: "ASA basic monitoring requires continuous capnography during general anaesthesia." },
    { id: "rr", name: "Respiratory Rate", why: "Tracks ventilation frequency; usually derived from the capnogram or chest impedance.", vivaPoint: "" },
    { id: "temp", name: "Temperature", why: "Detects intraoperative hypothermia (or, rarely, malignant hyperthermia-related rise).", vivaPoint: "ASA basic monitoring requires a means to monitor temperature when clinically significant changes are intended/anticipated." },
    { id: "fio2", name: "FiO2 / Inspired O2", why: "Confirms the delivered inspired oxygen concentration reaching the patient.", vivaPoint: "An inspired-oxygen analyser with a low-concentration alarm is a basic monitoring requirement during general anaesthesia with an anaesthesia machine." },
    { id: "agent", name: "Inspired/Expired Volatile Agent & MAC", why: "Confirms delivered anaesthetic depth in volatile-agent terms.", vivaPoint: "MAC is agent- and age-dependent; displayed MAC is a guide, not a depth-of-anaesthesia monitor." },
    { id: "paw", name: "Airway Pressure", why: "Detects circuit obstruction, disconnection, or excessive pressure.", vivaPoint: "" },
    { id: "peep", name: "PEEP", why: "Shows the positive end-expiratory pressure currently applied.", vivaPoint: "" },
    { id: "vt", name: "Tidal Volume", why: "Confirms delivered/measured breath size.", vivaPoint: "" },
    { id: "mv", name: "Minute Ventilation", why: "Tidal volume × respiratory rate — an overall ventilation adequacy check.", vivaPoint: "" }
  ];

  const alarmScenarios = [
    { id: "alarm_low_spo2", name: "Low SpO2", parameter: "spo2", causes: ["Hypoventilation/apnoea", "Circuit disconnection", "Oesophageal intubation", "Oxygen supply problem", "Probe malposition/artifact"], componentIds: ["breathing_circuit_modern", "ventilator_unit_modern"] },
    { id: "alarm_high_paw", name: "High Airway Pressure", parameter: "paw", causes: ["Circuit/airway obstruction", "Bronchospasm", "Breath-stacking", "Light anaesthesia/coughing/straining"], componentIds: ["breathing_circuit_modern"] },
    { id: "alarm_low_paw", name: "Low Airway Pressure / Disconnection", parameter: "paw", causes: ["Circuit disconnection", "Major leak", "Cuff leak"], componentIds: ["breathing_circuit_modern"] },
    { id: "alarm_apnoea", name: "Apnoea", parameter: "etco2", causes: ["Ventilator failure", "Circuit disconnection", "Complete obstruction", "Excessive neuromuscular blockade/opioid without ventilatory support"], componentIds: ["ventilator_unit_modern", "breathing_circuit_modern"] },
    { id: "alarm_low_etco2", name: "Low EtCO2", parameter: "etco2", causes: ["Hyperventilation", "Circuit leak/disconnection", "Reduced cardiac output/pulmonary perfusion"], componentIds: ["breathing_circuit_modern"] },
    { id: "alarm_high_etco2", name: "High EtCO2", parameter: "etco2", causes: ["Hypoventilation", "Rebreathing (e.g. exhausted absorbent)", "Increased CO2 production (e.g. malignant hyperthermia — rare)"], componentIds: ["co2_absorber_modern"] },
    { id: "alarm_low_fio2", name: "Low FiO2", parameter: "fio2", causes: ["Hypoxic guard limit reached at high N2O flow", "O2 supply problem", "Analyser fault"], componentIds: ["flow_control_module_modern"] },
    { id: "alarm_low_vt", name: "Low Tidal Volume", parameter: "vt", causes: ["Circuit leak/disconnection", "Increased airway resistance limiting delivered volume in PCV", "Ventilator fault"], componentIds: ["breathing_circuit_modern", "ventilator_unit_modern"] },
    { id: "alarm_o2_supply_failure", name: "Oxygen Supply Failure", parameter: "fio2", causes: ["Pipeline O2 failure", "Backup cylinder empty/closed"], componentIds: ["cylinder_O2_modern", "pipeline_inlet_O2_modern"] }
  ];

  const showMeIndex = [
    { label: "Oxygen pathway", flowKey: "O2" },
    { label: "High-pressure system", pathwayKey: "high" },
    { label: "Intermediate-pressure system", pathwayKey: "intermediate" },
    { label: "Low-pressure system", pathwayKey: "low" },
    { label: "Vaporizer", componentMatch: "vaporizer" },
    { label: "CO2 absorber", componentMatch: "absorber" },
    { label: "APL valve", componentMatch: "apl_valve" },
    { label: "Ventilator", componentMatch: "ventilator_unit" },
    { label: "Inspiratory valve", componentMatch: "inspiratory_valve" },
    { label: "Expiratory valve", componentMatch: "expiratory_valve" },
    { label: "Scavenging", componentMatch: "scavenging" },
    { label: "Breathing circuit", componentMatch: "breathing" }
  ];

  // ---- Node/metadata contract normalization -------------------------------
  // Every component gets the full documented contract (see
  // VENTILATOR_3D_ASSET_SPEC.md): id, name, category, description,
  // function, system, safetyFeature, vivaPoints, tourStep, animationId,
  // internal, rearView, flowPath. isHousing/rearView/safetyFeature/
  // tourStep/flowPath are DERIVED here from the arrays already defined
  // above (safetyFeatures[].componentIds, tourSteps[].componentId,
  // flowPaths) rather than hand-duplicated on every component literal, so
  // there is exactly one place that can get out of sync with the other.
  function normalizeMachine(machine) {
    const byId = {};
    machine.components.forEach(c => {
      c.isHousing = !!c.isHousing || /^frame_/.test(c.id);
      c.rearView = !!c.rearView || /^(cylinder_|yoke_|gauge_cylinder_|pipeline_inlet_|gauge_pipeline_)/.test(c.id);
      c.safetyFeature = [];
      c.tourStep = [];
      c.flowPath = [];
      byId[c.id] = c;
    });
    (machine.safetyFeatures || []).forEach(f => {
      (f.componentIds || []).forEach(id => { if (byId[id]) byId[id].safetyFeature.push(f.id); });
    });
    (machine.tourSteps || []).forEach((step, i) => {
      if (step.componentId && byId[step.componentId]) byId[step.componentId].tourStep.push(i);
    });
    Object.entries(machine.flowPaths || {}).forEach(([gasKey, ids]) => {
      ids.forEach(id => { if (byId[id]) byId[id].flowPath.push(gasKey); });
    });
    return machine;
  }

  const ventilatorData = {
    machines: {
      boyles: {
        id: "boyles",
        name: "Boyle's Anaesthesia Machine",
        shortName: "Boyle's Machine",
        kicker: "CLASSIC ANAESTHESIA DELIVERY SYSTEM",
        description: "The traditional pneumatic anaesthesia machine: cylinder/pipeline gas supply, mechanical pressure regulation, rotameter flow control, an agent-specific vaporizer, and a circle breathing system operated manually or via spontaneous ventilation.",
        hasVentilator: false,
        hasMonitor: false,
        hasDrawers: false,
        components: boylesComponents,
        gasPathway: boylesGasPathway,
        flowPaths: boylesFlowPaths,
        safetyFeatures: boylesSafety,
        failureScenarios: boylesFailures,
        startSequence: boylesStartSequence,
        tourSteps: boylesTour,
        troubleshooting: boylesTroubleshooting,
        vivaQuestions: boylesViva,
        drawers: [],
        ventilatorModes: [],
        monitorConfig: null,
        cameraPresets: {
          front: { position: [0, 1.35, 3.1], target: [0, 0.85, 0] },
          rear: { position: [0, 1.4, -3.1], target: [0, 0.85, 0] },
          side: { position: [3.1, 1.35, 0], target: [0, 0.85, 0] }
        }
      },
      modern: {
        id: "modern",
        name: "Modern Anaesthesia Workstation",
        shortName: "Modern Workstation",
        kicker: "INTEGRATED ELECTRONIC WORKSTATION",
        description: "An integrated electronic anaesthesia workstation combining gas delivery, an electronic flow/vaporizer system, an integrated mechanical ventilator, patient monitoring, alarms, battery backup and storage drawers.",
        hasVentilator: true,
        hasMonitor: true,
        hasDrawers: true,
        components: modernComponents,
        gasPathway: modernGasPathway,
        flowPaths: modernFlowPaths,
        safetyFeatures: modernSafety,
        failureScenarios: modernFailures,
        startSequence: modernStartSequence,
        tourSteps: modernTour,
        troubleshooting: modernTroubleshooting,
        vivaQuestions: modernViva,
        drawers: modernDrawers,
        ventilatorModes: modernVentilatorModes,
        monitorConfig: { params: monitorParams, alarms: alarmScenarios },
        cameraPresets: {
          front: { position: [0, 1.4, 3.3], target: [0, 0.9, 0] },
          rear: { position: [0, 1.5, -3.3], target: [0, 0.9, 0] },
          side: { position: [3.3, 1.4, 0], target: [0, 0.9, 0] }
        }
      }
    },
    showMeIndex: showMeIndex,
    pressureSystemLabels: {
      high: "HIGH-PRESSURE SYSTEM",
      intermediate: "INTERMEDIATE-PRESSURE SYSTEM",
      low: "LOW-PRESSURE SYSTEM"
    },
    pressureSystemExplain: {
      high: "From the cylinder valve to the pressure regulator — full, variable cylinder pressure.",
      intermediate: "From the pressure regulator (and pipeline inlet) to the flow control valves — steady reduced pressure.",
      low: "From the flow control valves, through the vaporizer, to the common gas outlet — pressure close to that needed by the breathing system."
    },
    getComponent: function (machineId, componentId) {
      const m = this.machines[machineId];
      if (!m) return null;
      return m.components.find(c => c.id === componentId) || null;
    }
  };

  normalizeMachine(ventilatorData.machines.boyles);
  normalizeMachine(ventilatorData.machines.modern);

  window.VentilatorData = ventilatorData;
})();
