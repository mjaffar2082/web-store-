import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthRequest, JwtPayload } from "../types";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

function extractToken(req: AuthRequest): string | null {
  return req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "") || null;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    return next(new UnauthorizedError("Access token required"));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = decoded;
  } catch {
    // ignore invalid token; treat as anonymous
  }
  next();
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    next();
  };
}