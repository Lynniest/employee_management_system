export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import crypto from "crypto";
import { created, fail, parseJson, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request) {
  try {
    const body = await parseJson(request);
    const { organizationName, organizationSlug, name, email, password, department } = body;

    if (!organizationName || !name || !email || !password) {
      return fail("organizationName, name, email, and password are required", 400);
    }

    const slug = slugify(organizationSlug || organizationName);
    if (!slug) {
      return fail("Valid organization name or slug is required", 400);
    }

    const existingOrganization = await prisma.organization.findUnique({ where: { slug } });
    if (existingOrganization) {
      return fail("Organization slug is already taken", 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: organizationName, slug }
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          name,
          email: String(email).toLowerCase(),
          passwordHash: hashPassword(password),
          role: "manager",
          department: department || "General",
          managerProfile: { create: {} }
        }
      });

      const session = await tx.session.create({
        data: {
          token: crypto.randomBytes(32).toString("hex"),
          userId: user.id,
          organizationId: organization.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
        }
      });

      return { organization, user, session };
    });

    return created({
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug
      },
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      token: result.session.token,
      route: "/"
    });
  } catch (error) {
    return handleApiError(error);
  }
}
