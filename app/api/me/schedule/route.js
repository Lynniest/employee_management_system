import { ok, handleApiError } from "@/lib/api";
import { requireAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { user, organization } = await requireAuthenticated(request);

    const schedules = await prisma.schedule.findMany({
      where: { organizationId: organization.id },
      include: {
        assignments: {
          where: {
            employee: {
              userId: user.id
            }
          },
          include: {
            employee: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(
      schedules.map((schedule) => ({
        id: schedule.id,
        weekLabel: schedule.weekLabel,
        status: schedule.status,
        assignments: schedule.assignments.map((item) => ({
          id: item.id,
          day: item.day,
          shift: item.shift,
          employeeId: item.employeeId,
          employeeName: item.employee.user.name,
          role: item.role || item.employee.user.position
        }))
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
