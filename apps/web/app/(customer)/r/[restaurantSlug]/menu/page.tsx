import { MenuBrowser } from "@/components/customer/menu-browser";

export default function MenuPage({
  params,
  searchParams
}: {
  params: { restaurantSlug: string };
  searchParams?: { table?: string };
}) {
  return (
    <MenuBrowser
      restaurantSlug={params.restaurantSlug}
      tableId={searchParams?.table}
    />
  );
}
