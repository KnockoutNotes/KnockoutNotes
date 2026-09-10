/* ==========================================================================
   KNOCKOUTNOTES — Ventilator Sequencing (ventilator-animation.js)
   Generic step-sequencer used by: Start Machine, Guided Tour. Both walk an
   array of {componentIds, caption} steps, focusing the camera and
   highlighting components one step at a time, with play/pause/step/restart.
   ========================================================================== */

export function createSequencer(engine, steps, opts) {
  opts = opts || {};
  let index = 0;
  let playing = false;
  let timer = null;
  const stepMs = opts.stepMs || 3200;
  const onStep = opts.onStep || function () {};
  const onEnd = opts.onEnd || function () {};

  function showStep(i) {
    index = Math.max(0, Math.min(steps.length - 1, i));
    const step = steps[index];
    const ids = step.componentIds || (step.componentId ? [step.componentId] : []);
    engine.dimAllExcept(ids);
    engine.clearHighlight();
    engine.highlightComponents(ids);
    if (ids[0]) engine.focusOnComponent(ids[0], { distanceFactor: 7 });
    onStep(step, index, steps.length);
  }

  function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

  function scheduleNext() {
    clearTimer();
    if (!playing) return;
    timer = setTimeout(() => {
      if (index >= steps.length - 1) {
        playing = false;
        onEnd();
        return;
      }
      showStep(index + 1);
      scheduleNext();
    }, stepMs);
  }

  return {
    start() { playing = true; showStep(0); scheduleNext(); },
    pause() { playing = false; clearTimer(); },
    resume() { if (index < steps.length - 1) { playing = true; scheduleNext(); } },
    next() { playing = false; clearTimer(); showStep(index + 1); },
    prev() { playing = false; clearTimer(); showStep(index - 1); },
    restart() { playing = true; showStep(0); scheduleNext(); },
    stop() { playing = false; clearTimer(); engine.clearDim(); engine.clearHighlight(); },
    isPlaying: () => playing,
    currentIndex: () => index,
    totalSteps: () => steps.length
  };
}

// Bellows/ventilator "running" visual toggle, kept separate from the step
// sequencer since it's a continuous animation, not a discrete step walk.
export function setVentilatorAnimating(engine, on, rateHz) {
  engine.setVentilatorRunning(on, rateHz);
}

// Explode / X-ray are simple booleans on the engine already; exposed here
// too so ventilator-ui.js only needs to import from one "animation" module
// for every toggle-style visual mode.
export function setExploded(engine, on) { engine.setExploded(on); }
export function setXray(engine, on) { engine.setXray(on); }

window.VentilatorAnimation = { createSequencer, setVentilatorAnimating, setExploded, setXray };
