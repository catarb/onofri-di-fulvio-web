import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateScheduledAppointment, type ScheduledAppointmentStatus } from "@/lib/admin-scheduled-appointments";

const statusSchema = z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]);

const patchSchema = z
  .object({
    patientId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().nullable().optional(),
    title: z.string().min(1).optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    status: statusSchema.optional(),
    specialty: z.string().nullable().optional(),
    professional: z.string().nullable().optional(),
    notes: z.string().nullable().optional()
  })
  .superRefine((data, ctx) => {
    if (!data.startsAt && !data.endsAt) return;
    if (!data.startsAt || !data.endsAt) return;
    const start = new Date(data.startsAt);
    const end = new Date(data.endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["startsAt"], message: "Fecha/hora inválida." });
      return;
    }
    if (end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "La hora de fin debe ser posterior a la de inicio." });
    }
  });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const input = patchSchema.parse(body);

    await updateScheduledAppointment(id, {
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      title: input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status as ScheduledAppointmentStatus | undefined,
      specialty: input.specialty,
      professional: input.professional,
      notes: input.notes
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || "Datos inválidos." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "No se pudo actualizar el turno.";
    const status = message.includes("solapado") ? 409 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
