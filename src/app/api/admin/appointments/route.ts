import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminAppointments, updateAppointmentStatus } from "@/lib/admin-appointments";

const statusSchema = z.enum(["nuevo", "contactado", "aceptado", "rechazado"]);

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") || "todos";
  const specialtyParam = searchParams.get("specialty") || "todas";
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const appointments = await getAdminAppointments({
    status: (statusParam as "todos" | "nuevo" | "contactado" | "aceptado" | "rechazado"),
    specialty: specialtyParam,
    from,
    to
  });

  return NextResponse.json({ success: true, appointments });
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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "No se pudo actualizar."
      },
      { status: 400 }
    );
  }
}
