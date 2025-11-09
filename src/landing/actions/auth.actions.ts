import { landingAuthApi } from '../api/landing.api';
import type { RegisterPayload, LoginPayload, AuthResponse } from '../types/auth.types';

export const registerAction = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await landingAuthApi.post<AuthResponse>('/register', payload);
  return data;
};

export const loginAction = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await landingAuthApi.post<AuthResponse>('/login', payload);
  return data;
};

