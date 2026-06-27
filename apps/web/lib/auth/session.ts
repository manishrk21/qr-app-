const ADMIN_SESSION_COOKIE = "menuflow_admin_session";
const CUSTOMER_SESSION_COOKIE = "menuflow_customer_session";

type CookieStore = {
  get(name: string): { value: string } | undefined;
};

export function getAdminSessionToken(cookieStore: CookieStore) {
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
}

export function getCustomerSessionToken(cookieStore: CookieStore) {
  return cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value ?? null;
}

export function isProtectedAdminRoute(pathname: string) {
  return pathname.startsWith("/admin") && pathname !== "/admin/login";
}
