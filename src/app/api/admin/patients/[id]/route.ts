import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPatientDetailById, updatePatient } from "@/lib/admin-patients";

const updatePatientSchema = z.object({
  fullName: z.string().min(1).min(2).optional(),
  dni: z.string().optional(),
  phone: z.string().min(1).min(8).optional(),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  birthDate: z.string().optional(),
  coverageType: z.enum(["particular", "obra_social", "prepaga"]).optional(),
  coverageName: z.string().optional(),
  affiliateNumber: z.string().optional(),
  notes: z.string().optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const detail = await getPatientDetailById(id);

    if (!detail) {
      return NextResponse.json({ success: false, message: "Paciente no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, patient: detail.patient, appointments: detail.appointments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const input = updatePatientSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    if (input.fullName !== undefined) updateData.fullName = input.fullName;
    if (input.dni !== undefined) updateData.dni = input.dni ?? null;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.email !== undefined) updateData.email = input.email ?? null;
    if (input.birthDate !== undefined) updateData.birthDate = input.birthDate ?? null;
    if (input.coverageType !== undefined) updateData.coverageType = input.coverageType;
    if (input.coverageName !== undefined) updateData.coverageName = input.coverageName ?? null;
    if (input.affiliateNumber !== undefined) updateData.affiliateNumber = input.affiliateNumber ?? null;
    if (input.notes !== undefined) updateData.notes = input.notes ?? null;

    await updatePatient(id, {
      fullName: updateData.fullName as string | undefined,
      dni: updateData.dni as string | undefined,
      phone: updateData.phone as string | undefined,
      email: updateData.email as string | undefined,
      birthDate: updateData.birthDate as string | undefined,
      coverageType: updateData.coverageType as "particular" | "obra_social" | "prepaga" | undefined,
      coverageName: updateData.coverageName as string | undefined,
      affiliateNumber: updateData.affiliateNumber as string | undefined,
      notes: updateData.notes as string | undefined
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        { success: false, message: firstIssue?.message || "Datos inválidos." },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "No se pudo actualizar el paciente.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
