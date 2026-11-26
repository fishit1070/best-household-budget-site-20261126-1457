// Ledger Lane — charts.js
// Hand-rolled SVG string builders. No imports, no DOM creation:
// every function returns an SVG markup string for the caller to place.
// Colours default to the Ledger Lane palette; text uses tabular numerals.

const PALETTE = {
  ink: "#20241f",
  inkSoft: "#4a4f45",
  green: "#1e4d3b",
  greenSoft: "#2e6b52",
  amber: "#d9930d",
  red: "#b3372a",
  line: "#ddd2ba",
  paper: "#faf6ee",
  savings: "#5b7d9e",
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const NUMS = "font-variant-numeric:tabular-nums";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(v) {
  // Whole-dollar money formatting used across the ledger.
  return "$" + Math.round(v).toLocaleString("en-US");
}

function txt(x, y, str, opts = {}) {
  const size = opts.size || 12;
  const fill = opts.fill || PALETTE.ink;
  const anchor = opts.anchor || "start";
  const weight = opts.weight || "400";
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}" style="${NUMS}">${esc(str)}</text>`;
}

/**
 * Horizontal bar chart.
 * rows: [{ label, value, max?, color?, flag? }] — flag renders the bar red
 * and appends an "OVER" marker. opts: { width, barHeight, title, format }
 */
export function hbarChart(rows, opts = {}) {
  const width = opts.width || 560;
  const barH = opts.barHeight || 20;
  const gap = opts.gap || 12;
  const labelW = opts.labelWidth || 132;
  const valueW = 86;
  const top = 8;
  const rowH = barH + gap;
  const height = top * 2 + rows.length * rowH - gap;
  const chartW = width - labelW - valueW;
  const globalMax = Math.max(...rows.map((r) => r.max || r.value), 1);
  const format = opts.format || fmt;
  const title = opts.title || "Horizontal bar chart";

  let out = `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg">`;
  out += `<title>${esc(title)}</title>`;

  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const max = r.max || globalMax;
    const w = Math.max(2, (r.value / max) * chartW);
    const color = r.flag ? PALETTE.red : r.color || PALETTE.green;
    out += txt(0, y + barH / 2 + 4, r.label, { size: 12.5, weight: "600" });
    out += `<rect x="${labelW}" y="${y}" width="${chartW}" height="${barH}" rx="4" fill="#ece3cb"/>`;
    out += `<rect x="${labelW}" y="${y}" width="${w.toFixed(1)}" height="${barH}" rx="4" fill="${color}"/>`;
    const val = format(r.value) + (r.flag ? " OVER" : "");
    out += txt(labelW + chartW + 8, y + barH / 2 + 4, val, {
      size: 12.5,
      weight: r.flag ? "700" : "600",
      fill: r.flag ? PALETTE.red : PALETTE.ink,
    });
  });

  out += "</svg>";
  return out;
}

/**
 * Multi-series line chart (6-month trend by default).
 * series: [{ label, points: [numbers], color }]
 * opts: { width, height, title, yFormat, xLabels }
 */
export function lineChart(series, opts = {}) {
  const width = opts.width || 560;
  const height = opts.height || 240;
  const padL = 52, padR = 14, padT = 14, padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const title = opts.title || "Trend chart";
  const yFormat = opts.yFormat || fmt;
  const xLabels = opts.xLabels || ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const all = series.flatMap((s) => s.points);
  let min = Math.min(...all);
  let max = Math.max(...all);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  min -= pad; max += pad;

  const n = Math.max(...series.map((s) => s.points.length));
  const x = (i) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v) => padT + plotH - ((v - min) / (max - min)) * plotH;

  let out = `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg">`;
  out += `<title>${esc(title)}</title>`;

  // Gridlines + y ticks (4 bands)
  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) * i) / 4;
    const gy = y(v);
    out += `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${width - padR}" y2="${gy.toFixed(1)}" stroke="${PALETTE.line}" stroke-width="1"/>`;
    out += txt(padL - 7, gy + 4, yFormat(v), { size: 11, anchor: "end", fill: PALETTE.inkSoft });
  }
  // X labels
  for (let i = 0; i < n; i++) {
    out += txt(x(i), height - 8, xLabels[i] || "", { size: 11, anchor: "middle", fill: PALETTE.inkSoft });
  }
  // Axis line
  out += `<line x1="${padL}" y1="${padT + plotH}" x2="${width - padR}" y2="${padT + plotH}" stroke="${PALETTE.inkSoft}" stroke-width="1"/>`;

  const defaults = [PALETTE.green, PALETTE.amber, PALETTE.savings, PALETTE.red];
  series.forEach((s, si) => {
    const color = s.color || defaults[si % defaults.length];
    const pts = s.points.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    out += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    s.points.forEach((v, i) => {
      out += `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.2" fill="${color}" stroke="${PALETTE.paper}" stroke-width="1.2"/>`;
    });
    // End label with series name + last value
    const last = s.points[s.points.length - 1];
    out += txt(x(s.points.length - 1), y(last) - 9, `${s.label} ${yFormat(last)}`, {
      size: 11.5, anchor: "end", weight: "700", fill: color,
    });
  });

  out += "</svg>";
  return out;
}

/**
 * Single labelled progress bar.
 * progressBar(pct, color, label) — pct 0..100 (values above 100 render full
 * and switch to the over-budget red unless a colour is given).
 */
export function progressBar(pct, color, label) {
  const width = 560, height = 44;
  const barY = 20, barH = 16;
  const over = pct > 100;
  const fill = color || (over ? PALETTE.red : PALETTE.green);
  const shown = Math.min(100, Math.max(0, pct));
  const w = (shown / 100) * width;
  const pctText = `${Math.round(pct)}%${over ? " — over budget" : ""}`;

  let out = `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg">`;
  out += `<title>${esc(label || "Progress")}: ${esc(pctText)}</title>`;
  if (label) out += txt(0, 13, label, { size: 12.5, weight: "600" });
  out += txt(width, 13, pctText, {
    size: 12.5, anchor: "end", weight: over ? "700" : "600",
    fill: over ? PALETTE.red : PALETTE.inkSoft,
  });
  out += `<rect x="0" y="${barY}" width="${width}" height="${barH}" rx="8" fill="#ece3cb"/>`;
  if (w > 0) out += `<rect x="0" y="${barY}" width="${w.toFixed(1)}" height="${barH}" rx="8" fill="${fill}"/>`;
  out += "</svg>";
  return out;
}

/**
 * Three-segment donut for the 50/30/20 split.
 * donut503020(needs, wants, savings) — dollar amounts; the centre shows the
 * total, each segment is labelled with its share.
 */
export function donut503020(needs, wants, savings) {
  const size = 260;
  const cx = size / 2, cy = size / 2;
  const rOuter = 108, rInner = 66;
  const total = needs + wants + savings;
  const title = "Budget split: needs, wants and savings";

  const segs = [
    { label: "Needs", value: needs, color: PALETTE.green },
    { label: "Wants", value: wants, color: PALETTE.amber },
    { label: "Savings", value: savings, color: PALETTE.savings },
  ];

  function arcPath(startA, endA) {
    const large = endA - startA > Math.PI ? 1 : 0;
    const x1 = cx + rOuter * Math.cos(startA), y1 = cy + rOuter * Math.sin(startA);
    const x2 = cx + rOuter * Math.cos(endA), y2 = cy + rOuter * Math.sin(endA);
    const x3 = cx + rInner * Math.cos(endA), y3 = cy + rInner * Math.sin(endA);
    const x4 = cx + rInner * Math.cos(startA), y4 = cy + rInner * Math.sin(startA);
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${rInner} ${rInner} 0 ${large} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
  }

  let out = `<svg class="chart" viewBox="0 0 ${size} ${size}" role="img" xmlns="http://www.w3.org/2000/svg">`;
  out += `<title>${esc(title)}</title>`;

  if (total <= 0) {
    out += `<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="${PALETTE.line}" stroke-width="${rOuter - rInner}"/>`;
  } else {
    let angle = -Math.PI / 2;
    segs.forEach((s) => {
      if (s.value <= 0) return;
      const sweep = (s.value / total) * Math.PI * 2;
      const end = angle + sweep;
      // A single 100% segment cannot be drawn as one arc — nudge it.
      const path = sweep >= Math.PI * 2 - 0.001 ? arcPath(angle, angle + Math.PI) + arcPath(angle + Math.PI, end - 0.001) : arcPath(angle, end);
      out += `<path d="${path}" fill="${s.color}" stroke="${PALETTE.paper}" stroke-width="2"/>`;
      // Segment share label at mid-angle
      const mid = angle + sweep / 2;
      const lr = (rOuter + rInner) / 2;
      const lx = cx + lr * Math.cos(mid), ly = cy + lr * Math.sin(mid);
      const pct = Math.round((s.value / total) * 100);
      out += txt(lx, ly + 4, `${pct}%`, { size: 13, anchor: "middle", weight: "700", fill: "#fffdf7" });
      angle = end;
    });
  }

  // Centre total
  out += txt(cx, cy - 4, fmt(total), { size: 21, anchor: "middle", weight: "700", fill: PALETTE.green });
  out += txt(cx, cy + 16, "per month", { size: 11.5, anchor: "middle", fill: PALETTE.inkSoft });

  out += "</svg>";
  return out;
}

/**
 * Tiny inline sparkline for stat cards and table rows.
 * sparkline(points, opts) — opts: { width, height, color, title }
 * Renders the line plus a dot on the latest point; no axes.
 */
export function sparkline(points, opts = {}) {
  const width = opts.width || 96;
  const height = opts.height || 28;
  const color = opts.color || PALETTE.green;
  const title = opts.title || "Sparkline";
  const pad = 3;

  let out = `<svg class="chart spark" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg">`;
  out += `<title>${esc(title)}</title>`;

  if (points && points.length > 1) {
    let min = Math.min(...points);
    let max = Math.max(...points);
    if (min === max) { min -= 1; max += 1; }
    const stepX = (width - pad * 2) / (points.length - 1);
    const y = (v) => pad + (height - pad * 2) * (1 - (v - min) / (max - min));
    const pts = points.map((v, i) => `${(pad + i * stepX).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    out += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const lastX = pad + (points.length - 1) * stepX;
    out += `<circle cx="${lastX.toFixed(1)}" cy="${y(points[points.length - 1]).toFixed(1)}" r="2.6" fill="${color}"/>`;
  }

  out += "</svg>";
  return out;
}
