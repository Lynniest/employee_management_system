import { ok, handleApiError } from "@/lib/api";
import { requireAuthenticated } from "@/lib/auth";

export async function GET(request) {
  try {
    const { user, organization } = await requireAuthenticated(request);
    return ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      preferredShift: user.preferredShift,
      weeklyHours: user.weeklyHours,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
