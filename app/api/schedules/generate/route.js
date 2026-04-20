import { ok, handleApiError } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SHIFTS = ["Morning", "Afternoon", "Evening"];

function availabilityBonus(status) {
  if (status === "Preferred") return 6;
  if (status === "Available") return 4;
  if (status === "Unavailable") return -100;
  return 0;
}

function buildForecastMap(forecasts) {
  const map = new Map();
  for (const item of forecasts) {
    map.set(`${item.day}__${item.shift}`, item);
  }
  return map;
}

export async function POST(request) {
  try {
    const { organization } = await requireManager(request);

    const [employees, forecasts] = await Promise.all([
      prisma.employee.findMany({
        where: {
          organizationId: organization.id,
          status: "Active"
        },
        include: {
          user: true,
          availabilities: true
        }
      }),
      prisma.forecast.findMany({
        where: { organizationId: organization.id }
      })
    ]);

    if (!employees.length) {
      throw Object.assign(new Error("No active employees found"), {
        status: 400
      });
    }

    // archive old drafts
    await prisma.schedule.updateMany({
      where: {
        organizationId: organization.id,
        status: "Draft"
      },
      data: {
        status: "Archived"
      }
    });

    const schedule = await prisma.schedule.create({
      data: {
        organizationId: organization.id,
        weekLabel: `AI Generated ${new Date().toLocaleDateString()}`,
        status: "Draft",
        fairnessScore: 0,
        coverageRate: 0
      }
    });

    const forecastMap = buildForecastMap(forecasts);
    const assignments = [];

    // track total load per employee
    const workload = new Map(employees.map((e) => [e.id, 0]));

    // IMPORTANT: one shift max per employee per day
    const perDayAssigned = new Map(); // key: employeeId__day => 0/1

    for (const day of DAYS) {
      for (const shift of SHIFTS) {
        const requiredCount = Math.max(
          1,
          forecastMap.get(`${day}__${shift}`)?.requiredStaff || 1
        );

        const usedInThisSlot = new Set();

        for (let i = 0; i < requiredCount; i++) {
          const ranked = employees
            .map((employee) => {
              const availability = employee.availabilities.find(
                (item) => item.day === day
              );

              const availabilityStatus = availability?.status || "Unknown";
              const alreadyAssignedThatDay =
                (perDayAssigned.get(`${employee.id}__${day}`) || 0) > 0;
              const alreadyUsedInSlot = usedInThisSlot.has(employee.id);
              const currentLoad = workload.get(employee.id) || 0;

              let score = 0;
              score += availabilityBonus(availabilityStatus);

              if (employee.user.preferredShift === shift) score += 2;

              // HARD BLOCK: no 2 shifts same day
              if (alreadyAssignedThatDay) score -= 1000;

              // HARD BLOCK: no duplicate in same slot
              if (alreadyUsedInSlot) score -= 1000;

              // fairness
              score -= currentLoad;

              // slight overtime pressure
              const weeklyHoursTarget = employee.user.weeklyHours || 40;
              if (currentLoad * 8 >= weeklyHoursTarget) score -= 3;

              return { employee, score };
            })
            .filter((item) => item.score > -100)
            .sort((a, b) => b.score - a.score);

          const best = ranked[0];
          if (!best) continue;

          assignments.push({
            scheduleId: schedule.id,
            employeeId: best.employee.id,
            day,
            shift,
            role: best.employee.user.position || "Staff"
          });

          usedInThisSlot.add(best.employee.id);
          workload.set(
            best.employee.id,
            (workload.get(best.employee.id) || 0) + 1
          );
          perDayAssigned.set(`${best.employee.id}__${day}`, 1);
        }
      }
    }

    if (assignments.length) {
      await prisma.scheduleAssignment.createMany({
        data: assignments
      });
    }

    const loads = Array.from(workload.values());
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);

    const fairnessScore = Number(
      Math.max(0, 10 - (maxLoad - minLoad) * 1.2).toFixed(1)
    );

    const totalRequired = DAYS.reduce((sum, day) => {
      return (
        sum +
        SHIFTS.reduce((slotSum, shift) => {
          return (
            slotSum +
            Math.max(1, forecastMap.get(`${day}__${shift}`)?.requiredStaff || 1)
          );
        }, 0)
      );
    }, 0);

    const coverageRate = Number(
      ((assignments.length / totalRequired) * 100).toFixed(1)
    );

    const updated = await prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        fairnessScore,
        coverageRate
      },
      include: {
        assignments: {
          include: {
            employee: {
              include: {
                user: true
              }
            }
          }
        }
      }
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