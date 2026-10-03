(() => {
  'use strict';

  const demo = document.querySelector('[data-coastline-demo]');
  if (!demo || demo.dataset.initialized === 'true') return;
  demo.dataset.initialized = 'true';

  const svg = demo.querySelector('#coastline-demo-svg');
  const referencePath = demo.querySelector('#coastline-reference-path');
  const measurementLine = demo.querySelector('#coastline-measurement-line');
  const measurementPoints = demo.querySelector('#coastline-measurement-points');
  const ruler = demo.querySelector('#coastline-ruler');
  const range = demo.querySelector('#coastline-scale-range');
  const scaleOutput = demo.querySelector('#coastline-scale-output');
  const levelStat = demo.querySelector('#coastline-level-stat');
  const pointsStat = demo.querySelector('#coastline-points-stat');
  const lengthStat = demo.querySelector('#coastline-length-stat');
  const explanation = demo.querySelector('#coastline-explanation');
  const referenceToggle = demo.querySelector('.demo-reference-toggle');
  const resetButton = demo.querySelector('.demo-reset');
  const presetButtons = [...demo.querySelectorAll('.demo-preset')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaultLevel = 5;

  const levelInfo = {
    8: { label: '很大', step: 185, explanation: '尺子较大时，很多细小凹凸被直接跨过去。' },
    7: { label: '较大', step: 150, explanation: '尺子仍然较大，测量会跳过一部分边界细节。' },
    6: { label: '偏大', step: 120, explanation: '尺子变小后，测量开始捕捉更多边界细节。' },
    5: { label: '中等', step: 92, explanation: '中等大小的尺子，能够保留一部分弯曲细节。' },
    4: { label: '偏小', step: 70, explanation: '尺子继续变小，折线开始更贴近复杂边界。' },
    3: { label: '较小', step: 52, explanation: '更小的尺子能跟随更多弯曲，因此测得长度通常更长。' },
    2: { label: '小', step: 36, explanation: '小尺子捕捉到更多细节，模拟长度通常会增加。' },
    1: { label: '最小', step: 24, explanation: '更小的尺子能跟随更多弯曲，因此测得长度通常更长。' }
  };

  function getSampleStep(level) {
    return levelInfo[level].step;
  }

  function samplePath(path, step) {
    const totalLength = path.getTotalLength();
    const points = [];
    for (let distance = 0; distance < totalLength; distance += step) {
      points.push(path.getPointAtLength(distance));
    }
    points.push(path.getPointAtLength(totalLength));
    return points;
  }

  function calculatePolylineLength(points) {
    return points.slice(1).reduce((sum, point, index) => {
      const previous = points[index];
      return sum + Math.hypot(point.x - previous.x, point.y - previous.y);
    }, 0);
  }

  function renderMeasurement(points) {
    measurementLine.setAttribute('points', points.map((point) => `${point.x},${point.y}`).join(' '));
    measurementLine.style.transition = reducedMotion ? 'none' : 'points 240ms ease-out';
  }

  function renderMeasurementPoints(points) {
    const fragment = document.createDocumentFragment();
    points.forEach((point) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '5');
      circle.setAttribute('class', 'demo-sample-point');
      fragment.appendChild(circle);
    });
    measurementPoints.replaceChildren(fragment);
  }

  function updateRuler(points) {
    const middle = points[Math.floor(points.length / 2)];
    ruler.setAttribute('transform', `translate(${middle.x} ${middle.y - 24})`);
  }

  function updateExplanation(level) {
    explanation.textContent = levelInfo[level].explanation;
  }

  function updateStats(level, points, length) {
    scaleOutput.value = level;
    scaleOutput.textContent = level;
    levelStat.textContent = levelInfo[level].label;
    pointsStat.textContent = points.length;
    lengthStat.textContent = `${length.toFixed(1)} 模拟单位`;
    updateExplanation(level);
  }

  function updatePresetState(level) {
    presetButtons.forEach((button) => {
      const active = Number(button.dataset.demoLevel) === level;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function update(level) {
    const points = samplePath(referencePath, getSampleStep(level));
    const length = calculatePolylineLength(points);
    renderMeasurement(points);
    renderMeasurementPoints(points);
    updateRuler(points);
    updateStats(level, points, length);
    updatePresetState(level);
  }

  function setPreset(level) {
    range.value = String(level);
    update(level);
  }

  function reset() {
    setPreset(defaultLevel);
    referenceToggle.checked = true;
    referencePath.classList.remove('is-hidden');
  }

  range.addEventListener('input', () => update(Number(range.value)));
  presetButtons.forEach((button) => {
    button.addEventListener('click', () => setPreset(Number(button.dataset.demoLevel)));
  });
  resetButton.addEventListener('click', reset);
  referenceToggle.addEventListener('change', () => {
    referencePath.classList.toggle('is-hidden', !referenceToggle.checked);
  });

  update(defaultLevel);
})();
