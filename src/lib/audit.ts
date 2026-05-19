import { log, maskEmail } from "@/lib/logger";

export type AuditStatus = "success" | "failure";

export type AuditAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.register"
  | "auth.register_failed"
  | "auth.logout"
  | "cv.create"
  | "cv.update"
  | "cv.delete"
  | "payment.initiate"
  | "payment.initiate_failed"
  | "payment.webhook"
  | "admin.action";

export function auditEvent(params: {
  action: AuditAction;
  userId?: string;
  resource?: string;
  status: AuditStatus;
  meta?: Record<string, unknown>;
}) {
  const { action, userId, resource, status, meta } = params;

  log("info", `audit:${action}`, {
    type: "audit",
    action,
    userId: userId || null,
    resource: resource || null,
    status,
    ...meta,
  });
}

export function auditAuthFailure(
  action: "auth.login_failed" | "auth.register_failed",
  email: string,
  reason?: string,
) {
  auditEvent({
    action,
    status: "failure",
    meta: { email: maskEmail(email), reason },
  });
}
