import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { auditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = getSessionUser(req);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  if (session) {
    auditEvent({
      action: "auth.logout",
      userId: session.userId,
      status: "success",
    });
  }

  return response;
}
