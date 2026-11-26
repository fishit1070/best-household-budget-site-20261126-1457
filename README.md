[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/fishit1070/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/fishit1070/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

# Ledger Lane — the Carter Family Budget

Ledger Lane is a working household budget, not a picture of one. It follows a
sample family — the Carters — through one month of money: what comes in, what
goes out, what is over budget, what the debts cost, and what to do next month.
Every number on every page is computed in the browser, offline, from the same
43 line items, so the dashboard, the budget table, the trends and the
calculators can never disagree with each other.

## The seven pages

- **Dashboard** — the month at a glance, mid-month: income received, spending
  so far, the one category running over budget (flagged), savings rate, and
  the buffer left.
- **Budget** — the full editable table: 43 line items in 15 categories. Edit
  any planned amount and every total, share and per-page figure recomputes
  live.
- **Trends** — six months of income, spending and savings, with the pattern
  called out in plain language.
- **Goals & Debts** — the emergency fund and vacation goals next to the debt
  list, with a payoff order and a debt-free date computed from the actual
  balances and rates.
- **Calculators** — five tools that genuinely compute (below).
- **Benchmarks** — the Carter month held up against the BLS Consumer
  Expenditure Survey 2024 and the classic rules of thumb.
- **Playbook** — the monthly routine the Carters follow, step by step.

## The five calculators

1. **50/30/20 split** — needs, wants and savings targets from any take-home
   pay, compared with the actual Carter split.
2. **Emergency fund** — months of essential spending, a target, and the date
   the fund is full at the current saving rate.
3. **Debt snowball** — smallest-balance-first payoff schedule with an
   amortization you can audit line by line.
4. **Savings goal** — the monthly amount a goal needs, or the date a monthly
   amount reaches it.
5. **Cost per use** — what a purchase really costs per wear, ride or use,
   the antidote to "it was on sale".

## Screenshots

Four screenshots ship in `screenshots/` and mirror exactly what the site
renders:

- **Dashboard (cover)** — the Carters mid-month: $6,200 take-home, spending so
  far, the savings rate, the $5 buffer, and Dining flagged as the one category
  running over budget.
- **Calculators** — the five tools with the Carter numbers already in them, so
  every result shown is a real computed result, not a mock-up.
- **Budget table** — all 43 line items in their 15 categories with planned,
  spent and remaining columns, and the totals row landing on $6,195 planned
  against $6,200 of income.
- **Phone dashboard** — the same dashboard at phone width: one column, the
  flagged category still first, every figure still legible.

## The sample household

The Carters take home **$6,200** a month. Their plan has **43 line items**
across 15 categories and spends **$6,195**, leaving a **$5 buffer** — tight on
purpose, because a budget with money sloshing around teaches nothing. Needs
come to $4,582, wants to $863 and savings to $750. The household is invented
for demonstration; the arithmetic is real.

## Sources

- Benchmarks: **BLS Consumer Expenditure Survey 2024**
- Rules of thumb: **Warren & Tyagi (2005)** for 50/30/20, **HUD** for the 30%
  housing-cost rule, **CFPB** guidance for emergency savings and debt payoff

## How it works

`main.ts` (Node 22, standard library only) is the make.fun entrypoint: it
copies the static site in `app/` and the `screenshots/` set into the output
directory and writes `dossier.json` via the vendored `buildDossier` from
`vendor/makefun-frontend.ts`. The site itself is plain HTML, CSS and
JavaScript with no build step and no network calls: `index.html` loads only
`style.css` and `main.js`, and the router lazy-loads the views, data,
calculators and charts on first render.
