// calc.js — Ledger Lane calculator engine.
// Pure functions only: no DOM, no imports, no state. All money in USD.
// Rounding policy (research pack §4): never round inside a loop; money
// outputs are rounded to 2 decimals, percentages to 1 decimal.

const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const round1 = (x) => Math.round((x + Number.EPSILON) * 10) / 10;

// §4.1 — Emergency fund target = essential monthly expenses × months of cover.
// (Carter check: 4,582 × 3 = 13,746; the 6-month stretch target is 27,492.)
export function emergencyFund(essentialMonthly, months) {
  return round2(essentialMonthly * months);
}

// §4.2 — Debt payoff simulation; avalanche and snowball share this one engine.
// Monthly cycle: (1) accrue interest at APR/12 on each open balance;
// (2) pay every open debt its minimum owed — the largest of its stated
// minimum, $25, and 2% of its current balance, capped at the balance
// (so loans pay their fixed contractual minimum, cards the max($25, 2%)
// rule, whichever is larger); (3) apply the rest of the monthly budget to
// the target debt, cascading to the next target if it clears mid-month.
// The total monthly budget (initial minimums + extraMonthly) never drops:
// a cleared debt's freed minimum rolls onto the target automatically.
// AVALANCHE target = highest APR (tie → lowest balance);
// SNOWBALL  target = lowest balance (tie → highest APR).
// Stops when every balance reaches 0, or after 600 months.
// (Checks: the personal loan alone at its $120 fixed minimum behaves like
// the closed form n ≈ 49.1; on the Carter set the two strategies produce
// different payoff orders — avalanche hits Card A first, snowball Card B.)
export function debtPayoff(debts, extraMonthly, strategy) {
  const MAX_MONTHS = 600;
  const state = debts.map((d) => ({
    name: d.name,
    balance: Math.max(0, d.balance),
    apr: d.apr,
    minimum: d.minimum || 0,
  }));
  const minOwedFor = (d) => Math.max(d.minimum, 25, d.balance * 0.02);
  const totalBudget =
    state.reduce((sum, d) => sum + (d.balance > 0 ? minOwedFor(d) : 0), 0) +
    extraMonthly;
  let totalInterest = 0;
  const order = [];
  const schedule = [];
  let month = 0;
  const open = () => state.filter((d) => d.balance > 0);
  const pickTarget = () => {
    const list = open();
    list.sort((a, b) =>
      strategy === 'snowball'
        ? a.balance - b.balance || b.apr - a.apr
        : b.apr - a.apr || a.balance - b.balance
    );
    return list[0];
  };

  while (open().length > 0 && month < MAX_MONTHS) {
    month += 1;
    // (1) interest for the month
    for (const d of state) {
      if (d.balance > 0) {
        const interest = (d.balance * d.apr) / 1200;
        d.balance += interest;
        totalInterest += interest;
      }
    }
    // (2) minimums on all open debts, capped at the balance
    let paid = 0;
    for (const d of state) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.balance, minOwedFor(d));
      d.balance -= pay;
      paid += pay;
      if (d.balance <= 0) {
        d.balance = 0;
        order.push(d.name);
      }
    }
    // (3) remaining budget (extra + freed minimums) onto the target debt
    let remaining = Math.max(0, totalBudget - paid);
    while (remaining > 0 && open().length > 0) {
      const target = pickTarget();
      const pay = Math.min(remaining, target.balance);
      target.balance -= pay;
      remaining -= pay;
      if (target.balance <= 0) {
        target.balance = 0;
        order.push(target.name);
      }
    }
    const balances = {};
    for (const d of state) balances[d.name] = round2(d.balance);
    schedule.push({ month, balances });
  }
  return { months: month, totalInterest: round2(totalInterest), order, schedule };
}

// §4.3 — Months to reach a savings target.
// With interest: FV(n) = saved×(1+i)^n + monthly×((1+i)^n − 1)/i with
// i = annualRatePct/100/12; the smallest integer n with FV(n) ≥ target,
// found by iterating upward. Zero rate is plain division, rounded up.
// (Checks: (1,800 − 960) / 120 = 7 exactly; (13,746 − 4,200) / 300 → 32.)
export function goalMonths(target, saved, monthly, annualRatePct = 0) {
  if (saved >= target) return 0;
  const i = annualRatePct / 100 / 12;
  if (i === 0) {
    if (monthly <= 0) return Infinity;
    return Math.ceil((target - saved) / monthly);
  }
  if (monthly <= 0 && saved <= 0) return Infinity;
  for (let n = 1; n <= 1200; n += 1) {
    const f = Math.pow(1 + i, n);
    if (saved * f + (monthly * (f - 1)) / i >= target) return n;
  }
  return Infinity;
}

// §4.4 / §2.3 — The HUD 30% housing rule, applied to take-home pay.
// Verdicts: ≤30% "within the 30% guideline"; >30% cost-burdened;
// >50% severely cost-burdened. Verdicts are read off the same rounded
// percentages the page displays, so the number and the label never disagree.
// (Check: rent 1,650 on 6,200 → 26.6% rent-only; with 400 utilities → 33.0%.)
export function rentVerdict(rent, takeHome, utilities = 0) {
  const pctRentOnly = round1((rent / takeHome) * 100);
  const pctWithUtilities = round1(((rent + utilities) / takeHome) * 100);
  const verdict = (pct) =>
    pct > 50
      ? 'severely cost-burdened (>50%)'
      : pct > 30
        ? 'cost-burdened (>30%)'
        : 'within the 30% guideline';
  return {
    pctRentOnly,
    pctWithUtilities,
    verdictRentOnly: verdict(pctRentOnly),
    verdictWith: verdict(pctWithUtilities),
  };
}

// §4.5 — Compound growth with monthly compounding; deposits land at the
// END of each month. FV = initial×(1+i)^N + monthly×((1+i)^N − 1)/i,
// i = annualRatePct/100/12, N = 12×years. Zero rate: FV = initial + monthly×N.
// (Check: 300/mo @ 4.5% × 5 yrs, no initial lump → 20,143.67.)
export function compoundGrowth(monthly, annualRatePct, years, initial = 0) {
  const N = 12 * years;
  const i = annualRatePct / 100 / 12;
  if (i === 0) return round2(initial + monthly * N);
  const f = Math.pow(1 + i, N);
  return round2(initial * f + (monthly * (f - 1)) / i);
}

// §4.6 — 50/30/20 checker. Percentages are shares of take-home pay; deltas
// are dollars versus the 50/30/20 target amounts for that take-home
// (actual − target, so over-target is positive).
// (Carter check: 4,582 / 863 / 750 on 6,200 → 73.9% / 13.9% / 12.1%,
// deltas +1,482 / −997 / −490; the three buckets sum to takeHome − buffer.)
export function check503020(needs, wants, savings, takeHome) {
  const pct = (x) => round1((x / takeHome) * 100);
  return {
    needsPct: pct(needs),
    wantsPct: pct(wants),
    savingsPct: pct(savings),
    deltas: {
      needs: round2(needs - takeHome * 0.5),
      wants: round2(wants - takeHome * 0.3),
      savings: round2(savings - takeHome * 0.2),
    },
  };
}

// §4.2 closed form — fixed-payment amortisation of a single debt, used by
// the debt page. n = −ln(1 − r×PV/PMT) / ln(1+r), r = APR/100/12; months is
// the ceiling of n (the final payment is partial), and totalInterest is
// taken from the real payment stream: (months−1) full payments plus the
// final partial one. A payment that does not cover the monthly interest
// never amortises → both fields are Infinity.
// (Check: 4,680 @ 11.5% at 120/mo → n ≈ 49.1 → 50 monthly payments.)
export function amortize(balance, apr, monthlyPayment) {
  const r = apr / 100 / 12;
  if (balance <= 0) return { months: 0, totalInterest: 0 };
  if (r === 0) {
    return { months: Math.ceil(balance / monthlyPayment), totalInterest: 0 };
  }
  if (monthlyPayment <= balance * r) {
    return { months: Infinity, totalInterest: Infinity };
  }
  const nExact =
    -Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r);
  const months = Math.ceil(nExact - 1e-9);
  const f = Math.pow(1 + r, months - 1);
  const balanceBeforeLast = balance * f - (monthlyPayment * (f - 1)) / r;
  const finalPayment = balanceBeforeLast * (1 + r);
  const totalPaid = (months - 1) * monthlyPayment + finalPayment;
  return { months, totalInterest: round2(totalPaid - balance) };
}
