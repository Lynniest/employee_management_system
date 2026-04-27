export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { created, fail, ok, parseJson, handleApiError } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function GET(request) {
  try {
    const { organization } = await requireManager(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";

    const employees = await prisma.employee.findMany({
      where: {
        organizationId: organization.id,
        ...(department ? { user: { department } } : {}),
        ...(search
          ? {
              OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { user: { position: { contains: search, mode: "insensitive" } } }
              ]
            }
          : {})
      },
      include: {
        user: true,
        skills: { include: { skill: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return ok(
      employees.map((employee) => ({
        id: employee.id,
        name: employee.user.name,
        email: employee.user.email,
        department: employee.user.department,
        position: employee.user.position,
        preferredShift: employee.user.preferredShift,
        weeklyHours: employee.user.weeklyHours,
        status: employee.status,
        skills: employee.skills.map((item) => item.skill.name)
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const { organization } = await requireManager(request);
    const body = await parseJson(request);
    const {
      name,
      email,
      password,
      department,
      position,
      skills = [],
      preferredShift = "Morning",
      weeklyHours = 40
    } = body;

    if (!name || !email || !password || !department || !position) {
      return fail("name, email, password, department, and position are required", 400);
    }

    const emailLower = String(email).toLowerCase();

    const exists = await prisma.user.findFirst({
      where: {
        organizationId: organization.id,
        email: emailLower
      }
    });

    if (exists) {
      return fail("Email is already registered in this organization", 409);
    }

    const createdEmployee = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          name,
          email: emailLower,
          passwordHash: hashPassword(password),
          role: "employee",
          department,
          position,
          preferredShift,
          weeklyHours
        }
      });

      const employee = await tx.employee.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          status: "Active"
        }
      });

      for (const skillName of skills) {
        const skill = await tx.skill.upsert({
          where: {
            organizationId_name: {
              organizationId: organization.id,
              name: skillName
            }
          },
          update: {},
          create: {
            organizationId: organization.id,
            name: skillName
          }
        });

        await tx.employeeSkill.create({
          data: {
            employeeId: employee.id,
            skillId: skill.id
          }
        });
      }

      return tx.employee.findUnique({
        where: { id: employee.id },
        include: { user: true, skills: { include: { skill: true } } }
      });
    });

    return created({
      id: createdEmployee.id,
      name: createdEmployee.user.name,
      email: createdEmployee.user.email,
      department: createdEmployee.user.department,
      position: createdEmployee.user.position,
      preferredShift: createdEmployee.user.preferredShift,
      weeklyHours: createdEmployee.user.weeklyHours,
      status: createdEmployee.status,
      skills: createdEmployee.skills.map((item) => item.skill.name)
    });
  } catch (error) {
    return handleApiError(error);
  }
}
