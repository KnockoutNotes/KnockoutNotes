"""
Test Suite: Crisis Mode Clinical Dosing & Mathematical Verification
Verifies calculations against primary guidelines:
- Difficult Airway Society (DAS) 2015
- Malignant Hyperthermia Association of the United States (MHAUS)
- ASRA Pain Medicine LAST Checklist 2020
"""

import math
import re
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent


def calculate_mh(weight_kg: float):
    """
    MHAUS Dantrolene Dosing Logic:
    Initial Dose = 2.5 mg/kg IV on Actual Body Weight.
    Dantrium/Revonto: 20 mg/vial in 60 mL sterile water without bacteriostatic agent.
    Ryanodex: 250 mg/vial in 5 mL sterile water without bacteriostatic agent.
    Vials rounded UP (ceil) to prevent underdosing.
    """
    if weight_kg <= 0:
        raise ValueError("Weight must be greater than 0")

    initial_dose_mg = weight_kg * 2.5
    dantrium_vials = math.ceil(initial_dose_mg / 20)
    dantrium_volume_ml = dantrium_vials * 60
    ryanodex_vials = math.ceil(initial_dose_mg / 250)
    ryanodex_volume_ml = ryanodex_vials * 5

    return {
        "dose_mg": initial_dose_mg,
        "dantrium_vials": dantrium_vials,
        "dantrium_volume_ml": dantrium_volume_ml,
        "ryanodex_vials": ryanodex_vials,
        "ryanodex_volume_ml": ryanodex_volume_ml,
    }


def calculate_last(weight_kg: float):
    """
    ASRA 2020 LAST 20% Lipid Emulsion Logic:
    If < 70 kg:
        Bolus: 1.5 mL/kg over 2-3 min
        Infusion: 0.25 mL/kg/min (15 mL/kg/h)
    If >= 70 kg:
        Fixed Bolus: 100 mL over 2-3 min
        Fixed Infusion: 250 mL over 15-20 min
    Max Cumulative Dose: 12 mL/kg
    """
    if weight_kg <= 0:
        raise ValueError("Weight must be greater than 0")

    if weight_kg < 70:
        bolus_ml = weight_kg * 1.5
        infusion_ml_min = weight_kg * 0.25
        infusion_ml_hr = infusion_ml_min * 60
        is_fixed = False
    else:
        bolus_ml = 100.0
        infusion_ml_min = 250.0 / 20.0  # nominal rate ~12.5 - 16.6 mL/min
        infusion_ml_hr = 250.0  # approximate bag infusion
        is_fixed = True

    max_dose_ml = weight_kg * 12.0

    return {
        "bolus_ml": bolus_ml,
        "infusion_ml_min": infusion_ml_min,
        "infusion_ml_hr": infusion_ml_hr,
        "max_dose_ml": max_dose_ml,
        "is_fixed": is_fixed,
    }


class TestCrisisCalculators(unittest.TestCase):

    # ==========================================
    # MH ARITHMETIC TESTS
    # ==========================================
    def test_mh_standard_70kg(self):
        res = calculate_mh(70.0)
        self.assertEqual(res["dose_mg"], 175.0)
        # 175 / 20 = 8.75 -> 9 vials Dantrium
        self.assertEqual(res["dantrium_vials"], 9)
        self.assertEqual(res["dantrium_volume_ml"], 540)
        # 175 / 250 = 0.7 -> 1 vial Ryanodex
        self.assertEqual(res["ryanodex_vials"], 1)
        self.assertEqual(res["ryanodex_volume_ml"], 5)

    def test_mh_50kg(self):
        res = calculate_mh(50.0)
        self.assertEqual(res["dose_mg"], 125.0)
        # 125 / 20 = 6.25 -> 7 vials
        self.assertEqual(res["dantrium_vials"], 7)
        self.assertEqual(res["dantrium_volume_ml"], 420)
        # 125 / 250 = 0.5 -> 1 vial
        self.assertEqual(res["ryanodex_vials"], 1)

    def test_mh_110kg_large_patient(self):
        res = calculate_mh(110.0)
        self.assertEqual(res["dose_mg"], 275.0)
        # 275 / 20 = 13.75 -> 14 vials
        self.assertEqual(res["dantrium_vials"], 14)
        self.assertEqual(res["dantrium_volume_ml"], 840)
        # 275 / 250 = 1.1 -> 2 vials Ryanodex
        self.assertEqual(res["ryanodex_vials"], 2)
        self.assertEqual(res["ryanodex_volume_ml"], 10)

    def test_mh_exact_vial_boundary(self):
        # 80 kg * 2.5 = 200 mg -> exactly 10 vials of 20 mg
        res = calculate_mh(80.0)
        self.assertEqual(res["dose_mg"], 200.0)
        self.assertEqual(res["dantrium_vials"], 10)
        self.assertEqual(res["ryanodex_vials"], 1)

    def test_mh_decimal_weight(self):
        res = calculate_mh(12.5)
        self.assertEqual(res["dose_mg"], 31.25)
        # 31.25 / 20 = 1.56 -> 2 vials
        self.assertEqual(res["dantrium_vials"], 2)
        self.assertEqual(res["ryanodex_vials"], 1)

    def test_mh_invalid_weights(self):
        with self.assertRaises(ValueError):
            calculate_mh(0)
        with self.assertRaises(ValueError):
            calculate_mh(-15)

    # ==========================================
    # LAST ARITHMETIC TESTS
    # ==========================================
    def test_last_under_70kg(self):
        # 60 kg patient:
        # Bolus = 60 * 1.5 = 90 mL
        # Infusion = 60 * 0.25 = 15 mL/min (900 mL/hr)
        # Max = 60 * 12 = 720 mL
        res = calculate_last(60.0)
        self.assertFalse(res["is_fixed"])
        self.assertEqual(res["bolus_ml"], 90.0)
        self.assertEqual(res["infusion_ml_min"], 15.0)
        self.assertEqual(res["infusion_ml_hr"], 900.0)
        self.assertEqual(res["max_dose_ml"], 720.0)

    def test_last_boundary_69_9kg(self):
        res = calculate_last(69.9)
        self.assertFalse(res["is_fixed"])
        self.assertAlmostEqual(res["bolus_ml"], 104.85, places=2)
        self.assertAlmostEqual(res["infusion_ml_min"], 17.475, places=3)
        self.assertAlmostEqual(res["max_dose_ml"], 838.8, places=1)

    def test_last_at_70kg(self):
        # >= 70 kg should switch to fixed dose
        res = calculate_last(70.0)
        self.assertTrue(res["is_fixed"])
        self.assertEqual(res["bolus_ml"], 100.0)
        self.assertEqual(res["max_dose_ml"], 840.0)

    def test_last_over_70kg(self):
        # 85 kg patient
        res = calculate_last(85.0)
        self.assertTrue(res["is_fixed"])
        self.assertEqual(res["bolus_ml"], 100.0)
        self.assertEqual(res["max_dose_ml"], 1020.0)

    def test_last_invalid_weights(self):
        with self.assertRaises(ValueError):
            calculate_last(0)
        with self.assertRaises(ValueError):
            calculate_last(-5)

    # ==========================================
    # FILE & CONTENT INTEGRITY CHECKS
    # ==========================================
    def test_crisis_html_exists(self):
        crisis_file = PROJECT_ROOT / "crisis.html"
        self.assertTrue(crisis_file.exists(), "crisis.html must exist")
        content = crisis_file.read_text(encoding="utf-8")

        # Verify CICO Section
        self.assertIn("CICO: Can't Intubate, Can't Oxygenate", content)
        self.assertIn("PLAN A &bull; Tracheal Intubation", content)
        self.assertIn("PLAN B &bull; SAD Oxygenation", content)
        self.assertIn("PLAN C &bull; Facemask Ventilation", content)
        self.assertIn("PLAN D &bull; Emergency Front of Neck Access", content)
        self.assertIn("SCALPEL - BOUGIE - TUBE", content)
        self.assertIn("Difficult Airway Society", content)

        # Verify MH Section
        self.assertIn("Malignant Hyperthermia", content)
        self.assertIn("MHAUS", content)
        self.assertIn("DANTRIUM &bull; REVONTO", content)
        self.assertIn("RYANODEX", content)
        self.assertIn("Sterile Water WITHOUT Bacteriostatic", content)
        self.assertIn("AVOID CALCIUM CHANNEL BLOCKERS", content)
        self.assertIn("1-800-644-9737", content)

        # Verify LAST Section
        self.assertIn("Local Anaesthetic Systemic Toxicity", content)
        self.assertIn("ASRA", content)
        self.assertIn("20% Lipid Emulsion", content)
        self.assertIn("LAST RESUSCITATION IS DIFFERENT FROM STANDARD ACLS", content)
        self.assertIn("REDUCE EPINEPHRINE DOSES", content)
        self.assertIn("AVOID VASOPRESSIN", content)

    def test_crisis_css_exists(self):
        css_file = PROJECT_ROOT / "crisis.css"
        self.assertTrue(css_file.exists(), "crisis.css must exist")
        content = css_file.read_text(encoding="utf-8")
        # Verify high contrast and no keyframe animations
        self.assertNotIn("@keyframes", content, "Crisis mode must have zero animations")
        self.assertIn("--cm-bg", content)
        self.assertIn("--cm-danger", content)

    def test_crisis_js_exists(self):
        js_file = PROJECT_ROOT / "crisis.js"
        self.assertTrue(js_file.exists(), "crisis.js must exist")
        content = js_file.read_text(encoding="utf-8")
        self.assertIn("calculateMH", content)
        self.assertIn("calculateLAST", content)
        self.assertIn("navigateToView", content)

    def test_home_page_integration(self):
        index_file = PROJECT_ROOT / "index.html"
        content = index_file.read_text(encoding="utf-8")
        # Verify CRISIS MODE link in both layers
        matches = re.findall(r'href=["\']crisis\.html["\']', content)
        self.assertGreaterEqual(len(matches), 2, "CRISIS MODE must be linked in both 3D and Lite presentation layers")
        self.assertIn("CRISIS MODE", content)
        self.assertIn("Run a Code (ACLS / PALS)", content)


if __name__ == "__main__":
    unittest.main()
