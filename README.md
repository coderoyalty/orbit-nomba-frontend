# Orbit — Nomba Subscriptions (Frontend)

Multi-tenant recurring-billing UI on top of Nomba's tokenised-card primitives.
Vite + React + TypeScript + TanStack Router + TanStack Query + Tailwind v4.

## Run

```bash
npm install
cp .env.example .env     # points at the backend; defaults to localhost:3000
npm run dev              # http://localhost:5173
```

The TanStack Router Vite plugin generates `src/routeTree.gen.ts` on dev/build;
a copy is committed so the project type-checks on a fresh clone.

## Backend integration

This frontend is wired to the Orbit NestJS backend (`core-api`).

- **Base URL** comes from `VITE_API_URL` (`.env`), default `http://localhost:3000`.
- **Auth is a cookie**, not a bearer token. Login sets an httpOnly `orbit_session`
  cookie server-side; the browser sends it automatically. Every request uses
  `credentials: "include"`. "Logged in?" is resolved by `GET /dashboard/auth/me`.
- **Responses are unwrapped** from the backend envelope
  `{ success, statusCode, message?, data }` → callers get `data` directly
  (see `src/lib/http.ts`).
- **Money is kobo on the wire.** The UI collects naira and converts
  (`nairaToKobo` / `formatNaira`).
- **Intervals** map UI choices to the backend pair `{ interval, interval_count }`:
  monthly→`month,1`, annual→`year,1`, bi-annual→`month,6`, custom→`day,N`.

### The project layer

A tenant **Account** owns **Projects**, and plans / API keys / customers /
subscriptions all live under a project. The UI reflects this:
- `ProjectProvider` + `useProjects` hold the selected project (persisted to
  `localStorage`).
- The sidebar **project switcher** changes the active project; `/app/projects`
  lists them and `/app/projects/new` creates one.
- Plans and API keys are scoped to the selected project. With no project, those
  screens prompt you to create one.

### Wired vs mocked

Wired to the backend now:
- `POST /dashboard/auth/register`, `POST /dashboard/auth/login`,
  `POST /dashboard/auth/logout`, `GET /dashboard/auth/me`
- `GET|POST /dashboard/projects`, `DELETE /dashboard/projects/:id`,
  `POST /dashboard/projects/:id/keys`
- `GET|POST /dashboard/projects/:projectId/plans`

Still mocked (no backend controllers yet) — clearly marked with `TODO` in
`src/lib/api.ts`: subscribers, invoices/ledger, refunds, webhook events, and
the payouts / bank-details flow.

### Backend must enable CORS with credentials

Because auth is a cross-origin cookie, the backend has to allow this origin
**and** credentials, or the cookie is never sent:

```ts
app.enableCors({ origin: "http://localhost:5173", credentials: true });
```

## Layers

- **Layer 1 (tenant dashboard, `/app`, cookie-auth):** overview, projects, plans
  + Plan Builder, subscribers + detail with manual refund, billing engine
  (state machine + ledger), dunning, invoices, API keys, webhooks, payouts.
- **Layer 2 (end-user, public, token-based, tenant-branded):**
  `/checkout/$session`, `/portal` (magic-link gate), `/portal/$token`,
  `/recover/$token`.
