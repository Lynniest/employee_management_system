export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, created, parseJson, handleApiError } from "@/lib/api";
import { requireAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const auth = await requireAuthenticated(request);
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get("mine") === "true";

    const requests = await prisma.request.findMany({
      where: {
        organizationId: auth.organization.id,
        ...(mineOnly || auth.user.role === "employee" ? { userId: auth.user.id } : {})
      },
      include: { user: true },
      orderBy: { submittedAt: "desc" }
    });

    return ok(
      requests.map((item) => ({
        id: item.id,
        employeeId: item.userId,
        employeeName: item.user.name,
        type: item.type,
        status: item.status,
        submittedAt: item.submittedAt,
        reviewedAt: item.reviewedAt,
        details: item.details
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const { user, organization } = await requireAuthenticated(request);
    const body = await parseJson(request);

    const row = await prisma.request.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        type: body.type,
        details: body.details || {}
      }
    });

    return created(row);
  } catch (error) {
    return handleApiError(error);
  }
}
