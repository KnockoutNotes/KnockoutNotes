/* ==========================================================================
   KNOCKOUTNOTES — Anaesthesia Workstation contextual schematics
   (ventilator-schematics.js)

   Original, hand-drawn educational SVG diagrams (not a reproduction of any
   copyrighted reference image) illustrating generic, textbook-level gas-
   supply concepts. These are deliberately simplified and schematic — they
   do not claim to represent the exact internal geometry of any real
   workstation, and are shown separately from the 3D model with their own
   "simplified educational schematic" framing (see the footnote rendered by
   the modal in ventilator-ui.js).
   ========================================================================== */

const DEFS = `
  <defs>
    <marker id="vsArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#38bdf8"></path>
    </marker>
  </defs>
`;

export const SCHEMATICS = {
  "cylinder-connection": {
    title: "Cylinder Connection — Educational Schematic",
    svg: `
<svg viewBox="0 0 560 400" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono', monospace">
  ${DEFS}
  <!-- Cylinder body -->
  <rect x="60" y="130" width="140" height="220" rx="14" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
  <rect x="60" y="130" width="140" height="220" rx="14" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="2 6"/>
  <text x="130" y="250" fill="#e2e8f0" font-size="15" text-anchor="middle">Cylinder</text>

  <!-- Cylinder valve block on top -->
  <rect x="95" y="95" width="70" height="40" rx="6" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Pin-index pins -->
  <circle cx="112" cy="95" r="4" fill="#38bdf8"/>
  <circle cx="148" cy="95" r="4" fill="#38bdf8"/>

  <!-- Gasket ring -->
  <rect x="165" y="105" width="10" height="20" fill="#fbbf24"/>

  <!-- Yoke bracket wrapping the valve -->
  <path d="M175,80 L175,150 L235,150 L235,80" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
  <text x="290" y="70" fill="#38bdf8" font-size="14" text-anchor="middle">Yoke</text>
  <line x1="270" y1="75" x2="230" y2="90" stroke="#38bdf8" stroke-width="1.5"/>

  <!-- Yoke check valve (inside yoke housing, downstream of pin index) -->
  <circle cx="205" cy="115" r="9" fill="#0b1120" stroke="#f43f5e" stroke-width="2"/>
  <text x="205" y="45" fill="#f43f5e" font-size="13" text-anchor="middle">Yoke check valve</text>
  <line x1="205" y1="52" x2="205" y2="105" stroke="#f43f5e" stroke-width="1.5"/>

  <!-- Gas outlet toward machine -->
  <line x1="235" y1="115" x2="420" y2="115" stroke="#e2e8f0" stroke-width="4" marker-end="url(#vsArrow)"/>
  <text x="420" y="100" fill="#e2e8f0" font-size="14" text-anchor="end">To machine</text>

  <!-- T-handle -->
  <rect x="10" y="60" width="16" height="55" rx="6" fill="#d97706" transform="rotate(-30 18 87)"/>
  <text x="45" y="55" fill="#d97706" font-size="13" text-anchor="middle">T-handle</text>
  <line x1="45" y1="60" x2="35" y2="78" stroke="#d97706" stroke-width="1.5"/>

  <!-- Pin-index label -->
  <text x="130" y="30" fill="#94a3b8" font-size="13" text-anchor="middle">Pin-index configuration</text>
  <line x1="130" y1="34" x2="130" y2="90" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 4"/>

  <!-- Gasket label -->
  <text x="170" y="180" fill="#fbbf24" font-size="13" text-anchor="middle">Gasket</text>
  <line x1="170" y1="170" x2="170" y2="128" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 4"/>
</svg>`
  },

  "yoke-check-valve": {
    title: "Cylinder-Yoke Check Valve — Educational Schematic",
    svg: `
<svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono', monospace">
  ${DEFS}
  <!-- Outer housing -->
  <rect x="140" y="90" width="340" height="110" rx="18" fill="#1e293b" stroke="#64748b" stroke-width="2"/>

  <!-- Cylinder stem entering from the right -->
  <rect x="440" y="120" width="110" height="50" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="480" cy="145" r="12" fill="#38bdf8"/>
  <text x="495" y="230" fill="#e2e8f0" font-size="13" text-anchor="middle">Cylinder stem</text>
  <line x1="495" y1="220" x2="490" y2="172" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="3 4"/>

  <text x="480" y="110" fill="#38bdf8" font-size="12" text-anchor="middle">Pin-index</text>
  <line x1="480" y1="115" x2="480" y2="133" stroke="#38bdf8" stroke-width="1.5"/>

  <!-- Valve seat -->
  <path d="M330,100 L330,190" stroke="#cbd5e1" stroke-width="6"/>
  <text x="330" y="240" fill="#cbd5e1" font-size="13" text-anchor="middle">Valve seat</text>
  <line x1="330" y1="230" x2="330" y2="195" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3 4"/>

  <!-- Floating / check valve disc -->
  <rect x="300" y="120" width="26" height="50" rx="6" fill="#f43f5e" stroke="#fecdd3" stroke-width="2"/>
  <text x="313" y="90" fill="#f43f5e" font-size="13" text-anchor="middle">Floating check valve</text>
  <line x1="313" y1="94" x2="313" y2="117" stroke="#f43f5e" stroke-width="1.5"/>

  <!-- Retainer -->
  <path d="M270,110 L270,180" stroke="#fbbf24" stroke-width="4" stroke-dasharray="6 4"/>
  <text x="250" y="105" fill="#fbbf24" font-size="13" text-anchor="middle">Check-valve retainer</text>
  <line x1="255" y1="108" x2="270" y2="115" stroke="#fbbf24" stroke-width="1.5"/>

  <!-- Strainer nipple -->
  <rect x="360" y="135" width="24" height="20" fill="#64748b"/>
  <text x="372" y="240" fill="#94a3b8" font-size="12" text-anchor="middle">Strainer nipple</text>
  <line x1="372" y1="230" x2="372" y2="158" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 4"/>

  <!-- Flow arrow toward machine -->
  <line x1="230" y1="145" x2="90" y2="145" stroke="#e2e8f0" stroke-width="4" marker-end="url(#vsArrow)"/>
  <text x="90" y="125" fill="#e2e8f0" font-size="14" text-anchor="middle">To anaesthesia machine</text>

  <text x="330" y="280" fill="#64748b" font-size="12" text-anchor="middle">Educational cross-section — proportions simplified, not to scale.</text>
</svg>`
  },

  "gas-system": {
    title: "Anaesthesia Gas-Supply Pathway — Educational Schematic",
    svg: `
<svg viewBox="0 0 980 560" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono', monospace">
  ${DEFS}
  <!-- Zone bands -->
  <rect data-zone="high" x="20" y="60" width="260" height="440" rx="14" fill="#d97706" opacity="0.12" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="150" y="45" fill="#d97706" font-size="16" text-anchor="middle" font-weight="700">HIGH-PRESSURE SYSTEM</text>

  <rect data-zone="intermediate" x="300" y="60" width="260" height="440" rx="14" fill="#38bdf8" opacity="0.10" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="430" y="45" fill="#38bdf8" font-size="16" text-anchor="middle" font-weight="700">INTERMEDIATE-PRESSURE SYSTEM</text>

  <rect data-zone="low" x="580" y="60" width="300" height="440" rx="14" fill="#34d399" opacity="0.10" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="730" y="45" fill="#34d399" font-size="16" text-anchor="middle" font-weight="700">LOW-PRESSURE SYSTEM</text>

  <!-- High pressure: cylinder + pipeline -->
  <rect x="55" y="100" width="150" height="55" rx="8" fill="#1e293b" stroke="#d97706" stroke-width="2"/>
  <text x="130" y="132" fill="#e2e8f0" font-size="14" text-anchor="middle">Gas cylinder(s)</text>

  <rect x="55" y="330" width="150" height="55" rx="8" fill="#1e293b" stroke="#d97706" stroke-width="2"/>
  <text x="130" y="362" fill="#e2e8f0" font-size="14" text-anchor="middle">Pipeline inlet</text>

  <text x="130" y="200" fill="#fbbf24" font-size="12" text-anchor="middle">Cylinder valve + pin-index (PISS)</text>
  <text x="130" y="270" fill="#fbbf24" font-size="12" text-anchor="middle">Cylinder-yoke check valve</text>

  <!-- High pressure gauge -->
  <circle cx="230" cy="127" r="16" fill="none" stroke="#fbbf24" stroke-width="2"/>
  <text x="230" y="90" fill="#fbbf24" font-size="11" text-anchor="middle">Cylinder gauge</text>

  <!-- Regulator -->
  <rect x="330" y="210" width="150" height="60" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="405" y="235" fill="#e2e8f0" font-size="13" text-anchor="middle">Pressure regulator</text>
  <text x="405" y="252" fill="#94a3b8" font-size="11" text-anchor="middle">(primary / secondary)</text>

  <!-- Pipeline gauge -->
  <circle cx="230" cy="357" r="16" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <text x="230" y="400" fill="#38bdf8" font-size="11" text-anchor="middle">Pipeline gauge</text>

  <!-- O2 flush branch -->
  <rect x="330" y="330" width="150" height="55" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="405" y="355" fill="#e2e8f0" font-size="13" text-anchor="middle">O2 flush valve</text>
  <text x="405" y="371" fill="#94a3b8" font-size="10" text-anchor="middle">bypasses flow control</text>

  <!-- Low pressure: flow control -->
  <rect x="605" y="100" width="140" height="55" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="675" y="132" fill="#e2e8f0" font-size="13" text-anchor="middle">Flow-control valves</text>

  <rect x="605" y="180" width="140" height="55" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="675" y="212" fill="#e2e8f0" font-size="13" text-anchor="middle">Flowmeters</text>

  <rect x="605" y="260" width="140" height="55" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="675" y="292" fill="#e2e8f0" font-size="13" text-anchor="middle">Vaporizer</text>
  <text x="675" y="307" fill="#94a3b8" font-size="10" text-anchor="middle">interlocked</text>

  <rect x="605" y="340" width="140" height="55" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="675" y="365" fill="#e2e8f0" font-size="13" text-anchor="middle">Common gas outlet</text>
  <text x="675" y="381" fill="#94a3b8" font-size="10" text-anchor="middle">± outlet check valve</text>

  <!-- Breathing system, explicitly outside all pressure zones -->
  <rect x="800" y="240" width="140" height="90" rx="10" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/>
  <text x="870" y="278" fill="#cbd5e1" font-size="13" text-anchor="middle">Breathing</text>
  <text x="870" y="295" fill="#cbd5e1" font-size="13" text-anchor="middle">system</text>
  <text x="870" y="345" fill="#64748b" font-size="10" text-anchor="middle">separate system —</text>
  <text x="870" y="358" fill="#64748b" font-size="10" text-anchor="middle">not low-pressure supply</text>

  <!-- Arrows -->
  <line x1="205" y1="127" x2="325" y2="220" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="205" y1="357" x2="325" y2="240" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="405" y1="270" x2="405" y2="325" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="480" y1="240" x2="600" y2="127" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="675" y1="155" x2="675" y2="175" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="675" y1="235" x2="675" y2="255" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="675" y1="315" x2="675" y2="335" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="480" y1="357" x2="600" y2="367" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
  <line x1="745" y1="367" x2="795" y2="300" stroke="#e2e8f0" stroke-width="3" marker-end="url(#vsArrow)"/>
</svg>`
  }
};

export function schematicMarkup(id) {
  const s = SCHEMATICS[id];
  if (!s) return null;
  return s;
}
