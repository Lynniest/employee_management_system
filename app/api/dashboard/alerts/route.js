export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, handleApiError } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { organization } = await requireManager(request);
    const alerts = await prisma.alert.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" }
    });
    return ok(alerts);
  } catch (error) {
    return handleApiError(error);
  }
}
