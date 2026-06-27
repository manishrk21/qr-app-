# MenuFlow

MenuFlow is a multi-tenant QR ordering SaaS for cafés and restaurants.

## What we are building first

The architecture has been broken into a practical rollout so we can ship the core platform before expanding into automation and analytics.

1. Workspace foundation, app shell, and production-grade config
2. Shared domain contracts, validations, and Supabase helpers
3. Marketing site and restaurant discovery / slug entry flow
4. Admin dashboard shell for a single café admin
5. Menu, category, and table management
6. Customer ordering, cart, and order tracking
7. Loyalty, analytics, notifications, and operational hardening

## Scope decisions

- Chatbot / Jarvis is intentionally out of scope for now.
- Each café has one admin user only. We are not adding owner/staff role flows in this phase.
- The first production target is a stable ordering and admin foundation, not every future feature from the architecture document.

## Repo layout

- `apps/web` - Next.js app for marketing, customer ordering, and admin dashboard
- `packages/shared` - Shared domain types and validation schemas
- `supabase` - Schema and RLS migrations

