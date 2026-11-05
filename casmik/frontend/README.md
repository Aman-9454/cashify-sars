# CAMSIK Frontend Web Application

This is the standalone **Frontend** module of the Camsik ReCommerce Platform. It contains all customer-facing, merchant partner, delivery portal, and admin UI pages and components.

---

## Architecture & Responsibilities

- **Pages (`src/app/`):**
  - Customer Storefront & Valuation (`/`, `/sell-device-get-quote`, `/buy-refurbished`, `/exchange-device`)
  - Order Tracking & My Orders (`/track-order`, `/my-orders`)
  - Partner Store & Merchant Hub (`/partner/`)
  - Doorstep Delivery Agent Hub (`/delivery/`)
  - ReCommerce Multi-Tenant Storefronts (`/store/[slug]`)
  - Business Operations Admin Dashboard (`/admin/`, `/super-admin-dashboard/`)
- **Components (`src/components/`, `src/app/components/`):**
  - Modern ReCommerce Bento Grids, Top Deals Carousel, Customer Header & Footer
  - Live Order Tracker, Order Call & Chat Modals
- **Proxy to Backend:**
  - `next.config.mjs` automatically rewrites all `/api/*` calls to the standalone Backend server (`http://localhost:4028`).

---

## Getting Started

### 1. Run Development Server
```bash
cd frontend
npm run dev
```

The frontend runs at **`http://localhost:3000`**.

### 2. Connect to Backend
Make sure the backend is running (`cd ../backend && npm run dev` on port 4028).

