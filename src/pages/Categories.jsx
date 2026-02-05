import CategoryManager from "../components/CategoryManager.jsx";
import { rangeForPeriod, parseISODate } from "../utils/date.js";
import { formatMoney } from "../utils/money.js";

export default function Categories({
  categories,
  onAddCategory,
  onRemoveCategory,
  budgets,
  onBudgetChange,
  expenses,
  currency,
  locale
}) {
  const [monthStart, monthEnd] = rangeForPeriod("month");
  const spentByCategory = categories.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

  expenses.forEach((expense) => {
    const date = parseISODate(expense.date);
    if (date >= monthStart && date < monthEnd) {
      spentByCategory[expense.category] =
        (spentByCategory[expense.category] || 0) + expense.amount;
    }
  });

  return (
    <>
      <header className="header">
        <div>
          <h1>Categories</h1>
          <p>Manage the labels used across your expenses.</p>
        </div>
      </header>

      <section className="card">
        <h2>Monthly Budgets</h2>
        <p className="muted">
          Set monthly limits per category. We will show how close you are to the
          limit based on this month&apos;s spend.
        </p>

        <div className="budget-grid">
          {categories.map((category) => {
            const budget = Number(budgets?.[category] ?? 0);
            const spent = spentByCategory[category] || 0;
            const remaining = budget - spent;
            const ratio = budget > 0 ? spent / budget : 0;
            const status =
              budget <= 0 ? "neutral" : ratio >= 1 ? "danger" : ratio >= 0.8 ? "warn" : "ok";

            return (
              <div className={`budget-card ${status}`} key={category}>
                <div className="budget-header">
                  <strong>{category}</strong>
                  <span className="budget-pill">{statusLabel(status)}</span>
                </div>
                <label>
                  Budget (monthly)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={Number.isFinite(budget) ? budget : 0}
                    onChange={(e) => onBudgetChange(category, e.target.value)}
                  />
                </label>
                <div className="budget-metrics">
                  <div>
                    <span>Spent</span>
                    <strong>{formatMoney(spent, { currency, locale })}</strong>
                  </div>
                  <div>
                    <span>{remaining >= 0 ? "Remaining" : "Over by"}</span>
                    <strong>{formatMoney(Math.abs(remaining), { currency, locale })}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>Category Manager</h2>
        <p className="muted">
          Keep categories tidy for better summaries and reporting.
        </p>
        <CategoryManager
          categories={categories}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
        />
      </section>
    </>
  );
}

function statusLabel(status) {
  if (status === "danger") return "Over budget";
  if (status === "warn") return "Near limit";
  if (status === "ok") return "On track";
  return "No budget";
}
