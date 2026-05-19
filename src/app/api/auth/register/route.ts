import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { auditAuthFailure, auditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  
  // Validate input
  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Données invalides", errors: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password, fullName } = validation.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    auditAuthFailure("auth.register_failed", normalizedEmail, "duplicate");
    return NextResponse.json(
      { message: "Un compte existe déjà avec cet email." },
      { status: 409 }
    );
  }

  // Hash password and create user
  const passwordHash = await hash(password, 10);
  const user = await UserModel.create({
    email: normalizedEmail,
    fullName: fullName.trim(),
    passwordHash,
    role: "user",
    preferences: { language: "fr", theme: "light" },
  });

  // Create session token
  const token = signSessionToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json(
    {
      data: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    },
    { status: 201 }
  );

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  auditEvent({
    action: "auth.register",
    userId: String(user._id),
    status: "success",
  });

  return response;
}
