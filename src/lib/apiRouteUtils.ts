import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";

export function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

export function validationErrorResponse(
  error: ZodError,
  message = "Validation failed"
): NextResponse {
  return NextResponse.json(
    { error: message, details: error.issues },
    { status: 400 }
  );
}

export function requireAuth(request: NextRequest): NextResponse | null {
  const headerToken = getTokenFromHeader(request.headers.get("authorization"));
  const cookieToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const token = headerToken || cookieToken;
  if (!token || !verifyToken(token)) {
    return errorResponse("Unauthorized", 401);
  }
  return null;
}

export async function parseNumericId(
  params: Promise<{ id: string }>,
  invalidMessage: string
): Promise<number | NextResponse> {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return errorResponse(invalidMessage, 400);
  }

  return numericId;
}
