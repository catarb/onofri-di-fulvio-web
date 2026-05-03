import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieName, getAdminCredentials } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };
    const creds = getAdminCredentials();

    if (email !== creds.email || password !== creds.password) {
      return NextResponse.json({ success: false, message: "Credenciales inválidas." }, { status: 401 });
    }

    const store = await cookies();
    store.set(getAdminCookieName(), "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "No se pudo iniciar sesión." }, { status: 400 });
  }
}
