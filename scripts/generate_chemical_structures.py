#!/usr/bin/env python3
"""
Generate study-structures.js — accurate 2D skeletal-formula chemical
structure diagrams for Study Mode drug pages.

Requires: pip install rdkit

Renders each drug's structure to a clean inline SVG (currentColor strokes,
no background, so it tints with the page's own text colour in both themes),
cross-checks the resulting molecular formula against a known reference
value, and writes window.KN_STRUCTURES as a JS file consumed by
study-ui.js's structureBodyHTML().

Two construction methods, chosen per drug by confidence:

  1. SMILES (SMILES_ENTRIES) — plain connectivity, stereochemistry omitted
     by design (standard for a quick-reference diagram, and it avoids the
     real risk of misremembering exact stereodescriptors). Used for
     straightforward small molecules.

  2. Programmatic RWMol construction (BUILDER_ENTRIES) — used for the
     aminosteroid and bis-benzylisoquinolinium neuromuscular blockers,
     whose fused/bridged ring systems are too easy to get subtly wrong in
     a hand-typed ring-closure SMILES. Building bond-by-bond from named
     ring positions, then verifying both molecular formula AND ring-size
     pattern (e.g. a steroid must come out as four fused rings sized
     [5,6,6,6]) catches connectivity errors that formula-matching alone
     would miss.

Only includes drugs with well-established, confidently-known structures.

The morphinan-family opioids (morphine, hydromorphone, naloxone,
naltrexone, nalbuphine, buprenorphine) and the benzomorphan pentazocine
share the same bridged/fused ring risk that excluded morphine and
hydromorphone from earlier revisions of this script — but rather than
hand-typing a fused-ring SMILES from memory (the exact mistake that risk
is about), these are generated from each drug's standard IUPAC/
pharmacopoeial systematic name via OPSIN (py2opsin — a deterministic,
fully offline, rule-based name-to-structure parser; no memory-recall risk
for the CONNECTIVITY itself, only for correctly recalling the name,
which is well-documented and independently cross-checked here against
each drug's known molecular formula AND expected ring-size pattern
(EXPECTED_RING_SIZES), exactly like the BUILDER_ENTRIES below). See
`_OPSIN_NAMES` for the exact names used.

Deliberately excluded: mivacurium/gantacurium (isomeric enough to the
atracurium family that a subtle wrong substituent wouldn't be caught by
these checks), remimazolam/cipepofol (newer, lower confidence), and the
biologics sugammadex (cyclodextrin macrocycle) / vasopressin (cyclic
peptide) — not small molecules suited to a skeletal diagram in the first
place.

Run from the repo root:
    python3 scripts/generate_chemical_structures.py
"""
import json
import os
import re

from rdkit import Chem
from rdkit.Chem import AllChem, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 300, 220
W_WIDE, H_WIDE = 420, 280  # for the larger bis-quaternary NMBs

# --------------------------------------------------------------------------
# 1. SMILES-based entries (plain connectivity, no stereochemistry)
# --------------------------------------------------------------------------
SMILES_ENTRIES = {
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
    "tramadol": "COc1cccc(C2(O)CCCCC2CN(C)C)c1",
    "pethidine": "CCOC(=O)C1(c2ccccc2)CCN(C)CC1",
}

# --------------------------------------------------------------------------
# 1b. Morphinan/benzomorphan-family opioids — derived from each drug's
#     standard IUPAC/pharmacopoeial systematic name via OPSIN (py2opsin), a
#     deterministic, fully offline, rule-based name-to-structure parser.
#     Their bridged/fused ring systems are exactly the kind that's too easy
#     to get subtly wrong hand-typing a ring-closure SMILES from memory —
#     OPSIN removes that risk for the connectivity itself; the only
#     remaining risk is correctly recalling the name, which is why every
#     one of these is still independently cross-checked below against its
#     known molecular formula AND expected ring-size pattern before being
#     accepted (see EXPECTED_RING_SIZES), exactly like the BUILDER_ENTRIES.
# --------------------------------------------------------------------------
_OPSIN_NAMES = {
    "morphine": "7,8-didehydro-4,5-epoxy-17-methylmorphinan-3,6-diol",
    "hydromorphone": "4,5-epoxy-3-hydroxy-17-methylmorphinan-6-one",
    "naloxone": "4,5-epoxy-3,14-dihydroxy-17-(prop-2-enyl)morphinan-6-one",
    "naltrexone": "4,5-epoxy-3,14-dihydroxy-17-(cyclopropylmethyl)morphinan-6-one",
    "nalbuphine": "17-(cyclobutylmethyl)-4,5-epoxymorphinan-3,6,14-triol",
    "pentazocine": "3-(3-methylbut-2-enyl)-6,11-dimethyl-1,2,3,4,5,6-hexahydro-2,6-methano-3-benzazocin-8-ol",
    "buprenorphine": "17-(cyclopropylmethyl)-7-(2-hydroxy-3,3-dimethylbutan-2-yl)-6-methoxy-4,5-epoxy-6,14-ethanomorphinan-3-ol",
}


def _opsin_smiles_entries():
    """Runs OPSIN on each name in _OPSIN_NAMES and returns a dict of
    drug_id -> flat (stereochemistry-stripped) SMILES, ready to merge into
    SMILES_ENTRIES. A name OPSIN can't parse is skipped (not guessed at) —
    main()'s verification step will then simply have no entry for that
    drug, same as any other excluded drug."""
    try:
        from py2opsin import py2opsin
    except ImportError:
        print("py2opsin not installed (pip install py2opsin) — skipping morphinan-family entries")
        return {}
    out = {}
    for drug_id, name in _OPSIN_NAMES.items():
        smi = py2opsin(name)
        if not smi:
            print(f"OPSIN FAILED to parse name for {drug_id}: {name!r}")
            continue
        mol = Chem.MolFromSmiles(smi)
        if mol is None:
            print(f"RDKit failed to parse OPSIN output for {drug_id}: {smi!r}")
            continue
        Chem.RemoveStereochemistry(mol)
        out[drug_id] = Chem.MolToSmiles(mol)
    return out

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
    "tramadol": "C16H25NO2", "pethidine": "C15H21NO2",
    # bis-quaternary neuromuscular blockers (see BUILDER_ENTRIES below)
    "pancuronium": "C35H60N2O4+2", "vecuronium": "C34H57N2O4+", "rocuronium": "C32H53N2O4+",
    "atracurium": "C53H72N2O12+2", "cisatracurium": "C53H72N2O12+2",
    # morphinan/benzomorphan-family opioids (see _OPSIN_NAMES above)
    "morphine": "C17H19NO3", "hydromorphone": "C17H19NO3",
    "naloxone": "C19H21NO4", "naltrexone": "C20H23NO4", "nalbuphine": "C21H27NO4",
    "pentazocine": "C19H27NO", "buprenorphine": "C29H41NO4",
}

EXPECTED_RING_SIZES = {
    # 5alpha-androstane steroid nucleus (four fused rings, sizes 5-6-6-6)
    # plus the two pendant substituent rings at C2/C16.
    "pancuronium": [5, 6, 6, 6, 6, 6],       # steroid + 2x piperidinium (6)
    "vecuronium": [5, 6, 6, 6, 6, 6],        # steroid + piperidine(6) + piperidinium(6)
    "rocuronium": [5, 5, 6, 6, 6, 6],        # steroid + morpholino(6) + allylpyrrolidinium(5)
    # morphinan core: aromatic ring + 3 more fused carbocyclic/N rings (all
    # 6-membered) + the 4,5-epoxy furan bridge (5-membered) = [5,6,6,6,6].
    # Extra rings come from an N-substituent (cyclopropyl/cyclobutylmethyl)
    # or, for buprenorphine, the additional 6,14-ethano bridge ring system.
    "morphine": [5, 6, 6, 6, 6], "hydromorphone": [5, 6, 6, 6, 6],
    "naloxone": [5, 6, 6, 6, 6],
    "naltrexone": [3, 5, 6, 6, 6, 6],       # + N-cyclopropylmethyl (3-ring)
    "nalbuphine": [4, 5, 6, 6, 6, 6],       # + N-cyclobutylmethyl (4-ring)
    "buprenorphine": [3, 5, 6, 6, 6, 6, 6, 6],  # + N-cyclopropylmethyl + extra ethano-bridge ring
    # benzomorphan: aromatic ring + the bridged azabicyclic system (SSSR
    # reports this bicyclic bridge as two more 6-membered rings).
    "pentazocine": [6, 6, 6],
    # two benzylisoquinolinium halves: 3 six-membered rings each
    "atracurium": [6, 6, 6, 6, 6, 6],
    "cisatracurium": [6, 6, 6, 6, 6, 6],
}


# --------------------------------------------------------------------------
# 2. Programmatic builders — the androstane steroid nucleus and the
#    bis-benzylisoquinolinium scaffold, built bond-by-bond from named
#    positions rather than a hand-typed fused-ring SMILES.
# --------------------------------------------------------------------------
def build_androstane_rw():
    """5alpha-androstane: the fully-saturated steroid nucleus shared by the
    aminosteroid neuromuscular blockers, with standard ring-A/B/C/D atom
    numbering (1-17) plus the two angular methyls (18 on C13, 19 on C10)."""
    mol = Chem.RWMol()
    idx = {}
    for i in range(1, 18):
        idx[i] = mol.AddAtom(Chem.Atom(6))
    idx[18] = mol.AddAtom(Chem.Atom(6))
    idx[19] = mol.AddAtom(Chem.Atom(6))
    bonds = [
        (1, 2), (2, 3), (3, 4), (4, 5), (5, 10), (10, 1),      # ring A
        (5, 6), (6, 7), (7, 8), (8, 9), (9, 10),                # ring B
        (9, 11), (11, 12), (12, 13), (13, 14), (14, 8),          # ring C
        (14, 15), (15, 16), (16, 17), (17, 13),                  # ring D
        (13, 18), (10, 19),
    ]
    for a, b in bonds:
        mol.AddBond(idx[a], idx[b], Chem.BondType.SINGLE)
    return mol, idx


def add_acetoxy(mol, idx, pos):
    o = mol.AddAtom(Chem.Atom(8))
    cc = mol.AddAtom(Chem.Atom(6))
    od = mol.AddAtom(Chem.Atom(8))
    cm = mol.AddAtom(Chem.Atom(6))
    mol.AddBond(idx[pos], o, Chem.BondType.SINGLE)
    mol.AddBond(o, cc, Chem.BondType.SINGLE)
    mol.AddBond(cc, od, Chem.BondType.DOUBLE)
    mol.AddBond(cc, cm, Chem.BondType.SINGLE)


def add_hydroxy(mol, idx, pos):
    o = mol.AddAtom(Chem.Atom(8))
    mol.AddBond(idx[pos], o, Chem.BondType.SINGLE)


def add_piperidinium(mol, idx, pos, n_methyl=True):
    n = mol.AddAtom(Chem.Atom(7))
    mol.GetAtomWithIdx(n).SetFormalCharge(1)
    ring = [mol.AddAtom(Chem.Atom(6)) for _ in range(5)]
    mol.AddBond(idx[pos], n, Chem.BondType.SINGLE)
    mol.AddBond(n, ring[0], Chem.BondType.SINGLE)
    for i in range(4):
        mol.AddBond(ring[i], ring[i + 1], Chem.BondType.SINGLE)
    mol.AddBond(ring[4], n, Chem.BondType.SINGLE)
    if n_methyl:
        me = mol.AddAtom(Chem.Atom(6))
        mol.AddBond(n, me, Chem.BondType.SINGLE)


def add_piperidine_tertiary(mol, idx, pos):
    n = mol.AddAtom(Chem.Atom(7))
    ring = [mol.AddAtom(Chem.Atom(6)) for _ in range(5)]
    mol.AddBond(idx[pos], n, Chem.BondType.SINGLE)
    mol.AddBond(n, ring[0], Chem.BondType.SINGLE)
    for i in range(4):
        mol.AddBond(ring[i], ring[i + 1], Chem.BondType.SINGLE)
    mol.AddBond(ring[4], n, Chem.BondType.SINGLE)


def add_morpholino(mol, idx, pos):
    n = mol.AddAtom(Chem.Atom(7))
    c1 = mol.AddAtom(Chem.Atom(6))
    c2 = mol.AddAtom(Chem.Atom(6))
    o = mol.AddAtom(Chem.Atom(8))
    c3 = mol.AddAtom(Chem.Atom(6))
    c4 = mol.AddAtom(Chem.Atom(6))
    mol.AddBond(idx[pos], n, Chem.BondType.SINGLE)
    mol.AddBond(n, c1, Chem.BondType.SINGLE)
    mol.AddBond(c1, c2, Chem.BondType.SINGLE)
    mol.AddBond(c2, o, Chem.BondType.SINGLE)
    mol.AddBond(o, c3, Chem.BondType.SINGLE)
    mol.AddBond(c3, c4, Chem.BondType.SINGLE)
    mol.AddBond(c4, n, Chem.BondType.SINGLE)


def add_allylpyrrolidinium(mol, idx, pos):
    n = mol.AddAtom(Chem.Atom(7))
    mol.GetAtomWithIdx(n).SetFormalCharge(1)
    ring = [mol.AddAtom(Chem.Atom(6)) for _ in range(4)]
    mol.AddBond(idx[pos], n, Chem.BondType.SINGLE)
    mol.AddBond(n, ring[0], Chem.BondType.SINGLE)
    for i in range(3):
        mol.AddBond(ring[i], ring[i + 1], Chem.BondType.SINGLE)
    mol.AddBond(ring[3], n, Chem.BondType.SINGLE)
    a1 = mol.AddAtom(Chem.Atom(6))
    a2 = mol.AddAtom(Chem.Atom(6))
    a3 = mol.AddAtom(Chem.Atom(6))
    mol.AddBond(n, a1, Chem.BondType.SINGLE)
    mol.AddBond(a1, a2, Chem.BondType.SINGLE)
    mol.AddBond(a2, a3, Chem.BondType.DOUBLE)


def _finalize(mol):
    m = mol.GetMol()
    Chem.SanitizeMol(m)
    return m


def build_pancuronium():
    mol, idx = build_androstane_rw()
    add_acetoxy(mol, idx, 3)
    add_piperidinium(mol, idx, 2, n_methyl=True)
    add_acetoxy(mol, idx, 17)
    add_piperidinium(mol, idx, 16, n_methyl=True)
    return _finalize(mol)


def build_vecuronium():
    mol, idx = build_androstane_rw()
    add_acetoxy(mol, idx, 3)
    add_piperidine_tertiary(mol, idx, 2)
    add_acetoxy(mol, idx, 17)
    add_piperidinium(mol, idx, 16, n_methyl=True)
    return _finalize(mol)


def build_rocuronium():
    mol, idx = build_androstane_rw()
    add_hydroxy(mol, idx, 3)
    add_morpholino(mol, idx, 2)
    add_acetoxy(mol, idx, 17)
    add_allylpyrrolidinium(mol, idx, 16)
    return _finalize(mol)


def _build_benzylisoquinolinium_half(mol):
    """One 6,7-dimethoxy-2-methyl-1-(3,4-dimethoxybenzyl)-1,2,3,4-
    tetrahydroisoquinolinium unit, N left open for the linker arm."""
    b = [mol.AddAtom(Chem.Atom(6)) for _ in range(6)]
    for i in range(6):
        mol.AddBond(b[i], b[(i + 1) % 6], Chem.BondType.AROMATIC)
        mol.GetAtomWithIdx(b[i]).SetIsAromatic(True)
    for aidx in (b[2], b[3]):  # 6,7-dimethoxy
        o = mol.AddAtom(Chem.Atom(8))
        me = mol.AddAtom(Chem.Atom(6))
        mol.AddBond(aidx, o, Chem.BondType.SINGLE)
        mol.AddBond(o, me, Chem.BondType.SINGLE)
    c1 = mol.AddAtom(Chem.Atom(6))
    n2 = mol.AddAtom(Chem.Atom(7))
    mol.GetAtomWithIdx(n2).SetFormalCharge(1)
    c3 = mol.AddAtom(Chem.Atom(6))
    c4 = mol.AddAtom(Chem.Atom(6))
    mol.AddBond(b[0], c1, Chem.BondType.SINGLE)
    mol.AddBond(c1, n2, Chem.BondType.SINGLE)
    mol.AddBond(n2, c3, Chem.BondType.SINGLE)
    mol.AddBond(c3, c4, Chem.BondType.SINGLE)
    mol.AddBond(c4, b[5], Chem.BondType.SINGLE)
    nme = mol.AddAtom(Chem.Atom(6))
    mol.AddBond(n2, nme, Chem.BondType.SINGLE)
    ch2 = mol.AddAtom(Chem.Atom(6))
    mol.AddBond(c1, ch2, Chem.BondType.SINGLE)
    ar = [mol.AddAtom(Chem.Atom(6)) for _ in range(6)]
    for i in range(6):
        mol.AddBond(ar[i], ar[(i + 1) % 6], Chem.BondType.AROMATIC)
        mol.GetAtomWithIdx(ar[i]).SetIsAromatic(True)
    mol.AddBond(ch2, ar[0], Chem.BondType.SINGLE)
    for aidx in (ar[2], ar[3]):  # 3,4-dimethoxy on the benzyl ring
        o = mol.AddAtom(Chem.Atom(8))
        me = mol.AddAtom(Chem.Atom(6))
        mol.AddBond(aidx, o, Chem.BondType.SINGLE)
        mol.AddBond(o, me, Chem.BondType.SINGLE)
    return n2


def build_atracurium():
    """Atracurium / cisatracurium: the two are stereoisomers of the same
    molecular graph, so with stereochemistry intentionally omitted they
    share this identical skeletal diagram."""
    mol = Chem.RWMol()
    n_left = _build_benzylisoquinolinium_half(mol)
    n_right = _build_benzylisoquinolinium_half(mol)

    def add_arm(n_atom):
        c1 = mol.AddAtom(Chem.Atom(6))
        c2 = mol.AddAtom(Chem.Atom(6))
        c3 = mol.AddAtom(Chem.Atom(6))
        o = mol.AddAtom(Chem.Atom(8))
        cc = mol.AddAtom(Chem.Atom(6))
        od = mol.AddAtom(Chem.Atom(8))
        mol.AddBond(n_atom, c1, Chem.BondType.SINGLE)
        mol.AddBond(c1, c2, Chem.BondType.SINGLE)
        mol.AddBond(c2, c3, Chem.BondType.SINGLE)
        mol.AddBond(c3, o, Chem.BondType.SINGLE)
        mol.AddBond(o, cc, Chem.BondType.SINGLE)
        mol.AddBond(cc, od, Chem.BondType.DOUBLE)
        return cc

    cl = add_arm(n_left)
    cr = add_arm(n_right)
    prev = cl
    for _ in range(3):  # pentanedioate (glutarate) linker: -CO-(CH2)3-CO-
        c = mol.AddAtom(Chem.Atom(6))
        mol.AddBond(prev, c, Chem.BondType.SINGLE)
        prev = c
    mol.AddBond(prev, cr, Chem.BondType.SINGLE)
    return _finalize(mol)


BUILDER_ENTRIES = {
    "pancuronium": build_pancuronium,
    "vecuronium": build_vecuronium,
    "rocuronium": build_rocuronium,
    "atracurium": build_atracurium,
    "cisatracurium": build_atracurium,  # same graph — see build_atracurium docstring
}


# --------------------------------------------------------------------------
# 3. Render + verify + emit
# --------------------------------------------------------------------------
def render_svg(mol, wide=False):
    AllChem.Compute2DCoords(mol)
    w, h = (W_WIDE, H_WIDE) if wide else (W, H)
    drawer = rdMolDraw2D.MolDraw2DSVG(w, h)
    opts = drawer.drawOptions()
    opts.clearBackground = False
    opts.useBWAtomPalette()
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
    return svg



# --------------------------------------------------------------------------
# 4. 3D ball-and-stick coordinates (for the rotating molecule viewer)
# --------------------------------------------------------------------------
def embed_3d(mol):
    """Add explicit hydrogens and embed a 3D conformer, optimizing geometry.
    Tries several random seeds (ETKDG embedding is stochastic and can
    occasionally fail to converge, especially for larger/charged
    molecules) before giving up. Returns the H-explicit mol with a 3D
    conformer, or None if embedding never succeeded."""
    molH = Chem.AddHs(mol)
    for seed in (42, 7, 123, 2024, 99):
        cid = AllChem.EmbedMolecule(molH, randomSeed=seed, useRandomCoords=True, maxAttempts=200)
        if cid != 0:
            continue
        try:
            result = AllChem.MMFFOptimizeMolecule(molH, maxIters=2000)
        except Exception:
            result = AllChem.UFFOptimizeMolecule(molH, maxIters=2000)
        if result in (0, 1):  # 0 = converged, 1 = did not fully converge but has coords
            return molH
    return None


def mol_to_3d_json(molH):
    conf = molH.GetConformer()
    positions = [conf.GetAtomPosition(i) for i in range(molH.GetNumAtoms())]
    # Center on the geometric centroid and scale to a consistent size
    # (max atom distance from center ~= 5 units) so every molecule fills
    # the viewer similarly regardless of its real size.
    cx = sum(p.x for p in positions) / len(positions)
    cy = sum(p.y for p in positions) / len(positions)
    cz = sum(p.z for p in positions) / len(positions)
    max_r = max(((p.x - cx) ** 2 + (p.y - cy) ** 2 + (p.z - cz) ** 2) ** 0.5 for p in positions) or 1.0
    scale = 5.0 / max_r

    atoms = []
    for i, p in enumerate(positions):
        atom = molH.GetAtomWithIdx(i)
        atoms.append([
            atom.GetSymbol(),
            round((p.x - cx) * scale, 3),
            round((p.y - cy) * scale, 3),
            round((p.z - cz) * scale, 3),
        ])
    bonds = []
    for b in molH.GetBonds():
        bonds.append([b.GetBeginAtomIdx(), b.GetEndAtomIdx()])
    return {"atoms": atoms, "bonds": bonds}


def main():
    entries = {}
    mols = {}
    mismatches = []

    all_smiles_entries = dict(SMILES_ENTRIES)
    all_smiles_entries.update(_opsin_smiles_entries())

    for drug_id, smi in all_smiles_entries.items():
        mol = Chem.MolFromSmiles(smi)
        if mol is None:
            print(f"FAILED TO PARSE: {drug_id} -> {smi}")
            mismatches.append(drug_id)
            continue
        formula = rdMolDescriptors.CalcMolFormula(mol)
        expected = REFERENCE_FORMULA.get(drug_id)
        formula_ok = formula == expected
        # Drugs in EXPECTED_RING_SIZES (the morphinan/benzomorphan family —
        # see _OPSIN_NAMES) get the same extra ring-topology cross-check as
        # the programmatically-built entries below, since formula-matching
        # alone can't catch every possible connectivity error.
        expected_rings = EXPECTED_RING_SIZES.get(drug_id)
        if expected_rings is not None:
            ring_sizes = sorted(len(r) for r in mol.GetRingInfo().AtomRings())
            rings_ok = ring_sizes == expected_rings
            ok = formula_ok and rings_ok
            status = "OK" if ok else f"MISMATCH formula={formula} (expected {expected}) rings={ring_sizes} (expected {expected_rings})"
        else:
            ok = formula_ok
            status = "OK" if ok else f"MISMATCH (expected {expected})"
        print(f"{drug_id:20s} {formula:20s} {status}")
        if not ok:
            mismatches.append(drug_id)
            continue
        mols[drug_id] = mol
        entries[drug_id] = {"svg": render_svg(Chem.Mol(mol)), "formula": formula}

    for drug_id, builder in BUILDER_ENTRIES.items():
        mol = builder()
        formula = rdMolDescriptors.CalcMolFormula(mol)
        expected = REFERENCE_FORMULA.get(drug_id)
        ring_sizes = sorted(len(r) for r in mol.GetRingInfo().AtomRings())
        expected_rings = EXPECTED_RING_SIZES.get(drug_id)
        formula_ok = formula == expected
        rings_ok = ring_sizes == expected_rings
        status = "OK" if (formula_ok and rings_ok) else (
            f"MISMATCH formula={formula} (expected {expected}) rings={ring_sizes} (expected {expected_rings})"
        )
        print(f"{drug_id:20s} {formula:20s} {status}")
        if not (formula_ok and rings_ok):
            mismatches.append(drug_id)
            continue
        mols[drug_id] = mol
        entries[drug_id] = {"svg": render_svg(Chem.Mol(mol), wide=True), "formula": formula}

    if mismatches:
        raise SystemExit(f"Refusing to write output — verification failures: {mismatches}")

    # 3D embeddings — best-effort per molecule; a failure here doesn't
    # block the (already-verified) 2D diagram, it just means that drug's
    # card falls back to the flat SVG instead of the rotating model.
    threed = {}
    threed_failures = []
    ordered_ids_for_3d = list(all_smiles_entries.keys()) + list(BUILDER_ENTRIES.keys())
    for drug_id in ordered_ids_for_3d:
        if drug_id not in mols:
            continue
        molH = embed_3d(Chem.Mol(mols[drug_id]))
        if molH is None:
            threed_failures.append(drug_id)
            print(f"{drug_id:20s} 3D embedding FAILED — will fall back to 2D diagram")
            continue
        threed[drug_id] = mol_to_3d_json(molH)
        print(f"{drug_id:20s} 3D OK ({len(threed[drug_id]['atoms'])} atoms, {len(threed[drug_id]['bonds'])} bonds)")

    lines3d = [
        "/* ==========================================================================",
        "   KNOCKOUTNOTES — Drug 3D ball-and-stick coordinates (study-structures-3d.js)",
        "   RDKit ETKDG-embedded + MMFF/UFF-optimized 3D conformers for the same",
        "   verified molecules as study-structures.js — see",
        "   scripts/generate_chemical_structures.py. Explicit hydrogens included.",
        "   Positions are centered and scaled to a consistent size. Rendered by",
        "   study-molecule-3d.js. A drug missing here (3D embedding did not",
        "   converge) falls back to the flat 2D diagram.",
        "   ========================================================================== */",
        "window.KN_STRUCTURES_3D = {",
    ]
    for drug_id in ordered_ids_for_3d:
        if drug_id not in threed:
            continue
        lines3d.append(f"  {drug_id}: {json.dumps(threed[drug_id], separators=(',', ':'))},")
    lines3d.append("};")
    out_path_3d = os.path.join(REPO_ROOT, "study-structures-3d.js")
    with open(out_path_3d, "w") as f:
        f.write("\n".join(lines3d) + "\n")
    print(f"\nWrote {out_path_3d} ({len(threed)} molecules, {len(threed_failures)} fell back to 2D-only)")

    lines = [
        "/* ==========================================================================",
        "   KNOCKOUTNOTES — Drug chemical structure diagrams (study-structures.js)",
        "   Accurate 2D skeletal-formula SVGs generated with RDKit — see",
        "   scripts/generate_chemical_structures.py for the verified SMILES /",
        "   programmatic builders and the formula + ring-topology cross-checks each",
        "   one passed before being included here. Drugs whose structure I'm not",
        "   confident about (complex bridged/fused skeletons, newer agents, or",
        "   biologics not suited to a skeletal diagram) are intentionally left out",
        "   rather than guessed at — see the module docstring for the current list.",
        "   ========================================================================== */",
        "window.KN_STRUCTURES = {",
    ]
    # keep a stable, readable order: SMILES entries first, then builder entries
    ordered_ids = list(all_smiles_entries.keys()) + list(BUILDER_ENTRIES.keys())
    for drug_id in ordered_ids:
        if drug_id not in entries:
            continue
        e = entries[drug_id]
        lines.append(f'  {drug_id}: {{ formula: {json.dumps(e["formula"])}, svg: {json.dumps(e["svg"])} }},')
    lines.append("};")

    out_path = os.path.join(REPO_ROOT, "study-structures.js")
    with open(out_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\nWrote {out_path} ({len(entries)} structures)")


if __name__ == "__main__":
    main()
