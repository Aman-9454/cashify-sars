# CAMSIK SaaS Super Admin & Multi-Tenant Database Manager

This is the dedicated SaaS Platform Super Admin application for CAMSIK. It allows the SaaS owner to onboard B2B clients, manage isolated MongoDB databases per client, and assign client-wise project templates.

---

## Key Features

1. **Database-Per-Tenant Architecture:**
   - Every client gets their own physically isolated MongoDB database (`casmik_tenant_<slug>`).
   - Zero risk of cross-tenant data leakage.
   - One-click auto-provisioning of categories, brands, and 45-point device valuation diagnostic questions.

2. **Client-Wise Project Templates:**
   - **Modern ReCommerce Pro (`template-modern-buyback`):** Clean trust-focused ReCommerce design with emerald green accents.
   - **CyberTech Dark Edition (`template-dark-tech`):** High-contrast neon cyan and deep dark styling with glassmorphic cards.
   - **Vibrant Marketplace Express (`template-cashify-vibrant`):** High-energy orange/amber ReCommerce retail layout.
   - **Enterprise Minimal Slate (`template-minimal-b2b`):** Corporate IT asset liquidation and bulk B2B trade-in.

3. **Database Health Inspector:**
   - Real-time ping test for each client's database.
   - Live document count for every collection (`categories`, `brands`, `questions`, `orders`, `settings`).
   - One-click re-seed and reset tool.

---

## Directory Structure

```
super_admin/
├── package.json               # Next.js 15, React 19, Tailwind, Lucide, MongoDB
├── tsconfig.json              # TypeScript strict paths
├── next.config.mjs            # Next.js CORS & build config
├── tailwind.config.js         # Tailwind styling
├── postcss.config.js          # PostCSS
├── .env                       # MongoDB cluster & Master DB config
├── .env.example
├── README.md
└── src/
    ├── app/
    │   ├── layout.tsx         # Super Admin root layout
    │   ├── page.tsx           # Full SaaS Super Admin dashboard UI
    │   └── api/
    │       ├── clients/
    │       │   ├── route.ts          # GET all clients, POST create client + auto-provision DB
    │       │   └── [id]/
    │       │       ├── route.ts      # GET client + DB health, PUT update, DELETE
    │       │       └── provision/
    │       │           └── route.ts  # Re-seed diagnostic catalog & test DB
    │       └── templates/
    │           └── route.ts          # Available templates list
    ├── lib/
    │   ├── mongodb.ts         # MongoDB cluster connection pool
    │   ├── types.ts           # Tenant, Branding, Template interfaces
    │   ├── templates.ts       # 4 ReCommerce Templates definition
    │   ├── tenantMaster.ts    # Master DB operations (casmik_saas_platform)
    │   └── tenantDb.ts        # Database-per-tenant provisioning & isolation engine
    └── styles/
        └── globals.css        # Base styles
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd super_admin
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The Super Admin will open at **`http://localhost:4030`**.

---

## Environment Variables (.env)

```env
MONGODB_URI=mongodb+srv://adarshsachan9967_db_user:aQCPwwzcilQGVHhU@camsik.oxiqz3o.mongodb.net
MONGODB_MASTER_DB=casmik_saas_platform
PORT=4030
```

