export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, created, fail, parseJson, handleApiError } from "@/lib/api";
import { requireAuthenticated, requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const auth = await requireAuthenticated(request);
    const { searchParams } = new URL(request.url);
    const weekLabel = searchParams.get("weekLabel");

    const schedules = await prisma.schedule.findMany({
      where: {
        organizationId: auth.organization.id,
        ...(weekLabel ? { weekLabel } : {})
      },
      include: {
        assignments: {
          include: {
            employee: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const mapped = schedules.map((schedule) => ({
      id: schedule.id,
      weekLabel: schedule.weekLabel,
      status: schedule.status,
      fairnessScore: Number(schedule.fairnessScore || 0),
      coverageRate: Number(schedule.coverageRate || 0),
      assignments: schedule.assignments
        .filter((item) => auth.user.role === "manager" || item.employee.userId === auth.user.id)
        .map((item) => ({
          id: item.id,
          day: item.day,
          shift: item.shift,
          employeeId: item.employeeId,
          employeeName: item.employee.user.name,
          role: item.role || item.employee.user.position
        }))
    }));

    return ok(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const { organization } = await requireManager(request);
    const body = await parseJson(request);

    if (!body.weekLabel) return fail("weekLabel is required", 400);

    const schedule = await prisma.schedule.create({
      data: {
        organizationId: organization.id,
        weekLabel: body.weekLabel,
        status: body.status || "Draft",
        fairnessScore: body.fairnessScore ?? 0,
        coverageRate: body.coverageRate ?? 0,
        assignments: {
          create: (body.assignments || []).map((item) => ({
            employeeId: item.employeeId,
            day: item.day,
            shift: item.shift,
            role: item.role
          }))
        }
      },
      include: {
        assignments: {
          include: { employee: { include: { user: true } } }
        }
      }
    });

    return created({
      id: schedule.id,
      weekLabel: schedule.weekLabel,
      status: schedule.status,
      fairnessScore: Number(schedule.fairnessScore || 0),
      coverageRate: Number(schedule.coverageRate || 0),
      assignments: schedule.assignments.map((item) => ({
        id: item.id,
        day: item.day,
        shift: item.shift,
        employeeId: item.employeeId,
        employeeName: item.employee.user.name,
        role: item.role || item.employee.user.position
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
