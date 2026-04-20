import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "store.json");

const defaultDb = {
  session: {
    activeUserId: "m1",
    activeRole: "manager"
  },
  users: [
    { id: "m1", name: "Olivia Parker", email: "manager@company.com", password: "password123", role: "manager", department: "Operations" },
    { id: "m2", name: "Daniel Brooks", email: "lead.manager@company.com", password: "password123", role: "manager", department: "Retail" },
    { id: "e1", name: "Emma Johnson", email: "emma@company.com", password: "password123", role: "employee", department: "Front Store", position: "Cashier", skills: ["POS", "Customer Service"], preferredShift: "Morning", weeklyHours: 32 },
    { id: "e2", name: "Liam Chen", email: "liam@company.com", password: "password123", role: "employee", department: "Operations", position: "Supervisor", skills: ["Leadership", "Inventory"], preferredShift: "Evening", weeklyHours: 38 },
    { id: "e3", name: "Sophia Kim", email: "sophia@company.com", password: "password123", role: "employee", department: "Sales", position: "Sales Associate", skills: ["Sales", "Stocking"], preferredShift: "Afternoon", weeklyHours: 28 },
    { id: "e4", name: "Noah Patel", email: "noah@company.com", password: "password123", role: "employee", department: "Front Store", position: "Cashier", skills: ["POS", "Returns"], preferredShift: "Morning", weeklyHours: 35 }
  ],
  employees: [
    { id: "e1", name: "Emma Johnson", email: "emma@company.com", department: "Front Store", position: "Cashier", skills: ["POS", "Customer Service"], preferredShift: "Morning", weeklyHours: 32, status: "Active" },
    { id: "e2", name: "Liam Chen", email: "liam@company.com", department: "Operations", position: "Supervisor", skills: ["Leadership", "Inventory"], preferredShift: "Evening", weeklyHours: 38, status: "Active" },
    { id: "e3", name: "Sophia Kim", email: "sophia@company.com", department: "Sales", position: "Sales Associate", skills: ["Sales", "Stocking"], preferredShift: "Afternoon", weeklyHours: 28, status: "Active" },
    { id: "e4", name: "Noah Patel", email: "noah@company.com", department: "Front Store", position: "Cashier", skills: ["POS", "Returns"], preferredShift: "Morning", weeklyHours: 35, status: "Active" }
  ],
  availability: [
    { id: "a1", employeeId: "e1", day: "Monday", status: "Available", timeRange: "08:00 - 16:00" },
    { id: "a2", employeeId: "e1", day: "Tuesday", status: "Available", timeRange: "08:00 - 16:00" },
    { id: "a3", employeeId: "e2", day: "Friday", status: "Available", timeRange: "14:00 - 22:00" },
    { id: "a4", employeeId: "e3", day: "Saturday", status: "Preferred", timeRange: "12:00 - 20:00" },
    { id: "a5", employeeId: "e4", day: "Sunday", status: "Unavailable", timeRange: "Off" }
  ],
  schedules: [
    {
      id: "s1",
      weekLabel: "Apr 15 - Apr 21",
      status: "Draft",
      fairnessScore: 8.7,
      coverageRate: 92,
      assignments: [
        { id: "sa1", day: "Monday", shift: "Morning", employeeId: "e1", employeeName: "Emma Johnson", role: "Cashier" },
        { id: "sa2", day: "Monday", shift: "Afternoon", employeeId: "e3", employeeName: "Sophia Kim", role: "Sales Associate" },
        { id: "sa3", day: "Monday", shift: "Evening", employeeId: "e2", employeeName: "Liam Chen", role: "Supervisor" },
        { id: "sa4", day: "Tuesday", shift: "Morning", employeeId: "e4", employeeName: "Noah Patel", role: "Cashier" },
        { id: "sa5", day: "Friday", shift: "Evening", employeeId: "e2", employeeName: "Liam Chen", role: "Supervisor" }
      ]
    }
  ],
  requests: [
    { id: "r1", employeeId: "e1", employeeName: "Emma Johnson", type: "Leave", status: "Pending", submittedAt: "2026-04-15T09:00:00.000Z", details: { startDate: "2026-04-20", endDate: "2026-04-21", reason: "Family event" } },
    { id: "r2", employeeId: "e4", employeeName: "Noah Patel", type: "Swap", status: "Pending", submittedAt: "2026-04-16T12:30:00.000Z", details: { shiftDate: "2026-04-19", fromShift: "Morning", requestedWith: "Emma Johnson" } }
  ],
  alerts: [
    { id: "al1", title: "Understaffed Shift", detail: "Friday evening needs 1 more Cashier", severity: "high" },
    { id: "al2", title: "Overtime Warning", detail: "Liam is projected to exceed 40 hours this week", severity: "medium" },
    { id: "al3", title: "AI Suggestion", detail: "Swap Noah to Friday evening to reduce overtime", severity: "info" }
  ],
  forecasts: [
    { id: "f1", day: "Monday", shift: "Morning", requiredStaff: 3, predictedDemand: 72 },
    { id: "f2", day: "Friday", shift: "Evening", requiredStaff: 5, predictedDemand: 96 },
    { id: "f3", day: "Saturday", shift: "Afternoon", requiredStaff: 4, predictedDemand: 88 }
  ],
  aiSuggestions: [
    { id: "ai1", prompt: "Reduce overtime this week", response: "Reassign one Friday evening shift from Liam to Noah and keep Emma on Monday morning coverage.", createdAt: "2026-04-17T02:00:00.000Z" }
  ]
};

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf-8");
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(raw);
}

export async function writeDb(data) {
  await ensureDb();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

export async function updateDb(updater) {
  const db = await readDb();
  const next = await updater(db);
  await writeDb(next);
  return next;
}

export function createId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function withoutPassword(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}
