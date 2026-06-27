import { useCartStore } from "@/stores/cartStore";

export function useCart() {
  const lines = useCartStore((state) => state.lines);
  const totalItems = useCartStore((state) => state.totalItems());
  const subtotal = useCartStore((state) => state.subtotal());

  return {
    lines,
    totalItems,
    subtotal
  };
}
