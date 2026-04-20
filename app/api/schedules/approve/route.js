import { ok, fail, handleApiError } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { organization } = await requireManager(request);

    const latestDraft = await prisma.schedule.findFirst({
      where: {
        organizationId: organization.id,
        status: "Draft"
      },
      orderBy: { createdAt: "desc" }
    });

    if (!latestDraft) {
      return fail("No draft schedule found", 404);
    }

    const updated = await prisma.schedule.update({
      where: { id: latestDraft.id },
      data: {
        status: "Published"
      }
    });

    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}