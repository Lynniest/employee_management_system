import { ok, fail, parseJson, handleApiError } from "@/lib/api";
import { requireAuthenticated, requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const auth = await requireAuthenticated(request);

    const row = await prisma.request.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: auth.organization.id,
        ...(auth.user.role === "employee" ? { userId: auth.user.id } : {})
      },
      include: { user: true }
    });

    if (!row) return fail("Request not found", 404);

    return ok({
      id: row.id,
      employeeId: row.userId,
      employeeName: row.user.name,
      type: row.type,
      status: row.status,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      details: row.details
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { organization } = await requireManager(request);
    const body = await parseJson(request);

    const existing = await prisma.request.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: organization.id
      }
    });

    if (!existing) return fail("Request not found", 404);

    const row = await prisma.request.update({
      where: { id: resolvedParams.id },
      data: {
        status: body.status ?? existing.status,
        details: body.details ?? existing.details,
        reviewedAt: new Date()
      },
      include: { user: true }
    });

    return ok({
      id: row.id,
      employeeId: row.userId,
      employeeName: row.user.name,
      type: row.type,
      status: row.status,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      details: row.details
    });
  } catch (error) {
    return handleApiError(error);
  }
}