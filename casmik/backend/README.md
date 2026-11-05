# CAMSIK Backend API Server & Database Engine

This is the standalone **Backend** module of the Camsik ReCommerce Platform. It provides REST APIs, multi-tenant MongoDB database management, authentication, and logistics services.

---

## Architecture & Responsibilities

- **APIs (`src/app/api/`):**
  - Device Buyback, Valuation & 45-Point Diagnostics (`/api/questions`, `/api/models`, `/api/orders`)
  - Certified Refurbished Catalog (`/api/refurbished`)
  - Merchant Partner Wallet & Commissions (`/api/partners`, `/api/payouts`)
  - Doorstep Delivery Agent Dispatch (`/api/delivery`, `/api/delivery-agents`)
  - SaaS Multi-Tenant Engine (`/api/saas/clients`, `/api/saas/templates`)
- **Database (`src/lib/mongodb.ts`, `src/lib/saas/tenantDb.ts`):**
  - Dedicated MongoDB Database per Client
  - Dynamic connection pool with MongoDB Atlas
- **Storage & Auth:**
  - ImageKit integration (`src/lib/imagekit.ts`)
  - Supabase Auth SSR (`src/lib/supabase/`)

---

## Getting Started

### 1. Run Development Server
```bash
cd backend
npm run dev
```

The API server runs at **`http://localhost:4028`**.

### 2. Endpoints Health Check
Open `http://localhost:4028` in your browser to verify server status.

