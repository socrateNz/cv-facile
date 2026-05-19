export type LogLevel = "debug" | "info" | "warn" | "error";

/** Masque email → j***@d***.com */
export function maskEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const domainParts = domain.split(".");
  const tld = domainParts.pop() || "com";
  const domainName = domainParts.join(".") || domain;
  return `${local[0] || "*"}***@${domainName[0] || "*"}***.${tld}`;
}

/** Masque téléphone → +237***789 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  const suffix = digits.slice(-3);
  if (digits.startsWith("237")) return `+237***${suffix}`;
  return `***${suffix}`;
}

/** Masque une référence de paiement */
export function maskReference(ref: string): string {
  if (ref.length <= 8) return "***";
  return `${ref.slice(0, 4)}***${ref.slice(-4)}`;
}

function sanitizeContext(
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!context) return undefined;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (value === undefined || value === null) continue;
    const lower = key.toLowerCase();
    if (typeof value === "string") {
      if (lower.includes("email")) out[key] = maskEmail(value);
      else if (lower.includes("phone") || lower.includes("mobile")) out[key] = maskPhone(value);
      else if (lower.includes("reference") || lower.includes("token")) out[key] = "***";
      else out[key] = value;
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...sanitizeContext(context),
  };

  const line = JSON.stringify(entry);
  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") console.debug(line);
      break;
    default:
      console.log(line);
  }
}
