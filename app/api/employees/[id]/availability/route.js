import { ok, created, parseJson, handleApiError, fail } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getEmployeeOrFail(employeeId, organizationId) {
  return prisma.employee.findFirst({
    where: { id: employeeId, organizationId }
  });
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { organization } = await requireManager(request);
    const employee = await getEmployeeOrFail(resolvedParams.id, organization.id);
    if (!employee) return fail("Employee not found", 404);

    const rows = await prisma.availability.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "asc" }
    });

    return ok(rows);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { organization } = await requireManager(request);
    const employee = await getEmployeeOrFail(resolvedParams.id, organization.id);
    if (!employee) return fail("Employee not found", 404);

    const body = await parseJson(request);
    const availability = Array.isArray(body.availability) ? body.availability : [];

    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { employeeId: employee.id } }),
      ...availability.map((item) =>
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

    return ok(
      await prisma.availability.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: "asc" }
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { organization } = await requireManager(request);
    const employee = await getEmployeeOrFail(resolvedParams.id, organization.id);
    if (!employee) return fail("Employee not found", 404);

    const body = await parseJson(request);
    const record = await prisma.availability.create({
      data: {
        employeeId: employee.id,
        day: body.day,
        status: body.status,
        timeRange: body.timeRange
      }
    });

    return created(record);
  } catch (error) {
    return handleApiError(error);
  }
}