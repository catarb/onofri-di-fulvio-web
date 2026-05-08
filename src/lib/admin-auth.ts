import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_COOKIE = "odf_admin_session";
const SECRET = process.env.ADMIN_JWT_SECRET;
const SECRET_KEY = SECRET ? new TextEncoder().encode(SECRET) : null;

function getSecretKey() {
  if (!SECRET_KEY) {
    throw new Error("CRITICO: ADMIN_JWT_SECRET no esta definida en las variables de entorno.");
  }
  return SECRET_KEY;
}

export async function signAdminToken() {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const payload = await verifyAdminToken(token);
  return !!payload;
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
