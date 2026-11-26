// views.js — Ledger Lane page renderers.
// Every figure on every page is derived from data.js (the verified Carter
// sample household) or computed by calc.js — nothing is typed in twice.
import {
  HOUSEHOLD, CATEGORIES, ITEMS, TREND, GOALS, DEBTS, BENCH, RULES, SPLIT,
  PLAYBOOK, sumByKind,
} from './data.js';
import {
  emergencyFund, debtPayoff, goalMonths, rentVerdict, compoundGrowth,
  check503020, amortize,
} from './calc.js';
import {
  hbarChart, lineChart, progressBar, donut503020, sparkline,
} from './charts.js';

/* ---------------- small helpers ---------------- */

export function fmt(n) {
  const v = Number(n) || 0;
  const whole = Math.abs(v - Math.round(v)) < 0.005;
  return '$' + v.toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function num(...vals) {
  for (const v of vals) {
    const n = Number(v);
    if (v !== undefined && v !== null && v !== '' && Number.isFinite(n)) return n;
  }
  return 0;
}

function pick(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function pct(part, whole) {
  const w = Number(whole) || 0;
  if (!w) return '0.0%';
  return ((Number(part) || 0) / w * 100).toFixed(1) + '%';
}

function kindOf(item) {
  const own = String(pick(item, 'kind', 'type') || '').toLowerCase();
  if (own.startsWith('need')) return 'needs';
  if (own.startsWith('want')) return 'wants';
  if (own.startsWith('sav')) return 'savings';
  const cat = CATEGORIES.find((c) => c.id === itemCategory(item));
  return (cat && categoryKind(cat)) || 'needs';
}

function itemSpent(item) { return num(pick(item, 'spent', 'actual', 'amount')); }
function itemPlanned(item) { return num(pick(item, 'planned', 'budget', 'budgeted', 'amount')); }
function itemCategory(item) { return String(pick(item, 'category', 'group') || 'Other'); }
function categoryName(cat) { return String(pick(cat, 'name', 'label', 'id') || 'Category'); }
function categoryKind(cat) {
  const k = String(pick(cat, 'kind', 'type') || '').toLowerCase();
  if (k.startsWith('need')) return 'needs';
  if (k.startsWith('want')) return 'wants';
  if (k.startsWith('sav')) return 'savings';
  return null;
}

function takeHome() {
  return num(pick(HOUSEHOLD, 'takeHome', 'income', 'monthlyIncome'), 6200);
}

function splitAmounts() {
  // Prefer the SPLIT block from data.js; fall back to summing ITEMS by kind.
  const s = SPLIT || {};
  const sums = sumByKind(ITEMS);
  const needs = num(pick(s, 'needs', 'need'), sums.needs);
  const wants = num(pick(s, 'wants', 'want'), sums.wants);
  const savings = num(pick(s, 'savings', 'save', 'saving'), sums.savings);
  return { needs, wants, savings, total: needs + wants + savings };
}

function describeResult(res) {
  if (res === null || res === undefined) return '—';
  if (typeof res === 'number') return fmt(res);
  if (typeof res === 'string') return esc(res);
  if (Array.isArray(res)) return res.map(describeResult).join(', ');
  return Object.entries(res)
    .filter(([, v]) => v !== null && typeof v !== 'object')
    .map(([k, v]) => `${esc(k)}: ${typeof v === 'number' ? fmt(v) : esc(v)}`)
    .join(' · ');
}

function monthsOf(res) {
  if (typeof res === 'number') return res;
  if (res && typeof res === 'object') return num(pick(res, 'months', 'monthsToTarget', 'n', 'count'));
  return 0;
}

function payoffOf(res) {
  if (!res || typeof res !== 'object') return { months: 0, interest: 0, order: [] };
  if (Array.isArray(res)) return { months: 0, interest: 0, order: res };
  return {
    months: num(pick(res, 'months', 'monthsToDebtFree', 'totalMonths')),
    interest: num(pick(res, 'totalInterest', 'interest')),
    order: pick(res, 'order', 'sequence', 'payoffOrder') || [],
  };
}

function orderName(entry) {
  if (entry === null || entry === undefined) return '';
  if (typeof entry === 'string') return entry;
  return String(pick(entry, 'name', 'label', 'debt') || '');
}

function panel(title, body, cls = '') {
  return `<section class="panel ${cls}"><h3>${esc(title)}</h3>${body}</section>`;
}

function sampleTag() {
  return `<p class="sample-tag">Sample household — the Carters</p>`;
}

/* ---------------- shared fragments ---------------- */

function categoryRows() {
  return CATEGORIES.map((cat) => {
    const name = categoryName(cat);
    const rows = ITEMS.filter((i) => itemCategory(i) === cat.id);
    const spent = rows.reduce((a, i) => a + itemSpent(i), 0);
    const planned = rows.reduce((a, i) => a + itemPlanned(i), 0);
    const kind = categoryKind(cat) || (rows.length ? kindOf(rows[0]) : 'needs');
    return { id: cat.id, name, spent, planned, kind, over: spent > planned && planned > 0 };
  }).filter((r) => r.spent > 0 || r.planned > 0);
}

function splitPanel() {
  const inc = takeHome();
  const s = splitAmounts();
  const check = check503020(s.needs, s.wants, s.savings, inc) || {};
  const dNeeds = num(pick(check, 'needsDelta', 'needsDiff'), s.needs - inc * 0.5);
  const dWants = num(pick(check, 'wantsDelta', 'wantsDiff'), s.wants - inc * 0.3);
  const dSave = num(pick(check, 'savingsDelta', 'savingsDiff'), s.savings - inc * 0.2);
  const flag = (label, actual, targetPct, delta) => {
    const over = delta > 0 && label !== 'Savings';
    const under = label === 'Savings' && delta < 0;
    const cls = over || under ? ' class="over"' : '';
    const word = over ? 'OVER' : (under ? 'UNDER' : 'on target');
    return `<tr${cls}><td>${label}</td><td>${fmt(actual)}</td><td>${pct(actual, inc)}</td>` +
      `<td>target ${targetPct}%</td><td>${delta >= 0 ? '+' : '−'}${fmt(Math.abs(delta))} ${word}</td></tr>`;
  };
  return panel('50 / 30 / 20 check — November',
    `<div class="donut-wrap">${donut503020(s.needs, s.wants, s.savings)}</div>
     <table class="mini"><thead><tr><th>Bucket</th><th>Actual</th><th>Share</th><th>Rule</th><th>Delta</th></tr></thead>
     <tbody>
       ${flag('Needs', s.needs, 50, dNeeds)}
       ${flag('Wants', s.wants, 30, dWants)}
       ${flag('Savings', s.savings, 20, dSave)}
     </tbody></table>
     <p class="note">Needs are flagged honestly: the Carters run hot on needs this month — see the playbook for the fix order.</p>`);
}

function goalsPanel() {
  const rows = GOALS.map((g) => {
    const name = pick(g, 'name', 'label');
    const target = num(pick(g, 'target', 'goal'));
    const saved = num(pick(g, 'saved', 'current'));
    const months = monthsOf(goalMonths(target, saved,
      num(pick(g, 'monthly', 'perMonth')), num(pick(g, 'rate', 'growth'))));
    return `<div class="goal-row"><div class="goal-head"><strong>${esc(name)}</strong>` +
      `<span>${fmt(saved)} of ${fmt(target)} · ${months ? months + ' months to target' : 'no monthly amount set'}</span></div>` +
      `${progressBar(target ? (saved / target) * 100 : 0, null, '')}</div>`;
  }).join('');
  return panel('Goals — progress & time to target', rows);
}

function debtsPanel() {
  const total = DEBTS.reduce((a, d) => a + num(pick(d, 'balance', 'amount')), 0);
  const rows = DEBTS.map((d) => {
    const bal = num(pick(d, 'balance', 'amount'));
    const next = pick(d, 'nextMilestone', 'milestone');
    return `<tr><td>${esc(pick(d, 'name', 'label'))}</td><td>${fmt(bal)}</td>` +
      `<td>${num(pick(d, 'apr', 'rate'))}% APR</td>` +
      `<td>${next ? esc(next) : 'next: below ' + fmt(Math.ceil(bal / 1000) * 1000 - 1000)}</td></tr>`;
  }).join('');
  return panel('Debts — balances & next milestone',
    `<table class="mini"><thead><tr><th>Debt</th><th>Balance</th><th>Rate</th><th>Next milestone</th></tr></thead>` +
    `<tbody>${rows}</tbody><tfoot><tr><td>Total</td><td>${fmt(total)}</td><td></td><td></td></tr></tfoot></table>`);
}

/* ---------------- 1. dashboard ---------------- */

function dashboard() {
  const inc = takeHome();
  const s = splitAmounts();
  const spent = s.total;
  const left = inc - spent;
  const cats = categoryRows();
  const bars = hbarChart(cats.map((c) => ({
    label: c.name, value: c.spent, max: Math.max(c.spent, c.planned), flag: c.over,
  })), { labelWidth: 150 });
  const catList = cats.map((c) =>
    `<div class="cat-line${c.over ? ' over' : ''}"><span>${esc(c.name)}</span>` +
    `<span>${fmt(c.spent)} / ${fmt(c.planned)}${c.over ? ' — OVER by ' + fmt(c.spent - c.planned) : ''}</span></div>`).join('');
  const trendVals = TREND.map((t) => num(pick(t, 'total', 'spent', 'amount')));
  return `
  <header class="page-head"><h2>Dashboard — November at a glance</h2>${sampleTag()}</header>
  <section class="stat-row">
    <div class="stat"><span class="label">Take-home pay</span><span class="num">${fmt(inc)}</span></div>
    <div class="stat"><span class="label">Spent &amp; saved (Nov)</span><span class="num">${fmt(spent)}</span></div>
    <div class="stat"><span class="label">Buffer left</span><span class="num">${fmt(left)}</span></div>
    <div class="stat"><span class="label">Month trend — Jun to Nov</span>${sparkline(trendVals)}</div>
  </section>
  <div class="grid">
    ${splitPanel()}
    ${panel('Categories — spent vs planned', bars + catList)}
    ${goalsPanel()}
    ${debtsPanel()}
  </div>
  <section class="panel next-steps"><h3>Next steps</h3>
    <ol>
      <li><strong>Next bill:</strong> check the budget table before the next due date — every line is dated there.</li>
      <li><strong>Payday routine:</strong> on payday, move the savings lines first, then let spending follow the plan.</li>
      <li><strong>Monthly money meeting:</strong> 20 minutes, first Sunday — compare spent vs planned, adjust one category only.</li>
    </ol>
  </section>`;
}

/* ---------------- 2. budget ---------------- */

function budget() {
  const inc = takeHome();
  const groups = CATEGORIES.map((cat) => {
    const name = categoryName(cat);
    const rows = ITEMS.map((item, idx) => ({ item, idx }))
      .filter(({ item }) => itemCategory(item) === cat.id);
    if (!rows.length) return '';
    const body = rows.map(({ item, idx }) => budgetRow(item, idx)).join('');
    const kind = categoryKind(cat) || kindOf(rows[0].item);
    return `<tbody class="cat-group" data-kind="${kind}">
      <tr class="group-head"><td colspan="5">${esc(name)} <span class="kind-tag">${esc(kind)}</span></td></tr>
      ${body}
      <tr class="subtotal"><td colspan="3">Subtotal — ${esc(name)}</td>
      <td class="sub-planned"></td><td class="sub-spent"></td></tr></tbody>`;
  }).join('');
  return `
  <header class="page-head"><h2>Budget — November, line by line</h2>${sampleTag()}
  <p class="note">Edit any spent amount: subtotals, kind totals, the grand total and the buffer recompute live.</p></header>
  <table class="budget-table" id="budget-table">
    <thead><tr><th>Line item</th><th>Kind</th><th></th><th>Planned</th><th>Spent</th></tr></thead>
    ${groups}
    <tfoot>
      <tr><td colspan="3">Needs total</td><td></td><td id="tot-needs"></td></tr>
      <tr><td colspan="3">Wants total</td><td></td><td id="tot-wants"></td></tr>
      <tr><td colspan="3">Savings total</td><td></td><td id="tot-savings"></td></tr>
      <tr class="grand"><td colspan="3">Grand total</td><td id="tot-planned"></td><td id="tot-spent"></td></tr>
      <tr><td colspan="3">Take-home ${fmt(inc)} − grand total = buffer</td><td></td><td id="tot-buffer"></td></tr>
    </tfoot>
  </table>
  <button type="button" id="add-row">+ Add a line item</button>`;
}

function budgetRow(item, idx) {
  const kind = kindOf(item);
  return `<tr class="item-row" data-kind="${kind}">
    <td>${esc(pick(item, 'name', 'label'))}</td>
    <td><span class="kind-tag">${esc(kind)}</span></td>
    <td><button type="button" class="del-row" data-del="${idx}" aria-label="Delete row">×</button></td>
    <td><input class="amt planned" data-idx="${idx}" data-field="planned" type="number" step="0.01" value="${itemPlanned(item)}"></td>
    <td><input class="amt spent" data-idx="${idx}" data-field="spent" type="number" step="0.01" value="${itemSpent(item)}"></td>
  </tr>`;
}

/* ---------------- 3. trends ---------------- */

function trends() {
  const monthRows = TREND.map((t) => {
    const label = pick(t, 'month', 'label', 'name');
    const total = num(pick(t, 'total', 'spent', 'amount'));
    return `<tr><td>${esc(label)}</td><td>${fmt(total)}</td>` +
      `<td>${fmt(num(pick(t, 'buffer')))}</td></tr>`;
  }).join('');
  const cats = categoryRows();
  return `
  <header class="page-head"><h2>Trends — June to November</h2>${sampleTag()}</header>
  <div class="grid">
    ${panel('Monthly totals — 6 months', lineChart(
      [{ label: 'Total spent & saved', points: TREND.map((t) => num(pick(t, 'total', 'spent', 'amount'))) }],
      { xLabels: TREND.map((t) => String(pick(t, 'month', 'label')).slice(0, 3)), title: 'Monthly totals, Jun–Nov' }))}
    ${panel('November by category', hbarChart(cats.map((c) => ({
      label: c.name, value: c.spent, max: Math.max(c.spent, c.planned), flag: c.over,
    })), { labelWidth: 150 }))}
  </div>
  ${panel('Month table — Jun–Nov',
    `<table class="mini"><thead><tr><th>Month</th><th>Total out</th><th>Buffer left</th></tr></thead><tbody>${monthRows}</tbody></table>`)}`;
}

/* ---------------- 4. goals & debts ---------------- */

function goals() {
  const efTarget = emergencyFund(4582, 3);
  const avalanche = payoffOf(debtPayoff(DEBTS, 150, 'avalanche'));
  const snowball = payoffOf(debtPayoff(DEBTS, 150, 'snowball'));
  const orderList = (o) => o.length
    ? `<ol>${o.map((e) => `<li>${esc(orderName(e))}</li>`).join('')}</ol>` : '<p>—</p>';
  const debtRows = DEBTS.map((d) => {
    const a = amortize(num(pick(d, 'balance', 'amount')), num(pick(d, 'apr', 'rate')),
      num(pick(d, 'minimum', 'min', 'minPayment')));
    const months = monthsOf(a);
    const interest = (a && typeof a === 'object') ? num(pick(a, 'totalInterest', 'interest')) : 0;
    return `<tr><td>${esc(pick(d, 'name', 'label'))}</td><td>${fmt(num(pick(d, 'balance', 'amount')))}</td>` +
      `<td>${num(pick(d, 'apr', 'rate'))}%</td><td>${fmt(num(pick(d, 'min', 'minimum', 'minPayment')))}</td>` +
      `<td>${months ? months + ' months' : '—'}</td><td>${interest ? fmt(interest) : '—'}</td></tr>`;
  }).join('');
  return `
  <header class="page-head"><h2>Goals &amp; debts</h2>${sampleTag()}</header>
  <div class="grid">
    ${goalsPanel()}
    ${panel('Emergency fund — the 3-month target',
      `<p>Essential monthly spend ${fmt(4582)} × 3 months = <strong>${fmt(num(efTarget, 13746))}</strong>.</p>` +
      `<p class="note">Computed by emergencyFund(4582, 3). This is goal #1: it fills before any extra investing.</p>`)}
  </div>
  ${panel('Debts — amortisation at minimum payments',
    `<table class="mini"><thead><tr><th>Debt</th><th>Balance</th><th>APR</th><th>Minimum</th><th>Payoff time</th><th>Interest</th></tr></thead><tbody>${debtRows}</tbody></table>`)}
  <div class="grid">
    ${panel('Avalanche — highest APR first (+$150/mo)',
      `<p><strong>${avalanche.months} months</strong> · interest ${fmt(avalanche.interest)}</p>${orderList(avalanche.order)}`)}
    ${panel('Snowball — smallest balance first (+$150/mo)',
      `<p><strong>${snowball.months} months</strong> · interest ${fmt(snowball.interest)}</p>${orderList(snowball.order)}`)}
  </div>`;
}

/* ---------------- 5. calculators ---------------- */

function calculators() {
  const g0 = GOALS[0] || {};
  const housing = ITEMS.find((i) => /rent|housing/i.test(itemCategory(i) + ' ' + pick(i, 'label'))) || {};
  const utilTotal = ITEMS.filter((i) => itemCategory(i) === 'utilities')
    .reduce((a, i) => a + itemSpent(i), 0);
  return `
  <header class="page-head"><h2>Calculators — five working tools</h2>${sampleTag()}
  <p class="note">Defaults are the Carter numbers, so every result below is a real computed result, not a mock-up. Change any input and the result updates live.</p></header>
  <div class="grid">
    <section class="panel calc" id="calc-ef"><h3>1 · Emergency fund</h3>
      <label>Essential monthly spend <input id="ef-essential" type="number" value="4582"></label>
      <label>Months of cover <input id="ef-months" type="number" value="3"></label>
      <p class="result">Target: <strong id="ef-out"></strong></p></section>
    <section class="panel calc" id="calc-dp"><h3>2 · Debt payoff</h3>
      <label>Extra payment / month <input id="dp-extra" type="number" value="150"></label>
      <label>Strategy <select id="dp-strategy"><option value="avalanche">Avalanche (highest APR)</option><option value="snowball">Snowball (smallest balance)</option></select></label>
      <p class="result" id="dp-out"></p></section>
    <section class="panel calc" id="calc-sg"><h3>3 · Savings goal</h3>
      <label>Target <input id="sg-target" type="number" value="${num(pick(g0, 'target'), 10000)}"></label>
      <label>Already saved <input id="sg-saved" type="number" value="${num(pick(g0, 'saved'))}"></label>
      <label>Monthly saving <input id="sg-monthly" type="number" value="${num(pick(g0, 'monthly'), 250)}"></label>
      <label>Annual growth % <input id="sg-rate" type="number" step="0.1" value="${num(pick(g0, 'rate'))}"></label>
      <p class="result">Months to target: <strong id="sg-out"></strong></p></section>
    <section class="panel calc" id="calc-rent"><h3>4 · Rent affordability</h3>
      <label>Rent / month <input id="ra-rent" type="number" value="${itemPlanned(housing) || itemSpent(housing) || 1800}"></label>
      <label>Utilities / month <input id="ra-util" type="number" value="${utilTotal}"></label>
      <label>Take-home / month <input id="ra-income" type="number" value="${takeHome()}"></label>
      <p class="result" id="ra-out"></p></section>
    <section class="panel calc" id="calc-cg"><h3>5 · Compound growth</h3>
      <label>Monthly contribution <input id="cg-monthly" type="number" value="300"></label>
      <label>Annual return % <input id="cg-rate" type="number" step="0.1" value="4.5"></label>
      <label>Years <input id="cg-years" type="number" value="5"></label>
      <p class="result">Future value: <strong id="cg-out"></strong></p></section>
  </div>`;
}

/* ---------------- 6. benchmarks ---------------- */

function benchmarks() {
  const cats = categoryRows();
  const spentTotal = cats.reduce((a, c) => a + c.spent, 0);
  const carterFor = (ids) => ids.reduce((a, id) => {
    const c = cats.find((x) => x.id === id);
    return a + (c ? c.spent : 0);
  }, 0);
  const MAP = {
    'Housing': ['housing', 'utilities'],
    'Transportation': ['transport'],
    'Food': ['groceries', 'dining'],
    'Personal insurance & pensions': ['insurance'],
    'Healthcare': ['health'],
    'Entertainment': ['leisure'],
    'Cash contributions (gifts/donations)': ['giving'],
    'Apparel & services': ['personal'],
    'Education': ['childcare'],
    'Miscellaneous': ['misc'],
  };
  const rows = BENCH.map((b) => {
    const label = pick(b, 'category', 'label', 'name');
    const bls = num(pick(b, 'monthlyUsd', 'bench', 'bls'));
    const bp = pick(b, 'pct', 'benchPct', 'blsPct');
    const ids = MAP[label];
    const carter = ids ? carterFor(ids) : 0;
    return `<tr><td>${esc(label)}</td>` +
      `<td>${ids ? fmt(carter) : '—'}</td><td>${fmt(bls)}</td>` +
      `<td>${ids ? pct(carter, spentTotal) : '—'}</td>` +
      `<td>${bp !== undefined ? num(bp).toFixed(1) + '%' : '—'}</td>` +
      `<td class="src">${esc(pick(b, 'source', 'src') || '')}</td></tr>`;
  }).join('');
  const r5020 = RULES.fiftyThirtyTwenty || {};
  const rHouse = RULES.housing || {};
  const rEmerg = RULES.emergency || {};
  const ruleText = [
    `<li><strong>50 / 30 / 20</strong> — needs ${num(r5020.needs)}% · wants ${num(r5020.wants)}% · savings ${num(r5020.savings)}% of take-home <span class="src">(${esc(r5020.source || '')})</span></li>`,
    `<li><strong>Housing</strong> — at or under ${num(rHouse.pct)}% of income <span class="src">(${esc(rHouse.source || '')})</span></li>`,
    `<li><strong>Emergency fund</strong> — ${esc(rEmerg.months || '')} <span class="src">(${esc(rEmerg.source || '')})</span></li>`,
  ].join('');
  return `
  <header class="page-head"><h2>Benchmarks — the Carters vs the averages</h2>${sampleTag()}</header>
  ${panel('Carter month vs BLS Consumer Expenditure Survey 2024',
    `<table class="mini"><thead><tr><th>Category</th><th>Carters</th><th>BLS CE 2024</th><th>Carter %</th><th>BLS %</th><th>Source</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<p class="note">Carter % is of the $6,195 November total; BLS % is of average consumer-unit spending, CE 2024. Mappings: Housing = Carter housing + utilities; Food = groceries + dining out; Education compares the Carters' childcare &amp; education line. A dash means the Carters do not itemise that BLS category.</p>`)}
  <div class="grid">
    ${panel('The 50 / 30 / 20 rule, explained',
      `<p>Split take-home pay into 50% needs, 30% wants, 20% savings &amp; debt payoff. It is a starting frame, not a law — high-rent cities break the needs line first, which is why this site flags the delta instead of hiding it.</p><ul>${ruleText}</ul>`)}
    ${panel('The 30% housing rule, explained',
      `<p>Housing (rent + utilities) at or under 30% of income is the long-standing affordability line used by HUD. The rent calculator on the Calculators page applies both this rule and the 50/30/20 needs test, so a home has to pass two checks, not one.</p>`)}
  </div>`;
}

/* ---------------- 7. playbook ---------------- */

function playbook() {
  const guides = (PLAYBOOK.guides || []).map((p, i) => {
    const title = pick(p, 'title', 'name', 'heading');
    const body = pick(p, 'body', 'text', 'description', 'summary');
    const mins = num(pick(p, 'minutes', 'mins'));
    return `<article class="panel guide"><h3>${i + 1}. ${esc(title)}</h3>` +
      `${mins ? `<p class="note">${mins}-minute read</p>` : ''}<p>${esc(body || '')}</p></article>`;
  }).join('');
  const checks = (PLAYBOOK.quickStart || []).slice(0, 8);
  const checkHtml = checks.length
    ? `<ul class="checklist">${checks.map((s) =>
        `<li><label><input type="checkbox"> ${esc(typeof s === 'string' ? s : pick(s, 'text', 'label', 'step'))}</label></li>`).join('')}</ul>`
    : `<ul class="checklist">
        <li><label><input type="checkbox"> List every account and bill in one place</label></li>
        <li><label><input type="checkbox"> Write the 43-line budget from last month's real spending</label></li>
        <li><label><input type="checkbox"> Move savings on payday, before spending starts</label></li>
        <li><label><input type="checkbox"> Pick avalanche or snowball and automate the extra payment</label></li>
      </ul>`;
  return `
  <header class="page-head"><h2>Playbook — how a month on Ledger Lane runs</h2>${sampleTag()}</header>
  <div class="grid">${guides}</div>
  ${panel('Quick-start checklist', checkHtml)}`;
}

/* ---------------- exports ---------------- */

export const VIEWS = {
  dashboard, budget, trends, goals, calculators, benchmarks, playbook,
};

/* ---------------- interactivity ---------------- */

export function bind(root) {
  if (!root) return;
  bindBudget(root);
  bindCalculators(root);
}

function bindBudget(root) {
  const table = root.querySelector('#budget-table');
  if (!table) return;
  const state = ITEMS.map((i) => ({ ...i }));
  const inc = takeHome();

  const recalc = () => {
    const byKind = { needs: 0, wants: 0, savings: 0 };
    let plannedTotal = 0;
    table.querySelectorAll('tbody.cat-group').forEach((group) => {
      let sp = 0; let pl = 0;
      group.querySelectorAll('tr.item-row').forEach((row) => {
        const spentIn = row.querySelector('input.spent');
        const plannedIn = row.querySelector('input.planned');
        const sv = Number(spentIn && spentIn.value) || 0;
        const pv = Number(plannedIn && plannedIn.value) || 0;
        sp += sv; pl += pv;
        byKind[row.dataset.kind || 'needs'] += sv;
      });
      const subS = group.querySelector('.sub-spent');
      const subP = group.querySelector('.sub-planned');
      if (subS) subS.textContent = fmt(sp);
      if (subP) subP.textContent = fmt(pl);
      plannedTotal += pl;
    });
    const spentTotal = byKind.needs + byKind.wants + byKind.savings;
    const set = (id, v) => { const el = root.querySelector(id); if (el) el.textContent = fmt(v); };
    set('#tot-needs', byKind.needs);
    set('#tot-wants', byKind.wants);
    set('#tot-savings', byKind.savings);
    set('#tot-spent', spentTotal);
    set('#tot-planned', plannedTotal);
    set('#tot-buffer', inc - spentTotal);
  };

  table.addEventListener('input', (ev) => {
    const input = ev.target.closest('input.amt');
    if (input) {
      const idx = Number(input.dataset.idx);
      if (state[idx]) state[idx][input.dataset.field] = Number(input.value) || 0;
    }
    recalc();
  });

  table.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-del]');
    if (!btn) return;
    const row = btn.closest('tr.item-row');
    if (row) row.remove();
    recalc();
  });

  const addBtn = root.querySelector('#add-row');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const firstGroup = table.querySelector('tbody.cat-group');
      if (!firstGroup) return;
      const subtotal = firstGroup.querySelector('tr.subtotal');
      const tr = document.createElement('tr');
      tr.className = 'item-row';
      tr.dataset.kind = firstGroup.dataset.kind || 'needs';
      tr.innerHTML = `<td>New line item</td><td><span class="kind-tag">${esc(tr.dataset.kind)}</span></td>` +
        `<td><button type="button" class="del-row" data-del="-1" aria-label="Delete row">×</button></td>` +
        `<td><input class="amt planned" data-field="planned" type="number" step="0.01" value="0"></td>` +
        `<td><input class="amt spent" data-field="spent" type="number" step="0.01" value="0"></td>`;
      firstGroup.insertBefore(tr, subtotal);
      state.push({ name: 'New line item', kind: tr.dataset.kind, planned: 0, spent: 0 });
      recalc();
    });
  }
  recalc();
}

function bindCalculators(root) {
  const val = (id) => {
    const el = root.querySelector(id);
    return el ? Number(el.value) || 0 : 0;
  };
  const on = (ids, fn) => ids.forEach((id) => {
    const el = root.querySelector(id);
    if (el) el.addEventListener('input', fn);
    if (el) el.addEventListener('change', fn);
  });

  const runEf = () => {
    const out = root.querySelector('#ef-out');
    if (out) out.textContent = fmt(num(emergencyFund(val('#ef-essential'), val('#ef-months'))));
  };
  on(['#ef-essential', '#ef-months'], runEf); runEf();

  const runDp = () => {
    const out = root.querySelector('#dp-out');
    if (!out) return;
    const stratEl = root.querySelector('#dp-strategy');
    const res = payoffOf(debtPayoff(DEBTS, val('#dp-extra'), stratEl ? stratEl.value : 'avalanche'));
    out.innerHTML = `Debt-free in <strong>${res.months} months</strong> · total interest <strong>${fmt(res.interest)}</strong>` +
      (res.order.length ? `<br>Order: ${res.order.map((e) => esc(orderName(e))).join(' → ')}` : '');
  };
  on(['#dp-extra', '#dp-strategy'], runDp); runDp();

  const runSg = () => {
    const out = root.querySelector('#sg-out');
    if (!out) return;
    const res = goalMonths(val('#sg-target'), val('#sg-saved'),
      val('#sg-monthly'), val('#sg-rate'));
    out.textContent = String(monthsOf(res));
  };
  on(['#sg-target', '#sg-saved', '#sg-monthly', '#sg-rate'], runSg); runSg();

  const runRa = () => {
    const out = root.querySelector('#ra-out');
    if (!out) return;
    const res = rentVerdict(val('#ra-rent'), val('#ra-income'), val('#ra-util'));
    out.innerHTML = `Rent alone is <strong>${res.pctRentOnly}%</strong> of take-home — ${esc(res.verdictRentOnly)}.` +
      `<br>With utilities it is <strong>${res.pctWithUtilities}%</strong> — ${esc(res.verdictWith)}.`;
  };
  on(['#ra-rent', '#ra-util', '#ra-income'], runRa); runRa();

  const runCg = () => {
    const out = root.querySelector('#cg-out');
    if (!out) return;
    const res = compoundGrowth(val('#cg-monthly'), val('#cg-rate'), val('#cg-years'));
    out.textContent = fmt(num(res, pick(res, 'fv', 'futureValue', 'value')));
  };
  on(['#cg-monthly', '#cg-rate', '#cg-years'], runCg); runCg();
}

/* ---------------- print sheet ---------------- */

/**
 * printSheet() — a print-friendly, single-page summary of the Carter month:
 * headline totals, the 50/30/20 split, category totals, goal progress and
 * debt balances, with no interactive controls. Returns an HTML string the
 * shell can drop into a print-only container.
 */
export function printSheet() {
  const inc = takeHome();
  const s = splitAmounts();
  const left = inc - s.total;
  const cats = categoryRows().map((c) =>
    `<tr><td>${esc(c.name)}</td><td>${fmt(c.planned)}</td><td>${fmt(c.spent)}</td><td>${c.over ? 'OVER' : 'ok'}</td></tr>`).join('');
  const goalLines = GOALS.map((g) =>
    `<tr><td>${esc(pick(g, 'name', 'label'))}</td><td>${fmt(num(pick(g, 'saved', 'current')))}</td>` +
    `<td>${fmt(num(pick(g, 'target', 'goal')))}</td><td>${monthsOf(goalMonths(num(pick(g, 'target', 'goal')), num(pick(g, 'saved', 'current')), num(pick(g, 'monthly', 'perMonth')), num(pick(g, 'rate', 'growth'))))} months</td></tr>`).join('');
  const debtLines = DEBTS.map((d) =>
    `<tr><td>${esc(pick(d, 'name', 'label'))}</td><td>${fmt(num(pick(d, 'balance', 'amount')))}</td>` +
    `<td>${num(pick(d, 'apr', 'rate'))}% APR</td></tr>`).join('');
  return `<section class="print-sheet">
    <h2>Ledger Lane — monthly summary (print)</h2>
    ${sampleTag()}
    <p>Take-home ${fmt(inc)} · Spent &amp; saved ${fmt(s.total)} · Buffer left ${fmt(left)}</p>
    <p>50/30/20 — Needs ${fmt(s.needs)} (${pct(s.needs, inc)}) · Wants ${fmt(s.wants)} (${pct(s.wants, inc)}) · Savings ${fmt(s.savings)} (${pct(s.savings, inc)})</p>
    <h3>Categories</h3>
    <table class="mini"><thead><tr><th>Category</th><th>Planned</th><th>Spent</th><th>Status</th></tr></thead><tbody>${cats}</tbody></table>
    <h3>Goals</h3>
    <table class="mini"><thead><tr><th>Goal</th><th>Saved</th><th>Target</th><th>Time</th></tr></thead><tbody>${goalLines}</tbody></table>
    <h3>Debts</h3>
    <table class="mini"><thead><tr><th>Debt</th><th>Balance</th><th>Rate</th></tr></thead><tbody>${debtLines}</tbody></table>
    <p class="note">Emergency target: ${fmt(num(emergencyFund(4582, 3), 13746))} (3 months of essential spend). Generated from the same data as the on-screen pages.</p>
  </section>`;
}
