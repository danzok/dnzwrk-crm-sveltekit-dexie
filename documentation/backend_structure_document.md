# DNZwrk Backend Structure Document

This document explains how the DNZwrk personal CRM handles data behind the scenes, from its local database in the browser to the future-ready server endpoints. It uses simple language so anyone can understand how the system is built, hosted, and maintained.

## 1. Backend Architecture

DNZwrk’s backend is designed around two main ideas:

1. **Local-First Data Layer**
   - The entire database lives in your web browser, thanks to Dexie.js on top of IndexedDB. All reads and writes happen locally, so the app is extremely fast and works offline.
   - A set of reactive Svelte stores wraps this local database. Stores keep the user interface in sync with the data automatically—any change you make immediately shows up on screen.

2. **Future Online Sync (Optional)**
   - If you choose to add an online component later, DNZwrk is already set up with SvelteKit API routes (in `src/routes/api`).
   - These server endpoints can receive local changes, push them to a central database, and send updates back to the app when you’re online.

How this supports our goals:

- **Scalability**: Browser database scales with your device storage. When you add real server endpoints, they can scale automatically using serverless functions.
- **Maintainability**: All data logic is in one place (the Dexie-based stores), making it easy to debug or extend.
- **Performance**: Local reads and writes mean near-instant feedback, and the PWA shell caches assets for fast load times.

## 2. Database Management

At the heart of DNZwrk’s data layer is **Dexie.js**, a user-friendly wrapper over the browser’s native **IndexedDB**. Here’s how it works:

- **Type**: NoSQL-like storage inside the browser.
- **Data Storage**: All commission records are stored on the device—no external servers or cloud storage involved by default.
- **Data Structure**: Each record (commission) is an object with fields like title, client, amount, status, and timestamp.
- **Data Access**:
  - Dexie provides a promise-based API (`db.commissions.add()`, `db.commissions.toArray()`, etc.)
  - Svelte stores call these Dexie methods, then broadcast changes so UI components update automatically.
- **Data Management Practices**:
  - Wrap all database calls in try/catch to handle errors (disk full, browser limits).
  - Version your schema (Dexie’s `version(1).stores(...)`) so you can upgrade safely in future releases.

## 3. Database Schema

Below is the human-friendly view of the commission record structure. We also include the exact Dexie setup (which mirrors a simple SQL table layout).

Human-Readable Fields:
- **id** (auto-generated number)
- **title** (text describing the commission)
- **client** (text for the client’s name)
- **amount** (numeric value of the commission)
- **status** (one of: pending, completed, cancelled)
- **createdAt** (date and time when the record was created)

Dexie (IndexedDB) Definition in TypeScript:
```typescript
this.version(1).stores({
  // ++id: auto-increment primary key
  // title, status, createdAt: indexed for fast searches
  commissions: '++id, title, status, createdAt'
});
```

If this were SQL, the equivalent PostgreSQL table might look like:
```sql
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_created_at ON commissions(created_at);
```

## 4. API Design and Endpoints

Currently, DNZwrk operates fully offline with no remote API calls. However, the structure is in place to add server endpoints when you’re ready for online sync. The design follows SvelteKit’s file-based routing for RESTful API routes.

Key Endpoint (Future):

- **POST /api/sync**
  - Purpose: Receive a batch of local changes (add/update/delete) from the client.
  - Request Body: A list of commission objects with an operation type.
  - Response: Status of each operation and any new data from the server.

Additional Endpoints (Possible Additions):
- **GET /api/commissions**: Fetch all commissions from the server-side store.
- **POST /api/commissions**: Add a new commission.
- **PATCH /api/commissions/:id**: Update status or fields of a commission.
- **DELETE /api/commissions/:id**: Remove a commission.

How It Works:
- The client collects local changes in Dexie and posts them to `/api/sync` when online.
- The server applies them to a central database and returns any updates the client doesn’t have.
- The client merges those updates back into IndexedDB.

## 5. Hosting Solutions

Even without a remote database, DNZwrk’s code needs a place to live. We recommend a modern cloud platform that supports static sites and serverless functions—examples:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**

Benefits:

- **Reliability**: Automatic global CDN distribution of your static assets and API functions.
- **Scalability**: Serverless functions scale to handle sync requests without manual setup.
- **Cost-Effectiveness**: Free tiers for small projects, pay-as-you-go for growth.
- **Developer Experience**: Git integration (push-to-deploy), easy environment variables management.

## 6. Infrastructure Components

To deliver fast, reliable experiences, DNZwrk uses the following behind the scenes:

- **Content Delivery Network (CDN)**
  - Caches the PWA shell (HTML, CSS, JS) close to users for instant load times.
- **Service Worker**
  - Caches static assets and manages offline availability of the app.
- **Serverless Functions**
  - Host the `/api` routes, scaling automatically and charging only on usage.
- **Browser Caching**
  - Uses service worker and HTTP cache headers to store images, scripts, and other assets.

These components work together to:
- Ensure the app loads quickly anywhere in the world.
- Keep it running offline or on unreliable networks.
- Handle spikes in usage without downtime.

## 7. Security Measures

Even though DNZwrk keeps data private in the browser by default, any future online sync needs safeguards:

- **HTTPS Everywhere**: All assets and API calls must go over secure HTTPS.
- **Authentication & Authorization**
  - Secure endpoints with API keys or JSON Web Tokens (JWT) so only authorized clients can sync.
- **Data Encryption**
  - SSL/TLS in transit for all API traffic.
  - (Optional) Encrypt sensitive fields at rest on the server.
- **Input Validation**
  - Sanitize and validate all incoming data in serverless functions to prevent malformed or malicious content.
- **CORS Policy**
  - Restrict which domains can call the API, preventing unwanted third-party access.

## 8. Monitoring and Maintenance

To keep DNZwrk running smoothly, set up:

- **Error Tracking**
  - Tools like Sentry or LogRocket to capture and alert on runtime errors in both service worker and serverless functions.
- **Performance Monitoring**
  - Vercel Analytics or Google Lighthouse to track load times, cache hit rates, and PWA performance scores.
- **Automated Testing & CI/CD**
  - GitHub Actions or similar to run unit tests (for your data stores and validation logic) on every push.
- **Dependency Updates**
  - Dependabot or Renovate to keep Dexie, SvelteKit, and other libraries up-to-date.
- **Backup Strategy**
  - (If using a remote database) Schedule daily exports of your server database to guard against data loss.

## 9. Conclusion and Overall Backend Summary

DNZwrk’s backend is intentionally simple today yet built for tomorrow:

- **Local-First**: Dexie.js in the browser provides fast, private, offline-capable storage with automatic UI updates via Svelte stores.
- **Ready for Sync**: SvelteKit API routes stand by to become real server endpoints without any major rework.
- **Modern Hosting**: A cloud platform like Vercel offers CDN delivery, serverless scaling, and developer-friendly deployments.
- **Solid Infrastructure**: Service workers, CDNs, and serverless functions work in harmony to give users a snappy, reliable PWA.
- **Security and Monitoring**: Built-in HTTPS, future-friendly auth, and observable operations ensure your data remains safe and your app stays healthy.

With this structure, DNZwrk meets its core goals—local speed, total privacy, and an upgrade path to an online CRM service when you decide to grow. Feel confident that the backend is robust, clear, and ready to scale with your needs.