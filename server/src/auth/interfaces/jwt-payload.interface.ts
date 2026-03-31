export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}
