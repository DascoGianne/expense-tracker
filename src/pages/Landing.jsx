export default function Landing({ onEnter }) {
  return (
    <section className="landing">
      <div className="landing-card">
        <div className="landing-pill">Personal Finance</div>
        <h1 className="landing-title">Expense Tracker</h1>
        <p className="landing-subtitle">
          Track spending, monitor budgets, and keep your finances organized with a
          clean, modern dashboard.
        </p>
        <div className="landing-quote">
          "Small expenses become big savings when you can see them clearly."
          <span className="landing-author">— Expense Tracker</span>
        </div>
        <button className="btn landing-btn" type="button" onClick={onEnter}>
          Enter dashboard
        </button>
      </div>
    </section>
  );
}
