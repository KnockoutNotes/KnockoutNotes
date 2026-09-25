#!/usr/bin/env python3
"""
generate_topic_structures.py — Generates 2D SVGs and 3D rotating models for all
19 topics under the 'Anaesthesia' and 'Ventilators & Devices' subtabs in Study Mode,
and updates study-structures.js and study-structures-3d.js.
"""
import json
import re
import sys
from rdkit import Chem
from rdkit.Chem import AllChem, Draw
from rdkit.Chem.Draw import rdMolDraw2D

# 1. RDKit Pharmacological Molecules for topics
MOLECULES = {
    "malignant-hyperthermia": {
        "formula": "Antidote • Dantrolene (C14H10N4O5)",
        "smiles": "C1=CC(=CC=C1[N+](=O)[O-])C2=CC=C(O2)/C=N/N3C(=O)CNC3=O",
    },
    "ponv": {
        "formula": "5-HT3 Blocker • Ondansetron (C18H19N3O)",
        "smiles": "CC1=NC=CN1CC2CCC3=C(C2=O)C4=CC=CC=C4N3C",
    }
}

# 2. Vector SVGs for Devices & Clinical Topics
SVG_GRAPHICS = {
    "preop-assessment": {
        "formula": "Diagnostic • Clinical Auscultation",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <defs>
    <linearGradient id='stethGrad' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#38bdf8'/>
      <stop offset='100%' stop-color='#0284c7'/>
    </linearGradient>
  </defs>
  <!-- Binaural Headset -->
  <path d='M100 40 C100 85 130 115 150 120 C170 115 200 85 200 40' fill='none' stroke='#94a3b8' stroke-width='4' stroke-linecap='round'/>
  <!-- Earpieces -->
  <circle cx='100' cy='36' r='5' fill='#38bdf8'/>
  <circle cx='200' cy='36' r='5' fill='#38bdf8'/>
  <!-- Spring brace -->
  <path d='M120 70 Q150 82 180 70' fill='none' stroke='#64748b' stroke-width='2.5'/>
  <!-- Flexible Y-Tubing -->
  <path d='M150 120 C150 160 185 175 185 155 C185 135 150 145 150 185' fill='none' stroke='url(#stethGrad)' stroke-width='5' stroke-linecap='round'/>
  <!-- Stethoscope Chestpiece -->
  <circle cx='150' cy='185' r='20' fill='#1e293b' stroke='#94a3b8' stroke-width='3.5'/>
  <circle cx='150' cy='185' r='14' fill='none' stroke='#38bdf8' stroke-width='2'/>
  <circle cx='150' cy='185' r='6' fill='#0284c7'/>
  <!-- ECG trace baseline -->
  <path d='M20 200 L60 200 L70 190 L80 212 L90 180 L100 205 L110 200 L280 200' fill='none' stroke='#38bdf8' stroke-width='1.8' opacity='0.4'/>
</svg>"""
    },
    "asa-pscore": {
        "formula": "Risk Stratification • ASA I–VI",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <defs>
    <radialGradient id='heartGrad' cx='45%' cy='40%' r='60%'>
      <stop offset='0%' stop-color='#f43f5e'/>
      <stop offset='70%' stop-color='#be123c'/>
      <stop offset='100%' stop-color='#881337'/>
    </radialGradient>
  </defs>
  <!-- Vena Cava -->
  <path d='M115 40 L115 85' stroke='#3b82f6' stroke-width='12' stroke-linecap='round'/>
  <!-- Aortic Arch & Branches -->
  <path d='M140 85 C140 45 175 45 175 80' fill='none' stroke='#f43f5e' stroke-width='14' stroke-linecap='round'/>
  <line x1='150' y1='50' x2='150' y2='25' stroke='#f43f5e' stroke-width='4' stroke-linecap='round'/>
  <line x1='160' y1='48' x2='165' y2='25' stroke='#f43f5e' stroke-width='4' stroke-linecap='round'/>
  <line x1='170' y1='52' x2='180' y2='27' stroke='#f43f5e' stroke-width='4' stroke-linecap='round'/>
  <!-- Pulmonary Artery -->
  <path d='M135 85 C145 75 165 75 180 85' fill='none' stroke='#0284c7' stroke-width='9' stroke-linecap='round'/>
  <!-- Cardiac Ventricular Silhouette -->
  <path d='M150 90 C120 70 85 95 85 130 C85 170 145 198 150 202 C155 198 215 170 215 130 C215 95 180 70 150 90 Z' fill='url(#heartGrad)' stroke='#fda4af' stroke-width='2'/>
  <!-- Coronary vessels -->
  <path d='M145 105 Q140 140 160 175' fill='none' stroke='#fda4af' stroke-width='2' opacity='0.7'/>
  <path d='M143 130 Q130 145 125 160' fill='none' stroke='#fda4af' stroke-width='1.5' opacity='0.6'/>
</svg>"""
    },
    "airway-assessment": {
        "formula": "Airway • Macintosh Laryngoscope",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Knurled Handle -->
  <rect x='85' y='65' width='28' height='115' rx='5' fill='#334155' stroke='#94a3b8' stroke-width='2'/>
  <line x1='85' y1='85' x2='113' y2='85' stroke='#64748b' stroke-width='1.5'/>
  <line x1='85' y1='105' x2='113' y2='105' stroke='#64748b' stroke-width='1.5'/>
  <line x1='85' y1='125' x2='113' y2='125' stroke='#64748b' stroke-width='1.5'/>
  <line x1='85' y1='145' x2='113' y2='145' stroke='#64748b' stroke-width='1.5'/>
  <line x1='85' y1='165' x2='113' y2='165' stroke='#64748b' stroke-width='1.5'/>
  <rect x='89' y='180' width='20' height='8' rx='2' fill='#64748b'/>
  <!-- Hook-on Hinge -->
  <path d='M90 65 L115 65 L125 50 L95 50 Z' fill='#475569' stroke='#94a3b8' stroke-width='1.5'/>
  <!-- Macintosh Curved Blade -->
  <path d='M110 55 C150 55 190 70 225 105 C240 120 248 135 245 140 C242 143 235 135 220 120 C185 88 150 78 110 75 Z' fill='#e2e8f0' stroke='#cbd5e1' stroke-width='1.5'/>
  <!-- Lamp / Fiberoptic emitter -->
  <circle cx='185' cy='82' r='4' fill='#fef08a' stroke='#f59e0b' stroke-width='1.5'/>
  <!-- Light Beam Flare -->
  <path d='M187 84 L260 145 L245 165 Z' fill='#fef08a' opacity='0.25'/>
</svg>"""
    },
    "rsi": {
        "formula": "Technique • Rapid Sequence Syringe",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Barrel -->
  <rect x='100' y='65' width='100' height='40' rx='4' fill='#0284c7' fill-opacity='0.25' stroke='#38bdf8' stroke-width='2.5'/>
  <!-- Graduation marks -->
  <line x1='120' y1='65' x2='120' y2='78' stroke='#38bdf8' stroke-width='2'/>
  <line x1='140' y1='65' x2='140' y2='83' stroke='#38bdf8' stroke-width='2'/>
  <line x1='160' y1='65' x2='160' y2='78' stroke='#38bdf8' stroke-width='2'/>
  <line x1='180' y1='65' x2='180' y2='83' stroke='#38bdf8' stroke-width='2'/>
  <!-- Liquid Content -->
  <rect x='135' y='68' width='62' height='34' fill='#0ea5e9' fill-opacity='0.6'/>
  <!-- Plunger & Rubber Stopper -->
  <rect x='130' y='66' width='8' height='38' rx='2' fill='#0f172a'/>
  <rect x='60' y='81' width='70' height='8' fill='#94a3b8'/>
  <!-- Finger Flange Rings -->
  <circle cx='50' cy='85' r='14' fill='none' stroke='#94a3b8' stroke-width='3'/>
  <path d='M100 50 L100 120' stroke='#94a3b8' stroke-width='4' stroke-linecap='round'/>
  <!-- Luer Lock & Needle -->
  <path d='M200 80 L212 80 L212 90 L200 90 Z' fill='#0284c7'/>
  <line x1='212' y1='85' x2='265' y2='85' stroke='#f8fafc' stroke-width='2.2' stroke-linecap='round'/>
  <polygon points='265,85 258,82 258,88' fill='#f8fafc'/>
</svg>"""
    },
    "anaesthesia-machine": {
        "formula": "Workstation • Rotameter Flowmeter",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Frame Block -->
  <rect x='70' y='25' width='160' height='170' rx='8' fill='#1e293b' stroke='#475569' stroke-width='2'/>
  <!-- Left Tube (Oxygen) -->
  <path d='M105 45 L115 150 L95 150 Z' fill='#38bdf8' fill-opacity='0.25' stroke='#38bdf8' stroke-width='1.5'/>
  <polygon points='100,100 110,100 108,108 102,108' fill='#22c55e' stroke='#16a34a' stroke-width='1.2'/>
  <!-- Right Tube (Nitrous / Air) -->
  <path d='M185 45 L195 150 L175 150 Z' fill='#38bdf8' fill-opacity='0.25' stroke='#38bdf8' stroke-width='1.5'/>
  <polygon points='180,120 190,120 188,128 182,128' fill='#3b82f6' stroke='#1d4ed8' stroke-width='1.2'/>
  <!-- Control Knobs -->
  <circle cx='105' cy='172' r='14' fill='#16a34a' stroke='#22c55e' stroke-width='2'/>
  <text x='105' y='176' font-size='10' font-weight='bold' fill='#ffffff' text-anchor='middle'>O2</text>
  <circle cx='185' cy='172' r='14' fill='#1d4ed8' stroke='#3b82f6' stroke-width='2'/>
  <text x='185' y='176' font-size='9' font-weight='bold' fill='#ffffff' text-anchor='middle'>N2O</text>
</svg>"""
    },
    "asa-monitoring": {
        "formula": "Monitoring • Pulse Oximeter Clip",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Upper Clip Jaw -->
  <path d='M80 90 C120 70 190 70 220 90 C225 93 225 105 218 108 C190 95 120 95 80 110 Z' fill='#1e293b' stroke='#94a3b8' stroke-width='2'/>
  <!-- Lower Clip Jaw -->
  <path d='M80 130 C120 150 190 150 220 130 C225 127 225 115 218 112 C190 125 120 125 80 110 Z' fill='#1e293b' stroke='#94a3b8' stroke-width='2'/>
  <!-- Sensor LED Emitter -->
  <circle cx='170' cy='95' r='5' fill='#ef4444' stroke='#f87171' stroke-width='1.5'/>
  <line x1='170' y1='95' x2='170' y2='125' stroke='#ef4444' stroke-width='2' stroke-dasharray='3,3' opacity='0.7'/>
  <circle cx='170' cy='125' r='5' fill='#0284c7' stroke='#38bdf8' stroke-width='1.5'/>
  <!-- Spring Hinge -->
  <circle cx='80' cy='110' r='10' fill='#475569' stroke='#94a3b8' stroke-width='2'/>
  <!-- Cable -->
  <path d='M70 110 C40 110 35 150 60 170' fill='none' stroke='#0284c7' stroke-width='3.5' stroke-linecap='round'/>
</svg>"""
    },
    "fluid-transfusion": {
        "formula": "Infusion • IV Drip Chamber",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Spike -->
  <polygon points='150,20 144,45 156,45' fill='#f1f5f9' stroke='#cbd5e1' stroke-width='1.5'/>
  <rect x='138' y='45' width='24' height='10' rx='2' fill='#0284c7'/>
  <!-- Drip Chamber Cylindrical Body -->
  <rect x='135' y='55' width='30' height='90' rx='6' fill='#38bdf8' fill-opacity='0.2' stroke='#38bdf8' stroke-width='2'/>
  <!-- Drop Nozzle & Falling Droplet -->
  <line x1='150' y1='55' x2='150' y2='68' stroke='#0284c7' stroke-width='2.5'/>
  <ellipse cx='150' cy='82' rx='3.5' ry='5' fill='#38bdf8'/>
  <!-- Fluid Reservoir at bottom -->
  <rect x='136' y='110' width='28' height='33' rx='4' fill='#0ea5e9' fill-opacity='0.65'/>
  <!-- Tubing -->
  <path d='M150 145 L150 180 C150 200 175 195 190 205' fill='none' stroke='#38bdf8' stroke-width='3.5' stroke-linecap='round'/>
  <!-- Roller clamp schematic -->
  <rect x='140' y='170' width='20' height='14' rx='3' fill='#1e293b' stroke='#64748b' stroke-width='1.5'/>
  <circle cx='150' cy='177' r='3.5' fill='#f59e0b'/>
</svg>"""
    },
    "regional-physiology": {
        "formula": "Neuraxial • Tuohy 18G Needle",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Hub with Wings -->
  <polygon points='50,110 70,85 70,135' fill='#0284c7' opacity='0.85'/>
  <rect x='70' y='102' width='25' height='16' rx='2' fill='#0284c7' stroke='#38bdf8' stroke-width='1.5'/>
  <circle cx='46' cy='110' r='5' fill='#94a3b8'/>
  <!-- Needle Shaft -->
  <rect x='95' y='108' width='140' height='4' fill='#e2e8f0' stroke='#cbd5e1' stroke-width='0.5'/>
  <!-- 1-cm Markings -->
  <line x1='130' y1='105' x2='130' y2='115' stroke='#0f172a' stroke-width='2'/>
  <line x1='160' y1='105' x2='160' y2='115' stroke='#0f172a' stroke-width='2'/>
  <line x1='190' y1='105' x2='190' y2='115' stroke='#0f172a' stroke-width='2'/>
  <line x1='220' y1='105' x2='220' y2='115' stroke='#0f172a' stroke-width='2'/>
  <!-- Huber Curved Bevel Tip -->
  <path d='M235 108 C242 108 248 103 252 96 L248 94 C244 100 238 111 235 111 Z' fill='#f8fafc' stroke='#cbd5e1' stroke-width='1'/>
</svg>"""
    },
    "anaphylaxis-anaesthesia": {
        "formula": "Immunology • IgE Antibody Complex",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Stem (Fc region) -->
  <rect x='144' y='125' width='12' height='65' rx='4' fill='#8b5cf6' stroke='#a855f7' stroke-width='2'/>
  <!-- Left Fab Arm -->
  <path d='M146 130 L95 65' stroke='#a855f7' stroke-width='11' stroke-linecap='round'/>
  <!-- Right Fab Arm -->
  <path d='M154 130 L205 65' stroke='#a855f7' stroke-width='11' stroke-linecap='round'/>
  <!-- Variable antigen binding domains -->
  <circle cx='92' cy='61' r='10' fill='#ec4899' stroke='#f472b6' stroke-width='2'/>
  <circle cx='208' cy='61' r='10' fill='#ec4899' stroke='#f472b6' stroke-width='2'/>
  <!-- Disulfide hinge center -->
  <circle cx='150' cy='125' r='7' fill='#f59e0b' stroke='#fbbf24' stroke-width='2'/>
  <!-- Antigens -->
  <polygon points='92,35 84,48 100,48' fill='#ef4444'/>
  <polygon points='208,35 200,48 216,48' fill='#ef4444'/>
</svg>"""
    },
    "eras": {
        "formula": "Pathway • Multimodal Optimization",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Triad Outer Ring -->
  <circle cx='150' cy='110' r='65' fill='none' stroke='#334155' stroke-width='3' stroke-dasharray='5,5'/>
  <!-- Interlocking triad orbital rings -->
  <circle cx='150' cy='75' r='38' fill='none' stroke='#10b981' stroke-width='3.5'/>
  <circle cx='120' cy='135' r='38' fill='none' stroke='#0ea5e9' stroke-width='3.5'/>
  <circle cx='180' cy='135' r='38' fill='none' stroke='#f59e0b' stroke-width='3.5'/>
  <!-- Center Core Recovery -->
  <circle cx='150' cy='110' r='16' fill='#1e293b' stroke='#f8fafc' stroke-width='2'/>
  <path d='M144 110 L148 114 L157 105' fill='none' stroke='#38bdf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/>
  <!-- Axis Labels -->
  <text x='150' y='32' font-size='10' font-weight='bold' fill='#10b981' text-anchor='middle'>NUTRITION</text>
  <text x='70' y='180' font-size='10' font-weight='bold' fill='#0ea5e9' text-anchor='middle'>ANALGESIA</text>
  <text x='230' y='180' font-size='10' font-weight='bold' fill='#f59e0b' text-anchor='middle'>MOBILITY</text>
</svg>"""
    },
    "breathing-systems-mapleson": {
        "formula": "Circuit • APL Pop-Off Valve",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Rotary Adjustment Dial Cap -->
  <rect x='110' y='30' width='80' height='30' rx='6' fill='#0284c7' stroke='#38bdf8' stroke-width='2'/>
  <line x1='130' y1='30' x2='130' y2='60' stroke='#0369a1' stroke-width='2'/>
  <line x1='150' y1='30' x2='150' y2='60' stroke='#0369a1' stroke-width='2'/>
  <line x1='170' y1='30' x2='170' y2='60' stroke='#0369a1' stroke-width='2'/>
  <!-- Calibrated Scale -->
  <rect x='125' y='60' width='50' height='16' fill='#e2e8f0' stroke='#94a3b8' stroke-width='1.5'/>
  <text x='150' y='72' font-size='10' font-weight='bold' fill='#0f172a' text-anchor='middle'>APL</text>
  <!-- Internal Spring -->
  <path d='M135 85 Q165 92 135 100 Q165 108 135 116 Q165 124 135 132' fill='none' stroke='#94a3b8' stroke-width='2.5'/>
  <!-- Valve Chamber -->
  <path d='M115 80 L185 80 L185 140 L215 140 L215 165 L185 165 L185 190 L115 190 Z' fill='#1e293b' fill-opacity='0.6' stroke='#64748b' stroke-width='2'/>
  <!-- Exhaust Port (Right) -->
  <rect x='185' y='142' width='30' height='20' fill='#0284c7' opacity='0.7'/>
  <!-- Patient / Circuit Port (Bottom) -->
  <rect x='130' y='180' width='40' height='25' fill='#475569' stroke='#94a3b8' stroke-width='1.5'/>
</svg>"""
    },
    "circle-system": {
        "formula": "Rebreathing • CO2 Absorber Canister",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Top Manifold -->
  <rect x='85' y='40' width='130' height='20' rx='4' fill='#334155' stroke='#64748b' stroke-width='2'/>
  <!-- Inspiratory & Expiratory Dome Check Valves -->
  <ellipse cx='110' cy='32' rx='16' ry='12' fill='#38bdf8' fill-opacity='0.45' stroke='#38bdf8' stroke-width='2'/>
  <ellipse cx='190' cy='32' rx='16' ry='12' fill='#38bdf8' fill-opacity='0.45' stroke='#38bdf8' stroke-width='2'/>
  <!-- Upper Canister -->
  <rect x='95' y='65' width='110' height='55' rx='6' fill='#bae6fd' fill-opacity='0.25' stroke='#38bdf8' stroke-width='2'/>
  <!-- Soda Lime Granulate (Upper) -->
  <pattern id='dots' width='10' height='10' patternUnits='userSpaceOnUse'>
    <circle cx='3' cy='3' r='1.8' fill='#f1f5f9'/>
    <circle cx='8' cy='8' r='1.8' fill='#f1f5f9'/>
  </pattern>
  <rect x='98' y='68' width='104' height='49' fill='url(#dots)' opacity='0.85'/>
  <!-- Center Divider Band -->
  <rect x='90' y='123' width='120' height='10' rx='2' fill='#475569'/>
  <!-- Lower Canister -->
  <rect x='95' y='136' width='110' height='55' rx='6' fill='#bae6fd' fill-opacity='0.25' stroke='#38bdf8' stroke-width='2'/>
  <rect x='98' y='139' width='104' height='49' fill='url(#dots)' opacity='0.85'/>
  <!-- Base Drain -->
  <polygon points='150,205 140,195 160,195' fill='#334155'/>
</svg>"""
    },
    "ventilators-classification": {
        "formula": "Ventilator • Ascending Bellows",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Outer Transparent Dome -->
  <path d='M95 180 L95 65 C95 35 205 35 205 65 L205 180 Z' fill='#38bdf8' fill-opacity='0.2' stroke='#38bdf8' stroke-width='2.5'/>
  <!-- Base Plate -->
  <rect x='75' y='180' width='150' height='24' rx='4' fill='#1e293b' stroke='#475569' stroke-width='2'/>
  <!-- Accordion Bellows Pleats -->
  <path d='M115 175 L185 175 L195 160 L105 160 L195 145 L105 145 L195 130 L105 130 L195 115 L105 115 L185 100 L115 100 Z' fill='#0284c7' stroke='#38bdf8' stroke-width='2' stroke-linejoin='round'/>
  <!-- Weighted Top Bellows Plate -->
  <rect x='110' y='90' width='80' height='12' rx='3' fill='#0f172a' stroke='#64748b' stroke-width='1.5'/>
  <!-- Scale marks on glass dome -->
  <line x1='195' y1='75' x2='202' y2='75' stroke='#38bdf8' stroke-width='2'/>
  <line x1='195' y1='100' x2='202' y2='100' stroke='#38bdf8' stroke-width='2'/>
  <line x1='195' y1='125' x2='202' y2='125' stroke='#38bdf8' stroke-width='2'/>
  <line x1='195' y1='150' x2='202' y2='150' stroke='#38bdf8' stroke-width='2'/>
</svg>"""
    },
    "vaporizers-device": {
        "formula": "Inhalational • Variable-Bypass Vaporizer",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Main Vaporizer Chassis -->
  <rect x='80' y='35' width='140' height='155' rx='8' fill='#1e293b' stroke='#475569' stroke-width='2'/>
  <!-- Front Sevoflurane Gold Plate -->
  <rect x='90' y='45' width='120' height='135' rx='4' fill='#eab308' fill-opacity='0.85'/>
  <!-- Concentration Dial -->
  <circle cx='150' cy='90' r='32' fill='#0f172a' stroke='#cbd5e1' stroke-width='2'/>
  <circle cx='150' cy='90' r='10' fill='#ef4444'/>
  <!-- Dial Numbers -->
  <text x='150' y='68' font-size='9' font-weight='bold' fill='#f8fafc' text-anchor='middle'>2%</text>
  <text x='172' y='93' font-size='9' font-weight='bold' fill='#f8fafc' text-anchor='middle'>4%</text>
  <text x='128' y='93' font-size='9' font-weight='bold' fill='#f8fafc' text-anchor='middle'>1%</text>
  <!-- Liquid Sight Glass -->
  <rect x='165' y='135' width='25' height='40' rx='3' fill='#38bdf8' fill-opacity='0.4' stroke='#0f172a' stroke-width='1.5'/>
  <rect x='167' y='152' width='21' height='21' fill='#0284c7' opacity='0.8'/>
  <!-- Keyed filler block -->
  <rect x='105' y='145' width='35' height='25' rx='2' fill='#475569'/>
</svg>"""
    },
    "airway-devices-equipment": {
        "formula": "Airway • Cuffed Endotracheal Tube",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- 15mm Machine Connector -->
  <polygon points='55,45 80,55 75,70 50,60' fill='#0284c7' stroke='#38bdf8' stroke-width='1.5'/>
  <!-- Magill Curved Shaft -->
  <path d='M75 62 C130 90 200 130 220 180' fill='none' stroke='#bae6fd' stroke-width='14' stroke-linecap='round' opacity='0.75'/>
  <!-- Radiopaque Stripe -->
  <path d='M75 62 C130 90 200 130 220 180' fill='none' stroke='#0284c7' stroke-width='2.5' stroke-linecap='round'/>
  <!-- Inflatable Cuff -->
  <ellipse cx='195' cy='150' rx='18' ry='26' transform='rotate(-40 195 150)' fill='#38bdf8' fill-opacity='0.45' stroke='#38bdf8' stroke-width='2'/>
  <!-- Murphy Eye -->
  <ellipse cx='215' cy='173' rx='3.5' ry='6' fill='#0f172a'/>
  <!-- Beveled Tip -->
  <polygon points='215,183 227,185 220,172' fill='#f8fafc'/>
  <!-- Pilot Balloon Line -->
  <path d='M100 80 Q120 40 160 55' fill='none' stroke='#0284c7' stroke-width='1.8'/>
  <ellipse cx='165' cy='58' rx='9' ry='6' fill='#38bdf8' fill-opacity='0.7' stroke='#0284c7' stroke-width='1.5'/>
</svg>"""
    },
    "humidification-scavenging": {
        "formula": "Airway Filter • HMEF Filter Unit",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Patient-side 22/15mm Port -->
  <rect x='60' y='92' width='35' height='36' rx='3' fill='#0284c7' stroke='#38bdf8' stroke-width='1.5'/>
  <!-- Filter Body (Disc) -->
  <ellipse cx='150' cy='110' rx='60' ry='50' fill='#e0f2fe' fill-opacity='0.35' stroke='#38bdf8' stroke-width='2.5'/>
  <!-- Pleated Membrane Core -->
  <path d='M115 80 L118 140 L125 80 L128 140 L135 80 L138 140 L145 80 L148 140 L155 80 L158 140 L165 80 L168 140 L175 80 L178 140 L185 80 L188 140' stroke='#f8fafc' stroke-width='2' fill='none'/>
  <!-- Machine-side Port -->
  <rect x='205' y='95' width='35' height='30' rx='3' fill='#475569' stroke='#94a3b8' stroke-width='1.5'/>
  <!-- Gas Sampling Luer Port -->
  <rect x='142' y='50' width='16' height='15' fill='#0284c7'/>
  <circle cx='150' cy='48' r='5' fill='#f59e0b'/>
</svg>"""
    },
    "warming-suction-devices": {
        "formula": "Surgical Suction • Canister & Yankauer",
        "svg": """<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' width='300' height='220'>
  <!-- Collection Canister -->
  <path d='M75 75 L85 190 L165 190 L175 75 Z' fill='#93c5fd' fill-opacity='0.25' stroke='#38bdf8' stroke-width='2'/>
  <!-- Fluid Pool -->
  <path d='M83 140 L85 190 L165 190 L167 140 Z' fill='#0284c7' fill-opacity='0.6'/>
  <!-- Lid -->
  <rect x='68' y='65' width='114' height='14' rx='3' fill='#1e293b' stroke='#475569' stroke-width='2'/>
  <!-- Ports -->
  <rect x='90' y='52' width='14' height='14' fill='#64748b'/>
  <rect x='145' y='52' width='14' height='14' fill='#0284c7'/>
  <!-- Yankauer Suction Wand -->
  <path d='M152 52 C152 20 220 20 225 70 L235 150 C238 175 255 180 255 185' fill='none' stroke='#38bdf8' stroke-width='5' stroke-linecap='round'/>
  <!-- Yankauer Tip Bulb -->
  <circle cx='255' cy='188' r='5.5' fill='#38bdf8'/>
</svg>"""
    }
}

# 3. Procedural 3D Models for Devices & Clinical Topics
MODELS_3D = {
    "preop-assessment": {
        "boundingRadius": 3.2,
        "parts": [
            {"geo": "cylinder", "args": [1.3, 1.3, 0.35, 32], "pos": [0, -1.8, 0], "color": 0x94a3b8, "metalness": 0.9, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.9, 0.9, 0.35, 28], "pos": [0, -1.45, 0], "color": 0x38bdf8, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.28, 0.28, 0.6, 16], "pos": [0, -0.95, 0], "color": 0x64748b, "metalness": 0.8},
            {"geo": "cylinder", "args": [0.24, 0.24, 1.4, 16], "pos": [0, -0.1, 0], "color": 0x1e3a8a, "roughness": 0.3, "clearcoat": 0.6},
            {"geo": "sphere", "args": [0.35, 16, 16], "pos": [0, 0.7, 0], "color": 0x0f172a},
            {"geo": "cylinder", "args": [0.18, 0.18, 1.8, 16], "pos": [-0.7, 1.5, 0], "rot": [0, 0, 0.35], "color": 0xd1d5db, "metalness": 0.9},
            {"geo": "cylinder", "args": [0.18, 0.18, 1.8, 16], "pos": [0.7, 1.5, 0], "rot": [0, 0, -0.35], "color": 0xd1d5db, "metalness": 0.9},
            {"geo": "sphere", "args": [0.28, 16, 16], "pos": [-1.25, 2.35, 0], "color": 0x0284c7},
            {"geo": "sphere", "args": [0.28, 16, 16], "pos": [1.25, 2.35, 0], "color": 0x0284c7}
        ]
    },
    "asa-pscore": {
        "boundingRadius": 3.0,
        "parts": [
            {"geo": "sphere", "args": [1.4, 32, 24], "pos": [0, -0.4, 0], "scale": [1.0, 1.3, 0.85], "color": 0xbe123c, "clearcoat": 0.9},
            {"geo": "sphere", "args": [0.85, 20, 16], "pos": [0.75, 0.5, -0.2], "color": 0xe11d48, "clearcoat": 0.8},
            {"geo": "sphere", "args": [0.85, 20, 16], "pos": [-0.75, 0.45, -0.1], "color": 0x9f1239, "clearcoat": 0.8},
            {"geo": "torus", "args": [1.1, 0.38, 16, 32], "pos": [0.15, 1.1, 0], "rot": [0.3, 0.2, -0.4], "color": 0xf43f5e, "clearcoat": 0.9},
            {"geo": "cylinder", "args": [0.16, 0.16, 0.8, 16], "pos": [-0.45, 2.0, 0], "rot": [0, 0, -0.2], "color": 0xf43f5e},
            {"geo": "cylinder", "args": [0.15, 0.15, 0.8, 16], "pos": [0.05, 2.15, 0], "color": 0xf43f5e},
            {"geo": "cylinder", "args": [0.15, 0.15, 0.75, 16], "pos": [0.55, 2.05, 0], "rot": [0, 0, 0.2], "color": 0xf43f5e},
            {"geo": "cylinder", "args": [0.32, 0.32, 1.5, 16], "pos": [-1.0, 1.3, -0.2], "rot": [0, 0, 0.1], "color": 0x2563eb},
            {"geo": "cylinder", "args": [0.34, 0.34, 1.2, 16], "pos": [0.2, 0.8, 0.4], "rot": [0.4, 0, -0.5], "color": 0x38bdf8}
        ]
    },
    "airway-assessment": {
        "boundingRadius": 3.6,
        "parts": [
            {"geo": "cylinder", "args": [0.65, 0.65, 3.2, 24], "pos": [-1.0, -0.6, 0], "color": 0x94a3b8, "metalness": 0.85, "roughness": 0.25},
            {"geo": "cylinder", "args": [0.72, 0.72, 0.35, 24], "pos": [-1.0, -2.3, 0], "color": 0x64748b, "metalness": 0.8},
            {"geo": "box", "args": [1.1, 0.8, 0.9], "pos": [-0.7, 1.15, 0], "color": 0x475569},
            {"geo": "box", "args": [1.3, 0.45, 0.7], "pos": [0.2, 1.35, 0], "rot": [0, 0, 0.2], "color": 0xe2e8f0, "metalness": 0.95, "clearcoat": 1},
            {"geo": "box", "args": [1.4, 0.4, 0.6], "pos": [1.4, 1.7, 0], "rot": [0, 0, 0.45], "color": 0xe2e8f0, "metalness": 0.95, "clearcoat": 1},
            {"geo": "box", "args": [1.2, 0.35, 0.5], "pos": [2.4, 2.4, 0], "rot": [0, 0, 0.75], "color": 0xe2e8f0, "metalness": 0.95, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.12, 0.12, 0.3, 12], "pos": [1.8, 1.85, 0.35], "rot": [0, 0, 0.6], "color": 0xfef08a, "clearcoat": 1},
            {"geo": "cone", "args": [0.45, 1.1, 16], "pos": [2.7, 2.45, 0.35], "rot": [0, 0, -0.9], "color": 0xfef08a, "opacity": 0.5, "transparent": True}
        ]
    },
    "rsi": {
        "boundingRadius": 3.5,
        "parts": [
            {"geo": "cylinder", "args": [0.6, 0.6, 2.8, 24], "pos": [0, 0, 0], "color": 0x38bdf8, "opacity": 0.45, "transparent": True},
            {"geo": "cylinder", "args": [0.52, 0.52, 1.8, 20], "pos": [0, -0.3, 0], "color": 0x0284c7, "opacity": 0.85, "transparent": True},
            {"geo": "box", "args": [2.2, 0.2, 0.9], "pos": [0, 1.4, 0], "color": 0x94a3b8, "metalness": 0.4},
            {"geo": "cylinder", "args": [0.55, 0.55, 0.35, 20], "pos": [0, 0.6, 0], "color": 0x0f172a},
            {"geo": "cylinder", "args": [0.2, 0.2, 1.8, 16], "pos": [0, 1.7, 0], "color": 0xf1f5f9},
            {"geo": "torus", "args": [0.6, 0.15, 16, 24], "pos": [0, 2.7, 0], "color": 0x94a3b8, "metalness": 0.6},
            {"geo": "cylinder", "args": [0.32, 0.32, 0.5, 16], "pos": [0, -1.6, 0], "color": 0x0284c7},
            {"geo": "cylinder", "args": [0.05, 0.05, 1.5, 12], "pos": [0, -2.55, 0], "color": 0xf8fafc, "metalness": 0.95, "clearcoat": 1}
        ]
    },
    "anaesthesia-machine": {
        "boundingRadius": 3.2,
        "parts": [
            {"geo": "box", "args": [2.6, 0.6, 1.2], "pos": [0, -1.8, 0], "color": 0x334155},
            {"geo": "box", "args": [2.6, 0.5, 1.2], "pos": [0, 1.8, 0], "color": 0x334155},
            {"geo": "cylinder", "args": [0.35, 0.28, 3.1, 20], "pos": [-0.65, 0, 0], "color": 0x67e8f9, "opacity": 0.45, "transparent": True},
            {"geo": "cylinder", "args": [0.24, 0.2, 0.35, 16], "pos": [-0.65, 0.4, 0], "color": 0x22c55e},
            {"geo": "cylinder", "args": [0.45, 0.45, 0.5, 20], "pos": [-0.65, -2.2, 0], "rot": [1.57, 0, 0], "color": 0x16a34a},
            {"geo": "cylinder", "args": [0.35, 0.28, 3.1, 20], "pos": [0.65, 0, 0], "color": 0x67e8f9, "opacity": 0.45, "transparent": True},
            {"geo": "cylinder", "args": [0.24, 0.2, 0.35, 16], "pos": [0.65, -0.3, 0], "color": 0x3b82f6},
            {"geo": "cylinder", "args": [0.45, 0.45, 0.5, 20], "pos": [0.65, -2.2, 0], "rot": [1.57, 0, 0], "color": 0x0284c7}
        ]
    },
    "asa-monitoring": {
        "boundingRadius": 2.8,
        "parts": [
            {"geo": "box", "args": [2.4, 0.5, 1.3], "pos": [0, 0.65, 0], "rot": [0, 0, 0.12], "color": 0x1e293b},
            {"geo": "box", "args": [2.4, 0.5, 1.3], "pos": [0, -0.65, 0], "rot": [0, 0, -0.12], "color": 0x1e293b},
            {"geo": "box", "args": [2.0, 0.25, 1.1], "pos": [0, 0.32, 0], "color": 0x64748b},
            {"geo": "box", "args": [2.0, 0.25, 1.1], "pos": [0, -0.32, 0], "color": 0x64748b},
            {"geo": "cylinder", "args": [0.22, 0.22, 0.15, 16], "pos": [0.4, 0.2, 0], "color": 0xef4444, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.22, 0.22, 0.15, 16], "pos": [0.4, -0.2, 0], "color": 0x0284c7, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.4, 0.4, 1.4, 16], "pos": [-1.2, 0, 0], "rot": [1.57, 0, 0], "color": 0x94a3b8, "metalness": 0.8},
            {"geo": "cylinder", "args": [0.3, 0.2, 0.8, 16], "pos": [-1.7, 0, 0], "rot": [0, 0, 1.57], "color": 0x0f172a}
        ]
    },
    "fluid-transfusion": {
        "boundingRadius": 3.2,
        "parts": [
            {"geo": "cone", "args": [0.35, 1.1, 16], "pos": [0, 2.3, 0], "color": 0xf8fafc, "metalness": 0.85},
            {"geo": "cylinder", "args": [0.6, 0.6, 0.35, 20], "pos": [0, 1.6, 0], "color": 0x0284c7},
            {"geo": "cylinder", "args": [0.15, 0.08, 0.5, 16], "pos": [0, 1.25, 0], "color": 0x0284c7},
            {"geo": "sphere", "args": [0.2, 16, 16], "pos": [0, 0.7, 0], "color": 0x38bdf8, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.75, 0.75, 2.4, 24], "pos": [0, 0.2, 0], "color": 0x93c5fd, "opacity": 0.45, "transparent": True},
            {"geo": "cylinder", "args": [0.72, 0.72, 0.7, 20], "pos": [0, -0.65, 0], "color": 0x0284c7, "opacity": 0.8, "transparent": True},
            {"geo": "cylinder", "args": [0.7, 0.7, 0.1, 20], "pos": [0, -0.2, 0], "color": 0xf1f5f9, "wireframe": True},
            {"geo": "cylinder", "args": [0.25, 0.25, 1.2, 16], "pos": [0, -1.6, 0], "color": 0x38bdf8, "opacity": 0.7, "transparent": True}
        ]
    },
    "regional-physiology": {
        "boundingRadius": 3.2,
        "parts": [
            {"geo": "cylinder", "args": [0.08, 0.08, 3.8, 16], "pos": [0, 0.3, 0], "color": 0xe2e8f0, "metalness": 0.95, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.08, 0.04, 0.45, 16], "pos": [-0.08, 2.3, 0], "rot": [0, 0, 0.35], "color": 0xf8fafc, "metalness": 0.95},
            {"geo": "cylinder", "args": [0.09, 0.09, 0.15, 16], "pos": [0, 1.5, 0], "color": 0x0f172a},
            {"geo": "cylinder", "args": [0.09, 0.09, 0.15, 16], "pos": [0, 1.1, 0], "color": 0x0f172a},
            {"geo": "cylinder", "args": [0.09, 0.09, 0.15, 16], "pos": [0, 0.7, 0], "color": 0x0f172a},
            {"geo": "cylinder", "args": [0.45, 0.3, 0.9, 20], "pos": [0, -1.9, 0], "color": 0x0284c7, "opacity": 0.85, "transparent": True},
            {"geo": "box", "args": [2.2, 0.2, 0.7], "pos": [0, -2.1, 0], "color": 0x0284c7, "opacity": 0.85, "transparent": True},
            {"geo": "cylinder", "args": [0.18, 0.18, 0.4, 16], "pos": [0, -2.5, 0], "color": 0xd1d5db, "metalness": 0.8}
        ]
    },
    "anaphylaxis-anaesthesia": {
        "boundingRadius": 3.1,
        "parts": [
            {"geo": "cylinder", "args": [0.35, 0.35, 1.8, 16], "pos": [0, -1.0, 0], "color": 0x8b5cf6},
            {"geo": "cylinder", "args": [0.32, 0.32, 1.9, 16], "pos": [-0.9, 0.7, 0], "rot": [0, 0, -0.6], "color": 0xa855f7},
            {"geo": "cylinder", "args": [0.32, 0.32, 1.9, 16], "pos": [0.9, 0.7, 0], "rot": [0, 0, 0.6], "color": 0xa855f7},
            {"geo": "sphere", "args": [0.48, 16, 16], "pos": [-1.75, 1.6, 0], "color": 0xec4899},
            {"geo": "sphere", "args": [0.48, 16, 16], "pos": [1.75, 1.6, 0], "color": 0xec4899},
            {"geo": "sphere", "args": [0.45, 16, 16], "pos": [0, 0, 0], "color": 0xf59e0b},
            {"geo": "sphere", "args": [0.3, 12, 12], "pos": [-2.1, 1.9, 0], "color": 0xef4444},
            {"geo": "sphere", "args": [0.3, 12, 12], "pos": [2.1, 1.9, 0], "color": 0xef4444}
        ]
    },
    "eras": {
        "boundingRadius": 2.5,
        "parts": [
            {"geo": "torus", "args": [1.6, 0.12, 16, 40], "pos": [0, 0, 0], "rot": [1.57, 0, 0], "color": 0x10b981},
            {"geo": "torus", "args": [1.6, 0.12, 16, 40], "pos": [0, 0, 0], "rot": [0, 1.57, 0], "color": 0x0ea5e9},
            {"geo": "torus", "args": [1.6, 0.12, 16, 40], "pos": [0, 0, 0], "rot": [0.78, 0.78, 0], "color": 0xf59e0b},
            {"geo": "sphere", "args": [0.7, 24, 20], "pos": [0, 0, 0], "color": 0xf8fafc, "clearcoat": 1, "roughness": 0.1},
            {"geo": "sphere", "args": [0.2, 12, 12], "pos": [1.6, 0, 0], "color": 0x6366f1},
            {"geo": "sphere", "args": [0.2, 12, 12], "pos": [-1.6, 0, 0], "color": 0x6366f1},
            {"geo": "sphere", "args": [0.2, 12, 12], "pos": [0, 1.6, 0], "color": 0x6366f1},
            {"geo": "sphere", "args": [0.2, 12, 12], "pos": [0, -1.6, 0], "color": 0x6366f1}
        ]
    },
    "breathing-systems-mapleson": {
        "boundingRadius": 2.8,
        "parts": [
            {"geo": "cylinder", "args": [1.1, 1.1, 0.5, 24], "pos": [0, 1.5, 0], "color": 0x0284c7},
            {"geo": "cylinder", "args": [1.0, 1.0, 0.3, 24], "pos": [0, 1.1, 0], "color": 0xd1d5db},
            {"geo": "cylinder", "args": [0.45, 0.45, 0.9, 16], "pos": [0, 0.5, 0], "color": 0x94a3b8, "metalness": 0.8},
            {"geo": "cylinder", "args": [0.9, 0.9, 1.2, 20], "pos": [0, -0.3, 0], "color": 0xe2e8f0, "opacity": 0.6, "transparent": True},
            {"geo": "cylinder", "args": [0.7, 0.65, 0.9, 20], "pos": [0, -1.3, 0], "color": 0x64748b},
            {"geo": "cylinder", "args": [0.55, 0.55, 1.0, 16], "pos": [0.9, -0.3, 0], "rot": [0, 0, 1.57], "color": 0x475569}
        ]
    },
    "circle-system": {
        "boundingRadius": 3.1,
        "parts": [
            {"geo": "box", "args": [2.4, 0.45, 1.4], "pos": [0, 1.6, 0], "color": 0x334155},
            {"geo": "sphere", "args": [0.45, 16, 16], "pos": [-0.65, 2.0, 0], "color": 0x38bdf8, "opacity": 0.65, "transparent": True},
            {"geo": "sphere", "args": [0.45, 16, 16], "pos": [0.65, 2.0, 0], "color": 0x38bdf8, "opacity": 0.65, "transparent": True},
            {"geo": "cylinder", "args": [0.95, 0.95, 1.2, 24], "pos": [0, 0.8, 0], "color": 0xbae6fd, "opacity": 0.4, "transparent": True},
            {"geo": "cylinder", "args": [0.88, 0.88, 1.0, 20], "pos": [0, 0.8, 0], "color": 0xf1f5f9},
            {"geo": "cylinder", "args": [1.02, 1.02, 0.25, 24], "pos": [0, 0.1, 0], "color": 0x475569},
            {"geo": "cylinder", "args": [0.95, 0.95, 1.2, 24], "pos": [0, -0.6, 0], "color": 0xbae6fd, "opacity": 0.4, "transparent": True},
            {"geo": "cylinder", "args": [0.88, 0.88, 1.0, 20], "pos": [0, -0.6, 0], "color": 0xf1f5f9},
            {"geo": "cylinder", "args": [0.6, 0.4, 0.5, 16], "pos": [0, -1.45, 0], "color": 0x334155}
        ]
    },
    "ventilators-classification": {
        "boundingRadius": 3.3,
        "parts": [
            {"geo": "cylinder", "args": [1.3, 1.3, 3.2, 24], "pos": [0, 0.2, 0], "color": 0x38bdf8, "opacity": 0.35, "transparent": True},
            {"geo": "sphere", "args": [1.3, 24, 16], "pos": [0, 1.8, 0], "color": 0x38bdf8, "opacity": 0.35, "transparent": True},
            {"geo": "box", "args": [2.8, 0.5, 2.2], "pos": [0, -1.6, 0], "color": 0x1e293b},
            {"geo": "torus", "args": [0.95, 0.14, 12, 24], "pos": [0, -1.1, 0], "rot": [1.57, 0, 0], "color": 0x0284c7},
            {"geo": "torus", "args": [0.95, 0.14, 12, 24], "pos": [0, -0.7, 0], "rot": [1.57, 0, 0], "color": 0x0284c7},
            {"geo": "torus", "args": [0.95, 0.14, 12, 24], "pos": [0, -0.3, 0], "rot": [1.57, 0, 0], "color": 0x0284c7},
            {"geo": "torus", "args": [0.95, 0.14, 12, 24], "pos": [0, 0.1, 0], "rot": [1.57, 0, 0], "color": 0x0284c7},
            {"geo": "torus", "args": [0.95, 0.14, 12, 24], "pos": [0, 0.5, 0], "rot": [1.57, 0, 0], "color": 0x0284c7},
            {"geo": "cylinder", "args": [1.0, 1.0, 0.2, 24], "pos": [0, 0.75, 0], "color": 0x0f172a},
            {"geo": "cylinder", "args": [0.22, 0.22, 0.6, 12], "pos": [-1.2, -1.6, 0], "rot": [0, 0, 1.57], "color": 0x64748b}
        ]
    },
    "vaporizers-device": {
        "boundingRadius": 2.9,
        "parts": [
            {"geo": "box", "args": [2.2, 2.6, 1.6], "pos": [0, 0, 0], "color": 0x334155},
            {"geo": "box", "args": [2.0, 2.4, 0.1], "pos": [0, 0, 0.85], "color": 0xeab308, "clearcoat": 1},
            {"geo": "cylinder", "args": [0.75, 0.75, 0.45, 24], "pos": [0, 0.6, 0.95], "rot": [1.57, 0, 0], "color": 0x0f172a},
            {"geo": "cylinder", "args": [0.25, 0.25, 0.2, 16], "pos": [0, 0.6, 1.25], "rot": [1.57, 0, 0], "color": 0xef4444},
            {"geo": "box", "args": [0.4, 1.0, 0.2], "pos": [0.6, -0.6, 0.85], "color": 0x38bdf8, "opacity": 0.6, "transparent": True},
            {"geo": "box", "args": [0.7, 0.5, 0.6], "pos": [-0.5, -0.8, 0.9], "color": 0x64748b},
            {"geo": "box", "args": [1.8, 0.4, 0.6], "pos": [0, 1.4, -0.5], "color": 0x94a3b8}
        ]
    },
    "airway-devices-equipment": {
        "boundingRadius": 3.2,
        "parts": [
            {"geo": "cylinder", "args": [0.35, 0.35, 1.2, 16], "pos": [0.9, -1.2, 0], "rot": [0, 0, 0.25], "color": 0xbae6fd, "opacity": 0.65, "transparent": True},
            {"geo": "cylinder", "args": [0.35, 0.35, 1.4, 16], "pos": [0.5, 0, 0], "rot": [0, 0, -0.1], "color": 0xbae6fd, "opacity": 0.65, "transparent": True},
            {"geo": "cylinder", "args": [0.35, 0.35, 1.2, 16], "pos": [-0.2, 1.1, 0], "rot": [0, 0, -0.45], "color": 0xbae6fd, "opacity": 0.65, "transparent": True},
            {"geo": "sphere", "args": [0.75, 20, 16], "pos": [1.1, -1.4, 0], "scale": [0.9, 1.5, 0.9], "color": 0x7dd3fc, "opacity": 0.5, "transparent": True},
            {"geo": "sphere", "args": [0.15, 12, 12], "pos": [1.3, -2.0, 0], "color": 0x0284c7},
            {"geo": "cylinder", "args": [0.35, 0.2, 0.4, 16], "pos": [1.35, -2.1, 0], "rot": [0, 0, 0.4], "color": 0x38bdf8},
            {"geo": "cylinder", "args": [0.55, 0.48, 0.8, 20], "pos": [-0.7, 1.8, 0], "rot": [0, 0, -0.45], "color": 0x0284c7},
            {"geo": "cylinder", "args": [0.08, 0.08, 1.6, 12], "pos": [-0.1, 0.2, 0.5], "rot": [0.3, 0, -0.2], "color": 0x0284c7},
            {"geo": "sphere", "args": [0.3, 16, 16], "pos": [-0.4, 1.2, 0.9], "color": 0x38bdf8, "opacity": 0.7, "transparent": True}
        ]
    },
    "humidification-scavenging": {
        "boundingRadius": 2.8,
        "parts": [
            {"geo": "cylinder", "args": [1.6, 1.6, 0.7, 32], "pos": [0, 0, 0], "color": 0xe0f2fe, "opacity": 0.5, "transparent": True},
            {"geo": "cylinder", "args": [1.4, 1.4, 0.5, 24], "pos": [0, 0, 0], "color": 0xf8fafc},
            {"geo": "cylinder", "args": [0.75, 0.7, 0.9, 24], "pos": [0, 0.7, 0], "color": 0xbae6fd, "opacity": 0.65, "transparent": True},
            {"geo": "cylinder", "args": [0.6, 0.6, 0.8, 24], "pos": [0, -0.7, 0], "color": 0xbae6fd, "opacity": 0.65, "transparent": True},
            {"geo": "cylinder", "args": [0.2, 0.2, 0.6, 16], "pos": [1.65, 0, 0], "rot": [0, 0, 1.57], "color": 0x0284c7},
            {"geo": "cylinder", "args": [0.28, 0.28, 0.25, 16], "pos": [2.0, 0, 0], "rot": [0, 0, 1.57], "color": 0x0284c7}
        ]
    },
    "warming-suction-devices": {
        "boundingRadius": 3.2,
        "parts": [
            {"geo": "cylinder", "args": [1.1, 0.9, 2.6, 24], "pos": [-0.6, -0.2, 0], "color": 0x93c5fd, "opacity": 0.45, "transparent": True},
            {"geo": "cylinder", "args": [0.98, 0.88, 1.2, 20], "pos": [-0.6, -0.8, 0], "color": 0x0284c7, "opacity": 0.6, "transparent": True},
            {"geo": "cylinder", "args": [1.25, 1.25, 0.4, 24], "pos": [-0.6, 1.2, 0], "color": 0x1e293b},
            {"geo": "cylinder", "args": [0.35, 0.35, 0.4, 16], "pos": [-0.9, 1.5, 0], "color": 0xd1d5db, "metalness": 0.8},
            {"geo": "cylinder", "args": [0.22, 0.22, 0.5, 12], "pos": [-0.3, 1.5, 0], "color": 0x0284c7},
            {"geo": "cylinder", "args": [0.12, 0.12, 1.4, 12], "pos": [0.3, 1.3, 0], "rot": [0, 0, -1.0], "color": 0x38bdf8, "opacity": 0.7, "transparent": True},
            {"geo": "cylinder", "args": [0.22, 0.22, 1.8, 16], "pos": [1.2, 0.2, 0], "rot": [0, 0, 0.2], "color": 0x38bdf8, "opacity": 0.8, "transparent": True},
            {"geo": "sphere", "args": [0.28, 16, 16], "pos": [1.5, -0.9, 0], "color": 0x38bdf8, "opacity": 0.9, "transparent": True}
        ]
    }
}

def generate_rdkit_structures():
    """Generates 2D SVGs and 3D conformers for Dantrolene and Ondansetron."""
    results_2d = {}
    results_3d = {}

    for tid, info in MOLECULES.items():
        m = Chem.MolFromSmiles(info["smiles"])
        # 2D SVG
        d2d = rdMolDraw2D.MolDraw2DSVG(300, 220)
        d2d.drawOptions().clearBackground = False
        d2d.DrawMolecule(m)
        d2d.FinishDrawing()
        svg_text = d2d.GetDrawingText()
        results_2d[tid] = {
            "formula": info["formula"],
            "svg": svg_text
        }

        # 3D coordinates
        m3d = Chem.AddHs(m)
        AllChem.EmbedMolecule(m3d, AllChem.ETKDGv3())
        try:
            AllChem.MMFFOptimizeMolecule(m3d, maxIters=500)
        except Exception:
            AllChem.UFFOptimizeMolecule(m3d, maxIters=500)
        conf = m3d.GetConformer()
        atoms = []
        for i, atom in enumerate(m3d.GetAtoms()):
            pos = conf.GetAtomPosition(i)
            atoms.append([atom.GetSymbol(), round(pos.x, 3), round(pos.y, 3), round(pos.z, 3)])
        bonds = []
        for bond in m3d.GetBonds():
            bonds.append([bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()])

        # Center atoms
        cx = sum(a[1] for a in atoms) / len(atoms)
        cy = sum(a[2] for a in atoms) / len(atoms)
        cz = sum(a[3] for a in atoms) / len(atoms)
        for a in atoms:
            a[1] = round(a[1] - cx, 3)
            a[2] = round(a[2] - cy, 3)
            a[3] = round(a[3] - cz, 3)

        results_3d[tid] = {
            "atoms": atoms,
            "bonds": bonds
        }

    return results_2d, results_3d

def main():
    print("Generating RDKit structures for pharmacological topics...")
    rdk_2d, rdk_3d = generate_rdkit_structures()

    # Combine 2D
    all_2d = {}
    all_2d.update(rdk_2d)
    for tid, info in SVG_GRAPHICS.items():
        all_2d[tid] = info

    # Combine 3D
    all_3d = {}
    all_3d.update(rdk_3d)
    for tid, info in MODELS_3D.items():
        all_3d[tid] = info

    print(f"Total topics with 2D SVGs: {len(all_2d)}")
    print(f"Total topics with 3D Models: {len(all_3d)}")

    # Update study-structures.js
    struct_path = "study-structures.js"
    with open(struct_path, "r", encoding="utf-8") as f:
        struct_js = f.read()

    for tid, rec in all_2d.items():
        if f'"{tid}":' in struct_js or f"  {tid}:" in struct_js or f"'{tid}':" in struct_js:
            continue
        entry = f'  "{tid}": {{\n    formula: {json.dumps(rec["formula"])},\n    svg: {json.dumps(rec["svg"])}\n  }},\n'
        struct_js = struct_js.replace("window.KN_STRUCTURES = {\n", f"window.KN_STRUCTURES = {{\n{entry}")

    with open(struct_path, "w", encoding="utf-8") as f:
        f.write(struct_js)
    print("Updated study-structures.js successfully!")

    # Update study-structures-3d.js
    struct3d_path = "study-structures-3d.js"
    with open(struct3d_path, "r", encoding="utf-8") as f:
        struct3d_js = f.read()

    for tid, rec in all_3d.items():
        if f'"{tid}":' in struct3d_js or f"  {tid}:" in struct3d_js or f"'{tid}':" in struct3d_js:
            continue
        entry = f'  "{tid}": {json.dumps(rec)},\n'
        struct3d_js = struct3d_js.replace("window.KN_STRUCTURES_3D = {\n", f"window.KN_STRUCTURES_3D = {{\n{entry}")

    with open(struct3d_path, "w", encoding="utf-8") as f:
        f.write(struct3d_js)
    print("Updated study-structures-3d.js successfully!")

if __name__ == "__main__":
    main()
