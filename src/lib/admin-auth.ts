import { cookies } from "next/headers";

const ADMIN_COOKIE = "odf_admin_session";

export async function isAdminAuthenticated() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}

export function getAdminCookieName() {
  return ADMIN_COOKIE;
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@onofri.local",
    password: process.env.ADMIN_PASSWORD || "admin123"
  };
}
