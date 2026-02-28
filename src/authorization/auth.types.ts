export interface AuthenticatedUser {
  userId: number;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface JwtPayload {
  userId: number;
  email: string;
  roles: string[];
  permissions: string[];
}
