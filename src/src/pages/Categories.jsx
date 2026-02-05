import CategoryManager from "../components/CategoryManager.jsx";

export default function Categories({ categories, onAddCategory, onRemoveCategory }) {
  return (
    <>
      <header className="header">
        <div>
          <h1>Categories</h1>
          <p>Manage the labels used across your expenses.</p>
        </div>
      </header>
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
