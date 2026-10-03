(() => {
  'use strict';

  const DATA_ROOT = 'data/';
  const colors = {
    natural: '#8cc9c4',
    artificial: '#e5c27b',
    cauliflower: '#6d8f63',
    observed: '#8cc9c4',
    predicted: '#e5c27b',
    reference: '#9aa8aa',
    grid: 'rgba(126, 169, 174, .2)',
    text: '#d5e3e2',
    lightText: '#324c57'
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    const headers = lines.shift().split(',');
    return lines.map((line) => {
      const cells = line.split(',');
      return headers.reduce((row, header, index) => {
        row[header] = cells[index] ?? '';
        return row;
      }, {});
    });
  }

  async function loadCsv(name) {
    const url = new URL(`${DATA_ROOT}${name}`, document.baseURI);
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`CSV load failed: ${name}, HTTP ${response.status}`);
      }
      const rows = parseCsv(await response.text());
      console.info(`[charts] ${name} loaded: ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error(`[charts] CSV load error: ${name}`, error);
      throw error;
    }
  }

  function baseOptions({ dark = false, xTitle = '', yTitle = '', logarithmic = false } = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: 650 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: dark ? colors.text : colors.lightText, usePointStyle: true, boxWidth: 10, padding: 18 }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y;
              return `${context.dataset.label}：${Number(value).toFixed(3)} km`;
            }
          }
        }
      },
      scales: {
        x: {
          type: logarithmic ? 'logarithmic' : 'category',
          title: { display: Boolean(xTitle), text: xTitle, color: dark ? colors.text : colors.lightText },
          ticks: { color: dark ? colors.text : colors.lightText, maxRotation: 45, minRotation: 0 },
          grid: { color: colors.grid }
        },
        y: {
          title: { display: Boolean(yTitle), text: yTitle, color: dark ? colors.text : colors.lightText },
          ticks: { color: dark ? colors.text : colors.lightText },
          grid: { color: colors.grid }
        }
      }
    };
  }

  function getCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) {
      console.error(`[charts] canvas not found: ${id}`);
      return null;
    }
    return canvas;
  }

  function getFallback(canvas) {
    let fallback = canvas.parentElement.querySelector('.chart-fallback');
    if (!fallback) {
      fallback = document.createElement('p');
      fallback.className = 'chart-fallback';
      fallback.textContent = '图表数据暂时未加载；页面文字结论仍然有效。';
      fallback.hidden = true;
      canvas.insertAdjacentElement('afterend', fallback);
    }
    return fallback;
  }

  function chartOrFallback(id, config) {
    const canvas = getCanvas(id);
    if (!canvas) return null;
    const fallback = getFallback(canvas);
    canvas.hidden = false;
    fallback.hidden = true;
    if (typeof window.Chart === 'undefined') {
      canvas.hidden = true;
      fallback.hidden = false;
      console.error('[charts] Chart.js failed to load');
      return null;
    }
    try {
      const chart = new window.Chart(canvas, config);
      console.info(`[charts] ${id} chart created`);
      return chart;
    } catch (error) {
      canvas.hidden = true;
      fallback.hidden = false;
      console.error(`[charts] ${id} chart creation failed`, error);
      return null;
    }
  }

  function lineDatasets(rows) {
    return [
      {
        label: '自然岸线',
        data: rows.map((row) => Number(row.natural_km)),
        borderColor: colors.natural,
        backgroundColor: colors.natural,
        pointStyle: 'circle',
        pointRadius: 4,
        tension: 0.18
      },
      {
        label: '人工岸线',
        data: rows.map((row) => Number(row.artificial_km)),
        borderColor: colors.artificial,
        backgroundColor: colors.artificial,
        pointStyle: 'rectRot',
        pointRadius: 4,
        borderDash: [6, 4],
        tension: 0.18
      }
    ];
  }

  function renderArcgis(rows) {
    const labels = rows.map((row) => `${row.scale_m} m`);
    chartOrFallback('arcgisChart', {
      type: 'line',
      data: { labels, datasets: lineDatasets(rows) },
      options: baseOptions({ dark: true, xTitle: '量测尺度（大 → 小）', yTitle: '岸线长度（km）' })
    });
  }

  function renderCompass(rows) {
    const labels = rows.map((row) => `${row.scale_mm} mm`);
    chartOrFallback('compassChart', {
      type: 'line',
      data: { labels, datasets: lineDatasets(rows) },
      options: baseOptions({ dark: true, xTitle: '圆规步长（大 → 小）', yTitle: '测得岸线长度（km）' })
    });
  }

  function renderCauliflower(rows) {
    const labels = rows.map((row) => `${row.scale_mm} mm`);
    chartOrFallback('cauliflowerChart', {
      type: 'line',
      data: { labels, datasets: [{ label: '轮廓长度', data: rows.map((row) => Number(row.length_mm)), borderColor: colors.cauliflower, backgroundColor: colors.cauliflower, pointRadius: 5, pointStyle: 'circle', tension: 0.18 }] },
      options: {
        ...baseOptions({ xTitle: '量测尺度（大 → 小）', yTitle: '轮廓长度（mm）' }),
        plugins: { legend: { labels: { color: colors.lightText, usePointStyle: true } }, tooltip: { callbacks: { label: (context) => `轮廓长度：${Number(context.parsed.y).toFixed(1)} mm` } } }
      }
    });
  }

  function renderLog(rows) {
    const points = rows.map((row) => ({ x: Math.log(Number(row.scale_m)), y: Math.log(Number(row.natural_km)) }));
    const xValues = points.map((point) => point.x);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    chartOrFallback('logChart', {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: '自然岸线 ArcGIS',
            data: points,
            borderColor: colors.natural,
            backgroundColor: colors.natural,
            pointRadius: 5,
            pointStyle: 'circle'
          },
          {
            label: '最终报告拟合式：Y = −0.1842X + 5.6267',
            data: [{ x: xMin, y: -0.1842 * xMin + 5.6267 }, { x: xMax, y: -0.1842 * xMax + 5.6267 }],
            borderColor: colors.artificial,
            backgroundColor: colors.artificial,
            pointRadius: 0,
            borderWidth: 2,
            showLine: true,
            pointStyle: 'line'
          }
        ]
      },
      options: {
        ...baseOptions({ xTitle: 'ln(量测尺度 / m)', yTitle: 'ln(岸线长度 / km)' }),
        scales: {
          x: { type: 'linear', title: { display: true, text: 'ln(量测尺度 / m)' }, ticks: { color: colors.lightText }, grid: { color: colors.grid } },
          y: { type: 'linear', title: { display: true, text: 'ln(岸线长度 / km)' }, ticks: { color: colors.lightText }, grid: { color: colors.grid } }
        },
        plugins: { legend: { labels: { color: colors.lightText, usePointStyle: true } }, tooltip: { callbacks: { label: (context) => `${context.datasetIndex === 0 ? '自然岸线' : '最终报告拟合式'}：X=${context.parsed.x.toFixed(4)}，Y=${context.parsed.y.toFixed(4)}` } } }
      }
    });
  }

  function renderDimension(rows) {
    const labels = rows.map((row) => `${row.object}｜${row.method}`);
    const values = rows.map((row) => ({ x: Number(row.D), y: labels[rows.indexOf(row)] }));
    chartOrFallback('dimensionChart', {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'D值', data: values, backgroundColor: colors.cauliflower, borderColor: colors.cauliflower, pointRadius: 6, pointStyle: 'circle' },
          { label: 'D = 1参考线', data: labels.map((label) => ({ x: 1, y: label })), showLine: true, borderColor: colors.reference, borderDash: [5, 5], pointRadius: 0, pointStyle: 'line' }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: reducedMotion ? false : { duration: 650 },
        plugins: { legend: { labels: { color: colors.lightText, usePointStyle: true } }, tooltip: { callbacks: { label: (context) => context.datasetIndex === 0 ? `D = ${Number(context.parsed.x).toFixed(4)}` : 'D = 1参考线' } } },
        scales: { x: { min: 1, title: { display: true, text: '分形维数 D' }, ticks: { color: colors.lightText }, grid: { color: colors.grid } }, y: { type: 'category', labels, ticks: { color: colors.lightText }, grid: { color: colors.grid } } }
      }
    });
  }

  function renderValidation(rows) {
    const small = rows.filter((row) => row.direction === 'small_scale');
    chartOrFallback('validationChart', {
      type: 'bar',
      data: {
        labels: small.map((row) => `${row.scale_m} m`),
        datasets: [
          { label: '预测值（km）', data: small.map((row) => Number(row.predicted_km)), backgroundColor: colors.predicted, borderRadius: 4 },
          { label: '实测值（km）', data: small.map((row) => Number(row.observed_km)), backgroundColor: colors.observed, borderRadius: 4 }
        ]
      },
      options: baseOptions({ dark: true, xTitle: '留出尺度', yTitle: '长度（km）' })
    });
  }

  function renderFineScale(rows) {
    const labels = ['10 m', '5 m'];
    const byObject = (name) => labels.map((label) => {
      const row = rows.find((item) => item.object === name && `${item.scale_m} m` === label);
      return row ? Number(row.length_km) : null;
    });
    chartOrFallback('fineScaleChart', {
      type: 'line',
      data: { labels, datasets: [
        { label: '自然岸线', data: byObject('自然岸线'), borderColor: colors.natural, backgroundColor: colors.natural, pointRadius: 5, pointStyle: 'circle', tension: 0 },
        { label: '人工岸线', data: byObject('人工岸线'), borderColor: colors.artificial, backgroundColor: colors.artificial, pointRadius: 5, pointStyle: 'rectRot', borderDash: [6, 4], tension: 0 }
      ] },
      options: baseOptions({ xTitle: '量测尺度（大 → 小）', yTitle: '岸线长度（km）' })
    });
  }

  async function initCharts() {
    console.info('[charts] init started');
    if (typeof window.Chart === 'undefined') {
      console.error('[charts] Chart.js failed to load');
      document.querySelectorAll('.chart-wrap canvas').forEach((canvas) => {
        canvas.hidden = true;
        getFallback(canvas).hidden = false;
      });
      return;
    }
    console.info('[charts] Chart.js loaded', window.Chart.version);
    try {
      const [arcgis, compass, cauliflower, dimensions, validation, fineScale] = await Promise.all([
        loadCsv('coastline_arcgis.csv'),
        loadCsv('coastline_compass.csv'),
        loadCsv('cauliflower.csv'),
        loadCsv('fractal_dimension.csv'),
        loadCsv('model_validation.csv'),
        loadCsv('fine_scale_arcgis.csv')
      ]);
      renderArcgis(arcgis);
      renderCompass(compass);
      renderLog(arcgis);
      renderDimension(dimensions);
      renderValidation(validation);
      renderFineScale(fineScale);
      renderCauliflower(cauliflower);
    } catch (error) {
      document.querySelectorAll('.chart-wrap canvas').forEach((canvas) => {
        canvas.hidden = true;
        getFallback(canvas).hidden = false;
      });
      console.error('[charts]', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts, { once: true });
  } else {
    initCharts();
  }
})();
