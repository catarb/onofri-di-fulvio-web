import { getSupabasePublicClient, getSupabaseAdminClient } from "./supabase";

async function runSecurityTests() {
  console.log("=== INICIANDO AUDITORÍA TÉCNICA DE RLS ===\n");

  const publicClient = getSupabasePublicClient();
  const adminClient = getSupabaseAdminClient();

  // 1. Prueba: Inserción Pública Correcta
  console.log("1. Probando inserción pública legítima (status: nuevo)...");
  const { error: insertOkError } = await publicClient
    .from("appointments")
    .insert({
      full_name: "Test RLS OK",
      phone: "12345678",
      consultation_reason: "Prueba de seguridad",
      specialty_slug: "odontologia-general",
      professional_slug: "dra-onofri",
      coverage_type: "particular",
      status: "nuevo"
    });
  console.log(insertOkError ? `❌ FALLÓ: ${insertOkError.message}` : "✅ OK: Inserción permitida.");

  // 2. Prueba: Inserción Pública Maliciosa
  console.log("\n2. Probando inserción maliciosa (status: aceptado)...");
  const { error: insertFailError } = await publicClient
    .from("appointments")
    .insert({
      full_name: "Ataque RLS",
      phone: "00000000",
      consultation_reason: "Intento de bypass",
      specialty_slug: "odontologia-general",
      professional_slug: "dra-onofri",
      coverage_type: "particular",
      status: "aceptado"
    });
  console.log(insertFailError ? `✅ BLOQUEADO (Correcto): ${insertFailError.message}` : "❌ FALLÓ: ¡Se permitió insertar status='aceptado'!");

  // 3. Prueba: Lectura Anónima
  console.log("\n3. Probando lectura anónima (SELECT)...");
  const { data: selectData, error: selectError } = await publicClient
    .from("appointments")
    .select("*")
    .limit(1);
  if (selectError) {
    console.log(`✅ BLOQUEADO (Correcto): ${selectError.message}`);
  } else if (selectData && selectData.length > 0) {
    console.log("❌ FALLÓ: Un usuario anónimo pudo leer datos.");
  } else {
    console.log("✅ OK: No se devolvieron datos (Lista vacía).");
  }

  // 4. Prueba: Funcionalidad Admin
  console.log("\n4. Probando lectura administrativa (Service Role)...");
  const { data: adminData, error: adminError } = await adminClient
    .from("appointments")
    .select("id")
    .limit(1);
  console.log(adminError ? `❌ FALLÓ: El admin no puede leer: ${adminError.message}` : "✅ OK: El admin sigue teniendo acceso total.");

  console.log("\n=== FIN DE LA AUDITORÍA ===");
}

runSecurityTests().catch(console.error);
