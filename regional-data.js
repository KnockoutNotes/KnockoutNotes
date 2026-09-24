/* ==========================================================================
   KNOCKOUTNOTES — Regional Anaesthesia content (regional-data.js)

   One source of truth for every block: tile, overview cards, tabs, the
   ultrasound schematic + exam line diagram (same `sono` scene rendered two
   ways by regional-sono.js) and the 3D spread map (`three`, painted by
   regional-3d.js).

   Content is summarised and reworded from NYSORA (primary source) and
   crosschecked Sept 2026 — never copied verbatim. Images are generated in
   code (simulated B-mode frames, line diagrams), not NYSORA artwork.

   Sono scene coordinates: 400 x 300 viewBox, y = depth (0 = skin).
     t  type: muscle | nerve | artery | vein | bone | pleura | fascia |
              ligament | sheath | tendon | organ | space | marker | bowel
     e  nerve echotexture: "hypo" (roots) | "honey" (peripheral)
     c [cx,cy,r] circle · el [cx,cy,rx,ry,rot] ellipse · p [[x,y]..] polygon
     ln [[x,y]..] polyline · cs [[cx,cy,r]..] circle cluster
     lab [x,y] label anchor (optional)
   3D region keys (see regional-3d.js for the coordinate conventions):
     k  exp | var | tgt | eff | nerve | none
     seg trunk | shoulder | upperArm | forearm | hand | digit | thigh | leg |
         foot | neck | head | ear   (or an array)
     side R | L | both · t [a,b] along segment · th [a,b] degrees around it
     derm ["T2","T4"] (trunk) · u [a,b] across hand/foot · d [digits]
   ========================================================================== */
(function () {
  "use strict";

  const categories = [
    { id: "upper", label: "Upper Limb", icon: "💪" },
    { id: "lower", label: "Lower Limb", icon: "🦵" },
    { id: "chest", label: "Chest Wall & Paraspinal", icon: "🫁" },
    { id: "abdo", label: "Abdominal Wall", icon: "🩻" },
    { id: "headneck", label: "Head & Neck", icon: "🧠" },
    { id: "neuraxial", label: "Neuraxial", icon: "🦴" }
  ];

  const blocks = [];

  /* ======================================================================
     UPPER LIMB
     ====================================================================== */

  blocks.push({
    id: "interscalene",
    name: "Interscalene Brachial Plexus Block",
    short: "Interscalene",
    cat: "upper",
    tags: ["Brachial plexus", "Roots / trunks", "Phrenic risk"],
    tagline: "Shoulder & proximal humerus • C5–C7",
    summary: "Local anaesthetic is placed around the superior and middle trunks (C5–C7 roots) between the anterior and middle scalene muscles. It gives reliable anaesthesia of the shoulder and upper arm; the inferior trunk (C8–T1) is usually spared.",
    indications: ["Shoulder surgery — arthroscopy, rotator cuff repair, arthroplasty", "Proximal humerus and lateral clavicle surgery", "Shoulder analgesia (single shot or catheter)"],
    keyInfo: {
      position: ["Supine or semi-sitting, head turned 30–45° away", "Shoulder depressed; lateral decubitus (block side up) also works"],
      approach: ["Linear high-frequency probe, transverse at the cricoid (C6)", "In-plane, lateral → medial"],
      procedure: ["Trace the plexus up from the supraclavicular fossa", "C5, C6 (± C7) roots stacked between ASM and MSM", "Tip between C5 and C6 on their lateral side; inject in aliquots"],
      volume: "10–20 mL for surgery; 5–10 mL is enough for analgesia",
      coverage: "Shoulder, lateral clavicle, proximal humerus, skin over acromion"
    },
    anatomy: {
      text: "At the level of C6 the C5–C7 roots/superior and middle trunks emerge in the interscalene groove between the anterior (ASM) and middle scalene (MSM), deep to the sternocleidomastoid. The phrenic nerve (C3–C5) lies on the anterior surface of the ASM only millimetres away, which is why diaphragmatic paresis is almost universal with conventional volumes. The inferior trunk (C8–T1) is deeper and more caudal, explaining ulnar-territory sparing. Superficial spread reaches the supraclavicular nerves (C3–C4) that supply skin over the acromion and clavicle.",
      relations: ["Medial: ASM, then carotid artery and internal jugular vein under the SCM", "Lateral: MSM — dorsal scapular and long thoracic nerves run through it", "Superficial: SCM, prevertebral fascia, phrenic nerve on ASM", "Deep: C6/C7 transverse processes; vertebral artery entering foramen transversarium at C6"],
      targets: "Superior (C5–C6) and middle (C7) trunks; supraclavicular nerves by superficial spread",
      plexus: { type: "brachial", hi: ["C5", "C6", "C7", "UT", "MT", "SSN"], zone: "Roots / trunks" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "2–3 cm (roots ~1–1.5 cm deep)",
      orientation: "Transverse at C6 (cricoid) · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 3, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "scm", t: "muscle", l: "Sternocleidomastoid", d: "Superficial landmark; covers vessels and medial part of ASM.", p: [[0, 16], [240, 12], [262, 30], [215, 60], [40, 66], [0, 52]], lab: [120, 34] },
          { id: "ijv", t: "vein", l: "Internal jugular vein", d: "Compressible, lateral to carotid, deep to SCM.", el: [70, 96, 30, 15, 0], lab: [70, 118] },
          { id: "cca", t: "artery", l: "Carotid artery", d: "Pulsatile, medial — keep the needle well away.", c: [22, 132, 20], lab: [34, 160] },
          { id: "phr", t: "nerve", e: "hypo", l: "Phrenic nerve", d: "On the anterior surface of ASM — explains ~100% hemidiaphragm paresis.", c: [124, 106, 5], lab: [150, 86] },
          { id: "asm", t: "muscle", l: "Anterior scalene", d: "Medial border of the interscalene groove.", el: [128, 158, 50, 40, 0], lab: [120, 170] },
          { id: "msm", t: "muscle", l: "Middle scalene", d: "Lateral border; needle passes through or just anterior to it.", el: [306, 168, 78, 58, 0], lab: [318, 190] },
          { id: "c5", t: "nerve", e: "hypo", l: "C5", d: "Most superficial root; target lateral to C5–C6.", c: [206, 108, 11], lab: [206, 84], key: true },
          { id: "c6", t: "nerve", e: "hypo", l: "C6", d: "Middle of the 'stop-light'.", c: [211, 140, 12], lab: [178, 140], key: true },
          { id: "c7", t: "nerve", e: "hypo", l: "C7", d: "Deepest root seen; C8–T1 usually out of reach.", c: [213, 176, 12], lab: [180, 200], key: true },
          { id: "pvf", t: "fascia", l: "Prevertebral fascia", d: "Covers the scalenes and plexus.", ln: [[60, 74], [160, 84], [250, 78], [400, 70]], lab: [330, 58] }
        ],
        needles: [{ from: [398, 64], to: [224, 124] }],
        spreads: [{ el: [210, 142, 28, 56, 0] }]
      },
      // Real ultrasound (KnockoutNotes-user-provided, cropped from the
      // contributor's own captures). Label/needle/spread positions are a
      // best-effort placement from visual inspection plus standard
      // sonoanatomy — verify/adjust against the source image if needed.
      real: {
        image: "assets/regional/interscalene-usg.jpg",
        source: "KnockoutNotes / user-provided",
        orientation: "Transverse at C6 (anteromedial → posterolateral)",
        probe: "Linear",
        labels: [
          { id: "c5r", text: "C5 root", type: "nerve", x: 44, y: 33 },
          { id: "c6r", text: "C6 root", type: "nerve", x: 45, y: 45 },
          { id: "asmr", text: "Anterior scalene", type: "muscle", x: 32, y: 47 }
        ],
        needleOverlay: { from: [88, 22], to: [46, 40], approach: "in-plane", side: "posterolateral", target: "between C5 and C6 roots" },
        spreadOverlay: [{ shape: "ellipse", x: 45, y: 42, rx: 9, ry: 13, variable: false, note: "LA spread around the roots" }]
      }
    },
    procedure: {
      position: "Supine/semi-sitting, head turned away, arm by side with shoulder depressed",
      probe: "Linear 10–15 MHz, transverse at the cricoid",
      needle: "22G 50 mm short-bevel (insulated if nerve stimulation used)",
      approach: "In-plane, lateral → medial through/just anterior to the MSM",
      steps: [
        "Scan the supraclavicular fossa (plexus lateral to subclavian artery), then slide cranially following the plexus into the interscalene groove.",
        "Identify C5, C6 and C7 as round hypoechoic structures stacked between ASM and MSM ('stop-light').",
        "Colour Doppler to exclude vessels (transverse cervical/dorsal scapular) in the needle path.",
        "Advance in-plane from lateral; place the tip lateral to the roots, between C5 and C6.",
        "Inject 3–5 mL aliquots with low pressure, confirming spread around the roots; reposition rather than inject into a root."
      ],
      volume: "10–20 mL long-acting LA (e.g., ropivacaine 0.5%); 5–10 mL for analgesia",
      endpoint: "Hypoechoic spread surrounding C5–C6 within the groove. With stimulation: deltoid/biceps twitch."
    },
    spread: {
      summary: "Shoulder joint, lateral two-thirds of the clavicle, proximal humerus and skin over the acromion/clavicle. Ulnar territory (C8–T1) is usually spared.",
      covered: ["Shoulder joint and capsule", "Proximal humerus and lateral clavicle", "Skin over acromion and clavicle (supraclavicular nerves, C3–C4)", "Lateral upper arm (C5–C6)"],
      spared: ["C8–T1: medial forearm, ulnar hand", "Medial upper arm (T2 intercostobrachial)", "Posterior portal skin may need local infiltration"],
      motor: "Deltoid and biceps weakness; ipsilateral hemidiaphragmatic paresis in nearly all patients with conventional volumes.",
      three: {
        focus: "upperR", view: "anterior",
        needle: { a: "isb", from: "lateral" },
        regions: [
          { k: "exp", seg: "shoulder", side: "R" },
          { k: "exp", seg: "trunk", side: "R", derm: ["C3", "C4"], th: [0, 125] },
          { k: "exp", seg: "upperArm", side: "R", th: [300, 195] },
          { k: "var", seg: "forearm", side: "R", th: [20, 140] },
          { k: "var", seg: "hand", side: "R", u: [0, 0.35] },
          { k: "var", seg: "digit", side: "R", d: [1] }
        ],
        deep: [{ k: "eff", at: "diaphragmR" }],
        labels: [
          { x: "Shoulder & lateral arm (C5–C6)", k: "exp", a: { seg: "upperArm", side: "R", t: 0.3, th: 90 } },
          { x: "Supraclavicular nn — acromion / clavicle skin", k: "exp", a: { seg: "trunk", side: "R", y: 1.43, th: 35 } },
          { x: "Variable: lateral forearm / thumb (C6)", k: "var", a: { seg: "forearm", side: "R", t: 0.55, th: 75 } },
          { x: "Spared: C8–T1 (medial forearm, ulnar hand)", k: "spared", a: { seg: "forearm", side: "R", t: 0.6, th: 270 } },
          { x: "Phrenic block → hemidiaphragm", k: "eff", a: "diaphragmR" },
          { x: "Needle: interscalene groove (C6)", k: "needle", a: "isb" }
        ]
      }
    },
    tips: [
      "If roots are hard to see, start at the supraclavicular fossa and trace the plexus cranially.",
      "Use colour Doppler — small arteries often cross the needle path.",
      "Lower volumes (5–10 mL) reduce, but do not abolish, phrenic blockade.",
      "High injection pressure or paraesthesia → stop and withdraw slightly."
    ],
    pitfalls: [
      "Mistaking the C6 transverse process tubercles (bright, with shadow) for roots.",
      "Needle drifting medial/anterior toward phrenic nerve, carotid or vertebral artery.",
      "Expecting hand/ulnar anaesthesia — the inferior trunk is usually missed."
    ],
    complications: [
      "Hemidiaphragmatic paresis — caution in severe respiratory disease or contralateral phrenic palsy",
      "Horner syndrome, hoarseness (recurrent laryngeal nerve)",
      "Intravascular injection (vertebral artery → seizures with very small doses), LAST",
      "Epidural/intrathecal spread (rare), nerve injury"
    ],
    pearls: [
      "Target = superior & middle trunks (C5–C7); inferior trunk (C8–T1) spared → ulnar sparing.",
      "Phrenic nerve lies on the anterior surface of ASM → ipsilateral hemidiaphragm paresis ~100% with classic volumes.",
      "'Stop-light' sign: C5, C6, C7 stacked as hypoechoic circles.",
      "Relative contraindication: contralateral phrenic palsy or severe COPD.",
      "Diaphragm-sparing alternatives: superior trunk block or suprascapular + axillary nerve blocks."
    ],
    source: { title: "Ultrasound-Guided Interscalene Brachial Plexus Block", url: "https://www.nysora.com/techniques/upper-extremity/intescalene/ultrasound-guided-interscalene-brachial-plexus-block/" }
  });

  blocks.push({
    id: "supraclavicular",
    name: "Supraclavicular Brachial Plexus Block",
    short: "Supraclavicular",
    cat: "upper",
    tags: ["Brachial plexus", "Trunks / divisions", "'Spinal of the arm'"],
    tagline: "Whole arm below the shoulder • trunks/divisions",
    summary: "Here the trunks and divisions are compact, lying posterolateral to the subclavian artery above the first rib. A single site gives rapid, dense anaesthesia of the arm, elbow, forearm and hand.",
    indications: ["Arm, elbow, forearm and hand surgery", "Shoulder surgery is possible with adequate volume", "Upper limb analgesia/sympathectomy (e.g., vascular access surgery)"],
    keyInfo: {
      position: ["Supine or semi-sitting, head turned away", "Arm by side, shoulder depressed"],
      approach: ["Linear probe in supraclavicular fossa, parallel to clavicle", "In-plane, lateral → medial"],
      procedure: ["Find subclavian artery on the first rib", "Plexus = 'cluster of grapes' posterolateral to artery", "First injection deep, just above rib lateral to artery; then superficial divisions"],
      volume: "20–25 mL",
      coverage: "Arm, elbow, forearm and hand (± shoulder)"
    },
    anatomy: {
      text: "As the plexus crosses the first rib, the trunks divide into anterior and posterior divisions and sit tightly packed posterolateral (superficial and lateral) to the subclavian artery. The first rib provides a bony backstop. The pleura can be injured at the pleural dome (medial) and at the first intercostal space; there is no pleural dome lateral to the anterior scalene. Dorsal scapular and transverse cervical arteries often course through or near the plexus.",
      relations: ["Medial: subclavian artery (main landmark) and anterior scalene", "Deep: first rib and pleura (dome medially, first intercostal space)", "Lateral/superficial: middle scalene, omohyoid, platysma", "Vessels crossing the plexus: dorsal scapular and transverse cervical arteries"],
      targets: "All three trunks and their divisions",
      plexus: { type: "brachial", hi: ["UT", "MT", "LT", "DIV"], zone: "Trunks / divisions" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "3–4 cm",
      orientation: "Coronal oblique above mid-clavicle · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 4, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "platysma", t: "fascia", l: "Platysma / superficial fascia", d: "Thin superficial layer.", ln: [[0, 32], [400, 28]], lab: [60, 22] },
          { id: "asm", t: "muscle", l: "Anterior scalene", d: "Medial; inserts on the first rib.", el: [58, 122, 50, 32, 0], lab: [56, 110] },
          { id: "msm", t: "muscle", l: "Middle scalene", d: "Lateral to the plexus.", el: [334, 112, 64, 42, 0], lab: [340, 100] },
          { id: "sca", t: "artery", l: "Subclavian artery", d: "Primary landmark lying on the first rib.", c: [150, 168, 24], lab: [120, 212], key: true },
          { id: "bp", t: "nerve", e: "hypo", l: "Brachial plexus (trunks/divisions)", d: "'Cluster of grapes' posterolateral to the artery.", cs: [[220, 124, 9], [240, 114, 8], [258, 130, 9], [230, 142, 9], [250, 150, 8], [270, 144, 7], [210, 160, 7]], lab: [300, 70], key: true },
          { id: "dsa", t: "artery", l: "Dorsal scapular artery", d: "Often crosses the plexus — check with Doppler.", c: [276, 166, 5], lab: [320, 176] },
          { id: "rib", t: "bone", l: "First rib", d: "Bony backstop with acoustic shadow.", ln: [[108, 200], [160, 196], [230, 192], [300, 196]], lab: [260, 218] },
          { id: "pleura1", t: "pleura", l: "Pleura", d: "Medial (dome) and lateral to the rib — keep the needle tip in view.", ln: [[0, 222], [60, 214], [108, 206]], lab: [36, 246] },
          { id: "pleura2", t: "pleura", l: "Pleura (1st intercostal space)", d: "Second pleural risk point.", ln: [[300, 202], [350, 208], [400, 218]], lab: [352, 240] }
        ],
        needles: [{ from: [398, 56], to: [206, 176] }],
        spreads: [{ el: [236, 142, 46, 38, 0] }]
      },
      real: {
        image: "assets/regional/supraclavicular-usg.jpg",
        source: "KnockoutNotes / user-provided",
        orientation: "Coronal oblique above the clavicle (medial → lateral)",
        probe: "Linear",
        labels: [
          { id: "scar", text: "Subclavian artery", type: "artery", x: 17, y: 40 },
          { id: "bpr", text: "Brachial plexus (trunks)", type: "nerve", x: 38, y: 30 },
          { id: "ribr", text: "First rib", type: "bone", x: 78, y: 45 }
        ],
        needleOverlay: { from: [92, 20], to: [38, 30], approach: "in-plane", side: "lateral", target: "posterolateral to the subclavian artery, above the first rib" },
        spreadOverlay: [{ shape: "ellipse", x: 33, y: 30, rx: 10, ry: 9, variable: false, note: "LA spread around the plexus" }]
      }
    },
    procedure: {
      position: "Supine, head turned away, arm adducted with shoulder depressed",
      probe: "Linear 10–15 MHz in the supraclavicular fossa, parallel to the clavicle",
      needle: "22G 50 mm short-bevel",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify the pulsatile subclavian artery lying on the hyperechoic first rib; pleura glides medial and lateral to the rib.",
        "Recognise the plexus as a hypoechoic 'cluster of grapes' posterolateral to the artery.",
        "Colour Doppler to exclude dorsal scapular/transverse cervical arteries in the path.",
        "Keeping the whole needle in view, place the first deposit deep — just above the rib, lateral to the artery — to cover the inferior trunk.",
        "Redirect to the superficial divisions; inject in 3–5 mL aliquots."
      ],
      volume: "20–25 mL long-acting LA",
      endpoint: "Spread surrounding the plexus from the rib to its superficial border."
    },
    spread: {
      summary: "Dense anaesthesia of the whole upper limb below the shoulder; shoulder often included with adequate volume.",
      covered: ["Arm, elbow, forearm and hand (all terminal branches)", "Shoulder (variable, volume-dependent)"],
      spared: ["Medial upper arm (intercostobrachial, T2) — infiltrate for tourniquet", "Ulnar territory occasionally, if the deep inferior trunk is missed"],
      motor: "Dense motor block of the limb. Hemidiaphragmatic paresis can occur (less than interscalene, volume-dependent).",
      three: {
        focus: "upperR", view: "anterior",
        needle: { a: "scb", from: "lateral" },
        regions: [
          { k: "exp", seg: ["upperArm", "forearm", "hand", "digit"], side: "R" },
          { k: "none", seg: "upperArm", side: "R", t: [0, 0.45], th: [215, 325] },
          { k: "var", seg: "shoulder", side: "R" }
        ],
        deep: [{ k: "eff", at: "diaphragmR", faint: true }],
        labels: [
          { x: "Whole arm below shoulder", k: "exp", a: { seg: "forearm", side: "R", t: 0.3, th: 20 } },
          { x: "Variable: shoulder", k: "var", a: { seg: "shoulder", side: "R", t: 0.3, th: 60 } },
          { x: "Spared: medial arm (ICBN, T2)", k: "spared", a: { seg: "upperArm", side: "R", t: 0.25, th: 270 } },
          { x: "Possible phrenic block", k: "eff", a: "diaphragmR" },
          { x: "Needle: supraclavicular fossa", k: "needle", a: "scb" }
        ]
      }
    },
    tips: [
      "Keep the entire shaft and tip visible — the pleura is close.",
      "Deposit first at the deep position just above the rib lateral to the artery (often called the 'corner pocket') for ulnar coverage.",
      "Doppler every time: the dorsal scapular artery frequently runs through the plexus.",
      "A shallow in-plane angle keeps the needle parallel to the pleura."
    ],
    pitfalls: [
      "Angling the needle medially and steeply toward the pleural dome.",
      "Confusing the bright first rib with pleura — pleura slides and has comet tails; rib casts a shadow.",
      "Superficial-only injection → slow onset, ulnar sparing."
    ],
    complications: ["Pneumothorax (uncommon with US but possible; may present late)", "Phrenic nerve block, Horner syndrome", "Vascular puncture, LAST", "Nerve injury"],
    pearls: [
      "'Spinal of the arm' — compact trunks/divisions give fast, dense block.",
      "Landmark: subclavian artery on the first rib; plexus posterolateral = 'cluster of grapes'.",
      "Pleural risk points: pleural dome (medial) and first intercostal space.",
      "Avoid bilateral blocks (bilateral phrenic block / pneumothorax risk).",
      "Intercostobrachial (T2) not covered → medial arm tourniquet pain."
    ],
    source: { title: "Ultrasound-Guided Supraclavicular Brachial Plexus Block", url: "https://www.nysora.com/topics/regional-anesthesia-for-specific-surgical-procedures/upper-extremity-regional-anesthesia-for-specific-surgical-procedures/anesthesia-and-analgesia-for-elbow-and-forearm-procedures/ultrasound-guided-supraclavicular-brachial-plexus-block/" }
  });

  blocks.push({
    id: "infraclavicular",
    name: "Infraclavicular Brachial Plexus Block",
    short: "Infraclavicular",
    cat: "upper",
    tags: ["Brachial plexus", "Cords", "Catheter-friendly"],
    tagline: "Arm below the shoulder • cords",
    summary: "The three cords surround the second part of the axillary artery deep to pectoralis major and minor. One injection posterior to the artery (≈6 o'clock) that spreads in a U-shape around it blocks all three cords.",
    indications: ["Elbow, forearm and hand surgery", "Continuous catheter (stable site, away from joints)", "When the arm cannot be abducted for an axillary block"],
    keyInfo: {
      position: ["Supine; arm abducted 90° with elbow flexed (or by the side)", "Head neutral"],
      approach: ["Linear probe parasagittal, just medial to the coracoid", "In-plane, cephalad → caudad"],
      procedure: ["Identify PMaj, PMin, axillary artery and vein", "Cords: lateral ~9, posterior ~7, medial ~5 o'clock", "Tip posterior to the artery (6 o'clock); U-shaped spread"],
      volume: "20–25 mL (≈16 mL can be enough)",
      coverage: "Arm (below shoulder), elbow, forearm and hand"
    },
    anatomy: {
      text: "Below the clavicle the cords lie deep to pectoralis major and minor around the second part of the axillary artery: lateral cord superolateral, posterior cord posterior, medial cord posteromedial. The axillary vein lies caudal/medial to the artery. Individual cords need not be targeted — a U-shaped spread around the artery is the goal.",
      relations: ["Superficial: pectoralis major and minor (pectoral branch of thoracoacromial artery between them)", "Caudal/medial: axillary vein", "Deep: chest wall and pleura", "Lateral: coracoid process"],
      targets: "Lateral, posterior and medial cords",
      plexus: { type: "brachial", hi: ["LC", "PC", "MC"], zone: "Cords" }
    },
    sono: {
      probe: "Linear 8–13 MHz (curvilinear if deep)",
      depth: "4–6 cm",
      orientation: "Parasagittal, medial to coracoid · left = cephalad, right = caudad",
      image: {
        probe: "linear", depth: 5, left: "CEPHALAD", right: "CAUDAD",
        s: [
          { id: "pmaj", t: "muscle", l: "Pectoralis major", d: "Superficial muscle layer.", p: [[0, 16], [400, 14], [400, 70], [0, 78]], lab: [320, 40] },
          { id: "pmin", t: "muscle", l: "Pectoralis minor", d: "Deeper layer; cords lie beneath.", p: [[0, 90], [400, 84], [400, 134], [0, 142]], lab: [320, 108] },
          { id: "aa", t: "artery", l: "Axillary artery", d: "Second part — the cords are named by their relation to it.", c: [200, 192, 22], lab: [200, 160], key: true },
          { id: "av", t: "vein", l: "Axillary vein", d: "Caudal/medial to the artery; compressible.", el: [272, 206, 26, 15, 0], lab: [318, 206] },
          { id: "lc", t: "nerve", e: "honey", l: "Lateral cord", d: "~9 o'clock.", c: [165, 190, 10], lab: [118, 186], key: true },
          { id: "pc", t: "nerve", e: "honey", l: "Posterior cord", d: "~7 o'clock.", c: [182, 222, 10], lab: [130, 236], key: true },
          { id: "mc", t: "nerve", e: "honey", l: "Medial cord", d: "~5 o'clock, between artery and vein.", c: [219, 222, 9], lab: [252, 246], key: true },
          { id: "pleura", t: "pleura", l: "Pleura", d: "Deep — keep a shallow, visible trajectory.", ln: [[0, 272], [200, 266], [400, 272]], lab: [80, 288] }
        ],
        needles: [{ from: [2, 40], to: [197, 224] }],
        spreads: [{ el: [200, 204, 46, 40, 0] }]
      }
    },
    procedure: {
      position: "Supine, arm abducted 90° and elbow flexed (brings plexus more superficial)",
      probe: "Linear, parasagittal just medial to the coracoid process",
      needle: "22G 80–100 mm short-bevel",
      approach: "In-plane, cephalad → caudad",
      steps: [
        "Identify pectoralis major and minor, then the axillary artery (Doppler) with the vein caudal to it.",
        "Look for the cords around the artery (lateral ~9, posterior ~7, medial ~5 o'clock).",
        "Advance steeply in-plane from cephalad, passing the lateral cord, to lie posterior to the artery (6 o'clock).",
        "Inject and watch the LA wrap around the artery in a U-shape; adjust if spread is only anterior."
      ],
      volume: "20–25 mL long-acting LA",
      endpoint: "U-shaped spread around the artery (lateral, posterior and medial aspects)."
    },
    spread: {
      summary: "Arm, elbow, forearm and hand; musculocutaneous and axillary nerves are usually included at cord level. The shoulder is not covered.",
      covered: ["Arm (below shoulder), elbow, forearm and hand", "Musculocutaneous and axillary nerves (usually)"],
      spared: ["Shoulder joint", "Medial upper arm (intercostobrachial, T2)"],
      motor: "Motor block of the whole limb; minimal phrenic effect compared with interscalene/supraclavicular.",
      three: {
        focus: "upperR", view: "anterior",
        needle: { a: "icb", from: "cranial" },
        regions: [
          { k: "exp", seg: ["forearm", "hand", "digit"], side: "R" },
          { k: "exp", seg: "upperArm", side: "R", t: [0.35, 1] },
          { k: "var", seg: "upperArm", side: "R", t: [0, 0.35], th: [300, 200] }
        ],
        labels: [
          { x: "Arm, elbow, forearm & hand", k: "exp", a: { seg: "forearm", side: "R", t: 0.35, th: 10 } },
          { x: "Variable: proximal lateral arm (axillary n.)", k: "var", a: { seg: "upperArm", side: "R", t: 0.15, th: 90 } },
          { x: "Spared: shoulder", k: "spared", a: { seg: "shoulder", side: "R", t: 0.3, th: 60 } },
          { x: "Spared: medial arm (ICBN)", k: "spared", a: { seg: "upperArm", side: "R", t: 0.2, th: 270 } },
          { x: "Needle: medial to coracoid", k: "needle", a: "icb" }
        ]
      }
    },
    tips: [
      "Abduction of the arm pulls the plexus superficially and away from the chest wall.",
      "The target is deep — use a longer needle and good ergonomics.",
      "Doppler for the cephalic vein and thoracoacromial branches.",
      "Ideal site for a catheter: muscle layers hold it securely."
    ],
    pitfalls: ["Spread only anterior to the artery → posterior and medial cords missed.", "Steep angle → poor needle visibility.", "Mistaking the axillary vein for the artery (compress it)."],
    complications: ["Vascular puncture in a non-compressible site", "Pneumothorax (rare)", "LAST"],
    pearls: [
      "Cords are named by their relation to the 2nd part of the axillary artery.",
      "Single injection at 6 o'clock → U-shaped spread covers all cords.",
      "Does not cover the shoulder.",
      "Low phrenic nerve involvement compared with more proximal approaches."
    ],
    source: { title: "Ultrasound-Guided Infraclavicular Brachial Plexus Block", url: "https://www.nysora.com/topics/regional-anesthesia-for-specific-surgical-procedures/upper-extremity-regional-anesthesia-for-specific-surgical-procedures/anesthesia-and-analgesia-for-elbow-and-forearm-procedures/ultrasound-guided-infraclavicular-brachial-plexus-block/" }
  });

  blocks.push({
    id: "axillary",
    name: "Axillary Brachial Plexus Block",
    short: "Axillary",
    cat: "upper",
    tags: ["Brachial plexus", "Terminal branches", "No phrenic risk"],
    tagline: "Elbow, forearm & hand • terminal branches",
    summary: "The terminal branches are scattered around the axillary artery: median superficial-lateral, ulnar superficial-medial and radial posterior. The musculocutaneous nerve has already left the sheath and lies between biceps and coracobrachialis — it must be blocked separately.",
    indications: ["Elbow, forearm and hand surgery", "AV fistula surgery", "Outpatient hand surgery (no phrenic or pneumothorax risk)"],
    keyInfo: {
      position: ["Supine, arm abducted 90°, elbow flexed", "Hand resting near the head"],
      approach: ["Linear probe transverse in the axilla at pectoralis major insertion", "In-plane from the lateral (biceps) side"],
      procedure: ["Artery + conjoint tendon; light pressure to see veins", "Radial first (posterior), then median and ulnar", "Separate injection for the musculocutaneous nerve"],
      volume: "15–20 mL total (≈5 mL per nerve)",
      coverage: "Elbow, forearm and hand"
    },
    anatomy: {
      text: "In the axilla the median, ulnar and radial nerves lie close to the axillary artery between the anterior compartment (biceps, coracobrachialis) and the posterior compartment (latissimus dorsi, teres major). The conjoint tendon of latissimus dorsi and teres major lies deep to the neurovascular bundle and is the key deep landmark. The musculocutaneous nerve leaves the lateral cord proximally and runs in the fascial plane between biceps and coracobrachialis.",
      relations: ["Median: superficial and lateral to the artery", "Ulnar: superficial and medial", "Radial: posterior to the artery, on the conjoint tendon", "Musculocutaneous: between biceps and coracobrachialis, away from the bundle"],
      targets: "Median, ulnar, radial and musculocutaneous nerves",
      plexus: { type: "brachial", hi: ["MED", "ULN", "RAD", "MCN"], zone: "Terminal branches" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "2–3 cm",
      orientation: "Short axis to the humerus at the axillary crease · left = lateral (biceps), right = medial",
      image: {
        probe: "linear", depth: 3, left: "LATERAL", right: "MEDIAL",
        s: [
          { id: "bic", t: "muscle", l: "Biceps", d: "Superficial, lateral.", el: [70, 58, 72, 38, 0], lab: [52, 44] },
          { id: "cbr", t: "muscle", l: "Coracobrachialis", d: "Deep to biceps.", el: [92, 148, 64, 38, 0], lab: [70, 162] },
          { id: "mcn", t: "nerve", e: "honey", l: "Musculocutaneous n.", d: "In the plane between biceps and coracobrachialis — block separately.", el: [104, 104, 13, 7, 0], lab: [110, 124], key: true },
          { id: "aa", t: "artery", l: "Axillary artery", d: "Centre of the bundle.", c: [224, 122, 14], lab: [230, 148] },
          { id: "v1", t: "vein", l: "Axillary veins", d: "Collapse with light pressure.", el: [264, 94, 15, 8, 0], lab: [300, 72] },
          { id: "v2", t: "vein", l: "Axillary veins", d: "Collapse with light pressure.", el: [290, 132, 13, 9, 0] },
          { id: "med", t: "nerve", e: "honey", l: "Median n.", d: "Superficial-lateral to artery.", c: [196, 98, 9], lab: [178, 76], key: true },
          { id: "uln", t: "nerve", e: "honey", l: "Ulnar n.", d: "Superficial-medial to artery.", c: [250, 110, 8], lab: [262, 50], key: true },
          { id: "rad", t: "nerve", e: "honey", l: "Radial n.", d: "Posterior to artery, on the conjoint tendon.", c: [218, 150, 9], lab: [196, 176], key: true },
          { id: "ct", t: "tendon", l: "Conjoint tendon", d: "Latissimus dorsi + teres major — deep landmark.", p: [[150, 176], [300, 168], [302, 178], [152, 186]], lab: [270, 196] },
          { id: "hum", t: "bone", l: "Humerus", d: "Lateral and deep.", ln: [[0, 214], [60, 206], [124, 200]], lab: [40, 232] },
          { id: "tri", t: "muscle", l: "Triceps", d: "Posterior compartment.", el: [322, 236, 90, 48, 0], lab: [330, 250] }
        ],
        needles: [{ from: [2, 68], to: [214, 158] }],
        spreads: [{ el: [222, 124, 52, 42, 0] }, { el: [104, 104, 22, 12, 0] }]
      }
    },
    procedure: {
      position: "Supine, arm abducted 90°, elbow flexed",
      probe: "Linear 10–15 MHz, transverse across the axilla at the pectoralis major insertion",
      needle: "22G 50 mm short-bevel",
      approach: "In-plane from lateral (anterior) to medial",
      steps: [
        "Use light probe pressure; identify the artery, collapsible veins and deep conjoint tendon.",
        "Find the musculocutaneous nerve between biceps and coracobrachialis (scan proximal/distal — it moves).",
        "Block the radial nerve first (posterior to artery) so later injections do not push it deeper.",
        "Redirect to the median and ulnar nerves; aim for spread around the artery.",
        "Separate 5 mL injection around the musculocutaneous nerve."
      ],
      volume: "15–20 mL total (≈5 mL per nerve)",
      endpoint: "Perivascular spread surrounding median, ulnar and radial nerves + separate MC spread."
    },
    spread: {
      summary: "Anaesthesia from mid-arm down to and including the hand once the musculocutaneous nerve is blocked.",
      covered: ["Forearm and hand", "Elbow and distal arm", "Lateral forearm only if musculocutaneous is blocked"],
      spared: ["Shoulder and proximal arm", "Medial upper arm (intercostobrachial, medial cutaneous nerve of arm) — subcutaneous infiltration"],
      motor: "Forearm and hand motor block. No phrenic block, Horner syndrome or pneumothorax risk.",
      three: {
        focus: "upperR", view: "anterior",
        needle: { a: "axb", from: "lateral" },
        regions: [
          { k: "exp", seg: ["hand", "digit"], side: "R" },
          { k: "exp", seg: "forearm", side: "R" },
          { k: "var", seg: "forearm", side: "R", th: [30, 135] },
          { k: "exp", seg: "upperArm", side: "R", t: [0.55, 1] }
        ],
        labels: [
          { x: "Elbow, forearm & hand", k: "exp", a: { seg: "forearm", side: "R", t: 0.4, th: 0 } },
          { x: "Lateral forearm needs MC nerve injection", k: "var", a: { seg: "forearm", side: "R", t: 0.4, th: 90 } },
          { x: "Spared: shoulder & medial arm", k: "spared", a: { seg: "upperArm", side: "R", t: 0.25, th: 280 } },
          { x: "Needle: axilla", k: "needle", a: "axb" }
        ]
      }
    },
    tips: [
      "Light probe pressure — heavy pressure collapses the veins so they disappear, then fill with LA.",
      "Radial nerve first: it sits posterior and deep.",
      "Follow the musculocutaneous nerve up and down the arm; it moves between the muscles.",
      "Infiltrate subcutaneously across the medial arm for tourniquet (ICBN)."
    ],
    pitfalls: ["Missed musculocutaneous nerve → radial-side forearm sparing.", "Intravascular injection — multiple veins in the field."],
    complications: ["Vascular puncture/haematoma", "LAST", "Nerve injury (rare)"],
    pearls: [
      "Safest brachial plexus approach — no phrenic block, no pneumothorax.",
      "Median superficial-lateral, ulnar superficial-medial, radial posterior to the artery.",
      "Musculocutaneous lies between biceps and coracobrachialis — block separately.",
      "Conjoint tendon (LD + TM) = deep landmark."
    ],
    source: { title: "Ultrasound-Guided Axillary Brachial Plexus Block", url: "https://www.nysora.com/techniques/upper-extremity/axillary/ultrasound-guided-axillary-brachial-plexus-block/" }
  });

  blocks.push({
    id: "suprascapular",
    name: "Suprascapular Nerve Block",
    short: "Suprascapular",
    cat: "upper",
    tags: ["Shoulder analgesia", "Diaphragm-sparing"],
    tagline: "Shoulder analgesia • diaphragm-sparing",
    summary: "The suprascapular nerve (C5–C6, from the superior trunk) supplies most of the posterior and superior shoulder joint and the supraspinatus/infraspinatus. It is blocked in the floor of the supraspinous fossa (posterior approach) or beneath the omohyoid (anterior approach).",
    indications: ["Shoulder arthroscopy analgesia when phrenic sparing matters (± axillary nerve block)", "Adhesive capsulitis / chronic shoulder pain"],
    keyInfo: {
      position: ["Sitting or lateral, arm by the side"],
      approach: ["Posterior: linear probe coronal over supraspinous fossa, slight anterior tilt", "In-plane, lateral → medial"],
      procedure: ["Trapezius, supraspinatus and bony floor of the fossa", "Doppler: suprascapular artery accompanies nerve", "Inject on the floor beneath supraspinatus"],
      volume: "5–10 mL",
      coverage: "Posterior/superior shoulder joint (analgesia); minimal skin"
    },
    anatomy: {
      text: "The nerve arises from the superior trunk (C5–C6), passes through the suprascapular notch beneath the superior transverse scapular ligament (the artery passes over it), runs along the floor of the supraspinous fossa and through the spinoglenoid notch. It carries sensory fibres to roughly 70% of the shoulder joint (posterior and superior capsule, acromioclavicular joint, subacromial bursa) and motor fibres to supraspinatus and infraspinatus.",
      relations: ["Notch: nerve under, artery over the superior transverse scapular ligament", "Posterior approach: deep to trapezius and supraspinatus, on the fossa floor", "Anterior approach: nerve leaving the superior trunk deep to omohyoid"],
      targets: "Suprascapular nerve (and its articular branches)",
      plexus: { type: "brachial", hi: ["SSN"], zone: "Suprascapular nerve" }
    },
    sono: {
      probe: "Linear 7–13 MHz",
      depth: "3–5 cm",
      orientation: "Coronal oblique over supraspinous fossa · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 5, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "trap", t: "muscle", l: "Trapezius", d: "Superficial.", p: [[0, 14], [400, 12], [400, 56], [0, 62]], lab: [60, 36] },
          { id: "ssp", t: "muscle", l: "Supraspinatus", d: "Fills the fossa; inject beneath it.", p: [[0, 70], [400, 64], [400, 176], [0, 182]], lab: [80, 120] },
          { id: "floor", t: "bone", l: "Floor of supraspinous fossa", d: "Bony backstop.", ln: [[0, 204], [150, 198], [220, 206], [260, 210], [300, 200], [400, 190]], lab: [110, 226] },
          { id: "ssa", t: "artery", l: "Suprascapular artery", d: "Doppler — runs with the nerve.", c: [212, 192, 5], lab: [186, 170] },
          { id: "ssn", t: "nerve", e: "honey", l: "Suprascapular nerve", d: "On the floor near the notch/spinoglenoid route.", c: [234, 194, 6], lab: [270, 170], key: true }
        ],
        needles: [{ from: [398, 40], to: [232, 196] }],
        spreads: [{ el: [228, 192, 48, 11, 0] }]
      }
    },
    procedure: {
      position: "Sitting or lateral decubitus, arm by the side",
      probe: "Linear over the supraspinous fossa, parallel to the scapular spine, tilted anteriorly",
      needle: "22G 50–80 mm",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify trapezius, supraspinatus and the bony floor of the fossa.",
        "Find the suprascapular artery with Doppler; the nerve lies alongside.",
        "Advance to the floor of the fossa beneath the supraspinatus fascia.",
        "Inject and watch spread along the floor toward the notch."
      ],
      volume: "5–10 mL",
      endpoint: "LA pooling along the fossa floor under supraspinatus."
    },
    spread: {
      summary: "Posterior and superior shoulder joint, AC joint and part of the subacromial bursa; supraspinatus/infraspinatus motor. Little cutaneous anaesthesia.",
      covered: ["Posterior & superior glenohumeral capsule", "Acromioclavicular joint, part of subacromial bursa", "Supraspinatus and infraspinatus (motor)"],
      spared: ["Anterior/inferior shoulder (axillary, lateral pectoral nerves) — add axillary nerve block", "Shoulder skin/portal sites"],
      motor: "Weak abduction initiation and external rotation; phrenic-sparing with the posterior approach.",
      three: {
        focus: "upperR", view: "posterior",
        needle: { a: "ssnb", from: "lateral" },
        regions: [],
        deep: [{ k: "tgt", at: "shoulderJoint" }, { k: "tgt", at: "rotatorCuff" }],
        labels: [
          { x: "Deep target: shoulder joint (post/sup capsule)", k: "tgt", a: "shoulderJoint" },
          { x: "Supraspinatus / infraspinatus", k: "tgt", a: "rotatorCuff" },
          { x: "No reliable skin anaesthesia", k: "spared", a: { seg: "shoulder", side: "R", t: 0.4, th: 150 } },
          { x: "Needle: supraspinous fossa", k: "needle", a: "ssnb" }
        ]
      }
    },
    tips: [
      "Combine with an axillary nerve block (quadrilateral space) for better shoulder coverage.",
      "The anterior (subomohyoid) approach blocks more articular branches but carries more phrenic risk."
    ],
    pitfalls: ["Needle not reaching the fossa floor → spread within muscle and patchy block.", "Directing the needle anteriorly/medially over the scapula edge."],
    complications: ["Pneumothorax if the needle passes beyond the scapula", "Vascular puncture"],
    pearls: [
      "Supplies ~70% of the shoulder joint's sensory innervation.",
      "Nerve passes under, artery over the superior transverse scapular ligament ('Army over the bridge, Navy under').",
      "Diaphragm-sparing shoulder analgesia (posterior approach)."
    ],
    source: { title: "Ultrasound-Guided Peripheral Nerve Blocks — suprascapular nerve", url: "https://nysora.com/pain-management/ultrasound-guided-upper-extremity-blocks/" }
  });

  /* ======================================================================
     LOWER LIMB
     ====================================================================== */

  blocks.push({
    id: "femoral",
    name: "Femoral Nerve Block",
    short: "Femoral",
    cat: "lower",
    tags: ["Lumbar plexus", "L2–L4", "Quadriceps weakness"],
    tagline: "Anterior thigh, femur & knee • L2–L4",
    summary: "The femoral nerve lies 1–2 cm lateral to the femoral artery at the inguinal crease, deep to the fascia iliaca and on the iliopsoas. Local anaesthetic must reach beneath the fascia iliaca around the nerve.",
    indications: ["Femoral shaft and hip fracture analgesia", "Anterior thigh and knee surgery (analgesia)", "With sciatic/popliteal block for surgery below the knee"],
    keyInfo: {
      position: ["Supine, leg slightly abducted"],
      approach: ["Linear probe transverse at the inguinal crease", "In-plane, lateral → medial"],
      procedure: ["Artery, then nerve 1–2 cm lateral under fascia iliaca", "Pierce fascia iliaca; tip lateral/deep to nerve", "Spread lifts fascia iliaca around nerve"],
      volume: "10–20 mL",
      coverage: "Anterior thigh, femur, knee; medial leg (saphenous)"
    },
    anatomy: {
      text: "The femoral nerve (L2–L4) enters the thigh under the inguinal ligament lateral to the femoral artery, lying on the iliopsoas and deep to the fascia iliaca. The femoral artery and vein lie superficial to the fascia iliaca in a separate compartment, so the nerve is only reached after piercing the fascia iliaca.",
      relations: ["Lateral → medial: Nerve, Artery, Vein ('NAV')", "Nerve: deep to fascia iliaca, superficial to iliopsoas", "Vessels: superficial to fascia iliaca", "Fascia lata covers everything superficially"],
      targets: "Femoral nerve (saphenous is its terminal sensory branch)",
      plexus: { type: "lumbosacral", hi: ["FEM", "SAPH", "NVM"], zone: "Femoral nerve" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "3–4 cm",
      orientation: "Transverse at the inguinal crease · left = lateral, right = medial",
      image: {
        probe: "linear", depth: 4, left: "LATERAL", right: "MEDIAL",
        s: [
          { id: "fl", t: "fascia", l: "Fascia lata", d: "Superficial fascia.", ln: [[0, 44], [400, 42]], lab: [60, 30] },
          { id: "ips", t: "muscle", l: "Iliopsoas", d: "Nerve lies on its surface.", el: [120, 200, 118, 62, 0], lab: [90, 210] },
          { id: "fi", t: "fascia", l: "Fascia iliaca", d: "Must be pierced — covers nerve, passes deep to the vessels.", ln: [[0, 106], [140, 104], [210, 110], [240, 146], [340, 152], [400, 150]], lab: [40, 92] },
          { id: "fn", t: "nerve", e: "honey", l: "Femoral nerve", d: "Hyperechoic, triangular/oval, 1–2 cm lateral to artery.", el: [168, 124, 24, 11, 0], lab: [150, 150], key: true },
          { id: "fa", t: "artery", l: "Femoral artery", d: "Scan above the profunda origin.", c: [260, 112, 20], lab: [262, 76] },
          { id: "fv", t: "vein", l: "Femoral vein", d: "Medial; compressible.", el: [328, 122, 26, 17, 0], lab: [344, 94] },
          { id: "pec", t: "muscle", l: "Pectineus", d: "Medial, deep to vessels.", el: [352, 214, 60, 40, 0], lab: [350, 226] }
        ],
        needles: [{ from: [2, 60], to: [150, 136] }],
        spreads: [{ el: [166, 126, 40, 20, 0] }]
      },
      // Note: this real capture has medial on the LEFT and lateral on the
      // RIGHT — the opposite screen convention to the schematic above — so
      // the nerve (lateral member of NAV) sits on the right of this photo.
      real: {
        image: "assets/regional/femoral-usg.jpg",
        source: "KnockoutNotes / user-provided",
        orientation: "Transverse at the inguinal crease (medial → lateral)",
        probe: "Linear",
        labels: [
          { id: "far", text: "Femoral artery", type: "artery", x: 18, y: 28 },
          { id: "fnr", text: "Femoral nerve", type: "nerve", x: 57, y: 33 },
          { id: "ipsr", text: "Iliopsoas", type: "muscle", x: 55, y: 72 }
        ],
        needleOverlay: { from: [92, 18], to: [60, 36], approach: "in-plane", side: "lateral", target: "lateral/deep to the femoral nerve, beneath fascia iliaca" },
        spreadOverlay: [{ shape: "ellipse", x: 58, y: 36, rx: 11, ry: 9, variable: false, note: "LA spread beneath fascia iliaca" }]
      }
    },
    procedure: {
      position: "Supine, leg slightly abducted and externally rotated",
      probe: "Linear at the inguinal crease, transverse",
      needle: "22G 50 mm short-bevel",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify the femoral artery; scan proximally above the origin of the profunda femoris.",
        "Find the hyperechoic nerve 1–2 cm lateral to the artery, under the fascia iliaca; tilt the probe to enhance it.",
        "Advance through the fascia iliaca ('pop') to lie lateral/deep to the nerve.",
        "Inject: LA should lift the fascia iliaca and surround or displace the nerve."
      ],
      volume: "10–20 mL",
      endpoint: "Spread beneath fascia iliaca around the nerve (not just above the fascia)."
    },
    spread: {
      summary: "Anterior and medial thigh, femur, anterior knee and — via the saphenous nerve — the medial leg to the medial malleolus.",
      covered: ["Anterior thigh and lower medial thigh (anterior cutaneous branches)", "Femur and anterior knee joint", "Medial leg to the medial malleolus (saphenous)"],
      spared: ["Lateral thigh (lateral femoral cutaneous nerve)", "Upper medial thigh (obturator, variable)", "Posterior thigh, most of the leg and foot (sciatic territory)"],
      motor: "Quadriceps weakness — fall risk; mobilise with care.",
      three: {
        focus: "lowerR", view: "anterior",
        needle: { a: "fnb", from: "lateral" },
        regions: [
          { k: "exp", seg: "thigh", side: "R", t: [0.08, 1], th: [300, 60] },
          { k: "exp", seg: "thigh", side: "R", t: [0.3, 1], th: [245, 300] },
          { k: "exp", seg: "leg", side: "R", th: [215, 320] },
          { k: "var", seg: "foot", side: "R", th: [235, 300], t: [0, 0.45] }
        ],
        labels: [
          { x: "Anterior thigh & knee", k: "exp", a: { seg: "thigh", side: "R", t: 0.55, th: 0 } },
          { x: "Medial leg (saphenous)", k: "exp", a: { seg: "leg", side: "R", t: 0.5, th: 270 } },
          { x: "Spared: lateral thigh (LFCN)", k: "spared", a: { seg: "thigh", side: "R", t: 0.4, th: 95 } },
          { x: "Needle: inguinal crease", k: "needle", a: "fnb" }
        ]
      }
    },
    tips: ["Scan proximal to the profunda branching to see a single artery.", "The nerve is anisotropic — tilt the probe cranially/caudally.", "Spread only above the fascia iliaca will fail."],
    pitfalls: ["Injecting between fascia lata and fascia iliaca.", "Needle drifting medially into the artery."],
    complications: ["Falls from quadriceps weakness", "Vascular puncture, LAST", "Nerve injury (rare)"],
    pearls: [
      "Lateral → medial: Nerve, Artery, Vein.",
      "Fascia iliaca separates the nerve from the vessels.",
      "'3-in-1' block (femoral + LFCN + obturator) is unreliable — use a fascia iliaca block instead.",
      "Saphenous nerve = the only femoral branch below the knee."
    ],
    source: { title: "Ultrasound-Guided Femoral Nerve Block", url: "https://www.nysora.com/techniques/lower-extremity/ultrasound-guided-femoral-nerve-block/" }
  });

  blocks.push({
    id: "fascia-iliaca",
    name: "Infrainguinal Fascia Iliaca Block",
    short: "Fascia Iliaca",
    cat: "lower",
    tags: ["Fascial plane", "Volume-dependent", "Hip fracture"],
    tagline: "Anterior thigh analgesia • femoral ± LFCN",
    summary: "Performed in the same transverse view as a femoral nerve block, at the inguinal crease. Rather than aiming at the nerve, the needle tip stays lateral to it, deep to the fascia iliaca, and a larger volume is injected to spread around the femoral nerve and, less reliably than the suprainguinal approach, toward the lateral femoral cutaneous nerve (LFCN).",
    indications: ["Hip fracture analgesia (ED and perioperative)", "Femoral shaft fracture", "Anterior thigh/knee analgesia when a discrete femoral block is not needed"],
    keyInfo: {
      position: ["Supine, leg slightly abducted"],
      approach: ["Linear probe transverse at the inguinal crease — the same view as a femoral nerve block", "In-plane, lateral → medial"],
      procedure: ["Identify the femoral artery, then the femoral nerve just lateral to it", "Advance lateral to the nerve, through fascia lata and fascia iliaca", "Inject a larger volume so LA spreads under the fascia both medially (nerve) and laterally"],
      volume: "30–40 mL dilute LA",
      coverage: "Anterior thigh (femoral); lateral thigh (LFCN) less consistently than the suprainguinal approach"
    },
    anatomy: {
      text: "At the inguinal crease the femoral nerve lies lateral to the femoral artery, deep to the fascia iliaca and superficial to iliopsoas — the same sono-anatomy used for a femoral nerve block. Instead of depositing LA directly around the nerve, the needle tip is kept lateral to it, deep to the fascia iliaca, and a larger volume is injected so it tracks within the fascial plane both medially around the femoral nerve and laterally. Because the lateral femoral cutaneous nerve has often already left the fascia iliaca plane by this level, its coverage here is less reliable than with the suprainguinal (SIFI) approach performed above the inguinal ligament.",
      relations: ["Lateral → medial: needle entry, femoral nerve, femoral artery, femoral vein", "Nerve and needle tip: deep to fascia iliaca, superficial to iliopsoas", "Vessels: same compartment as the nerve, medial to it", "Fascia lata covers everything superficially"],
      targets: "Femoral nerve (primary); lateral femoral cutaneous nerve inconsistently",
      plexus: { type: "lumbosacral", hi: ["FEM"], vari: ["LFCN"], zone: "Fascia iliaca (infrainguinal)" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "3–4 cm",
      orientation: "Transverse at the inguinal crease · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 4, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "fl", t: "fascia", l: "Fascia lata", d: "Superficial fascia.", ln: [[0, 42], [400, 44]], lab: [340, 30] },
          { id: "ips", t: "muscle", l: "Iliopsoas", d: "Nerve and needle tip lie on its surface.", el: [280, 200, 118, 62, 0], lab: [310, 210] },
          { id: "fi", t: "fascia", l: "Fascia iliaca", d: "Target plane — the needle tip and injectate stay deep to it.", ln: [[0, 150], [60, 152], [160, 146], [190, 110], [260, 104], [400, 106]], lab: [360, 92] },
          { id: "fn", t: "nerve", e: "honey", l: "Femoral nerve", d: "Hyperechoic, triangular/oval — used as a landmark, not the injection target.", el: [232, 124, 24, 11, 0], lab: [250, 150], key: true },
          { id: "fa", t: "artery", l: "Femoral artery", d: "Medial to the nerve.", c: [140, 112, 20], lab: [138, 76] },
          { id: "fv", t: "vein", l: "Femoral vein", d: "Most medial; compressible.", el: [72, 122, 26, 17, 0], lab: [56, 94] },
          { id: "pec", t: "muscle", l: "Pectineus", d: "Medial, deep to vessels.", el: [48, 214, 60, 40, 0], lab: [50, 226] }
        ],
        needles: [{ from: [398, 60], to: [272, 130] }],
        spreads: [{ el: [190, 140, 140, 14, -2] }]
      },
      real: {
        image: "assets/regional/fascia-iliaca-usg.jpg",
        source: "KnockoutNotes / user-provided",
        orientation: "Transverse at the inguinal crease (medial → lateral)",
        probe: "Linear",
        labels: [
          { id: "far2", text: "Femoral artery", type: "artery", x: 18, y: 28 },
          { id: "fnr2", text: "Femoral nerve (landmark)", type: "nerve", x: 55, y: 33 },
          { id: "fir2", text: "Fascia iliaca", type: "fascia", x: 45, y: 15 }
        ],
        needleOverlay: { from: [92, 20], to: [67, 35], approach: "in-plane", side: "lateral", target: "deep to fascia iliaca, lateral to the femoral nerve (not at it)" },
        spreadOverlay: [{ shape: "ellipse", x: 58, y: 34, rx: 20, ry: 8, variable: false, note: "Fascial-plane spread (flat, not a pool)" }]
      }
    },
    procedure: {
      position: "Supine, leg slightly abducted and externally rotated",
      probe: "Linear at the inguinal crease, transverse — the same view as a femoral nerve block",
      needle: "22G 80 mm short-bevel",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify the femoral artery, then the hyperechoic femoral nerve just lateral to it, deep to the fascia iliaca.",
        "Advance in-plane from lateral, keeping the trajectory lateral to the nerve rather than aiming at it.",
        "Pierce fascia lata and fascia iliaca; confirm the tip is deep to the fascia iliaca and superficial to iliopsoas.",
        "Inject a larger volume and watch it spread under the fascia iliaca, both toward the nerve medially and laterally."
      ],
      volume: "30–40 mL dilute LA (e.g., ropivacaine 0.2–0.25%) — calculate the maximum dose",
      endpoint: "LA spreading in a flat layer deep to the fascia iliaca, lifting it off iliopsoas around the nerve."
    },
    spread: {
      summary: "Anterior thigh (femoral nerve) reliably; lateral thigh (LFCN) inconsistently — less reliable than the suprainguinal (SIFI) approach. No hip capsule analgesia at this level.",
      covered: ["Anterior thigh (femoral)"],
      spared: ["Lateral thigh (LFCN) — inconsistent at this level", "Obturator territory", "Hip capsule (better with the suprainguinal approach)"],
      motor: "Quadriceps weakness, similar to a femoral nerve block.",
      three: {
        focus: "lowerR", view: "anterior",
        needle: { a: "sifi", from: "lateral" },
        regions: [
          { k: "exp", seg: "thigh", side: "R", t: [0.04, 0.78], th: [60, 145] },
          { k: "var", seg: "thigh", side: "R", t: [0.1, 0.55], th: [225, 300] }
        ],
        labels: [
          { x: "Anterior thigh (femoral)", k: "exp", a: { seg: "thigh", side: "R", t: 0.55, th: 0 } },
          { x: "Variable: lateral thigh (LFCN) — less reliable than SIFI", k: "var", a: { seg: "thigh", side: "R", t: 0.3, th: 260 } },
          { x: "Needle: inguinal crease, lateral to the nerve", k: "needle", a: "sifi" }
        ]
      }
    },
    tips: ["Keep the needle tip lateral to the nerve — this is a fascial-plane block, not a perineural injection.", "A larger volume is what drives spread; watch it lift the fascia iliaca off iliopsoas."],
    pitfalls: ["Injecting into the iliopsoas muscle instead of the fascial plane.", "Expecting reliable LFCN coverage — it is inconsistent at this level.", "Injection superficial to the fascia iliaca (into the vessel compartment)."],
    complications: ["Quadriceps weakness / falls", "LAST (large volumes)", "Vascular puncture", "Intraneural injection if the needle strays onto the nerve"],
    pearls: [
      "Infrainguinal fascia iliaca = the femoral nerve block view, needle kept lateral to the nerve, bigger volume.",
      "Suprainguinal (SIFI) gives more reliable LFCN coverage than this infrainguinal approach.",
      "Not a substitute for a femoral nerve block when dense femoral anaesthesia (not just analgesia) is needed."
    ],
    source: { title: "Ultrasound-Guided Fascia Iliaca Block", url: "https://www.nysora.com/topics/regional-anesthesia-for-specific-surgical-procedures/lower-extremity-regional-anesthesia-for-specific-surgical-procedures/ultrasound-guided-fascia-iliaca-block/" }
  });

  blocks.push({
    id: "peng",
    name: "Pericapsular Nerve Group (PENG) Block",
    short: "PENG",
    cat: "lower",
    tags: ["Hip capsule", "Motor-sparing", "Fascial plane"],
    tagline: "Anterior hip capsule • motor-sparing",
    summary: "Targets the articular branches of the femoral, obturator and accessory obturator nerves to the anterior hip capsule, in the plane between the psoas tendon and the iliopubic eminence.",
    indications: ["Hip fracture analgesia", "Hip arthroplasty analgesia"],
    keyInfo: {
      position: ["Supine"],
      approach: ["Curvilinear probe transverse at the AIIS, rotated ~45°", "In-plane, lateral → medial"],
      procedure: ["AIIS, iliopubic eminence (IPE), psoas tendon, femoral artery", "Tip between psoas tendon and IPE", "Tendon lifts off bone on injection"],
      volume: "~20 mL",
      coverage: "Anterior hip capsule — no skin anaesthesia"
    },
    anatomy: {
      text: "The anterior hip capsule receives articular branches of the femoral, obturator and accessory obturator nerves that cross the superior pubic ramus near the iliopubic eminence, deep to the psoas tendon. Placing LA between the tendon and bone blocks these branches while largely sparing the main motor nerves.",
      relations: ["Superficial: iliopsoas muscle/tendon; femoral nerve and artery medially", "Deep: iliopubic eminence (superior pubic ramus)", "Lateral: anterior inferior iliac spine (AIIS)", "Medial: pectineus"],
      targets: "Articular branches of femoral, obturator and accessory obturator nerves",
      plexus: { type: "lumbosacral", hi: ["FEM", "OBT", "AOBT", "HIP"], zone: "Hip articular branches" }
    },
    sono: {
      probe: "Curvilinear 2–5 MHz",
      depth: "5–8 cm",
      orientation: "Transverse oblique over AIIS/IPE · left = lateral, right = medial",
      image: {
        probe: "curvilinear", depth: 7, left: "LATERAL", right: "MEDIAL",
        s: [
          { id: "ips", t: "muscle", l: "Iliopsoas muscle", d: "Superficial to the tendon.", el: [168, 138, 120, 44, 0], lab: [110, 128] },
          { id: "pt", t: "tendon", l: "Psoas tendon", d: "Lift it off the bone.", el: [206, 180, 18, 8, 0], lab: [240, 168], key: true },
          { id: "fn", t: "nerve", e: "honey", l: "Femoral nerve", d: "Superficial to iliopsoas.", el: [240, 98, 16, 8, 0], lab: [232, 76] },
          { id: "fa", t: "artery", l: "Femoral artery", d: "Medial and superficial.", c: [296, 104, 15], lab: [320, 80] },
          { id: "pec", t: "muscle", l: "Pectineus", d: "Medial.", el: [350, 176, 52, 28, 0], lab: [356, 176] },
          { id: "bone", t: "bone", l: "AIIS → iliopubic eminence", d: "Bony contour: AIIS lateral, IPE medial.", ln: [[40, 176], [96, 160], [140, 184], [206, 196], [270, 200], [330, 206], [390, 214]], lab: [76, 214] },
          { id: "ipe", t: "marker", l: "Iliopubic eminence (IPE)", d: "Target: deep to psoas tendon on the IPE.", c: [206, 198, 4], lab: [206, 226], key: true }
        ],
        needles: [{ from: [30, 60], to: [204, 192] }],
        spreads: [{ el: [210, 192, 48, 10, 0] }]
      },
      // Note: this real capture has medial on the LEFT and lateral on the
      // RIGHT — the opposite screen convention to the schematic above.
      real: {
        image: "assets/regional/peng-usg.jpg",
        source: "KnockoutNotes / user-provided",
        orientation: "Transverse oblique over AIIS/IPE (medial → lateral)",
        probe: "Curvilinear",
        labels: [
          { id: "far3", text: "Femoral artery", type: "artery", x: 18, y: 27 },
          { id: "ipsr3", text: "Iliopsoas / psoas tendon", type: "muscle", x: 35, y: 30 },
          { id: "boner3", text: "Ilium (AIIS → IPE) cortex", type: "bone", x: 62, y: 45 }
        ],
        needleOverlay: { from: [88, 18], to: [62, 42], approach: "in-plane", side: "lateral", target: "between the psoas tendon and the iliopubic eminence" },
        spreadOverlay: [{ shape: "ellipse", x: 58, y: 44, rx: 16, ry: 6, variable: false, note: "LA lifting the tendon off the bone" }]
      }
    },
    procedure: {
      position: "Supine",
      probe: "Curvilinear; transverse over the AIIS then rotated ~45° to align with the superior pubic ramus",
      needle: "22G 80–100 mm",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify the AIIS, the iliopubic eminence, the psoas tendon, femoral artery and pectineus.",
        "Advance in-plane from lateral until the tip lies between the psoas tendon (anterior) and the IPE (posterior).",
        "Inject: the tendon should lift off the bone (hydrodissection)."
      ],
      volume: "~20 mL",
      endpoint: "LA spreading along the IPE, lifting the psoas tendon."
    },
    spread: {
      summary: "Analgesia of the anterior hip capsule. No cutaneous anaesthesia and largely motor-sparing.",
      covered: ["Anterior hip capsule (femoral, obturator, accessory obturator articular branches)"],
      spared: ["Skin incision (lateral thigh — LFCN): add LFCN block/infiltration", "Posterior capsule (sacral plexus)"],
      motor: "Largely motor-sparing; quadriceps weakness possible with high volume/medial spread.",
      three: {
        focus: "lowerR", view: "anterior",
        needle: { a: "peng", from: "lateral" },
        regions: [],
        deep: [{ k: "tgt", at: "hipCapsule" }],
        labels: [
          { x: "Deep target: anterior hip capsule", k: "tgt", a: "hipCapsule" },
          { x: "No skin anaesthesia (add LFCN for incision)", k: "spared", a: { seg: "thigh", side: "R", t: 0.3, th: 95 } },
          { x: "Needle: AIIS / IPE", k: "needle", a: "peng" }
        ]
      }
    },
    tips: ["Rotating the probe ~45° aligns it with the pubic ramus and shows the IPE.", "Keep medial of the AIIS but lateral of the femoral artery."],
    pitfalls: ["Injecting within the iliopsoas muscle.", "Too medial → femoral nerve/artery."],
    complications: ["Quadriceps weakness (high volume)", "Vascular puncture", "LAST"],
    pearls: ["Target = articular branches of femoral, obturator and accessory obturator nerves.", "Plane: psoas tendon (anterior) vs iliopubic eminence (posterior).", "Motor-sparing hip analgesia; no skin coverage."],
    source: { title: "NYSORA — PENG block (educational update)", url: "https://nysora.com/education-news/peng-block-or-sificb-rct-compares-dynamic-pain-relief-in-hip-fracture-patients/" }
  });

  blocks.push({
    id: "adductor-canal",
    name: "Adductor Canal (Saphenous) Block",
    short: "Adductor Canal",
    cat: "lower",
    tags: ["Saphenous", "Quadriceps-sparing", "Knee"],
    tagline: "Knee analgesia • quadriceps-sparing",
    summary: "LA lateral to the femoral artery beneath sartorius in the adductor canal blocks the saphenous nerve and nerve to vastus medialis (± medial femoral cutaneous and obturator articular branches) while largely sparing quadriceps strength.",
    indications: ["Total knee arthroplasty analgesia (with iPACK / periarticular infiltration)", "ACL reconstruction", "Medial leg/ankle surgery with a sciatic block"],
    keyInfo: {
      position: ["Supine, leg externally rotated"],
      approach: ["Linear probe transverse mid-thigh", "In-plane, lateral → medial"],
      procedure: ["Femoral artery under sartorius", "Saphenous: small hyperechoic, lateral to artery", "Inject deep to sartorius, lateral to artery"],
      volume: "~10 mL",
      coverage: "Medial knee, medial leg to ankle"
    },
    anatomy: {
      text: "Sartorius forms the roof of the adductor canal in the lower thigh. The canal contains the femoral artery and vein, the saphenous nerve, the nerve to vastus medialis, and articular branches of the obturator nerve. More proximal injection (distal femoral triangle) or large volumes reach more femoral branches — better analgesia but more quadriceps weakness.",
      relations: ["Roof: sartorius (and vastoadductor membrane)", "Lateral: vastus medialis", "Posteromedial: adductor longus/magnus", "Contents: femoral vessels, saphenous nerve, nerve to vastus medialis"],
      targets: "Saphenous nerve, nerve to vastus medialis",
      plexus: { type: "lumbosacral", hi: ["SAPH", "NVM"], zone: "Femoral terminal branches" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "2–4 cm",
      orientation: "Transverse mid-thigh · left = lateral, right = medial",
      image: {
        probe: "linear", depth: 4, left: "LATERAL", right: "MEDIAL",
        s: [
          { id: "sar", t: "muscle", l: "Sartorius", d: "Roof of the canal.", el: [226, 66, 92, 44, 0], lab: [236, 52] },
          { id: "vm", t: "muscle", l: "Vastus medialis", d: "Lateral wall.", el: [70, 150, 90, 62, 0], lab: [58, 150] },
          { id: "add", t: "muscle", l: "Adductor longus / magnus", d: "Posteromedial wall.", el: [334, 186, 90, 58, 0], lab: [340, 200] },
          { id: "fa", t: "artery", l: "Femoral artery", d: "Centre of the canal.", c: [222, 146, 16], lab: [252, 128] },
          { id: "fv", t: "vein", l: "Femoral vein", d: "Deep/medial to artery.", el: [238, 176, 17, 11, 0], lab: [270, 184] },
          { id: "sn", t: "nerve", e: "honey", l: "Saphenous nerve", d: "Small, hyperechoic, lateral/anterolateral to artery.", c: [196, 130, 6], lab: [166, 106], key: true },
          { id: "nvm", t: "nerve", e: "honey", l: "Nerve to vastus medialis", d: "Lateral, near vastus medialis.", c: [156, 126, 5], lab: [112, 102] },
          { id: "fem", t: "bone", l: "Femur", d: "Deep, lateral.", ln: [[30, 266], [100, 256], [170, 262]], lab: [60, 284] }
        ],
        needles: [{ from: [2, 40], to: [200, 140] }],
        spreads: [{ el: [214, 142, 40, 22, 0] }]
      },
      // Note: this real capture has posteromedial on the LEFT and
      // anterolateral on the RIGHT — the saphenous nerve position is a
      // best estimate (it is a small structure, genuinely hard to pinpoint
      // on a compressed image) — please verify/correct against the source.
      real: {
        image: "assets/regional/adductor-canal-usg.jpg",
        source: "KnockoutNotes / user-provided",
        orientation: "Transverse mid-thigh (posteromedial → anterolateral)",
        probe: "Linear",
        labels: [
          { id: "far4", text: "Femoral artery", type: "artery", x: 52, y: 44 },
          { id: "snr4", text: "Saphenous nerve (approx.)", type: "nerve", x: 63, y: 37 },
          { id: "sarr4", text: "Sartorius", type: "muscle", x: 50, y: 18 }
        ],
        needleOverlay: { from: [90, 22], to: [61, 38], approach: "in-plane", side: "lateral", target: "lateral to the femoral artery, deep to sartorius" },
        spreadOverlay: [{ shape: "ellipse", x: 60, y: 40, rx: 9, ry: 7, variable: false, note: "LA spread around the saphenous nerve" }]
      }
    },
    procedure: {
      position: "Supine, knee slightly flexed, leg externally rotated",
      probe: "Linear, transverse at mid-thigh (true adductor canal) or distal femoral triangle",
      needle: "22G 80 mm",
      approach: "In-plane, lateral → medial through sartorius",
      steps: [
        "Locate the femoral artery deep to sartorius.",
        "Identify the small hyperechoic saphenous nerve lateral/anterolateral to the artery.",
        "Advance through sartorius to the space lateral to the artery.",
        "Inject deep to sartorius and around the artery."
      ],
      volume: "~10 mL long-acting LA",
      endpoint: "Spread deep to sartorius surrounding the artery/saphenous nerve."
    },
    spread: {
      summary: "Medial knee and the medial leg down to the ankle, with good knee analgesia and preserved quadriceps strength.",
      covered: ["Medial knee (infrapatellar branch, nerve to vastus medialis articular fibres)", "Medial leg to the medial malleolus"],
      spared: ["Posterior knee (add iPACK or sciatic)", "Lateral knee", "Quadriceps strength largely preserved"],
      motor: "Minimal quadriceps weakness (more if proximal or high-volume).",
      three: {
        focus: "lowerR", view: "anterior",
        needle: { a: "acb", from: "lateral" },
        regions: [
          { k: "exp", seg: "leg", side: "R", th: [215, 320] },
          { k: "exp", seg: "thigh", side: "R", t: [0.82, 1], th: [245, 340] },
          { k: "var", seg: "foot", side: "R", th: [235, 300], t: [0, 0.4] }
        ],
        deep: [{ k: "tgt", at: "kneeAnterior" }],
        labels: [
          { x: "Medial leg (saphenous)", k: "exp", a: { seg: "leg", side: "R", t: 0.45, th: 270 } },
          { x: "Knee analgesia (medial/anterior)", k: "tgt", a: "kneeAnterior" },
          { x: "Spared: posterior knee → add iPACK", k: "spared", a: { seg: "thigh", side: "R", t: 0.92, th: 180 } },
          { x: "Needle: mid-thigh", k: "needle", a: "acb" }
        ]
      }
    },
    tips: ["Distal femoral triangle vs true canal: more proximal = more analgesia but more weakness.", "Combine with iPACK for posterior knee pain."],
    pitfalls: ["Injecting within sartorius.", "Arterial puncture — the nerve is tiny, target the artery's lateral side."],
    complications: ["Vascular puncture", "LAST", "Quadriceps weakness with proximal/large-volume spread"],
    pearls: ["Saphenous = largest purely sensory branch of femoral nerve.", "Quadriceps-sparing knee analgesia.", "Roof = sartorius."],
    source: { title: "Ultrasound-Guided Saphenous (Adductor Canal) Nerve Block", url: "https://nysora.com/regional-anesthesia/techniques/ultrasound-guided-saphenous-subsartorius-adductor-canal-nerve-block/" }
  });

  blocks.push({
    id: "ipack",
    name: "iPACK Block",
    short: "iPACK",
    cat: "lower",
    tags: ["Posterior knee", "Motor-sparing", "Infiltration"],
    tagline: "Posterior knee capsule • motor-sparing",
    summary: "Infiltration of the Interspace between the Popliteal Artery and the Capsule of the posterior Knee blocks articular branches to the posterior capsule without affecting tibial or common peroneal motor function.",
    indications: ["Total knee arthroplasty (with adductor canal block)", "ACL reconstruction (posterior pain)"],
    keyInfo: {
      position: ["Supine with knee flexed (or prone)"],
      approach: ["Curvilinear/linear probe transverse in popliteal fossa just above the femoral condyles", "In-plane, medial (anteromedial) → lateral"],
      procedure: ["Femoral shaft and popliteal artery", "Tip between artery and femur", "Infiltrate medial → lateral across posterior femur"],
      volume: "15–20 mL",
      coverage: "Posterior knee capsule (analgesia)"
    },
    anatomy: {
      text: "Articular branches from the tibial nerve (popliteal plexus) and the obturator nerve supply the posterior capsule. They run close to the popliteal vessels on the posterior femur. Injecting between the artery and femur, distal enough to stay away from the tibial nerve, keeps motor function.",
      relations: ["Deep: posterior femur / knee capsule", "Superficial: popliteal artery and vein", "Tibial nerve: superficial and lateral; CPN further lateral", "Medial: semimembranosus/semitendinosus"],
      targets: "Articular branches to the posterior capsule (popliteal plexus)",
      plexus: { type: "lumbosacral", hi: ["KNEE"], zone: "Posterior capsule branches" }
    },
    sono: {
      probe: "Curvilinear 2–5 MHz (or linear)",
      depth: "5–6 cm",
      orientation: "Transverse just proximal to femoral condyles · left = medial, right = lateral",
      image: {
        probe: "curvilinear", depth: 6, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "sm", t: "muscle", l: "Semimembranosus / semitendinosus", d: "Medial hamstrings.", el: [80, 100, 80, 50, 0], lab: [80, 84] },
          { id: "bf", t: "muscle", l: "Biceps femoris", d: "Lateral hamstring.", el: [350, 110, 60, 46, 0], lab: [352, 92] },
          { id: "tn", t: "nerve", e: "honey", l: "Tibial nerve", d: "Superficial and lateral — avoid.", c: [300, 94, 10], lab: [290, 64] },
          { id: "pv", t: "vein", l: "Popliteal vein", d: "Superficial to artery.", el: [278, 126, 16, 10, 0], lab: [310, 138] },
          { id: "pa", t: "artery", l: "Popliteal artery", d: "Inject between it and the femur.", c: [258, 156, 14], lab: [252, 184], key: true },
          { id: "fem", t: "bone", l: "Femur (posterior surface)", d: "Knee capsule on its posterior aspect.", ln: [[60, 226], [160, 220], [260, 222], [360, 230]], lab: [150, 248] },
          { id: "target", t: "space", l: "iPACK interspace", d: "Between popliteal artery and femur.", el: [220, 204, 70, 12, 0], lab: [120, 190], key: true }
        ],
        needles: [{ from: [20, 190], to: [240, 206] }],
        spreads: [{ el: [214, 206, 74, 13, 0] }]
      }
    },
    procedure: {
      position: "Supine with knee flexed, or prone",
      probe: "Curvilinear/linear, transverse in the popliteal fossa at the femoral shaft–condyle junction",
      needle: "22G 80–100 mm",
      approach: "In-plane from the anteromedial side (medial → lateral)",
      steps: [
        "Identify the femoral shaft just above the condyles and the popliteal artery.",
        "Advance from medial toward the space between the artery and the femur.",
        "Inject while withdrawing slowly so LA spreads across the posterior femur."
      ],
      volume: "15–20 mL",
      endpoint: "Band of LA between popliteal artery and femur."
    },
    spread: {
      summary: "Analgesia of the posterior knee capsule with preserved foot motor function.",
      covered: ["Posterior knee capsule (popliteal plexus articular branches)"],
      spared: ["Skin", "Tibial and common peroneal motor function (if placed correctly)"],
      motor: "Motor-sparing; new foot weakness suggests tibial/CPN spread.",
      three: {
        focus: "lowerR", view: "posterior",
        needle: { a: "ipack", from: "medial" },
        regions: [],
        deep: [{ k: "tgt", at: "kneePostCapsule" }],
        labels: [
          { x: "Deep target: posterior knee capsule", k: "tgt", a: "kneePostCapsule" },
          { x: "Foot motor preserved", k: "spared", a: { seg: "leg", side: "R", t: 0.6, th: 180 } },
          { x: "Needle: medial, above condyles", k: "needle", a: "ipack" }
        ]
      }
    },
    tips: ["Stay distal in the fossa (shaft/condyle junction) and deep, close to the femur.", "Pair with an adductor canal block."],
    pitfalls: ["Too proximal/superficial → tibial nerve block (foot weakness).", "Arterial puncture."],
    complications: ["Vascular puncture", "Tibial/peroneal nerve block", "LAST"],
    pearls: ["iPACK = Interspace between Popliteal Artery and Capsule of the posterior Knee.", "Motor-sparing posterior knee analgesia.", "Classic TKA combination: adductor canal + iPACK."],
    source: { title: "NYSORA — iPACK block", url: "https://nysora.com/updates/new-addition-ipack-block/" }
  });

  blocks.push({
    id: "popliteal",
    name: "Popliteal Sciatic Nerve Block",
    short: "Popliteal Sciatic",
    cat: "lower",
    tags: ["Sciatic", "Foot & ankle", "Paraneural sheath"],
    tagline: "Below knee (except medial) • foot & ankle",
    summary: "The sciatic nerve is blocked in the popliteal fossa at/near its division into tibial and common peroneal nerves. Injecting inside the common paraneural (Vloka) sheath gives a rapid, dense block.",
    indications: ["Foot and ankle surgery", "Achilles tendon repair", "Below-knee surgery (with saphenous/adductor canal block)"],
    keyInfo: {
      position: ["Prone, lateral, or supine with leg elevated"],
      approach: ["Linear probe transverse in the popliteal fossa", "In-plane, lateral → medial"],
      procedure: ["Artery, then nerve superficial/lateral to it", "Trace to bifurcation (3–12 cm above crease)", "Tip inside sheath between tibial & CPN"],
      volume: "10–20 mL",
      coverage: "Leg below knee (except medial strip), ankle, foot"
    },
    anatomy: {
      text: "The sciatic nerve divides into the tibial (medial, larger) and common peroneal (lateral) nerves at a variable level, usually 30–120 mm above the popliteal crease. Both are enclosed in a common paraneural sheath from the sciatic origin to beyond the bifurcation; injection within it spreads proximally and distally for a fast, dense block.",
      relations: ["Lateral: biceps femoris (CPN follows it)", "Medial: semimembranosus/semitendinosus", "Deep: popliteal vein, then artery (vein superficial to artery)"],
      targets: "Tibial and common peroneal nerves within the paraneural sheath",
      plexus: { type: "lumbosacral", hi: ["SCI", "TIB", "CPN"], zone: "Sciatic bifurcation" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "2–4 cm",
      orientation: "Transverse in popliteal fossa · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 4, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "sm", t: "muscle", l: "Semimembranosus / semitendinosus", d: "Medial.", el: [70, 96, 70, 52, 0], lab: [70, 80] },
          { id: "bf", t: "muscle", l: "Biceps femoris", d: "Lateral.", el: [334, 92, 70, 50, 0], lab: [340, 76] },
          { id: "sheath", t: "sheath", l: "Paraneural (Vloka) sheath", d: "Common sheath — inject inside it.", el: [226, 106, 48, 26, 0], lab: [226, 150] },
          { id: "tn", t: "nerve", e: "honey", l: "Tibial nerve", d: "Medial, larger.", el: [205, 110, 17, 13, 0], lab: [170, 70], key: true },
          { id: "cpn", t: "nerve", e: "honey", l: "Common peroneal nerve", d: "Lateral.", el: [248, 100, 13, 10, 0], lab: [268, 60], key: true },
          { id: "pv", t: "vein", l: "Popliteal vein", d: "Superficial to artery.", el: [212, 180, 15, 9, 0], lab: [252, 184] },
          { id: "pa", t: "artery", l: "Popliteal artery", d: "Deepest vessel.", c: [200, 206, 13], lab: [160, 222] },
          { id: "fem", t: "bone", l: "Femur", d: "Deep.", ln: [[80, 268], [200, 262], [320, 266]], lab: [290, 288] }
        ],
        needles: [{ from: [398, 60], to: [228, 108] }],
        spreads: [{ el: [226, 106, 40, 20, 0] }]
      },
      real: {
        image: "assets/regional/popliteal-usg.jpg",
        source: "KnockoutNotes / user-provided",
        orientation: "Transverse in the popliteal fossa (medial → lateral)",
        probe: "Linear",
        labels: [
          { id: "tnr5", text: "Tibial nerve", type: "nerve", x: 44, y: 28 },
          { id: "cpnr5", text: "Common peroneal nerve", type: "nerve", x: 51, y: 25 },
          { id: "pvr5", text: "Popliteal vein", type: "vein", x: 48, y: 50 },
          { id: "par5", text: "Popliteal artery", type: "artery", x: 42, y: 70 }
        ],
        needleOverlay: { from: [92, 24], to: [47, 30], approach: "in-plane", side: "lateral", target: "within the paraneural sheath, between tibial and common peroneal nerves" },
        spreadOverlay: [{ shape: "ellipse", x: 47, y: 32, rx: 11, ry: 9, variable: false, note: "LA spread within the paraneural sheath" }]
      }
    },
    procedure: {
      position: "Prone (or lateral, or supine with the leg on a support)",
      probe: "Linear, transverse in the popliteal fossa 5–10 cm above the crease",
      needle: "22G 50–80 mm",
      approach: "In-plane, lateral → medial (or out-of-plane)",
      steps: [
        "Find the popliteal artery; the nerve lies superficial and lateral to it.",
        "Scan proximally/distally to the bifurcation (usually 30–120 mm above the crease).",
        "Enter the paraneural sheath between the tibial and common peroneal nerves.",
        "Inject: LA separates and surrounds both nerves within the sheath."
      ],
      volume: "10–20 mL",
      endpoint: "Spread within the sheath around both nerves ('donut')."
    },
    spread: {
      summary: "Leg below the knee except the medial strip (saphenous), the ankle and the whole foot except the medial arch.",
      covered: ["Posterior and lateral leg", "Ankle and foot (except medial arch)", "Tibia/fibula and ankle joint"],
      spared: ["Medial leg/ankle (saphenous) — add adductor canal/saphenous block", "Posterior thigh (posterior femoral cutaneous nerve) — thigh tourniquet needs more"],
      motor: "Foot drop and plantarflexion weakness — protect the heel; crutches.",
      three: {
        focus: "lowerR", view: "posterior",
        needle: { a: "pop", from: "lateral" },
        regions: [
          { k: "exp", seg: "leg", side: "R", th: [0, 232] },
          { k: "exp", seg: "foot", side: "R" },
          { k: "none", seg: "foot", side: "R", th: [238, 302], t: [0, 0.45] }
        ],
        labels: [
          { x: "Posterior & lateral leg, foot", k: "exp", a: { seg: "leg", side: "R", t: 0.5, th: 150 } },
          { x: "Spared: medial leg (saphenous)", k: "spared", a: { seg: "leg", side: "R", t: 0.5, th: 270 } },
          { x: "Spared: posterior thigh (PFCN)", k: "spared", a: { seg: "thigh", side: "R", t: 0.4, th: 180 } },
          { x: "Needle: popliteal fossa", k: "needle", a: "pop" }
        ]
      }
    },
    tips: ["'Seesaw' sign: tibial and CPN move alternately with ankle dorsiflexion/plantarflexion.", "Sub-paraneural injection speeds onset.", "Add a saphenous block for medial ankle surgery."],
    pitfalls: ["Injecting outside the sheath → slow, patchy block.", "Intraneural injection — watch for nerve swelling."],
    complications: ["Nerve injury", "Vascular puncture", "Pressure injury to insensate heel/foot"],
    pearls: ["Bifurcation 30–120 mm above the popliteal crease.", "Common paraneural (Vloka) sheath.", "Saphenous (femoral) must be added for medial leg."],
    source: { title: "Ultrasound-Guided Popliteal Sciatic Nerve Block", url: "https://www.nysora.com/topics/regional-anesthesia-for-specific-surgical-procedures/lower-extremity-regional-anesthesia-for-specific-surgical-procedures/foot-and-anckle/ultrasound-guided-popliteal-sciatic-block/" }
  });

  blocks.push({
    id: "ankle",
    name: "Ankle Block",
    short: "Ankle Block",
    cat: "lower",
    tags: ["5 nerves", "Foot surgery"],
    tagline: "Whole foot • five nerves",
    summary: "Five nerves: two deep (tibial and deep peroneal) and three superficial (superficial peroneal, sural and saphenous). All are sciatic branches except the saphenous, which comes from the femoral nerve.",
    indications: ["Forefoot/midfoot surgery (bunion, toe amputation, debridement)", "Foot trauma"],
    keyInfo: {
      position: ["Supine, foot on a support, ankle accessible all round"],
      approach: ["Ultrasound for the tibial (± deep peroneal) nerve", "Subcutaneous infiltration for the superficial nerves"],
      procedure: ["Tibial: behind medial malleolus, posterior to posterior tibial artery", "Deep peroneal: lateral to anterior tibial artery", "Superficial ring: SPN, sural, saphenous"],
      volume: "~5 mL per deep nerve; 3–5 mL per superficial",
      coverage: "Whole foot"
    },
    anatomy: {
      text: "Behind the medial malleolus the structures run (anterior → posterior): tibialis posterior tendon, flexor digitorum longus, posterior tibial artery with veins, tibial nerve, flexor hallucis longus ('Tom, Dick And Very Nervous Harry'). The deep peroneal nerve lies lateral to the anterior tibial artery (dorsalis pedis) at the ankle; the superficial peroneal, sural and saphenous nerves are subcutaneous.",
      relations: ["Tibial nerve: posterior to posterior tibial artery, deep to flexor retinaculum", "Deep peroneal: lateral to anterior tibial/dorsalis pedis artery", "Sural: with small saphenous vein behind lateral malleolus", "Saphenous: with great saphenous vein anterior to medial malleolus"],
      targets: "Tibial, deep peroneal, superficial peroneal, sural, saphenous",
      plexus: { type: "lumbosacral", hi: ["TIB", "DPN", "SPN", "SUR", "SAPH"], zone: "Terminal branches at ankle" }
    },
    sono: {
      probe: "Linear 10–18 MHz",
      depth: "1–2 cm",
      orientation: "Tibial nerve view: transverse behind medial malleolus · left = anterior, right = posterior",
      image: {
        probe: "linear", depth: 2, left: "ANTERIOR", right: "POSTERIOR",
        s: [
          { id: "fr", t: "fascia", l: "Flexor retinaculum", d: "Roof of the tarsal tunnel.", ln: [[0, 70], [140, 76], [270, 70], [400, 76]], lab: [320, 58] },
          { id: "mm", t: "bone", l: "Medial malleolus", d: "Anterior bony landmark.", ln: [[0, 150], [40, 136], [70, 150]], lab: [30, 176] },
          { id: "tp", t: "tendon", l: "Tibialis posterior", d: "'Tom'.", el: [100, 118, 18, 11, 0], lab: [96, 96] },
          { id: "fdl", t: "tendon", l: "Flexor digitorum longus", d: "'Dick'.", el: [148, 128, 14, 9, 0], lab: [150, 156] },
          { id: "pta", t: "artery", l: "Posterior tibial artery", d: "'And' — nerve sits posterior to it.", c: [196, 124, 9], lab: [196, 100] },
          { id: "vv", t: "vein", l: "Venae comitantes", d: "'Very'.", el: [182, 140, 7, 5, 0] },
          { id: "tib", t: "nerve", e: "honey", l: "Tibial nerve", d: "'Nervous' — honeycomb, posterior to artery.", el: [238, 128, 15, 11, 0], lab: [246, 162], key: true },
          { id: "fhl", t: "muscle", l: "Flexor hallucis longus", d: "'Harry' — deep/posterior.", el: [306, 176, 60, 30, 0], lab: [320, 186] }
        ],
        needles: [{ from: [2, 44], to: [230, 136] }],
        spreads: [{ el: [236, 128, 26, 17, 0] }]
      }
    },
    procedure: {
      position: "Supine, calf on a support so the ankle is free",
      probe: "Linear high-frequency",
      needle: "25G for infiltration; 22G 50 mm for deep nerves",
      approach: "Deep nerves under ultrasound (in- or out-of-plane); superficial nerves by subcutaneous ring",
      steps: [
        "Tibial: behind the medial malleolus, find the posterior tibial artery; inject around the nerve posterior to it.",
        "Deep peroneal: anterior ankle, lateral to the anterior tibial/dorsalis pedis artery, deep to extensor retinaculum.",
        "Superficial peroneal: subcutaneous ridge from the anterior tibia toward the lateral malleolus.",
        "Sural: subcutaneous between lateral malleolus and Achilles, beside the small saphenous vein.",
        "Saphenous: subcutaneous anterior to the medial malleolus, beside the great saphenous vein."
      ],
      volume: "Tibial ~5 mL, deep peroneal ~3–5 mL, superficial ring ~3–5 mL each",
      endpoint: "Circumferential spread around each deep nerve; subcutaneous wheals for superficial nerves."
    },
    spread: {
      summary: "The whole foot. Each nerve has a distinct territory (tap the legend on the 3D model).",
      covered: ["Sole and heel — tibial", "First web space — deep peroneal", "Dorsum of foot — superficial peroneal", "Lateral border — sural", "Medial ankle/arch — saphenous"],
      spared: ["Leg above the ankle", "Ankle tourniquet above malleoli may be uncomfortable"],
      motor: "Intrinsic foot muscles only — patients can usually walk with care.",
      three: {
        focus: "footR", view: [0.55, 0.35, 0.75],
        needle: { a: "ankle", from: "anterior" },
        regions: [
          { k: "nerve", n: "Tibial — sole & heel", col: "#22d3ee", seg: "foot", side: "R", th: [128, 232] },
          { k: "nerve", n: "Sural — lateral border", col: "#a78bfa", seg: "foot", side: "R", th: [52, 128], t: [0, 0.9] },
          { k: "nerve", n: "Saphenous — medial ankle/arch", col: "#34d399", seg: "foot", side: "R", th: [232, 305], t: [0, 0.5] },
          { k: "nerve", n: "Saphenous — medial ankle/arch", col: "#34d399", seg: "leg", side: "R", th: [235, 305], t: [0.86, 1] },
          { k: "nerve", n: "Superficial peroneal — dorsum", col: "#fbbf24", seg: "foot", side: "R", th: [300, 55], t: [0.2, 1] },
          { k: "nerve", n: "Deep peroneal — 1st web space", col: "#fb7185", seg: "foot", side: "R", th: [320, 30], t: [0.72, 1], u: [0.1, 0.4] }
        ],
        labels: [
          { x: "Tibial: sole", k: "nerve", a: { seg: "foot", side: "R", t: 0.5, th: 180 } },
          { x: "Deep peroneal: 1st web", k: "nerve", a: { seg: "foot", side: "R", t: 0.86, th: 350 } },
          { x: "Superficial peroneal: dorsum", k: "nerve", a: { seg: "foot", side: "R", t: 0.55, th: 20 } },
          { x: "Sural: lateral border", k: "nerve", a: { seg: "foot", side: "R", t: 0.45, th: 90 } },
          { x: "Saphenous: medial ankle", k: "nerve", a: { seg: "foot", side: "R", t: 0.2, th: 270 } },
          { x: "Needle: behind medial malleolus (tibial)", k: "needle", a: "ankle" }
        ]
      }
    },
    tips: ["Ultrasound for the tibial nerve improves success — it's the most important (sole).", "Use volumes small enough to avoid tissue tension at the ankle."],
    pitfalls: ["Missing the tibial nerve → sole/heel sparing.", "Injecting into tendons or vessels in the tarsal tunnel."],
    complications: ["Vascular puncture", "Nerve injury", "Persistent paraesthesia (rare)"],
    pearls: [
      "Two deep (tibial, deep peroneal), three superficial (SPN, sural, saphenous).",
      "All sciatic branches except the saphenous (femoral).",
      "Tarsal tunnel order: 'Tom, Dick And Very Nervous Harry'.",
      "Sole = tibial; 1st web = deep peroneal; dorsum = superficial peroneal."
    ],
    source: { title: "Ultrasound-Guided Ankle Nerve Block", url: "https://nysora.com/regional-anesthesia/techniques/ultrasound-guided-ankle-block/" }
  });

  /* ======================================================================
     CHEST WALL & PARASPINAL
     ====================================================================== */

  blocks.push({
    id: "pecs",
    name: "PECS I & II Blocks",
    short: "PECS I & II",
    cat: "chest",
    tags: ["Fascial plane", "Breast surgery"],
    tagline: "Breast & anterior chest wall",
    summary: "PECS I places ~10 mL between pectoralis major and minor (medial and lateral pectoral nerves — no skin). PECS II adds 15–20 mL between pectoralis minor and serratus anterior at the 3rd–4th rib to reach the lateral cutaneous branches of T2–T4, the long thoracic and intercostobrachial nerves.",
    indications: ["Breast surgery — mastectomy, reconstruction, expanders", "Pacemaker/ICD insertion", "Anterolateral chest wall surgery"],
    keyInfo: {
      position: ["Supine, arm abducted 90°"],
      approach: ["Linear probe below lateral clavicle, then inferolaterally to 3rd–4th rib", "In-plane, medial → lateral"],
      procedure: ["PECS I: between PMaj & PMin at the pectoral branch of the thoracoacromial artery", "PECS II: deeper, between PMin & serratus anterior", "Watch each plane open"],
      volume: "PECS I 10 mL + PECS II 15–20 mL",
      coverage: "Pectorals (I); lateral chest & axilla T2–T4 (II)"
    },
    anatomy: {
      text: "The medial and lateral pectoral nerves run in the plane between pectoralis major and minor alongside the pectoral branch of the thoracoacromial artery — motor/proprioceptive only. The lateral cutaneous branches of the intercostal nerves pierce the serratus anterior in the mid-axillary line and supply the lateral chest and breast. The anterior cutaneous branches (medial breast, parasternal) are not reached.",
      relations: ["PECS I plane: PMaj / PMin (pectoral branch of thoracoacromial artery)", "PECS II plane: PMin / serratus anterior over ribs 3–4", "Deep: intercostal muscles and pleura"],
      targets: "Medial & lateral pectoral nerves; lateral cutaneous branches T2–T4(6), long thoracic, intercostobrachial"
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "3–4 cm",
      orientation: "Oblique at 3rd–4th rib, anterior axillary line · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 4, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "pmaj", t: "muscle", l: "Pectoralis major", d: "Superficial.", p: [[0, 14], [400, 14], [400, 70], [0, 80]], lab: [60, 40] },
          { id: "tca", t: "artery", l: "Pectoral br. thoracoacromial a.", d: "Landmark for the PECS I plane.", c: [150, 86, 5], lab: [118, 108], key: true },
          { id: "pmin", t: "muscle", l: "Pectoralis minor", d: "Middle layer.", p: [[0, 96], [400, 88], [400, 140], [0, 150]], lab: [330, 116] },
          { id: "sa", t: "muscle", l: "Serratus anterior", d: "Deep layer over the ribs.", p: [[0, 166], [400, 158], [400, 198], [0, 208]], lab: [330, 180] },
          { id: "r3", t: "bone", l: "3rd rib", d: "Rounded rib with shadow.", ln: [[40, 234], [90, 224], [150, 236]], lab: [90, 252] },
          { id: "r4", t: "bone", l: "4th rib", d: "Rounded rib with shadow.", ln: [[250, 232], [300, 222], [360, 234]], lab: [304, 252] },
          { id: "pl", t: "pleura", l: "Pleura", d: "Between and deep to ribs.", ln: [[150, 246], [200, 250], [250, 246]], lab: [200, 272] }
        ],
        needles: [{ from: [2, 40], to: [176, 88] }, { from: [2, 60], to: [252, 158] }],
        spreads: [{ el: [184, 88, 74, 8, -1] }, { el: [262, 156, 84, 9, -1] }]
      }
    },
    procedure: {
      position: "Supine, arm abducted 90°",
      probe: "Linear, under the lateral third of the clavicle, then moved inferolaterally to the 3rd–4th rib",
      needle: "22G 50–80 mm",
      approach: "In-plane, medial → lateral",
      steps: [
        "Identify PMaj, PMin and the pectoral branch of the thoracoacromial artery between them (Doppler).",
        "PECS I: inject 10 mL in the plane between PMaj and PMin next to the artery.",
        "Move to the 3rd–4th rib toward the axilla; identify PMin over serratus anterior.",
        "PECS II: advance to the plane between PMin and serratus anterior; inject 15–20 mL."
      ],
      volume: "PECS I 10 mL; PECS II 15–20 mL",
      endpoint: "Visible hydrodissection of each fascial plane."
    },
    spread: {
      summary: "PECS I blocks the pectoral nerves (no skin). PECS II adds the lateral chest wall and axilla (T2–T4, variably to T6).",
      covered: ["Pectoralis major/minor (PECS I)", "Lateral chest wall & axilla T2–T4 (± T6) (PECS II)", "Long thoracic, intercostobrachial (variable thoracodorsal)"],
      spared: ["Medial breast/parasternal (anterior cutaneous branches) — add parasternal/PIFB block", "Pleura/deep chest wall"],
      motor: "No significant functional motor block.",
      three: {
        focus: "chestR", view: [-0.55, 0.2, 0.82], pose: "abducted",
        needle: { a: "pecs", from: "medial" },
        regions: [
          { k: "exp", seg: "trunk", side: "R", derm: ["T2", "T4"], th: [48, 122] },
          { k: "var", seg: "trunk", side: "R", derm: ["T5", "T6"], th: [48, 122] },
          { k: "exp", seg: "upperArm", side: "R", t: [0, 0.3], th: [235, 315] }
        ],
        deep: [{ k: "tgt", at: "pectorals" }],
        labels: [
          { x: "PECS I: pectoral muscles (no skin)", k: "tgt", a: "pectorals" },
          { x: "PECS II: lateral chest & axilla T2–T4", k: "exp", a: { seg: "trunk", side: "R", y: 1.35, th: 88 } },
          { x: "Spared: medial breast (anterior cutaneous)", k: "spared", a: { seg: "trunk", side: "R", y: 1.32, th: 12 } },
          { x: "Needle: 3rd–4th rib", k: "needle", a: "pecs" }
        ]
      }
    },
    tips: ["Doppler the pectoral branch of the thoracoacromial artery — it marks the PECS I plane.", "Count ribs from the clavicle/2nd rib."],
    pitfalls: ["Injecting within muscle rather than the plane.", "Expecting medial breast coverage."],
    complications: ["Pneumothorax (needle beyond ribs)", "Vascular puncture", "LAST (bilateral/large volumes)"],
    pearls: ["PECS I = pectoral nerves only (no cutaneous).", "PECS II adds lateral cutaneous branches T2–T4.", "Anterior cutaneous branches are not covered."],
    source: { title: "Pectoralis and Serratus Plane Blocks", url: "https://www.nysora.com/topics/regional-anesthesia-for-specific-surgical-procedures/thorax/pectoralis-serratus-plane-blocks/" }
  });

  blocks.push({
    id: "serratus",
    name: "Serratus Anterior Plane Block",
    short: "Serratus Anterior",
    cat: "chest",
    tags: ["Fascial plane", "Rib fractures"],
    tagline: "Lateral hemithorax • T2–T9",
    summary: "LA in the plane superficial (latissimus dorsi / serratus anterior) or deep (serratus anterior / ribs) to serratus anterior at the 4th–5th rib in the mid-axillary line blocks the lateral cutaneous branches of the T2–T9 intercostal nerves.",
    indications: ["Anterolateral rib fractures", "Breast surgery", "VATS/thoracotomy analgesia, chest drains"],
    keyInfo: {
      position: ["Supine or lateral, arm abducted"],
      approach: ["Linear probe at 4th–5th rib, mid-axillary line", "In-plane"],
      procedure: ["Latissimus dorsi, serratus anterior, rib, pleura", "Thoracodorsal artery marks superficial plane", "Superficial (LD/SA) or deep (SA/rib) injection"],
      volume: "20–30 mL (≈0.4 mL/kg)",
      coverage: "Lateral chest wall T2–T9"
    },
    anatomy: {
      text: "In the mid-axillary line at the 5th rib, the superficial plane lies between latissimus dorsi and serratus anterior (thoracodorsal artery and nerve run here), and the deep plane between serratus anterior and the ribs/external intercostals. The lateral cutaneous branches of the intercostal nerves pass through these planes.",
      relations: ["Superficial: latissimus dorsi", "Middle: serratus anterior", "Deep: ribs, intercostal muscles, pleura", "Landmark: thoracodorsal artery in the superficial plane"],
      targets: "Lateral cutaneous branches of T2–T9 intercostal nerves"
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "3 cm",
      orientation: "Sagittal/coronal in mid-axillary line · left = cephalad, right = caudad",
      image: {
        probe: "linear", depth: 3, left: "CEPHALAD", right: "CAUDAD",
        s: [
          { id: "ld", t: "muscle", l: "Latissimus dorsi", d: "Superficial.", p: [[0, 18], [400, 18], [400, 70], [0, 76]], lab: [60, 44] },
          { id: "tda", t: "artery", l: "Thoracodorsal artery", d: "Marks the superficial plane.", c: [150, 82, 5], lab: [120, 104] },
          { id: "sa", t: "muscle", l: "Serratus anterior", d: "Target muscle.", p: [[0, 88], [400, 84], [400, 136], [0, 142]], lab: [330, 110], key: true },
          { id: "r4", t: "bone", l: "4th rib", d: "Rib with shadow.", ln: [[40, 172], [90, 162], [140, 172]], lab: [90, 196] },
          { id: "r5", t: "bone", l: "5th rib", d: "Rib with shadow.", ln: [[250, 170], [300, 160], [350, 170]], lab: [300, 196] },
          { id: "ic", t: "muscle", l: "Intercostal muscles", d: "Between ribs.", p: [[140, 160], [250, 158], [250, 186], [140, 188]], lab: [196, 150] },
          { id: "pl", t: "pleura", l: "Pleura", d: "Deep to ribs/intercostals.", ln: [[140, 206], [196, 210], [250, 206]], lab: [196, 234] }
        ],
        needles: [{ from: [2, 44], to: [184, 84] }],
        spreads: [{ el: [210, 84, 118, 8, -1] }]
      }
    },
    procedure: {
      position: "Supine or lateral, arm abducted",
      probe: "Linear at the 4th–5th rib, mid-axillary line",
      needle: "22G 50–80 mm",
      approach: "In-plane (cephalad → caudad or reverse)",
      steps: [
        "Count ribs to the 4th–5th in the mid-axillary line.",
        "Identify latissimus dorsi (superficial) and serratus anterior over the rib.",
        "Doppler the thoracodorsal artery (superficial plane).",
        "Inject into the superficial (LD/SA) or deep (SA/rib) plane and watch it open."
      ],
      volume: "20–30 mL (≈0.4 mL/kg)",
      endpoint: "Linear hydrodissection of the chosen plane."
    },
    spread: {
      summary: "Lateral hemithorax T2–T9. Anterior cutaneous branches and dorsal rami are not blocked.",
      covered: ["Lateral chest wall T2–T9"],
      spared: ["Anterior chest (anterior cutaneous branches)", "Posterior chest (dorsal rami)", "Visceral/pleural pain"],
      motor: "None clinically relevant.",
      three: {
        focus: "chestR", view: [-0.92, 0.12, 0.38], pose: "abducted",
        needle: { a: "sap", from: "cranial" },
        regions: [
          { k: "exp", seg: "trunk", side: "R", derm: ["T2", "T9"], th: [55, 125] },
          { k: "var", seg: "trunk", side: "R", derm: ["T2", "T9"], th: [32, 55] },
          { k: "var", seg: "trunk", side: "R", derm: ["T2", "T9"], th: [125, 145] }
        ],
        labels: [
          { x: "Lateral hemithorax T2–T9", k: "exp", a: { seg: "trunk", side: "R", y: 1.24, th: 90 } },
          { x: "Spared: anterior (anterior cutaneous)", k: "spared", a: { seg: "trunk", side: "R", y: 1.2, th: 12 } },
          { x: "Spared: posterior (dorsal rami)", k: "spared", a: { seg: "trunk", side: "R", y: 1.2, th: 168 } },
          { x: "Needle: 5th rib, mid-axillary", k: "needle", a: "sap" }
        ]
      }
    },
    tips: ["Superficial plane injection spread wider/longer in the original volunteer study; deep plane is often technically easier.", "Useful as a catheter for multiple rib fractures."],
    pitfalls: ["Injecting within serratus anterior.", "Expecting anterior or posterior chest coverage."],
    complications: ["Pneumothorax", "LAST (large volumes)", "Vascular puncture"],
    pearls: ["Lateral cutaneous branches T2–T9.", "Thoracodorsal artery = superficial plane landmark.", "Does not cover anterior cutaneous branches or dorsal rami."],
    source: { title: "Pectoralis and Serratus Plane Blocks", url: "https://nysora.com/regional-anesthesia/techniques/pectoralis-serratus-plane-blocks/" }
  });

  blocks.push({
    id: "esp",
    name: "Erector Spinae Plane Block",
    short: "Erector Spinae (ESP)",
    cat: "chest",
    tags: ["Fascial plane", "Paraspinal", "Simple & safe"],
    tagline: "Thoracic / abdominal analgesia • paraspinal",
    summary: "LA deposited deep to erector spinae on the transverse process spreads craniocaudally over several levels. It consistently blocks dorsal rami (posterior chest wall); spread to ventral rami/paravertebral space — and hence lateral/anterior coverage — is variable.",
    indications: ["Rib fractures", "Thoracic and breast surgery", "Spine surgery", "Abdominal analgesia at lower thoracic levels", "Chronic thoracic pain"],
    keyInfo: {
      position: ["Sitting, lateral or prone"],
      approach: ["Linear probe parasagittal ~3 cm lateral to midline (e.g., T5)", "In-plane, cranial → caudal"],
      procedure: ["Square, flat transverse-process shadows", "Layers: trapezius, rhomboid (T5), erector spinae", "Contact TP; inject deep to erector spinae"],
      volume: "20–30 mL",
      coverage: "Ipsilateral posterior hemithorax (consistent); lateral/anterior variable"
    },
    anatomy: {
      text: "Transverse processes appear as flat, squared-off acoustic shadows medial to the rounded ribs. The target plane lies deep to the erector spinae and superficial to the transverse processes and intertransverse tissues. The transverse process acts as a backstop, keeping the needle away from the pleura.",
      relations: ["Superficial: trapezius, rhomboid major (at T5), erector spinae", "Deep: transverse process, intertransverse ligaments, then paravertebral space", "Lateral: ribs with pleura beneath"],
      targets: "Dorsal rami (consistent) ± ventral rami via paravertebral spread (variable)"
    },
    sono: {
      probe: "Linear 6–13 MHz (curvilinear if deep)",
      depth: "3–5 cm",
      orientation: "Parasagittal 3 cm lateral to spinous processes · left = cranial, right = caudal",
      image: {
        probe: "linear", depth: 5, left: "CRANIAL", right: "CAUDAL",
        s: [
          { id: "trap", t: "muscle", l: "Trapezius", d: "Superficial.", p: [[0, 20], [400, 20], [400, 54], [0, 60]], lab: [60, 38] },
          { id: "rh", t: "muscle", l: "Rhomboid major", d: "Present at upper thoracic levels.", p: [[0, 62], [400, 58], [400, 90], [0, 96]], lab: [330, 76] },
          { id: "es", t: "muscle", l: "Erector spinae", d: "Inject deep to it.", p: [[0, 100], [400, 94], [400, 176], [0, 182]], lab: [60, 140], key: true },
          { id: "tp4", t: "bone", l: "T4 transverse process", d: "Flat, square shadow.", ln: [[40, 192], [108, 190]], lab: [74, 214] },
          { id: "tp5", t: "bone", l: "T5 transverse process", d: "Target — contact bone here.", ln: [[168, 190], [238, 188]], lab: [204, 214], key: true },
          { id: "tp6", t: "bone", l: "T6 transverse process", d: "Flat, square shadow.", ln: [[298, 188], [366, 186]], lab: [334, 214] }
        ],
        needles: [{ from: [2, 30], to: [204, 186] }],
        spreads: [{ el: [204, 183, 176, 8, -0.5] }]
      }
    },
    procedure: {
      position: "Sitting, lateral or prone",
      probe: "Linear, parasagittal ~3 cm lateral to the spinous process at the target level",
      needle: "22G 50–80 mm (Tuohy if catheter)",
      approach: "In-plane, cranial → caudal",
      steps: [
        "Count to the level; slide from the rib (rounded, pleura beneath) medially to the flat, square transverse process.",
        "Identify trapezius, rhomboid (upper thoracic) and erector spinae over the TP.",
        "Advance until the tip contacts the TP.",
        "Inject deep to erector spinae: a linear craniocaudal spread lifts the muscle off the TP."
      ],
      volume: "20–30 mL",
      endpoint: "Linear spread deep to erector spinae over several TPs."
    },
    spread: {
      summary: "Consistent ipsilateral posterior hemithorax (dorsal rami) around the injection level; lateral and anterior spread is variable and volume-dependent.",
      covered: ["Posterior hemithorax (dorsal rami) — consistent", "Several dermatomes around the level (volume-dependent)"],
      spared: ["Lateral/anterior chest in many patients (volunteer data)", "Contralateral side"],
      motor: "None.",
      three: {
        focus: "backR", view: "posterior",
        needle: { a: "esp", from: "cranial" },
        variants: [
          {
            id: "t5", label: "T5 (thoracic / breast)",
            regions: [
              { k: "exp", seg: "trunk", side: "R", derm: ["T3", "T8"], th: [132, 180] },
              { k: "var", seg: "trunk", side: "R", derm: ["T3", "T8"], th: [30, 132] }
            ]
          },
          {
            id: "t8", label: "T8 (upper abdominal)",
            needle: { a: "espLow", from: "cranial" },
            regions: [
              { k: "exp", seg: "trunk", side: "R", derm: ["T6", "T11"], th: [132, 180] },
              { k: "var", seg: "trunk", side: "R", derm: ["T6", "T11"], th: [30, 132] }
            ]
          }
        ],
        labels: [
          { x: "Posterior hemithorax (dorsal rami)", k: "exp", a: { seg: "trunk", side: "R", y: 1.3, th: 160 } },
          { x: "Variable: lateral / anterior", k: "var", a: { seg: "trunk", side: "R", y: 1.26, th: 85 } },
          { x: "Needle: transverse process", k: "needle", a: "esp" }
        ]
      }
    },
    tips: ["Distinguish TP (flat, square, medial) from rib (rounded, lateral, pleura beneath).", "The TP is your safety backstop — keep contact.", "Catheters work well for multiple rib fractures."],
    pitfalls: ["Injecting into erector spinae (intramuscular) — look for linear spread.", "Too lateral → rib/pleura."],
    complications: ["Pneumothorax (rare)", "LAST (bilateral/large volumes)", "Occasional motor weakness at lumbar levels"],
    pearls: ["TP vs rib: TP flat/square & medial; rib rounded & lateral with pleura beneath.", "Mechanism debated: dorsal rami consistent; paravertebral/epidural spread variable.", "Volunteer study: sensory loss mainly on the ipsilateral posterior thorax.", "Technically simple and relatively safe."],
    source: { title: "Erector Spinae Plane Block", url: "https://nysora.com/erector-spinae-plane-block/" }
  });

  blocks.push({
    id: "tpvb",
    name: "Thoracic Paravertebral Block",
    short: "Thoracic Paravertebral",
    cat: "chest",
    tags: ["Somatic + sympathetic", "Unilateral"],
    tagline: "Unilateral segmental somatic + sympathetic",
    summary: "Injection into the wedge-shaped paravertebral space produces ipsilateral, segmental somatic and sympathetic block over several contiguous thoracic dermatomes.",
    indications: ["Thoracotomy / VATS", "Breast surgery", "Rib fractures", "Nephrectomy (lower levels)"],
    keyInfo: {
      position: ["Sitting or lateral"],
      approach: ["Linear probe transverse (lateral → medial) or parasagittal between TPs", "In-plane"],
      procedure: ["TP, superior costotransverse ligament (SCTL), pleura", "Advance through SCTL into the space above pleura", "Pleura pushed anteriorly = correct"],
      volume: "15–20 mL single; or 3–5 mL per level",
      coverage: "Ipsilateral hemithorax — anterior, lateral and posterior"
    },
    anatomy: {
      text: "The thoracic paravertebral space is a wedge: parietal pleura anterolaterally, the vertebral body/disc/intervertebral foramen medially, and the transverse process with the superior costotransverse ligament posteriorly. It contains the spinal nerves (ventral and dorsal rami), rami communicantes, the sympathetic chain, intercostal vessels and fat. The SCTL does not act as a barrier to spread.",
      relations: ["Posterior: SCTL and transverse process", "Anterolateral: parietal pleura", "Medial: vertebral body, disc, intervertebral foramen", "Lateral: continuous with the intercostal space"],
      targets: "Spinal nerves (ventral + dorsal rami) and sympathetic chain"
    },
    sono: {
      probe: "Linear 6–13 MHz",
      depth: "4–6 cm",
      orientation: "Transverse, lateral → medial view · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 5, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "es", t: "muscle", l: "Erector spinae / paraspinal muscles", d: "Superficial.", p: [[0, 20], [400, 20], [400, 110], [0, 120]], lab: [70, 70] },
          { id: "tp", t: "bone", l: "Transverse process", d: "Medial bony landmark.", ln: [[30, 150], [150, 146]], lab: [70, 176] },
          { id: "sctl", t: "ligament", l: "SCTL / internal intercostal membrane", d: "Posterior boundary — pass through it.", ln: [[150, 150], [240, 170], [360, 196]], lab: [300, 150], key: true },
          { id: "pvs", t: "space", l: "Paravertebral space", d: "Wedge between SCTL and pleura.", p: [[152, 160], [340, 206], [170, 204]], lab: [206, 232], key: true },
          { id: "pl", t: "pleura", l: "Pleura", d: "Anterolateral boundary — displaced by correct injection.", ln: [[160, 208], [260, 214], [400, 226]], lab: [340, 246] }
        ],
        needles: [{ from: [398, 70], to: [226, 190] }],
        spreads: [{ el: [218, 192, 52, 11, 8] }]
      }
    },
    procedure: {
      position: "Sitting or lateral decubitus",
      probe: "Linear, transverse at the chosen level (or parasagittal between TPs)",
      needle: "22G 80 mm (Tuohy for catheter)",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify the transverse process, the SCTL/internal intercostal membrane and the pleura.",
        "Advance through the SCTL so the tip sits above the pleura in the paravertebral wedge.",
        "Inject: anterior displacement of the pleura confirms correct placement.",
        "Repeat at additional levels if a wide band is required."
      ],
      volume: "15–20 mL at one level (spreads over several segments), or 3–5 mL per level",
      endpoint: "Pleura pushed anteriorly; spread within the wedge."
    },
    spread: {
      summary: "Ipsilateral segmental somatic (anterior, lateral and posterior) and sympathetic block around the injection level.",
      covered: ["Ipsilateral hemithorax dermatomes around the level (including anterior cutaneous)", "Sympathetic block (visceral analgesia)"],
      spared: ["Contralateral side (unless epidural spread)"],
      motor: "Intercostal muscles only; hypotension from sympathetic block.",
      three: {
        focus: "backR", view: [-0.7, 0.1, -0.7],
        needle: { a: "tpvb", from: "lateral" },
        regions: [
          { k: "exp", seg: "trunk", side: "R", derm: ["T3", "T6"], th: [0, 180] },
          { k: "var", seg: "trunk", side: "R", derm: ["T2", "T2"], th: [0, 180] },
          { k: "var", seg: "trunk", side: "R", derm: ["T7", "T7"], th: [0, 180] }
        ],
        labels: [
          { x: "Ipsilateral band: anterior → posterior", k: "exp", a: { seg: "trunk", side: "R", y: 1.32, th: 110 } },
          { x: "Sympathetic block → hypotension", k: "eff", a: { seg: "trunk", side: "R", y: 1.26, th: 40 } },
          { x: "Needle: paravertebral (T4)", k: "needle", a: "tpvb" }
        ]
      }
    },
    tips: ["Pleural depression on injection is the key confirmation.", "Multiple-level injections give a more predictable band than one large injection."],
    pitfalls: ["Needle too deep → pneumothorax.", "Medial angulation → epidural/intrathecal spread."],
    complications: ["Pneumothorax", "Hypotension", "Epidural or intrathecal spread", "Vascular puncture, LAST", "Bilateral spread"],
    pearls: ["Wedge boundaries: SCTL/TP (posterior), pleura (anterolateral), vertebral body/foramen (medial).", "Unilateral segmental somatic + sympathetic block.", "Pleura pushed down = correct injection."],
    source: { title: "Ultrasound-Guided Thoracic Paravertebral Block", url: "https://nysora.com/pain-management/ultrasound-guided-thoracic-paravertebral-block/" }
  });

  /* ======================================================================
     ABDOMINAL WALL
     ====================================================================== */

  blocks.push({
    id: "tap",
    name: "Transversus Abdominis Plane (TAP) Block",
    short: "TAP",
    cat: "abdo",
    tags: ["Fascial plane", "Somatic only", "Bilateral"],
    tagline: "Anterior abdominal wall • somatic only",
    summary: "LA between the internal oblique and transversus abdominis blocks the thoracolumbar nerves in the TAP. The lateral approach (mid-axillary line) covers T10–T12; the subcostal approach covers T6–T9. Abdominal wall (somatic) analgesia only — no visceral cover.",
    indications: ["Lower abdominal surgery — hernia, appendicectomy, caesarean section (when no intrathecal morphine)", "Laparoscopic port sites", "Subcostal TAP for upper abdominal incisions"],
    keyInfo: {
      position: ["Supine"],
      approach: ["Linear probe transverse in mid-axillary line, between costal margin and iliac crest", "In-plane, anteromedial → posterolateral"],
      procedure: ["EO, IO, TA and peritoneum", "Tip in plane between IO and TA", "Lens-shaped spread separating IO/TA"],
      volume: "~20 mL per side (bilateral for midline incisions)",
      coverage: "Lateral: T10–T12; subcostal: T6–T9"
    },
    anatomy: {
      text: "The anterior rami of T6–L1 run in the plane between internal oblique and transversus abdominis before becoming anterior cutaneous nerves. A lateral injection in the mid-axillary line reaches T10–T12 most reliably; upper abdominal dermatomes need a subcostal injection. Visceral innervation is not reached.",
      relations: ["Superficial: external oblique, internal oblique", "Deep: transversus abdominis, then transversalis fascia and peritoneum", "Nerves: in the IO–TA plane"],
      targets: "Thoracolumbar nerves (T6–L1) in the TAP"
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "3–4 cm",
      orientation: "Transverse mid-axillary line · left = medial (anterior), right = lateral (posterior)",
      image: {
        probe: "linear", depth: 4, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "eo", t: "muscle", l: "External oblique", d: "Most superficial.", p: [[0, 30], [400, 28], [400, 68], [0, 72]], lab: [60, 50] },
          { id: "io", t: "muscle", l: "Internal oblique", d: "Thickest layer.", p: [[0, 78], [400, 74], [400, 140], [0, 146]], lab: [60, 110] },
          { id: "ta", t: "muscle", l: "Transversus abdominis", d: "Thin, dark deep layer.", p: [[0, 152], [400, 148], [400, 172], [0, 178]], lab: [330, 162] },
          { id: "tapn", t: "nerve", e: "hypo", l: "T10–T12 nerves (in TAP)", d: "Run between IO and TA.", cs: [[150, 149, 3], [270, 147, 3]], lab: [160, 128], key: true },
          { id: "per", t: "pleura", l: "Peritoneum", d: "Bright line; bowel beneath.", ln: [[0, 188], [400, 184]], lab: [60, 206] },
          { id: "bowel", t: "bowel", l: "Bowel", d: "Peristalsis and gas artefact.", p: [[0, 192], [400, 188], [400, 300], [0, 300]], lab: [300, 250] }
        ],
        needles: [{ from: [2, 44], to: [208, 150] }],
        spreads: [{ el: [214, 150, 116, 9, -0.5] }]
      }
    },
    procedure: {
      position: "Supine",
      probe: "Linear, transverse in the mid-axillary line between costal margin and iliac crest (subcostal: along the costal margin)",
      needle: "22G 80 mm short-bevel",
      approach: "In-plane, anteromedial → posterolateral",
      steps: [
        "Identify EO, IO and TA from superficial to deep, and the peritoneum/bowel beneath.",
        "Advance to the fascial plane between IO and TA.",
        "Inject 1–2 mL to confirm the plane: a lens-shaped pool separates IO from TA.",
        "Complete the volume; repeat on the other side for midline incisions."
      ],
      volume: "~20 mL per side (dilute LA; calculate maximum dose when bilateral)",
      endpoint: "Elliptical spread between IO and TA — not within muscle."
    },
    spread: {
      summary: "Ipsilateral anterolateral abdominal wall: T10–T12 with the lateral approach, T6–T9 with the subcostal approach. No visceral analgesia.",
      covered: ["Lateral TAP: T10–T12 anterolateral wall (± L1)", "Subcostal TAP: T6–T9 upper abdomen"],
      spared: ["Visceral pain", "Lateral cutaneous branches (lateral approach — variable)"],
      motor: "None clinically relevant.",
      three: {
        focus: "abdo", view: "anterior",
        needle: { a: "tap", from: "medial" },
        variants: [
          {
            id: "lateral", label: "Lateral TAP (T10–T12)",
            regions: [
              { k: "exp", seg: "trunk", side: "both", derm: ["T10", "T12"], th: [0, 95] },
              { k: "var", seg: "trunk", side: "both", derm: ["L1", "L1"], th: [0, 80] },
              { k: "var", seg: "trunk", side: "both", derm: ["T10", "T12"], th: [95, 118] }
            ]
          },
          {
            id: "subcostal", label: "Subcostal TAP (T6–T9)",
            needle: { a: "tapSub", from: "medial" },
            regions: [
              { k: "exp", seg: "trunk", side: "both", derm: ["T6", "T9"], th: [0, 72] },
              { k: "var", seg: "trunk", side: "both", derm: ["T10", "T10"], th: [0, 72] }
            ]
          }
        ],
        labels: [
          { x: "Anterolateral wall (bilateral)", k: "exp", a: { seg: "trunk", side: "R", y: 1.02, th: 45 } },
          { x: "Somatic only — no visceral", k: "spared", a: { seg: "trunk", side: "L", y: 1.08, th: 10 } },
          { x: "Needle: mid-axillary line", k: "needle", a: "tap" }
        ]
      }
    },
    tips: ["Inject a small test volume — a lens between IO and TA confirms the plane.", "Bilateral blocks for midline incisions; watch the total dose.", "Subcostal TAP for upper abdominal incisions."],
    pitfalls: ["Intramuscular injection (spread within IO/TA).", "Needle beyond TA → peritoneum/bowel."],
    complications: ["Peritoneal/bowel or liver puncture", "LAST (bilateral volumes)", "Transient femoral nerve block"],
    pearls: ["Plane between internal oblique and transversus abdominis.", "Somatic analgesia only.", "TAP ≈ T6–T12 vs QL ≈ T4–L1 coverage.", "Landmark 'double pop' through the triangle of Petit."],
    source: { title: "Ultrasound-Guided TAP and Quadratus Lumborum Blocks", url: "https://www.nysora.com/topics/abdomen/ultrasound-guided-transversus-abdominis-plane-quadratus-lumborum-blocks/" }
  });

  blocks.push({
    id: "rectus-sheath",
    name: "Rectus Sheath Block",
    short: "Rectus Sheath",
    cat: "abdo",
    tags: ["Fascial plane", "Midline", "Bilateral"],
    tagline: "Periumbilical / midline • T9–T11",
    summary: "LA between the rectus abdominis and the posterior rectus sheath blocks the terminal anterior branches of T9–T11 as they enter the muscle. Performed bilaterally for midline incisions.",
    indications: ["Umbilical / paraumbilical hernia repair", "Midline laparotomy (catheters)", "Laparoscopic umbilical port"],
    keyInfo: {
      position: ["Supine"],
      approach: ["Linear probe transverse just above the umbilicus, over lateral rectus", "In-plane, lateral → medial"],
      procedure: ["Rectus, posterior sheath, peritoneum", "Doppler for epigastric vessels", "Inject between rectus and posterior sheath; repeat other side"],
      volume: "10–15 mL per side",
      coverage: "Periumbilical midline T9–T11"
    },
    anatomy: {
      text: "The anterior branches of the lower intercostal nerves pierce the posterior rectus sheath to enter the rectus abdominis near its lateral edge. Injecting between the muscle and the posterior sheath above the umbilicus blocks them. Below the arcuate line the posterior sheath is absent, so the block is best done above the umbilicus.",
      relations: ["Superficial: anterior rectus sheath, rectus abdominis", "Deep: posterior rectus sheath, preperitoneal fat, peritoneum", "Vessels: superior/inferior epigastric on the posterior rectus"],
      targets: "Terminal anterior branches of T9–T11"
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "2–4 cm",
      orientation: "Transverse above umbilicus · left = medial (linea alba), right = lateral",
      image: {
        probe: "linear", depth: 4, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "ars", t: "fascia", l: "Anterior rectus sheath", d: "Superficial fascia.", ln: [[0, 38], [400, 36]], lab: [330, 24] },
          { id: "ra", t: "muscle", l: "Rectus abdominis", d: "Needle passes through it.", el: [200, 96, 175, 52, 0], lab: [120, 96] },
          { id: "prs", t: "fascia", l: "Posterior rectus sheath", d: "Target: just superficial to it.", ln: [[30, 154], [200, 152], [370, 154]], lab: [100, 172], key: true },
          { id: "iea", t: "artery", l: "Epigastric artery", d: "On posterior rectus — Doppler.", c: [248, 146, 5], lab: [272, 124] },
          { id: "per", t: "pleura", l: "Peritoneum", d: "Beneath preperitoneal fat.", ln: [[0, 184], [400, 182]], lab: [330, 200] },
          { id: "bowel", t: "bowel", l: "Bowel", d: "Keep the tip superficial to the sheath.", p: [[0, 188], [400, 186], [400, 300], [0, 300]], lab: [200, 250] }
        ],
        needles: [{ from: [398, 50], to: [196, 148] }],
        spreads: [{ el: [196, 148, 96, 8, 0] }]
      }
    },
    procedure: {
      position: "Supine",
      probe: "Linear, transverse just above the umbilicus over the lateral part of the rectus",
      needle: "22G 50–80 mm",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify rectus abdominis, the bright posterior rectus sheath and the peritoneum.",
        "Doppler for epigastric vessels on the deep surface of the muscle.",
        "Advance through the muscle to its posterior surface; inject to separate muscle from sheath.",
        "Repeat on the contralateral side."
      ],
      volume: "10–15 mL per side",
      endpoint: "LA spreading between rectus and posterior sheath."
    },
    spread: {
      summary: "Bilateral periumbilical/anteromedial abdominal wall, T9–T11.",
      covered: ["Anteromedial abdominal wall/periumbilical T9–T11 (bilateral)"],
      spared: ["Lateral abdominal wall", "Visceral pain"],
      motor: "None.",
      three: {
        focus: "abdo", view: "anterior",
        needle: { a: "rsb", from: "lateral" },
        regions: [
          { k: "exp", seg: "trunk", side: "both", derm: ["T9", "T11"], th: [0, 36] },
          { k: "var", seg: "trunk", side: "both", derm: ["T9", "T11"], th: [36, 56] }
        ],
        labels: [
          { x: "Periumbilical T9–T11 (bilateral)", k: "exp", a: { seg: "trunk", side: "R", y: 1.08, th: 14 } },
          { x: "Spared: lateral wall", k: "spared", a: { seg: "trunk", side: "L", y: 1.06, th: 80 } },
          { x: "Needle: above umbilicus", k: "needle", a: "rsb" }
        ]
      }
    },
    tips: ["Stay above the umbilicus/arcuate line where the posterior sheath exists.", "Catheters give prolonged midline analgesia."],
    pitfalls: ["Injecting within rectus muscle.", "Piercing the posterior sheath → peritoneum."],
    complications: ["Epigastric vessel puncture / rectus sheath haematoma", "Peritoneal/bowel puncture", "LAST"],
    pearls: ["Target: between rectus abdominis and posterior rectus sheath.", "Bilateral; T9–T11 periumbilical.", "Posterior sheath absent below the arcuate line."],
    source: { title: "Mastering the Ultrasound-Guided Rectus Sheath Block", url: "https://www.nysora.com/education-news/mastering-the-ultrasound-guided-rectus-sheath-block/" }
  });

  blocks.push({
    id: "ql",
    name: "Quadratus Lumborum Block",
    short: "Quadratus Lumborum",
    cat: "abdo",
    tags: ["Fascial plane", "± Visceral", "Shamrock"],
    tagline: "Abdominal wall ± visceral • T7–L1",
    summary: "Injection around the quadratus lumborum: QL1 (lateral), QL2 (posterior — between QL and the thoracolumbar fascia/erector spinae) or transmuscular/QL3 (between QL and psoas, 'shamrock' view). Coverage is wider and longer than TAP, with possible paravertebral spread.",
    indications: ["Caesarean section, nephrectomy, colorectal surgery", "Hip surgery (anterior/transmuscular approach)"],
    keyInfo: {
      position: ["Lateral decubitus (or supine with tilt)"],
      approach: ["Curvilinear probe transverse in the flank above the iliac crest", "In-plane, posterior → anterior"],
      procedure: ["Shamrock: L4 TP with psoas, ES and QL", "QL2: posterior surface of QL", "Transmuscular: through QL to QL–psoas plane"],
      volume: "15–20 mL (0.2–0.3 mL/kg) per side",
      coverage: "QL2: T8–T12; transmuscular: T10–L1"
    },
    anatomy: {
      text: "The quadratus lumborum lies lateral to the transverse process, with psoas anterior and erector spinae posterior — the 'shamrock' (three leaves on the transverse process stem). LA can travel along the thoracolumbar fascia and toward the thoracic paravertebral space, which may add visceral analgesia (variable).",
      relations: ["Anterior: psoas major (lumbar plexus within/near it)", "Posterior: erector spinae, thoracolumbar fascia", "Lateral: abdominal wall aponeuroses (TA/IO/EO)", "Deep: kidney"],
      targets: "Thoracolumbar nerves (T7–L1) ± paravertebral spread"
    },
    sono: {
      probe: "Curvilinear 2–5 MHz",
      depth: "6–9 cm",
      orientation: "Transverse in the flank ('shamrock') · left = posterior, right = anterior",
      image: {
        probe: "curvilinear", depth: 8, left: "POSTERIOR", right: "ANTERIOR",
        s: [
          { id: "es", t: "muscle", l: "Erector spinae", d: "Posterior leaf of the shamrock.", el: [70, 130, 70, 54, 0], lab: [60, 110] },
          { id: "ql", t: "muscle", l: "Quadratus lumborum", d: "Lateral leaf — the block is named after it.", el: [204, 126, 58, 34, 0], lab: [204, 104], key: true },
          { id: "ps", t: "muscle", l: "Psoas major", d: "Anterior leaf.", el: [212, 214, 70, 34, 0], lab: [212, 226] },
          { id: "tp", t: "bone", l: "L4 transverse process", d: "The shamrock's stem.", ln: [[60, 206], [120, 190], [180, 172]], lab: [96, 234] },
          { id: "vb", t: "bone", l: "Vertebral body", d: "Medial, deep.", ln: [[0, 250], [60, 236], [110, 244]], lab: [40, 272] },
          { id: "aw", t: "muscle", l: "Abdominal wall (TA/IO/EO)", d: "Lateral muscles converging to aponeurosis.", p: [[270, 40], [400, 30], [400, 110], [270, 116]], lab: [340, 60] },
          { id: "kid", t: "organ", l: "Kidney", d: "Deep — avoid.", el: [340, 236, 58, 30, 0], lab: [344, 238] },
          { id: "ql2", t: "marker", l: "QL2 target (posterior QL)", d: "Posterior surface of QL.", c: [150, 112, 4], lab: [130, 60] }
        ],
        needles: [{ from: [20, 44], to: [214, 166] }],
        spreads: [{ el: [212, 170, 62, 9, 8] }]
      }
    },
    procedure: {
      position: "Lateral decubitus, block side up",
      probe: "Curvilinear, transverse in the flank just above the iliac crest",
      needle: "22G 100 mm",
      approach: "In-plane, posterior → anterior",
      steps: [
        "Find the shamrock: L4 transverse process with psoas (anterior), erector spinae (posterior) and QL (lateral).",
        "QL2: place the tip at the posterior surface of QL (between QL and the thoracolumbar fascia).",
        "Transmuscular (QL3): pass through QL to the plane between QL and psoas.",
        "Inject and observe spread along the plane."
      ],
      volume: "15–20 mL (0.2–0.3 mL/kg) per side",
      endpoint: "Spread in the chosen plane without intramuscular pooling."
    },
    spread: {
      summary: "Wider and longer sensory block than TAP; possible visceral analgesia via paravertebral spread (variable). Transmuscular injections can reach the lumbar plexus.",
      covered: ["QL2: anterior abdominal wall T8–T12", "Transmuscular: T10–L1 (± hip analgesia)", "Visceral analgesia — variable"],
      spared: ["Contralateral side (bilateral blocks for midline)"],
      motor: "Quadriceps weakness possible (lumbar plexus spread, especially transmuscular).",
      three: {
        focus: "abdoR", view: "right",
        needle: { a: "ql", from: "posterior" },
        variants: [
          {
            id: "ql2", label: "QL2 (posterior)",
            regions: [
              { k: "exp", seg: "trunk", side: "R", derm: ["T8", "T12"], th: [0, 112] },
              { k: "var", seg: "trunk", side: "R", derm: ["T6", "T7"], th: [0, 112] },
              { k: "var", seg: "trunk", side: "R", derm: ["L1", "L1"], th: [0, 100] }
            ]
          },
          {
            id: "qlt", label: "Transmuscular (QL3)",
            regions: [
              { k: "exp", seg: "trunk", side: "R", derm: ["T10", "L1"], th: [0, 120] },
              { k: "var", seg: "trunk", side: "R", derm: ["T7", "T9"], th: [0, 120] },
              { k: "var", seg: "thigh", side: "R", t: [0.05, 0.8], th: [300, 60] }
            ]
          }
        ],
        labels: [
          { x: "Anterolateral abdominal wall", k: "exp", a: { seg: "trunk", side: "R", y: 1.05, th: 60 } },
          { x: "Variable: visceral (paravertebral spread)", k: "var", a: { seg: "trunk", side: "R", y: 1.16, th: 30 } },
          { x: "Needle: flank (shamrock)", k: "needle", a: "ql" }
        ]
      }
    },
    tips: ["Lateral position makes the shamrock easier.", "Curvilinear probe — this is deep."],
    pitfalls: ["Intramuscular QL injection.", "Needle too anterior → kidney/peritoneum."],
    complications: ["Quadriceps weakness (lumbar plexus spread)", "Hypotension", "Renal/visceral puncture", "LAST"],
    pearls: ["Shamrock sign: TP stem with psoas, ES and QL leaves.", "QL ≈ T4–L1 vs TAP ≈ T6–T12 (wider).", "Transmuscular has more lumbar plexus effects."],
    source: { title: "Ultrasound-Guided TAP and Quadratus Lumborum Blocks", url: "https://nysora.com/regional-anesthesia/topics/abdomen/ultrasound-guided-transversus-abdominis-plane-quadratus-lumborum-blocks/" }
  });

  blocks.push({
    id: "ilioinguinal",
    name: "Ilioinguinal & Iliohypogastric Nerve Block",
    short: "Ilioinguinal / Iliohypogastric",
    cat: "abdo",
    tags: ["L1", "Groin", "Paediatrics"],
    tagline: "Inguinal region • L1",
    summary: "The ilioinguinal and iliohypogastric nerves (L1) lie between internal oblique and transversus abdominis just superomedial to the ASIS. A small volume blocks the groin, upper medial thigh and anterior scrotum/labia.",
    indications: ["Inguinal hernia repair", "Orchidopexy (partial — cord needs more)", "Pfannenstiel incision analgesia"],
    keyInfo: {
      position: ["Supine"],
      approach: ["Linear probe on the ASIS–umbilicus line, lateral end on ASIS", "In-plane, medial → lateral"],
      procedure: ["ASIS shadow and three muscle layers", "Two small ovals between IO and TA", "Inject between IO and TA"],
      volume: "Adults ~10 mL; children as little as 0.075 mL/kg",
      coverage: "Groin, upper medial thigh, anterior scrotum/labia"
    },
    anatomy: {
      text: "Both nerves arise from L1 and run in the plane between internal oblique and transversus abdominis near the ASIS, before piercing the internal oblique at different levels to supply the inguinal region. Cephalad and posterior to the ASIS they are found in this plane in >90% of cases.",
      relations: ["Lateral: ASIS (bony shadow)", "Superficial: external oblique (often aponeurotic), internal oblique", "Deep: transversus abdominis, peritoneum", "Vessel: ascending branch of deep circumflex iliac artery nearby"],
      targets: "Ilioinguinal and iliohypogastric nerves (L1)",
      plexus: { type: "lumbosacral", hi: ["IH", "II"], zone: "L1 branches" }
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "2–3 cm",
      orientation: "Oblique on ASIS–umbilicus line · left = medial, right = lateral (ASIS)",
      image: {
        probe: "linear", depth: 3, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "eo", t: "fascia", l: "External oblique (aponeurosis)", d: "Often only an aponeurosis here.", ln: [[0, 36], [320, 40]], lab: [70, 24] },
          { id: "io", t: "muscle", l: "Internal oblique", d: "Middle layer.", p: [[0, 46], [330, 52], [300, 136], [0, 132]], lab: [80, 90] },
          { id: "ta", t: "muscle", l: "Transversus abdominis", d: "Deep layer.", p: [[0, 146], [296, 150], [290, 184], [0, 182]], lab: [80, 166] },
          { id: "ii", t: "nerve", e: "hypo", l: "Ilioinguinal n.", d: "Between IO and TA near ASIS.", c: [272, 143, 5], lab: [240, 110], key: true },
          { id: "ih", t: "nerve", e: "hypo", l: "Iliohypogastric n.", d: "Just medial to ilioinguinal.", c: [248, 144, 5], lab: [196, 122], key: true },
          { id: "dcia", t: "artery", l: "Ascending br. DCIA", d: "Doppler before injecting.", c: [226, 148, 3], lab: [196, 204] },
          { id: "asis", t: "bone", l: "ASIS", d: "Lateral bony landmark.", ln: [[320, 124], [360, 110], [400, 104]], lab: [360, 150] },
          { id: "per", t: "pleura", l: "Peritoneum", d: "Deep — stay superficial to it.", ln: [[0, 196], [300, 200]], lab: [80, 222] }
        ],
        needles: [{ from: [2, 60], to: [262, 146] }],
        spreads: [{ el: [260, 145, 46, 8, 0] }]
      }
    },
    procedure: {
      position: "Supine",
      probe: "Linear on a line from the ASIS to the umbilicus, lateral end on the ASIS",
      needle: "22G 50 mm",
      approach: "In-plane, medial → lateral",
      steps: [
        "Identify the ASIS shadow and the muscle layers (EO may be only an aponeurosis).",
        "Find the two small nerves between IO and TA; Doppler for the ascending DCIA branch.",
        "Inject into the IO–TA plane beside the nerves."
      ],
      volume: "Adults ~10 mL; children as little as 0.075 mL/kg",
      endpoint: "Spread around the nerves between IO and TA."
    },
    spread: {
      summary: "Inguinal region, suprapubic skin, upper medial thigh and anterior scrotum/labia. The genital branch of the genitofemoral nerve and visceral afferents are not covered.",
      covered: ["Groin and suprapubic skin (iliohypogastric)", "Upper medial thigh, anterior scrotum/labia (ilioinguinal)"],
      spared: ["Genital branch of genitofemoral (spermatic cord)", "Peritoneal/visceral traction pain"],
      motor: "Transient femoral nerve block can occur (spread along TA to fascia iliaca).",
      three: {
        focus: "pelvisR", view: "anterior",
        needle: { a: "iih", from: "medial" },
        regions: [
          { k: "exp", seg: "trunk", side: "R", derm: ["L1", "L2"], th: [0, 72] },
          { k: "exp", seg: "thigh", side: "R", t: [0, 0.22], th: [250, 345] }
        ],
        labels: [
          { x: "Groin & suprapubic (L1)", k: "exp", a: { seg: "trunk", side: "R", y: 0.95, th: 30 } },
          { x: "Upper medial thigh / anterior scrotum", k: "exp", a: { seg: "thigh", side: "R", t: 0.1, th: 300 } },
          { x: "Spared: genitofemoral (cord)", k: "spared", a: { seg: "trunk", side: "L", y: 0.93, th: 15 } },
          { x: "Needle: medial to ASIS", k: "needle", a: "iih" }
        ]
      }
    },
    tips: ["Stay close to the ASIS where the nerves are consistently in the IO–TA plane.", "Tiny volumes suffice under ultrasound — ideal in children."],
    pitfalls: ["Deep injection → femoral nerve block or peritoneal puncture.", "Expecting cord/visceral analgesia."],
    complications: ["Transient femoral nerve palsy", "Bowel puncture (rare)", "LAST"],
    pearls: ["Both L1; between IO and TA near the ASIS.", "Genitofemoral (genital branch) not covered.", "Transient quadriceps weakness is a recognised complication."],
    source: { title: "Ultrasound-Guided Blocks for Pelvic Pain / abdominal wall", url: "https://nysora.com/pain-management/ultrasound-guided-blocks-for-pelvic-pain/" }
  });

  /* ======================================================================
     HEAD & NECK
     ====================================================================== */

  blocks.push({
    id: "cervical-plexus",
    name: "Superficial Cervical Plexus Block",
    short: "Superficial Cervical Plexus",
    cat: "headneck",
    tags: ["C2–C4", "Carotid endarterectomy"],
    tagline: "Neck, ear & 'cape' • C2–C4",
    summary: "The sensory branches of C2–C4 — lesser occipital, great auricular, transverse cervical and supraclavicular nerves — emerge at the midpoint of the posterior border of the sternocleidomastoid ('nerve point of the neck').",
    indications: ["Carotid endarterectomy (awake, allows neuro monitoring)", "Clavicle surgery (with interscalene/superior trunk)", "Thyroid and superficial neck surgery analgesia"],
    keyInfo: {
      position: ["Supine/semi-sitting, head turned away"],
      approach: ["Linear probe transverse at midpoint of posterior SCM border (~C4)", "In-plane, lateral → medial"],
      procedure: ["Tapering posterior border of SCM", "Small nodules deep to SCM, superficial to prevertebral fascia", "Inject under SCM — stay superficial to prevertebral fascia"],
      volume: "5–8 mL",
      coverage: "Anterolateral neck, ear, angle of jaw, clavicle/shoulder cape"
    },
    anatomy: {
      text: "The superficial cervical plexus branches (C2–C4) wind around the posterior border of the sternocleidomastoid at its midpoint (Erb's point / nerve point of the neck), roughly level with the cricoid. The SCM forms a roof over them; the prevertebral fascia lies deep — staying superficial to it avoids the deep plexus, phrenic nerve and vertebral artery.",
      relations: ["Superficial: SCM, external jugular vein", "Deep: prevertebral fascia over levator scapulae/scalenes", "Medial: carotid sheath (deep to SCM)"],
      targets: "Lesser occipital, great auricular, transverse cervical, supraclavicular nerves"
    },
    sono: {
      probe: "Linear 10–15 MHz",
      depth: "2–3 cm",
      orientation: "Transverse at mid-SCM posterior border · left = medial, right = lateral",
      image: {
        probe: "linear", depth: 3, left: "MEDIAL", right: "LATERAL",
        s: [
          { id: "scm", t: "muscle", l: "Sternocleidomastoid", d: "Roof — tapering posterior border.", p: [[0, 18], [236, 38], [206, 74], [0, 86]], lab: [80, 46] },
          { id: "ls", t: "muscle", l: "Levator scapulae / scalenes", d: "Deep to prevertebral fascia.", el: [262, 184, 128, 52, 0], lab: [300, 196] },
          { id: "pvf", t: "fascia", l: "Prevertebral fascia", d: "Stay superficial to it.", ln: [[140, 128], [260, 124], [400, 120]], lab: [340, 108] },
          { id: "scp", t: "nerve", e: "honey", l: "Superficial cervical plexus", d: "C2–C4 sensory branches beneath the SCM border.", cs: [[236, 94, 4], [250, 100, 4], [242, 110, 3]], lab: [290, 76], key: true },
          { id: "cca", t: "artery", l: "Carotid artery", d: "Deep, medial.", c: [78, 150, 18], lab: [78, 186] },
          { id: "ijv", t: "vein", l: "Internal jugular vein", d: "Lateral to carotid.", el: [124, 128, 22, 12, 0], lab: [150, 150] }
        ],
        needles: [{ from: [398, 56], to: [246, 100] }],
        spreads: [{ el: [238, 100, 48, 10, 0] }]
      }
    },
    procedure: {
      position: "Supine or semi-sitting, head turned to the opposite side",
      probe: "Linear, transverse at the midpoint of the posterior border of SCM",
      needle: "22–25G 50 mm",
      approach: "In-plane, lateral → medial",
      steps: [
        "Identify the tapering posterior border of the SCM.",
        "The plexus appears as small hypoechoic nodules just deep to it, superficial to the prevertebral fascia.",
        "Inject beneath the SCM border, keeping superficial to the prevertebral fascia."
      ],
      volume: "5–8 mL",
      endpoint: "Spread under the SCM border around the small nerves."
    },
    spread: {
      summary: "Skin of the anterolateral neck, ear and angle of mandible, lateral occiput, and the 'cape' over the clavicle and shoulder.",
      covered: ["Lesser occipital — behind the ear", "Great auricular — ear, angle of mandible", "Transverse cervical — anterior neck", "Supraclavicular — clavicle, shoulder, upper chest"],
      spared: ["Deep neck structures/muscles (deep cervical plexus)", "Face (trigeminal)", "Carotid sheath structures — surgeon supplementation often needed"],
      motor: "None (deep spread can cause phrenic block).",
      three: {
        focus: "neckR", view: [-0.8, 0.1, 0.6],
        needle: { a: "scp", from: "lateral" },
        regions: [
          { k: "nerve", n: "Supraclavicular — clavicle & shoulder cape", col: "#34d399", seg: "trunk", side: "R", derm: ["C3", "C4"], th: [0, 150] },
          { k: "nerve", n: "Supraclavicular — clavicle & shoulder cape", col: "#34d399", seg: "shoulder", side: "R", t: [0, 0.5] },
          { k: "nerve", n: "Transverse cervical — anterior neck", col: "#fbbf24", seg: "neck", side: "R", th: [0, 88] },
          { k: "nerve", n: "Great auricular — ear & angle of jaw", col: "#22d3ee", seg: "head", side: "R", t: [0.16, 0.5], th: [62, 118] },
          { k: "nerve", n: "Great auricular — ear & angle of jaw", col: "#22d3ee", seg: "ear", side: "R" },
          { k: "nerve", n: "Lesser occipital — behind ear", col: "#a78bfa", seg: "head", side: "R", t: [0.38, 0.8], th: [118, 160] }
        ],
        labels: [
          { x: "Great auricular", k: "nerve", a: { seg: "head", side: "R", t: 0.36, th: 95 } },
          { x: "Lesser occipital", k: "nerve", a: { seg: "head", side: "R", t: 0.6, th: 140 } },
          { x: "Transverse cervical", k: "nerve", a: { seg: "neck", side: "R", t: 0.5, th: 35 } },
          { x: "Supraclavicular", k: "nerve", a: { seg: "trunk", side: "R", y: 1.43, th: 50 } },
          { x: "Needle: posterior border of SCM", k: "needle", a: "scp" }
        ]
      }
    },
    tips: ["Superficial to the prevertebral fascia = superficial block (safer).", "Watch for the external jugular vein crossing the SCM."],
    pitfalls: ["Deep injection → phrenic block, deep plexus.", "Intravascular injection (EJV)."],
    complications: ["Phrenic nerve block (deep spread)", "Intravascular injection", "Deep block risks (vertebral artery, epidural) avoided by staying superficial"],
    pearls: ["Nerve point of the neck: midpoint of posterior SCM border.", "Four branches: lesser occipital, great auricular, transverse cervical, supraclavicular.", "Superficial block avoids the risks of the deep cervical plexus block."],
    source: { title: "Ultrasound-Guided Cervical Plexus Block", url: "https://www.nysora.com/techniques/head-and-neck-blocks/cervical/ultrasound-guided-cervical-plexus-block/" }
  });

  blocks.push({
    id: "scalp",
    name: "Scalp Block",
    short: "Scalp Block",
    cat: "headneck",
    tags: ["Awake craniotomy", "Landmark"],
    tagline: "Awake craniotomy • six nerves",
    summary: "Infiltration of six nerves on each side: supraorbital and supratrochlear (V1), zygomaticotemporal (V2), auriculotemporal (V3), lesser occipital (C2–C3) and greater occipital (C2).",
    indications: ["Awake craniotomy", "Craniotomy analgesia and haemodynamic control at pinning", "Scalp surgery"],
    keyInfo: {
      position: ["Supine/lateral, before head pinning"],
      approach: ["Landmark infiltration (ultrasound optional for greater occipital/supraorbital)"],
      procedure: ["Supraorbital notch & supratrochlear (medial)", "Zygomaticotemporal & auriculotemporal (anterior to tragus)", "Greater & lesser occipital along superior nuchal line"],
      volume: "~1.5–5 mL per site (e.g., 1.5–2 / 3–5 / 2–2.5 mL)",
      coverage: "Scalp (bilateral)"
    },
    anatomy: {
      text: "Anteriorly the scalp is supplied by the supraorbital and supratrochlear nerves (V1); the temple by the zygomaticotemporal (V2) and auriculotemporal (V3) nerves; and posteriorly by the lesser (C2–C3) and greater (C2) occipital nerves. The auriculotemporal nerve runs with the superficial temporal artery in front of the tragus; the greater occipital nerve lies medial to the occipital artery.",
      relations: ["Supraorbital: at the supraorbital notch", "Auriculotemporal: 1–1.5 cm anterior to tragus, behind superficial temporal artery", "Greater occipital: ~1/3 of the way from occipital protuberance to mastoid, medial to occipital artery", "Lesser occipital: along superior nuchal line toward mastoid"],
      targets: "Supraorbital, supratrochlear, zygomaticotemporal, auriculotemporal, lesser occipital, greater occipital"
    },
    sono: {
      probe: "Landmark technique",
      depth: "Subcutaneous",
      orientation: "Lateral view of head — injection points (both sides)",
      image: {
        probe: "landmark", left: "ANTERIOR", right: "POSTERIOR",
        s: [
          { id: "head", t: "outline", l: "Head (lateral view)", d: "", path: "M150,40 C210,10 300,20 330,80 C355,130 347,190 305,215 L300,285 L175,285 L178,245 C150,245 128,238 120,225 C110,222 106,212 112,205 C104,200 104,193 110,190 C104,186 104,180 110,177 L104,168 L88,150 L104,120 C100,105 104,95 108,90 C110,70 125,50 150,40 Z" },
          { id: "ear", t: "outline", l: "Ear", d: "", path: "M238,118 C256,103 274,118 269,141 C265,160 256,173 246,171 C238,167 235,150 238,118 Z" },
          { id: "eye", t: "outline", l: "Eye", d: "", path: "M116,118 Q128,111 140,118 Q128,123 116,118 Z" },
          { id: "sta", t: "artery", l: "Superficial temporal artery", d: "Auriculotemporal nerve lies just behind it.", ln: [[218, 150], [214, 112], [204, 64]], lab: [168, 44] },
          { id: "so", t: "point", l: "Supraorbital (V1)", d: "At the supraorbital notch; 1.5–2 mL.", c: [130, 99, 5], lab: [168, 82], key: true },
          { id: "st", t: "point", l: "Supratrochlear (V1)", d: "Medial to supraorbital, at the upper medial orbit.", c: [110, 104, 5], lab: [58, 138], key: true },
          { id: "zt", t: "point", l: "Zygomaticotemporal (V2)", d: "Lateral orbital rim toward zygomatic arch; 3–5 mL.", c: [168, 120, 5], lab: [150, 168], key: true },
          { id: "at", t: "point", l: "Auriculotemporal (V3)", d: "1–1.5 cm anterior to tragus, behind superficial temporal artery; 3–5 mL.", c: [226, 132, 5], lab: [250, 94], key: true },
          { id: "lo", t: "point", l: "Lesser occipital (C2–3)", d: "Along superior nuchal line toward mastoid.", c: [290, 166, 5], lab: [290, 240], key: true },
          { id: "go", t: "point", l: "Greater occipital (C2)", d: "~1/3 from occipital protuberance to mastoid, medial to occipital artery; 2–2.5 mL.", c: [322, 172, 5], lab: [338, 126], key: true }
        ],
        needles: [{ from: [70, 34], to: [128, 97] }, { from: [196, 96], to: [224, 130] }, { from: [372, 222], to: [324, 175] }],
        spreads: [{ c: [130, 99, 13] }, { c: [110, 104, 11] }, { c: [168, 120, 13] }, { c: [226, 132, 13] }, { c: [290, 166, 13] }, { c: [322, 172, 13] }]
      }
    },
    procedure: {
      position: "Supine or lateral, head accessible, before pinning",
      probe: "Landmark (ultrasound optional for occipital nerves)",
      needle: "25–27G, aspirate before each injection",
      approach: "Subcutaneous infiltration at six sites each side",
      steps: [
        "Supraorbital: palpate the notch; inject 1.5–2 mL. Supratrochlear: just medial, at the upper medial orbit.",
        "Zygomaticotemporal: infiltrate from the lateral orbital rim toward the zygomatic arch.",
        "Auriculotemporal: 1–1.5 cm anterior to the tragus above the TMJ, posterior to the superficial temporal artery.",
        "Greater occipital: ~one-third along the line from the external occipital protuberance to the mastoid, medial to the occipital artery.",
        "Lesser occipital: continue infiltration along the superior nuchal line toward the mastoid."
      ],
      volume: "~1.5–5 mL per site — calculate the total dose (bilateral)",
      endpoint: "Subcutaneous wheal at each site after negative aspiration."
    },
    spread: {
      summary: "Scalp anaesthesia bilaterally; each nerve has a separate territory. Temporalis muscle and dura need surgical infiltration.",
      covered: ["Forehead/anterior scalp — supraorbital, supratrochlear", "Temple — zygomaticotemporal, auriculotemporal", "Behind ear — lesser occipital", "Occiput to vertex — greater occipital"],
      spared: ["Temporalis muscle and dura (surgeon infiltration)", "Face"],
      motor: "Facial nerve palsy if auriculotemporal injection is too deep/anterior.",
      three: {
        focus: "head", view: "right",
        needle: { a: "scalp", from: "anterior" },
        regions: [
          { k: "nerve", n: "Supraorbital & supratrochlear (V1)", col: "#22d3ee", seg: "head", side: "both", t: [0.56, 1], th: [0, 52] },
          { k: "nerve", n: "Zygomaticotemporal (V2)", col: "#fbbf24", seg: "head", side: "both", t: [0.48, 0.66], th: [52, 76] },
          { k: "nerve", n: "Auriculotemporal (V3)", col: "#34d399", seg: "head", side: "both", t: [0.5, 0.92], th: [76, 114] },
          { k: "nerve", n: "Lesser occipital (C2–C3)", col: "#a78bfa", seg: "head", side: "both", t: [0.4, 0.8], th: [114, 146] },
          { k: "nerve", n: "Greater occipital (C2)", col: "#fb7185", seg: "head", side: "both", t: [0.34, 1], th: [146, 180] }
        ],
        labels: [
          { x: "Supraorbital / supratrochlear", k: "nerve", a: { seg: "head", side: "R", t: 0.75, th: 25 } },
          { x: "Zygomaticotemporal", k: "nerve", a: { seg: "head", side: "R", t: 0.56, th: 64 } },
          { x: "Auriculotemporal", k: "nerve", a: { seg: "head", side: "R", t: 0.72, th: 95 } },
          { x: "Lesser occipital", k: "nerve", a: { seg: "head", side: "R", t: 0.6, th: 130 } },
          { x: "Greater occipital", k: "nerve", a: { seg: "head", side: "R", t: 0.62, th: 165 } }
        ]
      }
    },
    tips: ["Aspirate before every injection — superficial temporal and occipital arteries are close.", "Total volume is large when bilateral — calculate the maximum dose."],
    pitfalls: ["Deep/anterior auriculotemporal injection → facial nerve palsy.", "Forgetting the zygomaticotemporal branch (highest failure rate)."],
    complications: ["Intravascular injection / LAST", "Transient facial nerve palsy", "Haematoma"],
    pearls: ["Six nerves per side: SO, ST (V1), ZT (V2), AT (V3), LON (C2–3), GON (C2).", "AT 1–1.5 cm anterior to tragus; GON 1/3 from protuberance to mastoid.", "Temporalis and dura need surgeon infiltration."],
    source: { title: "Nerve Blocks of the Face / scalp", url: "https://www.nysora.com/techniques/head-and-neck-blocks/nerve-blocks-face/" }
  });

  /* ======================================================================
     NEURAXIAL
     ====================================================================== */

  const lowerBody = (level) => [
    { k: "exp", seg: "trunk", side: "both", derm: [level, "S5"], th: [0, 180] },
    { k: "exp", seg: ["thigh", "leg", "foot"], side: "both" }
  ];

  blocks.push({
    id: "spinal",
    name: "Spinal (Subarachnoid) Anaesthesia",
    short: "Spinal",
    cat: "neuraxial",
    tags: ["Subarachnoid", "Dense", "Baricity"],
    tagline: "Dense block below a dermatomal level",
    summary: "Local anaesthetic is injected into CSF in the lumbar dural sac below the conus (L1–L2 in adults), usually at L3–4 or L4–5. Block height depends mainly on baricity, dose and patient position.",
    indications: ["Caesarean section", "Hip and lower limb surgery", "TURP and urological surgery", "Perineal surgery"],
    keyInfo: {
      position: ["Sitting or lateral, lumbar spine flexed"],
      approach: ["Midline or paramedian at L3–4 / L4–5", "Ultrasound pre-scan improves level/depth estimation"],
      procedure: ["Identify interspace (Tuffier's line ≈ L4, unreliable)", "Pencil-point needle through ligamentum flavum & dura", "Free CSF → inject; position per baricity"],
      volume: "Dose-based, e.g., 0.5% hyperbaric bupivacaine 10–12.5 mg for caesarean section",
      coverage: "Bilateral, everything caudal to the block height"
    },
    anatomy: {
      text: "Layers: skin, subcutaneous tissue, supraspinous and interspinous ligaments, ligamentum flavum, epidural space, dura and arachnoid, then CSF. The adult spinal cord usually ends at L1–L2, so puncture is performed at or below L3–4. The dural sac ends around S2. Tuffier's (intercristal) line usually crosses L4 or the L4–5 interspace but is unreliable.",
      relations: ["Conus medullaris: L1–L2 (adult)", "Dural sac: ends ~S2", "Tuffier's line: ~L4 / L4–5 (inconsistent)"],
      targets: "Spinal nerve roots within the subarachnoid space"
    },
    sono: {
      probe: "Curvilinear 2–5 MHz",
      depth: "5–8 cm",
      orientation: "Paramedian sagittal oblique (pre-scan) · left = cranial, right = caudal",
      image: {
        probe: "curvilinear", depth: 8, left: "CRANIAL", right: "CAUDAL",
        s: [
          { id: "es", t: "muscle", l: "Erector spinae", d: "Paraspinal muscles.", p: [[0, 30], [400, 30], [400, 118], [0, 126]], lab: [60, 70] },
          { id: "l3", t: "bone", l: "L3 lamina", d: "'Sawtooth' laminae.", ln: [[20, 142], [96, 162]], lab: [44, 176] },
          { id: "l4", t: "bone", l: "L4 lamina", d: "'Sawtooth' laminae.", ln: [[152, 146], [226, 166]], lab: [176, 180] },
          { id: "l5", t: "bone", l: "L5 lamina", d: "'Sawtooth' laminae.", ln: [[282, 150], [356, 170]], lab: [310, 184] },
          { id: "pc", t: "ligament", l: "Ligamentum flavum–dura (posterior complex)", d: "Bright line in the interlaminar window.", ln: [[106, 196], [140, 196]], lab: [60, 214], key: true },
          { id: "pc2", t: "ligament", l: "Posterior complex (L4–5)", d: "Interlaminar window.", ln: [[236, 200], [270, 200]], lab: [290, 214] },
          { id: "csf", t: "space", l: "Intrathecal space (CSF)", d: "Dark band between posterior and anterior complexes.", p: [[106, 202], [140, 202], [140, 240], [106, 240]], lab: [124, 262], key: true },
          { id: "ac", t: "ligament", l: "Anterior complex", d: "PLL / vertebral body.", ln: [[106, 246], [140, 246]], lab: [190, 252] }
        ],
        needles: [{ from: [30, 20], to: [124, 218] }],
        spreads: [{ el: [124, 222, 16, 10, 0] }]
      }
    },
    procedure: {
      position: "Sitting or lateral, lumbar spine flexed",
      probe: "Pre-scan with curvilinear probe to confirm level and depth (optional)",
      needle: "25–27G pencil-point with introducer",
      approach: "Midline (or paramedian) at L3–4 or L4–5",
      steps: [
        "Identify the interspace (palpation ± ultrasound — Tuffier's line is only approximate).",
        "Aseptic technique; skin infiltration; introducer then spinal needle.",
        "Advance through the ligamentum flavum and dura; free-flowing CSF confirms placement.",
        "Inject slowly; position the patient according to baricity; test the block height (cold/pinprick)."
      ],
      volume: "Dose-based (e.g., 0.5% hyperbaric bupivacaine 10–12.5 mg for caesarean section)",
      endpoint: "Free CSF before and after injection; appropriate block height."
    },
    spread: {
      summary: "Dense bilateral sensory and motor block below the achieved level. Sympathetic block extends ~2 segments higher than sensory; motor ~2 lower.",
      covered: ["Everything caudal to the sensory level (bilateral)"],
      spared: ["Dermatomes above the level"],
      motor: "Dense motor block of the legs; hypotension/bradycardia from sympathectomy.",
      three: {
        focus: "full", view: "anterior",
        needle: { a: "spinal", from: "posterior" },
        variants: [
          { id: "t10", label: "T10 (TURP / hip / lower limb)", regions: lowerBody("T10").concat([{ k: "eff", seg: "trunk", side: "both", derm: ["T8", "T9"], th: [0, 180] }]) },
          { id: "t6", label: "T6", regions: lowerBody("T6").concat([{ k: "eff", seg: "trunk", side: "both", derm: ["T4", "T5"], th: [0, 180] }]) },
          { id: "t4", label: "T4 (caesarean section)", regions: lowerBody("T4").concat([{ k: "eff", seg: "trunk", side: "both", derm: ["T2", "T3"], th: [0, 180] }]) }
        ],
        labels: [
          { x: "Sensory block (bilateral, below level)", k: "exp", a: { seg: "thigh", side: "R", t: 0.4, th: 0 } },
          { x: "Sympathetic ≈2 segments higher", k: "eff", a: { seg: "trunk", side: "L", y: 1.2, th: 30 } },
          { x: "Needle: L3–4 midline", k: "needle", a: "spinal" }
        ]
      }
    },
    tips: ["Ultrasound pre-scan helps in obesity/abnormal anatomy.", "Check the block height before surgery (cold for sensory; T4 for caesarean section)."],
    pitfalls: ["Puncturing too high (misidentified interspace) → conus injury.", "Relying on Tuffier's line alone."],
    complications: ["Hypotension, bradycardia", "Post-dural puncture headache", "High/total spinal", "Urinary retention", "Spinal haematoma/abscess (rare) — check anticoagulation"],
    pearls: ["Adult conus L1–L2 → puncture at L3–4 or below.", "Dural sac ends ~S2.", "Differential block: sympathetic ~2 above sensory, motor ~2 below.", "Baricity + position determine spread."],
    source: { title: "Spinal Anesthesia", url: "https://www.nysora.com/techniques/spinal-anesthesia-2/" }
  });

  blocks.push({
    id: "epidural",
    name: "Epidural Anaesthesia & Analgesia",
    short: "Epidural",
    cat: "neuraxial",
    tags: ["Segmental", "Catheter", "Titratable"],
    tagline: "Segmental, titratable • catheter",
    summary: "A Tuohy needle is advanced until loss of resistance as it passes the ligamentum flavum into the epidural space; a catheter allows titratable, segmental block centred on the insertion level.",
    indications: ["Labour analgesia", "Thoracic/upper abdominal surgery (thoracic epidural)", "Lower limb surgery (lumbar)", "Combined with GA for major surgery"],
    keyInfo: {
      position: ["Sitting or lateral, spine flexed"],
      approach: ["Midline (lumbar) or paramedian (mid-thoracic)"],
      procedure: ["Level at centre of incision (thoracic)", "Loss of resistance through ligamentum flavum", "Catheter 4–6 cm; test dose; titrate"],
      volume: "Titrated — roughly 1–2 mL per segment (adult)",
      coverage: "Segmental band around the insertion level"
    },
    anatomy: {
      text: "The epidural space lies between the ligamentum flavum and the dura. The ligamentum flavum may not fuse in the midline at cervical and upper thoracic levels, which can reduce the loss-of-resistance feel with a midline approach. Mid-thoracic spinous processes are steeply angled — a paramedian approach is often easier.",
      relations: ["Posterior: ligamentum flavum", "Anterior: dura mater", "Contents: fat, epidural veins, nerve roots"],
      targets: "Spinal nerve roots traversing the epidural space"
    },
    sono: {
      probe: "Curvilinear 2–5 MHz",
      depth: "4–7 cm",
      orientation: "Paramedian sagittal oblique (pre-scan) · left = cranial, right = caudal",
      image: {
        probe: "curvilinear", depth: 7, left: "CRANIAL", right: "CAUDAL",
        s: [
          { id: "es", t: "muscle", l: "Erector spinae", d: "Paraspinal muscles.", p: [[0, 30], [400, 30], [400, 118], [0, 126]], lab: [60, 70] },
          { id: "la", t: "bone", l: "Lamina", d: "'Sawtooth' laminae.", ln: [[20, 142], [96, 162]], lab: [44, 176] },
          { id: "lb", t: "bone", l: "Lamina", d: "'Sawtooth' laminae.", ln: [[152, 146], [226, 166]], lab: [176, 180] },
          { id: "lc", t: "bone", l: "Lamina", d: "", ln: [[282, 150], [356, 170]] },
          { id: "lf", t: "ligament", l: "Ligamentum flavum", d: "Loss of resistance as the needle passes it.", ln: [[106, 192], [140, 192]], lab: [60, 212], key: true },
          { id: "eps", t: "space", l: "Epidural space", d: "Between ligamentum flavum and dura.", p: [[106, 194], [140, 194], [140, 200], [106, 200]], lab: [206, 208], key: true },
          { id: "dura", t: "ligament", l: "Dura", d: "Do not breach (PDPH).", ln: [[106, 202], [140, 202]], lab: [100, 230] },
          { id: "ac", t: "ligament", l: "Anterior complex", d: "PLL / vertebral body.", ln: [[106, 246], [140, 246]], lab: [190, 252] }
        ],
        needles: [{ from: [30, 20], to: [122, 194] }],
        spreads: [{ el: [124, 197, 28, 4, 0] }]
      }
    },
    procedure: {
      position: "Sitting or lateral, spine flexed",
      probe: "Optional ultrasound pre-scan for level and depth",
      needle: "16–18G Tuohy with loss-of-resistance syringe (saline preferred)",
      approach: "Midline (lumbar) or paramedian (mid-thoracic)",
      steps: [
        "Choose the level at the dermatomal centre of the incision (e.g., T7–T9 for upper abdominal).",
        "Advance the Tuohy with continuous/intermittent loss-of-resistance testing; do not exceed the US-estimated depth.",
        "On loss of resistance, thread the catheter 4–6 cm into the space.",
        "Aspirate, give a test dose, then titrate in increments."
      ],
      volume: "Titrated — roughly 1–2 mL per segment to be blocked (adult)",
      endpoint: "Loss of resistance; bilateral segmental sensory block after titration."
    },
    spread: {
      summary: "A band of block centred on the catheter level. Thoracic: T5 (T4 for laparoscopy) to T8 for upper abdominal surgery. Labour: T10–L1 (first stage) extending to S2–S4 (second stage).",
      covered: ["Segmental band around the insertion level", "Labour: T10–S4"],
      spared: ["Dermatomes outside the band"],
      motor: "Minimal with dilute solutions; hypotension from sympathetic block.",
      three: {
        focus: "full", view: "anterior",
        needle: { a: "epiduralT", from: "posterior" },
        variants: [
          {
            id: "thoracic", label: "Thoracic T5–T8 (upper abdominal)",
            regions: [
              { k: "exp", seg: "trunk", side: "both", derm: ["T5", "T8"], th: [0, 180] },
              { k: "var", seg: "trunk", side: "both", derm: ["T4", "T4"], th: [0, 180] },
              { k: "var", seg: "trunk", side: "both", derm: ["T9", "T9"], th: [0, 180] }
            ]
          },
          {
            id: "labour", label: "Lumbar — labour T10–S4",
            needle: { a: "epiduralL", from: "posterior" },
            regions: [
              { k: "exp", seg: "trunk", side: "both", derm: ["T10", "S5"], th: [0, 180] },
              { k: "var", seg: ["thigh", "leg", "foot"], side: "both" }
            ]
          }
        ],
        labels: [
          { x: "Segmental band (bilateral)", k: "exp", a: { seg: "trunk", side: "R", y: 1.2, th: 45 } },
          { x: "Needle: epidural", k: "needle", a: "epiduralT" }
        ]
      }
    },
    tips: ["Use saline for loss of resistance.", "Paramedian approach for mid-thoracic levels.", "Place the catheter at the centre of the incision's dermatomes."],
    pitfalls: ["False loss of resistance (interspinous gaps, fat).", "Catheter migration — check the block regularly."],
    complications: ["Accidental dural puncture → PDPH", "Hypotension", "Intravascular catheter / LAST (test dose)", "Epidural haematoma or abscess", "Total spinal (intrathecal catheter)", "Patchy/unilateral block"],
    pearls: ["Loss of resistance at the ligamentum flavum.", "Paramedian for mid-thoracic (steep spinous processes).", "Thoracic epidural is segmental: T5–T8 for upper abdominal surgery.", "Labour: T10–L1 first stage, S2–S4 second stage."],
    source: { title: "Epidural Anesthesia and Analgesia", url: "https://www.nysora.com/techniques/neuraxial-and-perineuraxial-techniques/epidural-anesthesia-analgesia/" }
  });

  blocks.push({
    id: "caudal",
    name: "Caudal Epidural Block",
    short: "Caudal",
    cat: "neuraxial",
    tags: ["Paediatrics", "Sacral hiatus", "Armitage"],
    tagline: "Paediatric sub-umbilical • sacral hiatus",
    summary: "Epidural injection through the sacral hiatus, covered by the sacrococcygeal ligament between the sacral cornua. Armitage volumes: 0.5 mL/kg sacral, 1.0 mL/kg lumbar, 1.25 mL/kg mid-thoracic.",
    indications: ["Paediatric sub-umbilical surgery — hypospadias, circumcision, inguinal hernia, orchidopexy", "Lower limb surgery in children", "Adult chronic pain procedures"],
    keyInfo: {
      position: ["Lateral with knees flexed, or prone"],
      approach: ["Palpate sacral cornua or use ultrasound", "Needle ~45° through sacrococcygeal ligament, then flatten"],
      procedure: ["Hiatus at apex of equilateral triangle with the PSISs", "'Pop' through the sacrococcygeal ligament", "Advance only 2–3 mm; aspirate; inject slowly"],
      volume: "Armitage: 0.5 / 1.0 / 1.25 mL/kg",
      coverage: "Sacral → lumbar → mid-thoracic (by volume)"
    },
    anatomy: {
      text: "The sacral hiatus results from failure of fusion of the S5 laminae and lies between the sacral cornua, covered by the sacrococcygeal ligament. It forms the apex of an equilateral triangle with the two posterior superior iliac spines. The dural sac ends at S2 in adults but lower (S3–S4) in infants, so the needle must not be advanced far.",
      relations: ["Roof: sacrococcygeal ligament", "Lateral: sacral cornua", "Floor: posterior surface of the sacral bodies", "Cranial: dural sac (S2 adult, lower in infants)"],
      targets: "Sacral and lumbar nerve roots in the caudal epidural space"
    },
    sono: {
      probe: "Linear high-frequency (child)",
      depth: "1–3 cm",
      orientation: "Longitudinal over sacral hiatus · left = cranial, right = caudal",
      image: {
        probe: "linear", depth: 3, left: "CRANIAL", right: "CAUDAL",
        s: [
          { id: "sac", t: "bone", l: "Dorsal surface of sacrum", d: "Ends at the hiatus.", ln: [[0, 118], [120, 112], [248, 110]], lab: [70, 96] },
          { id: "scl", t: "ligament", l: "Sacrococcygeal ligament", d: "'Pop' through it.", ln: [[248, 110], [300, 128], [336, 150]], lab: [300, 100], key: true },
          { id: "cc", t: "bone", l: "Coccyx", d: "Caudal.", ln: [[336, 152], [400, 164]], lab: [370, 190] },
          { id: "floor", t: "bone", l: "Sacral canal floor", d: "Anterior wall of the canal.", ln: [[0, 204], [150, 198], [300, 192]], lab: [80, 226] },
          { id: "cs", t: "space", l: "Caudal (sacral) epidural space", d: "Between ligament/sacrum and canal floor.", p: [[120, 124], [248, 116], [320, 150], [300, 188], [120, 196]], lab: [196, 160], key: true }
        ],
        needles: [{ from: [398, 60], to: [256, 150] }],
        spreads: [{ el: [190, 160, 84, 14, -2] }]
      }
    },
    procedure: {
      position: "Lateral with hips/knees flexed (children usually under GA), or prone",
      probe: "Linear high-frequency: transverse ('frog-eye' cornua) then longitudinal",
      needle: "22G short-bevel or cannula",
      approach: "Landmark or ultrasound; ~45° to skin, then flattened",
      steps: [
        "Palpate the sacral cornua — the hiatus is the apex of an equilateral triangle with the PSISs.",
        "Insert at ~45° until a 'pop' through the sacrococcygeal ligament.",
        "Flatten the angle and advance only 2–3 mm (dural sac is lower in infants).",
        "Aspirate, then inject slowly while watching for subcutaneous swelling or ECG (T-wave/ST) changes."
      ],
      volume: "Armitage: 0.5 mL/kg (sacral), 1.0 mL/kg (lumbar), 1.25 mL/kg (mid-thoracic) — within the maximum LA dose",
      endpoint: "Easy injection, no subcutaneous swelling; on US, turbulence spreading cranially in the canal."
    },
    spread: {
      summary: "Volume determines height: sacral dermatomes → lumbar (lower abdomen, up to ~T10) → mid-thoracic.",
      covered: ["0.5 mL/kg: sacral (perineum)", "1.0 mL/kg: lumbosacral (up to ~T10)", "1.25 mL/kg: mid-thoracic"],
      spared: ["Dermatomes above the volume-dependent level"],
      motor: "Leg weakness possible; urinary retention uncommon.",
      three: {
        focus: "full", view: "anterior",
        needle: { a: "caudal", from: "caudal" },
        variants: [
          {
            id: "s", label: "0.5 mL/kg — sacral",
            regions: [
              { k: "exp", seg: "trunk", side: "both", derm: ["S2", "S5"], th: [0, 180] },
              { k: "var", seg: ["thigh", "leg"], side: "both", th: [150, 210] }
            ]
          },
          { id: "l", label: "1.0 mL/kg — lumbar (≈T10)", regions: lowerBody("T10").concat([{ k: "var", seg: "trunk", side: "both", derm: ["T9", "T9"], th: [0, 180] }]) },
          { id: "t", label: "1.25 mL/kg — mid-thoracic", regions: lowerBody("T7").concat([{ k: "var", seg: "trunk", side: "both", derm: ["T6", "T6"], th: [0, 180] }]) }
        ],
        labels: [
          { x: "Block height rises with volume", k: "exp", a: { seg: "thigh", side: "R", t: 0.4, th: 0 } },
          { x: "Needle: sacral hiatus", k: "needle", a: "caudal" }
        ]
      }
    },
    tips: ["Ultrasound confirms placement and spread, especially in older children.", "Test dose with adrenaline: watch T-wave/ST changes."],
    pitfalls: ["Advancing too far → dural puncture (low dural sac in infants).", "Subcutaneous injection (swelling) → failure."],
    complications: ["Dural puncture / total spinal", "Intravascular or intraosseous injection", "Motor block, urinary retention", "Infection"],
    pearls: ["Hiatus = unfused S5 laminae between the cornua.", "Equilateral triangle: cornua + both PSISs.", "Dural sac: S2 adult, S3–S4 infants.", "Armitage: 0.5 / 1.0 / 1.25 mL/kg.", "'Frog-eye' sign: cornua on transverse ultrasound."],
    source: { title: "Caudal Anesthesia / Pediatric Epidural and Spinal Anesthesia", url: "https://www.nysora.com/topics/sub-specialties/pediatric-anesthesia/pediatric-epidural-spinal-anesthesia-analgesia/" }
  });

  // Common clinical combinations for the "Combine blocks in 3D" view.
  const combos = [
    { id: "tka", label: "Knee arthroplasty", note: "Adductor canal + IPACK — motor-sparing anterior + posterior knee", blocks: ["adductor-canal", "ipack"] },
    { id: "below-knee", label: "Foot, ankle & below-knee", note: "Popliteal sciatic + adductor canal (saphenous, medial leg)", blocks: ["popliteal", "adductor-canal"] },
    { id: "shoulder", label: "Shoulder, diaphragm-sparing", note: "Suprascapular + infraclavicular as an interscalene alternative", blocks: ["suprascapular", "infraclavicular"] },
    { id: "laparotomy", label: "Midline laparotomy", note: "Rectus sheath (midline) + TAP (lateral wall) — bilateral in practice", blocks: ["rectus-sheath", "tap"] },
    { id: "hernia", label: "Inguinal hernia", note: "Ilioinguinal/iliohypogastric + TAP", blocks: ["ilioinguinal", "tap"] }
  ];

  window.KN_REGIONAL = {
    categories,
    blocks,
    combos,
    meta: {
      source: "NYSORA (New York School of Regional Anesthesia) — summarised and reworded, not verbatim.",
      checked: "Crosschecked against NYSORA, September 2026",
      disclaimer: "Educational summary for trained clinicians. Follow institutional protocols; always calculate the maximum local anaesthetic dose and have lipid emulsion available."
    }
  };
})();
