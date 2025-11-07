# Project Requirements Document (PRD)

## 1. Project Overview

DNZwrk is a local-first personal CRM built as a Progressive Web App (PWA) that lives entirely in the user’s browser. It focuses on managing commissions and tasks with full CRUD (Create, Read, Update, Delete) capabilities, an always-on reactive dashboard, and flexible data export options. By leveraging SvelteKit for a high-performance UI and Dexie.js (IndexedDB) for offline storage, DNZwrk guarantees fast load times, instant data access, and total privacy—no data ever leaves the device unless the user chooses to export or sync in a future version.

The key objective is to deliver a turnkey personal CRM where users can track commission details—title, client, amount, status, and timestamps—without worrying about internet connectivity or data leaks. Success is measured by seamless offline operation, real-time summary updates, intuitive data exports (JSON, WhatsApp share, PNG snapshots), and a mobile-first experience with “Add to Home Screen” functionality. Future phases will focus on optional online synchronization, but the initial release must excel in speed, usability, and local-only data control.

---

## 2. In-Scope vs. Out-of-Scope

**In-Scope (MVP Features)**
- Commission CRUD: add, view, edit, delete records with fields (title, client, amount, status, createdAt).
- Reactive Dashboard: summary cards that auto-update totals (pending, completed, overall).
- Local-First Storage: all data stored in-browser via Dexie.js and IndexedDB.
- PWA Setup: manifest.json, service worker caching, `Add to Home Screen` prompt support.
- Export Functionality:
  - Download full commission list as a JSON file.
  - Share summary text via WhatsApp deep-link.
  - Capture dashboard or list as a PNG image using html2canvas.
- Mobile-First Design: responsive layout optimized for small screens, scalable to larger viewports.

**Out-of-Scope (Later Phases)**
- Real-time online synchronization or backend API (server-side storage).
- User authentication or multi-user support.
- Advanced reporting (charts beyond basic summaries).
- Role-based permissions or team collaboration features.
- Integration with third-party CRMs or external services beyond exports.

---

## 3. User Flow

A new user installs DNZwrk via the PWA prompt or visits the web app and is greeted by a clean dashboard showing summary cards (total commissions, pending amount, completed amount) and a prominent “Add Commission” button in the header or floating action position. Tapping or clicking that button opens a modal form where they can enter the commission title, client name, amount, and select a status (pending, completed, or cancelled). Submitting the form saves the data to IndexedDB, automatically closes the modal, and refreshes both the commission list and summary cards with the new entry.

From the dashboard, the user can scroll through the Commission List, where each item shows key details and quick actions: toggle status, edit, or delete. The reactivity of Svelte stores ensures changes instantly reflect across the UI without manual reloads. For sharing or backup, the user taps the Export button group—choosing either JSON download, WhatsApp share, or PNG snapshot—which triggers the corresponding utility under the hood (JSON.stringify, whatsapp:// URL scheme, or html2canvas snapshot). All primary screens and modals work offline, and any cached assets load instantly thanks to the service worker.

---

## 4. Core Features

- **Commission Management**
  - Create, read, update, delete entries.
  - Data model: id (auto-increment), title, client, amount (number), status, createdAt (Date).
- **Reactive Dashboard**
  - Summary cards for totals (all, pending, completed).
  - Uses Svelte derived stores for automatic recalculation.
- **Local-First Storage**
  - Dexie.js wrapper on IndexedDB.
  - All operations (`addCommission`, `updateCommission`, `deleteCommission`) in a custom Svelte store.
- **PWA Support**
  - `manifest.json` for app metadata (name, icons, display).
  - Service worker to cache app shell and assets.
  - Prompt `Add to Home Screen` on supported devices.
- **Data Export Utilities**
  - JSON download via `JSON.stringify` and Blob.
  - WhatsApp share via `whatsapp://send?text=` URL.
  - PNG export via `html2canvas`, triggering a download.
- **Mobile-First UI**
  - Responsive layout using Tailwind CSS (or SCSS).
  - Accessible modals, buttons, and form controls.

---

## 5. Tech Stack & Tools

- **Frontend Framework**: SvelteKit (TypeScript)
- **Local Database**: Dexie.js (wrapper around IndexedDB)
- **Styling**: Tailwind CSS (mobile-first, utility classes)
- **PWA Support**: Vite/SvelteKit adapters, custom `manifest.json`, service worker (`src/service-worker.ts`)
- **Utilities & Libraries**:
  - html2canvas (PNG export)
  - zod (optional, for form validation schemas)
- **IDE & Plugins**:
  - Visual Studio Code
  - Svelte for VS Code extension
  - TypeScript ESLint & Prettier for linting/formatting

---

## 6. Non-Functional Requirements

- **Performance**: 
  - Initial load under 1 second on mobile data.
  - Summary recalculation under 10ms for up to 1,000 records.
- **Offline Reliability**:
  - Full UI and data operations must function without network.
  - Service worker should cache all static assets.
- **Security & Privacy**:
  - No data transmission unless exporting via user action.
  - IndexedDB storage secured by browser sandbox.
- **Usability & Accessibility**:
  - Comply with WCAG AA for color contrast and focus management.
  - Keyboard and screen-reader support for forms and modals.

---

## 7. Constraints & Assumptions

- **Browser Support**:
  - Modern evergreen browsers (Chrome, Safari, Firefox, Edge).
  - IndexedDB and service workers must be available.
- **Offline-First**:
  - Assumes user grants install prompt and accepts caching.
- **Storage Limits**:
  - IndexedDB quota varies—assume up to 50MB safe for text data.
- **Future Sync**:
  - The architecture presumes eventual server API endpoints in SvelteKit.

---

## 8. Known Issues & Potential Pitfalls

- **IndexedDB Quota Exceeded**:
  - Catch `QuotaExceededError` in Dexie operations and notify user to delete old entries.
- **Service Worker Cache Invalidation**:
  - Implement versioning strategy in service worker to avoid stale assets.
- **WhatsApp URL Restrictions**:
  - Deep-link may fail if WhatsApp isn’t installed; provide fallback instructions.
- **PNG Export Complexity**:
  - html2canvas might not capture web fonts or complex CSS; limit export scope to summary card container.
- **Form Validation Edge Cases**:
  - Use zod or custom checks to prevent negative amounts or empty fields.


---

This PRD serves as the definitive guide for building DNZwrk’s MVP. Every feature, flow, and technical choice is laid out to ensure the AI-driven technical documents (Tech Stack, Frontend Guidelines, Backend Structure, etc.) can be generated without ambiguity.