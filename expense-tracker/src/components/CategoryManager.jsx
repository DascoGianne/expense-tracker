import { useEffect, useState } from "react";

export default function CategoryManager({ categories, onAddCategory, onRemoveCategory }) {
  const [value, setValue] = useState("");
  const [removeValue, setRemoveValue] = useState(categories[0] || "");

  useEffect(() => {
    setRemoveValue(categories[0] || "");
  }, [categories]);

  const handleAdd = () => {
    onAddCategory(value);
    setValue("");
  };

  const handleRemove = () => {
    onRemoveCategory(removeValue);
  };

  return (
    <div className="category-tools">
      <div className="category-add">
        <input
          type="text"
          placeholder="Add new category (e.g., Coffee)"
          maxLength="24"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button className="btn small" type="button" onClick={handleAdd}>
          Add category
        </button>
      </div>

      <div className="category-remove">
        <label className="inline">
          Remove
          <select value={removeValue} onChange={(event) => setRemoveValue(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <button className="btn ghost small" type="button" onClick={handleRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}
