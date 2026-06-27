import { CartSummary } from "@/components/customer/cart-summary";

export default function CartPage({
  params,
  searchParams
}: {
  params: { restaurantSlug: string };
  searchParams?: { table?: string };
}) {
  return (
    <CartSummary
      restaurantSlug={params.restaurantSlug}
      tableId={searchParams?.table}
    />
  );
}
