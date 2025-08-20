import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

const authService = new AuthService();

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ message: 'Signup successful, OTP sent to email', user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    await authService.verifyEmail(req.body.email, req.body.otp);
    res.json({ message: 'Email verified successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body.email, req.body.password);
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await authService.sendForgotPasswordOtp(req.body.email);
    res.json({ message: 'OTP sent to email' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await authService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
    res.json({ message: 'Password reset successful' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    await authService.resendOtp(req.body.email, req.body.type);
    res.json({ message: 'OTP resent to email' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}; 