import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createScheduledAppointment,
  listScheduledAppointments,
  type ScheduledAppointmentStatus
} from "@/lib/admin-scheduled-appointments";

const statusSchema = z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]);

const createSchema = z
  .object({
    patientId: z.string().uuid(),
    appointmentId: z.string().uuid().optional().nullable(),
    title: z.string().min(1),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    status: statusSchema.default("scheduled"),
    specialty: z.string().optional().nullable(),
    professional: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  })
  .superRefine((data, ctx) => {
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

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const patientId = searchParams.get("patientId") || undefined;
    const status = searchParams.get("status");
    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Math.max(1, Math.min(1000, Number(limitRaw) || 200)) : 200;
    const parsedStatus = statusSchema.safeParse(status);

    const appointments = await listScheduledAppointments({
      from,
      to,
      patientId,
      limit,
      status: parsedStatus.success ? parsedStatus.data : undefined
    });
    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron obtener los turnos.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = createSchema.parse(body);
    const created = await createScheduledAppointment({
      patientId: input.patientId,
      appointmentId: input.appointmentId ?? null,
      title: input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status as ScheduledAppointmentStatus,
      specialty: input.specialty ?? null,
      professional: input.professional ?? null,
      notes: input.notes ?? null
    });
    return NextResponse.json({ success: true, appointment: created });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || "Datos inválidos." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "No se pudo crear el turno.";
    const status = message.includes("solapado") ? 409 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
