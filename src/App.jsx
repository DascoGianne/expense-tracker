import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Categories from "./pages/Categories.jsx";
import Summary from "./pages/Summary.jsx";
import Settings from "./pages/Settings.jsx";
import Landing from "./pages/Landing.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { parseCsv, toCsv } from "./utils/csv.js";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Groceries",
  "Health",
  "Fun",
  "Other"
];

const VIEW_TITLES = {
  landing: "Welcome",
  dashboard: "Dashboard",
  categories: "Categories",
  summary: "Summary",
  settings: "Settings"
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [expenses, setExpenses] = useLocalStorage("expense_tracker_v1", []);
  const [categories, setCategories] = useLocalStorage(
    "expense_tracker_categories_v1",
    DEFAULT_CATEGORIES
  );
  const [budgets, setBudgets] = useLocalStorage("expense_tracker_budgets_v1", {});
  const [theme, setTheme] = useLocalStorage("expense_tracker_theme_v1", "dark");
  const [period, setPeriod] = useLocalStorage("expense_tracker_period_v1", "month");
  const [view, setView] = useLocalStorage("expense_tracker_view_v1", "landing");
  const [currency, setCurrency] = useLocalStorage("expense_tracker_currency_v1", "PHP");
  const [locale, setLocale] = useLocalStorage("expense_tracker_locale_v1", "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setView("landing");
  }, [setView]);

  useEffect(() => {
    window.history.replaceState(null, "", `#${view}`);
  }, [view]);

  useEffect(() => {
    setBudgets((prev) => {
      const next = { ...prev };
      categories.forEach((category) => {
        if (next[category] === undefined) next[category] = 0;
      });
      Object.keys(next).forEach((key) => {
        if (!categories.includes(key)) delete next[key];
      });
      return next;
    });
  }, [categories, setBudgets]);

  const editingExpense = useMemo(
    () => expenses.find((expense) => expense.id === editingId) || null,
    [expenses, editingId]
  );

  const handleAddExpense = (payload) => {
    const item = {
      id: createId(),
      date: payload.date,
      amount: Number(payload.amount),
      category: payload.category,
      note: payload.note?.trim() || ""
    };
    setExpenses([...expenses, item]);
  };

  const handleUpdateExpense = (id, updates) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              ...updates,
              amount: Number(updates.amount),
              note: updates.note?.trim() || ""
            }
          : expense
      )
    );
    setEditingId(null);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const handleAddCategory = (name) => {
    const cleaned = name.trim();
    if (!cleaned) return;
    if (categories.some((cat) => cat.toLowerCase() === cleaned.toLowerCase())) {
      alert("That category already exists.");
      return;
    }
    setCategories([...categories, cleaned]);
    setBudgets((prev) => ({ ...prev, [cleaned]: prev[cleaned] ?? 0 }));
  };

  const handleRemoveCategory = (name) => {
    if (!name) return;
    const inUse = expenses.some((expense) => expense.category === name);
    if (inUse) {
      alert("That category is in use. Remove expenses first or edit them.");
      return;
    }
    const next = categories.filter((cat) => cat !== name);
    setCategories(next.length ? next : ["Other"]);
    setBudgets((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleBudgetChange = (category, value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return;
    setBudgets((prev) => ({ ...prev, [category]: numeric }));
  };

  const handleChangeView = (nextView) => {
    setView(nextView);
    setSidebarOpen(false);
  };

  const handleExportCsv = () => {
    const csv = toCsv(expenses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (file, mode = "merge") =>
    new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file selected."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const rows = parseCsv(reader.result || "");
          if (rows.length === 0) throw new Error("CSV is empty.");

          const headers = rows[0].map((h) => h.trim().toLowerCase());
          const required = ["date", "amount", "category", "note"];
          const missing = required.filter((h) => !headers.includes(h));
          if (missing.length) {
            throw new Error(`Missing headers: ${missing.join(", ")}`);
          }

          const idx = (name) => headers.indexOf(name);
          const imported = [];
          const errors = [];

          rows.slice(1).forEach((row, index) => {
            const date = row[idx("date")]?.trim();
            const amountRaw = row[idx("amount")]?.trim();
            const category = row[idx("category")]?.trim();
            const note = row[idx("note")]?.trim() || "";

            const amount = Number(amountRaw);
            if (!date || !category || !Number.isFinite(amount)) {
              errors.push(`Row ${index + 2} has invalid data.`);
              return;
            }

            imported.push({
              id: createId(),
              date,
              amount,
              category,
              note
            });
          });

          if (imported.length === 0) {
            throw new Error("No valid rows were found.");
          }

          setExpenses((prev) => (mode === "replace" ? imported : [...prev, ...imported]));
          resolve({ imported: imported.length, errors });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the file."));
      reader.readAsText(file);
    });

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      {view !== "landing" && (
        <Sidebar
          activeView={view}
          onChangeView={handleChangeView}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <main className={`main-content ${view === "landing" ? "landing-only" : ""}`}>
        {view !== "landing" && (
          <Topbar
            title={VIEW_TITLES[view]}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
        )}

        <div className="container">
          {view === "landing" && <Landing onEnter={() => setView("dashboard")} />}
          {view === "dashboard" && (
            <Dashboard
              expenses={expenses}
              categories={categories}
              period={period}
              currency={currency}
              locale={locale}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              editingExpense={editingExpense}
              onStartEdit={(id) => setEditingId(id)}
              onCancelEdit={() => setEditingId(null)}
              onChangePeriod={setPeriod}
              onChangeTheme={setTheme}
              theme={theme}
            />
          )}
          {view === "categories" && (
            <Categories
              categories={categories}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              budgets={budgets}
              onBudgetChange={handleBudgetChange}
              expenses={expenses}
              currency={currency}
              locale={locale}
            />
          )}
          {view === "summary" && (
            <Summary
              expenses={expenses}
              currency={currency}
              locale={locale}
              period={period}
              onChangePeriod={setPeriod}
            />
          )}
          {view === "settings" && (
            <Settings
              theme={theme}
              currency={currency}
              locale={locale}
              period={period}
              onThemeChange={setTheme}
              onCurrencyChange={setCurrency}
              onLocaleChange={setLocale}
              onPeriodChange={setPeriod}
              onExportCsv={handleExportCsv}
              onImportCsv={handleImportCsv}
            />
          )}
        </div>
      </main>
    </div>
  );
}
