import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";
import { setAuthCookies, clearAuthCookies } from "../utils/tokens";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json({ success: true, data: { user: result.user } });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: { user: result.user } });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || (req.body?.refreshToken as string | undefined);
      const result = await authService.refresh(refreshToken);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: { user: result.user } });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      clearAuthCookies(res);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(data);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(data);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();