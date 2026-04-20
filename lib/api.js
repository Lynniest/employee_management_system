import { NextResponse } from "next/server";

export function ok(data, init = {}) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function created(data) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function fail(message, status = 400, extra = {}) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

export async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function handleApiError(error) {
  const status = error?.status || 500;
  const message = error?.message || "Internal server error";
  return fail(message, status);
}
