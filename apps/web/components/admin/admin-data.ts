import type { MenuItem, Table } from "@/types/domain";

export type AdminMenuSection = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  isActive: boolean;
};

export type AdminMenuItem = MenuItem & {
  categoryName: string;
  stockLabel: string;
};

export type AdminTable = Table & {
  qrPreviewUrl: string;
  shortCode: string;
};

export const demoCategories: AdminMenuSection[] = [
  {
    id: "cat-coffee",
    name: "Coffee",
    description: "Espresso drinks, cold brews, and signature blends.",
    itemCount: 6,
    isActive: true
  },
  {
    id: "cat-breakfast",
    name: "Breakfast",
    description: "Early-hour plates and grab-and-go options.",
    itemCount: 4,
    isActive: true
  },
  {
    id: "cat-dessert",
    name: "Dessert",
    description: "Cakes, pastries, and sweet add-ons.",
    itemCount: 3,
    isActive: false
  }
];

export const demoMenuItems: AdminMenuItem[] = [
  {
    id: "item-1",
    restaurantId: "restaurant-1",
    categoryId: "cat-coffee",
    categoryName: "Coffee",
    name: "Flat White",
    description: "Velvety milk with a double ristretto base.",
    price: 180,
    imageUrl: null,
    foodType: "veg",
    isAvailable: true,
    isFeatured: true,
    displayOrder: 1,
    allergens: ["dairy"],
    preparationTimeMinutes: 4,
    stockLabel: "In stock"
  },
  {
    id: "item-2",
    restaurantId: "restaurant-1",
    categoryId: "cat-breakfast",
    categoryName: "Breakfast",
    name: "Masala Omelette",
    description: "Three-egg omelette with herbs and onion relish.",
    price: 220,
    imageUrl: null,
    foodType: "egg",
    isAvailable: true,
    isFeatured: false,
    displayOrder: 2,
    allergens: ["egg"],
    preparationTimeMinutes: 8,
    stockLabel: "Popular"
  },
  {
    id: "item-3",
    restaurantId: "restaurant-1",
    categoryId: "cat-dessert",
    categoryName: "Dessert",
    name: "Chocolate Loaf",
    description: "Slice served warm with cocoa glaze.",
    price: 160,
    imageUrl: null,
    foodType: "veg",
    isAvailable: false,
    isFeatured: false,
    displayOrder: 3,
    allergens: ["gluten", "dairy"],
    preparationTimeMinutes: 6,
    stockLabel: "Out of stock"
  }
];

export const demoTables: AdminTable[] = [
  {
    id: "table-1",
    restaurantId: "restaurant-1",
    label: "Table 1",
    capacity: 2,
    isActive: true,
    qrCodeUrl: null,
    qrPreviewUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=table-1",
    shortCode: "A1"
  },
  {
    id: "table-2",
    restaurantId: "restaurant-1",
    label: "Window Seat",
    capacity: 4,
    isActive: true,
    qrCodeUrl: null,
    qrPreviewUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=table-2",
    shortCode: "W2"
  },
  {
    id: "table-3",
    restaurantId: "restaurant-1",
    label: "Terrace 1",
    capacity: 6,
    isActive: false,
    qrCodeUrl: null,
    qrPreviewUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=table-3",
    shortCode: "T3"
  }
];

export function getMenuCounts(items: AdminMenuItem[]) {
  return {
    total: items.length,
    available: items.filter((item) => item.isAvailable).length,
    featured: items.filter((item) => item.isFeatured).length
  };
}
