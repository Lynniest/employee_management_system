import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api";

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return request.headers.get("x-session-token") || null;
}

export async function getSessionFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  return prisma.session.findUnique({
    where: { token },
    include: {
      user: true,
      organization: true
    }
  });
}

export async function requireAuthenticated(request) {
  const session = await getSessionFromRequest(request);
  if (!session || new Date(session.expiresAt) < new Date()) {
    const error = new Error("Authentication required");
    error.status = 401;
    throw error;
  }

  return {
    session,
    user: session.user,
    organization: session.organization
  };
}

export async function requireManager(request) {
  const auth = await requireAuthenticated(request);
  if (auth.user.role !== "manager") {
    const error = new Error("Manager access required");
    error.status = 403;
    throw error;
  }
  return auth;
}

export async function destroySession(token) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { token } });
}

export async function createSession({ userId, organizationId }) {
  const token = crypto.randomBytes(32).toString("hex");
  return prisma.session.create({
    data: {
      token,
      userId,
      organizationId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  });
}
