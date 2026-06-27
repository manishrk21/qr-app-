import { createHash, randomInt } from "node:crypto";
import { nanoid } from "nanoid";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  appendItemsToDemoOrder,
  calculateOrderTotals,
  createDemoOrder,
  createDemoOtpRequest,
  getDemoOrder,
  getMenuCatalogBySlug,
  getRestaurantBySlug,
  verifyDemoOtpRequest
} from "@/lib/demo-store";
import type {
  Customer,
  MenuCategory,
  MenuItem,
  OrderStatus,
  Restaurant,
  Table
} from "@menuflow/shared";

// NOTE: This file is deprecated. Use supabase-repository.ts instead.
// Kept for backward compatibility only.

type DatabaseRestaurantRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  currency_code: string;
  tax_rate: number | string;
  logo_url: string | null;
  is_active: boolean;
  is_accepting_orders: boolean;
  loyalty_streak_target: number | string;
  loyalty_reward_description: string | null;
};

type CustomerSessionResult = {
  customerSessionToken: string;
  customer: Customer;
  tableId: string | null;
  expiresAt: string;
};

export async function verifyOtpRequest(input: {
  restaurantSlug: string;
  mobileNumber: string;
  otp: string;
  tableId?: string;
}): Promise<CustomerSessionResult | null> {
  const result = verifyDemoOtpRequest(input);
  if (!result) {
    return null;
  }

  return {
    customerSessionToken: result.customerSessionToken,
    customer: {
      id: result.customer.id,
      restaurantId: input.restaurantSlug,
      mobileNumber: result.customer.mobileNumber,
      name: null,
      isGuest: result.customer.isGuest,
      lastSeenAt: new Date().toISOString()
    },
    tableId: result.tableId ?? null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}
