# Invento — Frontend Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-3.9-22B5BF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Axios-1.18-5A29E4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" />
</p>

<p align="center">
  <strong>React SPA dashboard for the Invento AI inventory management system.</strong><br/>
  Dark sidebar layout · Role-based UI · JWT auto-refresh · Demand forecast visualization · Skeleton loaders
</p>

---

## What This Is

Invento's frontend is a React single-page application that consumes the Django REST API. It handles authentication, role-based rendering, product and user management, and demand forecast visualization — designed to feel like a real enterprise dashboard (Linear / Vercel inspired), not a tutorial project.

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| react-router-dom | 7 | Client-side routing, protected routes |
| axios | 1.18 | HTTP client with request/response interceptors |
| jwt-decode | 4 | Decode JWT claims client-side (role, username) |
| recharts | 3.9 | Area chart (demand trend) + bar chart (urgency) |
| react-hot-toast | 2 | Non-blocking toast notifications |
| lucide-react | — | SVG icon system |

---

## Project Structure

```
inventory-frontend/
├── public/
│   └── favicon.svg               # Branded box icon (indigo)
├── src/
│   ├── api.js                    # Axios instance: auto-attach token + silent refresh
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth state: user, login, logout, hasRole()
│   ├── components/
│   │   ├── Sidebar.jsx           # Full nav sidebar with role-gated links + Coming Soon items
│   │   ├── ProtectedRoute.jsx    # Route guard: redirect to /login, or show Access Denied
│   │   ├── Skeleton.jsx          # Shimmer skeleton loaders (card, table, text)
│   │   └── Skeleton.css
│   ├── pages/
│   │   ├── Login.jsx             # Split-screen login (brand panel + form)
│   │   ├── Login.css
│   │   ├── Dashboard.jsx         # Greeting, health bar, charts, forecast table, product detail
│   │   ├── Products.jsx          # Product CRUD (role-gated add/edit/delete)
│   │   ├── Users.jsx             # Admin-only user management
│   │   └── AuditLogs.jsx         # Manager+ immutable action history
│   ├── App.jsx                   # App shell: sidebar + topbar + routed page area
│   ├── App.css                   # Full design system (tokens, components, layout)
│   └── index.css                 # Body/root resets, scrollbar styling
```

---

## Features

### Authentication
- JWT login — tokens stored in `localStorage`, role decoded client-side via `jwt-decode`
- Axios request interceptor automatically attaches `Authorization: Bearer <token>`
- Axios response interceptor silently refreshes expired tokens and retries the original request — user never sees a forced logout unless the refresh token has also expired

### Role-Based UI
Three roles with different access levels:

| Feature | Staff | Manager | Admin |
|---|---|---|---|
| Dashboard / Forecasts | ✅ | ✅ | ✅ |
| Products — view | ✅ | ✅ | ✅ |
| Products — add/edit | ❌ | ✅ | ✅ |
| Products — delete | ❌ | ❌ | ✅ |
| Audit Log | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

> Client-side role gating is UX only — all enforcement happens server-side in Django. Even direct API calls are rejected for unauthorized roles.

### Dashboard
- Personalized greeting ("Good morning, Hammad") with time-aware message
- Headline sentence: adapts to show urgency count or "all healthy"
- 4 stat cards (Critical / Low Stock / Healthy / Total) — clickable as status filters
- Inventory health progress bar — green/amber/red based on healthy %
- Area chart (weekly demand trend) + horizontal bar chart (top 8 most urgent)
- AI Daily Brief panel — placeholder with shimmer animation (LLM integration planned)
- Clickable table rows → product detail panel slides in with AI insight text
- Skeleton loaders on all cards and tables

### Other Pages
- **Products** — searchable table with add/edit modal, role-gated actions, toast feedback
- **Users** — admin-only user lifecycle: create, deactivate, reactivate, delete
- **Audit Log** — filterable by action type (create/update/delete)

---

## Local Setup

### Prerequisites
- Node.js 20+
- The backend running at `http://127.0.0.1:8000` — see [Invento backend repo](https://github.com/hammi837/Invento)

### 1. Clone and install

```bash
git clone https://github.com/hammi837/Invento-FE.git
cd Invento-FE
npm install
```

### 2. Configure environment

```bash
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

`.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 3. Start dev server

```bash
npm run dev
```

Open `http://localhost:5173`

### 4. Demo credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `Admin1234!` | Full access |
| `manager` | `Manager1234!` | Products + Audit Log |
| `staff` | `Staff1234!` | Read-only |

Credentials are also available as quick-fill buttons on the login page.

---

## Design System

The UI uses a custom dark design system — no component library, full control:

```
Background layers:
  #0b0d12  →  page background (deepest)
  #0d1017  →  sidebar / topbar
  #14171f  →  panels / cards (float above background)
  #1a1e28  →  hover states / raised inputs

Semantic colors:
  #ef4444  →  Critical (red — used sparingly, high urgency only)
  #f59e0b  →  Warning (amber)
  #22c55e  →  Healthy / OK (green)
  #6366f1  →  Accent (indigo — brand color, repeated in sidebar, buttons, focus rings, ok bars)

Text:
  #e6edf3  →  Headings and values
  #8b949e  →  Body / secondary
  #3d444d  →  Muted / placeholder
```

Indigo is used as the single accent throughout — sidebar active states, primary buttons, input focus rings, "ok" chart bars, product ID pills — creating visual consistency instead of random colors.

---

## Build

```bash
npm run build       # production build → dist/
npm run preview     # preview production build locally
npm run lint        # ESLint
```

---

## Planned Features

- [ ] AI Daily Brief panel — plain-English LLM summary of inventory health
- [ ] AI Assistant page — conversational Q&A ("Which products need ordering?")
- [ ] Purchase Order Approval Queue — Manager/Admin approve AI-drafted restock suggestions
- [ ] Analytics page — demand trends, inventory turnover, forecast accuracy over time
- [ ] Product detail page — full history, forecast chart, inventory movements, audit log per product
- [ ] Skeleton loaders on all remaining loading states
- [ ] Global search (products, users, forecasts, audit log)
- [ ] Toast on login/logout
- [ ] Dark/light mode toggle

---

## Related Repos

- **Backend**: [hammi837/Invento](https://github.com/hammi837/Invento) — Django REST API

---

## License

MIT © 2026 Hammad
