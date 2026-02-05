import { formatMoney } from "../utils/money";

export default function ExpenseList({ expenses, currency, locale, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return <div className="empty">No expenses for this view yet.</div>;
  }

  return (
    <ul className="list">
      {expenses.map((expense) => (
        <li className="item" key={expense.id}>
          <div className="item-top">
            <div className="actions">
              <span className="badge">{expense.category}</span>
              <span className="badge">{expense.date}</span>
            </div>
            <strong>{formatMoney(expense.amount, { currency, locale })}</strong>
          </div>
          {expense.note && <div className="note">{expense.note}</div>}
          <div className="item-top">
            <div className="meta">ID: {expense.id.slice(0, 6)}...</div>
            <div className="row-actions">
              <button className="btn ghost small" type="button" onClick={() => onEdit(expense.id)}>
                Edit
              </button>
              <button className="btn ghost small" type="button" onClick={() => onDelete(expense.id)}>
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
