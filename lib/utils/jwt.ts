// lib/utils/jwt.ts
import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from '../core/types';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  isVerified: boolean;
  [key: string]: any;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const getSecret = () => new TextEncoder().encode(JWT_SECRET);

export const signToken = async (payload: JWTPayload): Promise<string> => {
  const secret = getSecret();
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Changed from 15m to 7 days
    .sign(secret);
  
  return token;
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as string,
      role: payload.role as UserRole,
      isVerified: payload.isVerified as boolean,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};