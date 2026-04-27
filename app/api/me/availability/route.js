export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, parseJson, handleApiError } from "@/lib/api";
import { requireAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getEmployee(userId, organizationId) {
  return prisma.employee.findFirst({
    where: {
      organizationId,
      userId
    }
  });
}

export async function GET(request) {
  try {
    const { user, organization } = await requireAuthenticated(request);
    const employee = await getEmployee(user.id, organization.id);
    const items = employee
      ? await prisma.availability.findMany({
          where: { employeeId: employee.id },
          orderBy: { createdAt: "asc" }
        })
      : [];
    return ok(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request) {
  try {
    const { user, organization } = await requireAuthenticated(request);
    const employee = await getEmployee(user.id, organization.id);
    if (!employee) {
      throw Object.assign(new Error("Employee profile not found"), { status: 404 });
    }

    const body = await parseJson(request);
    const rows = Array.isArray(body.availability) ? body.availability : [];

    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { employeeId: employee.id } }),
      ...rows.map((item) =>
        prisma.availability.create({
          data: {
            employeeId: employee.id,
            day: item.day,
            status: item.status,
            timeRange: item.timeRange
          }
        })
      )
    ]);

    return ok(await prisma.availability.findMany({ where: { employeeId: employee.id } }));
  } catch (error) {
    return handleApiError(error);
  }
}
