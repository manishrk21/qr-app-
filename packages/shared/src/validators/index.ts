import { z } from "zod";

export const restaurantSlugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const mobileNumberSchema = z
  .string()
  .min(8)
  .max(20)
  .regex(/^\+?[1-9]\d{7,19}$/, "Use an E.164-style mobile number");

export const otpSchema = z
  .string()
  .length(6)
  .regex(/^\d{6}$/, "OTP must be exactly 6 digits");

export const restaurantSchema = z.object({
  id: z.string().uuid(),
  slug: restaurantSlugSchema,
  name: z.string().min(2).max(120),
  description: z.string().max(500).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().max(250).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  state: z.string().max(120).nullable().optional(),
  pincode: z.string().max(20).nullable().optional(),
  currencyCode: z.string().length(3),
  taxRate: z.number().min(0).max(100),
  logoUrl: z.string().url().nullable().optional(),
  isActive: z.boolean(),
  isAcceptingOrders: z.boolean(),
  loyaltyStreakTarget: z.number().int().min(1).max(100),
  loyaltyRewardDescription: z.string().max(250).nullable().optional()
});

export const menuCategorySchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(250).nullable().optional(),
  displayOrder: z.number().int(),
  isActive: z.boolean()
});

export const menuItemSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  price: z.number().nonnegative(),
  imageUrl: z.string().url().nullable().optional(),
  foodType: z.enum(["veg", "non_veg", "egg"]),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number().int(),
  allergens: z.array(z.string()).default([]),
  preparationTimeMinutes: z.number().int().nonnegative().nullable().optional()
});

export const tableSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  label: z.string().min(1).max(80),
  capacity: z.number().int().positive().nullable().optional(),
  isActive: z.boolean(),
  qrCodeUrl: z.string().url().nullable().optional()
});

export const customerSessionSchema = z.object({
  customerId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  sessionToken: z.string().min(16),
  isGuest: z.boolean(),
  tableId: z.string().uuid().nullable().optional(),
  expiresAt: z.string().datetime()
});

export const createOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  specialInstructions: z.string().max(300).nullable().optional()
});

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  customerId: z.string().uuid(),
  tableId: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  items: z.array(createOrderItemSchema).min(1)
});
