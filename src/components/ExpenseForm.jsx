import { useMemo } from "react";
import { todayISO } from "../utils/date";

export default function ExpenseForm({
  categories,
  onSubmit,
  editingExpense,
  onCancelEdit
}) {
  const initialDate = useMemo(() => todayISO(), []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const payload = {
      date: data.get("date") || initialDate,
      amount: data.get("amount"),
      category: data.get("category"),
      note: data.get("note") || ""
    };
    onSubmit(payload);
    if (!editingExpense) form.reset();
  };

  return (
    <section className="card">
      <div className="row">
        <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
        {editingExpense && (
          <button className="btn ghost small" type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>

      <form className="grid" onSubmit={handleSubmit}>
        <label>
          Date
          <input
            name="date"
            type="date"
            defaultValue={editingExpense?.date || initialDate}
            required
          />
        </label>

        <label>
          Amount
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={editingExpense?.amount ?? ""}
            required
          />
        </label>

        <label>
          Category
          <select name="category" defaultValue={editingExpense?.category || categories[0]} required>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="full">
          Note (optional)
          <input
            name="note"
            type="text"
            maxLength="80"
            placeholder="e.g., lunch, bus fare"
            defaultValue={editingExpense?.note || ""}
          />
        </label>

        <button className="full btn" type="submit">
          {editingExpense ? "Save" : "Add"}
        </button>
      </form>
    </section>
  );
}
