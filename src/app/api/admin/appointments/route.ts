import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createPatientFromAppointmentAndLink,
  getAdminAppointments,
  linkAppointmentToPatient,
  updateAppointmentStatus
} from "@/lib/admin-appointments";

const statusSchema = z.enum(["nuevo", "contactado", "aceptado", "rechazado"]);
const linkSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid()
});
const createAndLinkSchema = z.object({
  appointmentId: z.string().uuid()
});

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") || "todos";
  const specialtyParam = searchParams.get("specialty") || "todas";
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const q = searchParams.get("q") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const pageSize = Math.max(1, Math.min(200, Number(searchParams.get("pageSize") || "20") || 20));

  const result = await getAdminAppointments({
    status: statusParam as "todos" | "nuevo" | "contactado" | "aceptado" | "rechazado",
    specialty: specialtyParam,
    from,
    to,
    q,
    page,
    pageSize
  });

  return NextResponse.json({
    success: true,
    appointments: result.data,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = z.string().min(1).parse(body.id);
    const status = statusSchema.parse(body.status);

    await updateAppointmentStatus(id, status);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "No se pudo actualizar el estado." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = z.enum(["link-existing", "create-and-link"]).parse(body.action);

    if (action === "link-existing") {
      const { appointmentId, patientId } = linkSchema.parse(body);
      const result = await linkAppointmentToPatient(appointmentId, patientId);

      if (result.mode === "already-linked") {
        return NextResponse.json(
          { success: false, code: "already_linked", message: "Esta solicitud ya está vinculada." },
          { status: 409 }
        );
      }

      return NextResponse.json({ success: true, message: "Solicitud vinculada al paciente." });
    }

    const { appointmentId } = createAndLinkSchema.parse(body);
    const result = await createPatientFromAppointmentAndLink(appointmentId);

    if (result.mode === "already-linked") {
      return NextResponse.json(
        { success: false, code: "already_linked", message: "Esta solicitud ya está vinculada." },
        { status: 409 }
      );
    }

    if (result.mode === "possible-duplicates") {
      return NextResponse.json(
        {
          success: false,
          code: "possible_duplicates",
          message: "Encontramos posibles pacientes duplicados. Te recomendamos vincular uno existente.",
          matches: result.matches
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, message: "Paciente creado y vinculado correctamente." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar la vinculación.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
