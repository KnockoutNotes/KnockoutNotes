/* ==========================================================================
   KNOCKOUTNOTES — Anaesthesia Workstation contextual reference diagrams
   (ventilator-schematics.js)

   Phase 5: the previously hand-drawn SVG schematics were removed at the
   user's request (risk of inventing/misrepresenting gas-path or mechanical
   detail). This module now points hotspots at the user-supplied reference
   images instead — unmodified image assets, not redrawn or reinterpreted.
   The images live in assets/references/ at their original resolution.
   ventilator-ui.js renders them as <img> inside the schematic modal, on a
   light "paper" card (not colour-inverted — see note there) so the
   diagram's own colours/labels/arrows stay exactly as supplied.
   ========================================================================== */

export const SCHEMATICS = {
  "cylinder-connection": {
    title: "Cylinder Valve, Pin-Index & Yoke — Reference Diagram",
    image: "assets/references/cylinder-valve-pin-index-yoke-diagram.jpg",
    alt: "Reference diagram of a gas cylinder valve assembly showing the T-handle, cylinder valve, gasket, gas outlet, hanger yoke check valve and pin-index configuration."
  },
  "yoke-check-valve": {
    title: "Cylinder-Yoke Check Valve Cross-Section — Reference Diagram",
    image: "assets/references/cylinder-yoke-check-valve-cross-section.jpg",
    alt: "Reference cross-section diagram of a cylinder-yoke check valve showing the check valve retainer, valve seat, strainer nipple, cylinder stem, floating check valve, pin-index configuration and T-handle."
  },
  "gas-system": {
    title: "Anaesthesia Gas-Supply Pathway — Reference Diagram",
    image: "assets/references/gas-supply-pathway-schematic.jpg",
    alt: "Reference schematic of an anaesthesia machine gas supply, showing N2O and O2 cylinders, pressure regulators, the fail-safe valve, flowmeters, concentration-calibrated vaporizers with interlock, the low-pressure system, and the common gas outlet to the patient breathing circuit."
  }
};

export function schematicMarkup(id) {
  const s = SCHEMATICS[id];
  if (!s) return null;
  return s;
}
