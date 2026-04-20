import { ok, fail, parseJson, handleApiError } from "@/lib/api";
import { requireManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function GET(request, { params }) {
  try {
    const { organization } = await requireManager(request);
    const employee = await prisma.employee.findFirst({
      where: { id: params.id, organizationId: organization.id },
      include: { user: true, skills: { include: { skill: true } } }
    });

    if (!employee) return fail("Employee not found", 404);

    return ok({
      id: employee.id,
      name: employee.user.name,
      email: employee.user.email,
      department: employee.user.department,
      position: employee.user.position,
      preferredShift: employee.user.preferredShift,
      weeklyHours: employee.user.weeklyHours,
      status: employee.status,
      skills: employee.skills.map((item) => item.skill.name)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { organization } = await requireManager(request);
    const body = await parseJson(request);

    const employee = await prisma.employee.findFirst({
      where: { id: params.id, organizationId: organization.id },
      include: { user: true }
    });

    if (!employee) return fail("Employee not found", 404);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: employee.userId },
        data: {
          name: body.name ?? employee.user.name,
          email: body.email ? String(body.email).toLowerCase() : employee.user.email,
          department: body.department ?? employee.user.department,
          position: body.position ?? employee.user.position,
          preferredShift: body.preferredShift ?? employee.user.preferredShift,
          weeklyHours: body.weeklyHours ?? employee.user.weeklyHours,
          ...(body.password ? { passwordHash: hashPassword(body.password) } : {})
        }
      });

      await tx.employee.update({
        where: { id: employee.id },
        data: {
          status: body.status ?? employee.status
        }
      });

      if (Array.isArray(body.skills)) {
        await tx.employeeSkill.deleteMany({ where: { employeeId: employee.id } });
        for (const skillName of body.skills) {
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
      }

      return tx.employee.findUnique({
        where: { id: employee.id },
        include: { user: true, skills: { include: { skill: true } } }
      });
    });

    return ok({
      id: updated.id,
      name: updated.user.name,
      email: updated.user.email,
      department: updated.user.department,
      position: updated.user.position,
      preferredShift: updated.user.preferredShift,
      weeklyHours: updated.user.weeklyHours,
      status: updated.status,
      skills: updated.skills.map((item) => item.skill.name)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { organization } = await requireManager(request);
    const employee = await prisma.employee.findFirst({
      where: { id: params.id, organizationId: organization.id }
    });

    if (!employee) return fail("Employee not found", 404);

    await prisma.employee.delete({ where: { id: employee.id } });
    return ok({ deleted: true, id: employee.id });
  } catch (error) {
    return handleApiError(error);
  }
}
