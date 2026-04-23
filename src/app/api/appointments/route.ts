import { NextResponse } from "next/server";
import { appointmentFormSchema } from "@/lib/schema";
import { createAppointment } from "@/lib/appointments";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = appointmentFormSchema.parse(payload);
    const result = await createAppointment(input);
    const whatsappUrl = buildWhatsappUrl(input);

    return NextResponse.json({
      success: true,
      mode: result.mode,
      recordId: result.id,
      whatsappUrl
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "No se pudo procesar la solicitud."
      },
      { status: 400 }
    );
  }
}
