import type { User } from './user.response';

export interface AuthResponse {
  user: User;
  token: string;
}
