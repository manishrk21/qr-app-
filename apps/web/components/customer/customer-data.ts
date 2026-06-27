import type { MenuCategory, MenuItem, OrderStatus, Restaurant, Table } from "@/types/domain";

export const demoRestaurant: Restaurant = {
  id: "restaurant-1",
  slug: "demo-cafe",
  name: "Demo Cafe",
  description: "A warm neighborhood café with a QR-first ordering flow.",
  phone: "+918888888888",
  email: "hello@democafe.example",
  address: "MG Road",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  currencyCode: "INR",
  taxRate: 5,
  logoUrl: null,
  isActive: true,
  isAcceptingOrders: true,
  loyaltyStreakTarget: 5,
  loyaltyRewardDescription: "Get one free drink on every fifth visit."
};

export const demoCustomerCategories: MenuCategory[] = [
  {
    id: "cat-featured",
    restaurantId: demoRestaurant.id,
    name: "Featured",
    description: "Our most ordered picks right now.",
    displayOrder: 1,
    isActive: true
  },
  {
    id: "cat-coffee",
    restaurantId: demoRestaurant.id,
    name: "Coffee",
    description: "Hot and cold espresso-based drinks.",
    displayOrder: 2,
    isActive: true
  },
  {
    id: "cat-food",
    restaurantId: demoRestaurant.id,
    name: "Food",
    description: "Breakfast plates and light meals.",
    displayOrder: 3,
    isActive: true
  },
  {
    id: "cat-dessert",
    restaurantId: demoRestaurant.id,
    name: "Dessert",
    description: "Sweet finishes and bakery items.",
    displayOrder: 4,
    isActive: true
  }
];

export const demoCustomerTables: Table[] = [
  {
    id: "table-1",
    restaurantId: demoRestaurant.id,
    label: "Table 1",
    capacity: 2,
    isActive: true,
    qrCodeUrl: null
  },
  {
    id: "table-2",
    restaurantId: demoRestaurant.id,
    label: "Window Seat",
    capacity: 4,
    isActive: true,
    qrCodeUrl: null
  }
];

export const demoCustomerItems: MenuItem[] = [
  {
    id: "item-1",
    restaurantId: demoRestaurant.id,
    categoryId: "cat-featured",
    name: "Signature Cold Brew",
    description: "Slow-steeped and served over ice with a citrus aroma.",
    price: 190,
    imageUrl: null,
    foodType: "veg",
    isAvailable: true,
    isFeatured: true,
    displayOrder: 1,
    allergens: [],
    preparationTimeMinutes: 4
  },
  {
    id: "item-2",
    restaurantId: demoRestaurant.id,
    categoryId: "cat-coffee",
    name: "Flat White",
    description: "Silky milk texture with a stronger espresso profile.",
    price: 180,
    imageUrl: null,
    foodType: "veg",
    isAvailable: true,
    isFeatured: true,
    displayOrder: 2,
    allergens: ["dairy"],
    preparationTimeMinutes: 4
  },
  {
    id: "item-3",
    restaurantId: demoRestaurant.id,
    categoryId: "cat-food",
    name: "Masala Omelette",
    description: "Three-egg omelette with coriander and onion relish.",
    price: 220,
    imageUrl: null,
    foodType: "egg",
    isAvailable: true,
    isFeatured: false,
    displayOrder: 3,
    allergens: ["egg"],
    preparationTimeMinutes: 8
  },
  {
    id: "item-4",
    restaurantId: demoRestaurant.id,
    categoryId: "cat-dessert",
    name: "Chocolate Loaf",
    description: "Warm slice with cocoa glaze and whipped cream.",
    price: 160,
    imageUrl: null,
    foodType: "veg",
    isAvailable: false,
    isFeatured: false,
    displayOrder: 4,
    allergens: ["gluten", "dairy"],
    preparationTimeMinutes: 6
  }
];

export const customerOrderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed"
];

export function getCustomerCategoryName(categoryId: string) {
  return demoCustomerCategories.find((category) => category.id === categoryId)?.name ?? "Uncategorized";
}
