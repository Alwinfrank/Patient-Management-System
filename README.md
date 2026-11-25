# CareDesk Patient Management System

A full stack patient and billing management application. The repository is split into a React/Vite frontend and a NestJS REST API backed by MySQL through Prisma. The app does not process payments.

## Stack and architecture

- Frontend: React, TypeScript, Vite, Redux Toolkit, React Router, Axios, react-hot-toast.
- Backend: Node.js, NestJS, TypeScript, class-validator, JWT bearer authentication, Swagger.
- Data: MySQL, Prisma ORM, migrations and a bcrypt admin/staff seed.
- Payment history: view existing payment records only; payment processing is not available.

`React pages → Redux async thunks → Axios → NestJS controllers/services → Prisma → MySQL`.
The access token is kept in browser local storage and attached to API calls by the Axios interceptor. All patient, bill, dashboard, and payment history routes require a valid JWT.

## Repository layout

```text
frontend/                 React application
  src/api.ts              Axios client and bearer token handling
  src/store.ts            Auth, patient, and billing Redux slices/thunks
  src/ui.tsx              Routes and application pages
backend/                  NestJS API
  prisma/schema.prisma    Four primary data models
  prisma/migrations/      MySQL migrations
  prisma/seed.ts          Securely hashes the configured admin password
  src/                    API controllers, services, guard, bootstrap
```

## Requirements

- Node.js 20 or later and npm.
- MySQL 8 or later.

## Configure and start

1. Create a MySQL database, for example `patient_management`.
2. In `backend`, copy `.env.example` to `.env`; set `DATABASE_URL`, a long random `JWT_SECRET`, and distinct admin and staff emails/passwords. Do not commit `.env`.
3. Install and initialize the API:

   ```sh
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run prisma:seed
   npm test
   npm run start:dev
   ```

   The API listens on port 3000. Swagger UI is at `http://localhost:3000/api/docs`.
4. In another terminal, install and start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. Set `VITE_API_URL` if the API is hosted elsewhere.

The seed requires distinct `ADMIN_EMAIL`/`ADMIN_PASSWORD` and `STAFF_EMAIL`/`STAFF_PASSWORD` values. Both passwords are bcrypt hashed (12 rounds). It creates or resets the configured Admin and Staff accounts. An Admin can create additional staff or admin accounts with `POST /users`; user listing and creation are admin-only.

## Environment variables

See [`backend/.env.example`](backend/.env.example). `DATABASE_URL`, `JWT_SECRET`, and the admin seed credentials are required for a usable deployment. Billing supports invoice creation and tracking; it does not accept payments.

## Database design

There are exactly four primary tables: `User`, `Patient`, `Bill`, and `Payment`. Patient to Bill and Bill to Payment are one-to-many relations. Unique email/order/payment IDs and foreign keys are enforced by MySQL. A patient referenced by a bill and a bill referenced by payments cannot be removed. Monetary values use `Decimal(12,2)`. The bill tax field stores the computed tax amount; the creation API accepts the percentage and computes `tax = amount × rate / 100`, then `total = amount + tax`.

Use `npx prisma migrate dev --name descriptive_name` to create later development migrations. Use `npx prisma migrate deploy` for deployment.

## REST API

Except `POST /auth/login`, routes below require `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate with email/password |
| GET | `/auth/me` | Retrieve the authenticated user profile |
| GET, POST | `/users` | Admin-only list and create user accounts |
| GET, POST | `/patients` | List with `search`/`gender` filters; create patient |
| GET, PATCH, DELETE | `/patients/:id` | Read, update, or remove a patient |
| GET, POST | `/bills` | List bills or create a bill |
| GET, PATCH, DELETE | `/bills/:id` | Read, update, or remove an eligible bill |
| PATCH | `/bills/:id/status` | Mark an invoice `Paid` or `Unpaid` (any signed-in user) |
| GET | `/payments/:id` | Read an existing payment record |
| GET | `/payments/bill/:billId` | Read payment history for a bill |
| GET | `/dashboard` | Live patient and billing summary |

## Payment handling

The app does not process payments. A signed-in user can manually label each invoice `Paid` or `Unpaid`; `Unpaid` is stored internally as `Pending`. Patient and billing reports can be downloaded as CSV files from their list pages.

## Redux

`auth`, `patients`, and `billing` are Redux Toolkit slices. Async thunks call Axios and update loading, data, and error state. Pages dispatch thunks on load and after mutations, while toast messages report operation results. The bearer token is not persisted in Redux Persist; the browser storage token is attached centrally by the API client.

## Backend tests and known setup requirements

Run `cd backend && npm test` for service-level tests of bill calculation, paid-bill protections, patient search filters, and duplicate-email handling. These tests use isolated Prisma mocks and do not require MySQL. Install dependencies and configure MySQL before applying migrations or starting the API. The app has no local mock-data fallback. No screenshots are included yet; capture them after configuring and running the application.
