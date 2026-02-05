const STORAGE_KEY = "expense_tracker_v1";
const CATEGORY_KEY = "expense_tracker_categories_v1";
const THEME_KEY = "expense_tracker_theme_v1";
const PERIOD_KEY = "expense_tracker_period_v1";
const CURRENCY_SYMBOL = "₱";

const form = document.getElementById("expense-form");
const dateEl = document.getElementById("date");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
const noteEl = document.getElementById("note");
const themeSelect = document.getElementById("theme-select");
const periodSelect = document.getElementById("period-filter");
const formTitleEl = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

const listEl = document.getElementById("expense-list");
const clearAllBtn = document.getElementById("clear-all");
const countLabelEl = document.getElementById("count-label");
const newCategoryEl = document.getElementById("new-category");
const addCategoryBtn = document.getElementById("add-category");
const removeCategorySelect = document.getElementById("remove-category-select");
const removeCategoryBtn = document.getElementById("remove-category");
const expensesFilterBtn = document.getElementById("expenses-filter-btn");
const viewModal = document.getElementById("view-modal");
const viewModalClose = document.getElementById("view-modal-close");
const viewModalList = document.getElementById("view-modal-list");
const viewModalSubtitle = document.getElementById("view-modal-subtitle");

const weekTotalEl = document.getElementById("week-total");
const monthTotalEl = document.getElementById("month-total");
const yearTotalEl = document.getElementById("year-total");
const breakdownEl = document.getElementById("category-breakdown");

// ---------- Utilities ----------
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseISODate(iso) {
  // Make a local date (avoids timezone shifting)
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatMoney(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOL}0.00`;
  return `${CURRENCY_SYMBOL}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function startOfWeek(d) {
  // Monday start
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfYear(d) {
  const date = new Date(d.getFullYear(), 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ---------- Storage ----------
function loadExpenses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadCategories() {
  const raw = localStorage.getItem(CATEGORY_KEY);
  if (!raw) {
    return ["Food", "Transport", "Bills", "Groceries", "Health", "Fun", "Other"];
  }
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length ? data : ["Other"];
  } catch {
    return ["Other"];
  }
}

function saveCategories(categories) {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function saveTheme(value) {
  localStorage.setItem(THEME_KEY, value);
}

function loadPeriod() {
  return localStorage.getItem(PERIOD_KEY) || "month";
}

function savePeriod(value) {
  localStorage.setItem(PERIOD_KEY, value);
}

// ---------- State ----------
let expenses = loadExpenses();
let categories = loadCategories();
let editingId = null;

// ---------- CRUD ----------
function addExpense({ date, amount, category, note }) {
  const item = {
    id: crypto.randomUUID(),
    date,
    amount: Number(amount),
    category,
    note: note?.trim() || ""
  };
  expenses.push(item);
  saveExpenses(expenses);
  render();
}

function updateExpense(id, updates) {
  const idx = expenses.findIndex(e => e.id === id);
  if (idx === -1) return;
  expenses[idx] = {
    ...expenses[idx],
    ...updates,
    amount: Number(updates.amount),
    note: updates.note?.trim() || ""
  };
  saveExpenses(expenses);
  render();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses(expenses);
  render();
}

function clearAll() {
  if (!confirm("Clear all expenses? This cannot be undone.")) return;
  expenses = [];
  saveExpenses(expenses);
  render();
}

// ---------- Summaries ----------
function sumForRange(startDate, endDateExclusive) {
  let total = 0;
  for (const e of expenses) {
    const d = parseISODate(e.date);
    if (d >= startDate && d < endDateExclusive) total += e.amount;
  }
  return total;
}

function categoryBreakdownForRange(startDate, endDateExclusive) {
  const map = new Map();
  for (const e of expenses) {
    const d = parseISODate(e.date);
    if (d >= startDate && d < endDateExclusive) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    }
  }

  // Convert to sorted array: highest first
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({ category, total }));
}

function getRangeForPeriod(period, now) {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (period === "week") return [startOfWeek(now), tomorrow];
  if (period === "month") return [startOfMonth(now), tomorrow];
  if (period === "year") return [startOfYear(now), tomorrow];
  return [new Date(0), tomorrow];
}

function getFilteredExpenses() {
  const now = new Date();
  const [rangeStart, rangeEnd] = getRangeForPeriod(periodSelect.value, now);
  return expenses.filter(e => {
    if (periodSelect.value === "all") return true;
    const d = parseISODate(e.date);
    return d >= rangeStart && d < rangeEnd;
  });
}

// ---------- Render ----------
function renderTotals() {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const weekTotal = sumForRange(weekStart, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  // For month/year, end is tomorrow too (simpler: include up to today)
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const monthTotal = sumForRange(monthStart, tomorrow);
  const yearTotal = sumForRange(yearStart, tomorrow);

  weekTotalEl.textContent = formatMoney(weekTotal);
  monthTotalEl.textContent = formatMoney(monthTotal);
  yearTotalEl.textContent = formatMoney(yearTotal);

  const [rangeStart, rangeEnd] = getRangeForPeriod(periodSelect.value, now);
  const breakdown = categoryBreakdownForRange(rangeStart, rangeEnd);
  breakdownEl.innerHTML = "";

  if (breakdown.length === 0) {
    breakdownEl.innerHTML = `<li class="empty">No expenses for this view yet.</li>`;
    return;
  }

  for (const row of breakdown) {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div class="item-top">
        <span class="badge">${row.category}</span>
        <strong>${formatMoney(row.total)}</strong>
      </div>
    `;
    breakdownEl.appendChild(li);
  }
}

function renderList() {
  listEl.innerHTML = "";

  const filtered = getFilteredExpenses();

  if (filtered.length === 0) {
    listEl.innerHTML = `<li class="empty">No expenses for this view yet.</li>`;
    countLabelEl.textContent = "0 items";
    return;
  }

  // newest first
  const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
  countLabelEl.textContent = `${sorted.length} item${sorted.length === 1 ? "" : "s"}`;

  for (const e of sorted) {
    const li = document.createElement("li");
    li.className = "item";

    const safeNote = e.note ? `<div class="note">${escapeHtml(e.note)}</div>` : "";

    li.innerHTML = `
      <div class="item-top">
        <div class="actions">
          <span class="badge">${escapeHtml(e.category)}</span>
          <span class="badge">${escapeHtml(e.date)}</span>
        </div>
        <strong>${formatMoney(e.amount)}</strong>
      </div>
      ${safeNote}
      <div class="item-top">
        <div class="meta">
          <span>ID: ${e.id.slice(0, 6)}…</span>
        </div>
        <div class="row-actions">
          <button class="btn ghost small" data-edit="${e.id}">Edit</button>
          <button class="btn ghost small" data-delete="${e.id}">Delete</button>
        </div>
      </div>
    `;

    listEl.appendChild(li);
  }

  // Attach handlers
  listEl.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => deleteExpense(btn.dataset.delete));
  });
  listEl.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => startEdit(btn.dataset.edit));
  });
}

function render() {
  renderTotals();
  renderList();
}

// basic XSS safety for notes/category
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCategories() {
  categoryEl.innerHTML = "";
  removeCategorySelect.innerHTML = "";
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryEl.appendChild(opt);

    const optRemove = document.createElement("option");
    optRemove.value = cat;
    optRemove.textContent = cat;
    removeCategorySelect.appendChild(optRemove);
  }
}

function resetForm({ keepDate = true, keepCategory = true } = {}) {
  editingId = null;
  formTitleEl.textContent = "Add Expense";
  submitBtn.textContent = "Add";
  cancelEditBtn.hidden = true;
  if (!keepDate) dateEl.value = todayISO();
  if (!keepCategory) categoryEl.value = categories[0] || "";
  amountEl.value = "";
  noteEl.value = "";
}

function startEdit(id) {
  const item = expenses.find(e => e.id === id);
  if (!item) return;
  editingId = id;
  formTitleEl.textContent = "Edit Expense";
  submitBtn.textContent = "Save";
  cancelEditBtn.hidden = false;
  dateEl.value = item.date;
  amountEl.value = item.amount;
  categoryEl.value = item.category;
  noteEl.value = item.note || "";
  amountEl.focus();
}

function addCategory(name) {
  const cleaned = name.trim();
  if (!cleaned) return;
  const exists = categories.some(c => c.toLowerCase() === cleaned.toLowerCase());
  if (exists) {
    alert("That category already exists.");
    return;
  }
  categories = [...categories, cleaned];
  saveCategories(categories);
  renderCategories();
  categoryEl.value = cleaned;
  newCategoryEl.value = "";
}

function removeCategory(name) {
  if (!name) return;
  const inUse = expenses.some(e => e.category === name);
  if (inUse) {
    alert("That category is in use. Remove expenses first or edit them.");
    return;
  }
  categories = categories.filter(c => c !== name);
  if (categories.length === 0) categories = ["Other"];
  saveCategories(categories);
  renderCategories();
  categoryEl.value = categories[0];
}

function openViewModal() {
  viewModalList.innerHTML = "";
  const filtered = getFilteredExpenses();
  const periodLabel = periodSelect.options[periodSelect.selectedIndex]?.textContent || "Current view";
  viewModalSubtitle.textContent = `${periodLabel} • ${filtered.length} item${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    viewModalList.innerHTML = `<li class="empty">No expenses for this view yet.</li>`;
  } else {
    const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
    for (const e of sorted) {
      const li = document.createElement("li");
      li.className = "item";
      const safeNote = e.note ? `<div class="note">${escapeHtml(e.note)}</div>` : "";
      li.innerHTML = `
        <div class="item-top">
          <div class="actions">
            <span class="badge">${escapeHtml(e.category)}</span>
            <span class="badge">${escapeHtml(e.date)}</span>
          </div>
          <strong>${formatMoney(e.amount)}</strong>
        </div>
        ${safeNote}
      `;
      viewModalList.appendChild(li);
    }
  }

  viewModal.hidden = false;
}

function closeViewModal() {
  viewModal.hidden = true;
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const date = dateEl.value || todayISO();
  const amount = amountEl.value;
  const category = categoryEl.value;

  if (!amount || Number(amount) <= 0) {
    alert("Please enter an amount greater than 0.");
    return;
  }

  if (!category) {
    alert("Please pick a category.");
    return;
  }

  if (editingId) {
    updateExpense(editingId, { date, amount, category, note: noteEl.value });
    resetForm({ keepDate: true, keepCategory: true });
  } else {
    addExpense({ date, amount, category, note: noteEl.value });
    // reset amount/note, keep date/category for faster entry
    amountEl.value = "";
    noteEl.value = "";
    amountEl.focus();
  }
});

clearAllBtn.addEventListener("click", clearAll);
cancelEditBtn.addEventListener("click", () => resetForm({ keepDate: true, keepCategory: true }));
themeSelect.addEventListener("change", () => {
  document.body.dataset.theme = themeSelect.value;
  saveTheme(themeSelect.value);
});
periodSelect.addEventListener("change", () => {
  savePeriod(periodSelect.value);
  render();
});
addCategoryBtn.addEventListener("click", () => addCategory(newCategoryEl.value));
newCategoryEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addCategory(newCategoryEl.value);
  }
});
removeCategoryBtn.addEventListener("click", () => removeCategory(removeCategorySelect.value));
expensesFilterBtn.addEventListener("click", openViewModal);
viewModalClose.addEventListener("click", closeViewModal);
viewModal.addEventListener("click", (e) => {
  if (e.target?.dataset?.close) closeViewModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !viewModal.hidden) closeViewModal();
});

// ---------- Init ----------
dateEl.value = todayISO();
themeSelect.value = loadTheme();
document.body.dataset.theme = themeSelect.value;
periodSelect.value = loadPeriod();
renderCategories();
resetForm({ keepDate: true, keepCategory: true });
render();
