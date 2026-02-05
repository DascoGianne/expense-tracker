const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "categories", label: "Categories" },
  { id: "summary", label: "Summary" },
  { id: "settings", label: "Settings" }
];

export default function Sidebar({ activeView, onChangeView, onClose }) {
  return (
    <>
      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden="true">ET</div>
          <div>
            <div className="brand-title">Expense Tracker</div>
            <div className="brand-subtitle">Personal finance</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${activeView === item.id ? "is-active" : ""}`}
              onClick={() => onChangeView(item.id)}
              aria-current={activeView === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn ghost small" type="button">Export data</button>
          <button className="btn ghost small" type="button">Analytics</button>
        </div>
      </aside>

      <button
        type="button"
        className="sidebar-overlay"
        aria-label="Close sidebar"
        onClick={onClose}
      />
    </>
  );
}
