import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'linus-laboratorio-secret-security-token-key-2026'
);

const TOKEN_COOKIE_NAME = 'linus_auth_token';

export type SessionPayload = Pick<User, 'id' | 'username' | 'name' | 'role' | 'department'>;

export async function createAuthToken(user: SessionPayload): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyAuthToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      username: (payload.username as string) || (payload.email as string)?.split('@')[0] || 'usuario',
      name: payload.name as string,
      role: payload.role as User['role'],
      department: payload.department as string,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(TOKEN_COOKIE_NAME);
  if (!tokenCookie || !tokenCookie.value) {
    return null;
  }
  return verifyAuthToken(tokenCookie.value);
}

export { TOKEN_COOKIE_NAME };
