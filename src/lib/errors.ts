/**
 * Centralized error handling for the application
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(message, 400, true, "VALIDATION_ERROR");
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentification requise") {
    super(message, 401, true, "AUTHENTICATION_ERROR");
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Accès refusé") {
    super(message, 403, true, "AUTHORIZATION_ERROR");
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Ressource") {
    super(`${resource} introuvable`, 404, true, "NOT_FOUND");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflit de ressource") {
    super(message, 409, true, "CONFLICT");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Trop de tentatives. Réessayez plus tard") {
    super(message, 429, true, "RATE_LIMIT");
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = "Service temporairement indisponible") {
    super(`${service}: ${message}`, 502, true, "EXTERNAL_SERVICE_ERROR");
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}
