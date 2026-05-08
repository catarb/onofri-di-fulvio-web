import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildMonthlyReportCsv } from "@/lib/admin-reports";

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100)
});

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      month: searchParams.get("month"),
      year: searchParams.get("year")
    });

    const report = await buildMonthlyReportCsv({ month: parsed.month, year: parsed.year });
    const utf16leBody = Buffer.from(report.content, "utf16le");
    const bom = Buffer.from([0xff, 0xfe]);
    const bytes = new Uint8Array(Buffer.concat([bom, utf16leBody]));

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-16le",
        "Content-Disposition": `attachment; filename="${report.filename}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Mes o año inválido." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "No se pudo generar el reporte.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
