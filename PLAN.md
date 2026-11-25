# Smart Expense Tracker — Project Plan

A beginner-friendly expense tracker built with **plain HTML, CSS and vanilla JavaScript**.
No backend, no external APIs, no libraries, no build step. Data lives in the browser's `localStorage`.

This file is the **single source of truth** ("the contract") for three AI coding sessions that
work **in parallel and independently**. Every ID, class name, function name and data shape below
is a promise between agents. Do not deviate from it.

---

## 1. Requirements

### 1.1 Functional

| # | Requirement |
|---|-------------|
| F1 | Add an expense (description, amount, category, date). |
| F2 | Delete an expense. |
| F3 | Categories are exactly: `Food`, `Travel`, `Shopping`, `Education`, `Others`. |
| F4 | Set a monthly budget (one budget value, applied to the month being viewed). |
| F5 | Show **total expenses** and **remaining budget** for the selected month. |
| F6 | Show a **category-wise breakdown** (amount + percentage + bar) for the selected month. |
| F7 | Show a **warning** when total expenses exceed the budget. |
| F8 | Persist budget and expenses in `localStorage`; restore them on page load. |
| F9 | Validate all user input and show a clear message next to the bad field. |

### 1.2 Non-functional

- Opens by double-clicking `index.html` (works from `file://`). No server required.
- No external network requests, CDNs, fonts, or images from other sites.
- Readable, commented, beginner-friendly code: `const`/`let`, plain functions, no classes/modules/frameworks.
- Responsive down to ~360px wide. Keyboard accessible; inputs have `<label>`s; warning has `role="alert"`.
- Never inject user text with `innerHTML` (use `textContent`) — prevents HTML injection.

### 1.3 Product decisions (fixed, so agents don't have to guess)

- **Month view:** a month picker (`<input type="month">`) defaults to the current month. The expense list,
  totals, remaining budget, warning and breakdown all show **only the selected month**.
- **Budget:** a single number stored once; it is compared against whichever month is selected.
  "Not set" is stored as `null`.
- **Currency:** one constant `CURRENCY_SYMBOL = "$"` at the top of `app.js`. Change it there to switch currency.
- **Dates:** an expense date may not be in the future. Default value of the date input is today.
- **Money rounding:** all sums are rounded to 2 decimals (`Math.round(x * 100) / 100`).
- **Sort order:** list shows newest date first; ties are broken by newest `createdAt` first.

---

## 2. Folder structure

```
Smart-Expense-Tracker/
├── PLAN.md          ← this file (read-only for all agents)
├── index.html       ← Agent 1 (Frontend)
├── style.css        ← Agent 1 (Frontend)
├── app.js           ← Agent 2 (Logic)
├── tests.html       ← Agent 3 (Testing)
├── TEST_CASES.md    ← Agent 3 (Testing)
└── README.md        ← created by the human/integrator at the end (optional)
```

Flat layout on purpose: relative paths (`style.css`, `app.js`) are the same everywhere.

---

## 3. Agent responsibilities & ownership rules

### Ground rules for ALL agents

1. **Only create/edit the files you own** (table below). Never edit another agent's file, not even to fix a typo —
   report it to the human instead (see §7.3 "Contract change requests").
2. **`PLAN.md` is read-only.** Do not change it. If something is ambiguous, pick the most literal reading and
   note it in your final report.
3. Use the IDs, classes, function names and data shapes in §4–§6 **exactly** (case-sensitive).
4. Do not add other files to the repo (no extra helper scripts, no `package.json`). Scratch files go outside the repo.
5. Work on your own branch (§7) and commit only your owned files.
6. Everything must work with the other agents' files **missing** (see "Independent verification" per agent).

| Agent | Branch | Owns (may create/edit) | Must NOT touch |
|-------|--------|------------------------|----------------|
| 1 — Frontend | `agent/frontend` | `index.html`, `style.css` | `app.js`, `tests.html`, `TEST_CASES.md`, `PLAN.md` |
| 2 — Logic | `agent/logic` | `app.js` | `index.html`, `style.css`, `tests.html`, `TEST_CASES.md`, `PLAN.md` |
| 3 — Testing | `agent/testing` | `tests.html`, `TEST_CASES.md` | `index.html`, `style.css`, `app.js`, `PLAN.md` |

### Agent 1 — Frontend (`index.html`, `style.css`)

Build the structure and look. **No inline JavaScript, no `onclick=` attributes** — behaviour belongs to `app.js`.

- `index.html`: semantic markup with every ID/class in §4. Load CSS with `<link rel="stylesheet" href="style.css">`
  and JS with `<script src="app.js" defer></script>` at the end of `<body>`.
- Category `<select>` options are **static in the HTML**, values exactly the five category names, preceded by a
  placeholder `<option value="">Select a category</option>`.
- Include `<noscript>` message.
- Provide **static example markup** for a rendered expense row and breakdown row inside HTML comments
  (so the styles can be understood), but do not leave sample data visible on the page.
- `style.css`: layout, typography, form/field styles, error styles, warning banner, list rows, delete button,
  breakdown bars, per-category colours (`.cat-food`, `.cat-travel`, `.cat-shopping`, `.cat-education`, `.cat-others`),
  negative-remaining style, `[hidden] { display: none !important; }`, mobile layout. Check colour contrast ≥ 4.5:1.
- Must style the **classes app.js will generate** (§4.4): `expense-item`, `expense-desc`, `expense-meta`,
  `expense-category`, `expense-date`, `expense-amount`, `delete-btn`, `breakdown-row`, `breakdown-label`,
  `breakdown-bar`, `breakdown-bar-fill`, `breakdown-amount`, `breakdown-percent`, `input-error`, `error-message`, `negative`.

**Independent verification:** open `index.html` with no `app.js` present — page must render cleanly (all sections
visible, no console errors other than a 404 for `app.js`). Temporarily hand-test states by editing the DOM in
browser DevTools (remove `hidden` from `#budget-warning`, add `.input-error` to an input, paste the example rows).

### Agent 2 — Application logic (`app.js`)

Implement every function in §5 with exactly those names/signatures, plus DOM wiring.

- **Pure functions first** (validation, math, filtering, storage) — they take inputs and return outputs and must
  not read the DOM. The DOM layer (`render*`, event handlers, `init`) sits underneath them.
- Everything is exported on one global: `window.ExpenseApp = { ... }` (§5.9) so tests can call it.
- **`app.js` must load safely on any page**, including `tests.html` (which has no tracker DOM):
  never touch the DOM at load time except for registering the bootstrap in §5.8.
- Must also work if opened with elements missing: `init()` checks that required IDs exist and logs a
  `console.error` naming the missing ID instead of crashing.
- Storage failures (private mode, quota, corrupt JSON) must never throw — fall back to empty data.
- No `eval`, no `innerHTML` with user text, no external requests.

**Independent verification:** write a throw-away scratch HTML page *outside the repo* (or use a Node one-liner
`require('./app.js')` — see §5.9) that calls the pure functions; and, once Agent 1's markup exists, drop it in
for a manual run. Do not commit scratch files.

### Agent 3 — Testing (`tests.html`, `TEST_CASES.md`)

- `tests.html`: a self-contained, dependency-free test page with its own tiny runner
  (`test(name, fn)`, `assertEqual(actual, expected)`, `assertTrue`, `assertDeepEqual`, `assertThrowsNot`).
  It loads `app.js` via `<script src="app.js"></script>` and tests only through `window.ExpenseApp`.
  Shows a pass/fail summary at the top, one line per test (green/red), and the failure message.
- **Test isolation:** before running, call `ExpenseApp.setStorageKey("smartExpenseTracker.TEST")` and clear that
  key between tests. Never touch the real key `smartExpenseTracker.v1`.
- If `window.ExpenseApp` is missing, show a single clear red banner ("app.js not found or failed to load") rather than
  throwing 100 errors.
- Test groups (minimum): validation (expense), validation (budget), create/add/delete, month filtering,
  totals/remaining/exceeded, category breakdown, formatting, storage save/load/corrupt, sorting.
  Cases listed in §9.3.
- `TEST_CASES.md`: human-readable catalogue of **all** tests: ID, area, steps/inputs, expected result.
  Part A = automated cases in `tests.html` (IDs `T-xx`); Part B = **manual UI test cases** against `index.html`
  (IDs `M-xx`) covering every acceptance criterion in §10 (add, delete, budget, warning, persistence, validation,
  month switching, responsive layout, XSS string, etc.), with a Pass/Fail column left blank.
- Optional (nice to have): a clearly labelled "Integration" section in `tests.html` that loads `index.html` in an
  `<iframe>` and drives it; it must **skip** (not fail) when the iframe can't be read (browsers often block this on `file://`).

**Independent verification:** write tests against the contract. While `app.js` doesn't exist yet, the page must
show the red "not loaded" banner. When Agent 2's branch is merged, the suite must run and (if the implementation is
correct) pass without edits.

---

## 4. Shared HTML contract (Agent 1 provides, Agent 2 consumes)

### 4.1 Element IDs (all required, all unique)

| ID | Element | Purpose |
|----|---------|---------|
| `month-filter` | `<input type="month">` | Month being viewed (`YYYY-MM`). app.js sets default to current month. |
| **Budget** | | |
| `budget-form` | `<form novalidate>` | Wraps budget input + save button. |
| `budget-input` | `<input type="number" step="0.01" min="0">` | Monthly budget amount. |
| `budget-error` | `<span class="error-message">` | Validation message for budget (empty by default). |
| `budget-save-btn` | `<button type="submit">` | Saves the budget. |
| **Summary** | | |
| `budget-display` | `<span>` | Shows the saved budget, or `Not set`. |
| `total-expenses` | `<span>` | Total spent in selected month (formatted currency). |
| `remaining-budget` | `<span>` | Budget − total (formatted). Gets class `negative` when < 0. Shows `—` if no budget. |
| `budget-warning` | `<div role="alert" hidden>` | Over-budget warning; visible only when exceeded. app.js writes its text. |
| **Add-expense form** | | |
| `expense-form` | `<form novalidate>` | Wraps the four fields + button. |
| `description-input` | `<input type="text" maxlength="60">` | Description. |
| `amount-input` | `<input type="number" step="0.01" min="0">` | Amount. |
| `category-select` | `<select>` | Category (static options, §3 Agent 1). |
| `date-input` | `<input type="date">` | Expense date. app.js sets default to today and `max` to today. |
| `description-error` | `<span class="error-message">` | Message for description. |
| `amount-error` | `<span class="error-message">` | Message for amount. |
| `category-error` | `<span class="error-message">` | Message for category. |
| `date-error` | `<span class="error-message">` | Message for date. |
| `add-expense-btn` | `<button type="submit">` | Adds the expense. |
| **List** | | |
| `expense-list` | `<ul>` | Container; app.js fills it with `<li class="expense-item">`. |
| `empty-message` | `<p hidden>` | "No expenses for this month." Shown when list is empty. |
| **Breakdown** | | |
| `category-breakdown` | `<div>` | Container; app.js fills it with five `.breakdown-row` elements. |

Error `<span>`s must be empty and visually collapsed when there is no error. Each input has a `<label for="…">`.
Inputs should have `aria-describedby` pointing to their error span.

### 4.2 Required text/classes set by app.js on existing elements

| Situation | What app.js does | What Frontend must style |
|-----------|------------------|--------------------------|
| Field invalid | adds class `input-error` to the input; writes message into its `*-error` span via `textContent`; sets `aria-invalid="true"` | `.input-error` (red border), `.error-message` (small red text) |
| Field valid / cleared | removes `input-error`, empties the span, removes `aria-invalid` | — |
| Budget exceeded | removes `hidden` attribute from `#budget-warning`, sets its text | `#budget-warning` banner (red/orange, prominent) |
| Budget OK / not set | sets `hidden` attribute on `#budget-warning` | `[hidden]{display:none!important}` |
| Remaining < 0 | adds class `negative` to `#remaining-budget` | `.negative` (red) |
| No expenses in month | removes `hidden` from `#empty-message` | — |

### 4.3 Category names and CSS classes

| Category (exact value) | CSS class on rows |
|------------------------|-------------------|
| `Food` | `cat-food` |
| `Travel` | `cat-travel` |
| `Shopping` | `cat-shopping` |
| `Education` | `cat-education` |
| `Others` | `cat-others` |

### 4.4 Markup that app.js generates (Frontend must style it, Logic must produce it exactly)

**Expense row** — one per expense, appended to `#expense-list`:

```html
<li class="expense-item cat-food" data-id="exp_1700000000000_ab12">
  <div class="expense-desc">Lunch</div>
  <div class="expense-meta">
    <span class="expense-category">Food</span>
    <span class="expense-date">2026-11-25</span>
  </div>
  <div class="expense-amount">$12.50</div>
  <button type="button" class="delete-btn" data-id="exp_1700000000000_ab12"
          aria-label="Delete expense: Lunch">Delete</button>
</li>
```

**Breakdown row** — exactly five, in category order, appended to `#category-breakdown`
(categories with zero spend are still shown, with 0% / empty bar):

```html
<div class="breakdown-row cat-food" data-category="Food">
  <span class="breakdown-label">Food</span>
  <div class="breakdown-bar"><div class="breakdown-bar-fill" style="width: 42.5%"></div></div>
  <span class="breakdown-amount">$12.50</span>
  <span class="breakdown-percent">42.5%</span>
</div>
```

`style="width: …%"` on `.breakdown-bar-fill` is the only inline style app.js is allowed to set.

---

## 5. JavaScript contract (Agent 2 provides, Agent 3 tests)

All of the following live in `app.js` and are exported on `window.ExpenseApp` (§5.9).
"Pure" = no DOM, no `localStorage` (except §5.5), no side effects, never mutates its arguments.

### 5.1 Constants

```js
const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Others"];
const CURRENCY_SYMBOL = "$";
const MAX_DESCRIPTION_LENGTH = 60;
const MAX_AMOUNT = 1000000;        // per expense
const MAX_BUDGET = 10000000;
let   STORAGE_KEY = "smartExpenseTracker.v1";   // changeable only via setStorageKey()
```

### 5.2 Data structures

```js
// Expense — one record
{
  id:          "exp_<timestamp>_<random4>",  // string, unique
  description: "Lunch",                      // string, trimmed, 1–60 chars
  amount:      12.5,                         // number, > 0, ≤ 1,000,000, max 2 decimals
  category:    "Food",                       // one of CATEGORIES
  date:        "2026-11-25",                 // "YYYY-MM-DD", real calendar date, not in the future
  createdAt:   1764060000000                 // number, ms since epoch (Date.now())
}

// App data — exactly what is saved to localStorage (JSON string under STORAGE_KEY)
{
  version:  1,
  budget:   500,          // number > 0, or null when not set
  expenses: [ /* Expense, … */ ]
}

// Raw form input handed to validateExpenseInput (all strings, straight from the inputs)
{ description: " Lunch ", amount: "12.50", category: "Food", date: "2026-11-25" }

// Validation result (expense)
{
  valid:  true,
  errors: {},                                   // when invalid: { description?: string, amount?: string, category?: string, date?: string }
  values: { description: "Lunch", amount: 12.5, category: "Food", date: "2026-11-25" }  // cleaned; only meaningful when valid
}

// Validation result (budget)
{ valid: true, error: "", value: 500 }          // invalid → { valid:false, error:"…message…", value:null }

// Category breakdown — always 5 items, in CATEGORIES order
[ { category: "Food", total: 12.5, percent: 42.5 }, … ]   // percent rounded to 1 decimal; all 0 when grand total is 0
```

### 5.3 Validation functions (pure)

```js
validateExpenseInput(input, today?) -> ValidationResult
validateBudget(rawValue)            -> BudgetValidationResult
```

`today` is an optional `"YYYY-MM-DD"` string (defaults to the real current date) so tests are deterministic.

**Expense rules** (checked per field; every failing field gets its own message in `errors`):

| Field | Rule | Error message (exact text) |
|-------|------|----------------------------|
| description | trimmed value non-empty | `Description is required.` |
| description | trimmed length ≤ 60 | `Description must be 60 characters or fewer.` |
| amount | non-empty | `Amount is required.` |
| amount | finite number (rejects `abc`, `1e3x`, `NaN`, `Infinity`) | `Amount must be a number.` |
| amount | > 0 | `Amount must be greater than 0.` |
| amount | ≤ 1,000,000 | `Amount cannot exceed 1,000,000.` |
| amount | at most 2 decimal places | `Amount can have at most 2 decimal places.` |
| category | one of `CATEGORIES` | `Please select a category.` |
| date | non-empty | `Date is required.` |
| date | matches `YYYY-MM-DD` and is a real date (rejects `2026-02-30`) | `Date is not valid.` |
| date | not after `today` | `Date cannot be in the future.` |

Order of checks within a field is the order in the table; report only the **first** failing rule per field.
Cleaned `values.amount` is a `Number` rounded to 2 decimals; `values.description` is trimmed.

**Budget rules:**

| Rule | Error message (exact text) |
|------|----------------------------|
| non-empty (after trim) | `Budget is required.` |
| finite number | `Budget must be a number.` |
| > 0 | `Budget must be greater than 0.` |
| ≤ 10,000,000 | `Budget cannot exceed 10,000,000.` |
| at most 2 decimals | `Budget can have at most 2 decimal places.` |

### 5.4 Data / calculation functions (pure)

```js
createExpense(values, now?)            -> Expense
    // values = the cleaned `values` object from validateExpenseInput. now = optional ms timestamp (default Date.now()).
    // Generates id "exp_<now>_<4 random lowercase alphanumerics>" and sets createdAt = now.

addExpense(expenses, expense)          -> Expense[]      // returns NEW array with expense appended
deleteExpense(expenses, id)            -> Expense[]      // returns NEW array without that id; unknown id → equal copy

getMonthKey(dateString)                -> string         // "2026-11-25" -> "2026-11"
getCurrentMonthKey(now?)               -> string         // "YYYY-MM" for local date (now = optional Date)
getTodayString(now?)                   -> string         // "YYYY-MM-DD" for local date (now = optional Date)
filterByMonth(expenses, monthKey)      -> Expense[]      // only that month; keeps original order
sortExpenses(expenses)                 -> Expense[]      // NEW array: date desc, then createdAt desc

calculateTotal(expenses)               -> number         // sum, rounded to 2 decimals; [] -> 0
calculateRemaining(budget, total)      -> number|null    // budget null → null; else round2(budget - total) (may be negative)
isBudgetExceeded(budget, total)        -> boolean        // true only if budget is a number > 0 AND total > budget (equal is NOT exceeded)
getCategoryBreakdown(expenses)         -> Breakdown[]    // §5.2 shape; unknown categories are ignored
formatCurrency(amount)                 -> string         // CURRENCY_SYMBOL + 2 decimals + thousands separators: 1234.5 -> "$1,234.50"; negative -> "-$5.00"
formatPercent(value)                   -> string         // 42.5 -> "42.5%"; 0 -> "0%"; 100 -> "100%"
```

### 5.5 Storage functions

```js
setStorageKey(key)   -> void       // for tests only; switches STORAGE_KEY
getStorageKey()      -> string
loadData()           -> AppData    // never throws. Missing / corrupt JSON / wrong shape / localStorage unavailable
                                   // -> { version: 1, budget: null, expenses: [] }.
                                   // Drops individual expense records that fail basic shape checks
                                   // (id string, description string, amount finite number > 0, category in CATEGORIES, date string).
                                   // Drops an invalid budget (not a number > 0) to null.
saveData(data)       -> boolean    // JSON.stringify under STORAGE_KEY; true on success, false on any failure; never throws
clearData()          -> void       // removes STORAGE_KEY; never throws
```

### 5.6 In-memory state (not exported directly)

```js
let appData = { version: 1, budget: null, expenses: [] };
let selectedMonth = "YYYY-MM";   // from #month-filter
```

### 5.7 DOM layer (needs Agent 1's markup; not unit-tested directly)

```js
init()                         // find elements, load data, set defaults, attach listeners, renderAll()
getElements()                  -> object of element references by ID, or null (and console.error) if any required ID is missing
renderAll()                    // calls the three renders below
renderSummary()                // #budget-display, #total-expenses, #remaining-budget (+ .negative), #budget-warning
renderExpenseList()            // fills #expense-list with §4.4 rows (sorted), toggles #empty-message
renderBreakdown()              // fills #category-breakdown with §4.4 rows
showFieldError(inputEl, errorEl, message)   // §4.2 behaviour
clearFieldError(inputEl, errorEl)
clearAllExpenseErrors()
handleExpenseSubmit(event)     // preventDefault → read raw values → validateExpenseInput → show errors OR add, save, reset form (keep date = today), renderAll, focus description
handleBudgetSubmit(event)      // preventDefault → validateBudget → show error OR save budget, renderAll
handleDeleteClick(event)       // event delegation on #expense-list: if target.closest(".delete-btn") → deleteExpense, save, renderAll
handleMonthChange()            // update selectedMonth (fallback to current month if the input is cleared), renderAll
```

Behaviour details:
- Budget input is pre-filled with the saved budget on load.
- Warning text: `Warning: you have exceeded your monthly budget by $X.XX!` (X = `total - budget`, formatted by `formatCurrency` without the minus sign).
- `#remaining-budget` shows `—` when no budget is set; `#budget-display` shows `Not set`.
- Errors clear as soon as the user edits that field (`input` event) or on successful submit.
- Delete is immediate (no confirm dialog) — keep it simple.
- If `saveData` returns `false`, just `console.warn(...)`; do not add new element IDs or UI for it.

### 5.8 Bootstrap (must be exactly this behaviour)

```js
// At the bottom of app.js. Runs the app ONLY on the real page, never on tests.html.
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("expense-form")) { init(); }
});
```

### 5.9 Exports

```js
window.ExpenseApp = {
  // constants
  CATEGORIES, CURRENCY_SYMBOL, MAX_DESCRIPTION_LENGTH, MAX_AMOUNT, MAX_BUDGET,
  // validation
  validateExpenseInput, validateBudget,
  // data / calculation
  createExpense, addExpense, deleteExpense, getMonthKey, getCurrentMonthKey, getTodayString,
  filterByMonth, sortExpenses, calculateTotal, calculateRemaining, isBudgetExceeded,
  getCategoryBreakdown, formatCurrency, formatPercent,
  // storage
  setStorageKey, getStorageKey, loadData, saveData, clearData,
  // app
  init
};
if (typeof module !== "undefined" && module.exports) { module.exports = window.ExpenseApp; }  // lets Node require() it
```

(When run under Node, `window` and `document` don't exist: guard with `typeof window !== "undefined"` and
`typeof document !== "undefined"` so `require("./app.js")` works for quick checks. In Node, `localStorage` is absent,
so storage functions simply return the safe fallbacks.)

---

## 6. localStorage contract

- Key: `smartExpenseTracker.v1` (tests use `smartExpenseTracker.TEST` via `setStorageKey`).
- Value: JSON string of `AppData` (§5.2). Saved after **every** add, delete, and budget change.
- Loaded once in `init()`.

---

## 7. Git workflow & integration procedure

### 7.1 Branches

`main` holds `PLAN.md` first. Each agent branches from it:

```bash
git checkout main && git pull
git checkout -b agent/frontend   # Agent 1   (or agent/logic, agent/testing)
```

Each agent commits **only its own files**, pushes its branch, and stops. Because the file sets are disjoint
(`index.html`+`style.css` / `app.js` / `tests.html`+`TEST_CASES.md`), the three branches merge with **zero conflicts**.

### 7.2 Integration steps (done by the human/integrator, after all three agents report done)

1. **Verify ownership** — each branch changed only its files:
   `git diff --name-only main..agent/frontend` (expect only `index.html`, `style.css`), likewise for the others.
2. **Merge in this order** into a throw-away integration branch off `main`:
   `agent/logic` → `agent/frontend` → `agent/testing`.
3. **Contract smoke checks** (30 seconds, no tools needed beyond a browser):
   - Open `tests.html` → all tests green.
   - Open `index.html` → console has **no errors**; every ID in §4.1 exists
     (paste in DevTools: `["month-filter","budget-form","budget-input","budget-error","budget-save-btn","budget-display","total-expenses","remaining-budget","budget-warning","expense-form","description-input","amount-input","category-select","date-input","description-error","amount-error","category-error","date-error","add-expense-btn","expense-list","empty-message","category-breakdown"].filter(id => !document.getElementById(id))` → must print `[]`).
4. **Run the manual checklist** (`TEST_CASES.md` Part B) on `index.html`.
5. **Fix mismatches.** Any difference between the files is resolved *by the owner of the file that deviates from this
   PLAN.md* (re-run that agent with the failing check as its task). Never "fix" by editing the plan to match the bug.
6. Merge the integration branch into `main` (fast-forward or merge commit).

### 7.3 Contract change requests

If an agent believes the contract is wrong or incomplete, it must **not** work around it silently. It finishes
against the current contract, and lists the proposed change in its final report. The human updates `PLAN.md`
on `main`, and the affected agents re-sync (`git merge main`) and adjust.

---

## 8. Definition of done per agent

**Agent 1:** all §4.1 IDs present; static options correct; styles for all classes in §4.2–§4.4; renders cleanly alone;
no inline JS; passes mobile (360px) and desktop checks; only `index.html` and `style.css` changed.

**Agent 2:** every function in §5 exists with the stated signature, message text and behaviour; no DOM access at load
except the bootstrap; `require("./app.js")` works in Node; no console errors; only `app.js` changed.

**Agent 3:** `tests.html` runs standalone, isolates storage, shows summary; `TEST_CASES.md` has Part A (automated) and
Part B (manual) with every §10 criterion covered; only `tests.html` and `TEST_CASES.md` changed.

---

## 9. Testing guidance (for Agent 3)

### 9.1 Principles
Test the contract, not the implementation: only call things on `window.ExpenseApp`. Pass `today` explicitly
(e.g. `"2026-11-25"`) for date logic. Never depend on the current clock.

### 9.2 Reusable fixtures
```js
const valid = { description: "Lunch", amount: "12.50", category: "Food", date: "2026-11-20" };
const TODAY = "2026-11-25";
```

### 9.3 Minimum cases
- **Expense validation:** valid passes; empty/space-only description; 61-char description fails, 60 passes; empty / `abc` /
  `0` / `-5` / `1000000.01` / `1.234` amount fail; `1000000` and `0.01` pass; category `""` and `"Games"` fail, all five pass;
  date empty / `2026-02-30` / `25-11-2026` / tomorrow fail; today passes; multiple errors reported at once;
  description is trimmed; amount returned as a number; `"12.5"` and `"12.50"` both → `12.5`.
- **Budget validation:** `""`, `"  "`, `"abc"`, `"0"`, `"-10"`, `"10000000.01"`, `"10.123"` fail; `"500"`, `"0.01"`, `"10000000"` pass.
- **Add/delete:** add returns new array and doesn't mutate original; delete removes only that id; unknown id leaves list equal;
  `createExpense` ids are unique across 100 calls and match `/^exp_\d+_[a-z0-9]{4}$/`; `createdAt` equals `now`.
- **Month:** `getMonthKey`; `filterByMonth` includes boundaries (`2026-11-01`, `2026-11-30`) and excludes `2026-10-31` / `2026-12-01`.
- **Totals:** `[]` → 0; `0.1 + 0.2` expenses → `0.3` (rounding); `calculateRemaining(null, 50)` → `null`;
  `calculateRemaining(100, 130)` → `-30`; `isBudgetExceeded`: equal → false, over → true, `null` budget → false.
- **Breakdown:** always 5 entries in order; zero-total → all percents 0 (no `NaN`); percents sum ≈ 100 (±0.5); unknown category ignored.
- **Formatting:** `formatCurrency(1234.5)` → `CURRENCY_SYMBOL + "1,234.50"`, `0` → `…0.00`, negative handling; `formatPercent`.
- **Sorting:** date desc; ties by `createdAt` desc; original array unchanged.
- **Storage:** save→load round-trip; missing key → defaults; corrupt JSON (`"{oops"`) → defaults, no throw; wrong shape
  (`"[]"`, `"null"`, `"123"`) → defaults; bad expense records are dropped while good ones survive; invalid budget (`-5`, `"x"`) → `null`;
  `clearData` empties; `saveData` returns `true`.

---

## 10. Acceptance criteria (the whole app, after integration)

| # | Criterion |
|---|-----------|
| A1 | Opening `index.html` from disk shows the full UI with **no console errors** and no network requests. |
| A2 | Adding a valid expense puts it in the list immediately (newest first), updates total, remaining, breakdown, and clears the form (date resets to today). |
| A3 | Each expense row has a Delete button; clicking it removes that row and updates all numbers instantly. |
| A4 | Category dropdown offers exactly Food, Travel, Shopping, Education, Others (plus placeholder); the chosen category appears on the row and in the breakdown. |
| A5 | Saving a valid budget updates "Budget" and "Remaining"; remaining = budget − total for the selected month. |
| A6 | With no budget set: Budget shows `Not set`, Remaining shows `—`, no warning. |
| A7 | When total > budget: warning banner is visible, remaining is negative and red. When total ≤ budget (including equal): no warning. Deleting an expense or raising the budget hides the warning again. |
| A8 | Breakdown always lists the 5 categories with amount, percentage, and a proportional bar; shows 0% (no `NaN`) when there are no expenses. |
| A9 | Reloading the page restores budget, all expenses and the totals exactly. Data survives closing the tab. |
| A10 | Invalid input is rejected with the exact messages in §5.3, shown beside the field, with a red outline; nothing is saved; messages clear when the user edits the field. |
| A11 | Changing the month picker shows only that month's expenses/totals/breakdown/warning; the budget stays the same. |
| A12 | Corrupt `localStorage` data (`localStorage.setItem("smartExpenseTracker.v1","{oops")`) does not break the page; it starts empty. |
| A13 | Entering `<img src=x onerror=alert(1)>` as a description is shown as plain text and executes nothing. |
| A14 | Layout is usable at 360px width (no horizontal scrolling) and at 1280px. |
| A15 | `tests.html` shows **all tests passing** and uses a separate storage key (does not alter real data). |
| A16 | Only the owning agent's files were changed on each branch (§7.2 step 1). |
