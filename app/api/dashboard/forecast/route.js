export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, handleApiError } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { organization } = await requireManager(request);
    const forecasts = await prisma.forecast.findMany({
      where: { organizationId: organization.id },
      orderBy: [{ day: "asc" }, { shift: "asc" }]
    });
    return ok(forecasts);
  } catch (error) {
    return handleApiError(error);
  }
}
