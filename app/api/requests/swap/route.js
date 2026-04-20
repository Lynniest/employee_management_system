import { created, parseJson, handleApiError } from "@/lib/api";
import { requireAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { user, organization } = await requireAuthenticated(request);
    const body = await parseJson(request);

    const row = await prisma.request.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        type: "Swap",
        details: {
          shiftDate: body.shiftDate,
          fromShift: body.fromShift,
          requestedWith: body.requestedWith
        }
      }
    });

    return created(row);
  } catch (error) {
    return handleApiError(error);
  }
}
