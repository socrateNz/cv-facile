import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type SessionUser = {
  userId: string;
  email: string;
  role: "user" | "admin";
};

type SessionTokenPayload = {
  userId: string;
  email: string;
  role: "user" | "admin";
};

const SESSION_COOKIE = "cvfacile_token";
const JWT_SECRET = process.env.JWT_SECRET || "cvfacile-dev-secret";

export function signSessionToken(payload: SessionTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function getSessionUser(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionTokenPayload;
    return { userId: decoded.userId, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export function isAdmin(user: SessionUser | null) {
  return user?.role === "admin";
}

export function assertRole(role: "user" | "admin", expected: "admin") {
  return !(expected === "admin" && role !== "admin");
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
