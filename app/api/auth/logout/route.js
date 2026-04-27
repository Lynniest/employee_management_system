export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { ok, handleApiError } from "@/lib/api";
import { destroySession, getTokenFromRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    await destroySession(getTokenFromRequest(request));
    return ok({ loggedOut: true });
  } catch (error) {
    return handleApiError(error);
  }
}
