import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isServer = typeof window === "undefined";

export function hasSupabaseConfig() {
  return Boolean(url && anonKey && serviceRoleKey);
}

/**
 * Cliente publico para operaciones restringidas por RLS (ej: insertar turnos).
 * Usa la Anon Key y respeta las politicas de seguridad de Supabase.
 */
export function getSupabasePublicClient() {
  if (!url || !anonKey) {
    throw new Error("Faltan variables de Supabase para operar en modo publico.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false
    }
  });
}

/**
 * Cliente administrativo para operaciones del panel (ej: listar/actualizar turnos).
 * Usa la Service Role Key y bypass de politicas RLS.
 * SOLO USAR EN EL SERVIDOR.
 */
export function getSupabaseAdminClient() {
  if (!isServer) {
    throw new Error("SEGURIDAD: getSupabaseAdminClient no puede ejecutarse en el cliente.");
  }

  if (!url || !serviceRoleKey) {
    throw new Error("Faltan variables de Supabase para operar en modo administrativo.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}
