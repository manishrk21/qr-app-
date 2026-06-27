import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@/types/domain";

type CartLine = {
  item: MenuItem;
  quantity: number;
  notes?: string;
};

type CartState = {
  restaurantSlug: string | null;
  lines: CartLine[];
  setRestaurant: (restaurantSlug: string) => void;
  addItem: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantSlug: null,
      lines: [],
      setRestaurant(restaurantSlug) {
        set({ restaurantSlug });
      },
      addItem(item, quantity = 1) {
        set((state) => {
          const existing = state.lines.find((line) => line.item.id === item.id);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.item.id === item.id
                  ? { ...line, quantity: line.quantity + quantity }
                  : line
              )
            };
          }

          return {
            lines: [...state.lines, { item, quantity }]
          };
        });
      },
      updateQuantity(itemId, quantity) {
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.item.id !== itemId)
              : state.lines.map((line) =>
                  line.item.id === itemId ? { ...line, quantity } : line
                )
        }));
      },
      removeItem(itemId) {
        set((state) => ({
          lines: state.lines.filter((line) => line.item.id !== itemId)
        }));
      },
      clear() {
        set({ lines: [], restaurantSlug: null });
      },
      totalItems() {
        return get().lines.reduce((count, line) => count + line.quantity, 0);
      },
      subtotal() {
        return get().lines.reduce(
          (sum, line) => sum + line.item.price * line.quantity,
          0
        );
      }
    }),
    { name: "menuflow-cart" }
  )
);
