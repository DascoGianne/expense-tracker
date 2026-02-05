export default function Topbar({ title, onToggleSidebar }) {
  return (
    <div className="topbar">
      <button
        className="btn ghost small"
        type="button"
        onClick={onToggleSidebar}
        aria-label="Open sidebar"
      >
        Menu
      </button>
      <div className="topbar-title">{title}</div>
    </div>
  );
}
