import { useState } from "react";

export default function Settings({
  theme,
  currency,
  locale,
  period,
  onThemeChange,
  onCurrencyChange,
  onLocaleChange,
  onPeriodChange,
  onExportCsv,
  onImportCsv
}) {
  const [importMode, setImportMode] = useState("merge");
  const [importStatus, setImportStatus] = useState("");

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportStatus("Importing...");
    try {
      const result = await onImportCsv(file, importMode);
      const errorText = result.errors?.length ? ` (${result.errors.length} skipped)` : "";
      setImportStatus(`Imported ${result.imported} rows${errorText}.`);
    } catch (err) {
      setImportStatus(err.message || "Import failed.");
    } finally {
      event.target.value = "";
    }
  };

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

      <section className="card">
        <h2>CSV Import / Export</h2>
        <p className="muted">Export all expenses or import from a CSV file.</p>
        <div className="settings-actions">
          <button className="btn" type="button" onClick={onExportCsv}>
            Export CSV
          </button>
          <div className="import-controls">
            <label className="inline">
              Import mode
              <select value={importMode} onChange={(e) => setImportMode(e.target.value)}>
                <option value="merge">Merge</option>
                <option value="replace">Replace</option>
              </select>
            </label>
            <label className="btn ghost small import-btn">
              Import CSV
              <input type="file" accept=".csv" onChange={handleImport} hidden />
            </label>
          </div>
        </div>
        {importStatus && <div className="muted">{importStatus}</div>}
        <p className="muted small">Expected headers: date, amount, category, note.</p>
      </section>
    </>
  );
}
