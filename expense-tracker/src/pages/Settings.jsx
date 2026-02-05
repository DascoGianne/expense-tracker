export default function Settings({
  theme,
  currency,
  locale,
  period,
  onThemeChange,
  onCurrencyChange,
  onLocaleChange,
  onPeriodChange
}) {
  return (
    <>
      <header className="header">
        <div>
          <h1>Settings</h1>
          <p>Preferences, export options, and data tools.</p>
        </div>
      </header>

      <section className="card">
        <h2>Preferences</h2>
        <div className="settings-grid">
          <label>
            Theme
            <select value={theme} onChange={(e) => onThemeChange(e.target.value)}>
              <option value="dark">Dark</option>
              <option value="neutral">Neutral</option>
              <option value="light">Light</option>
            </select>
          </label>

          <label>
            Currency
            <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)}>
              <option value="PHP">Philippine Peso (PHP)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="JPY">Japanese Yen (JPY)</option>
            </select>
          </label>

          <label>
            Locale
            <input
              type="text"
              placeholder="e.g., en-US, fil-PH"
              value={locale}
              onChange={(e) => onLocaleChange(e.target.value)}
            />
          </label>
        </div>
        <p className="muted small">
          Locale controls number formatting. Leave blank to use your browser default.
        </p>
      </section>

      <section className="card">
        <h2>Defaults</h2>
        <div className="settings-grid">
          <label>
            Default filter
            <select value={period} onChange={(e) => onPeriodChange(e.target.value)}>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
              <option value="all">All time</option>
            </select>
          </label>
        </div>
      </section>
    </>
  );
}
