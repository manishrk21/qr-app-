export function shouldRedirectToAdminLogin(pathname: string, hasSession: boolean) {
  if (!pathname.startsWith("/admin")) {
    return false;
  }

  if (pathname === "/admin/login") {
    return false;
  }

  return !hasSession;
}
