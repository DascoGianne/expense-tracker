import { useMemo } from "react";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import TotalsPanel from "../components/TotalsPanel.jsx";
import CategoryManager from "../components/CategoryManager.jsx";
import { rangeForPeriod, parseISODate } from "../utils/date.js";

export default function Dashboard({
  expenses,
  categories,
  period,
  currency,
  locale,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddCategory,
  onRemoveCategory,
  editingExpense,
  onStartEdit,
  onCancelEdit,
  onChangePeriod,
  onChangeTheme,
  theme
}) {
  const filteredExpenses = useMemo(() => {
    if (period === "all") return expenses;
    const [start, end] = rangeForPeriod(period);
    return expenses.filter((expense) => {
      const date = parseISODate(expense.date);
      return date >= start && date < end;
    });
  }, [expenses, period]);

  const sortedExpenses = useMemo(
    () => [...filteredExpenses].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [filteredExpenses]
  );

  const handleSubmit = (payload) => {
    if (!payload.amount || Number(payload.amount) <= 0) {
      alert("Please enter an amount greater than 0.");
      return;
    }
    if (!payload.category) {
      alert("Please pick a category.");
      return;
    }
    if (editingExpense) {
      onUpdateExpense(editingExpense.id, payload);
      return;
    }
    onAddExpense(payload);
  };

  return (
    <>
      <header className="header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Track daily expenses with weekly/monthly/yearly totals.</p>
        </div>
        <div className="header-actions">
          <label className="inline">
            Theme
            <select value={theme} onChange={(e) => onChangeTheme(e.target.value)}>
              <option value="dark">Dark</option>
              <option value="neutral">Neutral</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label className="inline">
            View
            <select value={period} onChange={(e) => onChangePeriod(e.target.value)}>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
              <option value="all">All time</option>
            </select>
          </label>
        </div>
      </header>

      <section className="layout dashboard-grid">
        <section>
          <ExpenseForm
            key={editingExpense?.id || "new"}
            categories={categories}
            onSubmit={handleSubmit}
            editingExpense={editingExpense}
            onCancelEdit={onCancelEdit}
          />
          <CategoryManager
            categories={categories}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
          />
        </section>
        <TotalsPanel expenses={expenses} period={period} currency={currency} locale={locale} />
      </section>

      <section className="card">
        <div className="row">
          <div className="pill">Expenses ({periodLabel(period)})</div>
          <div className="row-actions">
            <span className="muted">
              {sortedExpenses.length} item{sortedExpenses.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <ExpenseList
          expenses={sortedExpenses}
          currency={currency}
          locale={locale}
          onEdit={onStartEdit}
          onDelete={onDeleteExpense}
        />
      </section>
    </>
  );
}

function periodLabel(period) {
  if (period === "week") return "This week";
  if (period === "month") return "This month";
  if (period === "year") return "This year";
  return "All time";
}
