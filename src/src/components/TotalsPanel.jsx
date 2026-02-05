import { rangeForPeriod, startOfMonth, startOfWeek, startOfYear, parseISODate } from "../utils/date";
import { formatMoney } from "../utils/money";

function sumForRange(expenses, startDate, endDateExclusive) {
  return expenses.reduce((total, item) => {
    const date = parseISODate(item.date);
    if (date >= startDate && date < endDateExclusive) return total + item.amount;
    return total;
  }, 0);
}

function categoryBreakdown(expenses, startDate, endDateExclusive) {
  const map = new Map();
  expenses.forEach((item) => {
    const date = parseISODate(item.date);
    if (date >= startDate && date < endDateExclusive) {
      map.set(item.category, (map.get(item.category) || 0) + item.amount);
    }
  });

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({ category, total }));
}

export default function TotalsPanel({ expenses, period, currency, locale }) {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const weekTotal = sumForRange(expenses, startOfWeek(now), tomorrow);
  const monthTotal = sumForRange(expenses, startOfMonth(now), tomorrow);
  const yearTotal = sumForRange(expenses, startOfYear(now), tomorrow);
  const [rangeStart, rangeEnd] = rangeForPeriod(period, now);
  const breakdown = categoryBreakdown(expenses, rangeStart, rangeEnd);

  return (
    <aside className="card sticky totals-panel">
      <div className="row">
        <h2>Totals</h2>
      </div>

      <div className="totals">
        <div className="total">
          <span>Week</span>
          <strong>{formatMoney(weekTotal, { currency, locale })}</strong>
        </div>
        <div className="total">
          <span>Month</span>
          <strong>{formatMoney(monthTotal, { currency, locale })}</strong>
        </div>
        <div className="total">
          <span>Year</span>
          <strong>{formatMoney(yearTotal, { currency, locale })}</strong>
        </div>
      </div>

      <div className="divider"></div>

      <h3 className="subhead">Category Breakdown (View filter)</h3>
      <ul className="breakdown">
        {breakdown.length === 0 ? (
          <li className="empty">No expenses for this view yet.</li>
        ) : (
          breakdown.map((row) => (
            <li className="item" key={row.category}>
              <div className="item-top">
                <span className="badge">{row.category}</span>
                <strong>{formatMoney(row.total, { currency, locale })}</strong>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
