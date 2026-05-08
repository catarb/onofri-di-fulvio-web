import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createPatient as libCreatePatient, getPatients, getPatientById } from "@/lib/admin-patients";

const createPatientSchema = z.object({
  fullName: z.string().min(1).min(2),
  dni: z.string().optional(),
  phone: z.string().min(1).min(8),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  birthDate: z.string().optional(),
  coverageType: z.enum(["particular", "obra_social", "prepaga"]).default("particular"),
  coverageName: z.string().optional(),
  affiliateNumber: z.string().optional(),
  notes: z.string().optional()
});

function getCoverageSearchTerms(coverageType: "particular" | "obra_social" | "prepaga" | null, coverageName: string | null) {
  const terms: string[] = [];
  if (coverageType) {
    terms.push(coverageType);
    if (coverageType === "particular") terms.push("particular");
    if (coverageType === "obra_social") {
      terms.push("obra social");
      terms.push("obra_social");
    }
    if (coverageType === "prepaga") terms.push("prepaga");
  }
  if (coverageName) terms.push(coverageName);
  return terms.join(" ").toLowerCase();
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const id = searchParams.get("id");

  try {
    if (id) {
      const patient = await getPatientById(id);
      return NextResponse.json({ success: true, patient });
    }

    const patients = await getPatients();

    let filtered = patients;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = patients.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.dni?.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        getCoverageSearchTerms(p.coverageType, p.coverageName).includes(q)
      );
    }

    return NextResponse.json({ success: true, patients: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = createPatientSchema.parse(body);

    const result = await libCreatePatient({
      fullName: input.fullName,
      dni: input.dni ?? undefined,
      phone: input.phone,
      email: input.email ?? undefined,
      birthDate: input.birthDate ?? undefined,
      coverageType: input.coverageType,
      coverageName: input.coverageName ?? undefined,
      affiliateNumber: input.affiliateNumber ?? undefined,
      notes: input.notes ?? undefined
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
const message = error instanceof z.ZodError 
      ? error.issues[0]?.message || "Datos inválidos." 
      : error instanceof Error
      ? error.message
      : "No se pudo crear el paciente.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}


