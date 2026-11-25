# Smart Expense Tracker — Test Cases

Source of truth: `PLAN.md` (§5 JS contract, §9.3 minimum cases, §10 acceptance criteria).

- **Part A** — automated tests in `tests.html` (open it in a browser; it loads `app.js` and calls only `window.ExpenseApp`; storage key `smartExpenseTracker.TEST`).
- **Part B** — manual UI tests against `index.html`. The *Result* column is intentionally blank for the tester.

Fixed reference date in Part A: today = `2026-11-25`.

## Part A — Automated cases (110)

| ID | Area | Input / steps | Expected |
|----|------|---------------|----------|
| T-01 | Validation (expense) | Valid input `Lunch / 12.50 / Food / 2026-11-20` (today 2026-11-25) | valid, no errors, values `{Lunch, 12.5, Food, 2026-11-20}` |
| T-02 | Validation (expense) | Description `""` | `Description is required.` |
| T-03 | Validation (expense) | Description of spaces only | `Description is required.` |
| T-04 | Validation (expense) | 61-char description | `Description must be 60 characters or fewer.` |
| T-05 | Validation (expense) | 60-char description | valid |
| T-06 | Validation (expense) | Description `"  Lunch  "` | value trimmed to `Lunch` |
| T-07 | Validation (expense) | 60 chars + surrounding spaces | valid (trim happens before length check) |
| T-08 | Validation (expense) | Amount `""` | `Amount is required.` |
| T-09 | Validation (expense) | Amount `abc` | `Amount must be a number.` |
| T-10 | Validation (expense) | Amount `1e3x` | `Amount must be a number.` |
| T-11 | Validation (expense) | Amount `NaN`, `Infinity` | `Amount must be a number.` |
| T-12 | Validation (expense) | Amount `0` | `Amount must be greater than 0.` |
| T-13 | Validation (expense) | **Negative** amount `-5` | `Amount must be greater than 0.` |
| T-14 | Validation (expense) | **Negative** amount `-0.01` | `Amount must be greater than 0.` |
| T-15 | Validation (expense) | Amount `1000000.01` | `Amount cannot exceed 1,000,000.` |
| T-16 | Validation (expense) | Amount `1.234` | `Amount can have at most 2 decimal places.` |
| T-17 | Validation (expense) | Amount `1000000` | valid (upper boundary) |
| T-18 | Validation (expense) | Amount `0.01` | valid (lower boundary) |
| T-19 | Validation (expense) | Amount `12.5` and `12.50` | both return Number `12.5` |
| T-20 | Validation (expense) | Category `""` | `Please select a category.` |
| T-21 | Validation (expense) | Category `Games` | `Please select a category.` |
| T-22 | Validation (expense) | Each of the 5 categories | all valid |
| T-23 | Validation (expense) | Date `""` | `Date is required.` |
| T-24 | Validation (expense) | Date `2026-02-30` | `Date is not valid.` |
| T-25 | Validation (expense) | Date `25-11-2026` | `Date is not valid.` |
| T-26 | Validation (expense) | Date = tomorrow (`2026-11-26`) | `Date cannot be in the future.` |
| T-27 | Validation (expense) | Date = today | valid |
| T-28 | Validation (expense) | `2024-02-29` and `2026-02-29` | leap day valid; non-leap invalid |
| T-29 | Validation (expense) | All four fields bad at once | one error per field reported together |
| T-30 | Validation (expense) | Only amount bad | `errors` has only the `amount` key |
| T-31 | Validation (expense) | Input object with padded description | input object not mutated |
| T-32 | Validation (expense) | Description `<img src=x onerror=alert(1)>` | valid, kept as plain text |
| T-33 | Validation (budget) | Budget `""` | `Budget is required.`, `value: null` |
| T-34 | Validation (budget) | Budget `"  "` | `Budget is required.` |
| T-35 | Validation (budget) | Budget `abc` | `Budget must be a number.` |
| T-36 | Validation (budget) | Budget `0` | `Budget must be greater than 0.` |
| T-37 | Validation (budget) | **Negative** budget `-10` | `Budget must be greater than 0.`, `value: null` |
| T-38 | Validation (budget) | Budget `10000000.01` | `Budget cannot exceed 10,000,000.` |
| T-39 | Validation (budget) | Budget `10.123` | `Budget can have at most 2 decimal places.` |
| T-40 | Validation (budget) | Budget `500` | `{valid:true, error:"", value:500}` |
| T-41 | Validation (budget) | Budget `0.01`, `10000000` | both valid |
| T-42 | Validation (budget) | Budget `" 250 "` | valid, value 250 |
| T-43 | Create / add / delete | `createExpense(values, 1700000000000)` | full record, `createdAt` = now, id `exp_1700000000000_xxxx` |
| T-44 | Create / add / delete | 100 × `createExpense` | all ids unique, match `/^exp_\d+_[a-z0-9]{4}$/` |
| T-45 | Create / add / delete | `addExpense(list, e)` | new array with e appended; original unchanged |
| T-46 | Create / add / delete | `deleteExpense(list, "b")` | only `b` removed; original unchanged |
| T-47 | Create / add / delete | `deleteExpense` with unknown id | equal copy, not same reference |
| T-48 | Create / add / delete | `deleteExpense([], id)` | `[]` |
| T-49 | Create / add / delete | add then delete the same expense | list equals the original |
| T-50 | Month filtering | `getMonthKey("2026-11-25")` | `2026-11` |
| T-51 | Month filtering | `getCurrentMonthKey(new Date(2026,10,25))` | `2026-11` |
| T-52 | Month filtering | `getTodayString` for 25 Nov and 5 Jan | `2026-11-25`, `2026-01-05` (zero padded) |
| T-53 | Month filtering | Filter `2026-11` with dates `11-01` and `11-30` | both included |
| T-54 | Month filtering | Dates `2026-10-31`, `2026-12-01` | excluded |
| T-55 | Month filtering | Same month, different years | only the requested year returned |
| T-56 | Month filtering | Order + no match | original order kept; `[]` when none |
| T-57 | Month filtering | Input array after filtering | not mutated |
| T-58 | Totals / budget | `calculateTotal([])` | `0` |
| T-59 | Totals / budget | 10 + 2.5 | `12.5` |
| T-60 | Totals / budget | 0.1 + 0.2 | `0.3` (rounding) |
| T-61 | Totals / budget | Total after deleting an expense | new sum |
| T-62 | Totals / budget | `calculateRemaining(null, 50)` | `null` |
| T-63 | Totals / budget | `calculateRemaining(500, 125.5)` | `374.5` |
| T-64 | Totals / budget | `calculateRemaining(100, 130)` | `-30` |
| T-65 | Totals / budget | `calculateRemaining(100, 100)` | `0` |
| T-66 | Totals / budget | `calculateRemaining(0.3, 0.1)` | `0.2` (rounded) |
| T-67 | Totals / budget | `isBudgetExceeded(100, 100)` | `false` (equal is not exceeded) |
| T-68 | Totals / budget | `isBudgetExceeded(100, 100.01)` | `true` |
| T-69 | Totals / budget | `isBudgetExceeded(100, 99.99)` | `false` |
| T-70 | Totals / budget | `isBudgetExceeded(null, 999999)` | `false` |
| T-71 | Totals / budget | `isBudgetExceeded(100, 0)` | `false` |
| T-72 | Totals / budget | Exceeded list, delete an expense | warning state flips true → false |
| T-73 | Totals / budget | Budget raised from 100 to 200 at total 120 | true → false |
| T-74 | Totals / budget | Oct total 90 vs Nov total 30, budget 50 | Nov not exceeded, Oct exceeded (monthly scope) |
| T-75 | Category breakdown | Any list | exactly 5 entries in order Food, Travel, Shopping, Education, Others |
| T-76 | Category breakdown | `[]` | all totals 0, all percents 0, no NaN |
| T-77 | Category breakdown | Food 10 + 2.5, Travel 7.5 | Food 12.5, Travel 7.5, others 0 |
| T-78 | Category breakdown | 12.5 / 7.5 / 10 | 41.7, 25, 33.3 (1 decimal) |
| T-79 | Category breakdown | Single Education expense | Education 100% |
| T-80 | Category breakdown | 1,1,1,1,2 split | percents sum to 100 ± 0.5 |
| T-81 | Category breakdown | Unknown category `Games` | ignored in totals and percentages |
| T-82 | Category breakdown | Input list | not mutated |
| T-83 | Category breakdown | Breakdown of month-filtered list | only that month counted |
| T-84 | Formatting | `formatCurrency(1234.5)` | `₹1,234.50` |
| T-85 | Formatting | `formatCurrency(0)` | `₹0.00` |
| T-86 | Formatting | `formatCurrency(12.5)` | `₹12.50` |
| T-87 | Formatting | `formatCurrency(1000000)` | `₹1,000,000.00` |
| T-88 | Formatting | `formatCurrency(-5)` | `-₹5.00` |
| T-89 | Formatting | `CURRENCY_SYMBOL` | `₹` |
| T-90 | Formatting | `formatPercent` 42.5 / 0 / 100 | `42.5%`, `0%`, `100%` |
| T-91 | Formatting | Exported constants | categories, max description 60, max amount 1,000,000, max budget 10,000,000 |
| T-92 | Sorting | Dates 11-01, 11-20, 11-10 | 11-20, 11-10, 11-01 |
| T-93 | Sorting | Same date, createdAt 100/300/200 | 300, 200, 100 |
| T-94 | Sorting | `sortExpenses(list)` | new array; original order unchanged |
| T-95 | Sorting | `sortExpenses([])` | `[]` |
| T-96 | Storage / persistence | `getStorageKey()` during tests | `smartExpenseTracker.TEST` |
| T-97 | Storage / persistence | Nothing stored | `loadData()` → `{version:1,budget:null,expenses:[]}` |
| T-98 | Storage / persistence | `saveData(...)` | returns `true`; JSON stored under test key |
| T-99 | Storage / persistence | Save then load budget + 2 expenses | identical data back |
| T-100 | Storage / persistence | Save, reload, recompute | same total and remaining after reload |
| T-101 | Storage / persistence | Save `budget: null` | loads as `null` |
| T-102 | Storage / persistence | Stored value `{oops` | defaults; no throw |
| T-103 | Storage / persistence | Stored `[]`, `null`, `123`, `"str"` | defaults |
| T-104 | Storage / persistence | Mixed good and 10 bad records | only the good record survives; budget kept |
| T-105 | Storage / persistence | Budget `-5`, `"x"`, `0`, `{}` | loads as `null` |
| T-106 | Storage / persistence | `expenses` is a string | empty list; no throw |
| T-107 | Storage / persistence | `clearData()` | key removed; defaults on load |
| T-108 | Storage / persistence | `clearData`/`loadData` on empty store | no throw |
| T-109 | Storage / persistence | Delete then save then load | deleted item stays deleted |
| T-110 | Storage / persistence | After saving | real key `smartExpenseTracker.v1` unchanged |

## Part B — Manual UI cases (51)

| ID | Criterion | Steps | Expected | Result (Pass/Fail) |
|----|-----------|-------|----------|--------------------|
| M-01 | A1 | Open `index.html` by double-clicking (file://). Open DevTools Console and Network. | Full UI visible; no console errors; no network requests to other sites. | |
| M-02 | A1 | In the console paste the ID check from PLAN §7.2 step 3. | Prints `[]`. | |
| M-03 | A2 | Add `Lunch`, `12.50`, `Food`, today. Click **Add expense**. | Row appears at top; Total = ₹12.50; breakdown Food = ₹12.50 / 100%; form clears; date resets to today; focus returns to Description. | |
| M-04 | A2 | Add a second expense dated earlier, then a third dated later. | List is ordered newest date first; same-date items show newest-added first. | |
| M-05 | A2/A5 | Add several expenses in different categories. | Total equals sum of all; no floating-point artefacts (e.g. 0.1 + 0.2 shows ₹0.30). | |
| M-06 | A3 | Click **Delete** on the middle row. | That row disappears at once; total, remaining, breakdown, warning update; no confirm dialog. | |
| M-07 | A3 | Delete every expense. | "No expenses for this month." appears; Total ₹0.00; breakdown shows 0% for all (no NaN). | |
| M-08 | A4 | Open the category dropdown. | Placeholder plus exactly Food, Travel, Shopping, Education, Others. | |
| M-09 | A4 | Add one expense per category. | Each row shows its chosen category with matching colour; breakdown rows show amounts. | |
| M-10 | A5 | Enter budget `500`, click **Save**. | Budget shows ₹500.00; Remaining = 500 − total; budget input keeps the saved value. | |
| M-11 | A5 | Change budget to `1000`, Save. | Budget and Remaining update immediately. | |
| M-12 | A6 | Clear storage (`localStorage.clear()`), reload. | Budget `Not set`; Remaining `—`; no warning banner. | |
| M-13 | A6 | With no budget, add a large expense (₹999,999). | Still no warning; Remaining stays `—`. | |
| M-14 | A7 | Budget 100; add expense totalling 100.00. | Remaining ₹0.00; **no** warning (equal is not exceeded). | |
| M-15 | A7 | Add another expense of 0.01 (total 100.01). | Red warning banner visible: `Warning: you have exceeded your monthly budget by ₹0.01!`; Remaining is red and negative. | |
| M-16 | A7 | Delete that expense. | Warning disappears; Remaining returns to ₹0.00 (not negative style). | |
| M-17 | A7 | Exceed budget, then raise budget above total. | Warning hides after saving the higher budget. | |
| M-18 | A8 | Add Food 30, Travel 10, Others 10. | Breakdown lists 5 rows in order; amounts correct; Food 60%, Travel 20%, Others 20%; bar widths match percentages; Shopping/Education show ₹0.00 / 0% with empty bars. | |
| M-19 | A9 | Add expenses and a budget; refresh (F5). | Budget, all expenses, total, remaining and breakdown are identical after reload. | |
| M-20 | A9 | Close the tab and reopen `index.html`. | Data still present. | |
| M-21 | A9 | Delete an expense, reload. | Deleted expense stays deleted. | |
| M-22 | A10 | Submit the empty expense form. | Four messages beside fields: `Description is required.`, `Amount is required.`, `Please select a category.`, and date message only if the date was cleared (`Date is required.`). Red outline on invalid fields; nothing added. | |
| M-23 | A10 | Description of 61 characters (or type past maxlength 60). | Either blocked by maxlength or `Description must be 60 characters or fewer.`; never saved invalid. | |
| M-24 | A10 | Amount `0`. | `Amount must be greater than 0.` | |
| M-25 | A10 | **Negative amount** `-5`. | `Amount must be greater than 0.`; nothing added; total unchanged. | |
| M-26 | A10 | Amount `1000000.01`. | `Amount cannot exceed 1,000,000.` | |
| M-27 | A10 | Amount `1.234`. | `Amount can have at most 2 decimal places.` | |
| M-28 | A10 | Amount `abc` / `1e3x` (browser may block letters in number field). | Not saved; shows `Amount must be a number.` or field stays empty → `Amount is required.` | |
| M-29 | A10 | Clear the date field and submit. | `Date is required.` | |
| M-30 | A10 | Type a future date (bypass `max` by typing) and submit. | `Date cannot be in the future.`; nothing saved. | |
| M-31 | A10 | Trigger an error, then start typing in that field. | That field's message and red outline clear immediately. | |
| M-32 | A10 | Fix all fields after errors and submit. | Expense added; all messages gone. | |
| M-33 | A10 | Budget form: submit empty; `0`; `-10`; `10.123`; `10000000.01`. | Messages: `Budget is required.`, `Budget must be greater than 0.` (×2), `Budget can have at most 2 decimal places.`, `Budget cannot exceed 10,000,000.`; saved budget unchanged. | |
| M-34 | A10 | Failed validation, then reload. | No invalid expense persisted. | |
| M-35 | A11 | Add expenses in current month and the previous month. Change month picker to previous month. | Only previous-month expenses listed; total, remaining, breakdown and warning reflect that month only. | |
| M-36 | A11 | Switch months back and forth with a budget saved. | Budget value is the same for every month. | |
| M-37 | A11 | Month with no expenses. | Empty message shown; total ₹0.00; breakdown 0%. | |
| M-38 | A11 | Clear the month input. | Falls back to current month; no errors. | |
| M-39 | A11 | Budget 100; Oct spend 150, Nov spend 50. Switch Oct ↔ Nov. | Warning shows only for Oct. | |
| M-40 | A12 | In console: `localStorage.setItem("smartExpenseTracker.v1","{oops")`, reload. | Page loads normally, empty state, no uncaught errors. | |
| M-41 | A12 | Set value `[]`, `null`, `123`, then reload each time. | Empty state each time; no crash. | |
| M-42 | A12 | Set JSON with one valid and one invalid expense (negative amount), reload. | Only the valid expense is shown. | |
| M-43 | A13 | Add description `<img src=x onerror=alert(1)>`. | Shown as literal text; no alert; no broken image; also after reload. | |
| M-44 | A13 | Add description `<script>alert(1)</script>` and `&amp;`. | Displayed literally; nothing executes. | |
| M-45 | A14 | Set viewport to 360px wide (DevTools device mode). | No horizontal scrollbar; form, list, breakdown readable; delete buttons tappable. | |
| M-46 | A14 | Viewport 1280px. | Layout is tidy and usable. | |
| M-47 | Non-func | Navigate with Tab only; add an expense with Enter; delete via keyboard. | All controls reachable; visible focus; each input has a label; warning has `role="alert"`. | |
| M-48 | F3/A1 | Disable JavaScript and reload. | `<noscript>` message displayed. | |
| M-49 | A15 | Open `tests.html` after merging all branches. | Green summary "ALL PASSED"; afterwards real data in `index.html` is unchanged. | |
| M-50 | A15 | Before opening `tests.html`, note real data; open it; return to `index.html`. | Data unchanged (tests use `smartExpenseTracker.TEST`). | |
| M-51 | A16 | Run `git diff --name-only main..<branch>` per branch. | Frontend: index.html, style.css only; Logic: app.js only; Testing: tests.html, TEST_CASES.md only. | |

## Coverage map

| Required area | Automated | Manual |
|---|---|---|
| Valid expenses | T-01, T-05, T-17–T-19, T-22, T-27 | M-03–M-05, M-09 |
| Invalid inputs | T-02–T-04, T-08–T-11, T-20–T-26, T-29, T-33–T-39 | M-22–M-34 |
| Negative amounts | T-13, T-14, T-37 | M-25, M-33 |
| Expense deletion | T-46–T-49, T-61, T-109 | M-06, M-07, M-21 |
| Total calculation | T-58–T-61, T-74 | M-03, M-05 |
| Remaining budget | T-62–T-66 | M-10–M-12 |
| Budget warnings | T-67–T-74 | M-14–M-17, M-39 |
| Category-wise spending | T-75–T-83 | M-08, M-09, M-18 |
| Monthly filtering | T-50–T-57, T-83 | M-35–M-39 |
| localStorage persistence | T-96–T-110 | M-19–M-21, M-40–M-42, M-49–M-50 |

## Execution status

Part B has **not** been executed (Pass/Fail left blank). Part A execution results are reported in the author's hand-off notes, not here; re-run `tests.html` after integration to get authoritative results.
