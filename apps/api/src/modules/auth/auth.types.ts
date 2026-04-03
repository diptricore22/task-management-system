// Authentication types and interfaces - aligned with DATABASE_SPEC.md
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    created_at: string;
  };
}

export interface InviteRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface InviteAcceptRequest {
  token: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // user id
  tokenId: string; // refresh token record id
  iat: number;
  exp: number;
}

// Database user type (what we get from Prisma, excluding password_hash)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Refresh token database record
export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Invite token database record
export interface InviteToken {
  id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  token_hash: string;
  expires_at: Date;
  accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}