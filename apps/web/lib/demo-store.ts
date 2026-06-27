import { nanoid } from "nanoid";
import {
  demoCustomerCategories,
  demoCustomerItems,
  demoCustomerTables,
  demoRestaurant
} from "@/components/customer/customer-data";
import type { MenuItem } from "@/types/domain";

type OtpRequestRecord = {
  id: string;
  restaurantSlug: string;
  mobileNumber: string;
  otp: string;
  isUsed: boolean;
  expiresAt: string;
  tableId?: string;
};

type DemoOrder = {
  id: string;
  restaurantSlug: string;
  tableId?: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed";
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  createdAt: string;
};

const otpRequests = new Map<string, OtpRequestRecord>();
const orders = new Map<string, DemoOrder>();

export function getRestaurantBySlug(slug: string) {
  return slug === demoRestaurant.slug ? demoRestaurant : null;
}

export function getMenuCatalogBySlug(slug: string) {
  if (slug !== demoRestaurant.slug) {
    return null;
  }

  return {
    restaurant: demoRestaurant,
    categories: demoCustomerCategories,
    items: demoCustomerItems,
    tables: demoCustomerTables
  };
}

export function createDemoOtpRequest(input: {
  restaurantSlug: string;
  mobileNumber: string;
  tableId?: string;
}) {
  const id = `otp_${nanoid(10)}`;
  const record: OtpRequestRecord = {
    id,
    restaurantSlug: input.restaurantSlug,
    mobileNumber: input.mobileNumber,
    otp: "123456",
    isUsed: false,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    tableId: input.tableId
  };

  otpRequests.set(id, record);
  return record;
}

export function verifyDemoOtpRequest(input: {
  restaurantSlug: string;
  mobileNumber: string;
  otp: string;
  tableId?: string;
}) {
  const match = [...otpRequests.values()]
    .reverse()
    .find(
      (entry) =>
        entry.restaurantSlug === input.restaurantSlug &&
        entry.mobileNumber === input.mobileNumber &&
        entry.otp === input.otp &&
        !entry.isUsed
    );

  if (!match) {
    return null;
  }

  match.isUsed = true;
  return {
    customerSessionToken: `session_${nanoid(16)}`,
    customer: {
      id: `cust_${nanoid(8)}`,
      mobileNumber: input.mobileNumber,
      restaurantSlug: input.restaurantSlug,
      isGuest: false
    },
    tableId: input.tableId ?? match.tableId ?? null
  };
}

export function calculateOrderTotals(
  items: Array<{ quantity: number; unitPrice: number }>
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = Math.round(subtotal * 0.05);
  return {
    subtotal,
    taxAmount,
    totalAmount: subtotal + taxAmount
  };
}

export function createDemoOrder(input: {
  restaurantSlug: string;
  tableId?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  notes?: string;
}) {
  const catalog = getMenuCatalogBySlug(input.restaurantSlug);
  if (!catalog) {
    return null;
  }

  const orderItems = input.items.map((item) => {
    const menuItem = catalog.items.find(
      (entry) => entry.id === item.menuItemId
    ) as MenuItem | undefined;
    if (!menuItem) {
      throw new Error(`Unknown menu item: ${item.menuItemId}`);
    }

    const unitPrice = menuItem.price;
    const lineTotal = unitPrice * item.quantity;
    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal
    };
  });

  const totals = calculateOrderTotals(orderItems);
  const order: DemoOrder = {
    id: `ord_${nanoid(10)}`,
    restaurantSlug: input.restaurantSlug,
    tableId: input.tableId,
    status: "preparing",
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    totalAmount: totals.totalAmount,
    items: orderItems,
    createdAt: new Date().toISOString()
  };

  orders.set(order.id, order);
  return order;
}

export function getDemoOrder(orderId: string) {
  return orders.get(orderId) ?? null;
}

export function appendItemsToDemoOrder(input: {
  orderId: string;
  restaurantSlug: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}) {
  const existing = orders.get(input.orderId);
  if (!existing || existing.restaurantSlug !== input.restaurantSlug) {
    return null;
  }

  const catalog = getMenuCatalogBySlug(input.restaurantSlug);
  if (!catalog) {
    return null;
  }

  const appendedItems = input.items.map((item) => {
    const menuItem = catalog.items.find(
      (entry) => entry.id === item.menuItemId
    ) as MenuItem | undefined;
    if (!menuItem) {
      throw new Error(`Unknown menu item: ${item.menuItemId}`);
    }

    const unitPrice = menuItem.price;
    const lineTotal = unitPrice * item.quantity;
    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal
    };
  });

  const mergedItems = [...existing.items, ...appendedItems];
  const totals = calculateOrderTotals(
    mergedItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }))
  );

  const updatedOrder = {
    ...existing,
    items: mergedItems,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    totalAmount: totals.totalAmount
  };

  orders.set(input.orderId, updatedOrder);
  return updatedOrder;
}
