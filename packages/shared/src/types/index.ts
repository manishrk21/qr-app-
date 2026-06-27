export type UUID = string;

export type Restaurant = {
  id: UUID;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  currencyCode: string;
  taxRate: number;
  logoUrl: string | null;
  isActive: boolean;
  isAcceptingOrders: boolean;
  loyaltyStreakTarget: number;
  loyaltyRewardDescription: string | null;
};

export type RestaurantAdmin = {
  id: UUID;
  restaurantId: UUID;
  userId: UUID;
  email: string;
  fullName: string;
};

export type MenuCategory = {
  id: UUID;
  restaurantId: UUID;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type MenuItemFoodType = "veg" | "non_veg" | "egg";

export type MenuItem = {
  id: UUID;
  restaurantId: UUID;
  categoryId: UUID;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  foodType: MenuItemFoodType;
  isAvailable: boolean;
  isFeatured: boolean;
  displayOrder: number;
  allergens: string[];
  preparationTimeMinutes: number | null;
};

export type Table = {
  id: UUID;
  restaurantId: UUID;
  label: string;
  capacity: number | null;
  isActive: boolean;
  qrCodeUrl: string | null;
};

export type Customer = {
  id: UUID;
  restaurantId: UUID;
  mobileNumber: string;
  name: string | null;
  isGuest: boolean;
  lastSeenAt: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancel_requested"
  | "cancelled";

export type Order = {
  id: UUID;
  restaurantId: UUID;
  customerId: UUID;
  tableId: UUID | null;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
};

export type OrderItem = {
  id: UUID;
  orderId: UUID;
  menuItemId: UUID;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialInstructions: string | null;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    message: string;
    code?: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
