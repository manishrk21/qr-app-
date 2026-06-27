# MENUFLOW SaaS — Complete Architecture Document
## Part 1: Overview, Technology Stack, and Folder Structure

---

## 1. System Overview

**MenuFlow** is a multi-tenant, contactless restaurant ordering SaaS. A single shared codebase serves hundreds of independent restaurants. Each restaurant is a **tenant**. All data is isolated by `restaurant_id` enforced at the database layer via Row-Level Security (RLS). Customers never install an app — they scan a QR code, receive an OTP, and order.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUBLIC INTERNET                          │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
     ┌───────▼────────┐                ┌────────▼────────┐
     │  Vercel (CDN)  │                │  Vercel (CDN)   │
     │  Landing Site  │                │  Customer App   │
     │  /             │                │  /r/[slug]      │
     └───────┬────────┘                └────────┬────────┘
             │                                  │
     ┌───────▼──────────────────────────────────▼────────┐
     │              Next.js 14 App Router                 │
     │   (Single monorepo deployed to Vercel)             │
     │                                                    │
     │  /app/(marketing)   — public landing pages         │
     │  /app/(customer)    — QR scan → order flow         │
     │  /app/(admin)       — restaurant dashboard         │
     │  /app/api           — API Route Handlers           │
     └───────────────────────┬────────────────────────────┘
                             │ HTTPS only
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌───────▼──────┐  ┌───▼──────────────┐
     │  Supabase  │  │    Render    │  │   Supabase       │
     │  Auth      │  │  Node/Express│  │   Storage        │
     │  Database  │  │  Worker      │  │   (images)       │
     │  Realtime  │  │  (OTP, jobs) │  │                  │
     └────────────┘  └──────────────┘  └──────────────────┘
```

### Why This Split

| Concern | Service | Reason |
|---|---|---|
| SSR, routing, API routes | Vercel / Next.js | Edge-optimized, zero cold starts for pages |
| OTP dispatch, cron jobs | Render (Node worker) | Long-running tasks not suited for Vercel functions |
| Auth, DB, Realtime | Supabase | Postgres + RLS + websockets in one managed service |
| Image storage | Supabase Storage | Signed URLs, per-tenant buckets, built-in CDN |

---

## 2. Technology Stack (Pinned Versions)

### Frontend / Full-Stack Framework
| Package | Version | Purpose |
|---|---|---|
| next | 14.2.x | App Router, Server Actions, API Routes |
| react | 18.3.x | UI |
| typescript | 5.4.x | Type safety throughout |
| tailwindcss | 3.4.x | Utility CSS |
| @supabase/ssr | 0.3.x | Supabase client with cookie auth for Next.js |
| @supabase/supabase-js | 2.43.x | Supabase client |
| zustand | 4.5.x | Client state (cart, session) |
| react-query / @tanstack/react-query | 5.x | Server state, caching, invalidation |
| zod | 3.23.x | Schema validation (shared between client and API) |
| react-hook-form | 7.51.x | Form management |
| next-seo | 6.x | SEO metadata |
| qrcode | 1.5.x | QR code generation (server-side) |
| sharp | 0.33.x | Image optimization on upload |
| date-fns | 3.x | Date manipulation |
| nanoid | 5.x | Secure token/ID generation |

### Backend Worker (Render — Node.js 20)
| Package | Version | Purpose |
|---|---|---|
| express | 4.19.x | HTTP server |
| @supabase/supabase-js | 2.43.x | DB access with service role key |
| twilio OR msg91 | latest | OTP SMS dispatch |
| node-cron | 3.x | Cleanup jobs |
| ioredis | 5.x | Rate limiting state (via Upstash Redis) |
| zod | 3.23.x | Input validation |
| helmet | 7.x | Security headers |
| express-rate-limit | 7.x | Per-IP rate limiting |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase Postgres (15) | Primary database, RLS, triggers |
| Supabase Auth | Admin JWT auth (email/password) |
| Supabase Realtime | Live order updates, menu availability push |
| Supabase Storage | Menu images, QR codes |
| Upstash Redis | Rate limiting, OTP attempt counters |
| Vercel | Next.js hosting, edge CDN |
| Render | Node worker for OTP + cron |
| Resend | Transactional email (admin welcome, invoices) |

---

## 3. Monorepo Folder Structure

```
menuflow/
├── apps/
│   ├── web/                          # Next.js 14 App (Vercel)
│   │   ├── app/
│   │   │   ├── (marketing)/          # Public landing pages — no auth
│   │   │   │   ├── page.tsx          # Homepage
│   │   │   │   ├── about/page.tsx
│   │   │   │   ├── contact/page.tsx
│   │   │   │   ├── list-your-cafe/page.tsx
│   │   │   │   ├── coming-soon/page.tsx
│   │   │   │   ├── privacy-policy/page.tsx
│   │   │   │   ├── terms-of-service/page.tsx
│   │   │   │   ├── cookie-policy/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (customer)/           # Customer ordering flow
│   │   │   │   ├── r/
│   │   │   │   │   └── [restaurantSlug]/
│   │   │   │   │       ├── page.tsx              # Entry / OTP gate
│   │   │   │   │       ├── menu/page.tsx          # Menu browsing
│   │   │   │   │       ├── cart/page.tsx          # Cart review
│   │   │   │   │       ├── order/[orderId]/page.tsx  # Order tracking
│   │   │   │   │       └── loyalty/page.tsx       # Streak & rewards
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (admin)/              # Restaurant admin dashboard
│   │   │   │   ├── admin/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── [restaurantSlug]/
│   │   │   │   │       ├── layout.tsx             # Auth guard + sidebar
│   │   │   │   │       ├── page.tsx               # Dashboard home
│   │   │   │   │       ├── orders/page.tsx        # Live order board
│   │   │   │   │       ├── menu/
│   │   │   │   │       │   ├── page.tsx           # Menu items list
│   │   │   │   │       │   ├── new/page.tsx
│   │   │   │   │       │   └── [itemId]/page.tsx
│   │   │   │   │       ├── categories/page.tsx
│   │   │   │   │       ├── tables/page.tsx        # Table + QR manager
│   │   │   │   │       ├── customers/page.tsx     # Customer CRM
│   │   │   │   │       ├── customers/[customerId]/page.tsx
│   │   │   │   │       ├── analytics/page.tsx     # Earnings dashboard
│   │   │   │   │       └── settings/page.tsx      # Restaurant profile
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── otp/send/route.ts          # POST — send customer OTP
│   │   │   │   │   ├── otp/verify/route.ts        # POST — verify OTP
│   │   │   │   │   └── guest/route.ts             # POST — create guest session
│   │   │   │   ├── restaurants/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── route.ts               # GET restaurant info
│   │   │   │   │       ├── menu/route.ts          # GET full menu
│   │   │   │   │       └── table/verify/route.ts  # POST verify table token
│   │   │   │   ├── orders/
│   │   │   │   │   ├── route.ts                   # POST create order
│   │   │   │   │   └── [orderId]/
│   │   │   │   │       ├── route.ts               # GET order status
│   │   │   │   │       └── items/route.ts         # POST add items to order
│   │   │   │   ├── cart/
│   │   │   │   │   └── route.ts                   # POST validate cart items
│   │   │   │   ├── admin/
│   │   │   │   │   ├── menu/
│   │   │   │   │   │   ├── route.ts               # POST create item
│   │   │   │   │   │   └── [itemId]/route.ts      # PUT/DELETE item
│   │   │   │   │   ├── categories/route.ts
│   │   │   │   │   ├── tables/
│   │   │   │   │   │   ├── route.ts               # POST create table
│   │   │   │   │   │   └── [tableId]/route.ts     # PUT/DELETE table
│   │   │   │   │   ├── orders/
│   │   │   │   │   │   └── [orderId]/status/route.ts  # PUT update status
│   │   │   │   │   ├── upload/image/route.ts      # POST get signed upload URL
│   │   │   │   │   └── customers/route.ts         # GET customer list
│   │   │   │   ├── ai/
│   │   │   │   │   └── jarvis/route.ts            # POST AI waiter query
│   │   │   │   └── webhooks/
│   │   │   │       └── payment/route.ts           # POST payment callback
│   │   │   │
│   │   │   ├── layout.tsx                         # Root layout
│   │   │   ├── not-found.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                   # Primitives (Button, Input, Badge, Modal…)
│   │   │   ├── marketing/            # Landing page sections
│   │   │   ├── customer/             # Menu card, cart, OTP form, order tracker
│   │   │   ├── admin/                # Dashboard, order card, menu form
│   │   │   └── shared/              # Header, Footer, SEO, ErrorBoundary
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts         # Browser Supabase client
│   │   │   │   ├── server.ts         # Server Supabase client (cookies)
│   │   │   │   └── admin.ts          # Service-role client (API routes only)
│   │   │   ├── auth/
│   │   │   │   ├── session.ts        # Session helpers
│   │   │   │   └── middleware.ts     # Route protection logic
│   │   │   ├── api/
│   │   │   │   ├── response.ts       # Typed API response helpers
│   │   │   │   └── errors.ts         # AppError class
│   │   │   ├── qr/
│   │   │   │   └── generate.ts       # QR code generation
│   │   │   ├── ai/
│   │   │   │   └── jarvis.ts         # AI waiter prompt builder
│   │   │   └── utils/
│   │   │       ├── format.ts         # Currency, date formatters
│   │   │       └── crypto.ts         # Table token encryption/decryption
│   │   │
│   │   ├── hooks/                    # React custom hooks
│   │   │   ├── useCart.ts
│   │   │   ├── useRealtimeOrder.ts
│   │   │   ├── useRealtimeMenu.ts
│   │   │   └── useLoyaltyStreak.ts
│   │   │
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── cartStore.ts
│   │   │   └── sessionStore.ts
│   │   │
│   │   ├── types/
│   │   │   ├── database.ts           # Auto-generated Supabase types
│   │   │   ├── api.ts                # Request/response types
│   │   │   └── domain.ts             # Business domain types
│   │   │
│   │   ├── validations/              # Zod schemas (shared client+server)
│   │   │   ├── auth.ts
│   │   │   ├── order.ts
│   │   │   ├── menu.ts
│   │   │   └── table.ts
│   │   │
│   │   ├── middleware.ts             # Next.js middleware (auth guards)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── worker/                       # Render Node.js service
│       ├── src/
│       │   ├── index.ts              # Express app entry
│       │   ├── routes/
│       │   │   ├── otp.ts            # /otp/send, /otp/verify
│       │   │   └── health.ts
│       │   ├── services/
│       │   │   ├── sms.ts            # Twilio / MSG91 adapter
│       │   │   ├── otp.ts            # OTP generation, storage, validation
│       │   │   └── cleanup.ts        # Cron cleanup jobs
│       │   ├── middleware/
│       │   │   ├── rateLimiter.ts
│       │   │   └── validate.ts
│       │   └── lib/
│       │       ├── redis.ts          # Upstash Redis client
│       │       └── supabase.ts       # Service-role Supabase
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                       # Shared types and validators
│       ├── src/
│       │   ├── types/index.ts
│       │   └── validators/index.ts
│       └── package.json
│
├── supabase/
│   ├── migrations/                   # All DB migrations (numbered)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions_triggers.sql
│   │   └── 004_seed_data.sql
│   ├── functions/                    # Supabase Edge Functions (if needed)
│   └── config.toml
│
├── .env.example
├── package.json                      # Workspace root
├── turbo.json                        # Turborepo config
└── README.md
```
# MENUFLOW SaaS — Complete Architecture Document
## Part 2: Database Schema

All tables live in a single Postgres database (Supabase). The schema enforces multi-tenant isolation by including `restaurant_id` (UUID FK) on every tenant-scoped table, backed by RLS policies.

---

## Design Principles

1. **Every tenant-scoped table carries `restaurant_id`** — RLS policies reference this column.
2. **UUIDs everywhere** — no sequential integer IDs exposed to clients.
3. **Soft-delete pattern** — `deleted_at TIMESTAMPTZ` instead of `DELETE` for audit trails.
4. **Immutable order items** — once placed, order items are never edited, only cancelled.
5. **Loyalty is event-sourced** — `loyalty_visits` table is the source of truth; streak is computed.
6. **OTPs live in a separate schema with a short TTL**.

---

## Entity Relationship Diagram (text)

```
restaurants ──< tenant_members (admin restaurant)
restaurants ──< menu_categories
menu_categories ──< menu_items
restaurants ──< tables
tables ──< table_tokens (encrypted, rotatable)
restaurants ──< orders
orders ──< order_items ──> menu_items
orders >── customers
restaurants ──< customers (per-restaurant customer records)
customers ──< loyalty_visits
customers ──< loyalty_rewards
restaurants ──< restaurant_branding (1:1)
```

---

## 001 — Core Schema

```sql
-- ============================================================
-- EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- RESTAURANTS (Tenants)
-- ============================================================
CREATE TABLE restaurants (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT        NOT NULL UNIQUE,         -- URL-safe identifier: "chai-point-andheri"
  name              TEXT        NOT NULL,
  description       TEXT,
  phone             TEXT,
  email             TEXT,
  address           TEXT,
  city              TEXT,
  state             TEXT,
  pincode           TEXT,
  currency_code     TEXT        NOT NULL DEFAULT 'INR',
  tax_rate          NUMERIC(5,2) NOT NULL DEFAULT 5.00,  -- GST %
  logo_url          TEXT,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  is_accepting_orders BOOLEAN   NOT NULL DEFAULT true,
  loyalty_streak_target INT     NOT NULL DEFAULT 5,       -- admin-configurable n
  loyalty_reward_description TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug) WHERE deleted_at IS NULL;

-- ============================================================
-- RESTAURANT BRANDING (1:1 with restaurants)
-- ============================================================
CREATE TABLE restaurant_branding (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  primary_color     TEXT        NOT NULL DEFAULT '#000000',
  secondary_color   TEXT        NOT NULL DEFAULT '#ffffff',
  accent_color      TEXT        NOT NULL DEFAULT '#f59e0b',
  font_family       TEXT        NOT NULL DEFAULT 'Inter',
  banner_url        TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TENANT MEMBERS (Admin users linked to restaurants)
-- ============================================================
-- These are Supabase Auth users. We link them here.
CREATE TABLE tenant_members (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role              TEXT        NOT NULL DEFAULT 'admin'
                    CHECK (role IN ('owner', 'admin', 'staff')),
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX idx_tenant_members_restaurant ON tenant_members(restaurant_id);

-- ============================================================
-- MENU CATEGORIES
-- ============================================================
CREATE TABLE menu_categories (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  description       TEXT,
  display_order     INT         NOT NULL DEFAULT 0,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id) 
  WHERE deleted_at IS NULL;

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE menu_items (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id       UUID        NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
  name              TEXT        NOT NULL,
  description       TEXT,
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url         TEXT,
  food_type         TEXT        NOT NULL DEFAULT 'veg'
                    CHECK (food_type IN ('veg', 'non_veg', 'egg')),
  is_available      BOOLEAN     NOT NULL DEFAULT true,
  is_featured       BOOLEAN     NOT NULL DEFAULT false,
  display_order     INT         NOT NULL DEFAULT 0,
  allergens         TEXT[],                              -- ['gluten','nuts','dairy']
  preparation_time_minutes INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id) 
  WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_category ON menu_items(category_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_availability ON menu_items(restaurant_id, is_available)
  WHERE deleted_at IS NULL;

-- ============================================================
-- TABLES (Physical restaurant tables)
-- ============================================================
CREATE TABLE tables (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  label             TEXT        NOT NULL,               -- "Table 1", "Terrace A"
  capacity          INT,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  qr_code_url       TEXT,                               -- stored in Supabase Storage
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  UNIQUE(restaurant_id, label)
);

CREATE INDEX idx_tables_restaurant ON tables(restaurant_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE TOKENS (Encrypted QR routing tokens)
-- ============================================================
-- A token encodes restaurant_id + table_id, signed with a per-tenant secret.
-- Rotating a token invalidates the old QR code.
CREATE TABLE table_tokens (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id          UUID        NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  token             TEXT        NOT NULL UNIQUE,        -- HMAC-signed opaque token
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ                         -- NULL = never expires
);

CREATE INDEX idx_table_tokens_token ON table_tokens(token) WHERE is_active = true;

-- ============================================================
-- CUSTOMERS (Per-restaurant customer records)
-- ============================================================
-- A customer is identified by (restaurant_id, mobile_number).
-- The same phone number at two restaurants = two customer records.
CREATE TABLE customers (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  mobile_number     TEXT        NOT NULL,               -- E.164 format: +919876543210
  name              TEXT,
  is_guest          BOOLEAN     NOT NULL DEFAULT false,
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, mobile_number)
);

CREATE INDEX idx_customers_restaurant ON customers(restaurant_id);
CREATE INDEX idx_customers_mobile ON customers(restaurant_id, mobile_number);

-- ============================================================
-- CUSTOMER SESSIONS (OTP-based stateless sessions)
-- ============================================================
CREATE TABLE customer_sessions (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  session_token     TEXT        NOT NULL UNIQUE,        -- JWT-like signed token
  is_guest          BOOLEAN     NOT NULL DEFAULT false,
  table_id          UUID        REFERENCES tables(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ NOT NULL                -- 24h for guest, 7d for OTP
);

CREATE INDEX idx_customer_sessions_token ON customer_sessions(session_token);
CREATE INDEX idx_customer_sessions_expires ON customer_sessions(expires_at);

-- ============================================================
-- OTP STORE (Short-lived, auto-cleaned)
-- ============================================================
CREATE TABLE otp_requests (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile_number     TEXT        NOT NULL,
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  otp_hash          TEXT        NOT NULL,               -- bcrypt hash of OTP
  attempts          INT         NOT NULL DEFAULT 0,
  is_used           BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE INDEX idx_otp_mobile ON otp_requests(mobile_number, restaurant_id);
CREATE INDEX idx_otp_expires ON otp_requests(expires_at);  -- for cron cleanup

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  customer_id       UUID        REFERENCES customers(id) ON DELETE SET NULL,
  table_id          UUID        REFERENCES tables(id) ON DELETE SET NULL,
  table_label       TEXT,                               -- snapshot at order time
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN (
                      'pending',          -- placed, awaiting kitchen accept
                      'accepted',         -- kitchen accepted
                      'preparing',        -- being prepared
                      'ready',            -- ready for pickup/serving
                      'served',           -- delivered to table
                      'paid',             -- payment confirmed
                      'cancelled',        -- rejected or cancelled
                      'cancel_requested'  -- customer requested cancel
                    )),
  subtotal          NUMERIC(10,2) NOT NULL,
  tax_amount        NUMERIC(10,2) NOT NULL,
  total_amount      NUMERIC(10,2) NOT NULL,
  tax_rate_snapshot NUMERIC(5,2) NOT NULL,              -- snapshot of rate at order time
  payment_method    TEXT        CHECK (payment_method IN ('cash', 'upi', 'card', 'other')),
  payment_status    TEXT        NOT NULL DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  special_instructions TEXT,
  notes             TEXT,                               -- admin internal notes
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at       TIMESTAMPTZ,
  ready_at          TIMESTAMPTZ,
  served_at         TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(restaurant_id, created_at DESC);
CREATE INDEX idx_orders_table ON orders(table_id, status);

-- ============================================================
-- ORDER ITEMS (Immutable snapshot of items at order time)
-- ============================================================
CREATE TABLE order_items (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  menu_item_id      UUID        REFERENCES menu_items(id) ON DELETE SET NULL,
  -- Snapshot fields (preserved even if menu item is later deleted/edited)
  item_name         TEXT        NOT NULL,
  item_price        NUMERIC(10,2) NOT NULL,
  item_food_type    TEXT        NOT NULL,
  quantity          INT         NOT NULL CHECK (quantity > 0),
  subtotal          NUMERIC(10,2) NOT NULL,             -- item_price * quantity
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_restaurant ON order_items(restaurant_id);

-- ============================================================
-- LOYALTY VISITS (Event log — source of truth for streaks)
-- ============================================================
CREATE TABLE loyalty_visits (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id          UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  visit_date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One visit per customer per day per restaurant
  UNIQUE(customer_id, restaurant_id, visit_date)
);

CREATE INDEX idx_loyalty_visits_customer ON loyalty_visits(customer_id, restaurant_id);

-- ============================================================
-- LOYALTY REWARDS (Issued rewards)
-- ============================================================
CREATE TABLE loyalty_rewards (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  streak_cycle      INT         NOT NULL DEFAULT 1,     -- which cycle: 1st, 2nd, 3rd...
  reward_description TEXT       NOT NULL,
  is_redeemed       BOOLEAN     NOT NULL DEFAULT false,
  redeemed_at       TIMESTAMPTZ,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_rewards_customer ON loyalty_rewards(customer_id, restaurant_id);

-- ============================================================
-- RATE LIMIT LOG (for monitoring; Redis is primary enforcement)
-- ============================================================
CREATE TABLE rate_limit_events (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address        TEXT        NOT NULL,
  endpoint          TEXT        NOT NULL,
  restaurant_id     UUID        REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_created ON rate_limit_events(created_at);
```

---

## 002 — Row-Level Security Policies

```sql
-- ============================================================
-- ENABLE RLS ON ALL TENANT TABLES
-- ============================================================
ALTER TABLE restaurants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_branding   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables                ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_tokens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_visits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Get current admin's restaurant_id
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_restaurant_id()
RETURNS UUID AS $$
  SELECT restaurant_id
  FROM tenant_members
  WHERE user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- RESTAURANTS: admins see only their restaurant
-- ============================================================
CREATE POLICY "admins_select_own_restaurant"
  ON restaurants FOR SELECT
  USING (id = get_my_restaurant_id());

CREATE POLICY "admins_update_own_restaurant"
  ON restaurants FOR UPDATE
  USING (id = get_my_restaurant_id());

-- Public: customers can read active restaurants by slug (via service role API routes)
-- NOTE: Customer-facing reads go through service-role API routes, NOT direct Supabase client.
-- The API routes authenticate the request differently (customer session token).

-- ============================================================
-- TENANT MEMBERS: see only your own row and peers in same restaurant
-- ============================================================
CREATE POLICY "members_select_own"
  ON tenant_members FOR SELECT
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- MENU CATEGORIES
-- ============================================================
CREATE POLICY "admin_all_own_categories"
  ON menu_categories FOR ALL
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE POLICY "admin_all_own_items"
  ON menu_items FOR ALL
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- TABLES
-- ============================================================
CREATE POLICY "admin_all_own_tables"
  ON tables FOR ALL
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- TABLE TOKENS
-- ============================================================
CREATE POLICY "admin_all_own_table_tokens"
  ON table_tokens FOR ALL
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- ORDERS
-- ============================================================
CREATE POLICY "admin_all_own_orders"
  ON orders FOR ALL
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE POLICY "admin_all_own_order_items"
  ON order_items FOR ALL
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE POLICY "admin_all_own_customers"
  ON customers FOR ALL
  USING (restaurant_id = get_my_restaurant_id());

-- ============================================================
-- LOYALTY
-- ============================================================
CREATE POLICY "admin_select_own_loyalty_visits"
  ON loyalty_visits FOR SELECT
  USING (restaurant_id = get_my_restaurant_id());

CREATE POLICY "admin_select_own_loyalty_rewards"
  ON loyalty_rewards FOR SELECT
  USING (restaurant_id = get_my_restaurant_id());
```

---

## 003 — Database Functions and Triggers

```sql
-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- ORDER TOTAL VALIDATION
-- Ensures subtotal + tax = total on insert/update
-- ============================================================
CREATE OR REPLACE FUNCTION validate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF ABS((NEW.subtotal * (1 + NEW.tax_rate_snapshot / 100)) - NEW.total_amount) > 0.02 THEN
    RAISE EXCEPTION 'Order total mismatch: subtotal=% tax_rate=% expected_total≈% got=%',
      NEW.subtotal, NEW.tax_rate_snapshot,
      ROUND(NEW.subtotal * (1 + NEW.tax_rate_snapshot / 100), 2),
      NEW.total_amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_order_totals
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION validate_order_totals();

-- ============================================================
-- LOYALTY VISIT INSERTION after order reaches 'served' or 'paid'
-- ============================================================
CREATE OR REPLACE FUNCTION record_loyalty_visit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status transitions to 'served' or 'paid'
  IF NEW.status IN ('served', 'paid') AND 
     OLD.status NOT IN ('served', 'paid') AND
     NEW.customer_id IS NOT NULL THEN
    
    INSERT INTO loyalty_visits (customer_id, restaurant_id, order_id, visit_date)
    VALUES (NEW.customer_id, NEW.restaurant_id, NEW.id, CURRENT_DATE)
    ON CONFLICT (customer_id, restaurant_id, visit_date) DO NOTHING;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_record_loyalty_visit
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION record_loyalty_visit();

-- ============================================================
-- LOYALTY REWARD ISSUANCE
-- Called after loyalty_visits insert; checks if streak is complete
-- ============================================================
CREATE OR REPLACE FUNCTION maybe_issue_loyalty_reward()
RETURNS TRIGGER AS $$
DECLARE
  v_streak_target INT;
  v_reward_desc   TEXT;
  v_visit_count   INT;
  v_cycle         INT;
BEGIN
  -- Get restaurant config
  SELECT loyalty_streak_target, loyalty_reward_description
  INTO v_streak_target, v_reward_desc
  FROM restaurants
  WHERE id = NEW.restaurant_id;

  -- Count total visits for this customer at this restaurant
  SELECT COUNT(*) INTO v_visit_count
  FROM loyalty_visits
  WHERE customer_id = NEW.customer_id
    AND restaurant_id = NEW.restaurant_id;

  -- Check if this visit completes a cycle
  IF v_visit_count % v_streak_target = 0 THEN
    v_cycle := v_visit_count / v_streak_target;
    
    INSERT INTO loyalty_rewards (
      customer_id, restaurant_id, streak_cycle, reward_description
    ) VALUES (
      NEW.customer_id, NEW.restaurant_id, v_cycle, 
      COALESCE(v_reward_desc, 'Loyalty reward for completing the streak!')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_maybe_issue_loyalty_reward
  AFTER INSERT ON loyalty_visits
  FOR EACH ROW EXECUTE FUNCTION maybe_issue_loyalty_reward();

-- ============================================================
-- CLEANUP FUNCTIONS (called by worker cron)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
  DELETE FROM otp_requests WHERE expires_at < NOW();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
  DELETE FROM customer_sessions WHERE expires_at < NOW();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_events()
RETURNS void AS $$
  DELETE FROM rate_limit_events WHERE created_at < NOW() - INTERVAL '24 hours';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- COMPUTED LOYALTY STREAK (used by API, not stored)
-- ============================================================
CREATE OR REPLACE FUNCTION get_customer_loyalty_streak(
  p_customer_id UUID,
  p_restaurant_id UUID
)
RETURNS TABLE (
  total_visits      INT,
  streak_target     INT,
  current_cycle_visits INT,
  is_streak_complete BOOLEAN
) AS $$
DECLARE
  v_streak_target INT;
BEGIN
  SELECT loyalty_streak_target INTO v_streak_target
  FROM restaurants WHERE id = p_restaurant_id;

  RETURN QUERY
  SELECT
    COUNT(*)::INT                                            AS total_visits,
    v_streak_target                                          AS streak_target,
    (COUNT(*) % v_streak_target)::INT                        AS current_cycle_visits,
    (COUNT(*) % v_streak_target = 0 AND COUNT(*) > 0)        AS is_streak_complete
  FROM loyalty_visits
  WHERE customer_id = p_customer_id
    AND restaurant_id = p_restaurant_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

---

## Storage Buckets

```
supabase storage:
  ├── menu-images/
  │   └── {restaurant_id}/{item_id}/{filename}
  │       Policy: INSERT/UPDATE by authenticated admins of that restaurant only
  │       Policy: SELECT public (CDN)
  │
  ├── qr-codes/
  │   └── {restaurant_id}/{table_id}/qr.png
  │       Policy: INSERT/UPDATE by admin only
  │       Policy: SELECT public
  │
  └── restaurant-assets/
      └── {restaurant_id}/logo.{ext}
      └── {restaurant_id}/banner.{ext}
          Policy: INSERT/UPDATE by admin only
          Policy: SELECT public
```

**Image constraints:**
- Menu images: max 2MB, JPEG/PNG/WebP only, resized to 800×600 server-side (Sharp)
- Logo: max 500KB, resized to 400×400
- Upload flow: API route issues a signed upload URL (60s TTL) → client uploads directly to Supabase Storage → API confirms URL and saves to DB

---

## Automatic Cleanup Schedule (Worker Cron)

| Job | Interval | Action |
|---|---|---|
| `cleanup_expired_otps` | Every 5 min | Delete otp_requests where expires_at < NOW() |
| `cleanup_expired_sessions` | Every hour | Delete customer_sessions where expires_at < NOW() |
| `cleanup_rate_limit_events` | Every 24 hours | Delete rate_limit_events older than 24h |
| `cleanup_old_logs` | Daily | Delete API logs older than 30 days |
# MENUFLOW SaaS — Complete Architecture Document
## Part 3: Authentication Flows & RBAC

---

## Authentication Architecture: Two Separate Auth Systems

MenuFlow has **two completely separate authentication systems** that must never be confused:

| System | Who | Mechanism | Token Type |
|---|---|---|---|
| **Admin Auth** | Restaurant owners / staff | Supabase Auth (email + password) | Supabase JWT (stored in cookie) |
| **Customer Auth** | Diners | Mobile OTP or Guest | Custom signed session token (stored in cookie) |

These run in parallel. An admin JWT is useless in the customer flow, and vice versa.

---

## System A: Admin Authentication (Supabase Auth)

### Flow

```
Platform operator onboards a new restaurant:
  1. Operator creates restaurant row in DB
  2. Operator creates user in Supabase Auth (email + temp password)
  3. Operator inserts row in tenant_members (restaurant_id, user_id, role='admin')
  4. Operator emails admin: Dashboard URL + email + temp password

Admin first login:
  ┌────────────────┐         ┌──────────────────┐        ┌──────────────┐
  │  Admin Browser │         │  Next.js API     │        │  Supabase    │
  │                │         │  /admin/login    │        │  Auth        │
  └───────┬────────┘         └────────┬─────────┘        └──────┬───────┘
          │  POST /api/auth/admin     │                          │
          │  { email, password }      │                          │
          ├──────────────────────────►│                          │
          │                          │  signInWithPassword()    │
          │                          ├─────────────────────────►│
          │                          │  ◄── JWT (access+refresh)│
          │                          │                          │
          │                          │  Lookup tenant_members   │
          │                          │  WHERE user_id = auth.uid│
          │                          │  ── get restaurant_id ──►│
          │                          │                          │
          │  Set-Cookie: sb-auth-token (httpOnly, Secure, SameSite=Lax)
          │◄─────────────────────────│                          │
          │                          │                          │
          │  Redirect to /admin/{slug}/                         │
          │                          │                          │

Subsequent requests:
  - Cookie sent automatically
  - @supabase/ssr reads cookie → validates JWT
  - Middleware checks tenant_members to confirm role
  - RLS on Supabase enforces restaurant_id isolation automatically
```

### Password Change on First Login

```
1. Admin logs in with temp password
2. Supabase Auth returns user with metadata flag requires_password_change: true
3. Admin is redirected to /admin/change-password before any dashboard access
4. After change, flag is cleared
```

### Admin RBAC Roles

| Role | Permissions |
|---|---|
| `owner` | Full access: settings, billing, team management |
| `admin` | Menu, orders, tables, customers (no billing/team) |
| `staff` | View orders, update order status only |

Role is stored in `tenant_members.role`. Checked in middleware AND enforced in API routes via helper:

```typescript
// lib/auth/rbac.ts
type AdminRole = 'owner' | 'admin' | 'staff';

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  owner:  ['*'],
  admin:  ['menu:*', 'orders:*', 'tables:*', 'customers:read', 'analytics:read'],
  staff:  ['orders:read', 'orders:update_status'],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;
  // Check wildcard: "menu:*" grants "menu:create", "menu:update", "menu:delete"
  const [resource] = permission.split(':');
  return perms.includes(`${resource}:*`);
}
```

---

## System B: Customer Authentication (OTP + Guest)

### OTP Login Flow

```
Customer scans QR code → /r/{slug}?t={tableToken}

Step 1: Table Token Verification
  ┌─────────────────┐       ┌───────────────────────┐       ┌──────────────┐
  │  Customer Phone │       │  Next.js API          │       │  Supabase DB │
  └────────┬────────┘       └──────────┬────────────┘       └──────┬───────┘
           │  GET /r/{slug}?t={token}  │                            │
           ├──────────────────────────►│                            │
           │                          │  SELECT table_tokens       │
           │                          │  WHERE token = $1          │
           │                          │  AND is_active = true      │
           │                          ├───────────────────────────►│
           │                          │◄── { table_id, restaurant} │
           │                          │                            │
           │  Render: Enter mobile number page                     │
           │◄─────────────────────────│                            │

Step 2: OTP Request
           │  POST /api/auth/otp/send │                            │
           │  { mobile, restaurantId }│                            │
           ├──────────────────────────►│                            │
           │                          │  Rate limit check (Redis)  │
           │                          │  3 OTPs per mobile/15min   │
           │                          │                            │
           │                          │  Generate 6-digit OTP      │
           │                          │  bcrypt hash → otp_requests│
           │                          ├───────────────────────────►│
           │                          │                            │
           │                          │  Dispatch SMS via Worker   │
           │                          │──► POST worker/otp/send    │
           │  200 OK { expiresIn: 600 }│                           │
           │◄─────────────────────────│                            │

Step 3: OTP Verification
           │  POST /api/auth/otp/verify
           │  { mobile, otp, restaurantId, tableToken }
           ├──────────────────────────►│                            │
           │                          │  Lookup otp_requests       │
           │                          │  WHERE mobile = $1         │
           │                          │  AND expires_at > NOW()    │
           │                          │  AND is_used = false       │
           │                          ├───────────────────────────►│
           │                          │◄── { otp_hash, attempts }  │
           │                          │                            │
           │                          │  bcrypt.compare(otp, hash) │
           │                          │  MAX 3 attempts then lock  │
           │                          │                            │
           │                          │  UPSERT customers          │
           │                          │  (restaurant_id, mobile)   │
           │                          ├───────────────────────────►│
           │                          │◄── { customer_id }        │
           │                          │                            │
           │                          │  INSERT customer_sessions  │
           │                          │  session_token = sign(     │
           │                          │    { customerId, restaurantId,
           │                          │      tableId }, SECRET)    │
           │                          │  expires_at = +7 days      │
           │                          ├───────────────────────────►│
           │                          │                            │
           │  Set-Cookie: mf-customer-session (httpOnly, Secure)   │
           │  Redirect to /r/{slug}/menu                           │
           │◄─────────────────────────│                            │

Step 4: Session Validation (every subsequent request)
           │  GET /r/{slug}/menu      │                            │
           ├──────────────────────────►│                            │
           │                          │  middleware.ts:            │
           │                          │  1. Read mf-customer-session cookie
           │                          │  2. Verify JWT signature   │
           │                          │  3. SELECT customer_sessions
           │                          │     WHERE session_token = $ │
           │                          │     AND expires_at > NOW() │
           │                          │  4. Attach to request ctx  │
           │                          │                            │
           │  Serve menu page         │                            │
           │◄─────────────────────────│                            │
```

### Guest Login Flow

```
Customer selects "Continue as Guest" on OTP page:

  POST /api/auth/guest
  { restaurantId, tableToken }

  → Verify tableToken
  → Create customer row (is_guest=true, mobile=generated_uuid prefix)
  → Create customer_session (expires_at = +24 hours)
  → Set-Cookie: mf-customer-session
  → Redirect to /r/{slug}/menu

  Guest limitations:
    - Cannot accumulate loyalty streak
    - Cannot view order history across sessions
    - Session expires in 24 hours
```

### Customer Session Token Structure

```typescript
// lib/crypto.ts
interface CustomerSessionPayload {
  cid: string;          // customer_id
  rid: string;          // restaurant_id
  tid: string | null;   // table_id
  iss: 'menuflow';
  iat: number;
  exp: number;
}

// Signed with HMAC-SHA256 using CUSTOMER_SESSION_SECRET env var
// Verified on every request by middleware
// Also stored in customer_sessions table to support revocation
```

---

## Next.js Middleware (Route Protection)

```typescript
// middleware.ts — runs on Edge Runtime

export const config = {
  matcher: [
    '/r/:path*',        // Customer routes
    '/admin/:path*',    // Admin routes (except /admin/login)
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const supabase = createMiddlewareClient(request);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Attach restaurant context to headers for downstream use
    const tenantMember = await getTenantMember(session.user.id);
    if (!tenantMember) {
      return NextResponse.redirect(new URL('/admin/login?error=no_access', request.url));
    }
    
    const response = NextResponse.next();
    response.headers.set('x-restaurant-id', tenantMember.restaurant_id);
    response.headers.set('x-admin-role', tenantMember.role);
    return response;
  }

  // ── Customer routes ───────────────────────────────────────────
  if (pathname.startsWith('/r/')) {
    const sessionToken = request.cookies.get('mf-customer-session')?.value;
    
    // Allow access to OTP page without session
    const segments = pathname.split('/');
    const isEntryPage = segments.length === 3; // /r/{slug}
    if (isEntryPage && !sessionToken) {
      return NextResponse.next();
    }
    
    if (!sessionToken) {
      const slug = segments[2];
      return NextResponse.redirect(new URL(`/r/${slug}`, request.url));
    }
    
    const payload = verifyCustomerSession(sessionToken);
    if (!payload) {
      const slug = segments[2];
      const response = NextResponse.redirect(new URL(`/r/${slug}`, request.url));
      response.cookies.delete('mf-customer-session');
      return response;
    }
    
    const response = NextResponse.next();
    response.headers.set('x-customer-id', payload.cid);
    response.headers.set('x-restaurant-id', payload.rid);
    response.headers.set('x-table-id', payload.tid ?? '');
    return response;
  }

  return NextResponse.next();
}
```

---

## Table Token Encryption

QR codes embed an opaque token, not raw table/restaurant IDs.

```typescript
// lib/crypto.ts

import { createHmac, randomBytes } from 'crypto';

// Token format: {randomBytes(16).hex}:{restaurantId}:{tableId}
// Signed: base64url(HMAC-SHA256(payload, TABLE_TOKEN_SECRET))

export function generateTableToken(restaurantId: string, tableId: string): string {
  const nonce = randomBytes(16).toString('hex');
  const payload = `${nonce}:${restaurantId}:${tableId}`;
  const sig = createHmac('sha256', process.env.TABLE_TOKEN_SECRET!)
    .update(payload)
    .digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifyTableToken(token: string): 
  { restaurantId: string; tableId: string } | null {
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  
  const payload = Buffer.from(payloadB64, 'base64url').toString();
  const expectedSig = createHmac('sha256', process.env.TABLE_TOKEN_SECRET!)
    .update(payload)
    .digest('base64url');
  
  // Constant-time comparison
  if (sig.length !== expectedSig.length) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) return null;
  
  const [, restaurantId, tableId] = payload.split(':');
  return { restaurantId, tableId };
}
```

Additionally, tokens are stored in `table_tokens` table and verified against it (DB check prevents use of valid-signature but deactivated tokens).

---

## Security Summary

| Threat | Mitigation |
|---|---|
| Admin account takeover | Supabase Auth + mandatory password change |
| Cross-tenant data access | RLS on every table, restaurant_id on every row |
| OTP brute force | 3 attempts max, locked 15 min, Redis rate limit |
| QR code replay | Token stored in DB, deactivatable, optional expiry |
| Customer session hijack | httpOnly Secure cookie, server-side session record |
| SQL injection | Parameterized queries (Supabase client), Zod validation |
| Mass order spam | Rate limiting: 5 orders per customer per 10 min (Redis) |
| Image upload abuse | Signed URLs (60s TTL), size limit, type validation, server-side resize |
| CSRF | SameSite=Lax cookie + token on state-changing API routes |
| Enumeration | UUIDs for all public-facing IDs |
# MENUFLOW SaaS — Complete Architecture Document
## Part 4: API Contracts

All API routes are Next.js Route Handlers under `/app/api/`. 

### Conventions
- All responses: `Content-Type: application/json`
- Success envelope: `{ success: true, data: <T> }`
- Error envelope: `{ success: false, error: { code: string, message: string, details?: any } }`
- All timestamps: ISO 8601
- Amounts: numbers (not strings), in smallest denomination display (e.g., `149.00`)
- Auth headers: none — sessions are always cookies

### Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Session valid, insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Zod schema failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `CONFLICT` | 409 | Duplicate resource |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `RESTAURANT_CLOSED` | 503 | Restaurant not accepting orders |

---

## Public / Customer-Facing APIs

### GET `/api/restaurants/[slug]`
Returns public restaurant info for the customer menu page.

**Auth:** Customer session cookie (middleware validates) OR table token in query param for first visit.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "chai-point-andheri",
    "name": "Chai Point Andheri",
    "description": "Mumbai's favorite chai experience",
    "logoUrl": "https://cdn.supabase.co/...",
    "isAcceptingOrders": true,
    "currency": "INR",
    "taxRate": 5.0,
    "branding": {
      "primaryColor": "#1a1a2e",
      "secondaryColor": "#ffffff",
      "accentColor": "#f59e0b",
      "fontFamily": "Inter"
    }
  }
}
```

---

### POST `/api/restaurants/[slug]/table/verify`
Verifies a table token from QR scan. Called before showing OTP form.

**Auth:** None required (public endpoint, rate-limited by IP).

**Request:**
```json
{ "token": "base64url.signature" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tableId": "uuid",
    "tableLabel": "Table 4",
    "restaurantId": "uuid",
    "restaurantSlug": "chai-point-andheri"
  }
}
```

---

### GET `/api/restaurants/[slug]/menu`
Full menu with categories and items.

**Auth:** Customer session cookie.

**Query params:** none

**Response 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Chai & Beverages",
        "displayOrder": 0,
        "items": [
          {
            "id": "uuid",
            "name": "Masala Chai",
            "description": "Classic spiced chai with ginger and cardamom",
            "price": 49.00,
            "imageUrl": "https://cdn.supabase.co/...",
            "foodType": "veg",
            "isAvailable": true,
            "isFeatured": false,
            "allergens": ["dairy"],
            "preparationTimeMinutes": 5
          }
        ]
      }
    ]
  }
}
```

**Note:** Items with `isAvailable: false` are included so the UI can show "Sold Out." Real-time updates via Supabase Realtime subscription handle live availability changes.

---

### POST `/api/auth/otp/send`
Sends OTP to a mobile number.

**Auth:** None (rate-limited: 3 OTP per mobile per 15 min via Redis).

**Request:**
```json
{
  "mobileNumber": "+919876543210",
  "restaurantId": "uuid"
}
```

**Validation (Zod):**
- `mobileNumber`: E.164 format regex, max 15 chars
- `restaurantId`: UUID

**Response 200:**
```json
{
  "success": true,
  "data": {
    "expiresInSeconds": 600,
    "maskedMobile": "+91 ****43210"
  }
}
```

**Response 429:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many OTP requests. Try again in 12 minutes.",
    "retryAfterSeconds": 720
  }
}
```

---

### POST `/api/auth/otp/verify`
Verifies OTP and creates/returns a customer session.

**Auth:** None.

**Request:**
```json
{
  "mobileNumber": "+919876543210",
  "otp": "482910",
  "restaurantId": "uuid",
  "tableToken": "base64url.signature"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "customerId": "uuid",
    "isNewCustomer": false,
    "redirectTo": "/r/chai-point-andheri/menu"
  }
}
```
Sets `mf-customer-session` cookie (httpOnly, Secure, SameSite=Lax, 7 days).

**Response 401 (wrong OTP):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid OTP.",
    "attemptsRemaining": 2
  }
}
```

---

### POST `/api/auth/guest`
Creates a guest session.

**Auth:** None.

**Request:**
```json
{
  "restaurantId": "uuid",
  "tableToken": "base64url.signature"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "redirectTo": "/r/chai-point-andheri/menu"
  }
}
```
Sets `mf-customer-session` cookie (24h expiry).

---

### POST `/api/cart/validate`
Validates cart items before checkout (checks availability, prices).

**Auth:** Customer session cookie.

**Request:**
```json
{
  "restaurantId": "uuid",
  "items": [
    { "menuItemId": "uuid", "quantity": 2 },
    { "menuItemId": "uuid", "quantity": 1 }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "items": [
      {
        "menuItemId": "uuid",
        "name": "Masala Chai",
        "price": 49.00,
        "quantity": 2,
        "subtotal": 98.00,
        "isAvailable": true
      }
    ],
    "summary": {
      "subtotal": 147.00,
      "taxRate": 5.0,
      "taxAmount": 7.35,
      "total": 154.35
    }
  }
}
```

**Response 200 (with unavailable items):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "unavailableItems": ["Masala Chai"],
    "message": "Some items are no longer available."
  }
}
```

---

### POST `/api/orders`
Places a new order.

**Auth:** Customer session cookie. Rate-limited: 5 orders per customer per 10 min.

**Request:**
```json
{
  "restaurantId": "uuid",
  "tableId": "uuid",
  "items": [
    { "menuItemId": "uuid", "quantity": 2 },
    { "menuItemId": "uuid", "quantity": 1 }
  ],
  "specialInstructions": "Less sugar please"
}
```

**Server-side order creation process:**
1. Validate all items exist and are available
2. Fetch current prices from DB (never trust client prices)
3. Compute subtotal, tax, total
4. Insert order + order_items in a transaction
5. Publish real-time event to admin channel
6. Return order

**Response 201:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "status": "pending",
    "items": [...],
    "summary": {
      "subtotal": 147.00,
      "taxAmount": 7.35,
      "total": 154.35
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET `/api/orders/[orderId]`
Real-time order status polling (or use Supabase Realtime subscription instead).

**Auth:** Customer session cookie. Customers can only fetch their own orders.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "status": "preparing",
    "statusHistory": [
      { "status": "pending", "at": "2024-01-15T10:30:00Z" },
      { "status": "accepted", "at": "2024-01-15T10:31:00Z" },
      { "status": "preparing", "at": "2024-01-15T10:32:00Z" }
    ],
    "estimatedReadyMinutes": 8,
    "items": [...],
    "summary": { "subtotal": 147.00, "taxAmount": 7.35, "total": 154.35 }
  }
}
```

---

### POST `/api/orders/[orderId]/items`
Add more items to an existing pending/accepted order.

**Auth:** Customer session cookie.

**Allowed when order status:** `pending` or `accepted` only.

**Request:**
```json
{
  "items": [
    { "menuItemId": "uuid", "quantity": 1 }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "addedItems": [...],
    "newTotal": 203.35
  }
}
```

---

### GET `/api/customer/loyalty`
Returns loyalty streak for the current customer at this restaurant.

**Auth:** Customer session cookie. (Guest sessions return null.)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "customerId": "uuid",
    "totalVisits": 3,
    "streakTarget": 5,
    "currentCycleVisits": 3,
    "isStreakComplete": false,
    "pendingRewards": [],
    "completedCycles": 0
  }
}
```

---

### POST `/api/ai/jarvis`
AI Waiter query endpoint.

**Auth:** Customer session cookie.

**Request:**
```json
{
  "restaurantId": "uuid",
  "message": "What dishes are good for someone with a nut allergy?"
}
```

**Server process:**
1. Fetch restaurant menu from DB
2. Build system prompt: `You are Jarvis, the AI waiter at {restaurant}. Menu: {menu}. Answer questions about the menu only.`
3. Call LLM API (Claude Haiku via Anthropic API — cheapest, fast)
4. Return response

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reply": "For nut allergies, I'd recommend the Masala Chai, Veg Biryani, and Paneer Butter Masala. All three are prepared without nuts. Would you like to add any of these to your cart?",
    "suggestedItems": [
      { "menuItemId": "uuid", "name": "Masala Chai", "price": 49.00 }
    ]
  }
}
```

---

## Admin APIs (All require Admin JWT cookie + matching restaurant slug)

Middleware validates: `auth.uid()` belongs to `tenant_members` for the restaurant in the URL slug, and that `role` has the required permission.

---

### GET `/api/admin/orders`
Live orders dashboard.

**Query params:** `status=pending,accepted,preparing` (comma-separated)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "tableLabel": "Table 4",
        "status": "pending",
        "customerName": null,
        "itemCount": 3,
        "total": 154.35,
        "items": [
          { "name": "Masala Chai", "quantity": 2, "price": 49.00 },
          { "name": "Veg Sandwich", "quantity": 1, "price": 89.00 }
        ],
        "specialInstructions": "Less sugar",
        "createdAt": "2024-01-15T10:30:00Z",
        "minutesAgo": 4
      }
    ],
    "counts": {
      "pending": 2,
      "accepted": 1,
      "preparing": 3,
      "ready": 0
    }
  }
}
```

---

### PUT `/api/admin/orders/[orderId]/status`
Update order status.

**Permission required:** `orders:update_status`

**Valid transitions:**
```
pending → accepted | cancelled
accepted → preparing | cancelled
preparing → ready
ready → served
served → paid
any → cancel_requested (customer-initiated, then admin acts)
cancel_requested → cancelled | preparing (admin decision)
```

**Request:**
```json
{
  "status": "accepted",
  "notes": "Noted the sugar request"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "previousStatus": "pending",
    "newStatus": "accepted"
  }
}
```

---

### POST `/api/admin/menu`
Create a menu item.

**Permission required:** `menu:create`

**Request:**
```json
{
  "categoryId": "uuid",
  "name": "Masala Chai",
  "description": "Classic spiced chai",
  "price": 49.00,
  "foodType": "veg",
  "allergens": ["dairy"],
  "preparationTimeMinutes": 5,
  "isAvailable": true,
  "isFeatured": false,
  "imageUrl": null
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { "menuItemId": "uuid" }
}
```

---

### PUT `/api/admin/menu/[itemId]`
Update menu item (partial update supported).

**Permission required:** `menu:update`

**Request:** Partial object of any menu_items fields.

**Response 200:**
```json
{
  "success": true,
  "data": { "menuItemId": "uuid", "updated": ["price", "isAvailable"] }
}
```

**Note:** Changing `isAvailable` also triggers a Supabase Realtime broadcast to the `restaurant:{id}:menu` channel so all customer browsers update instantly.

---

### DELETE `/api/admin/menu/[itemId]`
Soft-delete a menu item (sets `deleted_at`).

**Permission required:** `menu:delete`

**Response 200:**
```json
{ "success": true, "data": { "deleted": true } }
```

---

### POST `/api/admin/upload/image`
Get a signed upload URL for a menu image.

**Permission required:** `menu:update`

**Request:**
```json
{
  "filename": "masala-chai.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 524288,
  "purpose": "menu_item"
}
```

**Server validation:**
- `sizeBytes` ≤ 2,097,152 (2MB)
- `contentType` ∈ `['image/jpeg', 'image/png', 'image/webp']`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://supabase.co/storage/v1/object/sign/...",
    "storageKey": "menu-images/{restaurantId}/{uuid}/masala-chai.jpg",
    "publicUrl": "https://cdn.supabase.co/...",
    "expiresInSeconds": 60
  }
}
```

---

### GET `/api/admin/tables`
List all tables with their QR status.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "uuid",
        "label": "Table 4",
        "capacity": 4,
        "isActive": true,
        "qrCodeUrl": "https://cdn.supabase.co/...",
        "hasActiveToken": true,
        "currentOrderCount": 1
      }
    ]
  }
}
```

---

### POST `/api/admin/tables`
Create a table and generate its QR code.

**Request:**
```json
{ "label": "Table 5", "capacity": 4 }
```

**Server process:**
1. Insert table row
2. Generate table token (HMAC signed)
3. Insert table_token row
4. Generate QR code PNG (Node `qrcode` library)
5. Upload QR PNG to Supabase Storage
6. Update table with `qr_code_url`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "tableId": "uuid",
    "label": "Table 5",
    "qrCodeUrl": "https://cdn.supabase.co/..."
  }
}
```

---

### POST `/api/admin/tables/[tableId]/regenerate-qr`
Rotates the table token (invalidates old QR) and generates new QR.

**Permission required:** `tables:*`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tableId": "uuid",
    "newQrCodeUrl": "https://cdn.supabase.co/..."
  }
}
```

---

### GET `/api/admin/customers`
Customer list with summary.

**Query params:** `page=1&limit=20&search=+91987`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "uuid",
        "name": "Rahul Mehta",
        "mobileNumber": "+919876543210",
        "totalOrders": 12,
        "totalSpent": 1847.50,
        "currentCycleVisits": 3,
        "streakTarget": 5,
        "lastSeenAt": "2024-01-14T18:22:00Z"
      }
    ],
    "total": 142,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET `/api/admin/customers/[customerId]`
Detailed customer profile.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rahul Mehta",
    "mobileNumber": "+919876543210",
    "totalOrders": 12,
    "totalSpent": 1847.50,
    "loyaltyStreak": {
      "totalVisits": 8,
      "streakTarget": 5,
      "currentCycleVisits": 3,
      "completedCycles": 1
    },
    "recentOrders": [
      {
        "orderId": "uuid",
        "date": "2024-01-14",
        "amount": 203.35,
        "status": "paid",
        "itemCount": 4
      }
    ],
    "pendingRewards": []
  }
}
```

---

### GET `/api/admin/analytics`
Daily earnings and order stats.

**Query params:** `from=2024-01-01&to=2024-01-31`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 48230.50,
      "totalOrders": 312,
      "averageOrderValue": 154.58,
      "uniqueCustomers": 89
    },
    "daily": [
      {
        "date": "2024-01-15",
        "revenue": 3240.00,
        "orders": 21,
        "uniqueCustomers": 14
      }
    ],
    "topItems": [
      { "name": "Masala Chai", "quantity": 148, "revenue": 7252.00 }
    ]
  }
}
```

---

## Realtime Channels (Supabase Realtime)

| Channel | Publisher | Subscriber | Payload |
|---|---|---|---|
| `restaurant:{rid}:orders` | API (on order insert/update) | Admin dashboard | `{ event: 'NEW_ORDER' \| 'ORDER_UPDATED', order: {...} }` |
| `restaurant:{rid}:menu` | API (on availability toggle) | All customer browsers | `{ event: 'ITEM_AVAILABILITY', itemId, isAvailable }` |
| `order:{oid}:status` | API (on status update) | Customer order tracking | `{ event: 'STATUS_CHANGED', status, updatedAt }` |

Supabase Realtime handles connection via WebSocket. Next.js hooks (`useRealtimeOrder`, `useRealtimeMenu`) subscribe on mount and unsubscribe on unmount.
# MENUFLOW SaaS — Complete Architecture Document
## Part 5: State Management, Deployment Plan, and Implementation Roadmap

---

## State Management Strategy

### Principle: Right Tool for the Right State

```
┌─────────────────────────────────────────────────────────────────┐
│                     State Classification                         │
├──────────────────────┬──────────────────────┬───────────────────┤
│  Server State        │  Client / UI State   │  Realtime State   │
│  (TanStack Query)    │  (Zustand)           │  (Supabase RT)    │
├──────────────────────┼──────────────────────┼───────────────────┤
│  Menu data           │  Cart contents       │  Order status     │
│  Order details       │  Customer session    │  Item availability│
│  Customer profile    │  UI drawer/modal open│  New orders (admin│
│  Analytics data      │  Toast messages      │                   │
│  Admin order list    │  Active tab/page     │                   │
└──────────────────────┴──────────────────────┴───────────────────┘
```

### TanStack Query Setup

```typescript
// Query keys (centralized to prevent typos)
export const queryKeys = {
  restaurant: (slug: string) => ['restaurant', slug] as const,
  menu: (slug: string) => ['menu', slug] as const,
  order: (orderId: string) => ['order', orderId] as const,
  customerLoyalty: (customerId: string, rid: string) => 
    ['loyalty', customerId, rid] as const,
  
  // Admin
  adminOrders: (rid: string, statuses: string[]) => 
    ['admin', 'orders', rid, statuses] as const,
  adminCustomers: (rid: string, page: number) => 
    ['admin', 'customers', rid, page] as const,
  adminAnalytics: (rid: string, from: string, to: string) =>
    ['admin', 'analytics', rid, from, to] as const,
};

// Stale times
const STALE_TIMES = {
  menu: 30_000,            // 30s — menu changes are pushed via Realtime
  orderStatus: 10_000,     // 10s — backup polling (Realtime is primary)
  adminOrders: 5_000,      // 5s  — admin gets Realtime + polling backup
  customerProfile: 60_000, // 1min
  analytics: 300_000,      // 5min
};
```

### Zustand Stores

**Cart Store (customer-side)**
```typescript
// stores/cartStore.ts
interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  foodType: 'veg' | 'non_veg' | 'egg';
}

interface CartStore {
  restaurantId: string | null;
  tableId: string | null;
  items: CartItem[];
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, qty: number) => void;
  clearCart: () => void;
  
  // Computed (derived, not stored)
  // Used as selectors: useCartStore(state => state.items.reduce(...))
}

// Persistence: sessionStorage only (cart dies when tab closes)
// Never persists to localStorage — prevents cross-restaurant leakage
```

**Session Store (customer-side)**
```typescript
// stores/sessionStore.ts
interface SessionStore {
  customerId: string | null;
  restaurantId: string | null;
  tableId: string | null;
  isGuest: boolean;
  
  setSession: (payload: SessionPayload) => void;
  clearSession: () => void;
}
// Populated from cookie payload on page load
// Used for client-side conditional rendering (not for auth — that's server-side)
```

### Server State in Next.js App Router

- **Server Components** fetch data directly (no fetch overhead, no hydration needed)
- **Client Components** use TanStack Query for interactive/frequently-updating data
- **Server Actions** for mutations that need server-side validation

```
Page (Server Component)
  ├── Fetch restaurant info (direct DB call via supabase/server.ts)
  ├── Fetch initial menu (RSC, pre-rendered)
  └── Pass to Client Components:
        ├── <MenuList /> — renders initial data, subscribes to Realtime
        ├── <CartDrawer /> — Zustand only
        └── <JarvisChat /> — TanStack Query for AI calls
```

---

## Environment Variables

### Next.js Web App (Vercel)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...          # safe to expose (RLS enforces)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...               # NEVER expose to client

# Security
TABLE_TOKEN_SECRET=<64-char random hex>            # for HMAC table tokens
CUSTOMER_SESSION_SECRET=<64-char random hex>       # for customer session JWT

# AI Waiter
ANTHROPIC_API_KEY=sk-ant-...

# Worker (internal)
WORKER_URL=https://menuflow-worker.onrender.com
WORKER_SECRET=<shared secret for internal calls>

# App
NEXT_PUBLIC_APP_URL=https://menuflow.app
```

### Worker (Render)
```bash
# Supabase (service role only — no public key needed)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Internal security
WORKER_SECRET=<same shared secret as web app>

# App
PORT=3001
```

---

## Deployment Plan

### Infrastructure Provisioning Order

```
Phase 0: Infrastructure Setup (before any code)
  1. Create Supabase project (Production)
  2. Create Supabase project (Staging)  
  3. Create Upstash Redis instance
  4. Create Vercel project (connect to monorepo, apps/web)
  5. Create Render service (connect to monorepo, apps/worker)
  6. Configure all environment variables
  7. Set up custom domain (menuflow.app) on Vercel

Phase 1: Database
  1. Run migrations in order (001 → 004) on Supabase
  2. Verify RLS policies with test queries
  3. Create Storage buckets with correct policies
  4. Set up Realtime publication for: orders, menu_items tables

Phase 2: Worker Deployment
  1. Deploy worker to Render
  2. Verify /health endpoint returns 200
  3. Test OTP send/receive end-to-end

Phase 3: Web App Deployment
  1. Deploy to Vercel (staging branch first)
  2. Run through complete customer flow (QR → OTP → order)
  3. Run through complete admin flow (login → create menu → receive order)
  4. Promote to production
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm typecheck

  lint:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test        # Vitest unit tests

  deploy-staging:
    needs: [typecheck, lint, test]
    if: github.ref == 'refs/heads/staging'
    steps:
      - uses: vercel/action@v3
        with:
          vercel-args: '--prebuilt'
          scope: menuflow
```

### Scaling Plan

| Load Level | Configuration |
|---|---|
| 0–50 restaurants | Supabase Free/Pro, Vercel Hobby, Render Starter |
| 50–150 restaurants (~1000 req/min) | Supabase Pro (4 CPU / 8GB), Vercel Pro, Render Standard |
| 150+ restaurants | Supabase dedicated compute, Vercel Enterprise, Render auto-scale |

Supabase connection pooling via PgBouncer (built-in) is enabled from day one. Next.js API routes are stateless, so Vercel horizontal scaling is automatic.

---

## Implementation Roadmap

### Milestone 0 — Foundation (Week 1–2)
**Goal: Monorepo running locally with DB connected.**

- [ ] Initialize Turborepo monorepo with `apps/web` and `apps/worker`
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Tailwind CSS with design tokens
- [ ] Supabase local dev (`supabase start`)
- [ ] Run all migrations (001–004)
- [ ] Generate Supabase TypeScript types (`supabase gen types typescript`)
- [ ] Implement `lib/supabase/{client,server,admin}.ts`
- [ ] Implement table token crypto (`lib/crypto.ts`)
- [ ] Set up Upstash Redis locally (mock or real)

**Deliverable:** `pnpm dev` runs both apps, DB migrations applied, types generated.

---

### Milestone 1 — Admin Auth + Restaurant Bootstrap (Week 3)
**Goal: Platform operator can create a restaurant and admin can log in.**

- [ ] Admin login page (`/admin/login`)
- [ ] Supabase Auth integration (signInWithPassword)
- [ ] `tenant_members` lookup after login
- [ ] Middleware for admin route protection
- [ ] Force password change on first login
- [ ] Restaurant settings page (`/admin/[slug]/settings`)
- [ ] Restaurant branding upload (logo)
- [ ] API: `POST /api/admin/tables` (with QR generation)
- [ ] QR code generation and storage

**Deliverable:** Admin can log in, update restaurant info, and create tables with QR codes.

---

### Milestone 2 — Menu Management (Week 4)
**Goal: Admin can fully manage the menu.**

- [ ] Category CRUD (`/admin/[slug]/categories`)
- [ ] Menu item CRUD (`/admin/[slug]/menu`)
- [ ] Image upload flow (signed URL → Supabase Storage → Sharp resize)
- [ ] Toggle availability (with Realtime broadcast)
- [ ] Display order drag-and-drop
- [ ] Food type indicators (veg/non-veg/egg)
- [ ] Allergen management

**Deliverable:** Admin can build a complete, categorized menu with images.

---

### Milestone 3 — Customer OTP Flow (Week 5)
**Goal: Customer can scan QR → receive OTP → access menu.**

- [ ] Worker: OTP generation + SMS dispatch (Twilio)
- [ ] Worker: Rate limiting (Redis)
- [ ] API: `POST /api/auth/otp/send`
- [ ] API: `POST /api/auth/otp/verify`
- [ ] API: `POST /api/auth/guest`
- [ ] Customer session middleware
- [ ] Landing page for `/r/[slug]` (OTP entry)
- [ ] Table token verification on QR scan

**Deliverable:** End-to-end QR scan → OTP → session established flow.

---

### Milestone 4 — Customer Menu + Cart + Order (Week 6–7)
**Goal: Customer can browse menu, build cart, place order.**

- [ ] Menu page (`/r/[slug]/menu`) with categories
- [ ] Restaurant branding applied (colors, logo)
- [ ] Veg/non-veg/egg visual indicators
- [ ] Cart drawer (Zustand)
- [ ] Cart validation API
- [ ] Order placement API (server-side pricing)
- [ ] Add-more-items to existing order
- [ ] Order tracking page (`/r/[slug]/order/[orderId]`)
- [ ] Supabase Realtime: order status subscription

**Deliverable:** Full customer ordering flow working end-to-end.

---

### Milestone 5 — Admin Order Management (Week 8)
**Goal: Admin receives and manages live orders.**

- [ ] Live order dashboard (`/admin/[slug]/orders`)
- [ ] Supabase Realtime: new order subscription
- [ ] Accept / Reject / Preparing / Ready / Served / Paid buttons
- [ ] Order status validation (state machine)
- [ ] Payment marking
- [ ] Order lifecycle timestamps
- [ ] Sound notification on new order (browser API)

**Deliverable:** Admin dashboard receives and processes orders in real-time.

---

### Milestone 6 — Loyalty System (Week 9)
**Goal: Loyalty streak tracking works for both customer and admin views.**

- [ ] DB trigger: `record_loyalty_visit` fires on order served/paid
- [ ] DB trigger: `maybe_issue_loyalty_reward` fires on visit insert
- [ ] Customer loyalty page (`/r/[slug]/loyalty`)
- [ ] Streak progress visualization
- [ ] Admin customer detail page (streak, history)
- [ ] Reward redemption marking by admin

**Deliverable:** Loyalty streak accumulates correctly; admin can view and redeem rewards.

---

### Milestone 7 — AI Waiter (Jarvis) (Week 10)
**Goal: Jarvis answers menu questions and allergen queries.**

- [ ] `lib/ai/jarvis.ts` — system prompt builder with menu context
- [ ] API: `POST /api/ai/jarvis`
- [ ] Chat UI component in customer menu
- [ ] Rate limiting (5 messages per customer per 10 min)
- [ ] Suggested items in Jarvis response
- [ ] "Add to cart" from Jarvis suggestion

**Deliverable:** Customer can chat with Jarvis and get menu-aware recommendations.

---

### Milestone 8 — Marketing Site + Public Pages (Week 11)
**Goal: Full public-facing site SEO-ready.**

- [ ] Homepage (what we do, how it works, contact, list your cafe)
- [ ] How it works: 4-step flow section
- [ ] Admin login section (bottom of homepage)
- [ ] About page
- [ ] Contact Us page
- [ ] List Your Cafe page (form → email notification)
- [ ] Coming Soon page
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie Policy page
- [ ] Sitemap (`/sitemap.xml`)
- [ ] SEO metadata (`next-seo`)
- [ ] robots.txt

**Deliverable:** All public pages live, SEO-optimized, legally compliant.

---

### Milestone 9 — Analytics + Polish (Week 12)
**Goal: Admin analytics, hardening, and performance.**

- [ ] Analytics dashboard (daily earnings, top items, unique customers)
- [ ] Customer CRM table with search and pagination
- [ ] Admin customer detail view
- [ ] Error boundaries and fallback UI
- [ ] Loading skeletons everywhere
- [ ] Mobile responsiveness audit (customer flow must be perfect on mobile)
- [ ] Image optimization (`next/image` everywhere)
- [ ] Performance audit (Core Web Vitals)
- [ ] Security audit (RLS test with wrong restaurant_id)
- [ ] Rate limiting end-to-end test

**Deliverable:** Production-ready, hardened application.

---

### Milestone 10 — Launch Prep (Week 13)
- [ ] Staging environment full smoke test
- [ ] Seed one real restaurant as showcase
- [ ] Monitoring setup (Vercel Analytics, Supabase metrics, Render logs)
- [ ] Error tracking (Sentry integration)
- [ ] On-call runbook: how to create a new restaurant tenant
- [ ] Admin onboarding email template (Resend)
- [ ] Production deployment and DNS cutover

---



2