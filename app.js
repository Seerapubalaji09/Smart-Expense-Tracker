/* ==========================================================================
   Smart Expense Tracker — application logic (Agent 2)
   Plain vanilla JavaScript. Follows the contract in PLAN.md.

   Layout of this file:
     1. Constants
     2. Small helpers
     3. Validation (pure)
     4. Data / calculation (pure)
     5. Storage
     6. DOM layer (init, render, handlers)
     7. Bootstrap + exports
   ========================================================================== */

/* ---------- 1. Constants ---------- */

const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Others"];
const CURRENCY_SYMBOL = "₹";
const MAX_DESCRIPTION_LENGTH = 60;
const MAX_AMOUNT = 1000000;        // per expense
const MAX_BUDGET = 10000000;
let   STORAGE_KEY = "smartExpenseTracker.v1";   // changeable only via setStorageKey()

// Category name -> CSS class used on rows
const CATEGORY_CLASSES = {
  Food: "cat-food",
  Travel: "cat-travel",
  Shopping: "cat-shopping",
  Education: "cat-education",
  Others: "cat-others"
};

/* ---------- 2. Small helpers ---------- */

// Round to 2 decimals (money rounding).
function round2(x) {
  return Math.round(x * 100) / 100;
}

// Left-pad a number with zeros to 2 digits.
function pad2(n) {
  return (n < 10 ? "0" : "") + n;
}

// Parse a raw string into a number. Returns NaN when it is not a plain finite number.
function parseNumber(raw) {
  const text = String(raw === null || raw === undefined ? "" : raw).trim();
  if (text === "") { return NaN; }
  const n = Number(text);
  return isFinite(n) ? n : NaN;
}

// True when the number has more than 2 decimal places.
function hasTooManyDecimals(n) {
  return Math.abs(n * 100 - Math.round(n * 100)) > 1e-6;
}

// True when "YYYY-MM-DD" is a real calendar date (rejects 2026-02-30).
function isRealDate(dateString) {
  if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) { return false; }
  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(5, 7));
  const day = Number(dateString.slice(8, 10));
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/* ---------- 3. Validation (pure) ---------- */

function validateExpenseInput(input, today) {
  const raw = input || {};
  const todayString = today || getTodayString();
  const errors = {};
  const values = {};

  // Description
  const description = String(raw.description === undefined || raw.description === null ? "" : raw.description).trim();
  if (description === "") {
    errors.description = "Description is required.";
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = "Description must be 60 characters or fewer.";
  }
  values.description = description;

  // Amount
  const amountText = String(raw.amount === undefined || raw.amount === null ? "" : raw.amount).trim();
  const amount = parseNumber(amountText);
  if (amountText === "") {
    errors.amount = "Amount is required.";
  } else if (isNaN(amount)) {
    errors.amount = "Amount must be a number.";
  } else if (amount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  } else if (amount > MAX_AMOUNT) {
    errors.amount = "Amount cannot exceed 1,000,000.";
  } else if (hasTooManyDecimals(amount)) {
    errors.amount = "Amount can have at most 2 decimal places.";
  }
  values.amount = isNaN(amount) ? NaN : round2(amount);

  // Category
  const category = raw.category;
  if (CATEGORIES.indexOf(category) === -1) {
    errors.category = "Please select a category.";
  }
  values.category = category;

  // Date
  const date = String(raw.date === undefined || raw.date === null ? "" : raw.date).trim();
  if (date === "") {
    errors.date = "Date is required.";
  } else if (!isRealDate(date)) {
    errors.date = "Date is not valid.";
  } else if (date > todayString) {
    errors.date = "Date cannot be in the future.";
  }
  values.date = date;

  return { valid: Object.keys(errors).length === 0, errors: errors, values: values };
}

function validateBudget(rawValue) {
  const text = String(rawValue === undefined || rawValue === null ? "" : rawValue).trim();
  const fail = function (message) { return { valid: false, error: message, value: null }; };

  if (text === "") { return fail("Budget is required."); }
  const n = parseNumber(text);
  if (isNaN(n)) { return fail("Budget must be a number."); }
  if (n <= 0) { return fail("Budget must be greater than 0."); }
  if (n > MAX_BUDGET) { return fail("Budget cannot exceed 10,000,000."); }
  if (hasTooManyDecimals(n)) { return fail("Budget can have at most 2 decimal places."); }
  return { valid: true, error: "", value: round2(n) };
}

/* ---------- 4. Data / calculation (pure) ---------- */

function createExpense(values, now) {
  const timestamp = (now === undefined || now === null) ? Date.now() : now;
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return {
    id: "exp_" + timestamp + "_" + suffix,
    description: values.description,
    amount: values.amount,
    category: values.category,
    date: values.date,
    createdAt: timestamp
  };
}

function addExpense(expenses, expense) {
  return expenses.concat([expense]);
}

function deleteExpense(expenses, id) {
  return expenses.filter(function (e) { return e.id !== id; });
}

function getMonthKey(dateString) {
  return String(dateString).slice(0, 7);
}

function getCurrentMonthKey(now) {
  const d = now || new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
}

function getTodayString(now) {
  const d = now || new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

function filterByMonth(expenses, monthKey) {
  return expenses.filter(function (e) { return getMonthKey(e.date) === monthKey; });
}

// Newest date first; ties broken by newest createdAt first. Returns a new array.
function sortExpenses(expenses) {
  return expenses.slice().sort(function (a, b) {
    if (a.date !== b.date) { return a.date < b.date ? 1 : -1; }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

function calculateTotal(expenses) {
  let sum = 0;
  expenses.forEach(function (e) { sum += e.amount; });
  return round2(sum);
}

function calculateRemaining(budget, total) {
  if (typeof budget !== "number" || isNaN(budget)) { return null; }
  return round2(budget - total);
}

function isBudgetExceeded(budget, total) {
  return typeof budget === "number" && budget > 0 && total > budget;
}

function getCategoryBreakdown(expenses) {
  const totals = {};
  CATEGORIES.forEach(function (c) { totals[c] = 0; });
  expenses.forEach(function (e) {
    if (Object.prototype.hasOwnProperty.call(totals, e.category)) {
      totals[e.category] += e.amount;
    }
  });

  let grand = 0;
  CATEGORIES.forEach(function (c) { grand += totals[c]; });

  return CATEGORIES.map(function (c) {
    const percent = grand > 0 ? Math.round((totals[c] / grand) * 1000) / 10 : 0;
    return { category: c, total: round2(totals[c]), percent: percent };
  });
}

function formatCurrency(amount) {
  const rounded = round2(Number(amount) || 0);
  const negative = rounded < 0;
  const fixed = Math.abs(rounded).toFixed(2);
  const parts = fixed.split(".");
  const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (negative ? "-" : "") + CURRENCY_SYMBOL + whole + "." + parts[1];
}

function formatPercent(value) {
  return (Math.round((Number(value) || 0) * 10) / 10) + "%";
}

/* ---------- 5. Storage ---------- */

function setStorageKey(key) {
  STORAGE_KEY = key;
}

function getStorageKey() {
  return STORAGE_KEY;
}

function emptyData() {
  return { version: 1, budget: null, expenses: [] };
}

// Basic shape check for one stored expense record.
function isValidStoredExpense(e) {
  return !!e && typeof e === "object" &&
    typeof e.id === "string" &&
    typeof e.description === "string" &&
    typeof e.amount === "number" && isFinite(e.amount) && e.amount > 0 &&
    CATEGORIES.indexOf(e.category) !== -1 &&
    typeof e.date === "string";
}

function loadData() {
  try {
    if (typeof localStorage === "undefined") { return emptyData(); }
    const text = localStorage.getItem(STORAGE_KEY);
    if (text === null || text === undefined) { return emptyData(); }
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) { return emptyData(); }

    const budget = (typeof parsed.budget === "number" && isFinite(parsed.budget) && parsed.budget > 0)
      ? parsed.budget : null;
    const list = Array.isArray(parsed.expenses) ? parsed.expenses : [];
    const expenses = list.filter(isValidStoredExpense).map(function (e) {
      return {
        id: e.id,
        description: e.description,
        amount: e.amount,
        category: e.category,
        date: e.date,
        createdAt: (typeof e.createdAt === "number" && isFinite(e.createdAt)) ? e.createdAt : 0
      };
    });
    return { version: 1, budget: budget, expenses: expenses };
  } catch (err) {
    return emptyData();
  }
}

function saveData(data) {
  try {
    if (typeof localStorage === "undefined") { return false; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

function clearData() {
  try {
    if (typeof localStorage !== "undefined") { localStorage.removeItem(STORAGE_KEY); }
  } catch (err) {
    // ignore
  }
}

/* ---------- 6. DOM layer ---------- */

// In-memory state
let appData = { version: 1, budget: null, expenses: [] };
let selectedMonth = "";
let els = null;

const REQUIRED_IDS = [
  "month-filter", "budget-form", "budget-input", "budget-error", "budget-save-btn",
  "budget-display", "total-expenses", "remaining-budget", "budget-warning",
  "expense-form", "description-input", "amount-input", "category-select", "date-input",
  "description-error", "amount-error", "category-error", "date-error", "add-expense-btn",
  "expense-list", "empty-message", "category-breakdown"
];

function getElements() {
  const found = {};
  let ok = true;
  REQUIRED_IDS.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) {
      console.error("Smart Expense Tracker: missing element with id \"" + id + "\"");
      ok = false;
    }
    found[id] = el;
  });
  return ok ? found : null;
}

function showFieldError(inputEl, errorEl, message) {
  if (inputEl) {
    inputEl.classList.add("input-error");
    inputEl.setAttribute("aria-invalid", "true");
  }
  if (errorEl) { errorEl.textContent = message; }
}

function clearFieldError(inputEl, errorEl) {
  if (inputEl) {
    inputEl.classList.remove("input-error");
    inputEl.removeAttribute("aria-invalid");
  }
  if (errorEl) { errorEl.textContent = ""; }
}

function clearAllExpenseErrors() {
  clearFieldError(els["description-input"], els["description-error"]);
  clearFieldError(els["amount-input"], els["amount-error"]);
  clearFieldError(els["category-select"], els["category-error"]);
  clearFieldError(els["date-input"], els["date-error"]);
}

function getMonthExpenses() {
  return filterByMonth(appData.expenses, selectedMonth);
}

function renderSummary() {
  const monthExpenses = getMonthExpenses();
  const total = calculateTotal(monthExpenses);
  const budget = appData.budget;
  const remaining = calculateRemaining(budget, total);

  els["budget-display"].textContent = budget === null ? "Not set" : formatCurrency(budget);
  els["total-expenses"].textContent = formatCurrency(total);
  els["remaining-budget"].textContent = remaining === null ? "—" : formatCurrency(remaining);
  els["remaining-budget"].classList.toggle("negative", remaining !== null && remaining < 0);

  if (isBudgetExceeded(budget, total)) {
    const over = formatCurrency(Math.abs(round2(total - budget)));
    els["budget-warning"].textContent = "Warning: you have exceeded your monthly budget by " + over + "!";
    els["budget-warning"].removeAttribute("hidden");
  } else {
    els["budget-warning"].textContent = "";
    els["budget-warning"].setAttribute("hidden", "");
  }
}

function renderExpenseList() {
  const list = els["expense-list"];
  const items = sortExpenses(getMonthExpenses());
  list.textContent = "";

  items.forEach(function (e) {
    const li = document.createElement("li");
    li.className = "expense-item " + (CATEGORY_CLASSES[e.category] || "");
    li.setAttribute("data-id", e.id);

    const desc = document.createElement("div");
    desc.className = "expense-desc";
    desc.textContent = e.description;

    const meta = document.createElement("div");
    meta.className = "expense-meta";
    const cat = document.createElement("span");
    cat.className = "expense-category";
    cat.textContent = e.category;
    const date = document.createElement("span");
    date.className = "expense-date";
    date.textContent = e.date;
    meta.appendChild(cat);
    meta.appendChild(date);

    const amount = document.createElement("div");
    amount.className = "expense-amount";
    amount.textContent = formatCurrency(e.amount);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "delete-btn";
    btn.setAttribute("data-id", e.id);
    btn.setAttribute("aria-label", "Delete expense: " + e.description);
    btn.textContent = "Delete";

    li.appendChild(desc);
    li.appendChild(meta);
    li.appendChild(amount);
    li.appendChild(btn);
    list.appendChild(li);
  });

  if (items.length === 0) {
    els["empty-message"].removeAttribute("hidden");
  } else {
    els["empty-message"].setAttribute("hidden", "");
  }
}

function renderBreakdown() {
  const container = els["category-breakdown"];
  const breakdown = getCategoryBreakdown(getMonthExpenses());
  container.textContent = "";

  breakdown.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "breakdown-row " + CATEGORY_CLASSES[item.category];
    row.setAttribute("data-category", item.category);

    const label = document.createElement("span");
    label.className = "breakdown-label";
    label.textContent = item.category;

    const bar = document.createElement("div");
    bar.className = "breakdown-bar";
    const fill = document.createElement("div");
    fill.className = "breakdown-bar-fill";
    fill.style.width = item.percent + "%";
    bar.appendChild(fill);

    const amount = document.createElement("span");
    amount.className = "breakdown-amount";
    amount.textContent = formatCurrency(item.total);

    const percent = document.createElement("span");
    percent.className = "breakdown-percent";
    percent.textContent = formatPercent(item.percent);

    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(amount);
    row.appendChild(percent);
    container.appendChild(row);
  });
}

function renderAll() {
  renderSummary();
  renderExpenseList();
  renderBreakdown();
}

function handleExpenseSubmit(event) {
  event.preventDefault();
  const result = validateExpenseInput({
    description: els["description-input"].value,
    amount: els["amount-input"].value,
    category: els["category-select"].value,
    date: els["date-input"].value
  });

  clearAllExpenseErrors();

  if (!result.valid) {
    const e = result.errors;
    if (e.description) { showFieldError(els["description-input"], els["description-error"], e.description); }
    if (e.amount) { showFieldError(els["amount-input"], els["amount-error"], e.amount); }
    if (e.category) { showFieldError(els["category-select"], els["category-error"], e.category); }
    if (e.date) { showFieldError(els["date-input"], els["date-error"], e.date); }
    return;
  }

  appData.expenses = addExpense(appData.expenses, createExpense(result.values));
  if (!saveData(appData)) { console.warn("Smart Expense Tracker: could not save data."); }

  els["expense-form"].reset();
  els["date-input"].value = getTodayString();
  renderAll();
  els["description-input"].focus();
}

function handleBudgetSubmit(event) {
  event.preventDefault();
  const result = validateBudget(els["budget-input"].value);

  if (!result.valid) {
    showFieldError(els["budget-input"], els["budget-error"], result.error);
    return;
  }

  clearFieldError(els["budget-input"], els["budget-error"]);
  appData.budget = result.value;
  if (!saveData(appData)) { console.warn("Smart Expense Tracker: could not save data."); }
  renderAll();
}

function handleDeleteClick(event) {
  const target = event.target;
  const btn = target && target.closest ? target.closest(".delete-btn") : null;
  if (!btn) { return; }
  appData.expenses = deleteExpense(appData.expenses, btn.getAttribute("data-id"));
  if (!saveData(appData)) { console.warn("Smart Expense Tracker: could not save data."); }
  renderAll();
}

function handleMonthChange() {
  const value = els["month-filter"].value;
  selectedMonth = /^\d{4}-\d{2}$/.test(value) ? value : getCurrentMonthKey();
  if (els["month-filter"].value !== selectedMonth) { els["month-filter"].value = selectedMonth; }
  renderAll();
}

function init() {
  els = getElements();
  if (!els) { return; }

  appData = loadData();

  selectedMonth = getCurrentMonthKey();
  els["month-filter"].value = selectedMonth;

  const today = getTodayString();
  els["date-input"].value = today;
  els["date-input"].setAttribute("max", today);

  if (appData.budget !== null) { els["budget-input"].value = appData.budget; }

  els["expense-form"].addEventListener("submit", handleExpenseSubmit);
  els["budget-form"].addEventListener("submit", handleBudgetSubmit);
  els["expense-list"].addEventListener("click", handleDeleteClick);
  els["month-filter"].addEventListener("change", handleMonthChange);
  els["month-filter"].addEventListener("input", handleMonthChange);

  // Clear a field's error as soon as the user edits it.
  [
    ["description-input", "description-error"],
    ["amount-input", "amount-error"],
    ["category-select", "category-error"],
    ["date-input", "date-error"],
    ["budget-input", "budget-error"]
  ].forEach(function (pair) {
    const clear = function () { clearFieldError(els[pair[0]], els[pair[1]]); };
    els[pair[0]].addEventListener("input", clear);
    els[pair[0]].addEventListener("change", clear);
  });

  renderAll();
}

/* ---------- 7. Bootstrap + exports ---------- */

// Runs the app ONLY on the real page, never on tests.html.
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("expense-form")) { init(); }
  });
}

const ExpenseAppApi = {
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

if (typeof window !== "undefined") { window.ExpenseApp = ExpenseAppApi; }
if (typeof module !== "undefined" && module.exports) { module.exports = ExpenseAppApi; }
