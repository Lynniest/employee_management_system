export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, handleApiError } from "@/lib/api";
import { requireAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { user, organization } = await requireAuthenticated(request);
    const items = await prisma.request.findMany({
      where: {
        organizationId: organization.id,
        userId: user.id
      },
      orderBy: { submittedAt: "desc" }
    });
    return ok(items);
  } catch (error) {
    return handleApiError(error);
  }
}
