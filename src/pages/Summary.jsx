import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import { rangeForPeriod, parseISODate } from "../utils/date.js";
import { formatMoney } from "../utils/money.js";

const CHART_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#f87171"];

export default function Summary({ expenses, currency, locale, period, onChangePeriod }) {
  const filtered = useMemo(() => {
    if (period === "all") return expenses;
    const [start, end] = rangeForPeriod(period);
    return expenses.filter((expense) => {
      const date = parseISODate(expense.date);
      return date >= start && date < end;
    });
  }, [expenses, period]);

  const total = useMemo(
    () => filtered.reduce((sum, expense) => sum + expense.amount, 0),
    [filtered]
  );

  const categoryData = useMemo(() => {
    const map = new Map();
    filtered.forEach((expense) => {
      map.set(expense.category, (map.get(expense.category) || 0) + expense.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const trendData = useMemo(() => {
    const map = new Map();
    filtered.forEach((expense) => {
      const key = period === "all" ? expense.date.slice(0, 7) : expense.date;
      map.set(key, (map.get(key) || 0) + expense.amount);
    });
    return Array.from(map.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([label, value]) => ({ label, value }));
  }, [filtered, period]);

  return (
    <>
      <header className="header">
        <div>
          <h1>Summary</h1>
          <p>Review trends and performance for the selected period.</p>
        </div>
        <div className="header-actions">
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

      <section className="card">
        <h2>Snapshot</h2>
        <p className="muted">High-level overview for the current filter.</p>
        <div className="summary-stat">
          <span>Total spend</span>
          <strong>{formatMoney(total, { currency, locale })}</strong>
        </div>
      </section>

      <section className="chart-grid">
        <div className="card chart-card">
          <div className="row">
            <h2>Spending by Category</h2>
          </div>
          {categoryData.length === 0 ? (
            <div className="empty">No data for this period yet.</div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50}>
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value, { currency, locale })} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card chart-card">
          <div className="row">
            <h2>Spending Over Time</h2>
          </div>
          {trendData.length === 0 ? (
            <div className="empty">No data for this period yet.</div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    tickFormatter={(value) => formatMoney(value, { currency, locale })}
                  />
                  <Tooltip formatter={(value) => formatMoney(value, { currency, locale })} />
                  <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
