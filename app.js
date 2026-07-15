(() => {
  const loadStylesheet = (href) => {
    if (document.querySelector(`link[href^="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  loadStylesheet('grain.css');
  loadStylesheet('polish.css?v=20260715-red-boundary-3');

  const scenarios = {
    repeat: {
      boundary: 'Failure learning → strategy change',
      decision: 'Do not change the PM until failure mode, confidence, authority, and verification are explicit.',
      evidence: 'The next recurrence check can show whether the intervention actually changed the pattern.',
      zones: ['failure', 'strategy']
    },
    alert: {
      boundary: 'Condition evidence → work authority',
      decision: 'Convert the alert into prioritized, executable work—or deliberately defer it with a named owner and rationale.',
      evidence: 'The signal, response window, owner, work route, and disposition remain traceable together.',
      zones: ['condition', 'work']
    },
    spare: {
      boundary: 'Asset context → materials resilience',
      decision: 'Set service level, substitute, repair, pooling, and reorder logic from consequence, lead time, and interchangeability.',
      evidence: 'Stocking decisions can be reviewed against actual asset exposure and work interruption.',
      zones: ['asset', 'materials']
    },
    pm: {
      boundary: 'Work evidence → strategy change',
      decision: 'Retire, revise, or standardize the task only when burden, recurrence, asset consequence, and closure evidence are visible.',
      evidence: 'The next planning cycle can compare maintenance effort with observed risk and outcome.',
      zones: ['work', 'strategy']
    }
  };

  const heroEmphasis = document.querySelector('.hero h1 em');
  if (heroEmphasis && !heroEmphasis.querySelector('span')) {
    heroEmphasis.replaceChildren();
    const lineOne = document.createElement('span');
    const lineTwo = document.createElement('span');
    lineOne.textContent = 'at the';
    lineTwo.textContent = 'boundaries.';
    heroEmphasis.append(lineOne, lineTwo);
  }

  const field = document.querySelector('.grain-field');
  if (!field) return;

  const buttons = [...document.querySelectorAll('.scenario')];
  const reset = document.querySelector('[data-reset]');
  const readout = document.querySelector('.decision-readout');
  const readouts = {
    boundary: document.querySelector('[data-readout="boundary"]'),
    decision: document.querySelector('[data-readout="decision"]'),
    evidence: document.querySelector('[data-readout="evidence"]')
  };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new Set();

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  };

  const clearSequence = () => {
    timers.forEach(window.clearTimeout);
    timers.clear();
  };

  const status = document.createElement('div');
  status.className = 'grain-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Boundary observed';
  field.appendChild(status);

  const phaseRail = document.createElement('div');
  phaseRail.className = 'phase-rail';
  phaseRail.setAttribute('aria-label', 'Scenario explanation sequence');
  phaseRail.innerHTML = `
    <span class="phase-step" data-phase-step="diagnose">01 · Observe boundary</span>
    <span class="phase-step" data-phase-step="decide">02 · Frame decision</span>
    <span class="phase-step" data-phase-step="verified">03 · Confirm evidence</span>
  `;
  field.insertAdjacentElement('afterend', phaseRail);

  const phaseSteps = [...phaseRail.querySelectorAll('.phase-step')];
  const phaseOrder = ['diagnose', 'decide', 'verified'];

  const setPhase = (phase, label) => {
    field.dataset.phase = phase;
    status.textContent = label;
    const activeIndex = Math.max(0, phaseOrder.indexOf(phase));
    phaseSteps.forEach((step, index) => {
      step.classList.toggle('is-active', index === activeIndex);
      step.classList.toggle('is-complete', index < activeIndex || phase === 'verified');
    });
  };

  const prepareBoundary = (key) => {
    field.querySelectorAll('.fracture').forEach(path => {
      path.classList.remove('is-current');
      const length = Math.ceil(path.getTotalLength());
      path.style.setProperty('--path-length', String(length));
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    });
    field.querySelector(`[data-fracture="${key}"]`)?.classList.add('is-current');
  };

  function applyScenario(key, { animate = true } = {}) {
    const scenarioKey = scenarios[key] ? key : 'repeat';
    const scenario = scenarios[scenarioKey];
    clearSequence();

    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.scenario === scenarioKey));
    });

    field.dataset.scenario = scenarioKey;
    field.setAttribute('aria-busy', 'true');
    readout?.classList.remove('is-revealed');
    readout?.classList.add('is-updating');

    document.querySelectorAll('.grain-zone').forEach(zone => {
      zone.classList.toggle('is-involved', scenario.zones.includes(zone.dataset.zone));
    });

    Object.entries(readouts).forEach(([name, node]) => {
      if (node) node.textContent = scenario[name];
    });

    prepareBoundary(scenarioKey);
    field.getBoundingClientRect();

    const shouldAnimate = animate && !reduceMotion.matches;
    if (!shouldAnimate) {
      setPhase('verified', 'Evidence confirmed');
      readout?.classList.remove('is-updating');
      readout?.classList.add('is-revealed');
      field.setAttribute('aria-busy', 'false');
      return;
    }

    setPhase('diagnose', 'Boundary observed');

    schedule(() => {
      setPhase('decide', 'Decision framed');
      readout?.classList.remove('is-updating');
      readout?.classList.add('is-revealed');
    }, 640);

    schedule(() => {
      setPhase('verified', 'Evidence confirmed');
      field.setAttribute('aria-busy', 'false');
    }, 1320);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => applyScenario(button.dataset.scenario));
  });
  reset?.addEventListener('click', () => applyScenario('repeat'));
  reduceMotion.addEventListener?.('change', () => applyScenario(field.dataset.scenario || 'repeat', { animate: false }));

  applyScenario('repeat');
})();
