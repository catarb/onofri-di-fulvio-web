import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieName, getAdminCredentials, signAdminToken } from "@/lib/admin-auth";

// Rate limiting configuration: 5 failed attempts every 15 minutes
const FAILED_ATTEMPTS_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failedAttemptsMap = new Map<string, { count: number; lastAttempt: number }>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const record = failedAttemptsMap.get(ip);

  // Check if blocked
  if (record && record.count >= FAILED_ATTEMPTS_LIMIT) {
    if (now - record.lastAttempt < WINDOW_MS) {
      return NextResponse.json(
        { success: false, message: "Demasiados intentos. Probá nuevamente en unos minutos." },
        { status: 429 }
      );
    } else {
      // Reset after window expires
      failedAttemptsMap.delete(ip);
    }
  }

  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };
    const creds = getAdminCredentials();

    if (email !== creds.email || password !== creds.password) {
      // Record failure
      const currentRecord = failedAttemptsMap.get(ip) || { count: 0, lastAttempt: now };
      if (now - currentRecord.lastAttempt > WINDOW_MS) {
        currentRecord.count = 1;
      } else {
        currentRecord.count += 1;
      }
      currentRecord.lastAttempt = now;
      failedAttemptsMap.set(ip, currentRecord);

      return NextResponse.json({ success: false, message: "Credenciales inválidas." }, { status: 401 });
    }

    // Success: Reset failures for this IP
    failedAttemptsMap.delete(ip);

    // Generate secure JWT
    const token = await signAdminToken();

    const store = await cookies();
    store.set(getAdminCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8 // 8 hours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "No se pudo iniciar sesión.";
    return NextResponse.json(
      { 
        success: false, 
        message: process.env.NODE_ENV === "production" ? "No se pudo iniciar sesión." : errorMessage 
      }, 
      { status: 400 }
    );
  }
}
