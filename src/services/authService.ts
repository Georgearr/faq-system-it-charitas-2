import { getAppAdapter } from '@/api';
import { AuthResponse, User } from '@/types';

export class AuthService {
  private get adapter() {
    return getAppAdapter();
  }

  async registerWithEmail(
    fullName: string,
    email: string,
    password: string,
    department: string
  ): Promise<{ challengeId: string; email: string }> {
    return this.adapter.registerWithEmail(fullName, email, password, department);
  }

  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    return this.adapter.loginWithEmail(email, password);
  }

  async registerWithPhone(
    fullName: string,
    phoneNumber: string,
    password: string,
    department: string
  ): Promise<{ challengeId: string; phone: string }> {
    return this.adapter.registerWithPhone(fullName, phoneNumber, password, department);
  }

  async loginWithPhone(phoneNumber: string, password?: string): Promise<{ challengeId?: string; auth?: AuthResponse }> {
    return this.adapter.loginWithPhone(phoneNumber, password);
  }

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    return this.adapter.loginWithGoogle(credential);
  }

  async verifyEmail(challengeId: string, code: string): Promise<AuthResponse> {
    return this.adapter.verifyEmail(challengeId, code);
  }

  async verifyPhone(challengeId: string, code: string): Promise<AuthResponse> {
    return this.adapter.verifyPhone(challengeId, code);
  }

  async resendVerification(challengeId: string): Promise<{ success: boolean; message: string }> {
    return this.adapter.resendVerification(challengeId);
  }

  async requestPasswordReset(emailOrPhone: string): Promise<{ challengeId: string; message: string }> {
    return this.adapter.requestPasswordReset(emailOrPhone);
  }

  async resetPassword(challengeId: string, code: string, newPassword: string): Promise<{ success: boolean }> {
    return this.adapter.resetPassword(challengeId, code, newPassword);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.adapter.getCurrentUser();
  }

  async logout(): Promise<void> {
    return this.adapter.logout();
  }
}

export const authService = new AuthService();
