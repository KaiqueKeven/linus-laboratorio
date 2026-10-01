import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const metrics = await db.getMetrics(session.role, session.id);
    return NextResponse.json({ metrics });
  } catch (err: any) {
    console.error('Error fetching metrics:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
