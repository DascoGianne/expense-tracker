# Expense Tracker (Vite + React)

Production-quality Expense Tracker built with Vite + React. Includes a responsive sidebar layout, view management, local storage persistence, and theme support.

## Project Structure

```
expense-tracker/
  src/
    components/       UI building blocks
    pages/            View components (Dashboard, Categories, Summary, Settings)
    hooks/            Reusable hooks (localStorage)
    utils/            Formatting + date utilities
    App.jsx           App shell + state management
    main.jsx          React entry
    styles.css        Global styling + themes
  index.html
  vite.config.js
  package.json
```

## Key Architecture Decisions

- State-based navigation: lightweight view state stored in localStorage and mirrored to URL hash.
- Local persistence: reusable `useLocalStorage` hook for expenses, categories, theme, filters, and view.
- Modular UI: sidebar, topbar, totals panel, expense list, and forms are isolated components.
- Utilities: date and currency formatting are centralized in `src/utils`.

## Scripts

From `expense-tracker/`:

```
npm install
npm run dev
npm run build
npm run preview
```

## GitHub Pages Deployment

This project uses `base: "./"` in `vite.config.js` for static hosting.

1. `npm run build`
2. Deploy the `dist/` folder to GitHub Pages (e.g., via `gh-pages` or your preferred workflow).

## Features

- Add/edit/delete expenses
- Category management with defaults and persistence
- Filters: week, month, year, all time
- Totals and category breakdowns
- Responsive layout with collapsible sidebar
- Theme selection (dark/neutral/light)
- Currency and locale formatting
