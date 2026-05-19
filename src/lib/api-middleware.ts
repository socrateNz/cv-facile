import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { log } from "@/lib/logger";

export type NextRequestWithAuth = NextRequest & {
  user?: { userId: string; email: string; role: "user" | "admin" };
};

/**
 * Middleware to check authentication
 * Throws 401 if not authenticated
 */
export function requireAuth(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    throw new AuthenticationError();
  }
  return session;
}

/**
 * Middleware to check admin role
 * Throws 403 if not admin
 */
export function requireAdmin(req: NextRequest) {
  const session = requireAuth(req);
  if (session.role !== "admin") {
    throw new AuthorizationError("Accès réservé aux administrateurs");
  }
  return session;
}

/**
 * Centralized error handler for API routes
 * Usage:
 *   try {
 *     // route logic
 *   } catch (error) {
 *     return handleError(error);
 *   }
 */
export function handleError(error: unknown): NextResponse {
  // AppError (custom application errors)
  if (error instanceof Error && "statusCode" in error && "isOperational" in error) {
    const appError = error as any;
    const statusCode = appError.statusCode || 500;

    // Log operational errors
    if (appError.isOperational) {
      log("warn", appError.message, { code: appError.code });
    } else {
      log("error", appError.message, { code: appError.code });
    }

    return NextResponse.json(
      {
        message: appError.message,
        ...(appError.errors && { errors: appError.errors }),
        ...(process.env.NODE_ENV === "development" && { code: appError.code }),
      },
      { status: statusCode }
    );
  }

  // Zod validation errors
  if (error instanceof Error && error.name === "ZodError") {
    const zodError = error as any;
    log("warn", "Validation error", { errors: zodError.errors });
    return NextResponse.json(
      {
        message: "Données invalides",
        errors: zodError.errors.map((e: any) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Standard errors
  if (error instanceof Error) {
    log("error", error.message, { stack: error.stack });
    return NextResponse.json(
      {
        message: process.env.NODE_ENV === "production" 
          ? "Erreur serveur" 
          : error.message,
      },
      { status: 500 }
    );
  }

  // Unknown errors
  log("error", "Unknown API error", { error: String(error) });
  return NextResponse.json(
    { message: "Erreur serveur inconnue" },
    { status: 500 }
  );
}

/**
 * Wrapper for API route handlers with error handling
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     return withErrorHandling(async () => {
 *       // route logic
 *     });
 *   }
 */
export async function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return handleError(error);
  }
}
