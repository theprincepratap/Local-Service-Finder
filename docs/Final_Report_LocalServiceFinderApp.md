# LocalServiceFinderApp — Final Report

---

Title: LocalServiceFinderApp — Local Services Finder

Author: theprincepratap (project owner)

Date: November 4, 2025

Version: 1.0

---

## Table of Contents

1. Title Page .............................................................. 1
2. List of Contents ......................................................... 2
3. Abstract ................................................................. 3
4. Introduction ............................................................. 4
5. Problem Definition & Objectives ......................................... 5
6. Dataset & Preprocessing ................................................ 6
7. Methodology / Models / Algorithms Used .................................. 8
8. Implementation Details ..................................................10
9. Code (key snippets & files) .............................................14
10. Results, Screenshots & Discussion ......................................17
11. Conclusion & Future Work ..............................................20
12. References ............................................................22

---

## Abstract (150 words)

LocalServiceFinderApp is a full-stack web application that connects local service providers (workers) with customers who need on-demand home services. The system uses a unified WorkerUser model to store worker profiles, skill sets, geolocation, availability and pricing. The backend is implemented with Node.js, Express and MongoDB using Mongoose; the frontend is a React application (Vite) with Zustand for lightweight auth state. Core features include geospatial search using MongoDB 2dsphere indexes (fast $geoNear queries), JWT-based authentication, role-aware routes (user/worker/admin), and an integrated booking flow with real-time status updates. The project emphasizes usability: search filters, per-worker cards, booking wizard, and worker dashboard for managing active requests. Key engineering challenges addressed were duplicate 2dsphere index cleanup, ensuring the search used the correct WorkerUser model, and connecting the frontend "Book Now" flows to the booking API. This report summarizes dataset and preprocessing, chosen algorithms, implementation details, code references, results and suggestions for future improvements.

---

## 1. Introduction

LocalServiceFinderApp is designed to make hiring local service professionals (plumbers, electricians, carpenters, painters, cleaners, etc.) simple and fast. The system has two main user types:

- Customers (role: `user`): search workers, view profiles, and make bookings.
- Workers (role: `worker`): register, set availability, accept/decline bookings and manage jobs.

An Admin role exists for moderation and approvals.

The application aims to reduce friction in discovering nearby verified workers and streamlines the booking lifecycle with a clear API-driven backend.

---

## 2. Problem Definition & Objectives

Problem Statement
- Customers need an efficient way to find trusted local workers close to their location.
- Workers require a simple interface to manage requests and bookings.

Primary Objectives
- Implement an accurate geospatial search to return nearby, approved workers.
- Provide a straightforward booking flow with seller (worker) acceptance and lifecycle management.
- Keep authentication secure and role-aware using JWT.
- Provide a responsive UI for both customers and workers.

Success Criteria
- Search returns relevant nearby workers with distance and sorted by match/ratings/price.
- Bookings created from the UI are persisted in the database with correct relations (user, worker).
- Workers can accept/decline jobs and update status to in-progress and completed.

---

## 3. Dataset & Preprocessing

Dataset Description
- The application uses MongoDB collections rather than flat files. Primary collections used during development:
  - `users` — stores customers and admins
  - `workerusers` — unified worker profiles (previously there was confusion with a separate `Worker` model; `WorkerUser` is the canonical model)
  - `bookings` — booking records linking `user` and `workeruser`
  - `reviews`, `payments` and other supporting collections

Key fields in `WorkerUser` (abbreviated):
- `_id` (ObjectId)
- `name`, `email`, `phone`
- `role` ("worker")
- `categories`, `skills`, `experience`, `pricePerHour`
- `location` (GeoJSON Point): `{ type: 'Point', coordinates: [lon, lat], city, state, address }`
- `availability`, `approvalStatus`, `isActive`, `rating`

Preprocessing & Data Hygiene
- Indexing: A single `2dsphere` index on `location` is required for geospatial queries: `workerUserSchema.index({ location: '2dsphere' })`.
- Duplicate index cleanup: During development we encountered duplicate 2dsphere indexes (created via in-field index and explicit schema index). A cleanup script was executed to drop duplicate indexes and keep a single `location` 2dsphere index.
- Sanitization: Inputs are validated on backend controllers using checks and defensive coding (ObjectId validation, type casting for numeric values).
- Privacy-sensitive fields: `password`, reset tokens, and bank details are excluded from API responses using `.select('-password -resetPasswordToken -resetPasswordExpire -bankDetails')`.

Data Generation & Test Data
- Several test worker accounts were created in the dev database. A small helper script exists under `backend/scripts/createTestWorker.js` for inserting sample WorkerUser documents (use with caution on production). The `check-worker-ids.js` script lists workers and was used during debugging.

---

## 4. Methodology / Models / Algorithms used

Architecture Overview
- Client: React + Vite; state using Zustand (`useAuthStore`); routing with React Router v6; UI components styled using Tailwind CSS classes.
- Server: Node.js + Express. REST API endpoints under `/api/*`.
- Database: MongoDB Atlas with Mongoose ODM.
- Auth: JWT tokens issued at login, used in `Authorization: Bearer <token>` header; backend `protect` middleware verifies tokens and attaches user (searches `User`, then `WorkerUser`, then `Admin`).

Key Models
- `WorkerUser` model: single source of truth for worker info. Indexed geospatially.
- `Booking` model: references `user` and `workerId` (ref: `WorkerUser`). Booking lifecycle states include `pending`, `confirmed` (or `accepted`/`confirmed`), `in-progress`, `completed`, and `cancelled`.

Geospatial Search
- Primary query: MongoDB aggregation with `$geoNear` to get documents sorted by distance: the app constructs `$geoNear` and uses `distanceField: 'distance'`, `spherical: true`, and `maxDistance` in meters.
- Fallback: If geospatial aggregation returns 0 results (e.g., workers don't have coordinates), the controller performs a broader `find()` fallback and computes distance client-side using haversine formula.
- Distance units: coordinates are [longitude, latitude]. Distances are returned as numeric values (not strings) to allow `.toFixed()` on frontend.

Booking Lifecycle
- User creates a booking via `POST /api/bookings` with payload containing `workerId`, `serviceType`, `scheduledDate`, `scheduledTime`, `estimatedDuration`, `location` (GeoJSON) and `totalPrice`.
- Worker receives pending request and can accept (`updateBookingStatus` to `confirmed`) or decline (`cancelled`).
- Worker starts job (`in-progress`) and completes (`completed`). Controller updates availability/earnings accordingly.

Algorithms & Libraries
- Geospatial: MongoDB 2dsphere index + $geoNear aggregation.
- Distance calculation: Haversine formula used as fallback.
- Sorting: smartSort and sortByDistance helper utilities were implemented for ranking results.

---

## 5. Implementation Details

Project Structure (relevant files)
- `backend/`
  - `server.js` — app bootstrap
  - `routes/worker.routes.js` — worker-related routes
  - `controllers/worker.controller.js` — worker CRUD, profile, getWorkerById (updated to use `WorkerUser`), availability
  - `controllers/search.controller.js` — `$geoNear` implementation for `search/nearby-workers`
  - `controllers/booking.controller.js` — booking lifecycle and worker actions
  - `models/WorkerUser.model.js` — unified worker schema with `location` and `workerUserSchema.index({ location: '2dsphere' })`
  - `models/Booking.model.js` — booking schema referencing `WorkerUser`
  - `middleware/auth.middleware.js` — JWT validation and cross-collection user lookup (User -> WorkerUser -> Admin)
  - `scripts/cleanup-indexes.js` — utility to drop duplicate 2dsphere indexes
  - `scripts/check-worker-ids.js`, `scripts/createTestWorker.js` — dev utilities

- `frontend/`
  - `src/pages/WorkerSearch.jsx` — search page; updated to 3-column card layout and profile images
  - `src/pages/BookingPage.jsx` — booking wizard (3-step flow) with stable typing fix (useEffect dependency fixed)
  - `src/pages/WorkerDashboard.jsx` — worker dashboard with Accept/Decline/Start/Complete actions and `PendingRequestsCard`
  - `src/services/apiService.js` — `bookingService.updateBookingStatus()` used by the dashboard actions
  - `src/store/authStore.js` — Zustand store with user/token

Notable Fixes & Decisions
- Replaced old `Worker` model usage with `WorkerUser` across controllers and booking flow. This resolved many 404s where controllers looked up a non-existent model.
- Fixed BookingPage re-render/typing problem by constraining the initial `useEffect` to run once on mount (prevented repeated calls while typing).
- Resolved duplicate 2dsphere index error by removing inline index definitions and keeping a single explicit `workerUserSchema.index({ location: '2dsphere' })`. Ran `cleanup-indexes.js` to drop duplicates.
- Ensured `distance` returned from `$geoNear` is numeric (parseFloat) so that the frontend can format it using `.toFixed()`.

Security Considerations
- JWT tokens validated in `protect` middleware. Middleware now searches `User`, then `WorkerUser`, then `Admin` collections and attaches the found document as `req.user`.
- Sensitive fields omitted from responses.
- Rate-limiting and other production hardening (CORS policies, helmet, input validation) should be added before production deployment.

---

## 6. Code (key snippets & files)

This section highlights the most relevant code snippets and the files to inspect.

1) WorkerUser schema (excerpt) — `backend/models/WorkerUser.model.js`

```javascript
// index declaration (single 2dsphere index)
workerUserSchema.index({ location: '2dsphere' });

// location field (GeoJSON)
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [lon, lat]
    default: [0, 0]
  },
  address: String,
  city: String,
  state: String,
  pincode: String
},
```

2) Geospatial search (excerpt) — `backend/controllers/search.controller.js`

```javascript
const geoNearQuery = {
  $geoNear: {
    near: { type: 'Point', coordinates: [lon, lat] },
    distanceField: 'distance',
    maxDistance: maxDistance * 1000,
    spherical: true,
    query: query
  }
};

let workers = await WorkerUser.aggregate([geoNearQuery, { $project: { password: 0 } }]);

// ensure numeric distance
workers = workers.map(w => ({ ...w, distance: parseFloat(w.distance) }));
```

3) Booking status update (API service) — `frontend/src/services/apiService.js`

```javascript
export const bookingService = {
  updateBookingStatus: async (id, status, rejectionReason) => {
    const response = await api.put(`/bookings/${id}/status`, { status, rejectionReason });
    return response.data;
  }
};
```

4) Worker dashboard action example (accept job handler) — `frontend/src/pages/WorkerDashboard.jsx`

```javascript
const handleAcceptJob = async (jobId) => {
  try {
    setProcessingJobId(jobId);
    const { bookingService } = await import('../services/apiService');
    await bookingService.updateBookingStatus(jobId, 'confirmed');
    toast.success('Job accepted successfully!');
    fetchJobs();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to accept job');
  } finally {
    setProcessingJobId(null);
  }
};
```

5) Booking creation payload (frontend) — `frontend/src/pages/BookingPage.jsx`

```javascript
const bookingData = {
  workerId: workerId,
  serviceType: formData.serviceType,
  description: formData.description,
  scheduledDate: formData.scheduledDate,
  scheduledTime: formData.scheduledTime,
  estimatedDuration: Number(formData.estimatedDuration),
  location: { type: 'Point', coordinates: [lon, lat], address, city, state, pincode },
  totalPrice: Number(totalPrice.toFixed(2))
};
```


Notes: The full codebase is in the repository — inspect the files listed in the Implementation Details section for the complete implementation.

---

## 7. Results, Screenshots & Discussion

Results Summary
- Search: returns relevant nearby workers (tested with 9 approved workers in dev DB). Search supports category, rating and price filters.
- Booking flow: user can create bookings; workers receive pending requests and can accept/decline via dashboard; status transitions function: `pending` → `confirmed` → `in-progress` → `completed`.
- Worker dashboard: added Accept/Decline/Start/Complete actions and a Pending Requests card in the Overview.

Known Issues (addressed and fixed during development)
- 404 errors when fetching worker by id: root cause was references to a non-existent `Worker` model — fixed by switching to `WorkerUser`.
- Duplicate 2dsphere indexes caused MongoDB errors — cleaned up with `cleanup-indexes.js` and schema fix.
- BookingPage input lag while typing: caused by `useEffect` dependency re-runs; fixed by running the effect only once on mount.

Screenshots (placeholders)
- Insert screenshots into `docs/screens/` and reference them here. Example placeholders:
  - `docs/screens/worker_search_grid.png` — Search results (3-column worker cards)
  - `docs/screens/booking_form.png` — Booking page step 1 (form)
  - `docs/screens/booking_confirmation.png` — Confirmation page
  - `docs/screens/worker_dashboard_pending.png` — Worker dashboard pending requests

Add screenshots by placing PNG files into `docs/screens/` and use markdown image tags, e.g.:

```markdown
![Worker Search Grid](screens/worker_search_grid.png)
```

Discussion
- UX: The 3-column card layout improves scannability on desktop. Cards are responsive on mobile (1 column).
- Performance: Geospatial queries are efficient when the `2dsphere` index is correct. For large datasets, consider adding pagination at aggregation level (using `$facet`) and precomputing matchScore components.
- Reliability: Booking lifecycle is driven by status updates via `bookingService.updateBookingStatus`. Future work should add webhooks/real-time notifications (Socket.io / push notifications) for instant worker notifications.

---

## 8. Conclusion & Future Work

Conclusion
- LocalServiceFinderApp provides a working prototype of a location-aware marketplace for local service providers and customers. Core features (search, booking, worker management) are implemented and tested on development data.

Future Work (prioritized)
1. Real-time notifications: integrate WebSockets (Socket.io) so bookings and status updates are pushed instantly.
2. Payments integration: add secure payment gateway and handle refunds, escrow and payout flows for workers.
3. Improved matching: implement a better matchScore algorithm combining distance, rating, price and availability with weights and machine learning recommendations.
4. Admin tools: implement moderation dashboards, worker verification workflows and analytics.
5. Testing & CI: add unit tests for backend controllers + integration tests for critical flows, then add GitHub Actions CI.
6. Production hardening: add rate limiting, input sanitization (stronger validation), helmet, HTTPS enforcement and monitoring.

---

## 9. References

- MongoDB Geospatial Queries: https://docs.mongodb.com/manual/geospatial-queries/
- Mongoose Documentation: https://mongoosejs.com/docs/guide.html
- JSON Web Tokens (JWT): https://jwt.io/introduction/
- React: https://reactjs.org/
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/

---

## Appendix — How to export to PDF

1. From VS Code: open `docs/Final_Report_LocalServiceFinderApp.md` and use a markdown-to-pdf extension (e.g., "Markdown PDF") to export.
2. From command line: use `pandoc` to convert: (install pandoc first)

```powershell
pandoc docs/Final_Report_LocalServiceFinderApp.md -o Final_Report_LocalServiceFinderApp.pdf --from markdown
```

3. After exporting, open the PDF and update final page numbers if necessary.

---

If you'd like, I can:
- Insert actual screenshots (I can produce the exact filenames and placeholder tags; you'll need to paste images into `docs/screens/`),
- Add a few more code extracts or unit test examples,
- Produce a PDF export in the repo (if you want me to run `pandoc` locally I can provide the commands), or
- Generate a shorter executive summary or presentation slide deck.

Which follow-up would you like next?