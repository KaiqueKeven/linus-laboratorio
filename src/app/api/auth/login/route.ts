import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createAuthToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nome de usuário e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const userRow = await db.findUserByUsername(cleanUsername);

    if (!userRow) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou senha incorreta.' },
        { status: 401 }
      );
    }

    const passwordMatch = bcrypt.compareSync(
      String(password),
      userRow.password_hash as string
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou senha incorreta.' },
        { status: 401 }
      );
    }

    if (Number(userRow.active) !== 1) {
      return NextResponse.json(
        { error: 'Acesso desativado pelo administrador.' },
        { status: 403 }
      );
    }

    const userData = {
      id: userRow.id as string,
      username: userRow.username as string,
      name: userRow.name as string,
      role: userRow.role as 'ADM' | 'FUNCIONARIO',
      department: userRow.department as string,
    };

    const token = await createAuthToken(userData);

    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Erro interno ao realizar login: ' + err.message },
      { status: 500 }
    );
  }
}
