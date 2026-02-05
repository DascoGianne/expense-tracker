import { rangeForPeriod, parseISODate } from "../utils/date.js";
import { formatMoney } from "../utils/money.js";

export default function Summary({ expenses, currency, locale }) {
  const [start, end] = rangeForPeriod("month");
  const total = expenses.reduce((sum, expense) => {
    const date = parseISODate(expense.date);
    if (date >= start && date < end) return sum + expense.amount;
    return sum;
  }, 0);

  return (
    <>
      <header className="header">
        <div>
          <h1>Summary</h1>
          <p>Review trends and monthly performance.</p>
        </div>
      </header>
      <section className="card">
        <h2>Monthly Snapshot</h2>
        <p className="muted">High-level overview for the current month.</p>
        <div className="summary-stat">
          <span>Total spend</span>
          <strong>{formatMoney(total, { currency, locale })}</strong>
        </div>
      </section>
    </>
  );
}
