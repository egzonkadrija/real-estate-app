import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
