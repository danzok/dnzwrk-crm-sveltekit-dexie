# DNZwrk CRM Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies powering the DNZwrk personal CRM. It’s written in clear, everyday language so that anyone—technical or not—can understand how the frontend is set up and why.

## 1. Frontend Architecture

### Frameworks and Libraries
- **SvelteKit**: The core framework. It offers file-based routing, compile-time reactivity, built-in PWA support, and easy adapters for deployment.  
- **Dexie.js (IndexedDB)**: A lightweight wrapper around the browser’s IndexedDB. It powers the local-first, offline-capable data layer, ensuring all user data stays in the browser.  
- **TypeScript**: Ensures type safety and catches errors at compile time, especially useful for data models (e.g., `Commission`).  
- **Tailwind CSS**: A utility-first styling framework for rapid, responsive design.  
- **Svelte Stores**: Built-in reactive stores to manage application state and automatically update the UI when data changes.

### Scalability, Maintainability, Performance
- **Component-Based Structure**: Small, focused Svelte components live in `src/lib/components/`. Each does one thing (e.g., `CommissionItem.svelte`, `SummaryCards.svelte`), making them easy to test, reuse, and replace.  
- **Modular Data Layer**: Dexie schema and Svelte stores are isolated under `src/lib/db.ts` and `src/lib/stores/`. UI components never talk directly to IndexedDB—they talk to the store API.  
- **Compile-Time Optimizations**: SvelteKit bundles only the code you use. With Tailwind’s purging and smart code splitting, file sizes stay small and load times fast.  
- **Local-First & PWA**: All assets and data are cached via a service worker (`src/service-worker.ts`) and manifest, ensuring near-instant load and offline use.

## 2. Design Principles

### Usability
- **Mobile-First**: The UI is designed for small screens first, then scales up. Buttons are large enough for touch, forms are one-column, and dashboards scroll vertically.  
- **Intuitive Flow**: Common actions (add, edit, delete commission) are clearly labeled and centrally placed.

### Accessibility (A11y)
- **Semantic HTML**: Use `<button>`, `<form>`, `<label>` correctly.  
- **Keyboard Navigation**: Modals trap focus; all interactive elements have `tabindex` where needed.  
- **Color Contrast**: Meets WCAG AA standards (see color palette below).

### Responsiveness
- **Tailwind Responsive Utilities**: Breakpoints (`sm`, `md`, `lg`) adjust layout—two-column on tablets, cards stack on phones.  
- **Fluid Layouts**: Use percentages, `max-w`, and flex layouts to adapt to any screen size.

## 3. Styling and Theming

### Styling Approach
- **Tailwind CSS**: Utility classes for spacing, typography, colors, and layout.  
- **CSS Variables**: Define theme colors and font sizes in `:root` to allow future light/dark mode toggles.

### Theme Style
- **Style**: Flat, modern design with subtle shadows and rounded corners—clean and minimal.  
- **Font**: “Inter” (Google Font) for a neutral, highly readable typeface.

### Color Palette
| Role           | Name               | HEX     | Tailwind Token  |
| -------------- | ------------------ | ------- | --------------- |
| Primary        | Blue               | #3B82F6 | `blue-500`      |
| Secondary      | Green              | #10B981 | `green-500`     |
| Accent         | Amber              | #F59E0B | `amber-500`     |
| Neutral Text   | Dark Gray          | #374151 | `gray-700`      |
| Background     | Light Gray         | #F3F4F6 | `gray-100`      |
| Border/Divider | Gray               | #E5E7EB | `gray-200`      |

Example CSS variables in `src/app.css`:
```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --color-bg: #F3F4F6;
  --font-base: 'Inter', sans-serif;
}
```

## 4. Component Structure

### Organization
```
src/
 └ lib/
    ├ components/
    │  ├ AddCommissionModal.svelte
    │  ├ CommissionList.svelte
    │  ├ CommissionItem.svelte
    │  ├ SummaryCards.svelte
    │  └ ExportButtons.svelte
    ├ db.ts               # Dexie schema and instance
    ├ stores/
    │   └ commissions.ts  # Svelte store wrapping Dexie operations
    └ utils/
       ├ export.ts
       └ validators.ts
```

### Reusability and Maintenance
- **Single Responsibility**: Each component handles one piece of UI logic.  
- **Props & Events**: Parent pages pass data via props; child components emit events for actions (e.g., `on:addCommission`).  
- **Folder Convention**: Group related files (component, styles, tests) if a feature grows in complexity.

## 5. State Management

### Svelte Stores + Dexie
- **Reactive Store**: In `src/lib/stores/commissions.ts`, create a custom store that:
  1. Loads all commissions from Dexie on initialization.  
  2. Exposes methods: `addCommission(data)`, `updateCommission(id, changes)`, `deleteCommission(id)`.  
  3. Uses Svelte’s `writable` and `derived` to publish both the full list and summary totals.

### Sharing State
- Components subscribe to the store via `$commissions` or `derived` totals.  
- Updates in one component automatically re-render all others that depend on the same data.

## 6. Routing and Navigation

### File-Based Routing (SvelteKit)
- **`src/routes/+layout.svelte`**: Defines the global header, side nav, and `<slot>` for pages.  
- **`src/routes/+page.svelte`**: The main dashboard, including list and summary cards.  
- **Dynamic Routes** (if needed later): e.g. `src/routes/commission/[id]/+page.svelte` for individual commission details.

### Navigation Structure
- **Header**: App name, Add Commission button, theme toggle (future).  
- **Main Content**: Commission list and summary cards on the dashboard.  
- **Modals & Drawers**: Overlays for add/edit forms—opened via state, not separate routes.

## 7. Performance Optimization

### Code Splitting & Lazy Loading
- **Dynamic Imports**: Load heavy components (e.g., `html2canvas` for export) only when needed.  
- **SvelteKit Splitting**: Out-of-the-box bundling splits route code automatically.

### Asset Optimization
- **Tailwind PurgeCSS**: Strips unused classes for a minimal CSS bundle.  
- **Image Compression**: Optimized icons in `static/`.

### PWA & Caching
- **Service Worker**: Caches HTML, JS, CSS, and essential assets for instant loading.  
- **Manifest**: `static/manifest.json` configures icons, name, and “Add to Home Screen” behavior.  

## 8. Testing and Quality Assurance

### Unit Tests
- **Vitest** + **@testing-library/svelte**: Test individual components and stores.  
- **Mock Dexie**: Use an in-memory IndexedDB shim to test store logic.

### Integration Tests
- **SvelteKit Testing**: Render pages with real store and check end-to-end data flow (form → database → UI update).

### End-to-End (E2E)
- **Playwright** or **Cypress**: Automate full workflows—Add Commission, update status, export data, offline mode.

### Linters & Formatters
- **ESLint** with `eslint-plugin-svelte3` for code consistency.  
- **Prettier** for styling.  
- **Stylelint** (optional) for any custom CSS files.

### Accessibility Checks
- **axe-core** automated scans and manual keyboard testing to ensure A11y compliance.

## 9. Conclusion and Overall Frontend Summary

These guidelines provide a clear picture of how DNZwrk’s frontend is built and why each technology and pattern was chosen. By combining SvelteKit’s speed, Dexie’s offline data layer, and a component-based design, we achieve a performant, maintainable, and privacy-first CRM. The use of Tailwind CSS and TypeScript further enhances developer productivity and code safety. Finally, the PWA setup guarantees a seamless mobile experience with offline support.

Together, these elements deliver a modern, user-friendly personal CRM that works entirely in the browser, scales for future online sync, and stays easy to maintain as new features roll in.