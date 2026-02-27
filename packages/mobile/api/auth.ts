import api from '@/lib/api';
import { storeAuth } from '@/lib/storage';
import { User } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  await storeAuth(response.data.token, response.data.user);
  return response.data;
}

export async function register(email: string, password: string, username: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/register', { email, password, username });
  return response.data;
}

export async function oauthLogin(
  provider: 'google' | 'apple',
  providerId: string,
  email?: string,
  username?: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/oauth', {
    provider,
    providerId,
    email,
    username,
  });
  await storeAuth(response.data.token, response.data.user);
  return response.data;
}

export async function logout(): Promise<void> {
  // Clear local storage
  const { clearAuth } = await import('@/lib/storage');
  await clearAuth();
}