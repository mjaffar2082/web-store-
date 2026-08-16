import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors";
import { config } from "../config";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: config.nodeEnv === "production" ? "Internal server error" : err.message,
  });
}
