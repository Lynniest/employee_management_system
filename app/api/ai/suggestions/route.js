import { ok, created, parseJson, handleApiError } from "@/lib/api";
import { requireAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractDay(prompt) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];
  const found = days.find((day) => prompt.includes(day));
  return found ? titleCase(found) : null;
}

function extractShift(prompt) {
  if (prompt.includes("morning")) return "Morning";
  if (prompt.includes("afternoon")) return "Afternoon";
  if (prompt.includes("evening") || prompt.includes("night")) return "Evening";
  return null;
}

function detectIntent(prompt) {
  const text = normalize(prompt);

  if (text.includes("approve") && text.includes("request")) return "approve_request";
  if (text.includes("deny") && text.includes("request")) return "deny_request";
  if (
    text.includes("generate schedule") ||
    text.includes("regenerate schedule") ||
    text.includes("rebuild schedule")
  ) return "generate_schedule";

  if ((text.includes("free") || text.includes("available")) && extractDay(text) && extractShift(text)) {
    return "availability_slot";
  }

  if (text.includes("overtime") || text.includes("overload")) return "overtime";
  if (text.includes("fair") || text.includes("balance")) return "fairness";
  if (text.includes("request") || text.includes("leave") || text.includes("swap")) return "requests";
  if (text.includes("coverage") || text.includes("understaff") || text.includes("busiest shift") || text.includes("busy")) {
    return "coverage";
  }
  if (text.includes("summary") || text.includes("overview") || text.includes("status")) return "summary";
  if (text.includes("why")) return "explain";

  return "general";
}

function buildAssignedMap(schedules) {
  const assignedMap = new Map();

  for (const schedule of schedules) {
    for (const assignment of schedule.assignments || []) {
      const slotKey = `${assignment.day}__${assignment.shift}`;
      if (!assignedMap.has(slotKey)) assignedMap.set(slotKey, []);
      assignedMap.get(slotKey).push(assignment);
    }
  }

  return assignedMap;
}

function buildWorkloadMap(schedules) {
  const workloadMap = new Map();

  for (const schedule of schedules) {
    for (const assignment of schedule.assignments || []) {
      const key = assignment.employeeId;

      if (!workloadMap.has(key)) {
        workloadMap.set(key, {
          employeeId: assignment.employeeId,
          employeeName: assignment.employee?.user?.name || "Unknown",
          totalShifts: 0,
          morning: 0,
          afternoon: 0,
          evening: 0,
          assignedDays: new Set(),
          slots: []
        });
      }

      const entry = workloadMap.get(key);
      entry.totalShifts += 1;
      entry.assignedDays.add(assignment.day);
      entry.slots.push(`${assignment.day} ${assignment.shift}`);

      if (assignment.shift === "Morning") entry.morning += 1;
      if (assignment.shift === "Afternoon") entry.afternoon += 1;
      if (assignment.shift === "Evening") entry.evening += 1;
    }
  }

  return workloadMap;
}

function buildAvailabilityMap(rows) {
  const map = new Map();
  for (const row of rows) {
    map.set(`${row.employeeId}__${row.day}`, row);
  }
  return map;
}

function availabilityScore(status) {
  if (status === "Preferred") return 6;
  if (status === "Available") return 4;
  if (status === "Unavailable") return -100;
  return 0;
}

function getAvailabilityLabel(status) {
  if (!status) return "unknown";
  return String(status).toLowerCase();
}

function parseEmployeeName(prompt, employees) {
  const text = normalize(prompt);

  for (const employee of employees) {
    const name = normalize(employee.user?.name || "");
    if (!name) continue;
    if (text.includes(name)) return employee.user.name;

    const first = name.split(" ")[0];
    if (first && text.includes(first)) return employee.user.name;
  }

  return null;
}

function getCandidates({
  employees,
  workloadMap,
  availabilityMap,
  assignedMap,
  targetDay,
  targetShift
}) {
  const slotKey = `${targetDay}__${targetShift}`;

  return employees
    .map((employee) => {
      const workload = workloadMap.get(employee.id) || {
        totalShifts: 0,
        assignedDays: new Set()
      };

      const availability = availabilityMap.get(`${employee.id}__${targetDay}`);
      const availabilityStatus = availability?.status || "Unknown";
      const alreadySameDay = workload.assignedDays.has(targetDay);
      const alreadySameSlot = (assignedMap.get(slotKey) || []).some(
        (item) => item.employeeId === employee.id
      );

      let score = 0;
      score += availabilityScore(availabilityStatus);
      if (employee.user?.preferredShift === targetShift) score += 2;
      if (alreadySameDay) score -= 5;
      if (alreadySameSlot) score -= 100;
      score -= workload.totalShifts;

      return {
        id: employee.id,
        name: employee.user?.name || "Unknown",
        preferredShift: employee.user?.preferredShift || "Unknown",
        totalShifts: workload.totalShifts,
        availabilityStatus,
        timeRange: availability?.timeRange || null,
        alreadySameDay,
        alreadySameSlot,
        score
      };
    })
    .filter((item) => item.availabilityStatus !== "Unavailable")
    .sort((a, b) => b.score - a.score);
}

function getCoverageInsights(forecasts, assignedMap) {
  return forecasts
    .map((forecast) => {
      const assigned = (assignedMap.get(`${forecast.day}__${forecast.shift}`) || []).length;
      const gap = Math.max(0, forecast.requiredStaff - assigned);

      return {
        day: forecast.day,
        shift: forecast.shift,
        requiredStaff: forecast.requiredStaff,
        predictedDemand: forecast.predictedDemand,
        assigned,
        gap
      };
    })
    .sort((a, b) => {
      if (b.gap !== a.gap) return b.gap - a.gap;
      return (b.requiredStaff || 0) - (a.requiredStaff || 0);
    });
}

async function generateSmartSchedule(organizationId) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const SHIFTS = ["Morning", "Afternoon", "Evening"];

  const [employees, forecasts] = await Promise.all([
    prisma.employee.findMany({
      where: { organizationId, status: "Active" },
      include: { user: true, availabilities: true }
    }),
    prisma.forecast.findMany({
      where: { organizationId }
    })
  ]);

  if (!employees.length) {
    return "I could not generate a schedule because there are no active employees.";
  }

  await prisma.schedule.updateMany({
    where: { organizationId, status: "Draft" },
    data: { status: "Archived" }
  });

  const forecastMap = new Map(
    forecasts.map((item) => [`${item.day}__${item.shift}`, item])
  );

  const schedule = await prisma.schedule.create({
    data: {
      organizationId,
      weekLabel: `AI Generated ${new Date().toLocaleDateString()}`,
      status: "Draft",
      fairnessScore: 0,
      coverageRate: 0
    }
  });

  const assignments = [];
  const workload = new Map(employees.map((e) => [e.id, 0]));
  const perDay = new Map();

  for (const day of DAYS) {
    for (const shift of SHIFTS) {
      const requiredCount = Math.max(
        1,
        forecastMap.get(`${day}__${shift}`)?.requiredStaff || 1
      );

      const usedInSlot = new Set();

      for (let i = 0; i < requiredCount; i++) {
        const ranked = employees
          .map((employee) => {
            const availability = employee.availabilities.find((item) => item.day === day);
            const availabilityStatus = availability?.status || "Unknown";
            const sameDayCount = perDay.get(`${employee.id}__${day}`) || 0;
            const currentLoad = workload.get(employee.id) || 0;

            let score = 0;
            score += availabilityScore(availabilityStatus);
            if (employee.user.preferredShift === shift) score += 2;
            if (sameDayCount > 0) score -= 1000;
            if (usedInSlot.has(employee.id)) score -= 1000;
            score -= currentLoad;

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

        usedInSlot.add(best.employee.id);
        workload.set(best.employee.id, (workload.get(best.employee.id) || 0) + 1);
        perDay.set(`${best.employee.id}__${day}`, 1);
      }
    }
  }

  if (assignments.length) {
    await prisma.scheduleAssignment.createMany({ data: assignments });
  }

  const loads = Array.from(workload.values());
  const maxLoad = Math.max(...loads);
  const minLoad = Math.min(...loads);
  const fairnessScore = Number(Math.max(0, 10 - (maxLoad - minLoad) * 1.2).toFixed(1));

  const totalRequired = DAYS.reduce((sum, day) => {
    return sum + SHIFTS.reduce((slotSum, shift) => {
      return slotSum + Math.max(1, forecastMap.get(`${day}__${shift}`)?.requiredStaff || 1);
    }, 0);
  }, 0);

  const coverageRate = Number(((assignments.length / totalRequired) * 100).toFixed(1));

  await prisma.schedule.update({
    where: { id: schedule.id },
    data: { fairnessScore, coverageRate }
  });

  return `I generated a new schedule with ${assignments.length} assignments, fairness score ${fairnessScore}, and coverage ${coverageRate}%.`;
}

async function handleAction(prompt, auth) {
  const text = normalize(prompt);

  if (auth.user.role !== "manager") return null;

  if (text.includes("approve") && text.includes("request")) {
    const latest = await prisma.request.findFirst({
      where: {
        organizationId: auth.organization.id,
        status: "Pending"
      },
      orderBy: { submittedAt: "desc" },
      include: { user: true }
    });

    if (!latest) return "There are no pending requests to approve.";

    await prisma.request.update({
      where: { id: latest.id },
      data: {
        status: "Approved",
        reviewedAt: new Date()
      }
    });

    return `Approved the latest ${latest.type} request from ${latest.user.name}.`;
  }

  if (text.includes("deny") && text.includes("request")) {
    const latest = await prisma.request.findFirst({
      where: {
        organizationId: auth.organization.id,
        status: "Pending"
      },
      orderBy: { submittedAt: "desc" },
      include: { user: true }
    });

    if (!latest) return "There are no pending requests to deny.";

    await prisma.request.update({
      where: { id: latest.id },
      data: {
        status: "Denied",
        reviewedAt: new Date()
      }
    });

    return `Denied the latest ${latest.type} request from ${latest.user.name}.`;
  }

  if (
    text.includes("generate schedule") ||
    text.includes("regenerate schedule") ||
    text.includes("rebuild schedule")
  ) {
    return generateSmartSchedule(auth.organization.id);
  }

  return null;
}

function buildLocalFallbackResponse(prompt, context) {
  const intent = detectIntent(prompt);
  const text = normalize(prompt);
  const day = extractDay(text);
  const shift = extractShift(text);
  const namedEmployee = parseEmployeeName(text, context.employees);

  const workload = Array.from(context.workloadMap.values()).sort(
    (a, b) => b.totalShifts - a.totalShifts
  );

  const busiest = workload[0];
  const leastBusy = [...workload].sort((a, b) => a.totalShifts - b.totalShifts)[0];
  const pendingRequests = context.requests.filter((item) => item.status === "Pending");
  const coverageInsights = getCoverageInsights(context.forecasts, context.assignedMap);
  const topCoverageGap = coverageInsights[0];

  if (intent === "availability_slot") {
    const candidates = getCandidates({
      employees: context.employees,
      workloadMap: context.workloadMap,
      availabilityMap: context.availabilityMap,
      assignedMap: context.assignedMap,
      targetDay: day,
      targetShift: shift
    });

    if (!candidates.length) {
      return `I could not find any available employees for ${day} ${shift}.`;
    }

    const topThree = candidates
      .slice(0, 3)
      .map(
        (item) =>
          `${item.name} (${getAvailabilityLabel(item.availabilityStatus)}, ${item.totalShifts} shifts${item.timeRange ? `, ${item.timeRange}` : ""})`
      )
      .join(", ");

    return `For ${day} ${shift}, the best available employees are ${topThree}.`;
  }

  if (intent === "overtime") {
    if (!busiest) return "I could not find enough schedule data to evaluate overtime.";

    const overloadedTarget =
      namedEmployee &&
      workload.find((item) => item.employeeName.toLowerCase() === namedEmployee.toLowerCase());

    const targetEmployee = overloadedTarget || busiest;
    const targetDay = day || "Friday";
    const targetShift = shift || "Evening";

    const candidates = getCandidates({
      employees: context.employees,
      workloadMap: context.workloadMap,
      availabilityMap: context.availabilityMap,
      assignedMap: context.assignedMap,
      targetDay,
      targetShift
    }).filter((item) => item.id !== targetEmployee.employeeId);

    const replacement = candidates[0];

    if (!replacement) {
      return `${targetEmployee.employeeName} currently has ${targetEmployee.totalShifts} shifts, but I could not find a suitable replacement for ${targetDay} ${targetShift}.`;
    }

    return `${targetEmployee.employeeName} currently has ${targetEmployee.totalShifts} shifts. I recommend moving one ${targetDay} ${targetShift} assignment to ${replacement.name}.`;
  }

  if (intent === "coverage") {
    if (!topCoverageGap) return "I could not find forecast data to evaluate staffing pressure.";

    return `The biggest coverage gap is ${topCoverageGap.day} ${topCoverageGap.shift}. It needs ${topCoverageGap.requiredStaff}, currently has ${topCoverageGap.assigned}, and the gap is ${topCoverageGap.gap}.`;
  }

  if (intent === "requests") {
    if (!pendingRequests.length) return "There are no pending employee requests right now.";
    const latest = pendingRequests[0];
    return `There are ${pendingRequests.length} pending requests. The latest is a ${latest.type} request from ${latest.user?.name || "an employee"}.`;
  }

  if (intent === "fairness") {
    if (!busiest || !leastBusy) return "I could not calculate fairness because there are no assignments.";
    const gap = busiest.totalShifts - leastBusy.totalShifts;
    return `The current workload gap is ${gap} shifts between ${busiest.employeeName} and ${leastBusy.employeeName}.`;
  }

  if (intent === "explain") {
    if (namedEmployee) {
      const employeeLoad = workload.find(
        (item) => item.employeeName.toLowerCase() === namedEmployee.toLowerCase()
      );

      if (!employeeLoad) return `I could not find assignment data for ${namedEmployee}.`;

      return `${employeeLoad.employeeName} has ${employeeLoad.totalShifts} shifts across ${employeeLoad.assignedDays.size} days. Their assignments are ${employeeLoad.slots.slice(0, 5).join(", ")}${employeeLoad.slots.length > 5 ? ", ..." : ""}.`;
    }

    return "I explain schedules using assignments, availability, fairness, forecasts, and requests.";
  }

  if (intent === "summary") {
    return `There are ${context.employees.length} active employees, ${pendingRequests.length} pending requests, and ${context.forecasts.length} forecast records.${busiest ? ` ${busiest.employeeName} currently has the highest workload with ${busiest.totalShifts} shifts.` : ""}`;
  }

  return `I analyzed your scheduling data. There are ${context.employees.length} employees, ${pendingRequests.length} pending requests, and ${context.forecasts.length} forecast records.`;
}

async function generateWithGemini(fullPrompt) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  const maxRetries = 3;

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await gemini.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }]
            }
          ]
        });

        if (result?.text) return result.text;

        if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return result.candidates[0].content.parts[0].text;
        }

        return null;
      } catch (error) {
        const message =
          error?.message ||
          error?.error?.message ||
          JSON.stringify(error);

        const overloaded =
          message.includes("503") ||
          message.includes("UNAVAILABLE") ||
          message.includes("high demand");

        if (!overloaded) throw error;
        if (attempt === maxRetries) break;

        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return null;
}

export async function GET(request) {
  try {
    const { organization } = await requireAuthenticated(request);

    const items = await prisma.aiSuggestion.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" }
    });

    return ok(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuthenticated(request);
    const body = await parseJson(request);
    const prompt = body.prompt || "Give me a schedule summary";

    const actionResult = await handleAction(prompt, auth);

    if (actionResult) {
      const item = await prisma.aiSuggestion.create({
        data: {
          organizationId: auth.organization.id,
          prompt,
          response: actionResult
        }
      });

      return created(item);
    }

    const [schedules, employees, forecasts, requests, availabilityRows] = await Promise.all([
      prisma.schedule.findMany({
        where: { organizationId: auth.organization.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          assignments: {
            include: {
              employee: {
                include: { user: true }
              }
            }
          }
        }
      }),
      prisma.employee.findMany({
        where: {
          organizationId: auth.organization.id,
          status: "Active"
        },
        include: {
          user: true
        }
      }),
      prisma.forecast.findMany({
        where: { organizationId: auth.organization.id },
        orderBy: { createdAt: "desc" }
      }),
      prisma.request.findMany({
        where: { organizationId: auth.organization.id },
        orderBy: { submittedAt: "desc" },
        include: {
          user: true
        }
      }),
      prisma.availability.findMany({
        where: {
          employee: {
            organizationId: auth.organization.id
          }
        }
      })
    ]);

    const context = {
      employees,
      forecasts,
      requests,
      schedules,
      workloadMap: buildWorkloadMap(schedules),
      assignedMap: buildAssignedMap(schedules),
      availabilityMap: buildAvailabilityMap(availabilityRows)
    };

    const contextPayload = {
      organization: {
        id: auth.organization.id,
        name: auth.organization.name,
        slug: auth.organization.slug
      },
      currentUser: {
        id: auth.user.id,
        name: auth.user.name,
        role: auth.user.role
      },
      employees: employees.map((e) => ({
        id: e.id,
        name: e.user?.name,
        department: e.user?.department,
        position: e.user?.position,
        preferredShift: e.user?.preferredShift,
        weeklyHours: e.user?.weeklyHours
      })),
      workload: Array.from(context.workloadMap.values()).map((item) => ({
        employeeName: item.employeeName,
        totalShifts: item.totalShifts,
        slots: item.slots
      })),
      availability: employees.map((employee) => {
        const rows = availabilityRows.filter((row) => row.employeeId === employee.id);
        return {
          employeeName: employee.user?.name,
          preferredShift: employee.user?.preferredShift,
          availability: rows.map((row) => ({
            day: row.day,
            status: row.status,
            timeRange: row.timeRange
          }))
        };
      }),
      forecasts,
      requests: requests.map((item) => ({
        employeeName: item.user?.name,
        type: item.type,
        status: item.status,
        details: item.details
      }))
    };

    const fullPrompt = `
You are an AI workforce scheduling assistant.

Rules:
- Use only the provided organization data.
- Be practical, concise, and specific.
- Do not invent employees, shifts, requests, or forecasts.
- If asked for recommendations, suggest realistic staffing actions.
- If data is missing, say that clearly.
- Keep the answer under 140 words.

User prompt:
${prompt}

Organization scheduling data:
${JSON.stringify(contextPayload)}
    `;

    const llmText = await generateWithGemini(fullPrompt);
    const response = llmText || buildLocalFallbackResponse(prompt, context);

    const item = await prisma.aiSuggestion.create({
      data: {
        organizationId: auth.organization.id,
        prompt,
        response
      }
    });

    return created(item);
  } catch (error) {
    return handleApiError(error);
  }
}