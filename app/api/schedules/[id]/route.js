export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, fail, parseJson, handleApiError } from "@/lib/api";
import { requireAuthenticated, requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const auth = await requireAuthenticated(request);
    const schedule = await prisma.schedule.findFirst({
      where: { id: params.id, organizationId: auth.organization.id },
      include: {
        assignments: {
          include: { employee: { include: { user: true } } }
        }
      }
    });

    if (!schedule) return fail("Schedule not found", 404);

    return ok({
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
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { organization } = await requireManager(request);
    const body = await parseJson(request);

    const existing = await prisma.schedule.findFirst({
      where: { id: params.id, organizationId: organization.id }
    });

    if (!existing) return fail("Schedule not found", 404);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.schedule.update({
        where: { id: params.id },
        data: {
          weekLabel: body.weekLabel ?? existing.weekLabel,
          status: body.status ?? existing.status,
          fairnessScore: body.fairnessScore ?? existing.fairnessScore,
          coverageRate: body.coverageRate ?? existing.coverageRate
        }
      });

      if (Array.isArray(body.assignments)) {
        await tx.scheduleAssignment.deleteMany({ where: { scheduleId: params.id } });
        for (const item of body.assignments) {
          await tx.scheduleAssignment.create({
            data: {
              scheduleId: params.id,
              employeeId: item.employeeId,
              day: item.day,
              shift: item.shift,
              role: item.role
            }
          });
        }
      }

      return tx.schedule.findUnique({
        where: { id: params.id },
        include: {
          assignments: {
            include: { employee: { include: { user: true } } }
          }
        }
      });
    });

    return ok({
      id: updated.id,
      weekLabel: updated.weekLabel,
      status: updated.status,
      fairnessScore: Number(updated.fairnessScore || 0),
      coverageRate: Number(updated.coverageRate || 0),
      assignments: updated.assignments.map((item) => ({
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

export async function DELETE(request, { params }) {
  try {
    const { organization } = await requireManager(request);
    const existing = await prisma.schedule.findFirst({
      where: { id: params.id, organizationId: organization.id }
    });

    if (!existing) return fail("Schedule not found", 404);
    await prisma.schedule.delete({ where: { id: params.id } });
    return ok({ deleted: true, id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
