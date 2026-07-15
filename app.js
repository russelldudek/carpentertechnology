(() => {
  const visualSystem = document.createElement('link');
  visualSystem.rel = 'stylesheet';
  visualSystem.href = 'grain.css';
  document.head.appendChild(visualSystem);

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

  const field = document.querySelector('.grain-field');
  if (!field) return;
  const buttons = [...document.querySelectorAll('.scenario')];
  const reset = document.querySelector('[data-reset]');
  const readouts = {
    boundary: document.querySelector('[data-readout="boundary"]'),
    decision: document.querySelector('[data-readout="decision"]'),
    evidence: document.querySelector('[data-readout="evidence"]')
  };
  let repairTimer;

  function applyScenario(key, { animate = true } = {}) {
    const scenario = scenarios[key] || scenarios.repeat;
    clearTimeout(repairTimer);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === key)));
    field.dataset.scenario = key;
    field.classList.remove('is-fractured', 'is-repaired');
    document.querySelectorAll('.grain-zone').forEach(zone => {
      zone.classList.toggle('is-involved', scenario.zones.includes(zone.dataset.zone));
    });
    Object.entries(readouts).forEach(([name, node]) => { if (node) node.textContent = scenario[name]; });
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => {
        field.classList.add('is-fractured');
        repairTimer = setTimeout(() => field.classList.add('is-repaired'), 520);
      });
    } else {
      field.classList.add('is-fractured', 'is-repaired');
    }
  }

  buttons.forEach(button => button.addEventListener('click', () => applyScenario(button.dataset.scenario)));
  reset?.addEventListener('click', () => applyScenario('repeat'));
  applyScenario('repeat');
})();