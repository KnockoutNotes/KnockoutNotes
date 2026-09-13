/* ==========================================================================
   KNOCKOUTNOTES — Resuscitation Chamber Engine (resuscitation-chamber.js)
   AHA ACLS & PALS Interactive 3D Flowcharts, Mechanical Pendulum Metronome,
   2-Minute CPR Cycle Countdown & Rescuer Switcher, and 5H/5T Checklist
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Web Audio & Mechanical Pendulum Metronome
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let isMetronomeRunning = false;
  let metronomeTimer = null;
  const currentBpm = 110; // AHA 100-120 bpm standard
  let metronomeCount = 0;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTickSound(isAccent) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Distinct pitch every 30 beats
      osc.frequency.setValueAtTime(isAccent ? 1046.5 : 880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.07);
    } catch (e) {
      console.warn('Audio tick error:', e);
    }
  }

  function triggerMetronomeBeat() {
    metronomeCount++;
    const isAccent = metronomeCount % 30 === 1;
    playTickSound(isAccent);

    // Pulse the LED indicator
    const led = document.getElementById('metronomeLed');
    if (led) {
      led.classList.add('active-pulse');
      setTimeout(() => led.classList.remove('active-pulse'), 90);
    }

    // Update count display
    const countEl = document.getElementById('metronomeCount');
    if (countEl) countEl.textContent = metronomeCount;
  }

  function startMetronome() {
    initAudio();
    isMetronomeRunning = true;
    metronomeCount = 0;
    const intervalMs = (60 / currentBpm) * 1000;

    // Start audio ticks
    triggerMetronomeBeat();
    metronomeTimer = setInterval(triggerMetronomeBeat, intervalMs);

    // Start physical pendulum swing
    const arm = document.getElementById('metronomeArm');
    if (arm) {
      arm.classList.add('swinging');
    }

    updateMetronomeUI(true);
  }

  function stopMetronome() {
    if (metronomeTimer) clearInterval(metronomeTimer);
    isMetronomeRunning = false;
    metronomeTimer = null;

    // Stop physical pendulum swing
    const arm = document.getElementById('metronomeArm');
    if (arm) {
      arm.classList.remove('swinging');
    }

    updateMetronomeUI(false);
  }

  function toggleMetronome() {
    if (isMetronomeRunning) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }

  function updateMetronomeUI(running) {
    const btn = document.getElementById('btnToggleMetronome');
    if (btn) {
      btn.innerHTML = running
        ? '<span>⏸</span> Pause Metronome'
        : '<span>▶</span> Start Metronome (110 BPM)';
      btn.classList.toggle('running', running);
    }
  }

  // --------------------------------------------------------------------------
  // 2. 2-Minute CPR Cycle Timer & Rescuer Switch Manager
  // --------------------------------------------------------------------------
  let cycleSecondsLeft = 120; // 2 minutes (AHA recommended rhythm/rescuer cycle)
  let totalElapsedSeconds = 0;
  let cycleCount = 1;
  let cycleTimer = null;
  let isTimerRunning = false;

  function updateCycleDisplay() {
    const countdownEl = document.getElementById('cycleCountdown');
    const progressBar = document.getElementById('cycleProgressBar');
    const cycleCountEl = document.getElementById('currentCycleCount');
    const totalTimeEl = document.getElementById('totalCodeTime');

    if (countdownEl) {
      const m = Math.floor(cycleSecondsLeft / 60);
      const s = cycleSecondsLeft % 60;
      countdownEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
      if (cycleSecondsLeft <= 10) {
        countdownEl.style.color = '#ef4444';
      } else {
        countdownEl.style.color = '#fbbf24';
      }
    }

    if (progressBar) {
      const pct = (cycleSecondsLeft / 120) * 100;
      progressBar.style.width = pct + '%';
    }

    if (cycleCountEl) {
      cycleCountEl.textContent = `Cycle #${cycleCount}`;
    }

    if (totalTimeEl) {
      const totM = Math.floor(totalElapsedSeconds / 60);
      const totS = totalElapsedSeconds % 60;
      totalTimeEl.textContent = `${totM}:${totS < 10 ? '0' : ''}${totS}`;
    }
  }

  function tickCycleTimer() {
    totalElapsedSeconds++;
    cycleSecondsLeft--;

    if (cycleSecondsLeft <= 0) {
      // 2 minutes completed! Trigger audio alert & switch prompt
      playCycleAlarm();
      cycleCount++;
      cycleSecondsLeft = 120;
      notifyRescuerSwitch();
    }

    updateCycleDisplay();
  }

  function playCycleAlarm() {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.42);
    } catch (_) {}
  }

  function notifyRescuerSwitch() {
    const btn = document.getElementById('btnSwitchRescuer');
    if (btn) {
      btn.style.animation = 'pulse 0.6s infinite alternate';
      setTimeout(() => btn.style.animation = '', 4000);
    }
  }

  function startCycleTimer() {
    if (!cycleTimer) {
      cycleTimer = setInterval(tickCycleTimer, 1000);
      isTimerRunning = true;
      updateTimerControlsUI();
    }
  }

  function pauseCycleTimer() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
    isTimerRunning = false;
    updateTimerControlsUI();
  }

  function toggleCycleTimer() {
    if (isTimerRunning) {
      pauseCycleTimer();
    } else {
      startCycleTimer();
    }
  }

  function resetCycleTimer() {
    pauseCycleTimer();
    cycleSecondsLeft = 120;
    updateCycleDisplay();
  }

  function updateTimerControlsUI() {
    const iconEl = document.getElementById('timerToggleIcon');
    const textEl = document.getElementById('timerToggleText');
    const toggleBtn = document.getElementById('btnToggleTimer');
    if (iconEl && textEl) {
      iconEl.textContent = isTimerRunning ? '⏸' : '▶';
      textEl.textContent = isTimerRunning ? 'Pause Timer' : 'Resume Timer';
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('is-paused', !isTimerRunning);
    }
  }

  function manualRescuerSwitch() {
    cycleCount++;
    cycleSecondsLeft = 120;
    playCycleAlarm();
    updateCycleDisplay();
    if (!isTimerRunning) {
      startCycleTimer();
    }
  }

  // --------------------------------------------------------------------------
  // 3. Interactive AHA Decision Flowchart Datasets
  // --------------------------------------------------------------------------
  const FLOWCHART_DATA = {
    adult: {
      arrest: {
        kicker: "AHA ACLS 2025/2026 GUIDELINES // CARDIAC ARREST ALGORITHM",
        title: "Adult Cardiac Arrest Decision Flowchart",
        nodes: [
          {
            type: "start",
            tag: "STEP 1 · INITIAL ACTIONS",
            title: "🚨 Verify Unresponsiveness & Call for Code Team",
            text: "<strong>Immediate Actions:</strong> Check responsiveness • Shout for nearby help / activate emergency response system • Check carotid pulse and breathing simultaneously for <strong>no more than 10 seconds</strong>."
          },
          {
            type: "cpr",
            tag: "STEP 2 · HIGH-QUALITY CPR",
            title: "⚡ Initiate CPR & Attach Defibrillator / Monitor",
            text: "<strong>CPR Parameters:</strong> 100–120 compressions/min • Depth 5–6 cm (2–2.4 inches) • Allow full chest recoil • Minimize interruptions (&lt;10s) • 30:2 ratio or continuous with advanced airway • Connect pads/leads."
          },
          {
            type: "decision",
            tag: "STEP 3 · RHYTHM CHECK",
            title: "⚖️ Assess Rhythm: Shockable vs Non-Shockable?",
            text: "Pause CPR briefly (&lt;5 seconds) to analyze rhythm on defibrillator screen. Determine branch:"
          }
        ],
        branch: {
          shockable: {
            title: "⚡ VF / PULSELESS VT (SHOCKABLE)",
            nodes: [
              {
                type: "shock",
                tag: "SHOCK 1",
                title: "⚡ Deliver 1 Defibrillation Shock",
                text: "<strong>Biphasic:</strong> 120–200 J (or manufacturer max, e.g. 200 J). <strong>Monophasic:</strong> 360 J. Clear patient immediately and discharge."
              },
              {
                type: "cpr",
                tag: "IMMEDIATE CPR · 2 MIN",
                title: "🔄 Resume High-Quality CPR for 2 Minutes",
                text: "<strong>Do NOT check pulse or rhythm post-shock.</strong> Start CPR immediately. Obtain IV / IO access. Start 110 BPM metronome."
              },
              {
                type: "decision",
                tag: "RHYTHM CHECK · CYCLE 2",
                title: "⚖️ Rhythm Check: Persistent VF/pVT?",
                text: "If still shockable, deliver <strong>Shock #2</strong> (equal or higher energy). Immediately resume CPR for 2 minutes."
              },
              {
                type: "drug",
                tag: "DRUG INTERVENTION",
                title: "💉 Epinephrine (Adrenaline) Administration",
                text: "<strong>Adrenaline: 1 mg IV/IO (1:10,000)</strong> after 2nd shock. Repeat every 3 to 5 minutes throughout resuscitation."
              },
              {
                type: "decision",
                tag: "RHYTHM CHECK · CYCLE 3",
                title: "⚖️ Rhythm Check: Refractory VF/pVT?",
                text: "If still shockable, deliver <strong>Shock #3</strong>. Immediately resume CPR for 2 minutes."
              },
              {
                type: "drug",
                tag: "ANTIARRHYTHMIC",
                title: "💊 Amiodarone or Lidocaine",
                text: "<strong>Amiodarone:</strong> 300 mg IV/IO bolus (second dose 150 mg after next cycle).<br><em>OR</em> <strong>Lidocaine:</strong> 1 to 1.5 mg/kg first dose, then 0.5 to 0.75 mg/kg."
              },
              {
                type: "success",
                tag: "TARGET GOAL",
                title: "🌟 ROSC or Continued Advanced Resuscitation",
                text: "If pulse returns (abrupt sustained rise in PETCO2 &ge; 40 mmHg), transition immediately to Post-Cardiac Arrest Care protocol."
              }
            ]
          },
          nonShockable: {
            title: "🛑 ASYSTOLE / PEA (NON-SHOCKABLE)",
            nodes: [
              {
                type: "decision",
                tag: "NO SHOCK",
                title: "🛑 No Shock Indicated",
                text: "Immediately resume CPR for 2 minutes without delay. Confirm leads attached and verify gain."
              },
              {
                type: "drug",
                tag: "EARLY DRUG",
                title: "💉 Early Epinephrine (Adrenaline) ASAP",
                text: "<strong>Adrenaline: 1 mg IV/IO (1:10,000)</strong> administered <em>as soon as feasible</em>. Repeat every 3 to 5 minutes."
              },
              {
                type: "cpr",
                tag: "CYCLE CPR · 2 MIN",
                title: "🔄 CPR for 2 Minutes & Identify Causes",
                text: "Continuous CPR. Interrogate and aggressively treat the <strong>5 H's and 5 T's</strong> (see checklist on the right). Ensure patent airway and adequate oxygenation."
              },
              {
                type: "decision",
                tag: "RHYTHM CHECK",
                title: "⚖️ Rhythm Check every 2 Minutes",
                text: "If rhythm becomes shockable (VF/pVT), immediately switch to Shockable pathway.<br>If organized rhythm appears, check carotid pulse for &le; 10 seconds. If pulse palpable &rarr; ROSC."
              },
              {
                type: "success",
                tag: "OUTCOME",
                title: "🌟 Post-ROSC or Consider ECPR",
                text: "If ROSC achieved, target MAP &ge; 65 mmHg, normocarbia (PaCO2 35–45), and normothermia. If refractory, evaluate for extracorporeal CPR (ECPR)."
              }
            ]
          }
        }
      },
      tachy: {
        kicker: "AHA ACLS GUIDELINES // TACHYCARDIA ALGORITHM",
        title: "Adult Tachycardia with a Pulse Decision Flowchart",
        nodes: [
          {
            type: "start",
            tag: "STEP 1 · ASSESS PATIENT",
            title: "⚡ Assess Clinical Condition (Heart Rate typically &ge; 150 bpm)",
            text: "Maintain patent airway • Oxygen (if hypoxemic &lt;94%) • Cardiac monitor, BP & O2 saturation • IV access • 12-lead ECG if available."
          },
          {
            type: "decision",
            tag: "STEP 2 · CRITICAL DECISION",
            title: "⚖️ Is Patient Hemodynamically Stable or Unstable?",
            text: "Check for symptoms caused by the tachycardia:<br>• <strong>Hypotension (SBP &lt; 90)?</strong><br>• <strong>Acutely altered mental status?</strong><br>• <strong>Signs of shock?</strong><br>• <strong>Ischemic chest discomfort?</strong><br>• <strong>Acute heart failure (pulmonary edema)?</strong>"
          }
        ],
        branch: {
          shockable: {
            title: "🚨 UNSTABLE TACHYCARDIA",
            nodes: [
              {
                type: "shock",
                tag: "SYNCHRONIZED CARDIOVERSION",
                title: "⚡ Immediate Synchronized Cardioversion",
                text: "<strong>Engage 'SYNC' button:</strong> Confirm sync markers on R waves.<br>• <strong>Narrow Regular (SVT/Flutter):</strong> 50–100 J biphasic.<br>• <strong>Narrow Irregular (AFib):</strong> 120–200 J biphasic.<br>• <strong>Wide Regular (VT):</strong> 100 J.<br>• <strong>Wide Irregular:</strong> Defibrillation dose (unsynchronized 200 J)."
              },
              {
                type: "drug",
                tag: "SEDATION",
                title: "💉 Conscious Sedation",
                text: "If patient is conscious and condition permits, administer rapid IV analgesia/sedation (e.g. Midazolam 1–2 mg, Fentanyl 50 mcg, or Ketamine 0.5 mg/kg)."
              }
            ]
          },
          nonShockable: {
            title: "🩺 STABLE TACHYCARDIA",
            nodes: [
              {
                type: "decision",
                tag: "QRS WIDTH",
                title: "⚖️ Determine QRS Duration on ECG",
                text: "Is QRS Wide (&ge; 0.12 seconds) or Narrow (&lt; 0.12 seconds)?"
              },
              {
                type: "drug",
                tag: "NARROW COMPLEX",
                title: "🧪 Narrow Regular: Vagal Maneuvers & Adenosine",
                text: "1. <strong>Modified Valsalva:</strong> 15s strain + 45s supine leg raise.<br>2. <strong>Adenosine:</strong> 6 mg rapid IV push + 20 mL flush. If no conversion in 1–2 min, give <strong>12 mg rapid IV push</strong>.<br>3. If conversion fails or AFib/Flutter: Rate control with Metoprolol 5 mg IV or Diltiazem 0.25 mg/kg."
              },
              {
                type: "drug",
                tag: "WIDE COMPLEX",
                title: "💊 Wide Monomorphic: Antiarrhythmic Infusion",
                text: "<strong>Amiodarone:</strong> 150 mg IV over 10 minutes; repeat as needed if VT recurs. Follow with maintenance infusion of 1 mg/min for 6 hours.<br><em>OR</em> <strong>Procainamide:</strong> 20–50 mg/min until suppressed or hypotension occurs."
              }
            ]
          }
        }
      },
      brady: {
        kicker: "AHA ACLS GUIDELINES // BRADYCARDIA ALGORITHM",
        title: "Adult Bradycardia with a Pulse Decision Flowchart",
        nodes: [
          {
            type: "start",
            tag: "STEP 1 · IDENTIFY BRADYCARDIA",
            title: "🐢 Heart Rate &lt; 50 bpm with Clinical Evaluation",
            text: "Maintain airway • Assist breathing as needed • Oxygen if hypoxemic • Monitor ECG, BP, SpO2 • Establish IV access • 12-lead ECG."
          },
          {
            type: "decision",
            tag: "STEP 2 · STABILITY DECISION",
            title: "⚖️ Assess Signs of Hypoperfusion",
            text: "Does the bradycardia cause: <strong>Hypotension</strong> • <strong>Acutely altered mental status</strong> • <strong>Signs of shock</strong> • <strong>Ischemic chest discomfort</strong> • <strong>Acute heart failure</strong>?"
          }
        ],
        branch: {
          shockable: {
            title: "🚨 SYMPTOMATIC / UNSTABLE",
            nodes: [
              {
                type: "drug",
                tag: "FIRST LINE",
                title: "💉 Atropine Administration",
                text: "<strong>Atropine: 1 mg IV bolus.</strong> Repeat every 3 to 5 minutes up to a maximum total dose of <strong>3 mg</strong>.<br><em>Note: Ineffective in Mobitz II or 3rd-degree heart block with wide QRS.</em>"
              },
              {
                type: "shock",
                tag: "IF ATROPINE INEFFECTIVE",
                title: "⚡ Transcutaneous Pacing (TCP)",
                text: "Apply pacing pads immediately. Set demand rate 60–70 bpm. Increase current (mA) until electrical and mechanical pulse capture is confirmed (check femoral pulse)."
              },
              {
                type: "drug",
                tag: "VASOACTIVE INFUSIONS",
                title: "💉 Dopamine or Epinephrine Infusion",
                text: "• <strong>Dopamine infusion:</strong> 5 to 20 mcg/kg/min, titrated to patient response.<br>• <strong>Epinephrine infusion:</strong> 2 to 10 mcg/min, titrated to hemodynamics."
              }
            ]
          },
          nonShockable: {
            title: "🩺 ASYMPTOMATIC / STABLE",
            nodes: [
              {
                type: "cpr",
                tag: "MONITOR & OBSERVE",
                title: "🔍 Continuous Monitoring",
                text: "No acute pharmacological or electrical intervention required. Continue monitoring vitals, obtain 12-lead ECG, investigate reversible causes, and consult cardiology if Mobitz II or complete heart block is identified."
              }
            ]
          }
        }
      }
    },
    paeds: {
      arrest: {
        kicker: "AHA PALS GUIDELINES // PEDIATRIC CARDIAC ARREST ALGORITHM",
        title: "Pediatric Cardiac Arrest Decision Flowchart",
        nodes: [
          {
            type: "start",
            tag: "STEP 1 · INITIAL ACTIONS",
            title: "👶 Activate Emergency Response & High-Quality PALS CPR",
            text: "Verify arrest • Call for pediatric code team • <strong>CPR Ratio:</strong> 15:2 for 2 rescuers (30:2 if lone rescuer) • Compressions at 100–120 bpm, 1/3 AP diameter of chest depth • Provide 100% oxygen with bag-valve-mask."
          },
          {
            type: "decision",
            tag: "STEP 2 · RHYTHM CHECK",
            title: "⚖️ Attach Monitor & Check Rhythm: Shockable?",
            text: "Assess rhythm on pediatric defibrillator pads:"
          }
        ],
        branch: {
          shockable: {
            title: "⚡ VF / PULSELESS VT (PEDIATRIC)",
            nodes: [
              {
                type: "shock",
                tag: "SHOCK 1 · 2 J/KG",
                title: "⚡ Deliver 1st Shock at 2 J/kg",
                text: "Manual defibrillator preferred (or AED with pediatric attenuator). Clear patient and deliver <strong>2 J/kg</strong>."
              },
              {
                type: "cpr",
                tag: "CPR · 2 MIN",
                title: "🔄 Immediate CPR for 2 Minutes",
                text: "Resume compressions immediately. Establish IV or intraosseous (IO) access. Start 110 bpm metronome."
              },
              {
                type: "shock",
                tag: "SHOCK 2 · 4 J/KG",
                title: "⚡ Shock #2 at 4 J/kg (if still VF/pVT)",
                text: "Deliver <strong>4 J/kg</strong>. Subsequent shocks &ge; 4 J/kg (maximum 10 J/kg or adult dose 200 J). Immediately resume CPR."
              },
              {
                type: "drug",
                tag: "PEDIATRIC DRUG",
                title: "💉 Epinephrine (0.01 mg/kg)",
                text: "<strong>Adrenaline: 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000)</strong> after 2nd shock. Repeat every 3–5 minutes."
              },
              {
                type: "drug",
                tag: "ANTIARRHYTHMIC",
                title: "💊 Amiodarone or Lidocaine",
                text: "<strong>Amiodarone:</strong> 5 mg/kg IV/IO bolus (can repeat up to 2 times, total 15 mg/kg).<br><em>OR</em> <strong>Lidocaine:</strong> 1 mg/kg IV/IO loading dose."
              }
            ]
          },
          nonShockable: {
            title: "🛑 ASYSTOLE / PEA (PEDIATRIC)",
            nodes: [
              {
                type: "decision",
                tag: "NO SHOCK",
                title: "🛑 No Shock Indicated",
                text: "Immediately resume high-quality CPR (15:2 ratio). Hypoxia is the most common etiology!"
              },
              {
                type: "drug",
                tag: "IMMEDIATE EPI",
                title: "💉 Early Epinephrine (0.01 mg/kg)",
                text: "<strong>Adrenaline: 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000)</strong> given as early as possible. Repeat every 3 to 5 minutes."
              },
              {
                type: "cpr",
                tag: "OXYGENATE & CAUSES",
                title: "🔄 Treat Reversible Causes",
                text: "Interrogate: <strong>Hypoxia</strong>, <strong>Hypovolemia</strong>, <strong>Hypothermia</strong>, <strong>Hypoglycemia</strong>, <strong>Hyperkalemia</strong>, <strong>Acidosis</strong>, <strong>Tension Pneumothorax</strong>, <strong>Toxins</strong>."
              }
            ]
          }
        }
      },
      tachy: {
        kicker: "AHA PALS GUIDELINES // PEDIATRIC TACHYCARDIA ALGORITHM",
        title: "Pediatric Tachycardia Decision Flowchart",
        nodes: [
          {
            type: "start",
            tag: "STEP 1 · EVALUATION",
            title: "👶 Assess Cardiopulmonary Status & Rate",
            text: "Evaluate pulse and perfusion. Infants: rate typically &gt; 220 bpm. Children: rate typically &gt; 180 bpm. Support airway, give oxygen, attach 12-lead ECG."
          },
          {
            type: "decision",
            tag: "STEP 2 · SVT VS SINUS TACHYCARDIA",
            title: "⚖️ Differentiate SVT from Sinus Tachycardia",
            text: "<strong>Sinus Tachycardia:</strong> P waves present, variable rate, underlying cause (fever, pain, dehydration).<br><strong>SVT:</strong> Abrupt onset, no P waves, no heart rate variability with activity."
          }
        ],
        branch: {
          shockable: {
            title: "⚡ PROBABLE SVT (POOR PERFUSION)",
            nodes: [
              {
                type: "drug",
                tag: "VAGAL / ADENOSINE",
                title: "❄️ Vagal Maneuver & Adenosine",
                text: "1. <strong>Vagal:</strong> Ice bag to upper face for 15–20s (do not occlude airway).<br>2. <strong>Adenosine:</strong> <strong>0.1 mg/kg rapid IV/IO</strong> (max 6 mg) + 5–10 mL flush. Second dose: <strong>0.2 mg/kg</strong> (max 12 mg)."
              },
              {
                type: "shock",
                tag: "UNSTABLE OR REFRACTORY",
                title: "⚡ Synchronized Cardioversion",
                text: "If unstable or adenosine fails: <strong>0.5 to 1 J/kg</strong> synchronized cardioversion; increase to <strong>2 J/kg</strong> if needed. Sedate if feasible."
              }
            ]
          },
          nonShockable: {
            title: "🩺 SINUS TACHYCARDIA",
            nodes: [
              {
                type: "cpr",
                tag: "TREAT CAUSE",
                title: "💧 Treat Underlying Cause",
                text: "Do NOT cardiovert sinus tachycardia! Treat the trigger: IV fluid bolus (20 mL/kg isotonic crystalloid) for dehydration/shock, antipyretics for fever, analgesia for pain."
              }
            ]
          }
        }
      },
      brady: {
        kicker: "AHA PALS GUIDELINES // PEDIATRIC BRADYCARDIA ALGORITHM",
        title: "Pediatric Bradycardia with Cardiorespiratory Compromise",
        nodes: [
          {
            type: "start",
            tag: "STEP 1 · OXYGENATION FIRST",
            title: "👶 Maintain Airway, Assist Breathing with 100% Oxygen",
            text: "In pediatrics, almost all bradycardia is secondary to <strong>hypoxia or respiratory arrest</strong>. Ventilate immediately with bag-mask and 100% O2."
          },
          {
            type: "decision",
            tag: "STEP 2 · CRITICAL HR THRESHOLD",
            title: "⚖️ Heart Rate &lt; 60 bpm with Poor Perfusion despite Oxygenation?",
            text: "Check pulse for &le; 10 seconds. Is heart rate &lt; 60 bpm with signs of poor perfusion?"
          }
        ],
        branch: {
          shockable: {
            title: "🚨 HR < 60/MIN WITH POOR PERFUSION",
            nodes: [
              {
                type: "cpr",
                tag: "START CPR",
                title: "🔄 START CHEST COMPRESSIONS IMMEDIATELY",
                text: "<strong>In pediatric resuscitation, HR &lt; 60 with poor perfusion despite effective ventilation REQUIRES CPR!</strong> Ratio 15:2."
              },
              {
                type: "drug",
                tag: "MEDICATIONS",
                title: "💉 Epinephrine & Atropine",
                text: "• <strong>Adrenaline: 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000)</strong> every 3–5 min.<br>• <strong>Atropine: 0.02 mg/kg</strong> (min 0.1 mg, max 0.5 mg) for increased vagal tone or primary AV block."
              }
            ]
          },
          nonShockable: {
            title: "🩺 ADEQUATE PERFUSION (HR > 60)",
            nodes: [
              {
                type: "cpr",
                tag: "SUPPORT BREATHING",
                title: "💨 Continue Ventilation & Monitor",
                text: "Support ventilation and oxygenation. Re-assess heart rate every 2 minutes. Monitor ECG and temperature."
              }
            ]
          }
        }
      }
    }
  };

  // State
  let activePatient = 'adult';
  let activeScenario = 'arrest';

  // Render Flowchart
  function renderFlowchart() {
    const canvas = document.getElementById('flowchartCanvas');
    const kickerEl = document.getElementById('flowchartKicker');
    const titleEl = document.getElementById('flowchartTitle');
    if (!canvas) return;

    const data = FLOWCHART_DATA[activePatient][activeScenario];
    if (!data) return;

    if (kickerEl) kickerEl.textContent = data.kicker;
    if (titleEl) titleEl.textContent = data.title;

    let html = '';

    // 1. Render Linear Flow Nodes
    data.nodes.forEach((node, idx) => {
      html += `
        <div class="flow-node node-${node.type}" tabindex="0">
          <div class="node-header">
            <h4 class="node-title">${node.title}</h4>
            <span class="node-tag">${node.tag}</span>
          </div>
          <div class="node-body">${node.text}</div>
        </div>
      `;

      if (idx < data.nodes.length - 1) {
        html += `<div class="flow-arrow-down"></div>`;
      }
    });

    // 2. Render Branching Split (Shockable vs Non-Shockable or Unstable vs Stable)
    if (data.branch) {
      html += `
        <div class="flow-arrow-down">
          <span class="flow-arrow-branch-label">BRANCHING DECISION</span>
        </div>
        <div class="flow-branch-container">
          <div class="branch-col shockable">
            <div class="branch-col-header">${data.branch.shockable.title}</div>
            ${data.branch.shockable.nodes.map(n => `
              <div class="flow-node node-${n.type}" tabindex="0">
                <div class="node-header">
                  <h4 class="node-title">${n.title}</h4>
                  <span class="node-tag">${n.tag}</span>
                </div>
                <div class="node-body">${n.text}</div>
              </div>
            `).join('<div class="flow-arrow-down"></div>')}
          </div>

          <div class="branch-col non-shockable">
            <div class="branch-col-header">${data.branch.nonShockable.title}</div>
            ${data.branch.nonShockable.nodes.map(n => `
              <div class="flow-node node-${n.type}" tabindex="0">
                <div class="node-header">
                  <h4 class="node-title">${n.title}</h4>
                  <span class="node-tag">${n.tag}</span>
                </div>
                <div class="node-body">${n.text}</div>
              </div>
            `).join('<div class="flow-arrow-down"></div>')}
          </div>
        </div>
      `;
    }

    canvas.innerHTML = html;
    init3DHaptics();
  }

  // --------------------------------------------------------------------------
  // 4. Interactive 3D Haptic Mouse & Touch Physics
  // --------------------------------------------------------------------------
  function init3DHaptics() {
    const nodes = document.querySelectorAll('.flow-node');
    nodes.forEach(node => {
      let rAF = null;

      // Desktop cursor tracking tilt with clamped angles and smooth easing
      node.addEventListener('mousemove', e => {
        if (rAF) cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(() => {
          const rect = node.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Clamp to max +/- 3.5 deg to prevent jitter on long or stacked cards
          const rawRotX = ((y - centerY) / centerY) * -5;
          const rawRotY = ((x - centerX) / centerX) * 5;
          const rotateX = Math.max(-3.5, Math.min(3.5, rawRotX)).toFixed(2);
          const rotateY = Math.max(-3.5, Math.min(3.5, rawRotY)).toFixed(2);

          node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
        });
      });

      node.addEventListener('mouseleave', () => {
        if (rAF) cancelAnimationFrame(rAF);
        node.style.transform = '';
      });

      // Mobile touch physics: subtle haptic lift, no rotational oscillation
      node.addEventListener('touchstart', () => {
        node.style.transform = 'scale(1.015) translateZ(6px)';
        node.style.borderColor = 'var(--accent-cyan)';
      }, { passive: true });

      node.addEventListener('touchend', () => {
        setTimeout(() => {
          node.style.transform = '';
          node.style.borderColor = '';
        }, 180);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. Interactive 5 H's and 5 T's Checklist
  // --------------------------------------------------------------------------
  function initChecklist() {
    const items = document.querySelectorAll('.check-item');
    items.forEach(item => {
      const chk = item.querySelector('input[type="checkbox"]');
      if (!chk) return;

      item.addEventListener('click', e => {
        if (e.target !== chk) {
          chk.checked = !chk.checked;
        }
        item.classList.toggle('checked', chk.checked);
      });

      chk.addEventListener('change', () => {
        item.classList.toggle('checked', chk.checked);
      });
    });

    const resetBtn = document.getElementById('btnResetChecklist');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        items.forEach(item => {
          const chk = item.querySelector('input[type="checkbox"]');
          if (chk) chk.checked = false;
          item.classList.remove('checked');
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 6. Navigation Tabs Wiring
  // --------------------------------------------------------------------------
  function initTabs() {
    const patientTabs = document.querySelectorAll('.chamber-tab-btn');
    patientTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        patientTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePatient = btn.dataset.patient;
        renderFlowchart();
      });
    });

    const subtabBtns = document.querySelectorAll('.chamber-subtab-btn');
    subtabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subtabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeScenario = btn.dataset.scenario;
        renderFlowchart();
      });
    });

    // Metronome button
    const btnToggle = document.getElementById('btnToggleMetronome');
    if (btnToggle) {
      btnToggle.addEventListener('click', toggleMetronome);
    }

    // Switch rescuer button
    const btnSwitch = document.getElementById('btnSwitchRescuer');
    if (btnSwitch) {
      btnSwitch.addEventListener('click', manualRescuerSwitch);
    }

    // Cycle Timer Pause/Resume toggle button
    const btnToggleTimer = document.getElementById('btnToggleTimer');
    if (btnToggleTimer) {
      btnToggleTimer.addEventListener('click', toggleCycleTimer);
    }

    // Cycle Timer Reset button
    const btnResetTimer = document.getElementById('btnResetTimer');
    if (btnResetTimer) {
      btnResetTimer.addEventListener('click', resetCycleTimer);
    }
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initChecklist();
    renderFlowchart();
    updateCycleDisplay();
    startCycleTimer(); // Auto-start the 2-minute cycle timer for immediate emergency readiness
  });

  // Expose to window
  window.KnockoutResuscitationChamber = {
    startMetronome,
    stopMetronome,
    toggleMetronome,
    manualRescuerSwitch,
    startCycleTimer,
    pauseCycleTimer,
    toggleCycleTimer,
    resetCycleTimer
  };
})();
