// Ledger Lane — data.js
// Original data file for Ledger Lane, a working household budget site.
// The household below is a SAMPLE household, invented for demonstration and
// labelled as sample everywhere it appears on the site. It is not a real
// family and not survey data. The benchmark and rules data further down is
// real and sourced (BLS Consumer Expenditure Survey 2024, HUD, CFPB,
// Warren & Tyagi) so the sample can be compared against reality on the
// same page, in the same currency (USD), with no invented conversions.
//
// November 2026 is the sample's fully itemised month: zero-based, every
// dollar assigned. Total outflow $6,195 against $6,200 take-home leaves
// exactly the $5 unassigned buffer. `planned` equals `spent` on every line
// except Dining Out, where the family planned $200 and spent $266 — the
// one over-budget category the dashboard flags.

export const HOUSEHOLD = {
  name: 'The Carter Family',
  earners: 2,
  kids: 2,
  renting: true,
  takeHome: 6200,
  month: 'November 2026',
};

// The 16 spending categories (Income is tracked separately, not a category).
// `kind` is the category's default 50/30/20 tag. Two November line items
// carry their own item-level `kind` override, exactly as disclosed in the
// content pack: the Transport service/tyres sinking transfer is Savings
// (money moved to a fund), and the gym is a Want inside Health.
export const CATEGORIES = [
  { id: 'housing',       name: 'Housing',                    kind: 'need' },
  { id: 'utilities',     name: 'Utilities',                  kind: 'need' },
  { id: 'groceries',     name: 'Groceries',                  kind: 'need' },
  { id: 'dining',        name: 'Dining Out',                 kind: 'want' },
  { id: 'transport',     name: 'Transport',                  kind: 'need' },
  { id: 'insurance',     name: 'Insurance',                  kind: 'need' },
  { id: 'health',        name: 'Health',                     kind: 'need' },
  { id: 'childcare',     name: 'Childcare & Education',      kind: 'need' },
  { id: 'debt',          name: 'Debt Payments',              kind: 'need' },
  { id: 'personal',      name: 'Personal & Clothing',        kind: 'want' },
  { id: 'leisure',       name: 'Leisure',                    kind: 'want' },
  { id: 'subscriptions', name: 'Subscriptions & Memberships', kind: 'want' },
  { id: 'giving',        name: 'Giving',                     kind: 'want' },
  { id: 'savings',       name: 'Savings',                    kind: 'savings' },
  { id: 'pets',          name: 'Pets',                       kind: 'want' },
  { id: 'misc',          name: 'Miscellaneous',              kind: 'want' },
];

// The 43 November 2026 line items (SAMPLE). Spent sums to $6,195.
export const ITEMS = [
  { id: 'rent',                category: 'housing',   label: 'Rent',                            planned: 1650, spent: 1650 },
  { id: 'renters-insurance',   category: 'housing',   label: 'Renters insurance',               planned: 28,   spent: 28 },
  { id: 'electricity',         category: 'utilities', label: 'Electricity',                     planned: 142,  spent: 142 },
  { id: 'water-sewer',         category: 'utilities', label: 'Water & sewer',                   planned: 68,   spent: 68 },
  { id: 'internet',            category: 'utilities', label: 'Internet',                        planned: 75,   spent: 75 },
  { id: 'mobile-phones',       category: 'utilities', label: 'Mobile phones (2 lines)',         planned: 110,  spent: 110 },
  { id: 'supermarket',         category: 'groceries', label: 'Supermarket — weekly shops',      planned: 520,  spent: 520 },
  { id: 'market-topups',       category: 'groceries', label: 'Market / bakery top-ups',         planned: 96,   spent: 96 },
  { id: 'household-consumables', category: 'groceries', label: 'Household consumables',         planned: 64,   spent: 64 },
  { id: 'restaurants',         category: 'dining',    label: 'Restaurants',                     planned: 120,  spent: 148 },
  { id: 'coffee-shops',        category: 'dining',    label: 'Coffee shops',                    planned: 30,   spent: 42 },
  { id: 'takeaway',            category: 'dining',    label: 'Takeaway',                        planned: 50,   spent: 76 },
  { id: 'car-loan',            category: 'transport', label: 'Car loan payment',                planned: 342,  spent: 342 },
  { id: 'fuel',                category: 'transport', label: 'Fuel',                            planned: 186,  spent: 186 },
  { id: 'car-insurance',       category: 'transport', label: 'Car insurance',                   planned: 158,  spent: 158 },
  { id: 'parking-tolls',       category: 'transport', label: 'Parking & tolls',                 planned: 38,   spent: 38 },
  { id: 'service-sinking',     category: 'transport', label: 'Service / tyres sinking transfer', planned: 50,  spent: 50, kind: 'savings' },
  { id: 'health-premiums',     category: 'insurance', label: 'Health insurance premiums',       planned: 284,  spent: 284 },
  { id: 'life-insurance',      category: 'insurance', label: 'Life insurance',                  planned: 46,   spent: 46 },
  { id: 'pharmacy',            category: 'health',    label: 'Pharmacy',                        planned: 58,   spent: 58 },
  { id: 'dental',              category: 'health',    label: 'Dental check-up (co-pay)',        planned: 40,   spent: 40 },
  { id: 'gym',                 category: 'health',    label: 'Gym',                             planned: 55,   spent: 55, kind: 'want' },
  { id: 'after-school-care',   category: 'childcare', label: 'After-school care',               planned: 320,  spent: 320 },
  { id: 'school-meals',        category: 'childcare', label: 'School meals',                    planned: 72,   spent: 72 },
  { id: 'school-supplies',     category: 'childcare', label: 'School supplies / trips',         planned: 35,   spent: 35 },
  { id: 'card-a-minimum',      category: 'debt',      label: 'Credit Card A — minimum payment', planned: 85,   spent: 85 },
  { id: 'card-b-minimum',      category: 'debt',      label: 'Credit Card B — minimum payment', planned: 45,   spent: 45 },
  { id: 'personal-loan-payment', category: 'debt',    label: 'Personal loan payment',           planned: 120,  spent: 120 },
  { id: 'clothing',            category: 'personal',  label: 'Clothing',                        planned: 88,   spent: 88 },
  { id: 'haircuts-care',       category: 'personal',  label: 'Haircuts & personal care',        planned: 52,   spent: 52 },
  { id: 'streaming',           category: 'leisure',   label: 'Streaming subscriptions',         planned: 38,   spent: 38 },
  { id: 'cinema-outing',       category: 'leisure',   label: 'Cinema / family outing',          planned: 64,   spent: 64 },
  { id: 'kids-activities',     category: 'leisure',   label: "Kids' activities / hobbies",      planned: 58,   spent: 58 },
  { id: 'charity',             category: 'giving',    label: 'Charity / church',                planned: 60,   spent: 60 },
  { id: 'gifts',               category: 'giving',    label: 'Gifts',                           planned: 45,   spent: 45 },
  { id: 'emergency-transfer',  category: 'savings',   label: 'Emergency fund transfer',         planned: 300,  spent: 300 },
  { id: 'holiday-fund',        category: 'savings',   label: 'Holiday sinking fund',            planned: 120,  spent: 120 },
  { id: 'car-repair-fund',     category: 'savings',   label: 'Car repair sinking fund',         planned: 80,   spent: 80 },
  { id: 'retirement-topup',    category: 'savings',   label: 'Retirement top-up (IRA)',         planned: 200,  spent: 200 },
  { id: 'pet-food',            category: 'pets',      label: 'Pet food & litter',               planned: 62,   spent: 62 },
  { id: 'vet-sinking',         category: 'pets',      label: 'Vet sinking transfer',            planned: 30,   spent: 30 },
  { id: 'bank-fees',           category: 'misc',      label: 'Bank fees',                       planned: 8,    spent: 8 },
  { id: 'misc-cash',           category: 'misc',      label: 'Misc cash spending',              planned: 37,   spent: 37 },
];

// Six months of per-category totals, Jun–Nov 2026 (SAMPLE). November's
// per-category totals equal the ITEMS sums above. Story in the data:
// childcare drops in Jul–Aug (after-school care pauses for the school
// holidays) and spikes in Sep (start-of-term costs); savings dip to $550
// in Aug (holiday month); pets spike in Aug ($124 — annual vet check).
// Every month: total + buffer = $6,200 income.
export const TREND = [
  { month: 'Jun 2026', income: 6200, total: 5862, buffer: 338, categories: { housing: 1678, utilities: 362, groceries: 642, dining: 214, transport: 738, insurance: 330, health: 118, childcare: 392, debt: 250, personal: 96,  leisure: 132, subscriptions: 0, giving: 85,  savings: 700, pets: 84,  misc: 41 } },
  { month: 'Jul 2026', income: 6200, total: 5780, buffer: 420, categories: { housing: 1678, utilities: 388, groceries: 658, dining: 238, transport: 762, insurance: 330, health: 124, childcare: 180, debt: 250, personal: 112, leisure: 148, subscriptions: 0, giving: 85,  savings: 700, pets: 88,  misc: 39 } },
  { month: 'Aug 2026', income: 6200, total: 5984, buffer: 216, categories: { housing: 1678, utilities: 405, groceries: 701, dining: 312, transport: 815, insurance: 330, health: 139, childcare: 180, debt: 250, personal: 158, leisure: 205, subscriptions: 0, giving: 85,  savings: 550, pets: 124, misc: 52 } },
  { month: 'Sep 2026', income: 6200, total: 6014, buffer: 186, categories: { housing: 1678, utilities: 378, groceries: 665, dining: 226, transport: 744, insurance: 330, health: 131, childcare: 455, debt: 250, personal: 104, leisure: 138, subscriptions: 0, giving: 85,  savings: 700, pets: 86,  misc: 44 } },
  { month: 'Oct 2026', income: 6200, total: 6025, buffer: 175, categories: { housing: 1678, utilities: 371, groceries: 648, dining: 241, transport: 731, insurance: 330, health: 146, childcare: 427, debt: 250, personal: 121, leisure: 149, subscriptions: 0, giving: 105, savings: 700, pets: 90,  misc: 38 } },
  { month: 'Nov 2026', income: 6200, total: 6195, buffer: 5,   categories: { housing: 1678, utilities: 395, groceries: 680, dining: 266, transport: 774, insurance: 330, health: 153, childcare: 427, debt: 250, personal: 140, leisure: 160, subscriptions: 0, giving: 105, savings: 700, pets: 92,  misc: 45 } },
];

// Savings goals (SAMPLE). The emergency fund target is 3 months of
// essential expenses: 3 × $4,582 needs = $13,746 (see SPLIT).
export const GOALS = [
  { name: 'Emergency fund',            target: 13746, saved: 4200, monthly: 300 },
  { name: 'Holiday fund (next summer)', target: 1800, saved: 960,  monthly: 120 },
  { name: 'Car repair / replacement fund', target: 2500, saved: 700, monthly: 80 },
];

// Consumer debts (SAMPLE). Total balance $9,950; minimums 85 + 45 + 120 =
// $250, which is the Debt Payments category total above. Credit Card B is
// both the smallest balance AND the lower-APR card, so the snowball order
// (B → A → loan) genuinely differs from the avalanche order (A → B → loan).
// The car loan ($11,240 at 6.9%, $342/month) is deliberately NOT listed
// here — its payment lives in Transport, and listing it here too would
// double-count it.
export const DEBTS = [
  { name: 'Credit Card A (store card)', balance: 3850, apr: 24.99, minimum: 85 },
  { name: 'Credit Card B',              balance: 1420, apr: 19.99, minimum: 45 },
  { name: 'Personal loan',              balance: 4680, apr: 11.50, minimum: 120 },
];

// What US households actually spend — BLS Consumer Expenditure Survey 2024
// (news release USDL-25-1586). Averages per consumer unit; monthlyUsd is
// the BLS annual figure ÷ 12, rounded. Percentages are the BLS published
// shares and may not sum to exactly 100.0 due to BLS rounding.
export const BENCH = [
  { category: 'Housing',                            monthlyUsd: 2189, pct: 33.4, source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Transportation',                     monthlyUsd: 1110, pct: 17.0, source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Food',                               monthlyUsd: 847,  pct: 12.9, source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Personal insurance & pensions',      monthlyUsd: 816,  pct: 12.5, source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Healthcare',                         monthlyUsd: 516,  pct: 7.9,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Entertainment',                      monthlyUsd: 301,  pct: 4.6,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Cash contributions (gifts/donations)', monthlyUsd: 191, pct: 2.9, source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Apparel & services',                 monthlyUsd: 167,  pct: 2.5,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Education',                          monthlyUsd: 131,  pct: 2.0,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Miscellaneous',                      monthlyUsd: 102,  pct: 1.6,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Personal care products & services',  monthlyUsd: 82,   pct: 1.2,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Alcoholic beverages',                monthlyUsd: 54,   pct: 0.8,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Tobacco products & smoking supplies', monthlyUsd: 29,  pct: 0.4,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
  { category: 'Reading',                            monthlyUsd: 10,   pct: 0.2,  source: 'BLS Consumer Expenditure Survey 2024 (USDL-25-1586)' },
];

// The rules of thumb the site's calculators are built on, with sources.
export const RULES = {
  fiftyThirtyTwenty: { needs: 50, wants: 30, savings: 20, source: 'Warren & Tyagi, All Your Worth (2005)' },
  housing:           { pct: 30, source: 'HUD cost-burden threshold (Brooke Amendment tradition)' },
  emergency:         { months: '3–6 of essential expenses', source: 'CFPB guidance' },
};

// The sample's actual 50/30/20 split for November 2026. These constants are
// the sums of ITEMS grouped by kind (category default tag, with the two
// disclosed item-level overrides above): needs $4,582, wants $863,
// savings $750 — and 4,582 + 863 + 750 = 6,195, the ITEMS spent total.
// sumByKind(ITEMS) below must reproduce exactly these numbers.
export const SPLIT = { needs: 4582, wants: 863, savings: 750 };

// Sum a list of line items by 50/30/20 kind, using each item's own `kind`
// override when present and its category's default tag otherwise.
export function sumByKind(items) {
  const kindByCategory = {};
  for (const c of CATEGORIES) kindByCategory[c.id] = c.kind;
  const totals = { need: 0, want: 0, savings: 0 };
  for (const item of items) {
    const kind = item.kind || kindByCategory[item.category];
    totals[kind] += item.spent;
  }
  return { needs: totals.need, wants: totals.want, savings: totals.savings };
}

// The Playbook: ten original, actionable guides written for Ledger Lane,
// plus the quick-start checklist. Bodies are condensed from the site's
// content pack; the numbers quoted inside them (e.g. the $3,850 card at
// 24.99% APR taking ~11.5 years on an $85 fixed payment) are the sample
// household's own figures, so the guides and the calculators never
// contradict each other.
export const PLAYBOOK = {
  guides: [
    {
      title: 'The 30-minute bill audit (do it tonight)',
      minutes: 30,
      body: "List every bill that leaves your account automatically. Next to each, write the date it last went UP. Anything that rose without you noticing gets a phone call: ask for the retention/loyalty rate, and write down the competitor price before you dial — the call works when you can name a real alternative. Calendar the renewal date of the three biggest bills so the next rise never arrives unannounced.",
    },
    {
      title: 'The subscription audit',
      minutes: 20,
      body: "Print or export three months of bank statements and highlight every recurring charge under $20 — this is where money leaks, because each one feels too small to bother with. For each: when did you last actually use it? Cancel on the spot if the honest answer is 'can't remember'. Keep a one-line 'subscriptions I pay for' note in your budget with the renewal date and price of each survivor; if it's not on the list, it gets cancelled when spotted.",
    },
    {
      title: 'Sinking funds: make lumpy costs monthly',
      minutes: 20,
      body: "Car repairs, annual insurance premiums, school start-of-term costs, birthdays, holidays, the boiler service — none of these are surprises, they're just bills with long intervals. For each: yearly cost ÷ 12 = a small monthly transfer into a labelled savings pot on payday. When the bill lands, it pays itself from the pot and never touches the credit card. Start with the two that have hurt you most in the last year.",
    },
    {
      title: 'The payday routine (15 minutes, same day every month)',
      minutes: 15,
      body: "In this order: (1) savings and sinking-fund transfers out — before spending starts, not from what's left; (2) check every bill amount against last month and query any rise; (3) assign every remaining dollar a category, including a small buffer line; (4) glance at debt balances and confirm minimums are covered. Fifteen minutes on payday replaces daily money anxiety.",
    },
    {
      title: 'Grocery control without misery',
      minutes: 15,
      body: "The grocery bill is the biggest flexible need, so manage it with a system, not willpower: shop once a week from a list built from a rough meal plan; keep a running 'we're out of it' note on the fridge so top-up shops (the expensive ones) shrink; check the price per 100g, not the shelf price; and set the category budget from your own last three months' average minus 5% — a target you can actually hit beats an aspirational one you'll abandon.",
    },
    {
      title: 'Kill one debt properly',
      minutes: 20,
      body: "Minimum payments are designed to keep a balance alive for years — on a $3,850 card at 24.99% APR, an $85 fixed payment takes about 11½ years. Pick the avalanche order (highest APR first) if you want the maths optimum, or snowball (smallest balance first) if an early 'paid off' stamp is what keeps you going — the best method is the one still running in month six. Either way: fix the TOTAL debt payment as a set monthly amount that never drops when a balance clears; the freed minimum rolls onto the next debt automatically.",
    },
    {
      title: 'The annual-bills calendar',
      minutes: 30,
      body: "One page, twelve months, every irregular cost written in the month it lands: insurance renewals, car tax and service, school costs, holidays, gift seasons, property tax. Total each month. If one month is brutal, that's a sinking-fund problem you can see coming a year away — spread it monthly (see the sinking funds guide) instead of discovering it with a credit card.",
    },
    {
      title: 'Renegotiate the big four once a year',
      minutes: 40,
      body: "Broadband, mobile, energy and insurance are priced for people who don't call. At each renewal: get one genuine competitor quote, call, say the number, and ask them to beat it. Ten minutes each, once a year. Record what you saved in your budget notes — seeing last year's total is what makes you do it again next year.",
    },
    {
      title: 'The 24-hour rule for wants',
      minutes: 5,
      body: "Anything non-essential over a threshold you set (say $50) goes on a written wish list with the date, not in the basket. If you still want it in 24 hours — a week for big items — and the category has room, buy it without guilt. Most items quietly expire off the list. This one habit protects the Wants budget better than any ban, because it bans nothing.",
    },
    {
      title: 'Monthly money meeting (30 minutes, household, same date)',
      minutes: 30,
      body: "Agenda that never changes: (1) last month — which three categories moved most, and why; (2) the split — what were our actual needs/wants/savings percentages versus target; (3) goals — are the emergency fund and sinking funds on schedule; (4) next month — what's irregular, what changes. Decide one — only one — adjustment for next month. Households that review monthly catch a drifting budget while it's still a nudge, not a rescue.",
    },
  ],
  quickStart: [
    'List all income, take-home',
    'List every automatic payment',
    'Cancel one unused subscription',
    'Open/label one sinking-fund pot',
    'Set the emergency-fund target (3 × essentials)',
    'Write down every debt: balance, APR, minimum',
    'Put the money-meeting date in the calendar',
  ],
};
