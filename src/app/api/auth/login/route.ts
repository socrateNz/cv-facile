import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { auditAuthFailure, auditEvent } from "@/lib/audit";

type AuthUser = {
  _id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  passwordHash: string;
};

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();

  // Validate input
  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Email et mot de passe requis." },
      { status: 400 }
    );
  }

  const { email, password } = validation.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await UserModel.findOne({ email: normalizedEmail }).lean<AuthUser | null>();
  if (!user) {
    auditAuthFailure("auth.login_failed", normalizedEmail, "user_not_found");
    return NextResponse.json(
      { message: "Identifiants invalides." },
      { status: 401 }
    );
  }

  const validPassword = await compare(password, user.passwordHash);
  if (!validPassword) {
    auditAuthFailure("auth.login_failed", normalizedEmail, "invalid_password");
    return NextResponse.json(
      { message: "Identifiants invalides." },
      { status: 401 }
    );
  }

  const token = signSessionToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    data: {
      id: String(user._id),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  auditEvent({
    action: "auth.login",
    userId: String(user._id),
    status: "success",
  });

  return response;
}
