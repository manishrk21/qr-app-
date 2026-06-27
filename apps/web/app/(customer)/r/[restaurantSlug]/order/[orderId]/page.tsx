import { OrderTracker } from "@/components/customer/order-tracker";

export default function OrderTrackingPage({
  params,
  searchParams
}: {
  params: { restaurantSlug: string; orderId: string };
  searchParams?: { table?: string };
}) {
  return (
    <OrderTracker
      restaurantSlug={params.restaurantSlug}
      orderId={params.orderId}
      tableId={searchParams?.table}
    />
  );
}
