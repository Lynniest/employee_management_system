export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, fail, parseJson, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await parseJson(request);
    const { organizationSlug, email, password, role } = body;

    if (!organizationSlug || !email || !password) {
      return fail("organizationSlug, email, and password are required", 400);
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: String(organizationSlug).toLowerCase() }
    });

    if (!organization) {
      return fail("Organization not found", 404);
    }

    const user = await prisma.user.findFirst({
      where: {
        organizationId: organization.id,
        email: String(email).toLowerCase(),
        ...(role ? { role } : {})
      }
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return fail("Invalid login credentials", 401);
    }

    const session = await createSession({
      userId: user.id,
      organizationId: organization.id
    });

    return ok({
      token: session.token,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        preferredShift: user.preferredShift,
        weeklyHours: user.weeklyHours
      },
      route: user.role === "manager" ? "/" : "/employee"
    });
  } catch (error) {
    return handleApiError(error);
  }
}
