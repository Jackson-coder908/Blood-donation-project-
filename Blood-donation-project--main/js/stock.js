const bloodData = [
  { type: 'A+',  days: 11, max: 14 },
  { type: 'A-',  days: 4,  max: 14 },
  { type: 'B+',  days: 8,  max: 14 },
  { type: 'B-',  days: 2,  max: 14 },
  { type: 'AB+', days: 12, max: 14 },
  { type: 'AB-', days: 6,  max: 14 },
  { type: 'O+',  days: 7,  max: 14 },
  { type: 'O-',  days: 1,  max: 14 },
];

const centerData = [
  { name: 'Downtown Medical Center',       stock: [10, 3, 7, 2, 11, 5, 8, 1] },
  { name: 'Westside Community Clinic',     stock: [12, 5, 9, 3, 13, 7, 6, 2] },
  { name: 'Northpark Hospital Blood Bank', stock: [8,  4, 6, 1, 10, 4, 9, 1] },
  { name: 'East End Health Hub',           stock: [11, 3, 8, 2, 12, 6, 7, 2] },
  { name: 'Midtown Donor Center',          stock: [9,  4, 7, 3, 11, 5, 6, 1] },
];

const trendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [142, 178, 165, 190, 203, 245, 198],
};

function getStatus(days) {
  if (days <= 2) return 'critical';
  if (days <= 5) return 'low';
  if (days <= 9) return 'adequate';
  return 'good';
}

function getStatusLabel(days) {
  if (days <= 2) return 'Critical';
  if (days <= 5) return 'Low';
  if (days <= 9) return 'Adequate';
  return 'Good';
}

function getCellClass(days) {
  if (days <= 2) return 'cell-critical';
  if (days <= 5) return 'cell-low';
  if (days <= 9) return 'cell-adequate';
  return 'cell-good';
}

function renderStockGrid() {
  const grid = document.getElementById('stockGrid');
  if (!grid) return;

  bloodData.forEach(({ type, days, max }) => {
    const status = getStatus(days);
    const pct = Math.min(100, (days / max) * 100);
    const label = getStatusLabel(days);

    grid.innerHTML += `
      <div class="stock-card ${status}">
        <div class="blood-type-label">${type}</div>
        <div class="stock-days"><strong>${days}</strong> days remaining</div>
        <div class="stock-bar-wrap">
          <div class="stock-bar" style="width:${pct}%"></div>
        </div>
        <span class="stock-status">${label}</span>
        ${status === 'critical' || status === 'low'
          ? `<a href="register.html" class="donate-link">Donate ${type} now →</a>`
          : ''}
      </div>`;
  });
}

function renderCenterTable() {
  const tbody = document.getElementById('centerTableBody');
  if (!tbody) return;

  centerData.forEach(({ name, stock }) => {
    const cells = stock.map(d =>
      `<td class="${getCellClass(d)}">${d}d</td>`
    ).join('');
    tbody.innerHTML += `<tr><td>${name}</td>${cells}</tr>`;
  });
}

function renderChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.parentElement.offsetWidth - 64;
  const H = 220;
  canvas.width = W;
  canvas.height = H;

  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const vals = trendData.values;
  const maxVal = Math.max(...vals) * 1.15;
  const labels = trendData.labels;
  const stepX = chartW / (vals.length - 1);

  // Grid lines
  ctx.strokeStyle = '#EEE8E2';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillStyle = '#6B5E54';
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), pad.left - 8, y + 4);
  }

  // Area fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, 'rgba(200,16,46,0.18)');
  grad.addColorStop(1, 'rgba(200,16,46,0)');
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - (v / maxVal) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + (vals.length - 1) * stepX, pad.top + chartH);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#C8102E';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  vals.forEach((v, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - (v / maxVal) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots + labels
  vals.forEach((v, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - (v / maxVal) * chartH;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#C8102E';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#1A1410';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v, x, y - 10);

    ctx.fillStyle = '#6B5E54';
    ctx.font = '12px DM Sans, sans-serif';
    ctx.fillText(labels[i], x, pad.top + chartH + 20);
  });
}

function setLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
    ', ' + now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

document.addEventListener('DOMContentLoaded', () => {
  renderStockGrid();
  renderCenterTable();
  setLastUpdated();
  setTimeout(renderChart, 100);
});

window.addEventListener('resize', () => {
  const canvas = document.getElementById('trendChart');
  if (canvas) renderChart();
});
