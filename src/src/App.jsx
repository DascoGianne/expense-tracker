import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Categories from "./pages/Categories.jsx";
import Summary from "./pages/Summary.jsx";
import Settings from "./pages/Settings.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";

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
  const [theme, setTheme] = useLocalStorage("expense_tracker_theme_v1", "dark");
  const [period, setPeriod] = useLocalStorage("expense_tracker_period_v1", "month");
  const [view, setView] = useLocalStorage("expense_tracker_view_v1", "dashboard");
  const [currency, setCurrency] = useLocalStorage("expense_tracker_currency_v1", "PHP");
  const [locale, setLocale] = useLocalStorage("expense_tracker_locale_v1", "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!window.location.hash) return;
    const hash = window.location.hash.replace("#", "");
    if (VIEW_TITLES[hash]) setView(hash);
  }, [setView]);

  useEffect(() => {
    window.history.replaceState(null, "", `#${view}`);
  }, [view]);

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
  };

  const handleChangeView = (nextView) => {
    setView(nextView);
    setSidebarOpen(false);
  };

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        activeView={view}
        onChangeView={handleChangeView}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Topbar
          title={VIEW_TITLES[view]}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <div className="container">
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
            />
          )}
          {view === "summary" && (
            <Summary expenses={expenses} currency={currency} locale={locale} />
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
            />
          )}
        </div>
      </main>
    </div>
  );
}
