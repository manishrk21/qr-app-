import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  customerSessionToken: string | null;
  restaurantSlug: string | null;
  customerId: string | null;
  tableId: string | null;
  setSession: (input: {
    customerSessionToken: string;
    restaurantSlug: string;
    customerId?: string | null;
    tableId?: string | null;
  }) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      customerSessionToken: null,
      restaurantSlug: null,
      customerId: null,
      tableId: null,
      setSession({ customerSessionToken, restaurantSlug, customerId = null, tableId = null }) {
        set({ customerSessionToken, restaurantSlug, customerId, tableId });
      },
      clearSession() {
        set({
          customerSessionToken: null,
          restaurantSlug: null,
          customerId: null,
          tableId: null
        });
      }
    }),
    { name: "menuflow-session" }
  )
);
