# Expense Tracker

Production-ready full-stack expense tracking application.


A production-quality full-stack expense tracking application built with **Node.js + Express + TypeScript** on the backend and **React + Vite + TypeScript** on the frontend.

## Features

- **Add expenses** with amount (₹), category, description, and date
- **Filter** expenses by category (persisted in URL)
- **Sort** by newest first
- **Total** calculation based on filtered results
- **Idempotent** POST requests — safe retries, no duplicates
- **Loading & error states** throughout the UI
- **Dockerized** with a single `docker-compose up`

## Architecture

```
expense_tracker/
├── backend/               # Express + Prisma + SQLite
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts       # App entry point
│   │   ├── routes/
│   │   │   └── expenses.ts
│   │   ├── middleware/
│   │   │   ├── idempotency.ts
│   │   │   └── errorHandler.ts
│   │   └── lib/
│   │       └── prisma.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── types.ts
│   │   ├── api/
│   │   │   └── expenses.ts
│   │   └── components/
│   │       ├── ExpenseForm.tsx
│   │       ├── ExpenseTable.tsx
│   │       └── CategoryFilter.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Run Locally

### Prerequisites

- Node.js 18+
- npm 9+

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

The API will be available at `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The Vite dev server proxies API requests to the backend.

## Run with Docker

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

To stop:

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

## API Reference

### `POST /expenses`

Create a new expense. Requires `Idempotency-Key` header (UUID).

**Request:**

```json
{
  "amount": 150.50,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-02-18T00:00:00.000Z"
}
```

**Headers:**

```
Idempotency-Key: <uuid>
```

**Response (201):**

```json
{
  "id": "uuid",
  "amount": 150.5,
  "amountPaise": 15050,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-02-18T00:00:00.000Z",
  "createdAt": "2026-02-18T06:10:00.000Z"
}
```

Sending the same `Idempotency-Key` again returns the original response without creating a duplicate.

### `GET /expenses`

Retrieve all expenses, optionally filtered by category.

**Query Parameters:**

| Parameter  | Type   | Description              |
| ---------- | ------ | ------------------------ |
| `category` | string | Filter by category name  |

**Response (200):**

```json
{
  "expenses": [...],
  "total": 1250.75
}
```

Results are always sorted by date descending (newest first). `total` is the sum of the filtered results in rupees.

## Design Decisions

### Money as Integer Paise

All monetary values are stored as **integer paise** (`amountPaise`) to avoid floating-point precision errors. The API accepts and returns `amount` in rupees for convenience, but internally multiplies by 100 and stores as an integer.

### Idempotency Keys

POST requests require an `Idempotency-Key` header. The server stores each key alongside the response. If the same key is sent again (e.g., network retry, double-click), the original response is returned without creating a duplicate record. This makes the system safe under unreliable network conditions.

### URL-Based Filter State

The selected category filter is stored in the URL query string (`?category=Food`). This means:
- Refreshing the page preserves the active filter
- Users can share/bookmark filtered views
- Browser back/forward navigation works intuitively

### SQLite for Simplicity

SQLite is used as the database for zero-configuration setup. Prisma ORM provides type-safe queries and migration management. For production at scale, switching to PostgreSQL requires only changing the Prisma `datasource`.

### Vite Dev Proxy

In development, the Vite dev server proxies `/expenses` and `/health` requests to the backend. This avoids CORS issues and mirrors the production Nginx proxy setup.

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| SQLite | Zero config, single file | No concurrent write scaling |
| In-memory idempotency (DB) | Persistent across restarts | Grows unbounded without cleanup |
| Zod validation | Runtime type safety, clear errors | Extra dependency |
| Client-side UUID | No server coordination needed | Requires `uuid` package |
| Single-file CSS | No build tooling complexity | Less modular than CSS Modules |

## Future Improvements

- **Expense editing & deletion** — PATCH/DELETE endpoints with soft deletes
- **Pagination** — cursor-based pagination for large datasets
- **Authentication** — user accounts with JWT or session-based auth
- **Idempotency key cleanup** — scheduled job to purge keys older than 24 hours
- **PostgreSQL** — swap SQLite for production-grade database
- **E2E tests** — Playwright or Cypress test suite
- **CI/CD** — GitHub Actions pipeline for lint, test, build, and deploy
- **Expense analytics** — charts and spending breakdown by category/month
- **Export** — CSV/PDF export of expense data
- **Dark/light theme toggle** — system preference detection + manual override
