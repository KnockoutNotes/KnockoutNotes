#!/usr/bin/env python3
"""
Generate study-structures.js — accurate 2D skeletal-formula chemical
structure diagrams for Study Mode drug pages.

Requires: pip install rdkit

Renders each drug's SMILES to a clean inline SVG (currentColor strokes, no
background, so it tints with the page's own text colour in both themes),
cross-checks the resulting molecular formula against a known reference
value, and writes window.KN_STRUCTURES as a JS file consumed by
study-ui.js's structureBodyHTML().

Deliberately uses plain-connectivity SMILES (no stereodescriptors) — a
standard simplification for a quick-reference structure diagram, and it
avoids the real risk of misremembering exact stereochemistry for a complex
molecule. Only includes drugs whose core connectivity is well-established
and confidently known; complex steroidal/bis-quaternary neuromuscular
blockers (rocuronium, vecuronium, atracurium, cisatracurium, pancuronium,
mivacurium, gantacurium), morphinan-skeleton opioids (morphine,
hydromorphone), newer/less-standard agents (remimazolam, cipepofol), and
biologics (sugammadex, vasopressin) are intentionally left out rather than
guessed at — run this script again with an addition only after verifying
the SMILES against a primary source (PubChem/DrugBank), and check that the
printed formula matches the reference before trusting the output.

Run from the repo root:
    python3 scripts/generate_chemical_structures.py
"""
import os
import re
import json

from rdkit import Chem
from rdkit.Chem import AllChem, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D

# Plain-connectivity SMILES (no stereochemistry — see module docstring).
SMILES = {
    "propofol": "CC(C)c1cccc(C(C)C)c1O",
    "etomidate": "CCOC(=O)c1cncn1C(C)c1ccccc1",
    "ketamine": "CNC1(c2ccccc2Cl)CCCCC1=O",
    "thiopental": "CCCC(C)C1(CC)C(=O)NC(=S)NC1=O",
    "midazolam": "Cc1ncc2n1-c1ccc(Cl)cc1C(=NC2)c1ccccc1F",
    "succinylcholine": "C[N+](C)(C)CCOC(=O)CCC(=O)OCC[N+](C)(C)C",
    "neostigmine": "C[N+](C)(C)c1cccc(OC(=O)N(C)C)c1",
    "fentanyl": "CCC(=O)N(c1ccccc1)C1CCN(CCc2ccccc2)CC1",
    "remifentanil": "COC(=O)C1(N(C(=O)CC)c2ccccc2)CCN(CCC(=O)OC)CC1",
    "sufentanil": "CCC(=O)N(c1ccccc1)C1(COC)CCN(CCc2cccs2)CC1",
    "alfentanil": "CCC(=O)N(c1ccccc1)C1(COC)CCN(CCN2N=NN(CC)C2=O)CC1",
    "ketorolac": "OC(=O)C1CCn2c1ccc2C(=O)c1ccccc1",
    "ibuprofen": "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
    "diclofenac": "OC(=O)Cc1ccccc1Nc1c(Cl)cccc1Cl",
    "celecoxib": "Cc1ccc(cc1)-c1cc(nn1-c1ccc(cc1)S(N)(=O)=O)C(F)(F)F",
    "paracetamol": "CC(=O)Nc1ccc(O)cc1",
    "phenylephrine": "CNCC(O)c1cccc(O)c1",
    "norepinephrine": "NCC(O)c1ccc(O)c(O)c1",
    "epinephrine": "CNCC(O)c1ccc(O)c(O)c1",
    "dopamine": "NCCc1ccc(O)c(O)c1",
    "dobutamine": "CC(CCc1ccc(O)cc1)NCCc1ccc(O)c(O)c1",
    "lidocaine": "CCN(CC)CC(=O)Nc1c(C)cccc1C",
    "bupivacaine": "CCCCN1CCCCC1C(=O)Nc1c(C)cccc1C",
    "ropivacaine": "CCCN1CCCCC1C(=O)Nc1c(C)cccc1C",
    "mepivacaine": "CN1CCCCC1C(=O)Nc1c(C)cccc1C",
    "chloroprocaine": "CCN(CC)CCOC(=O)c1ccc(N)cc1Cl",
}

# Known reference molecular formula (free base / parent cation, no salt) —
# a hard cross-check against what RDKit computes from each SMILES. Any
# mismatch means the SMILES is wrong and the script refuses to emit it.
REFERENCE_FORMULA = {
    "propofol": "C12H18O", "etomidate": "C14H16N2O2", "ketamine": "C13H16ClNO",
    "thiopental": "C11H18N2O2S", "midazolam": "C18H13ClFN3",
    "succinylcholine": "C14H30N2O4+2", "neostigmine": "C12H19N2O2+",
    "fentanyl": "C22H28N2O", "remifentanil": "C20H28N2O5",
    "sufentanil": "C22H30N2O2S", "alfentanil": "C21H32N6O3",
    "ketorolac": "C15H13NO3", "ibuprofen": "C13H18O2", "diclofenac": "C14H11Cl2NO2",
    "celecoxib": "C17H14F3N3O2S", "paracetamol": "C8H9NO2",
    "phenylephrine": "C9H13NO2", "norepinephrine": "C8H11NO3", "epinephrine": "C9H13NO3",
    "dopamine": "C8H11NO2", "dobutamine": "C18H23NO3",
    "lidocaine": "C14H22N2O", "bupivacaine": "C18H28N2O", "ropivacaine": "C17H26N2O",
    "mepivacaine": "C15H22N2O", "chloroprocaine": "C13H19ClN2O2",
}

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 300, 220


def make_svg(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    AllChem.Compute2DCoords(mol)
    drawer = rdMolDraw2D.MolDraw2DSVG(W, H)
    opts = drawer.drawOptions()
    opts.clearBackground = False
    opts.useBWAtomPalette()  # one colour only, so it can be swapped for currentColor
    opts.bondLineWidth = 2
    opts.minFontSize = 14
    opts.maxFontSize = 18
    rdMolDraw2D.PrepareAndDrawMolecule(drawer, mol)
    drawer.FinishDrawing()
    svg = drawer.GetDrawingText()
    svg = svg.replace("#000000", "currentColor")
    m = re.search(r"(<svg.*</svg>)", svg, re.DOTALL)
    svg = m.group(1) if m else svg
    svg = re.sub(r'(<svg[^>]*?)\s+width="[\d.]+px"', r"\1", svg)
    svg = re.sub(r'(<svg[^>]*?)\s+height="[\d.]+px"', r"\1", svg)
    formula = rdMolDescriptors.CalcMolFormula(mol)
    return svg, formula


def main():
    entries = {}
    mismatches = []
    for drug_id, smi in SMILES.items():
        out = make_svg(smi)
        if out is None:
            print(f"FAILED TO PARSE: {drug_id} -> {smi}")
            continue
        svg, formula = out
        expected = REFERENCE_FORMULA.get(drug_id)
        ok = formula == expected
        print(f"{drug_id:20s} {formula:20s} {'OK' if ok else f'MISMATCH (expected {expected})'}")
        if not ok:
            mismatches.append(drug_id)
            continue
        entries[drug_id] = {"svg": svg, "formula": formula}

    if mismatches:
        raise SystemExit(f"Refusing to write output — formula mismatches: {mismatches}")

    lines = [
        "/* ==========================================================================",
        "   KNOCKOUTNOTES — Drug chemical structure diagrams (study-structures.js)",
        "   Accurate 2D skeletal-formula SVGs generated with RDKit from verified SMILES",
        "   (plain connectivity, stereochemistry omitted by design — see",
        "   scripts/generate_chemical_structures.py). Each molecular formula was",
        "   cross-checked against the known reference formula before being included.",
        "   Complex steroidal/bis-quaternary neuromuscular blockers, morphinan-skeleton",
        "   opioids, and biologics (sugammadex, vasopressin) are intentionally left out",
        "   rather than guessed at.",
        "   ========================================================================== */",
        "window.KN_STRUCTURES = {",
    ]
    for drug_id, e in entries.items():
        lines.append(f'  {drug_id}: {{ formula: {json.dumps(e["formula"])}, svg: {json.dumps(e["svg"])} }},')
    lines.append("};")

    out_path = os.path.join(REPO_ROOT, "study-structures.js")
    with open(out_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\nWrote {out_path} ({len(entries)} structures)")


if __name__ == "__main__":
    main()
