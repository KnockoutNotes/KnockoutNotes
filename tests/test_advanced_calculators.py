#!/usr/bin/env python3
"""
KnockoutNotes Advanced / Dynamic Calculators Automated Test Suite
Verifies mathematical engines, unit conversions, pharmacokinetic models,
respiratory mechanics, MABL, MTP, and viscoelastic decision pathways against
independently calculated values and authoritative literature sources.
"""

import math
import subprocess
import json
import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_js_eval(code: str):
    """Executes a small Node.js snippet that requires advanced-calc-engine.js and returns JSON"""
    full_script = f"""
    const Engine = require('./advanced-calc-engine.js');
    try {{
        const result = ({code});
        console.log(JSON.stringify({{ success: true, data: result }}));
    }} catch(e) {{
        console.log(JSON.stringify({{ success: false, error: e.message }}));
    }}
    """
    proc = subprocess.run(
        ["node", "-e", full_script],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True
    )
    res = json.loads(proc.stdout.strip())
    if not res["success"]:
        raise RuntimeError(f"JS Eval Error: {res.get('error')}")
    return res["data"]

def run_tests():
    print("================================================================================")
    print("STARTING ADVANCED / DYNAMIC CALCULATORS TEST SUITE (35 VERIFICATION CHECKS)")
    print("================================================================================")

    passed = 0
    failed = 0

    def check(name, condition, details=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  [PASS] Check {passed + failed:02d}: {name}")
        else:
            failed += 1
            print(f"  [FAIL] Check {passed + failed:02d}: {name} - {details}")

    # --------------------------------------------------------------------------
    # GROUP 1: Vasopressor / Inotrope Engine
    # --------------------------------------------------------------------------
    print("\n--- GROUP 1: Vasopressor / Inotrope Titration Engine ---")
    
    # 1. Norepinephrine 70kg, 0.05 mcg/kg/min, 4 mg in 50 mL (80 mcg/mL)
    r1 = run_js_eval("""
        Engine.VasopressorEngine.computeForward({
            drug: 'norepinephrine',
            weight: 70,
            doseMode: 'mcg_kg_min',
            doseInput: 0.05,
            concMcgMl: 80
        })
    """)
    check("Norepinephrine forward mcg/min calculation (70 * 0.05 = 3.5)", r1["doseMcgMin"] == 3.5)
    check("Norepinephrine forward mL/hr calculation (3.5 * 60 / 80 = 2.63)", abs(r1["rateMlHr"] - 2.63) <= 0.01)

    # 2. Norepinephrine reverse calculation from 2.625 mL/hr
    r2 = run_js_eval("""
        Engine.VasopressorEngine.computeReverse({
            drug: 'norepinephrine',
            weight: 70,
            rateMlHr: 2.625,
            concMcgMl: 80
        })
    """)
    check("Norepinephrine reverse matches 0.05 mcg/kg/min", abs(r2["doseMcgKgMin"] - 0.05) <= 0.001)
    check("Norepinephrine reverse matches 3.5 mcg/min", abs(r2["doseMcgMin"] - 3.5) <= 0.01)

    # 3. Vasopressin units/min handling (0.03 units/min with 20 units in 100 mL = 0.2 units/mL)
    r3 = run_js_eval("""
        Engine.VasopressorEngine.computeForward({
            drug: 'vasopressin',
            doseMode: 'units_min',
            doseInput: 0.03,
            concUnitsMl: 0.2
        })
    """)
    check("Vasopressin units/hr calculation (0.03 * 60 = 1.8)", r3["doseUnitsHr"] == 1.8)
    check("Vasopressin mL/hr calculation (1.8 / 0.2 = 9.0)", r3["rateMlHr"] == 9.0)
    check("Vasopressin strictly uses units and never converts to mcg", r3["unitType"] == "units" and "mcg" not in str(r3))

    # 4. Vasopressin reverse calculation from 9.0 mL/hr
    r4 = run_js_eval("""
        Engine.VasopressorEngine.computeReverse({
            drug: 'vasopressin',
            rateMlHr: 9.0,
            concUnitsMl: 0.2
        })
    """)
    check("Vasopressin reverse matches 0.03 units/min", abs(r4["doseUnitsMin"] - 0.03) <= 0.001)
    check("Vasopressin reverse matches 1.8 units/hr", abs(r4["doseUnitsHr"] - 1.8) <= 0.01)

    # 5. Dobutamine 70kg, 5 mcg/kg/min, 250 mg in 50 mL (5000 mcg/mL)
    r5 = run_js_eval("""
        Engine.VasopressorEngine.computeForward({
            drug: 'dobutamine',
            weight: 70,
            doseMode: 'mcg_kg_min',
            doseInput: 5.0,
            concMcgMl: 5000
        })
    """)
    check("Dobutamine mcg/min calculation (70 * 5 = 350)", r5["doseMcgMin"] == 350)
    check("Dobutamine mL/hr calculation (350 * 60 / 5000 = 4.2)", r5["rateMlHr"] == 4.2)

    # 6. Vasopressor Edge cases & NaN protection
    r_err1 = run_js_eval("""Engine.VasopressorEngine.computeForward({ drug: 'norepinephrine', weight: 0, doseInput: 0.1, concMcgMl: 80 })""")
    check("Rejects zero weight safely without throwing error", "error" in r_err1)
    r_err2 = run_js_eval("""Engine.VasopressorEngine.computeForward({ drug: 'norepinephrine', weight: -10, doseInput: 0.1, concMcgMl: 80 })""")
    check("Rejects negative weight safely", "error" in r_err2)
    r_err3 = run_js_eval("""Engine.VasopressorEngine.computeForward({ drug: 'norepinephrine', weight: 70, doseInput: 0.1, concMcgMl: 0 })""")
    check("Rejects zero concentration safely", "error" in r_err3)

    # --------------------------------------------------------------------------
    # GROUP 2: TCI / PK Pharmacokinetic Models
    # --------------------------------------------------------------------------
    print("\n--- GROUP 2: Propofol & Remifentanil TCI Models ---")

    # 7. James LBM Formula
    # Male 70kg 175cm -> 1.10*70 - 128*(70/175)^2 = 77 - 128*0.16 = 77 - 20.48 = 56.52 kg
    lbm_male = run_js_eval("Engine.TciEngine.calculateJamesLBM(70, 175, 'male')")
    check("James formula male LBM (56.52 kg)", abs(lbm_male - 56.52) <= 0.05)

    # 8. Marsh Model (Weight only: V1 = 0.228 * W, V2 = 0.463 * W, V3 = 2.893 * W)
    pk_marsh = run_js_eval("Engine.TciEngine.models.marsh.calculateParams({ weight: 70 })")
    check("Marsh V1 calculation (0.228 * 70 = 15.96 L)", abs(pk_marsh["V1"] - 15.96) <= 0.02)
    check("Marsh V2 calculation (0.463 * 70 = 32.41 L)", abs(pk_marsh["V2"] - 32.41) <= 0.02)
    check("Marsh V3 calculation (2.893 * 70 = 202.51 L)", abs(pk_marsh["V3"] - 202.51) <= 0.02)
    check("Marsh rate constants match literature (k10=0.119)", pk_marsh["k10"] == 0.119 and pk_marsh["ke0"] == 0.26)

    # 9. Schnider Model (Male 40 yr, 70 kg, 175 cm)
    pk_schnider = run_js_eval("Engine.TciEngine.models.schnider.calculateParams({ age: 40, sex: 'male', height: 175, weight: 70 })")
    check("Schnider V1 fixed at 4.27 L", pk_schnider["V1"] == 4.27)
    check("Schnider V2 age-dependent (23.98 L)", abs(pk_schnider["V2"] - 23.98) <= 0.05)
    check("Schnider V3 fixed at 238 L", pk_schnider["V3"] == 238.0)
    check("Schnider ke0 fixed at 0.456 min^-1", pk_schnider["ke0"] == 0.456)

    # 10. Minto Remifentanil Model (Age 40, Male, 70 kg, 175 cm)
    pk_minto = run_js_eval("Engine.TciEngine.models.minto.calculateParams({ age: 40, sex: 'male', height: 175, weight: 70 })")
    check("Minto V1 calculation (5.21 L)", abs(pk_minto["V1"] - 5.21) <= 0.05)
    check("Minto V3 fixed at 5.42 L", pk_minto["V3"] == 5.42)
    check("Minto ke0 age 40 (0.595 min^-1)", abs(pk_minto["ke0"] - 0.595) <= 0.01)

    # 11. Simulation Trajectory Execution & Stability
    sim = run_js_eval("""
        Engine.TciEngine.simulateTrajectory({
            model: 'schnider',
            age: 40,
            sex: 'male',
            height: 175,
            weight: 70,
            targetConc: 4.0,
            targetMode: 'plasma',
            durationMin: 30
        })
    """)
    check("TCI simulation generates timepoints correctly", len(sim["timePoints"]) > 50)
    check("TCI simulation initial concentration begins non-zero from bolus", sim["cpPoints"][0] > 0)
    check("TCI simulation points contain no NaN or Infinity values", all(not math.isnan(x) and not math.isinf(x) for x in sim["cpPoints"]))

    # --------------------------------------------------------------------------
    # GROUP 3: Predicted Body Weight & Ventilation Mechanics Engine
    # --------------------------------------------------------------------------
    print("\n--- GROUP 3: Ventilation & PBW Engine ---")

    # 12. Devine PBW Calculation
    # Male 175 cm: 50 + 0.91 * (175 - 152.4) = 50 + 20.566 = 70.6 kg
    pbw_m = run_js_eval("Engine.VentilationPbwEngine.calculatePBW(175, 'male')")
    check("Devine PBW male 175 cm (70.6 kg)", abs(pbw_m["pbwKg"] - 70.6) <= 0.1)

    # Female 160 cm: 45.5 + 0.91 * (160 - 152.4) = 45.5 + 6.916 = 52.4 kg
    pbw_f = run_js_eval("Engine.VentilationPbwEngine.calculatePBW(160, 'female')")
    check("Devine PBW female 160 cm (52.4 kg)", abs(pbw_f["pbwKg"] - 52.4) <= 0.1)

    # 13. Tidal Volume Ladder & Driving Pressure & Static Compliance
    vent = run_js_eval("""
        Engine.VentilationPbwEngine.computeMechanics({
            heightCm: 175,
            sex: 'male',
            targetRatio: 6.0,
            pplat: 24,
            peep: 8
        })
    """)
    # 6 mL/kg * 70.6 = 423.6 mL
    check("Target VT at 6 mL/kg PBW (424 mL)", abs(vent["targetVtMl"] - 424) <= 2)
    # Driving pressure = 24 - 8 = 16 cmH2O
    check("Driving pressure calculation (24 - 8 = 16 cmH2O)", vent["drivingPressureCmH2O"] == 16)
    # Static Compliance = 424 / 16 = 26.5 mL/cmH2O
    check("Static compliance calculation (424 / 16 = 26.5 mL/cmH2O)", abs(vent["staticComplianceMlCmH2O"] - 26.5) <= 0.2)

    # 14. Ventilation Edge case: Pplat < PEEP
    vent_err = run_js_eval("""
        Engine.VentilationPbwEngine.computeMechanics({
            heightCm: 175,
            sex: 'male',
            pplat: 10,
            peep: 12
        })
    """)
    check("Rejects impossible Pplat < PEEP safely", "error" in vent_err)

    # --------------------------------------------------------------------------
    # GROUP 4: Maximum Allowable Blood Loss (MABL)
    # --------------------------------------------------------------------------
    print("\n--- GROUP 4: Maximum Allowable Blood Loss (MABL) ---")

    # 15. Adult Male 70kg, EBV 70 mL/kg -> 4900 mL. Hb init 14.0, target 8.0
    # MABL = 4900 * (14.0 - 8.0) / 14.0 = 4900 * 6 / 14 = 2100 mL
    mabl_hb = run_js_eval("""
        Engine.MablEngine.calculateMABL({
            weight: 70,
            mode: 'hb',
            ebvCategory: 'adult_male',
            initialVal: 14.0,
            targetVal: 8.0
        })
    """)
    check("MABL total EBV calculation (70 * 70 = 4900 mL)", mabl_hb["ebvTotalMl"] == 4900)
    check("MABL Hb-based calculation (2100 mL)", mabl_hb["mablMl"] == 2100)
    check("MABL percentage of EBV (2100 / 4900 = 42.9%)", abs(mabl_hb["pctEbv"] - 42.9) <= 0.2)

    # 16. Infant 10kg, EBV 80 mL/kg -> 800 mL. Hct init 36%, target 24%
    # MABL = 800 * (36 - 24) / 36 = 800 * 12 / 36 = 267 mL
    mabl_hct = run_js_eval("""
        Engine.MablEngine.calculateMABL({
            weight: 10,
            mode: 'hct',
            ebvCategory: 'infant',
            initialVal: 36,
            targetVal: 24
        })
    """)
    check("MABL infant EBV calculation (10 * 80 = 800 mL)", mabl_hct["ebvTotalMl"] == 800)
    check("MABL Hct-based calculation (267 mL)", mabl_hct["mablMl"] == 267)

    # 17. MABL Edge cases
    mabl_err1 = run_js_eval("""
        Engine.MablEngine.calculateMABL({
            weight: 70,
            mode: 'hb',
            initialVal: 8.0,
            targetVal: 10.0
        })
    """)
    check("Rejects target Hb higher than initial Hb safely", "error" in mabl_err1)

    # --------------------------------------------------------------------------
    # GROUP 5: Massive Transfusion Protocol (MTP) & Viscoelastic Engines
    # --------------------------------------------------------------------------
    print("\n--- GROUP 5: Massive Transfusion & Viscoelastic Guide ---")

    # 18. MTP Pack Cooler Calculation (Trauma 1:1:1 vs 2:1:1)
    mtp_111 = run_js_eval("Engine.MtpEngine.calculateCooler({ domain: 'trauma', coolers: 2, ratio: '1:1:1' })")
    check("MTP 1:1:1 2 coolers RBC count (8 units)", mtp_111["rbcUnits"] == 8)
    check("MTP 1:1:1 2 coolers FFP count (8 units)", mtp_111["ffpUnits"] == 8)
    check("MTP 1:1:1 2 coolers Platelets count (2 adult doses)", mtp_111["plateletAdultDoses"] == 2)

    mtp_211 = run_js_eval("Engine.MtpEngine.calculateCooler({ domain: 'trauma', coolers: 2, ratio: '2:1:1' })")
    check("MTP 2:1:1 2 coolers FFP count (4 units)", mtp_211["ffpUnits"] == 4)

    # 19. TEG Decision Logic
    teg_res = run_js_eval("""
        Engine.ViscoelasticEngine.evaluateTEG({
            r_time: 14.0,
            k_time: 2.0,
            alpha: 60.0,
            ma: 58.0,
            ly30: 5.5
        })
    """)
    check("TEG detects prolonged R-time factor deficiency", any("Prolonged R time" in f for f in teg_res["findings"]))
    check("TEG detects hyperfibrinolysis LY30 > 3%", any("Hyperfibrinolysis detected" in f for f in teg_res["findings"]))
    check("TEG recommends Tranexamic Acid for hyperfibrinolysis", any("Tranexamic Acid" in r for r in teg_res["recommendations"]))

    # 20. ROTEM Decision Logic
    rotem_res = run_js_eval("""
        Engine.ViscoelasticEngine.evaluateROTEM({
            extem_ct: 95,
            extem_a5: 28,
            fibtem_a5: 5,
            extem_ml: 18
        })
    """)
    check("ROTEM detects hyperfibrinolysis ML > 15%", any("Hyperfibrinolysis detected" in f for f in rotem_res["findings"]))
    check("ROTEM detects prolonged EXTEM CT", any("Prolonged EXTEM CT" in f for f in rotem_res["findings"]))
    check("ROTEM detects FIBTEM < 9 mm and recommends Fibrinogen Concentrate", any("Fibrinogen Concentrate" in r for r in rotem_res["recommendations"]))

    print("\n================================================================================")
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED (TOTAL {passed + failed} CHECKS)")
    print("================================================================================")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
