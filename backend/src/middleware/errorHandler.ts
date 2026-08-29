import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

// Express recognizes an error-handling middleware by its 4-argument
// signature; the unused params must stay to keep that arity.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const code = isApiError ? err.code : "INTERNAL_ERROR";
  const message = isApiError ? err.message : "Something went wrong";

  if (!isApiError) {
    // Log full detail server-side; never leak it to the client.
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", err: String(err) }));
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(config.nodeEnv !== "production" && !isApiError ? { detail: String(err) } : {}),
    },
  });
}
