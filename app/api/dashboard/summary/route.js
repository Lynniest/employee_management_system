export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, handleApiError } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { organization } = await requireManager(request);

    const [employeeCount, pendingRequests, schedules] = await Promise.all([
      prisma.employee.count({ where: { organizationId: organization.id } }),
      prisma.request.count({ where: { organizationId: organization.id, status: "Pending" } }),
      prisma.schedule.findMany({
        where: { organizationId: organization.id },
        select: { fairnessScore: true, coverageRate: true }
      })
    ]);

    const fairnessAverage = schedules.length
      ? (schedules.reduce((sum, item) => sum + Number(item.fairnessScore || 0), 0) / schedules.length).toFixed(1)
      : "0.0";

    const coverageAverage = schedules.length
      ? `${Math.round(schedules.reduce((sum, item) => sum + Number(item.coverageRate || 0), 0) / schedules.length)}%`
      : "0%";

    return ok({
      totalEmployees: employeeCount,
      weeklyCoverage: coverageAverage,
      overtimeRisk: `${pendingRequests} Active`,
      fairnessScore: `${fairnessAverage}/10`,
      activeRequests: pendingRequests
    });
  } catch (error) {
    return handleApiError(error);
  }
}
